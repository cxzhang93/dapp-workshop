# Changes and verification

Verified locally on 2026-09-09 on macOS arm64. The supported classroom and CI runtime is Node 24; the local checks also passed with Node 26.0.0.

## Automated checks

| Project | Checks |
|---|---|
| Lock | Original contract compiled with solc 0.8.9; deployment, owner unlock and withdrawal passed; original React production build completed. |
| Election | Solidity 0.4.25 factory compiled and deployed; election creation and factory listing passed; original React production build completed. |
| Tokenization | Official Hardhat deployment, minting and enumeration tests passed; Next.js TypeScript check passed. |

Run all checks with `./test-all.sh`. GitHub Actions runs the same three jobs independently on Ubuntu and Node 24.

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
