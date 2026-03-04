#!/bin/bash
# run-agent-team.sh — Launch parallel Claude Code agents via tmux
set -euo pipefail

# --- Configuration (override via env) ---
MODEL="${CLAUDE_MODEL:-sonnet}"
SESSION="${TMUX_SESSION:-agent-team}"
DELAY="${AGENT_DELAY:-5}"
WORK_DIR="${AGENT_WORK_DIR:-.}"
DRY_RUN=false
SKIP_PERMS=false

# --- Usage ---
usage() {
  cat <<EOF
Usage: $(basename "$0") <prompts-dir> [options]

Launch parallel Claude Code agents, one per .md file in <prompts-dir>.

Options:
  --model <model>    Claude model (default: sonnet)
  --delay <seconds>  Delay between agent launches (default: 5)
  --work-dir <path>  Working directory for agents (default: current)
  --dry              Preview layout without launching
  --skip-perms       Skip permission prompts (use with caution)
  -h, --help         Show this help

Environment variables:
  CLAUDE_MODEL       Same as --model
  AGENT_DELAY        Same as --delay
  AGENT_WORK_DIR     Same as --work-dir
  TMUX_SESSION       tmux session name (default: agent-team)

Examples:
  $(basename "$0") ./prompts/new-feature
  $(basename "$0") ./prompts/new-feature --model opus --delay 3
  $(basename "$0") ./prompts/new-feature --dry
EOF
  exit 0
}

# --- Parse arguments ---
PROMPTS_DIR=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --model)    MODEL="$2"; shift 2 ;;
    --delay)    DELAY="$2"; shift 2 ;;
    --work-dir) WORK_DIR="$2"; shift 2 ;;
    --dry)      DRY_RUN=true; shift ;;
    --skip-perms) SKIP_PERMS=true; shift ;;
    -h|--help)  usage ;;
    -*)         echo "Unknown option: $1"; exit 1 ;;
    *)          PROMPTS_DIR="$1"; shift ;;
  esac
done

if [[ -z "$PROMPTS_DIR" ]]; then
  echo "Error: prompts directory required"
  usage
fi

# --- Preflight checks ---
for cmd in tmux claude; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd is not installed"
    exit 1
  fi
done

if [[ ! -d "$PROMPTS_DIR" ]]; then
  echo "Error: $PROMPTS_DIR is not a directory"
  exit 1
fi

# --- Discover prompt files ---
mapfile -t PROMPTS < <(find "$PROMPTS_DIR" -maxdepth 1 -name '*.md' -type f | sort)
AGENT_COUNT=${#PROMPTS[@]}

if [[ $AGENT_COUNT -eq 0 ]]; then
  echo "Error: no .md files found in $PROMPTS_DIR"
  exit 1
fi

if [[ $AGENT_COUNT -gt 9 ]]; then
  echo "Error: max 9 agents supported (found $AGENT_COUNT)"
  exit 1
fi

# --- Derive agent names ---
declare -a NAMES
for p in "${PROMPTS[@]}"; do
  name=$(basename "$p" .md)
  name="${name#[0-9][0-9]-}"  # strip "01-" prefix
  NAMES+=("$name")
done

# --- Dry run: preview layout ---
echo "=== Agent Team ==="
echo "  Model:     $MODEL"
echo "  Agents:    $AGENT_COUNT"
echo "  Work dir:  $WORK_DIR"
echo "  Delay:     ${DELAY}s"
echo ""

for i in "${!PROMPTS[@]}"; do
  echo "  Agent $((i+1)): ${NAMES[$i]}"
  echo "    Prompt: ${PROMPTS[$i]}"
done

if $DRY_RUN; then
  echo ""
  echo "--- Layout Preview ---"
  case $AGENT_COUNT in
    1) echo "┌────────────┐"
       echo "│  ${NAMES[0]}  │"
       echo "└────────────┘" ;;
    2) echo "┌──────┬──────┐"
       echo "│ ${NAMES[0]} │ ${NAMES[1]} │"
       echo "└──────┴──────┘" ;;
    3) echo "┌──────┬──────┐"
       echo "│ ${NAMES[0]} │ ${NAMES[1]} │"
       echo "├────────────┤"
       echo "│  ${NAMES[2]}  │"
       echo "└────────────┘" ;;
    4) echo "┌──────┬──────┐"
       echo "│ ${NAMES[0]} │ ${NAMES[1]} │"
       echo "├──────┼──────┤"
       echo "│ ${NAMES[2]} │ ${NAMES[3]} │"
       echo "└──────┴──────┘" ;;
    *) echo "┌────┬────┬────┐"
       echo "│  top row ($((AGENT_COUNT/2+AGENT_COUNT%2)))  │"
       echo "├────┴────┴────┤"
       echo "│  bottom row ($((AGENT_COUNT/2)))  │"
       echo "└─────────────┘" ;;
  esac
  echo ""
  echo "(dry run — no agents launched)"
  exit 0
fi

# --- Build claude command ---
CLAUDE_CMD="claude --model $MODEL"
if $SKIP_PERMS; then
  CLAUDE_CMD="$CLAUDE_CMD --dangerously-skip-permissions"
fi

# --- Kill existing session ---
tmux kill-session -t "$SESSION" 2>/dev/null || true

# --- Create tmux session with first agent ---
PROMPT_PATH=$(realpath "${PROMPTS[0]}")
tmux new-session -d -s "$SESSION" -x 200 -y 50
tmux send-keys -t "$SESSION" "cd '$WORK_DIR'" Enter

# --- Split panes for remaining agents ---
for ((i=1; i<AGENT_COUNT; i++)); do
  if ((i % 2 == 1)); then
    tmux split-window -h -t "$SESSION"
  else
    tmux split-window -v -t "$SESSION"
  fi
  tmux send-keys -t "$SESSION" "cd '$WORK_DIR'" Enter
done

# Rebalance layout
tmux select-layout -t "$SESSION" tiled

# --- Style panes ---
tmux set -t "$SESSION" pane-border-style "fg=#64748B"
tmux set -t "$SESSION" pane-active-border-style "fg=#22D3EE"

# --- Collect pane IDs ---
mapfile -t PANE_IDS < <(tmux list-panes -t "$SESSION" -F '#{pane_id}')

# --- Launch agents with delay ---
for ((i=0; i<AGENT_COUNT; i++)); do
  PROMPT_PATH=$(realpath "${PROMPTS[$i]}")
  PANE="${PANE_IDS[$i]}"

  # Set pane title
  tmux select-pane -t "$PANE" -T "${NAMES[$i]}"

  # Launch claude
  tmux send-keys -t "$PANE" \
    "$CLAUDE_CMD \"Read the file $PROMPT_PATH and execute all instructions in it.\"" Enter

  echo "  Launched: ${NAMES[$i]} (pane $PANE)"

  # Stagger launches
  if ((i < AGENT_COUNT - 1)); then
    sleep "$DELAY"
  fi
done

echo ""
echo "All $AGENT_COUNT agents launched in tmux session: $SESSION"
echo ""
echo "Controls:"
echo "  tmux attach -t $SESSION     # attach to session"
echo "  Ctrl+B → arrow keys         # switch panes"
echo "  Ctrl+B → z                  # zoom current pane"
echo "  Ctrl+B → d                  # detach (agents keep running)"
