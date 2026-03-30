// PostToolUse hook: run vitest + playwright after timebox/index.html changes
const fs = require('fs');

let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data.tool_input?.file_path || data.tool_response?.filePath || '';

    if (!filePath.includes('timebox/index.html')) {
      process.exit(0);
    }

    const { execSync } = require('child_process');
    const cwd = 'C:/Users/qkrck/claude-template/templates/timebox';

    try {
      execSync('npx vitest run', { cwd, stdio: 'pipe', timeout: 60000 });
      execSync('npx playwright test --reporter=line', { cwd, stdio: 'pipe', timeout: 120000 });
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext: 'timebox tests passed (vitest + playwright)'
        }
      }));
    } catch (err) {
      const output = (err.stdout || '').toString() + (err.stderr || '').toString();
      const failLines = output.split('\n').filter(l => /failed|error|FAIL/i.test(l)).slice(0, 10).join('\n');
      console.log(JSON.stringify({
        decision: 'block',
        reason: `timebox 테스트 실패. 사용자에게 서빙하지 마세요. 수정 후 재시도.\n${failLines}`
      }));
      process.exit(1);
    }
  } catch (e) {
    process.exit(0);
  }
});
