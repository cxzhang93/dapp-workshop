# Crowdfunding

Start with `./run-crowdfunding.command` from the root, or `npm ci --ignore-scripts` and `npm start` in this folder. Default URL: http://127.0.0.1:4183. Tests: `npm test`.

This new teaching project extends the Lock example to multiple participants and two settlement branches. Startup deploys a campaign owned by account 0 with a 1 ETH goal and 600-second duration.

## Success path

1. Select **1: Supporter A**.
2. Click **Contribute** twice at the default amount of 0.5 ETH. Raised and Balance become 1.0 ETH.
3. **Advance past deadline**.
4. Select **0: Owner** and click **Owner claims**.
5. Expected: Balance `0.0`, Claimed `true`, mined receipt status `1`.

## Refund path

1. **New campaign** deploys a fresh instance using the goal and duration fields.
2. Select **Supporter A**, contribute 0.5 ETH once, and advance past deadline.
3. Select Owner and try **Owner claims**. It fails because the target was missed.
4. Select Supporter A and click **Supporter refunds**. Balance and A's contribution record become zero.
5. Repeat the refund. Expected: `Nothing to refund`.

Exercise: fund from both A and B. After a failed campaign, refund A and verify that B's contribution remains. Refund B separately.

## Contract rules

- `contribute`: positive ETH and strictly before deadline.
- `claim`: owner only, at/after deadline, target reached, not already claimed.
- `refund`: at/after deadline, target missed, positive credit for the caller.
- Settlement updates state before sending ETH; a failed external call reverts the change.

`raised` is the historical total, not the remaining balance. It does not decrease after refunds. For a successful campaign, contribution records remain as history but are not refundable. The UI record label is not a promise of refund eligibility; the goal/deadline rules decide eligibility.

Files: `contracts/Crowdfund.sol`, `project.mjs`, `runtime.mjs`, `server.mjs`, `public/`, `test/`. The contract uses solc 0.8.30 and a Shanghai EVM target.

Covered tests include exact deadline behavior, both settlement branches, isolated supporter refunds, repeated settlement, owner restrictions and the HTTP interface. Full adversarial recipient/reentrancy verification and production audit are outside this workshop's scope.
