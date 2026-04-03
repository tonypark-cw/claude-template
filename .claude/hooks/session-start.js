// SessionStart: inject context via stdout additionalContext (Claude-visible)
// Reads: handoff.md, compact-snapshot.md, todo.md, git state
// Budget: 10,000 char limit — priority-based truncation
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '../..');
const BUDGET = { git: 2000, todo: 1500, compact: 2000, handoff: 4000 };

function run(cmd) {
  try {
    return execSync(cmd, { cwd: projectRoot, encoding: 'utf8', timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch { return ''; }
}

function readFileSafe(fp, maxChars) {
  try {
    if (!fs.existsSync(fp)) return '';
    const content = fs.readFileSync(fp, 'utf8').trim();
    return content.slice(0, maxChars);
  } catch { return ''; }
}

const sections = [];

// 1. Git state (highest priority)
const lastCommit = run('git log -1 --format="%h %s (%cr)"');
const diffStat = run('git diff --stat HEAD');
if (lastCommit || diffStat) {
  let gitSection = '[Git State]\n';
  if (lastCommit) gitSection += `Last commit: ${lastCommit}\n`;
  if (diffStat) {
    const lines = diffStat.split('\n').slice(0, 15).join('\n');
    gitSection += `Uncommitted:\n${lines}\n`;
  }
  sections.push(gitSection.slice(0, BUDGET.git));
}

// 2. TODO (pending/in-progress items)
const todoPath = path.join(projectRoot, 'docs', 'todo.md');
const todoContent = readFileSafe(todoPath, BUDGET.todo);
if (todoContent) {
  const pendingLines = todoContent.split('\n').filter(l =>
    /pending|in.?progress|진행|🚧|📌|- \[ \]/i.test(l)
  ).slice(0, 8);
  if (pendingLines.length > 0) {
    sections.push(`[Pending Tasks] ${pendingLines.length} items:\n${pendingLines.join('\n')}`);
  }
}

// 3. Compact snapshot (if exists — from pre-compact hook)
const snapshotPath = path.join(projectRoot, '.claude', 'context', 'compact-snapshot.md');
const snapshot = readFileSafe(snapshotPath, BUDGET.compact);
if (snapshot) {
  const body = snapshot.replace(/^---[\s\S]*?---\n?/, '').trim();
  if (body) sections.push(`[Last Compact Snapshot]\n${body}`);
}

// 4. Repeated failure patterns (from failure-log.jsonl)
const failLogPath = path.join(projectRoot, '.claude', 'context', 'failure-log.jsonl');
try {
  if (fs.existsSync(failLogPath)) {
    const lines = fs.readFileSync(failLogPath, 'utf8').trim().split('\n').filter(Boolean);
    const repeated = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(e => e && e.count >= 3)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    if (repeated.length > 0) {
      const items = repeated.map(e => `  - ${e.tool}: "${e.error.slice(0, 80)}" (${e.count}x)`).join('\n');
      sections.push(`[Repeated Failures — consider adding rules/hooks]\n${items}`);
    }
  }
} catch {}

// 5. Handoff (lowest priority — truncated last)
const handoffPath = path.join(projectRoot, '.claude', 'context', 'handoff.md');
const handoff = readFileSafe(handoffPath, BUDGET.handoff);
if (handoff) {
  sections.push(`[Previous Handoff]\n${handoff}`);
}

const context = sections.join('\n\n');

if (context) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: context,
    },
  }));
} else {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: 'New session — no previous context found.',
    },
  }));
}

process.exit(0);
