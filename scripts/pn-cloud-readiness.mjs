#!/usr/bin/env node
import fs from 'node:fs';
import cp from 'node:child_process';

const requiredFiles = [
  'package.json',
  'docs/PROJECT_CURRENT_STATE.md',
  'docs/README.md',
  'docs/FINAL_PRODUCT_TARGET.md',
  'docs/GAME_STRATEGY_MASTER_PLAN.md',
  'docs/IMPLEMENTATION_ROADMAP.md',
  'docs/SPRINT_DEPENDENCY_GRAPH.md',
  'docs/AGENT_EXECUTION_GOVERNANCE.md',
  'docs/AUTONOMOUS_PRODUCTION_PROTOCOL.md',
  'docs/CLOUD_EXECUTION_PLAN.md',
  'docs/CLOUD_HEADLESS_EXECUTION_RUNBOOK.md',
  'docs/AUTONOMOUS_BATCH_EXECUTION_TEMPLATE.md',
  '.devcontainer/devcontainer.json',
  '.github/workflows/pn-ci.yml'
];

const requiredScripts = [
  'build',
  'qa:smoke',
  'pn:report',
  'pn:status',
  'pn:public-check',
  'pn:cloud-ready'
];

const optionalCommands = ['git', 'node', 'npm'];

function commandExists(command) {
  try {
    cp.execFileSync('bash', ['-lc', `command -v ${command}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const failures = [];
const warnings = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing required file: ${file}`);
}

let pkg = null;
try {
  pkg = readJson('package.json');
} catch (error) {
  failures.push(`package.json is not valid JSON: ${error.message}`);
}

if (pkg) {
  for (const script of requiredScripts) {
    if (!pkg.scripts || !pkg.scripts[script]) failures.push(`missing package script: ${script}`);
  }
}

for (const command of optionalCommands) {
  if (!commandExists(command)) warnings.push(`command not found in PATH: ${command}`);
}

try {
  const trackedSecrets = cp.execFileSync('git', ['ls-files', '.env', '.env.*', '*secret*', '*secrets*'], {
    encoding: 'utf8'
  }).trim();
  if (trackedSecrets) failures.push(`tracked secret-like files detected:\n${trackedSecrets}`);
} catch {
  warnings.push('could not inspect tracked secret-like files');
}

try {
  const status = cp.execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim();
  if (status) warnings.push(`working tree is not clean during readiness check:\n${status}`);
} catch {
  warnings.push('could not inspect git status');
}

console.log('=== Pixel Nations Cloud Readiness ===');
console.log(`Required files checked: ${requiredFiles.length}`);
console.log(`Required scripts checked: ${requiredScripts.length}`);

if (warnings.length) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (failures.length) {
  console.log('\nFailures:');
  for (const failure of failures) console.log(`- ${failure}`);
  console.log('\nCLOUD_READY=FAIL');
  process.exit(1);
}

console.log('\nCLOUD_READY=PASS');
