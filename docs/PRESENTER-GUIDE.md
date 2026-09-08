# Presenter guide: 60-minute dApp workshop

**Slides 1–15 are the unchanged original deck. Slides 16–24 are the added Crowdfunding section.** All slide copy is English. Original section: 35 minutes. Added section: 25 minutes. Installation and environment setup happen before class.

## Before the session

1. Install Node 24 and run `./test-all.sh` from the repository root.
2. Launch each project once so dependency downloads finish. Close each with Ctrl+C afterward.
3. Reopen the required demo immediately before its walkthrough. Long-idle campaigns can expire.
4. Keep this guide, the three source folders and terminal output available. Screenshare the instructor browser if students cannot finish setup.

All example currency is disposable local ETH. Browser-wallet integration is not required for this session. Each project has its own chain. The one-command scripts are the demonstration path; `upstream/legacy-ui` is only a source reference.

## Timeline

| Slides | Segment | Minutes | Clock |
|---|---|---:|---|
| 1–5 | dApp fundamentals | 10 | 00–10 |
| 6–11 | Lock | 12 | 10–22 |
| 12–15 | Election | 13 | 22–35 |
| 16–24 | Crowdfunding, exercise and questions | 25 | 35–60 |

## Slide-by-slide notes

### 1. CE/CZ4153 Tutorial (1 min, 00–01)

Introduce the workshop and tell students the original deck is preserved. Today uses three locally runnable projects.

### 2. What is dApp? (2 min, 01–03)

Define frontend, wallet/provider and smart contract. Ask which part stores the shared state.

### 3. Reliable Service (2 min, 03–05)

Retain the historical slide text. Verbally qualify its absolute reliability claim: chain liveness does not guarantee frontend or RPC availability. Do not present the no-crash statement as an established universal fact.

### 4. New Opportunities (2 min, 05–07)

Use the original illustration to discuss shared state and value transfer. Avoid spending time on every item in the ecosystem image.

### 5. How to develop a dApp? (3 min, 07–10)

Explain UI, contract, RPC and account roles. Reads simulate without submitting a transaction; writes require confirmation. The local classroom server signs on behalf of the selected disposable account.

### 6. Lock dApp (2 min, 10–12)

Explain the original owner override. This is a chosen policy, not irreversible vesting.

### 7. Lock code overview (1 min, 12–13)

Open lock/contracts/Lock.sol next to the slide. Point to state variables and constructor.

### 8. Lock version and imports (2 min, 13–15)

The original screenshot remains unchanged. The runnable version removes the unused Hardhat console import and compiles with pinned solc 0.8.30, satisfying the original pragma.

### 9. Lock constructor and conditions (2 min, 15–17)

Discuss msg.sender, block.timestamp in seconds, and the future-deadline check.

### 10. Lock withdrawal (2 min, 17–19)

Explain the caller and timestamp checks plus the event. The original transfer policy is retained. Ask whether another account can unlock.

### 11. Run Lock (3 min, 19–22)

Run ./run-lock.command. Try early Withdraw, then Owner unlock and Withdraw. Show receipt status 1 and balance zero. Dependency installation is already complete before class.

### 12. Vote dApp (3 min, 22–25)

Explain the intended registration and constituency rules. The upstream original omits several checks; the classroom version repairs them.

### 13. Election Factory (2 min, 25–27)

Explain the factory and per-election addresses. The workshop starts a factory and creates a seeded Election.

### 14. Election structures and methods (4 min, 27–31)

Use election/contracts/Election.sol to locate registrations and castVote. Show the added existence, constituency and deadline checks. The original diagram and API spelling remain intact in the slide.

### 15. Run Election (4 min, 31–35)

Run ./run-election.command. Account 3 votes for candidate 1 in constituency 1. Repeat to show a revert. Account 5 is unregistered and must fail. If time permits, advance the local clock and close as admin.

### 16. Third project: Crowdfunding (2 min, 35–37)

New teaching implementation: crowdfunding/contracts/Crowdfund.sol. Explain how this extends the Lock example to multiple participants and two settlement outcomes.

### 17. Campaign lifecycle (3 min, 37–40)

The local test clock allows a ten-minute campaign to finish during the workshop. Production users cannot advance block time. Raised is cumulative and remains unchanged after refunds.

### 18. Claim and refund conditions (3 min, 40–43)

Show the actual source in crowdfunding/contracts/Crowdfund.sol. State changes occur before external calls. A failed transfer reverts the whole transaction. Discuss repeated settlement and why success/refund branches are exclusive.

### 19. One-command local setup (2 min, 43–45)

Use the printed http://127.0.0.1 URL, not the localhost hostname. On macOS double-click the .command file or run it from Terminal. Node.js 20+ is required, Node 24 recommended. First install is pre-work. Each project has an isolated local chain, compiled contracts and a webpage. Default mode signs using disposable local accounts.

### 20. Live demo: successful campaign (5 min, 45–50)

Script: ./run-crowdfunding.command. On the webpage, the default campaign is already deployed. Select account 1, Contribute twice. Advance past deadline. Select account 0. Owner claims. Point out the confirmed transaction hash and status 1.

### 21. Live demo: failed campaign (4 min, 50–54)

Select Owner for the failed claim attempt, then Supporter A for the refund. A repeat refund should fail with Nothing to refund. State inspection uses fresh chain reads after every confirmation.

### 22. Failure cases to predict (2 min, 54–56)

Ask students to predict which require rejects each action. Run ./run-crowdfunding.command --test to execute the assertions. Negative cases are part of a successful demonstration.

### 23. Student exercise (2 min, 56–58)

Expected result: A record becomes zero and B record stays unchanged until B refunds. Automated tests already contain this scenario as a reference. Allow students to explain the invariant before showing the test.

### 24. Project notes and questions (2 min, 58–60)

Original slides describe intended behavior. The checked-in workshop Election fixes voter registration, candidate existence, constituency and deadline checks. The upstream original stays under election/upstream. Clarify the old reliability claim: frontends and RPC services can fail even when the chain is live. Total: original section 35 minutes, this section 25 minutes.

## If a live demo stalls

Use the relevant `--test` command and show the expected assertions. Keep the explanation of account, state and receipt, then move on at the next segment boundary. The failed-call examples count as successful demonstrations of contract guards. Reserve the final two minutes for questions.

## Original-content preservation

The package comparison verifies all original slide XML, slide relationships, images, notes, masters and layouts byte-for-byte. Only metadata that enumerates slides and package parts changes, with added compatible custom-XML references. The original PPT is also included for comparison. See `PPT-preservation.json`.
