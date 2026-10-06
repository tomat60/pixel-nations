#!/usr/bin/env node

const MARKER = "<!-- pn-pr-stall-watchdog -->";
const STATE_PREFIX = "<!-- pn-pr-stall-watchdog-state:";
const READY_MIN = Number(process.env.PN_STALL_READY_MINUTES || 45);
const FAILED_MIN = Number(process.env.PN_STALL_FAILED_MINUTES || 60);
const PENDING_MIN = Number(process.env.PN_STALL_PENDING_MINUTES || 120);
const CONFLICT_MIN = Number(process.env.PN_STALL_CONFLICT_MINUTES || 30);
const COMMENT_ENABLED = process.env.PN_STALL_COMMENT !== "0";

const FAILURE = new Set([
  "failure",
  "cancelled",
  "timed_out",
  "action_required",
  "startup_failure",
  "stale",
]);

const HOLD_LABELS = new Set([
  "waiting-owner",
  "steward:waiting-owner",
  "product-gate:owner",
  "steward:hold",
]);

function minutesSince(iso, now = Date.now()) {
  if (!iso) return Infinity;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return Infinity;
  return Math.max(0, (now - ms) / 60000);
}

function latestByName(checkRuns = []) {
  const map = new Map();
  for (const run of checkRuns) {
    const key = String(run.app?.slug || "app") + ":" + String(run.name || "check");
    const ts = Date.parse(run.completed_at || run.started_at || run.created_at || 0);
    const prior = map.get(key);
    const priorTs = prior ? Date.parse(prior.completed_at || prior.started_at || prior.created_at || 0) : -1;
    if (!prior || ts >= priorTs) map.set(key, run);
  }
  return [...map.values()].filter((run) => !/PR stall (?:guard|watchdog)/i.test(run.name || ""));
}

function classify({ pr, headCommit, checkRuns, combinedStatus }, now = Date.now()) {
  if (pr.draft) return { state: "DRAFT", stale: false, reason: "draft PR" };

  const labels = new Set((pr.labels || []).map((label) => String(label.name || "").toLowerCase()));
  if ([...HOLD_LABELS].some((label) => labels.has(label))) {
    return { state: "WAITING_OWNER", stale: false, reason: "explicit owner/hold label" };
  }

  const checks = latestByName(checkRuns);
  const pendingChecks = checks.filter((run) => run.status !== "completed");
  const failedChecks = checks.filter((run) => run.status === "completed" && FAILURE.has(run.conclusion));
  const statuses = combinedStatus?.statuses || [];
  const pendingStatuses = statuses.filter((s) => s.state === "pending");
  const failedStatuses = statuses.filter((s) => ["failure", "error"].includes(s.state));

  const headDate =
    headCommit?.commit?.committer?.date ||
    headCommit?.commit?.author?.date ||
    pr.updated_at ||
    pr.created_at;

  if (pr.mergeable === false || pr.mergeable_state === "dirty") {
    const age = minutesSince(headDate, now);
    return {
      state: age >= CONFLICT_MIN ? "CONFLICT_STALLED" : "CONFLICT_RECENT",
      stale: age >= CONFLICT_MIN,
      ageMinutes: age,
      reason: "merge conflict / mergeable_state=" + String(pr.mergeable_state || "unknown"),
    };
  }

  if (failedChecks.length || failedStatuses.length) {
    const dates = [
      ...failedChecks.map((r) => r.completed_at || r.started_at || r.created_at),
      ...failedStatuses.map((s) => s.updated_at || s.created_at),
    ].filter(Boolean).sort();
    const age = minutesSince(dates.at(-1) || headDate, now);
    return {
      state: age >= FAILED_MIN ? "CHECK_FAILED_STALLED" : "CHECK_FAILED_RECENT",
      stale: age >= FAILED_MIN,
      ageMinutes: age,
      reason: String(failedChecks.length + failedStatuses.length) + " failing check/status signal(s)",
      details: failedChecks.map((r) => String(r.name) + ":" + String(r.conclusion))
        .concat(failedStatuses.map((s) => String(s.context) + ":" + String(s.state))),
    };
  }

  if (pendingChecks.length || pendingStatuses.length) {
    const dates = [
      ...pendingChecks.map((r) => r.started_at || r.created_at),
      ...pendingStatuses.map((s) => s.created_at || s.updated_at),
    ].filter(Boolean).sort();
    const age = minutesSince(dates.at(0) || headDate, now);
    return {
      state: age >= PENDING_MIN ? "CHECK_PENDING_STALLED" : "PENDING",
      stale: age >= PENDING_MIN,
      ageMinutes: age,
      reason: String(pendingChecks.length + pendingStatuses.length) + " pending check/status signal(s)",
      details: pendingChecks.map((r) => String(r.name)).concat(pendingStatuses.map((s) => String(s.context))),
    };
  }

  const hasSignals = checks.length > 0 || statuses.length > 0;
  if (!hasSignals) {
    const age = minutesSince(headDate, now);
    return {
      state: age >= PENDING_MIN ? "NO_CHECK_SIGNAL_STALLED" : "NO_CHECK_SIGNAL",
      stale: age >= PENDING_MIN,
      ageMinutes: age,
      reason: "no check/status evidence on current head",
    };
  }

  const greenDates = [
    headDate,
    ...checks.map((r) => r.completed_at || r.started_at || r.created_at),
    ...statuses.map((s) => s.updated_at || s.created_at),
  ].filter(Boolean).sort();
  const age = minutesSince(greenDates.at(-1) || headDate, now);

  if (pr.mergeable === null || pr.mergeable_state === "unknown") {
    return {
      state: age >= READY_MIN ? "MERGEABILITY_STALLED" : "MERGEABILITY_PENDING",
      stale: age >= READY_MIN,
      ageMinutes: age,
      reason: "checks are terminal but GitHub mergeability is unresolved",
    };
  }

  const readyStates = new Set(["clean", "has_hooks", "unstable", "blocked", "behind"]);
  if (pr.mergeable === true && readyStates.has(pr.mergeable_state)) {
    return {
      state: age >= READY_MIN ? "READY_STALLED" : "READY_RECENT",
      stale: age >= READY_MIN,
      ageMinutes: age,
      reason: "all observed checks terminal/non-failing; mergeable_state=" + String(pr.mergeable_state),
    };
  }

  return {
    state: "UNKNOWN",
    stale: false,
    ageMinutes: age,
    reason: "unclassified mergeable=" + String(pr.mergeable) + " mergeable_state=" + String(pr.mergeable_state),
  };
}

