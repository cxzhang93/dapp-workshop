#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT="${1:?Usage: launch.sh lock|election|tokenization [--no-open|--test]}"
MODE="${2:-}"

case "$PROJECT" in lock|election|tokenization) ;; *) echo "Unknown project: $PROJECT" >&2; exit 2;; esac
case "$MODE" in ""|--no-open|--test) ;; *) echo "Use --no-open or --test" >&2; exit 2;; esac

command -v node >/dev/null || { echo "Install Node.js 22 or newer." >&2; exit 1; }
command -v npm >/dev/null || { echo "npm is missing from the Node.js installation." >&2; exit 1; }
node -e 'if(Number(process.versions.node.split(".")[0])<22){console.error("Node.js 22 or newer is required.");process.exit(1)}'

hash_files() {
  node -e 'const fs=require("fs"),crypto=require("crypto");const h=crypto.createHash("sha256");for(const f of process.argv.slice(1))h.update(fs.readFileSync(f));process.stdout.write(h.digest("hex"))' "$@"
}

npm_install_if_needed() {
  local directory="$1"
  local marker="$directory/node_modules/.workshop-lockhash"
  local expected
  expected="$(hash_files "$directory/package-lock.json")"
  if [[ ! -f "$marker" ]] || [[ "$(<"$marker")" != "$expected" ]]; then
    echo "Installing pinned dependencies in ${directory#$ROOT/} …"
    (cd "$directory" && npm ci --legacy-peer-deps --ignore-scripts --no-audit --no-fund)
    printf '%s' "$expected" > "$marker"
  fi
}

yarn_bin() {
  HARDHAT_WORKSHOP_CACHE="$ROOT/tokenization/.cache/hardhat-nodejs" node "$ROOT/tokenization/.yarn/releases/yarn-4.13.0.cjs" "$@"
}

wait_rpc() {
  local url="$1"
  for ((i=0; i<90; i++)); do
    if node -e 'fetch(process.argv[1],{signal:AbortSignal.timeout(2000),method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_chainId",params:[]})}).then(r=>r.json()).then(v=>process.exit(v.result==="0x7a69"?0:1)).catch(()=>process.exit(1))' "$url"; then return 0; fi
    sleep 1
  done
  echo "$url did not become ready." >&2
  return 1
}

wait_url() {
  local url="$1"
  for ((i=0; i<120; i++)); do
    if node -e 'fetch(process.argv[1],{signal:AbortSignal.timeout(5000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))' "$url"; then return 0; fi
    sleep 1
  done
  echo "$url did not become ready." >&2
  return 1
}

check_port() {
  node --input-type=module -e 'import net from "node:net";const p=Number(process.argv[1]);const s=net.createServer();s.once("error",()=>{console.error(`Port ${p} is occupied.`);process.exit(1)});s.listen(p,"127.0.0.1",()=>s.close())' "$1"
}

open_browser() {
  [[ "$MODE" == --no-open ]] && return 0
  if [[ "$(uname -s)" == Darwin ]]; then open "$1" || true
  elif command -v xdg-open >/dev/null; then xdg-open "$1" >/dev/null 2>&1 || true
  fi
}

print_lock_wallet() {
  echo
  echo "MetaMask local network: http://127.0.0.1:8545 (chain ID 31337)"
  echo "Funded disposable account: $LOCK_ACCOUNT"
  echo "Private key to import: $LOCK_PRIVATE_KEY"
  echo "Balance on each fresh local chain: 1000 test ETH"
  echo
}

start_service() {
  node "$ROOT/scripts/run-service.mjs" "$@" &
  PIDS+=("$!")
}

