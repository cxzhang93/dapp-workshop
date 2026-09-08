#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT="${1:?Usage: launch.sh lock|election|crowdfunding [--no-open|--test]}"
shift
case "$PROJECT" in lock) DEFAULT_PORT=4181;; election) DEFAULT_PORT=4182;; crowdfunding) DEFAULT_PORT=4183;; *) echo "Unknown project" >&2; exit 2;; esac
MODE="${1:-}"
case "$MODE" in ""|--no-open|--test) ;; *) echo "Use --no-open or --test" >&2; exit 2;; esac
command -v node >/dev/null || { echo "Install Node.js 24 LTS, then run this script again." >&2; exit 1; }
command -v npm >/dev/null || { echo "npm is missing. Install the complete Node.js distribution." >&2; exit 1; }
node -e 'if(Number(process.versions.node.split(".")[0])<20){console.error("Node.js 20 or newer required; Node 24 recommended.");process.exit(1)}'
cd "$ROOT/$PROJECT"
LOCK_HASH="$(node -e 'const fs=require("fs"),crypto=require("crypto");process.stdout.write(crypto.createHash("sha256").update(fs.readFileSync("package-lock.json")).digest("hex"))')"
if [[ ! -f node_modules/.workshop-lockhash ]] || [[ "$(cat node_modules/.workshop-lockhash)" != "$LOCK_HASH" ]]; then
  echo "Installing pinned dependencies for $PROJECT (first run needs internet)…"
  npm ci --ignore-scripts --no-audit --no-fund
  printf '%s' "$LOCK_HASH" > node_modules/.workshop-lockhash
fi
if [[ "$MODE" == --test ]]; then exec npm test; fi
export PORT="${PORT:-$DEFAULT_PORT}"
node -e 'const p=Number(process.env.PORT);if(!Number.isInteger(p)||p<1024||p>65535){console.error("PORT must be 1024–65535");process.exit(1)}'
URL="http://127.0.0.1:$PORT"
# Refuse to open an unrelated process if the port is occupied.
node --input-type=module -e 'import net from "node:net";const s=net.createServer();s.once("error",()=>{console.error("Port "+process.env.PORT+" is occupied. Stop the existing process or choose PORT=4184.");process.exit(1)});s.listen(Number(process.env.PORT),"127.0.0.1",()=>s.close());'
node server.mjs &
SERVER_PID=$!
cleanup(){ kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; }
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
for ((i=0; i<60; i++)); do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then wait "$SERVER_PID"; exit 1; fi
  if node --input-type=module -e 'try{const r=await fetch(process.argv[1]+"/health");const v=await r.json();process.exit(v.ok&&v.project===process.argv[2]?0:1)}catch{process.exit(1)}' "$URL" "$PROJECT"; then
    echo "Open $URL — press Ctrl+C here to stop."
    if [[ "$MODE" != --no-open ]]; then
      if [[ "$(uname -s)" == Darwin ]]; then open "$URL" || true
      elif command -v xdg-open >/dev/null; then xdg-open "$URL" >/dev/null 2>&1 || true; fi
    fi
    wait "$SERVER_PID"
    exit $?
  fi
  sleep 1
done
echo "Startup timed out. See the error output above." >&2
exit 1
