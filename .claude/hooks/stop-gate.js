// Stop: unified gate — Phase A (quality) + Phase B (sync reminder)
// Phase A failure → exit 2 + stderr (Claude sees this, will fix)
// Phase B reminder → exit 0 + stderr (user-only, non-blocking, debounced)
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const projectRoot = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '../..');

function run(cmd, timeout = 3000) {
  try {
    return execSync(cmd, { cwd: projectRoot, encoding: 'utf8', timeout, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (e) { return e; }
}

// --- Phase A: Quality checks (blocking) ---
const errors = [];
const changedFiles = run('git diff --name-only HEAD', 5000);
if (typeof changedFiles === 'string' && changedFiles) {
  const files = changedFiles.split('\n').filter(Boolean);
  for (const f of files) {
    const fp = path.join(projectRoot, f);
    if (!fs.existsSync(fp)) continue;

    if (f.endsWith('.json')) {
      try {
        const content = fs.readFileSync(fp, 'utf8');
        if (content.length > 1024 * 1024) continue;
        JSON.parse(content);
      } catch (e) {
        errors.push(`${f}: invalid JSON — ${e.message.split('\n')[0]}`);
      }
    }

    if (f.endsWith('.py')) {
      const result = run(`python -m py_compile "${fp}"`);
      if (result instanceof Error) {
        const msg = (result.stderr || '').toString().split('\n').slice(0, 3).join(' ');
        errors.push(`${f}: Python syntax error — ${msg}`);
      }
    }

    if (f.endsWith('.js') && !f.endsWith('.min.js')) {
      const result = run(`node --check "${fp}"`);
      if (result instanceof Error) {
        const msg = (result.stderr || '').toString().split('\n').slice(0, 3).join(' ');
        errors.push(`${f}: JS syntax error — ${msg}`);
      }
    }
  }
}

if (errors.length > 0) {
  process.stderr.write(`[quality-gate] ${errors.length} error(s) found:\n${errors.map(e => '  - ' + e).join('\n')}\nFix these before finishing.\n`);
  process.exit(2);
}

// --- Phase B: Sync reminders (non-blocking, debounced) ---

// Debounce: skip if reminded within last 5 minutes
const DEBOUNCE_MINUTES = 5;
const markerPath = path.join(os.tmpdir(), 'claude-stop-gate-' + Buffer.from(projectRoot).toString('base64url').slice(0, 20));
try {
  if (fs.existsSync(markerPath)) {
    const age = (Date.now() - fs.statSync(markerPath).mtimeMs) / 60000;
    if (age < DEBOUNCE_MINUTES) process.exit(0);
  }
} catch {}

const reminders = [];

// Handoff freshness
const handoffPath = path.join(projectRoot, '.claude', 'context', 'handoff.md');
try {
  if (fs.existsSync(handoffPath)) {
    const age = (Date.now() - fs.statSync(handoffPath).mtimeMs) / 60000;
    if (age > 60) reminders.push(`handoff.md last updated ${Math.round(age)}min ago — run /handoff`);
  } else {
    reminders.push('No handoff.md — run /handoff to create');
  }
} catch {}

// Progress freshness
const progressPath = path.join(projectRoot, 'docs', 'progress.md');
try {
  if (fs.existsSync(progressPath)) {
    const age = (Date.now() - fs.statSync(progressPath).mtimeMs) / 60000;
    if (age > 90) reminders.push(`progress.md not updated for ${Math.round(age)}min`);
  }
} catch {}

// === CUSTOMIZE: Defer detection patterns ===
// Add patterns in your language to detect when the agent tries to postpone work.
// English examples included. Add your language's equivalents.
const DEFER_PATTERNS = [
  'next session', 'let\'s continue later', 'we can do that later',
  'leave it for now', 'pick this up next time',
];
try {
  const stdinData = fs.readFileSync(0, 'utf8');
  const hookInput = JSON.parse(stdinData);
  const lastMsg = hookInput.last_assistant_message || '';
  const found = DEFER_PATTERNS.filter(p => lastMsg.toLowerCase().includes(p.toLowerCase()));
  if (found.length > 0) {
    reminders.push(`[Defer detected] "${found[0]}" — if user wants it now, do it now.`);
  }
} catch {}

// Uncommitted changes
try {
  const status = run('git status --porcelain', 5000);
  if (typeof status === 'string') {
    const modified = status.split('\n').filter(l => l.trim() && !l.startsWith('??')).length;
    if (modified > 0) reminders.push(`${modified} uncommitted changes — commit or record in handoff`);
  }
} catch {}

if (reminders.length > 0) {
  try { fs.writeFileSync(markerPath, new Date().toISOString()); } catch {}
  process.stderr.write(`[session-end] Before closing:\n${reminders.map(r => '  - ' + r).join('\n')}\n`);
}

process.exit(0);
