// PreCompact: save state snapshot before context compaction
// Cannot block compaction — side-effect only (file write + user stderr)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '../..');
const snapshotPath = path.join(projectRoot, '.claude', 'context', 'compact-snapshot.md');

function run(cmd) {
  try {
    return execSync(cmd, { cwd: projectRoot, encoding: 'utf8', timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch { return ''; }
}

function readFile(fp) {
  try { return fs.readFileSync(fp, 'utf8').trim(); } catch { return ''; }
}

const lastCommit = run('git log -1 --format="%h %s (%cr)"');
const diffStat = run('git diff --stat HEAD');
const todoContent = readFile(path.join(projectRoot, 'docs', 'todo.md'));
const inProgress = todoContent.split('\n').filter(l => /in.?progress|진행|🚧/i.test(l)).slice(0, 5);

const timestamp = new Date().toISOString();
const snapshot = [
  '---',
  `timestamp: ${timestamp}`,
  '---',
  '## Compact Snapshot',
  lastCommit ? `- Last commit: ${lastCommit}` : '- Last commit: (none)',
  diffStat ? `- Changed files:\n${diffStat.split('\n').slice(0, 10).map(l => '  ' + l).join('\n')}` : '- Changed files: (none)',
  inProgress.length > 0 ? `- In progress:\n${inProgress.map(l => '  ' + l.trim()).join('\n')}` : '- In progress: (none)',
].join('\n');

try {
  const contextDir = path.dirname(snapshotPath);
  if (!fs.existsSync(contextDir)) fs.mkdirSync(contextDir, { recursive: true });
  fs.writeFileSync(snapshotPath, snapshot, 'utf8');
  process.stderr.write(`[pre-compact] Snapshot saved to ${snapshotPath}\n`);
} catch (e) {
  process.stderr.write(`[pre-compact] Failed to save snapshot: ${e.message}\n`);
}

process.exit(0);
