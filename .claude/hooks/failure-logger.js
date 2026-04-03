// PostToolUseFailure: log failure patterns to failure-log.jsonl
// Aggregates by unique pattern (tool+error key), keeps max 100 unique entries
const fs = require('fs');
const path = require('path');

const projectRoot = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '../..');
const logPath = path.join(projectRoot, '.claude', 'context', 'failure-log.jsonl');

let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const tool = data.tool_name || 'unknown';
    const toolInput = data.tool_input || {};
    const error = (data.tool_error || data.tool_response?.error || '').toString().slice(0, 200);

    const key = `${tool}:${error.slice(0, 50)}`;
    const entry = {
      ts: new Date().toISOString(),
      tool,
      command: toolInput.command || toolInput.file_path || '',
      error,
      key,
    };

    const contextDir = path.dirname(logPath);
    if (!fs.existsSync(contextDir)) fs.mkdirSync(contextDir, { recursive: true });

    let lines = [];
    if (fs.existsSync(logPath)) {
      lines = fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean);
    }

    const existing = lines.findIndex(l => {
      try { return JSON.parse(l).key === key; } catch { return false; }
    });

    if (existing >= 0) {
      const prev = JSON.parse(lines[existing]);
      prev.count = (prev.count || 1) + 1;
      prev.ts = entry.ts;
      prev.command = entry.command;
      lines[existing] = JSON.stringify(prev);
    } else {
      entry.count = 1;
      lines.push(JSON.stringify(entry));
    }

    if (lines.length > 100) lines = lines.slice(-100);
    fs.writeFileSync(logPath, lines.join('\n') + '\n', 'utf8');
  } catch {}
  process.exit(0);
});