PIDS=()
cleanup() {
  for pid in "${PIDS[@]:-}"; do kill "$pid" 2>/dev/null || true; done
  for pid in "${PIDS[@]:-}"; do wait "$pid" 2>/dev/null || true; done
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

run_lock() {
  npm_install_if_needed "$ROOT/lock"
  npm_install_if_needed "$ROOT/lock/webapp"
  if [[ "$MODE" == --test ]]; then
    (cd "$ROOT/lock" && npm test && npm run build)
    return
  fi
  check_port 8545
  check_port 3001
  local mnemonic
  mnemonic="$(cd "$ROOT" && node --input-type=module -e 'import { Wallet } from "./lock/node_modules/ethers/lib.esm/index.js"; process.stdout.write(Wallet.createRandom().mnemonic.phrase)')"
  export LOCK_MNEMONIC="$mnemonic"
  LOCK_ACCOUNT="$(cd "$ROOT" && node --input-type=module -e 'import { HDNodeWallet } from "./lock/node_modules/ethers/lib.esm/index.js"; process.stdout.write(HDNodeWallet.fromPhrase(process.env.LOCK_MNEMONIC).address)')"
  LOCK_PRIVATE_KEY="$(cd "$ROOT" && node --input-type=module -e 'import { HDNodeWallet } from "./lock/node_modules/ethers/lib.esm/index.js"; process.stdout.write(HDNodeWallet.fromPhrase(process.env.LOCK_MNEMONIC).privateKey)')"
  unset LOCK_MNEMONIC
  (cd "$ROOT/lock" && npm run prepare:artifact)
  start_service "$ROOT/lock" "$ROOT/lock/node_modules/.bin/ganache" --server.host 127.0.0.1 --server.port 8545 --chain.chainId 31337 --wallet.mnemonic "$mnemonic" --wallet.totalAccounts 10 --wallet.defaultBalance 1000 --logging.quiet
  wait_rpc http://127.0.0.1:8545
  BROWSER=none GENERATE_SOURCEMAP=false HOST=127.0.0.1 PORT=3001 start_service "$ROOT/lock/webapp" npm start
  wait_url http://127.0.0.1:3001
  echo "Lock dApp ready: http://127.0.0.1:3001"
  print_lock_wallet
  open_browser http://127.0.0.1:3001
  wait "${PIDS[${#PIDS[@]}-1]}"
}

run_election() {
  # Keep deployment and the API on this launcher's chain, even with an inherited RPC_URL.
  export RPC_URL=http://127.0.0.1:8546
  npm_install_if_needed "$ROOT/election"
  npm_install_if_needed "$ROOT/election/client"
  if [[ "$MODE" == --test ]]; then
    (cd "$ROOT/election" && npm test && npm run build)
    return
  fi
  check_port 8546
  check_port 4000
  check_port 3002
  start_service "$ROOT/election" "$ROOT/election/node_modules/.bin/ganache" --server.host 127.0.0.1 --server.port 8546 --chain.chainId 31337 --wallet.mnemonic "test test test test test test test test test test test junk" --wallet.totalAccounts 10 --wallet.defaultBalance 1000 --logging.quiet
  wait_rpc "$RPC_URL"
  (cd "$ROOT/election" && npm run deploy)
  PORT=4000 start_service "$ROOT/election" npm start
  wait_url http://127.0.0.1:4000/health
  BROWSER=none HOST=127.0.0.1 PORT=3002 start_service "$ROOT/election/client" npm start
  wait_url http://127.0.0.1:3002
  echo "Election dApp ready: http://127.0.0.1:3002"
  open_browser http://127.0.0.1:3002
  wait "${PIDS[${#PIDS[@]}-1]}"
}

run_tokenization() {
  local marker="$ROOT/tokenization/.yarn/.workshop-lockhash"
  local expected
  expected="$(hash_files "$ROOT/tokenization/yarn.lock")"
  if [[ ! -f "$marker" ]] || [[ "$(<"$marker")" != "$expected" ]]; then
    echo "Installing the pinned Scaffold-ETH 2 workspace …"
    (cd "$ROOT/tokenization" && HUSKY=0 yarn_bin install --immutable)
    printf '%s' "$expected" > "$marker"
  fi
  if [[ "$MODE" == --test ]]; then
    (cd "$ROOT/tokenization" && yarn_bin test && yarn_bin next:check-types)
    return
  fi
  check_port 8547
  check_port 3003
  HARDHAT_WORKSHOP_CACHE="$ROOT/tokenization/.cache/hardhat-nodejs" start_service "$ROOT/tokenization" node "$ROOT/tokenization/.yarn/releases/yarn-4.13.0.cjs" chain
  wait_rpc http://127.0.0.1:8547
  (cd "$ROOT/tokenization" && yarn_bin deploy)
  PORT=3003 start_service "$ROOT/tokenization" node "$ROOT/tokenization/.yarn/releases/yarn-4.13.0.cjs" start
  wait_url http://127.0.0.1:3003
  echo "Tokenization RPC: http://127.0.0.1:8547 (chain ID 31337); use burner wallet alongside Lock."
  echo "Scaffold-ETH Tokenization ready: http://127.0.0.1:3003/myNFTs"
  open_browser http://127.0.0.1:3003/myNFTs
  wait "${PIDS[${#PIDS[@]}-1]}"
}

case "$PROJECT" in
  lock) run_lock ;;
  election) run_election ;;
  tokenization) run_tokenization ;;
esac
