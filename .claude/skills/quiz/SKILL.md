---
name: quiz
description: Interactive oral quiz (10 questions) about your project's codebase and architecture. Use when you want to test understanding or find knowledge gaps. Triggers on "quiz", "test me", etc.
argument-hint: "[area] (e.g., auth, api, database, all)"
disable-model-invocation: true
allowed-tools: Read, Glob, Grep, AskUserQuestion
---

# Project Codebase Quiz

Interactive **oral exam** (10 questions) about the project.

## Progress Checklist

Copy and check off as you go:

```
Quiz progress:
- [ ] Step 1: Identify scope and read source files
- [ ] Step 2: Prepare 10 questions
- [ ] Step 3: Ask questions 1~10 sequentially
- [ ] Step 4: Print final report
```

## Step 1: Preparation

1. If `$ARGUMENTS` is provided, focus on that area; otherwise cover the full project
2. **Read actual source files** in the target area to base questions on real code
3. Also read `CLAUDE.md` and any architecture docs for context
4. When ready, announce "Ready, let's begin" and ask the first question

## Step 2: Question Design (10 questions)

Draw evenly from 4 categories:

| Category | Count | Difficulty Basis |
|----------|-------|-----------------|
| **Structure** | 2-3 | Module/folder roles and relationships |
| **Data Flow** | 2-3 | Input -> processing -> output paths |
| **Core Concepts** | 2-3 | Design intent, architecture decisions |
| **Code Details** | 2 | Specific file/function behavior |

## Step 3: Ask Questions (one at a time)

For each question:

1. **Ask**: Format as `[N/10] [Category]` + question
2. **Wait**: Let the user answer freely
3. **Grade & Feedback**:
   - Correct -> confirm what's right + 1-2 lines of bonus info
   - Partial -> acknowledge correct parts + fill in gaps
   - Wrong -> give correct answer + **file path:line number** reference
   - "I don't know" -> no penalty, give answer, move on
4. **Next question**

## Step 4: Results Report

```
## Quiz Results

Score: X / 10

### By Category
- Structure: X/N
- Data Flow: X/N
- Core Concepts: X/N
- Code Details: X/N

### Weak Areas
- [area]: recommended files to study (with paths)

### Strengths
- [area]: what you demonstrated strong knowledge of
```

## Rules

- All questions must be based on **actual code** (never reference non-existent files/functions)
- Grading is based on **understanding of concepts** (not memorizing exact names)
- Difficulty targets **project owner level** (design intent and flow, not implementation trivia)
- Match the user's language in the quiz
