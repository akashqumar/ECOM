#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$SCRIPT_DIR/.pids"

if [ -d "$PID_DIR" ]; then
    for pidfile in "$PID_DIR"/*.pid; do
        if [ -f "$pidfile" ]; then
            PID=$(cat "$pidfile")
            NAME=$(basename "$pidfile" .pid)
            echo "Stopping $NAME (PID: $PID)..."
            kill -9 "$PID" 2>/dev/null || true
            rm -f "$pidfile"
        fi
    done
fi
echo "All services (backend + frontend) stopped."
