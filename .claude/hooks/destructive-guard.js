// PreToolUse: destructive Bash command detection
const PATTERNS = [
  /\brm\s+(-\w*[rf]\w*\s+-\w*[rf]|-rf|-fr)/,
  /\bgit\s+push\s+.*(-f|--force)/,
  /\bgit\s+reset\s+--hard/,
  /\bgit\s+clean\s+-\w*f/,
  /\bgit\s+branch\s+-D/,
  /\bgit\s+(checkout|restore)\s+\.\s*$/,
  /\b(drop|truncate)\s+(table|database)/i,
  /\btaskkill\s+\/F/i,
];
let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  const out = (decision, reason) =>
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: decision,
        ...(reason && { reason }),
      },
    }));
  try {
    const cmd = JSON.parse(input).tool_input?.command || '';
    const match = PATTERNS.find(p => p.test(cmd));
    if (match) {
      out('ask', `[Safety] Destructive command: ${cmd}`);
    } else {
      out('allow');
    }
  } catch {
    out('allow');
  }
  process.exit(0);
});
