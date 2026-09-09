# Sources and license boundaries

## Project 1: Lock

- Repository: https://github.com/BlockchainCourseNTU/hello-dapp
- Source commit: `1c1ca2286705574d29e1ec1068bf2817d944f621`
- Imported paths: `hello-dapp/contracts/Lock.sol` and `hello-dapp/webapp/`
- Workshop folder: `lock/`

The contract declares `SPDX-License-Identifier: UNLICENSED`; the nested package metadata declares ISC. No standalone upstream license was present in the captured source. This private course repository does not grant additional redistribution rights. The workshop retains the upstream React layout and interaction model and adds local compilation, pinned dependencies, EIP-1193 wallet compatibility, confirmation handling, and one-command startup.

## Project 2: Election

- Repository: https://github.com/schadokar/election-ethereum-react-dapp
- Source commit: `14d44375056819f20296691c73adf642f54d6819`
- Workshop folder: `election/`
- License: MIT, copyright 2019 Shubham Chadokar

The upstream license remains at `election/LICENSE`. The workshop retains the original React frontend, Express routes, and Solidity contract. Compatibility changes pin dependencies, compile the correctly cased source path, serve Semantic UI CSS locally, add a health endpoint, and automate local factory deployment.

## Project 3: Scaffold-ETH 2 Tokenization

- Challenge repository: https://github.com/scaffold-eth/se-2-challenges
- Challenge branch: `challenge-tokenization`
- Source commit: `ecc5ac0a774fd0e7400babe800c01d6525a5b827`
- Generator: `create-eth@2.0.23`, extension `challenge-tokenization`
- Workshop folder: `tokenization/`
- License: MIT, BuidlGuidl; retained at `tokenization/LICENCE`

This project is a public teaching challenge maintained by the Scaffold-ETH community. The workshop copy preserves its Next.js application, Hardhat contracts, RainbowKit/wagmi wallet layer, tests, NFT pages, and IPFS exercises. Local changes add two TypeScript annotations required by the current dependency graph, allow the 127.0.0.1 development origin, and connect it to the root launcher.

## Slides

The repository owner supplied **CE/CZ4153 Tutorial: dApp Development Workshop**, Zhang Chengxuan, dated 2025.9.10 in the source. The new workshop deck keeps its first 15 slides and adds slides that explain the three transaction paths, the third-party Tokenization project, demo steps, local startup, and the 60-minute schedule. Existing NTU branding, links, images, and notices remain with the original content. No blanket license is asserted over the course material.

npm and Yarn dependencies retain their own licenses. Generated dependency folders, wallet secrets, and real private keys are excluded from version control.
