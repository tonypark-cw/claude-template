// PermissionDenied: Log tool permission denials for debugging auto-mode behavior
const fs = require('fs');
const path = require('path');

const projectRoot = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '../..');
const logPath = path.join(projectRoot, '.claude', 'context', 'permission-denied.jsonl');

let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const entry = {
      ts: new Date().toISOString(),
      tool: data.tool_name || 'unknown',
      input: JSON.stringify(data.tool_input || {}).slice(0, 200),
    };
    fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
  } catch {}
  process.exit(0);
});
