# Sources and license boundaries

## Lock reference

- Repository: https://github.com/BlockchainCourseNTU/hello-dapp
- Commit: `1c1ca2286705574d29e1ec1068bf2817d944f621`
- Original path: `hello-dapp/contracts/Lock.sol`, `hello-dapp/webapp/`
- Copied reference: `lock/upstream/`
- Workshop adaptation: `lock/contracts/Lock.sol`

The contract carries `SPDX-License-Identifier: UNLICENSED`; its package metadata declares ISC. No standalone upstream license was found for this nested demo. This repository does not resolve that mismatch or grant broader redistribution rights. The repository is kept private for the owner's course preparation.

## Election reference

- Repository: https://github.com/schadokar/election-ethereum-react-dapp
- Commit: `14d44375056819f20296691c73adf642f54d6819`
- Reference: `election/upstream/`
- Adaptation: `election/contracts/Election.sol`
- License: MIT, copyright 2019 Shubham Chadokar; full text retained at `election/LICENSE`.

## Slides

Original supplied by the repository owner: **CE/CZ4153 Tutorial: dApp Development Workshop**, Zhang Chengxuan, dated 2025.9.10 in the source. Original slides include NTU branding and third-party images. Their existing notices and links remain unchanged. No new blanket license is asserted over the course material.

The combined PPT appends nine new teaching slides to the original fifteen. `docs/PPT-preservation.json` records the hash of the original file and preserved package parts. Metadata that enumerates slides/relationships/content types is extended. Original slide XML, slide relationships, images, notes, masters and layouts remain byte-identical. Equivalent custom XML is also copied under `ppt/` for package validation compatibility.

## New teaching code

Crowdfund and the independent local runtime, webpages, tests, launch scripts and new documentation were created for this workshop. Crowdfund is marked MIT. Other content in this private repository has no additional blanket licensing grant. npm dependencies retain their own licenses; no node_modules or private keys are committed.
