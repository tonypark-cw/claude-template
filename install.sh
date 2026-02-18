#!/bin/bash
# Claude Starter Template installer
set -e

TARGET="${1:-.}"

if [ ! -d "$TARGET" ]; then
  echo "Error: $TARGET is not a directory"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing Claude Starter to: $TARGET"

# Copy CLAUDE.md (skip if exists)
if [ -f "$TARGET/CLAUDE.md" ]; then
  echo "  SKIP: CLAUDE.md already exists"
else
  cp "$SCRIPT_DIR/CLAUDE.md" "$TARGET/"
  echo "  OK: CLAUDE.md"
fi

# Copy .claude/ directory
mkdir -p "$TARGET/.claude/hooks"
mkdir -p "$TARGET/.claude/skills"
cp -n "$SCRIPT_DIR/.claude/hooks/"*.js "$TARGET/.claude/hooks/" 2>/dev/null && echo "  OK: hooks" || echo "  SKIP: hooks already exist"
cp -rn "$SCRIPT_DIR/.claude/skills/"* "$TARGET/.claude/skills/" 2>/dev/null && echo "  OK: skills" || echo "  SKIP: skills already exist"

if [ ! -f "$TARGET/.claude/settings.local.json" ]; then
  cp "$SCRIPT_DIR/.claude/settings.local.json" "$TARGET/.claude/"
  echo "  OK: settings.local.json"
else
  echo "  SKIP: settings.local.json already exists"
fi

# Copy docs/
mkdir -p "$TARGET/docs/guides"
cp -n "$SCRIPT_DIR/docs/todo.md" "$TARGET/docs/" 2>/dev/null && echo "  OK: docs/todo.md" || echo "  SKIP: todo.md exists"
cp -n "$SCRIPT_DIR/docs/mistakes.md" "$TARGET/docs/" 2>/dev/null && echo "  OK: docs/mistakes.md" || echo "  SKIP: mistakes.md exists"
cp -n "$SCRIPT_DIR/docs/guides/context-engineering.md" "$TARGET/docs/guides/" 2>/dev/null && echo "  OK: context-engineering.md" || echo "  SKIP: context-engineering.md exists"

echo ""
echo "Done! Next steps:"
echo "  1. Edit $TARGET/CLAUDE.md - fill in Project Context section"
echo "  2. Edit $TARGET/docs/todo.md - add your first tasks"
