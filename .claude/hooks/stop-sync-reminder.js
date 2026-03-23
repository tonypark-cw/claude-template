// Stop hook: check handoff + docs sync before session end
const fs = require("fs");
const path = require("path");

const projectRoot = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");

let reminders = [];

// 1. Handoff freshness
const handoffPath = path.join(projectRoot, ".claude", "context", "handoff.md");
try {
  if (fs.existsSync(handoffPath)) {
    const stat = fs.statSync(handoffPath);
    const ageMinutes = (Date.now() - stat.mtimeMs) / 1000 / 60;
    if (ageMinutes > 60) {
      reminders.push(`handoff.md last updated ${Math.round(ageMinutes)}min ago — run /handoff to update`);
    }
  } else {
    reminders.push("No handoff.md — run /handoff to create");
  }
} catch (e) { /* ignore */ }

// 2. Progress report freshness
const progressPath = path.join(projectRoot, "docs", "progress.md");
try {
  if (fs.existsSync(progressPath)) {
    const stat = fs.statSync(progressPath);
    const ageMinutes = (Date.now() - stat.mtimeMs) / 1000 / 60;
    if (ageMinutes > 90) {
      reminders.push(`docs/progress.md not updated for ${Math.round(ageMinutes)}min`);
    }
  }
} catch (e) { /* ignore */ }

// 3. Uncommitted tracked changes
try {
  const { execSync } = require("child_process");
  const status = execSync("git status --porcelain", {
    cwd: projectRoot, encoding: "utf8", timeout: 5000, stdio: ["pipe", "pipe", "pipe"]
  }).trim();
  // Count only tracked file changes (exclude untracked '??')
  const modifiedCount = status.split("\n").filter(l => l.trim() && !l.startsWith("??")).length;
  if (modifiedCount > 0) {
    reminders.push(`${modifiedCount} uncommitted changes — commit or record in handoff`);
  }
} catch (e) { /* ignore */ }

if (reminders.length > 0) {
  process.stderr.write(
    `[session-end] Before closing:\n${reminders.map(r => `  - ${r}`).join("\n")}\n`
  );
  process.exit(2);
}

process.exit(0);
