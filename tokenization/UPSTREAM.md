# Upstream record

- Repository: https://github.com/scaffold-eth/se-2-challenges
- Branch/extension: `challenge-tokenization`
- Commit inspected: `ecc5ac0a774fd0e7400babe800c01d6525a5b827`
- Generated with: `npx create-eth@2.0.23 ... -s hardhat -e challenge-tokenization`
- License: MIT, retained in `LICENCE`

Workshop-only adjustments:

- Added the root one-command launcher integration.
- Added `127.0.0.1` to the Next.js development origins used by the launcher.
- Added explicit TypeScript casts for `tokenId` and `tokenURI` in `MyHoldings.tsx` to satisfy the generated dependency versions.
- Added an optional launcher-only Hardhat cache path so the complete local stack writes inside the project directory.
- Added this source record and concise classroom guide.

The contracts, tests, application pages, Scaffold components, wallet stack, and learning content otherwise come from the official challenge.
