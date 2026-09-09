# dApp workshop: Lock, Election and Tokenization

This repository contains three runnable teaching projects and an English PowerPoint for a 60-minute blockchain course session. Projects 1 and 2 start from their original upstream source and keep their original frontends. Project 3 is the official Scaffold-ETH 2 Tokenization challenge.

[中文快速开始](README.zh-CN.md) · [Workshop slides](docs/dApp-workshop-original-plus-tokenization.pptx) · [Presenter guide](docs/PRESENTER-GUIDE.md) · [Architecture](docs/ARCHITECTURE.md) · [Verification](docs/VERIFICATION.md)

## One-command startup

Install Node.js 24, then double-click a `.command` file on macOS or run it in Terminal:

```bash
./run-lock.command
./run-election.command
./run-tokenization.command
```

Each launcher installs pinned dependencies on its first run, starts a fresh local chain, deploys the contract, starts every required server, and opens the original or official frontend at `http://127.0.0.1:3000`. Run one project at a time because all three use ports 3000 and 8545.

| Project | Frontend and transaction path | Classroom focus |
|---|---|---|
| [Lock](lock/WORKSHOP.md) | Original React UI → MetaMask/browser wallet → Ganache → `Lock.sol` | Wallet connection, user signatures, timestamps and contract balance |
| [Election](election/WORKSHOP.md) | Original React UI → Express API → server Web3 account → Ganache → factory/election contracts | Frontend/backend separation and the trust cost of server-signed transactions |
| [Tokenization](tokenization/WORKSHOP.md) | Official Scaffold-ETH Next.js UI → burner wallet or MetaMask → Hardhat → ERC-721 | Minting, metadata, ownership, transfers and events |

The first run needs internet for dependency installation. The Tokenization page can run locally after installation; its optional IPFS upload exercises still need internet.

## Lock and MetaMask setup

The Lock launcher prints the disposable development private key. In MetaMask:

1. Add a network named `Localhost 8545` with RPC URL `http://127.0.0.1:8545`, chain ID `31337`, and currency symbol `ETH`.
2. Import the printed account. It is the standard public Hardhat development key and only controls local test ETH.
3. Open `http://127.0.0.1:3000`, connect the wallet, choose a future UTC unlock time and deploy.
4. Confirm deployment, unlock, and withdrawal in MetaMask. The page refreshes the contract balance after each confirmed transaction.

Never send real assets to the disposable development address or reuse its private key outside a local chain.

## Stop, reset and test

Press Ctrl+C in the launcher terminal to stop its frontend, backend, and chain. Restarting creates a clean local chain.

```bash
./run-lock.command --no-open       # start without opening a browser
./run-election.command --test      # contract test and frontend build
./run-tokenization.command --test  # official contract tests and TypeScript check
./test-all.sh                      # verify all three projects
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

## Suggested live demos

- **Lock:** connect MetaMask, deploy with a short future deadline, inspect the contract balance, unlock as owner, and withdraw. Ask students which actions create wallet confirmations.
- **Election:** create an election through the original form, open its address, and add a constituency. Trace one request from React to Express and then to the factory contract.
- **Tokenization:** use the local burner wallet or MetaMask, mint an NFT, open an incognito window for a second address, transfer the token, and verify `ownerOf` plus the `Transfer` event.

Detailed speaking cues and fallback steps are in [docs/PRESENTER-GUIDE.md](docs/PRESENTER-GUIDE.md).

## Troubleshooting

| Symptom | Fix |
|---|---|
| Port 3000, 4000 or 8545 is occupied | Stop the other workshop launcher. The scripts do not kill unrelated processes. |
| MetaMask shows the wrong network | Switch to chain ID 31337 and reload the Lock page. |
| MetaMask account has no local ETH | Import the key printed by the Lock launcher. |
| Browser does not open | Visit the printed `http://127.0.0.1:3000` URL manually. |
| Dependency installation fails | Check network access, then rerun the same launcher. |
| Ganache prints a native binding warning | Its JavaScript fallback works; use Node 24 for the supported setup. |
| Election prints an asm.js warning | The upstream contract uses the legacy Solidity 0.4.25 compiler; the test verifies compilation and deployment. |

These projects use disposable local chains and classroom data. They are not audited production applications.
