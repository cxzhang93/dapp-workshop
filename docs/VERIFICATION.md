# Changes and verification

The original workshop was verified locally on 2026-09-09 on macOS arm64. The supported classroom and CI runtime is Node 24; the local checks also passed with Node 26.0.0.

## Automated checks

| Project | Checks |
|---|---|
| Lock | Original contract compiled with solc 0.8.9; deployment, owner unlock and withdrawal passed; original React production build completed. |
| Election | Solidity 0.4.25 factory compiled and deployed; election creation and factory listing passed; original React production build completed. |
| Tokenization | Official Hardhat deployment, minting and enumeration tests passed; Next.js TypeScript check passed. |

Run all checks with `./test-all.sh`. GitHub Actions runs the three project jobs plus a concurrent-runtime job on Ubuntu and Node 24.

## RPC isolation regression checks

Verified on 2026-09-26 on macOS arm64 / Node 24.19.0: `./test-all.sh` passed (three runtime regressions, both Ganache contract tests and React builds, three Hardhat tests and Next.js TypeScript checking). `node --test test/concurrent.test.mjs` passed in approximately 65 seconds, including concurrent startup, transaction isolation, HTTP/WS routing, shutdown and all three standalone restarts.

`./test-all.sh` now also runs `test/runtime.test.mjs`: RPC configuration consistency and service-supervisor exit/descendant cleanup checks.

After dependencies are installed, run `node --test test/concurrent.test.mjs` with ports 3001–3003, 4000 and 8545–8547 free. It launches the real services with `--no-open` and checks:

- All three frontends and chains respond concurrently at their assigned ports.
- Transactions affect only the intended chain; the Election API creates an election on 8546 even when the caller exports a stale `RPC_URL` pointing to 8545.
- Tokenization's shared chain configuration routes default HTTP wallet/faucet and WebSocket explorer requests to 8547.
- A duplicate launcher refuses an occupied RPC port without killing the running demo.
- Stopping Tokenization releases its ports while Lock and Election continue, and its default RPC transport fails instead of reading Lock's chain.
- SIGINT stops Lock without affecting Election; all ports are released on shutdown.
- Each demo then starts and stops alone, and Lock generates a new account on restart.

Integration logs are written under `.tmp/` and uploaded by the concurrent-runtime CI job on failure. Do not run this test concurrently with contract tests that rewrite deployment artifacts/receipts in the same checkout. The actual MetaMask extension still needs manual confirmation; this suite tests RPC isolation and service lifecycle, not extension popup behavior. See the [shared chain-ID limitation](../README.md#tokenization-wallets-and-the-shared-chain-id-limitation).

## One-command runtime and browser checks

| Project | Observed result |
|---|---|
| Lock | Launcher started Ganache and the original React app. An EIP-1193 browser provider connected, deployed the contract, executed owner unlock, withdrew the balance, and refreshed the UI. |
| Election | Launcher deployed the factory and started Express plus the original React app. The browser created “Workshop Demo Election,” opened its detail route, and displayed the original constituency workflow. |
| Tokenization | Launcher started Hardhat, deployed `YourCollectible`, and opened the official Scaffold-ETH 2 My NFTs page with wallet, holdings, transfers, IPFS, and Debug Contracts navigation. |

The Lock browser automation used a local EIP-1193 provider that implements the same request interface used by MetaMask. A real MetaMask extension requires manual confirmation clicks; that popup interaction remains a presenter pre-class check. Contract execution and the browser/provider path passed.

## Source preservation and changes

Projects 1 and 2 were rebuilt from captured upstream source rather than the earlier uniform workshop UI.

- Lock keeps the original React presentation and browser-wallet model. Compatibility fixes correct millisecond/second conversion, use exact wei strings, switch or add the local network, wait for receipts, refresh state, and compile the artifact locally.
- Election keeps the original React routes/forms, Express API, and Solidity contract. Compatibility fixes pin the runtime, correct a filename case mismatch, automate factory deployment, add a health endpoint, and package Semantic UI CSS locally instead of loading a broken browser runtime from a CDN.
- Tokenization comes from the official Scaffold-ETH 2 challenge. The workshop adds launcher integration, one development-origin setting, documentation, and two narrow TypeScript casts.

## PowerPoint verification

The delivered deck contains 26 slides: the supplied 15 slides followed by 11 workshop slides. The added section explains the 60-minute schedule, three signing paths, Lock and Election frontend/backend boundaries, the official Tokenization source, mint/transfer evidence, and one-command startup.

The final deck was rendered slide by slide, inspected for clipping and overlap, and passed the presentation package validator. `PPT-preservation.json` records both file hashes, the exact ordered-text comparison for original slides 1–15, and the visual inspection scope. Importing and exporting the source changes PowerPoint package metadata, so preservation is asserted at the slide-content and rendered-content level rather than as a byte-identical package. The timing is a teaching plan rather than a measured classroom rehearsal.

## Limits

- Manual MetaMask extension prompts remain a pre-class verification item because browser automation cannot approve the presenter's extension popup.
- Optional IPFS upload and public testnet deployment were not part of the local one-hour path.
- No production deployment, contract security audit, accessibility audit, or dependency vulnerability remediation was performed.
- Election is an educational public-data poll with server-signed actions, not a secret or legally binding election system.
