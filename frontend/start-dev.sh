#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG="$DIR/../.logs/frontend.log"
PID_FILE="$DIR/../.pids/frontend.pid"

# Kill existing
[ -f "$PID_FILE" ] && kill -9 $(cat "$PID_FILE") 2>/dev/null; true

cd "$DIR"
npx vite > "$LOG" 2>&1 &
echo $! > "$PID_FILE"
echo "Frontend started: PID $(cat $PID_FILE)"
echo "URL: http://localhost:3000"
echo "Log: $LOG"
