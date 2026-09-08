# dApp workshop: Lock, Election and Crowdfunding

Three self-contained teaching projects and an English slide deck. The PPT keeps **all 15 original slides unchanged** and appends **9 Crowdfunding slides**, with a 60-minute teaching schedule.

[中文快速开始](README.zh-CN.md) · [Slides](docs/dApp-workshop-original-plus-crowdfunding.pptx) · [Presenter guide](docs/PRESENTER-GUIDE.md) · [Changes and verification](docs/VERIFICATION.md)

## Start a project

Install **Node.js 24** (Node 20+ required) with npm. On macOS, double-click a `.command` file in the repository root, or run it in Terminal:

```bash
./run-lock.command
./run-election.command
./run-crowdfunding.command
```

| Project | Local URL | What the script starts |
|---|---|---|
| [Lock](lock/README.md) | http://127.0.0.1:4181 | Local chain, compiled Lock, funded deployment, interactive page |
| [Election](election/README.md) | http://127.0.0.1:4182 | Local chain, factory and election, synthetic voters/candidates, interactive page |
| [Crowdfunding](crowdfunding/README.md) | http://127.0.0.1:4183 | Local chain, campaign with a 1 ETH target, interactive page |

The first run installs pinned dependencies and needs internet. Subsequent runs reuse them unless the lockfile changed. All compilers are npm dependencies, so compilation does not fetch remote compiler binaries. Wait for `READY` and use the printed **127.0.0.1** URL. The browser opens automatically; the three projects can run simultaneously.

The scripts generate disposable accounts and local ETH. **No MetaMask, seed phrase, RPC account, API key, public testnet or real funds are needed.** The webpage selects a local account; the server signs that account's transactions. This is a classroom interface to a real local EVM, not a verified browser-wallet flow. It is intentionally a new workshop UI; original UI sources are retained under `lock/upstream/legacy-ui` and `election/upstream/legacy-ui` for reference.

## Stop, reset and test

- Press **Ctrl+C** in a project's terminal to stop its server and chain.
- Restart its script for a fresh chain and new accounts. All local state is temporary.
- The deploy/new-campaign buttons create a fresh contract instance on the current chain. Previous instances remain until restart.
- Do not close the terminal while presenting.

```bash
# Keep the browser closed, useful on a remote machine or in CI.
./run-lock.command --no-open

# A different port. The script prints and opens the matching URL.
PORT=4191 ./run-lock.command

# Run one project's contract and HTTP tests.
./run-election.command --test

# Run all projects, stopping on the first failure.
./test-all.sh
```

The `.command` files are Bash scripts and also run from a Linux shell. On Windows, use WSL with Node installed inside WSL. Native Windows double-click is not provided. macOS and the Node versions actually exercised are listed in [verification](docs/VERIFICATION.md); CI checks Linux with Node 24.

## Repository layout

```text
run-lock.command              One-command Lock launcher
run-election.command          One-command Election launcher
run-crowdfunding.command      One-command Crowdfunding launcher
launch.sh                     Dependency install, startup, browser and cleanup
test-all.sh                  All contract and HTTP tests
lock/                         Contract, local runtime, UI, tests, upstream reference
election/                    Patched Election and factory, UI, tests, upstream reference
crowdfunding/                 New contract, local runtime, UI and tests
docs/                         PPT, presenter guide, verification and attribution
```

Each project has its own `package.json`, `package-lock.json`, `contracts/`, `public/`, runtime and tests. Copying one project folder is enough to run `npm ci --ignore-scripts && npm start` inside it. The small runtime and UI shell are copied into each folder intentionally to keep the examples independent.

## Demo paths

1. **Lock:** try an early withdrawal, use the owner override, then withdraw. Try the same override from another account and inspect the revert.
2. **Election:** Voter A votes for Candidate A in district 1. Repeat the vote or select an unregistered voter to see contract validation. Advance time and verify the deadline, then close as admin.
3. **Crowdfunding:** contribute twice, advance time and claim as owner. On a fresh campaign, contribute only once, advance time and refund as supporter.

Every successful write waits for a mined receipt. The page shows the transaction hash, block number, receipt status and gas used. Rejected calls appear as readable errors without treating a transaction hash as success.

## Improvements and scope

- Lock keeps the original owner override policy; the new UI uses exact ETH-to-wei conversion, fresh state reads and confirmation handling.
- Election adds voter/candidate/constituency existence checks, constituency matching, deadline enforcement and registration validation. The original vulnerable source remains in `election/upstream/election.sol`, with a regression test that reproduces its unregistered-voter bug.
- Crowdfunding tests the success and refund branches, authorization and repeated settlement.
- All demo servers bind to loopback, validate the Host/Origin, and expose a small set of teaching actions. Do not expose them to the internet or use real funds.
- Synthetic election names/contact values are test fixtures. The legacy schema stores data publicly and does not provide secret ballots.
- Original slides are preserved even where they contain oversimplifications. The presenter guide explains those points and the updated code behavior.

These are teaching implementations, not production-audited systems. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for source commits and license boundaries.

## Troubleshooting

| Symptom | What to do |
|---|---|
| `node` or `npm` not found | Install Node 24, reopen Terminal, then rerun. With nvm: `nvm install` and `nvm use` in this repository. |
| Port occupied | Stop the existing project terminal, or use `PORT=4191 ./run-lock.command`. The script does not kill unrelated processes. |
| Browser did not open | Paste the printed `http://127.0.0.1:PORT` URL into your browser. |
| `Use the printed 127.0.0.1 URL` | Use 127.0.0.1 instead of localhost. Host checking is intentional. |
| Dependency download failed | Check network access and rerun. You need internet only for installation. |
| Native µWS/bigint binding warning | Ganache falls back to JavaScript on newer Node releases; inspect READY and test results. Node 24 is the preferred runtime. |
| `Invalid asm.js` warning in Election | This comes from the legacy 0.4.25 compiler. Compilation is checked; tests verify actual behavior. |
| Deadline already passed | Create a fresh lock/election/campaign. Local time also advances with elapsed real time. |
| Vote rejected | Check account role, registration, constituency, candidate and whether the account has voted already. |
| Permission denied after copying files | `chmod +x *.command launch.sh test-all.sh`. Git preserves executable bits when cloned normally. |

The lockfiles mark Ganache's bundled macOS-only `fsevents` entry optional so Linux installation can skip it. Keep the committed lockfiles for reproducibility.
