# Election

Start with `./run-election.command` from the root, or `npm ci --ignore-scripts` and `npm start` in this folder. Default URL: http://127.0.0.1:4182. Tests: `npm test`.

Startup deploys an ElectionFactory, creates an election, adds two districts, two candidates and two voters. The webpage is ready after these transactions confirm. The default election lasts 10 minutes of chain time.

| Account | Initial role | Constituency |
|---|---|---|
| 0 | Admin | — |
| 1 | Candidate A | 1 |
| 2 | Candidate B | 2 |
| 3 | Voter A | 1 |
| 4 | Voter B | 2 |
| 5 | Unregistered account | — |

## Live walkthrough

1. Select **3: Voter A**, constituency `1`, candidate index `1`. Click **Cast vote**. Candidate A votes becomes `1` and Voter A voted becomes `true`.
2. Repeat the action. Expected: duplicate-vote error.
3. Select **5: Unregistered** and vote. Expected: `Voter not registered`.
4. Select **4: Voter B**, leave constituency/candidate as `1`. Expected: `Wrong voter constituency`.
5. Change constituency and candidate to `2`. Vote succeeds for Candidate B.
6. Click **Create seeded election** for a fresh instance. Click **Advance past deadline**, then attempt a vote. It fails even though Active flag is still true. The timestamp check enforces expiry independently of admin closure.
7. Select **0: Admin** and click **Close election**. Active flag becomes false.

Optional registration: before the deadline, select Admin, voter index `5`, constituency `1`, then **Register voter**. Account 5 can then cast one vote. The account menu label reflects the initial fixture role and does not change after registration; the contract enforces the updated role.

## Repairs relative to upstream

`contracts/Election.sol` retains the original factory, structs and API spellings (`Consituency` in the source), using solc 0.4.25 for teaching compatibility. It adds:

- Registered voter, candidate and constituency existence checks.
- Both voter and candidate constituency matching.
- `now < electionDuration` inside `castVote`.
- Valid nonzero registration targets and existing constituencies.
- Registration closed at expiry and after closure.
- Positive, bounded election duration.
- Public deadline/status getters for the UI and a consistent deadline boundary for closure.

The original source is preserved at `upstream/election.sol`. One regression test deploys that reference and demonstrates that an unregistered voter can vote there; the corrected contract rejects it. The old React and Express application sources remain under `upstream/`, while `public/`, `project.mjs` and `runtime.mjs` implement the independently runnable workshop version.

Original: [schadokar/election-ethereum-react-dapp](https://github.com/schadokar/election-ethereum-react-dapp), commit `14d44375056819f20296691c73adf642f54d6819`. MIT license retained in `LICENSE`.

The schema still contains names, email and phone strings, populated only with synthetic fixtures. This is not private voting, proof of unique human identity or production election infrastructure. The old compiler remains an explicit compatibility choice, with a future Solidity 0.8 migration left as coursework.
