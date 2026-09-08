# Changes and verification

Verified locally on **2026-09-09**, macOS arm64, Node **26.0.0**. Recommended project runtime: Node 24 (also used by CI). Exact dependencies are recorded in each lockfile.

## Automated results

Command: `./test-all.sh` from the repository root, including a clean `npm ci --ignore-scripts` when lockfiles changed.

| Project | Node test count, including parent groups | Failed | Individual subtests |
|---|---:|---:|---:|
| Lock | 13 | 0 | 11 |
| Election | 20 | 0 | 18 |
| Crowdfunding | 19 | 0 | 17 |
| Total | 52 | 0 | 46 |

The six parent groups account for the difference between 52 reported tests and 46 individual test cases. The suite verifies real deployments and calls on Ganache, not mocked contract functions.

- **Lock:** exact wei precision, early withdrawal, owner authorization, normal expiry, early override, invalid input and deployment after an idle clock.
- **Election:** factory deployment, registration, candidate/constituency existence, cross-constituency rejection, duplicate votes, valid additional registration, exact deadline rejection, admin closure, and a reproduction against the unchanged upstream contract.
- **Crowdfunding:** zero/late contribution, exact deadline, owner restrictions, early settlement rejection, successful claim, failed-goal refund, isolated supporter credits and repeated settlement.
- **Every project:** HTML/state loading, unknown-action errors, cross-origin rejection and a confirmed deployment through its HTTP API.

Solc 0.8.30 compiles Lock and Crowdfunding for Shanghai. Election uses solc 0.4.25 to preserve the original API and schema. Ganache's JavaScript fallback warnings and the legacy compiler's asm.js warning do not prevent these tests from passing.

## Root launcher and browser verification

All three root scripts were started with `--no-open`, then their printed URLs were opened in the browser:

| Project | Browser observations |
|---|---|
| Lock, port 4181 | Early Withdraw rejected; Owner unlock confirmed; withdrawal confirmed with contract balance 0.0 ETH. |
| Election, port 4182 | Fresh factory/election seeded; Voter A's vote raised Candidate A tally to 1; repeat vote rejected; unregistered account rejected. |
| Crowdfunding, port 4183 | Two 0.5 ETH contributions reached target; after deadline owner claim emptied the contract and set claimed=true. Fresh campaign with 0.5 ETH refunded successfully after expiry. |

The frontend displays mined receipt status 1 for successful writes. The default launcher's automatic browser opening uses macOS `open` or Linux `xdg-open`; no wallet plugin is required. Servers bind only to 127.0.0.1. The root scripts refuse occupied ports rather than killing other processes.

## Source adaptations

| Original issue | Workshop change |
|---|---|
| Lock React uses millisecond dates for a second-based contract clock | Deployment computes a future timestamp from a refreshed local block. |
| Lock amount parsed through JavaScript integers | `parseEther` converts decimal ETH strings to exact bigint wei. |
| Receipt read immediately after transaction submission | Every write awaits a mined receipt before success and state refresh. |
| Mixed providers, hard-coded nonce/fees and fragile RPC error parsing | Independent local runtime uses the selected temporary account and structured revert reasons. |
| Election accepts unregistered voters | `voterExist[msg.sender]` check plus regression test. |
| Election permits cross-constituency voting | Explicit voter and candidate constituency checks. |
| Default mapping entry allows nonexistent candidate/district | Existence checks for both candidate and constituency. |
| Election deadline depends on admin close | `castVote` checks deadline directly, including an exact-boundary test. |
| Invalid registrations and ongoing registration after expiry | Nonzero/existence validation and active/deadline checks. |
| Original Windows-only commands and fragmented frontend/server setup | Root Bash launchers, pinned independent dependencies and pre-seeded local deployments. |

Upstream source is retained under `upstream/`. The default UI/runtime is a new classroom adaptation, not a claim that the original React UI's browser-wallet flow is unchanged or fully validated.

## PPT verification

The combined PPT has 24 slides: the unchanged original 15 plus 9 added Crowdfunding slides. Package validation passed. Original slide XML, slide relationships, images, notes, masters and layouts are compared byte-for-byte; `PPT-preservation.json` contains the source SHA-256 and hashes of 96 preserved package parts. Only slide/package enumeration metadata is extended, with equivalent custom XML copied under `ppt/` for compatibility.

The deck is rendered for visual inspection. No claim is made that it was opened in native PowerPoint. Original pedagogical inaccuracies are left in place as requested; presenter notes explain them. The 60-minute budget is a schedule, not a measured classroom rehearsal.

## Limits

Not verified: production deployment, real wallet signing, full dependency security audit, arbitrary malicious receiver contracts or exhaustive reentrancy behavior. Election remains a synthetic classroom poll with public data and admin registration, not a private or legally binding election system. Do not expose the demo servers or use actual funds.

## GitHub CI

The repository workflow runs the three projects independently on Ubuntu with Node 24. Its result is recorded in the repository's Actions tab. Local execution above is independent evidence and does not assume the CI result.
