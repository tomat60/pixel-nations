#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import { execFileSync, execSync, spawnSync } from 'child_process';

const args = new Set(process.argv.slice(2));
const noOpen = args.has('--no-open');
const dryRun = args.has('--dry-run');
const defaultUrl = process.env.PN_DEMO_URL || 'http://localhost:3000';
const urlArg = process.argv.find((a) => a.startsWith('--url='));
const demoUrl = urlArg ? urlArg.slice('--url='.length) : defaultUrl;

function run(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
  } catch (error) {
    const stdout = error.stdout ? String(error.stdout) : '';
    const stderr = error.stderr ? String(error.stderr) : '';
    return `${stdout}\n${stderr}`.trim() || `COMMAND_FAILED: ${cmd}`;
  }
}

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function safeWrite(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function reveal(filePath) {
  if (noOpen) return;
  if (process.platform === 'darwin') {
    spawnSync('open', ['-R', filePath], { stdio: 'ignore' });
  } else {
    spawnSync('xdg-open', [path.dirname(filePath)], { stdio: 'ignore' });
  }
}

function askFactory() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, (answer) => resolve(answer.trim())));
  ask.close = () => rl.close();
  return ask;
}

async function collectAnswers() {
  if (dryRun) {
    return {
      mode: 'dry-run',
      firstClickClarity: 'dry-run',
      openingConfusion: 'dry-run',
      atlasVsSector: 'dry-run',
      claimClarity: 'dry-run',
      postClaimNextStep: 'dry-run',
      progressionLoop: 'dry-run',
      settlementNationEmpire: 'dry-run',
      mostConfusingMoment: 'dry-run',
      highestValueFix: 'dry-run',
      continueScore: 'dry-run',
      notes: 'Validation package only.'
    };
  }

  console.log('');
  console.log('Pixel Nations Player Confusion Pass v0.7');
  console.log('Demo URL:', demoUrl);
  console.log('');
  console.log('Open the demo, act like a first-time player, then answer briefly.');
  console.log('Scale questions: 1 = unclear / bad, 5 = clear / strong.');
  console.log('');

  if (!noOpen && process.platform === 'darwin') {
    spawnSync('open', [demoUrl], { stdio: 'ignore' });
  }

  const ask = askFactory();
  const answers = {};
  answers.mode = 'interactive';
  answers.firstClickClarity = await ask('1) First-click clarity, 1-5: ');
  answers.openingConfusion = await ask('2) What was unclear in the first 30 seconds? ');
  answers.atlasVsSector = await ask('3) Atlas/world vs Sector A-01 clarity, 1-5 + note: ');
  answers.claimClarity = await ask('4) Land claim / selection clarity, 1-5 + note: ');
  answers.postClaimNextStep = await ask('5) After claim/selection, did you know what to do next? ');
  answers.progressionLoop = await ask('6) land → settlement/city → nation → empire clarity, 1-5 + note: ');
  answers.settlementNationEmpire = await ask('7) Did Settlement/Nation/Empire feel like a real goal or just labels? ');
  answers.mostConfusingMoment = await ask('8) Most confusing moment: ');
  answers.highestValueFix = await ask('9) One smallest fix that would help most: ');
  answers.continueScore = await ask('10) Would a new player continue, 1-5? ');
  answers.notes = await ask('11) Extra notes/screenshots mentioned? ');
  ask.close();
  return answers;
}

function buildVerdict(answers) {
  const text = JSON.stringify(answers).toLowerCase();
  const severe = ['unclear', 'confusing', 'nie wiem', 'niejas', 'lost', 'brak', 'chaos'].some((word) => text.includes(word));
  const lowScores = Object.values(answers).filter((value) => /^\s*[12](\D|$)/.test(String(value))).length;
  if (answers.mode === 'dry-run') return 'DRY_RUN_ONLY';
  if (lowScores >= 2 || severe) return 'PATCH_RECOMMENDED_BEFORE_NEXT_FEATURE';
  return 'FLOW_ACCEPTABLE_FOR_NEXT_PASS';
}

function markdownReport({ answers, verdict, gitStatus, pnStatus }) {
  const lines = [];
  lines.push('# Pixel Nations Player Confusion Pass v0.7');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Demo URL: ${demoUrl}`);
  lines.push(`Verdict: ${verdict}`);
  lines.push('');
  lines.push('## Answers');
  for (const [key, value] of Object.entries(answers)) {
    lines.push(`- **${key}:** ${String(value || '').replace(/\n/g, ' ')}`);
  }
  lines.push('');
  lines.push('## Decision use');
  lines.push('- If verdict is PATCH_RECOMMENDED_BEFORE_NEXT_FEATURE, do not start a new system sprint.');
  lines.push('- Use this report to prepare one scoped UX/content patch.');
  lines.push('- Cursor remains blocked until a reviewed prompt exists.');
  lines.push('');
  lines.push('## Git status');
  lines.push('```');
  lines.push(gitStatus || 'clean');
  lines.push('```');
  lines.push('');
  lines.push('## pn:status snapshot');
  lines.push('```');
  lines.push(pnStatus || 'not captured');
  lines.push('```');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  if (!fs.existsSync('package.json') || !fs.existsSync('.git')) {
    console.error('ERROR: Run from Pixel Nations repo root.');
    process.exit(1);
  }

  const id = `player-confusion-v0-7-${stamp()}`;
  const outDir = path.join('reports', 'outbox', id);
  fs.mkdirSync(outDir, { recursive: true });

  const gitStatus = run('git status --short --branch --untracked-files=all');
  const pnStatus = run('npm run pn:status');
  const answers = await collectAnswers();
  const verdict = buildVerdict(answers);

  const payload = {
    kind: 'pixel-nations-player-confusion-pass',
    version: 'v0.7',
    generatedAt: new Date().toISOString(),
    demoUrl,
    verdict,
    answers,
    gitStatus,
    pnStatus
  };

  safeWrite(path.join(outDir, 'player-confusion-report.json'), JSON.stringify(payload, null, 2) + '\n');
  safeWrite(path.join(outDir, 'player-confusion-report.md'), markdownReport({ answers, verdict, gitStatus, pnStatus }));
  safeWrite(path.join(outDir, 'README_UPLOAD_THIS.txt'), [
    'Upload the ZIP next to this folder to ChatGPT.',
    'Do not paste terminal output.',
    'This package contains the Player Confusion Pass results.'
  ].join(os.EOL) + os.EOL);

  const zipPath = path.join('reports', 'outbox', `${id}.zip`);
  try {
    execFileSync('zip', ['-qr', path.resolve(zipPath), id], { cwd: path.resolve('reports', 'outbox') });
  } catch (error) {
    console.error('ERROR: zip command failed.');
    console.error(error.message);
    process.exit(1);
  }

  console.log('');
  console.log(`PLAYER_CONFUSION_PACKAGE_CREATED=${path.resolve(zipPath)}`);
  console.log(`UPLOAD_THIS_ZIP=${path.basename(zipPath)}`);
  console.log(`VERDICT=${verdict}`);
  console.log('Do not paste terminal output. Upload the selected ZIP to ChatGPT.');
  reveal(path.resolve(zipPath));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
