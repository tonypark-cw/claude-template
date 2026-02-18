// PostToolUse: require one-line header comment
const fs = require('fs');
let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const fp = data.tool_input?.file_path;
    if (!fp || !fp.match(/\.(ts|js|tsx|jsx)$/)) process.exit(0);
    const first = fs.readFileSync(fp, 'utf8').split('\n')[0].trim();
    if (!first.startsWith('//')) {
      process.stderr.write(
        `STOP: ${fp} missing header comment. Add a one-line // description at the top.`
      );
      process.exit(2);
    }
  } catch (e) {}
  process.exit(0);
});
