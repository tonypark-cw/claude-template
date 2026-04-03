// PreToolUse: 3-tier Bash command guard (WHITELIST → BLOCK → ASK)
const path = require('path');

const SAFE_DIRS = ['node_modules', '.next', 'dist', 'build', '__pycache__', '.cache', '.turbo', 'coverage'];

const BLOCK_PATTERNS = [
  { re: /rm\s+(-\w*[rf]\w*\s+-\w*[rf]|-rf|-fr)\s+/, msg: 'Recursive delete blocked', alt: 'rm <specific-path>' },
  { re: /\bgit\s+push\s+.*(-f|--force)/, msg: 'Force push blocked', alt: 'git push (without --force)' },
  { re: /\bgit\s+reset\s+--hard/, msg: 'Hard reset blocked', alt: 'git stash' },
  { re: /\bgit\s+clean\s+-\w*f/, msg: 'git clean -f blocked', alt: 'git stash -u' },
  { re: /\bgit\s+add\s+(\.|--all|-A)\s*$/, msg: 'git add . blocked — specify files', alt: 'git add <file1> <file2>' },
  { re: /\b(drop|truncate)\s+(table|database)/i, msg: 'DB destruction blocked' },
  { re: /\b(format|mkfs)\b/i, msg: 'Disk format blocked' },
];

const ASK_PATTERNS = [
  { re: /\bgit\s+branch\s+-D\b/, msg: 'Force-delete branch' },
  { re: /\bgit\s+(checkout|restore)\s+\.\s*$/, msg: 'Discard all unstaged changes' },
  { re: /\btaskkill\s+\/F/i, msg: 'Force-kill process' },
  { re: /\bnpm\s+publish\b/, msg: 'Publish package to registry' },
  { re: /\bchmod\s+777\b/, msg: 'Open permissions to everyone' },
];

function isWhitelisted(cmd) {
  const rmMatch = cmd.match(/rm\s+-rf?\s+(.+)/);
  if (!rmMatch) return false;
  const targets = rmMatch[1].trim().split(/\s+/);
  return targets.every(t => {
    try {
      const resolved = path.basename(path.resolve(t));
      return SAFE_DIRS.includes(resolved);
    } catch { return false; }
  });
}

function normalizeCmd(cmd) {
  return cmd.replace(/['"]/g, '').replace(/\s+/g, ' ').trim();
}

let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  try {
    const cmd = normalizeCmd(JSON.parse(input).tool_input?.command || '');
    if (!cmd) { allow(); return; }

    if (isWhitelisted(cmd)) { allow(); return; }

    const blocked = BLOCK_PATTERNS.find(p => p.re.test(cmd));
    if (blocked) {
      const reason = `BLOCKED: ${blocked.msg}${blocked.alt ? ` → use: ${blocked.alt}` : ''}`;
      process.stderr.write(reason);
      process.exit(2);
    }

    const asked = ASK_PATTERNS.find(p => p.re.test(cmd));
    if (asked) {
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason: `[Safety] ${asked.msg}: ${cmd}`,
        },
      }));
      process.exit(0);
    }

    allow();
  } catch { allow(); }
});

function allow() {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow',
    },
  }));
  process.exit(0);
}
