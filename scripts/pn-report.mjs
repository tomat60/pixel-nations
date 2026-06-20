#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const noOpen = args.has('--no-open');
const openFolder = args.has('--open-folder');

function pad(value) {
  return String(value).padStart(2, '0');
}
function makeStamp(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('') + '-' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join('');
}

const packageId = `pn-result-${makeStamp(new Date())}`;
const outbox = path.join(root, 'reports', 'outbox');
const dest = path.join(outbox, packageId);
const zipPath = path.join(outbox, `${packageId}.zip`);

function run(cmd, cmdArgs, options = {}) {
  try {
    return execFileSync(cmd, cmdArgs, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options
    });
  } catch (error) {
    const stdout = error.stdout?.toString?.() || '';
    const stderr = error.stderr?.toString?.() || '';
    return [stdout, stderr, `COMMAND_FAILED: ${cmd} ${cmdArgs.join(' ')}`]
      .filter(Boolean)
      .join('\n');
  }
}
function runStatus(cmd, cmdArgs, options = {}) {
  const result = spawnSync(cmd, cmdArgs, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  });
  return {
    ok: result.status === 0,
    output: [result.stdout, result.stderr].filter(Boolean).join('')
  };
}
function copyIfExists(file) {
  const src = path.join(root, file);
  if (!existsSync(src) || !statSync(src).isFile()) return false;
  const target = path.join(dest, file);
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(src, target);
  return true;
}
function listFiles(dir, predicate, maxDepth = Infinity, depth = 0, acc = []) {
  if (!existsSync(dir) || depth > maxDepth) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.next'].includes(entry.name)) continue;
    if (entry.name === 'outbox' && path.relative(root, dir) === 'reports') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, predicate, maxDepth, depth + 1, acc);
    else if (predicate(full)) acc.push(path.relative(root, full));
  }
  return acc.sort();
}

mkdirSync(outbox, { recursive: true });
rmSync(dest, { recursive: true, force: true });
rmSync(zipPath, { force: true });
mkdirSync(path.join(dest, 'meta'), { recursive: true });

const gitStatus = run('git', ['status', '--short', '--branch']);
const gitLog = run('git', ['log', '--oneline', '-8']);
const pnStatus = runStatus('node', ['scripts/pn-status.mjs']);
const publicQa = runStatus('node', ['scripts/pn-public-qa-check.mjs']);

writeFileSync(path.join(dest, 'meta', 'git-status.txt'), gitStatus);
writeFileSync(path.join(dest, 'meta', 'git-log.txt'), gitLog);
writeFileSync(path.join(dest, 'meta', 'pn-status-output.txt'), pnStatus.output);
writeFileSync(path.join(dest, 'meta', 'public-qa-check-output.txt'), publicQa.output);
writeFileSync(path.join(dest, 'meta', 'docs-inventory.txt'), listFiles(path.join(root, 'docs'), () => true, 3).join('\n') + '\n');
writeFileSync(path.join(dest, 'meta', 'project-md-mjs-json-inventory.txt'), listFiles(root, file => /\.(md|mjs|json)$/.test(file), 4).join('\n') + '\n');
copyIfExists('package.json');

const filesToCopy = [
  'README.md',
  'AGENTS.md',
  'CLAUDE.md',
  'docs/README.md',
  'docs/PROJECT_CURRENT_STATE.md',
  'docs/PROJECT_OPERATING_SYSTEM.md',
  'docs/PROJECT_OPERATING_RULES.md',
  'docs/ASSISTANT_COMMAND_PROTOCOL.md',
  'docs/AI_COST_CONTROL_CODEX.md',
  'docs/BUDGET_AND_TOOL_GOVERNANCE.md',
  'docs/PRODUCT_SIMPLICITY_DOCTRINE.md',
  'docs/PRODUCT_SCOPE_CUT.md',
  'docs/ONE_PAGE_PRODUCT_BRIEF.md',
  'docs/QA_HANDOFF.md',
  'docs/QA_REPORT.md',
  'reports/latest-handoff.md',
  'public/qa/latest/handoff.txt',
  'public/qa/latest/handoff.json',
  'public/qa/latest/index.html'
];
const copied = filesToCopy.filter(copyIfExists);
const dirty = /^(?!##)\s*[MADRCU?]/m.test(gitStatus);

const summary = {
  package_id: packageId,
  generated_at: new Date().toISOString(),
  repo: 'pixel-nations',
  git_status_clean: !dirty,
  pn_status_command_ok: pnStatus.ok,
  public_check_command_ok: publicQa.ok,
  upload_zip: path.basename(zipPath),
  upload_path: path.relative(root, zipPath),
  copied_files: copied,
  notes: [
    'Upload this ZIP file to ChatGPT instead of pasting large terminal output.',
    'On macOS, npm run pn:report reveals/selects the ZIP file in Finder by default.',
    'Use npm run pn:report -- --open-folder only if you intentionally want the folder instead of the selected ZIP.'
  ]
};
writeFileSync(path.join(dest, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');

const readme = [
  `# Pixel Nations Result Package — ${packageId}`,
  '',
  'Upload the selected ZIP file to ChatGPT:',
  '',
  `\`${path.basename(zipPath)}\``,
  '',
  '## What this package contains',
  '',
  '- pn:status output',
  '- public QA check output',
  '- git status and recent commits',
  '- docs inventory',
  '- project md/mjs/json inventory',
  '- active source-of-truth docs, when present',
  '- latest QA handoff/report files, when present',
  '',
  '## Workflow rule',
  '',
  'Use this command after audits, terminal patches, Cursor work, QA checks, or sprint results:',
  '',
  '```bash',
  'npm run pn:report',
  '```',
  '',
  'The command creates a timestamped folder, creates a ZIP, and reveals/selects the ZIP in Finder by default.',
  '',
  '## Current quick verdict',
  '',
  `- pn:status command ok: ${pnStatus.ok ? 'YES' : 'NO'}`,
  `- public QA command ok: ${publicQa.ok ? 'YES' : 'NO'}`,
  `- git status clean before package: ${dirty ? 'NO' : 'YES'}`,
  ''
].join('\n');
writeFileSync(path.join(dest, 'README.md'), readme);

const zip = runStatus('zip', ['-qr', path.basename(zipPath), packageId], { cwd: outbox });
if (!zip.ok || !existsSync(zipPath)) {
  console.error('Failed to create result ZIP. zip output:');
  console.error(zip.output);
  process.exit(1);
}

if (!noOpen && process.platform === 'darwin') {
  if (openFolder) spawnSync('open', [outbox], { stdio: 'ignore' });
  else spawnSync('open', ['-R', zipPath], { stdio: 'ignore' });
}

console.log(`RESULT_PACKAGE_CREATED=${zipPath}`);
console.log(`UPLOAD_THIS_ZIP=${path.basename(zipPath)}`);
console.log('Do not paste terminal output. Upload the selected ZIP to ChatGPT.');
