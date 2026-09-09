# Election workshop notes

`election/` starts from `schadokar/election-ethereum-react-dapp` and retains the original React routes, forms, Express API, and Solidity 0.4.25 contract.

Run:

```bash
./run-election.command
```

The launcher starts Ganache on port 8545, compiles and deploys `ElectionFactory`, starts Express on port 4000, and starts the original React app on `http://127.0.0.1:3002`. The factory address is written to the generated local receipt used by the server.

Suggested demonstration:

1. Create an election from the original homepage form.
2. Open the returned election card and note the contract address in the route.
3. Add a constituency and inspect the server terminal for the HTTP request and transaction.
4. Open the relevant React component, Express route, and Solidity method side by side.
5. Ask who signed the transaction. The answer is the server's unlocked Ganache account, not the browser user.

This project is useful because it makes the backend visible. It also carries a major trust assumption: the server selects the sender and signs. The legacy contract stores election information publicly and does not implement secret ballots or a production identity system.

Run `./run-election.command --test` for factory deployment, election creation, list verification, and a production React build. The original source documentation remains at `election/readme.md` and `election/client/README.md`.