function renderComment(pr, result) {
  const age = Number.isFinite(result.ageMinutes) ? String(Math.round(result.ageMinutes)) + " min" : "n/a";
  const details = result.details?.length ? "\n- Signals: " + result.details.join(", ") : "";
  return [
    MARKER,
    STATE_PREFIX + result.state + " -->",
    "",
    "**Pixel Nations PR Stall Guard: `" + result.state + "`**",
    "",
    "- Head: `" + pr.head.sha + "`",
    "- Base: `" + pr.base.sha + "`",
    "- Age in current mechanical state: **" + age + "**",
    "- Reason: " + result.reason + details,
    "",
    "This PR is now a project-flow blocker until the steward resolves or explicitly classifies it. The user is not the fallback monitor.",
  ].join("\n");
}

async function githubRequest(path, { method = "GET", body } = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required");
  const response = await fetch("https://api.github.com" + path, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "pixel-nations-pr-stall-watchdog",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    const error = new Error(method + " " + path + " -> " + String(response.status) + ": " + text.slice(0, 500));
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

async function upsertComment(owner, repo, pr, result) {
  if (!COMMENT_ENABLED) return;
  const comments = await githubRequest("/repos/" + owner + "/" + repo + "/issues/" + String(pr.number) + "/comments?per_page=100");
  const existing = comments.find((comment) => String(comment.body || "").includes(MARKER));
  const previousState = existing?.body?.match(/pn-pr-stall-watchdog-state:([^ ]+)/)?.[1];

  if (!result.stale) {
    if (existing && previousState && previousState !== "RESOLVED") {
      const body = [
        MARKER,
        STATE_PREFIX + "RESOLVED -->",
        "",
        "**Pixel Nations PR Stall Guard: `RESOLVED`**",
        "",
        "The previous mechanical stall no longer applies on head `" + pr.head.sha + "`. Steward review/ownership rules still apply.",
      ].join("\n");
      try {
        await githubRequest("/repos/" + owner + "/" + repo + "/issues/comments/" + String(existing.id), {
          method: "PATCH",
          body: { body },
        });
      } catch (error) {
        if (error.status === 403) {
          console.warn("PR #" + String(pr.number) + ": comment update skipped (read-only token).");
          return;
        }
        throw error;
      }
    }
    return;
  }

  if (existing && previousState === result.state && existing.body?.includes(pr.head.sha)) return;

  const body = renderComment(pr, result);
  try {
    if (existing) {
      await githubRequest("/repos/" + owner + "/" + repo + "/issues/comments/" + String(existing.id), {
        method: "PATCH",
        body: { body },
      });
    } else {
      await githubRequest("/repos/" + owner + "/" + repo + "/issues/" + String(pr.number) + "/comments", {
        method: "POST",
        body: { body },
      });
    }
  } catch (error) {
    if (error.status === 403) {
      console.warn("PR #" + String(pr.number) + ": stale state detected but comment write is unavailable on this token.");
      return;
    }
    throw error;
  }
}

async function inspectPr(owner, repo, basicPr) {
  const pr = await githubRequest("/repos/" + owner + "/" + repo + "/pulls/" + String(basicPr.number));
  const [headCommit, checks, status] = await Promise.all([
    githubRequest("/repos/" + owner + "/" + repo + "/commits/" + pr.head.sha),
    githubRequest("/repos/" + owner + "/" + repo + "/commits/" + pr.head.sha + "/check-runs?per_page=100"),
    githubRequest("/repos/" + owner + "/" + repo + "/commits/" + pr.head.sha + "/status"),
  ]);
  return {
    pr,
    result: classify({
      pr,
      headCommit,
      checkRuns: checks.check_runs || [],
      combinedStatus: status,
    }),
  };
}

function selfTest() {
  const now = Date.parse("2026-10-06T12:00:00Z");
  const basePr = {
    draft: false,
    mergeable: true,
    mergeable_state: "clean",
    updated_at: "2026-10-06T08:00:00Z",
    created_at: "2026-10-06T08:00:00Z",
    labels: [],
  };
  const commit = { commit: { committer: { date: "2026-10-06T08:00:00Z" } } };
  const cases = [
    {
      name: "green ready stalls after 45m",
      expected: "READY_STALLED",
      checks: [{ name: "CI", status: "completed", conclusion: "success", completed_at: "2026-10-06T09:00:00Z" }],
      status: { statuses: [{ context: "Vercel", state: "success", updated_at: "2026-10-06T09:05:00Z" }] },
    },
    {
      name: "recent green does not stall",
      expected: "READY_RECENT",
      checks: [{ name: "CI", status: "completed", conclusion: "success", completed_at: "2026-10-06T11:15:00Z" }],
      status: { statuses: [] },
    },
    {
      name: "old failure stalls",
      expected: "CHECK_FAILED_STALLED",
      checks: [{ name: "CI", status: "completed", conclusion: "failure", completed_at: "2026-10-06T10:00:00Z" }],
      status: { statuses: [] },
    },
    {
      name: "long pending stalls",
      expected: "CHECK_PENDING_STALLED",
      checks: [{ name: "CI", status: "in_progress", conclusion: null, started_at: "2026-10-06T09:00:00Z" }],
      status: { statuses: [] },
    },
    {
      name: "owner hold is exempt",
      expected: "WAITING_OWNER",
      pr: { ...basePr, labels: [{ name: "steward:waiting-owner" }] },
      checks: [],
      status: { statuses: [] },
    },
  ];

  for (const test of cases) {
    const got = classify({
      pr: test.pr || basePr,
      headCommit: commit,
      checkRuns: test.checks,
      combinedStatus: test.status,
    }, now);
    if (got.state !== test.expected) {
      throw new Error(test.name + ": expected " + test.expected + ", got " + got.state);
    }
    console.log("PASS " + test.name + ": " + got.state);
  }
}

async function main() {
  if (process.argv.includes("--self-test")) {
    selfTest();
    return;
  }

  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository?.includes("/")) throw new Error("GITHUB_REPOSITORY=owner/repo is required");
  const [owner, repo] = repository.split("/");

  const openPrs = await githubRequest("/repos/" + owner + "/" + repo + "/pulls?state=open&per_page=100");
  const inspected = [];
  for (const basic of openPrs) {
    const item = await inspectPr(owner, repo, basic);
    inspected.push(item);
    await upsertComment(owner, repo, item.pr, item.result);
  }

  console.log("Pixel Nations PR Stall Guard — " + new Date().toISOString());
  if (!inspected.length) {
    console.log("No open PRs.");
    return;
  }

  for (const { pr, result } of inspected) {
    const age = Number.isFinite(result.ageMinutes) ? String(Math.round(result.ageMinutes)) + "m" : "n/a";
    console.log("#" + String(pr.number) + " " + result.state + " age=" + age + " head=" + pr.head.sha.slice(0, 12) + " — " + pr.title);
  }

  const stale = inspected.filter(({ result }) => result.stale);
  if (stale.length) {
    console.error(
      "STALL_GUARD_FAIL: " +
      String(stale.length) +
      " stale PR blocker(s): " +
      stale.map(({ pr, result }) => "#" + String(pr.number) + ":" + result.state).join(", "),
    );
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
