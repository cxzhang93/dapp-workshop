# Presenter guide: 60-minute dApp workshop

Slides 1–15 retain the supplied deck. Slides 16–26 add the session map, architecture explanations, updated demo paths, Scaffold-ETH 2 Tokenization project, and wrap-up. Installation happens before class.

## Before class

1. Install Node 24 and run `./test-all.sh`.
2. Launch every project once so dependency downloads complete, then stop each with Ctrl+C.
3. Add MetaMask network `http://127.0.0.1:8545`, chain ID 31337. Import the fresh disposable key printed by the Lock launcher after each restart.
4. Keep the three project guides open. The fixed frontend addresses are Lock `:3001`, Election `:3002`, and Tokenization `:3003`; start only the current project because their local chains share RPC port 8545.
5. Use a fresh browser profile or disconnect MetaMask before the Tokenization burner-wallet exercise.

## Timing

| Slides | Segment | Minutes | Clock |
|---|---|---:|---|
| 1–5 | dApp foundations | 9 | 00–09 |
| 6–11, 18–19 | Lock concepts, architecture and live wallet demo | 14 | 09–23 |
| 12–15, 20–21 | Election concepts, architecture and original UI demo | 14 | 23–37 |
| 16–17, 22–24 | Session comparison and Tokenization demo | 17 | 37–54 |
| 25–26 | Startup recap and questions | 6 | 54–60 |

## Original slides 1–15

### 1. CE/CZ4153 Tutorial (1 min)

Introduce the goal: follow a transaction from interface to signature, RPC, contract state, and confirmed result.

### 2. What is dApp? (2 min)

Separate the interface, signer/provider, and smart contract. Ask where shared state lives and where a private key should live.

### 3. Reliable Service (1 min)

Keep the historical slide wording. Qualify it verbally: chain liveness does not guarantee that a frontend host, wallet, or RPC provider remains available.

### 4. New Opportunities (2 min)

Use the examples to discuss shared ownership and programmable transfer. Avoid treating every token as an automatic legal claim to an offchain asset.

### 5. How to develop a dApp? (3 min)

Explain reads versus writes. Reads use RPC calls and do not require mining. Writes require a signer, gas, transaction submission, mining, and a receipt.

### 6–10. Lock contract (7 min)

Use `lock/contracts/Lock.sol` beside the slides. Explain `owner`, `unlockTime`, constructor value, `msg.sender`, `block.timestamp`, and the withdrawal event. Point out that the owner override is a policy choice in this example.

### 11. Run Lock (use slide 18 next)

Move to the added architecture slide before starting the demo. Return to slide 11 only as the original run instruction.

### 12–14. Election design (7 min)

Explain the factory and election addresses, then inspect `election/ethereum/contracts/election.sol`. The application sends personal and voting data to a public local ledger. It does not implement ballot secrecy or a production identity model.

### 15. Run Election (use slide 20 next)

Move to the added architecture slide, then run the original interface.

## Added slides 16–26

### 16. 60-minute session map (2 min)

Preview the three demos and reserve the final minutes for comparison and questions.

### 17. Three transaction paths (3 min)

Compare who signs: MetaMask in Lock, the Express server in Election, and a burner wallet or MetaMask in Tokenization. This distinction explains the trust model better than the screens alone.

### 18. Lock frontend, wallet and contract (2 min)

Trace React to the EIP-1193 provider, MetaMask confirmation, Ganache, and `Lock.sol`. The frontend constructs calls; MetaMask controls the key and signs.

### 19. Lock live demo (5 min)

Run `./run-lock.command` and open `http://127.0.0.1:3001`. Connect MetaMask, deploy with a near future UTC time and small wei amount, confirm the deployment, inspect the balance, call owner unlock, then withdraw. Point out each wallet prompt and mined confirmation.

If MetaMask blocks the local network, use the terminal values to add chain ID 31337 manually. Never use a real account or funds.

### 20. Election frontend and backend (3 min)

Trace React HTTP requests to Express on port 4000. Express uses Web3 and an unlocked Ganache account. This is easier to start, but the browser user neither selects nor confirms the onchain sender.

### 21. Election original UI demo (4 min)

Run `./run-election.command` and open `http://127.0.0.1:3002`. Create an election, open the returned card, and add a constituency. Show one React component, its Express route, and the called contract method. Use the transaction hash in the server response to connect the layers.

### 22. Project 3: Scaffold-ETH 2 Tokenization (3 min)

Identify the source and license. Explain why it is a useful mature demo: it combines an ERC-721 implementation, tests, wallet tooling, holdings, transfers, contract debugging, and IPFS exercises.

### 23. Tokenization architecture (3 min)

Trace Next.js and wagmi to the signer and Hardhat. Explain the difference between `ownerOf`, `tokenURI`, metadata, and media. An offchain legal claim needs a separate issuer and legal framework.

### 24. Mint, transfer and explain the evidence (6 min)

Run `./run-tokenization.command` and open `http://127.0.0.1:3003/myNFTs`. Use the burner wallet for speed or connect MetaMask. Mint an NFT. Open an incognito window, fund its burner address, and transfer the NFT. Verify the receiving page, `ownerOf(tokenId)`, and the `Transfer` event. These observations explain the ownership change instead of treating a button click as the result.

### 25. One-command local stack (2 min)

Show the three root scripts and explain what each starts. The dependency install belongs in pre-class setup; the live session begins from a warm installation.

### 26. Architecture comparison and questions (4 min)

Ask students which key holder they would choose for a public application and what the backend still needs to provide. Revisit the differences between onchain state, metadata, and interface state.

## Demo fallback

If a UI stalls, run the corresponding `--test` command and use its passing deployment and contract assertions while explaining the same architecture. For Lock, the instructor must still click MetaMask confirmations during a real browser-wallet demo. For Tokenization, the local contract tests cover deployment, minting, and enumeration even if a browser extension is unavailable.
