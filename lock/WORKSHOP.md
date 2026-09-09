# Lock workshop notes

`lock/` starts from the original `BlockchainCourseNTU/hello-dapp` Lock contract and React frontend. The page design and its MetaMask interaction remain recognizable; the workshop changes make the source run with current Node tooling and a deterministic local chain.

Run:

```bash
./run-lock.command
```

The root launcher starts Ganache on `127.0.0.1:8545`, compiles the original contract into `webapp/src/Lock.json`, and starts the original React app on `127.0.0.1:3000`. Configure MetaMask for chain ID 31337 and import the disposable key printed in the terminal.

Suggested demonstration:

1. Connect MetaMask and point out the account and local ETH balance.
2. Choose a future UTC time and a small wei amount, then deploy. MetaMask asks for a signature.
3. Compare the displayed owner, unlock time, current time, and contract balance.
4. Call `unlock` as the owner, confirm it in MetaMask, then withdraw.
5. Explain that every write has two stages: wallet approval and mined confirmation.

Run `./run-lock.command --test` for a deployment, unlock, withdrawal test and a production React build.

Workshop compatibility changes are limited to dependency pins, local compilation, EIP-1193 network switching, exact timestamp/wei handling, receipt waits, readable errors, and state refresh. The original source README remains at `lock/README.md`.
