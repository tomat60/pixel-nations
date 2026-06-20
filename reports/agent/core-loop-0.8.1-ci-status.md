# Pixel Nations Agent Report — Core Loop v0.8.1

Generated: 2026-06-20T19:46:40Z
Branch: batch/core-loop-0.8.1
PR: #1
Run ID: 27881664171

## Latest commits
60ecaa3 Stabilize CI artifact upload for PR validation
d0866d4 Trigger CI rerun for core loop batch
5b463a7 Add core game loop objective spine
83b1976 Update QA handoff after hybrid agent rails
5bab18c Add hybrid cloud agent execution rails
51da10b Update clean QA handoff after cloud bootstrap
4e1ca14 Refresh QA evidence after cloud bootstrap
b5aef3b Update QA handoff after cloud bootstrap

## Workflow upload-artifact block
          npm run qa:screens
          npm run qa:smoke

      - name: Upload QA evidence artifact
        if: ${{ always() && github.event_name == 'workflow_dispatch' }}
        timeout-minutes: 3
        uses: actions/upload-artifact@v4
        with:
          name: pixel-nations-qa-evidence
          path: |
            public/qa/latest/**
            reports/latest-handoff.md
          if-no-files-found: ignore
          retention-days: 7

## GitHub CI run details
{"conclusion":"","createdAt":"2026-06-20T19:34:23Z","event":"pull_request","headSha":"60ecaa3dfd3fb8737b59620b7550a93cef303a8d","jobs":[{"completedAt":"0001-01-01T00:00:00Z","conclusion":"","databaseId":82510194571,"name":"Build and smoke validate","startedAt":"2026-06-20T19:34:26Z","status":"in_progress","steps":[{"completedAt":"2026-06-20T19:34:28Z","conclusion":"success","name":"Set up job","number":1,"startedAt":"2026-06-20T19:34:27Z","status":"completed"},{"completedAt":"2026-06-20T19:34:32Z","conclusion":"success","name":"Checkout","number":2,"startedAt":"2026-06-20T19:34:28Z","status":"completed"},{"completedAt":"2026-06-20T19:34:35Z","conclusion":"success","name":"Setup Node","number":3,"startedAt":"2026-06-20T19:34:32Z","status":"completed"},{"completedAt":"2026-06-20T19:34:44Z","conclusion":"success","name":"Install dependencies","number":4,"startedAt":"2026-06-20T19:34:35Z","status":"completed"},{"completedAt":"2026-06-20T19:34:45Z","conclusion":"success","name":"Cloud readiness gate","number":5,"startedAt":"2026-06-20T19:34:44Z","status":"completed"},{"completedAt":"2026-06-20T19:34:55Z","conclusion":"success","name":"Build","number":6,"startedAt":"2026-06-20T19:34:45Z","status":"completed"},{"completedAt":"0001-01-01T00:00:00Z","conclusion":"","name":"Mechanical smoke","number":7,"startedAt":"2026-06-20T19:34:55Z","status":"in_progress"},{"completedAt":"0001-01-01T00:00:00Z","conclusion":"","name":"Optional screenshot QA","number":8,"startedAt":"0001-01-01T00:00:00Z","status":"pending"},{"completedAt":"0001-01-01T00:00:00Z","conclusion":"","name":"Upload QA evidence artifact","number":9,"startedAt":"0001-01-01T00:00:00Z","status":"pending"},{"completedAt":"0001-01-01T00:00:00Z","conclusion":"","name":"Post Setup Node","number":17,"startedAt":"0001-01-01T00:00:00Z","status":"pending"},{"completedAt":"0001-01-01T00:00:00Z","conclusion":"","name":"Post Checkout","number":18,"startedAt":"0001-01-01T00:00:00Z","status":"pending"}],"url":"https://github.com/tomat60/pixel-nations/actions/runs/27881664171/job/82510194571"}],"status":"in_progress","updatedAt":"2026-06-20T19:34:27Z","workflowName":"Pixel Nations CI"}

## Recent runs
in_progress		Core Game Loop v0.8.1 — Objective Spine	Pixel Nations CI	batch/core-loop-0.8.1	pull_request	27881664171	12m18s	2026-06-20T19:34:23Z
completed	cancelled	Core Game Loop v0.8.1 — Objective Spine	Pixel Nations CI	batch/core-loop-0.8.1	pull_request	27880655679	25m40s	2026-06-20T18:53:25Z
completed	cancelled	Core Game Loop v0.8.1 — Objective Spine	Pixel Nations CI	batch/core-loop-0.8.1	pull_request	27880134142	21m42s	2026-06-20T18:32:03Z

## Local branch status
?? reports/agent/
