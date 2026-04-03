# AGENTS.md — Shared Rules for All AI Coding Agents

This file is the **single source of truth** for rules that apply to every AI tool (Claude Code, Codex, Cursor, Copilot, etc.). Tool-specific files (CLAUDE.md, .cursorrules) import this file and add tool-specific overrides. On conflict, the tool-specific file takes precedence.

## Build & Test

- Build: `[YOUR BUILD COMMAND]`
- Test: `[YOUR TEST COMMAND]`
- Lint: `[YOUR LINT COMMAND]`

## Code Style

- **80-line limit** per file — split into modules if exceeded
- **File header**: every .ts/.js/.tsx/.jsx file starts with a `//` one-line description
- Match existing code patterns — don't introduce new conventions
- Prefer editing existing files over creating new ones

## Security

- **Never commit**: `.env`, credentials, secrets, API keys
- **Never commit**: model files (`*.safetensors`, `*.bin`, `*.onnx`, `*.trt`)
- **DB**: SELECT queries only. No DDL (CREATE/DROP/ALTER TABLE)
- **Destructive actions** (file deletion, force push, DB changes) require user confirmation

## PR & Commit Guidelines

- Commit messages: imperative mood, concise, explain "why" not "what"
- One logical change per commit
- Test before committing
- Don't commit generated files, build artifacts, or cache directories
