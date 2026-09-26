# dApp workshop: Lock, Election and Tokenization

[Workshop slides](docs/dApp-workshop-original-plus-tokenization.pptx) · [Architecture](docs/ARCHITECTURE.md) · [Verification](docs/VERIFICATION.md)

## One-command startup

Install Node.js 24, then double-click a `.command` file on macOS or run it in Terminal:

```bash
./run-lock.command
./run-election.command
./run-tokenization.command
```

Each launcher installs pinned dependencies on its first run, starts a fresh local chain, deploys the contract, starts every required server, and opens its fixed frontend address:

| Project | Frontend URL | JSON-RPC URL | Chain ID | Other ports |
|---|---|---|---|---|
| Lock | `http://127.0.0.1:3001` | `http://127.0.0.1:8545` | 31337 | — |
| Election | `http://127.0.0.1:3002` | `http://127.0.0.1:8546` | 31337 | Express 4000 |
| Tokenization | `http://127.0.0.1:3003/myNFTs` | `http://127.0.0.1:8547` | 31337 | WebSocket also 8547 |

All three demos can run simultaneously: run each command in its own terminal (or double-click all three launchers). Starting only one demo uses exactly the same command, ports and workflow. Ctrl+C stops only that launcher's services; the other demos keep running. Each demo has independent balances, contracts and chain state, even though their chain IDs are the same. Election and Tokenization reuse standard development keys, so identical addresses do not imply shared state.

| Project | Frontend and transaction path | Classroom focus |
|---|---|---|
| [Lock](lock/WORKSHOP.md) | Original React UI → MetaMask/browser wallet → Ganache → `Lock.sol` | Wallet connection, user signatures, timestamps and contract balance |
| [Election](election/WORKSHOP.md) | Original React UI → Express API → server Web3 account → Ganache → factory/election contracts | Frontend/backend separation and the trust cost of server-signed transactions |
| [Tokenization](tokenization/WORKSHOP.md) | Official Scaffold-ETH Next.js UI → burner wallet or MetaMask → Hardhat → ERC-721 | Minting, metadata, ownership, transfers and events |

The first run needs internet for dependency installation. The Tokenization page can run locally after installation; its optional IPFS upload exercises still need internet.

## Lock and MetaMask setup

The Lock launcher generates a fresh disposable development account on every run and prints its private key after the frontend is ready. You must import the newly printed account into MetaMask after each restart. In MetaMask:

1. Add a network named `Localhost 8545` with RPC URL `http://127.0.0.1:8545`, chain ID `31337`, and currency symbol `ETH`.
2. Import the newly printed account. Its key is valid only for this local chain session and controls local test ETH.
3. Open `http://127.0.0.1:3001`, connect the wallet, choose a future UTC unlock time and deploy.
4. Confirm deployment, unlock, and withdrawal in MetaMask. The page refreshes the contract balance after each confirmed transaction.

Never send real assets to the disposable development address or reuse its private key outside this local chain session.

## Tokenization wallets and the shared chain-ID limitation

Use Lock with MetaMask on `http://127.0.0.1:8545` and Tokenization with its local burner wallet on `http://127.0.0.1:8547` when demonstrating them together. Election signs on the server and needs no MetaMask configuration.

For Tokenization alone, MetaMask must use RPC URL `http://127.0.0.1:8547`, chain ID `31337`, currency `ETH` (name it `Tokenization Local`). Fund that account using the Tokenization faucet. Its HTTP clients, faucet, burner wallet and block explorer all use 8547.

**Compatibility limit:** these independent chains retain ID 31337 to preserve Lock's existing saved MetaMask network and Scaffold-ETH's local-only burner wallet, faucet, explorer and generated deployment lookup. Unique chain IDs are possible, but require a separate network-configuration migration (including existing wallet settings); this change deliberately preserves those IDs. Wallet switching uses the chain ID ([EIP-3326](https://eips.ethereum.org/EIPS/eip-3326)), so `wallet_switchEthereumChain` cannot distinguish Lock from Tokenization or correct an already-saved RPC endpoint with the same ID. A successful network switch does not prove the wallet is on the correct demo. Do not assume two differently named MetaMask networks solve this.

To use MetaMask with both demos, use separate browser profiles with separately configured extensions, or manually change the saved 31337 RPC URL when switching demos and reload the page. Verify the URL before approving transactions. If a fresh chain or endpoint switch leaves stale nonces, clear MetaMask activity/nonce data for the disposable local account. The launcher cannot safely rewrite extension settings or isolate one shared MetaMask connection across tabs. Existing Lock setup at 8545 is unchanged; existing Tokenization settings must move from 8545 to 8547.

## Stop, reset and test

Press Ctrl+C in the launcher terminal to stop its frontend, backend, and chain. Restarting creates a clean local chain.

```bash
./run-lock.command --no-open       # start without opening a browser
./run-election.command --test      # contract test and frontend build
./run-tokenization.command --test  # official contract tests and TypeScript check
./test-all.sh                      # unit/config checks and all three project checks
node --test test/concurrent.test.mjs # live concurrent/standalone launch and isolation checks
```

The scripts require Node 22 or newer; Node 24 is the supported classroom and CI version. Native Windows users can run them in WSL.

## Repository layout

```text
run-lock.command            Lock one-command launcher
run-election.command        Election one-command launcher
run-tokenization.command    Tokenization one-command launcher
launch.sh                   Shared installation, startup and cleanup logic
test-all.sh                 All project checks
lock/                       Original Lock source and frontend, plus runtime fixes
election/                   Original Election source, frontend and Express backend
tokenization/               Official Scaffold-ETH 2 Tokenization challenge
docs/                       Slides, presenter notes, architecture and verification
```

The workshop-specific changes focus on reproducible local startup and compatibility. They do not replace the original user interfaces. Source commits and license boundaries are recorded in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## Troubleshooting

| Symptom | Fix |
|---|---|
| Port 3001, 3002, 3003, 4000, 8545, 8546 or 8547 is occupied | Stop the process using that port. The scripts do not kill unrelated processes. |
| MetaMask shows the wrong network | Check the RPC URL, not just chain ID 31337: Lock 8545, Tokenization 8547. See the shared chain-ID limitation above. |
| MetaMask account has no local ETH | Import the key printed by the Lock launcher. |
| Browser does not open | Visit the project URL printed by its launcher. |
| Dependency installation fails | Check network access, then rerun the same launcher. |
| Ganache prints a native binding warning | Its JavaScript fallback works; use Node 24 for the supported setup. |
| Election prints an asm.js warning | The upstream contract uses the legacy Solidity 0.4.25 compiler; the test verifies compilation and deployment. |

These projects use disposable local chains and classroom data. They are not audited production applications.
