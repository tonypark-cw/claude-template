// SessionStart hook: auto-load context at session start
// 1. handoff.md — previous session state
// 2. docs/todo.md — pending tasks
// 3. Recent git changes
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectRoot = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");

// 1. Handoff
const handoffPath = path.join(projectRoot, ".claude", "context", "handoff.md");
try {
  if (fs.existsSync(handoffPath)) {
    const content = fs.readFileSync(handoffPath, "utf8").trim();
    if (content) {
      const todoMatch = content.match(/## 다음에 할 것[\s\S]*?(?=##|$)/) ||
                        content.match(/## Next[\s\S]*?(?=##|$)/);
      const warnings = content.match(/## 주의사항[\s\S]*?(?=##|$)/) ||
                       content.match(/## Warnings[\s\S]*?(?=##|$)/);
      let summary = "[session-start] Previous handoff:\n";
      if (todoMatch) summary += todoMatch[0].trim() + "\n";
      if (warnings) summary += warnings[0].trim() + "\n";
      process.stderr.write(summary);
    }
  }
} catch (e) { /* ignore */ }

// 2. TODO
const todoPath = path.join(projectRoot, "docs", "todo.md");
try {
  if (fs.existsSync(todoPath)) {
    const content = fs.readFileSync(todoPath, "utf8").trim();
    if (content) {
      const pendingLines = content.split("\n").filter(l => l.match(/pending|진행|🚧|📌|- \[ \]/i));
      if (pendingLines.length > 0) {
        process.stderr.write(`[session-start] Pending tasks ${pendingLines.length}:\n${pendingLines.slice(0, 5).join("\n")}\n`);
      }
    }
  }
} catch (e) { /* ignore */ }

// 3. Git changes since last commit
try {
  const lastCommit = execSync("git log -1 --format=\"%h %s (%cr)\"", {
    cwd: projectRoot, encoding: "utf8", timeout: 5000, stdio: ["pipe", "pipe", "pipe"]
  }).trim();
  const changedFiles = execSync("git diff --stat HEAD", {
    cwd: projectRoot, encoding: "utf8", timeout: 5000, stdio: ["pipe", "pipe", "pipe"]
  }).trim();

  if (changedFiles) {
    process.stderr.write(`[session-start] Last commit: ${lastCommit}\nUncommitted:\n${changedFiles}\n`);
  }
} catch (e) { /* ignore */ }

process.exit(0);
