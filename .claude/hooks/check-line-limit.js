// PostToolUse: reject files exceeding 80 lines
const fs = require('fs');
let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const fp = data.tool_input?.file_path;
    if (!fp || !fp.match(/\.(ts|js|tsx|jsx)$/)) process.exit(0);
    const lines = fs.readFileSync(fp, 'utf8').split('\n').length;
    if (lines > 80) {
      process.stderr.write(
        `STOP: ${fp} is ${lines} lines (limit: 80). Split into smaller modules.`
      );
      process.exit(2);
    }
  } catch (e) {}
  process.exit(0);
});
