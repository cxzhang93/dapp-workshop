# Lock

Start from the repository root with `./run-lock.command`, or run `npm ci --ignore-scripts` and `npm start` in this folder. Default URL: http://127.0.0.1:4181. Tests: `npm test`.

## Live walkthrough

1. The initial lock contains 1 local ETH and a deadline about 600 seconds away. Acting account defaults to Owner.
2. Click **Withdraw** immediately. Expected: `You can't withdraw yet`.
3. Select **Other account**, then **Owner unlock**. Expected: an owner authorization error.
4. Select **Owner**, then **Owner unlock**. Expected: confirmed transaction, unlock timestamp updated.
5. Click **Withdraw**. Expected: confirmed receipt and Balance (ETH) `0.0`.
6. **Deploy new lock** with a chosen deposit/duration. Click **Advance past deadline**, then **Withdraw** as Owner to show the normal timed path.

Deposit values are ETH strings, converted with `parseEther`, so `1.000000000000000001` is preserved exactly as wei. The runtime mines a fresh block before computing a deployment deadline, so a lock can still be created after the server has been idle.

## Files and changes

- `contracts/Lock.sol`: the upstream contract with the unused Hardhat console import removed. Owner override and `transfer` behavior are retained.
- `project.mjs`: deployment and account-specific actions.
- `runtime.mjs`, `server.mjs`: compiler, local EVM, loopback HTTP service and shutdown.
- `public/`: independent workshop UI. Successful writes wait for receipts and refresh state; errors stay readable.
- `test/`: authorization, deadline, precision, idle-clock and HTTP tests.
- `upstream/Lock.sol`: unchanged contract reference.
- `upstream/legacy-ui/`: original React UI source, retained for comparison; not the default application.

Original: [BlockchainCourseNTU/hello-dapp](https://github.com/BlockchainCourseNTU/hello-dapp), commit `1c1ca2286705574d29e1ec1068bf2817d944f621`, nested project `hello-dapp/`.

The original UI mixes millisecond dates with a second-based contract timestamp, uses integer parsing for amounts, and reads receipts immediately after submission. The workshop runtime removes those failure points. The original contract permits early release by the owner, so this is not an irreversible vesting contract. Contract recipients with complex receive logic may reject `transfer`; that behavior is intentionally retained and not production-hardened here.
