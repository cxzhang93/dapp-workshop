# Frontend, backend and signing architecture

The three demos deliberately show different dApp boundaries. Ask the same questions in every demo: Where does the private key live? Who constructs the transaction? Who signs it? Which state lives onchain?

## Project 1: Lock

```text
Original React frontend, port 3001
        ↓ EIP-1193 request
MetaMask browser wallet
        ↓ signed transaction
Ganache JSON-RPC, chain ID 31337
        ↓ EVM call
Lock.sol
```

The browser reads the connected address and balance through MetaMask. The React app constructs deployment and method calls with Web3, but MetaMask shows the confirmation and signs with the user's key. Ganache mines the transaction. `owner`, `unlockTime`, and ETH balance are contract state; the selected date field and UI messages are browser state.

This pattern resembles a public dApp because the application server never sees the private key. A production version still needs a reliable frontend host, audited contract, supported RPC endpoint, wallet error handling, and network checks.

## Project 2: Election

```text
Original React frontend, port 3002
        ↓ HTTP JSON
Original Express backend
        ↓ Web3 call signed by a Ganache account
Ganache JSON-RPC, chain ID 31337
        ↓ EVM call
ElectionFactory and Election contracts
```

The browser sends ordinary HTTP requests to Express on port 4000. The backend uses Web3 and an unlocked Ganache account to deploy and mutate contracts. Students do not confirm these writes in MetaMask. Election records live onchain, while the server holds the RPC configuration and chooses the signing account.

This architecture reduces classroom setup, but users must trust the backend to submit the intended action from the intended account. It also hides gas payment and wallet consent. Use this contrast to explain why many production dApps move signing into the user's wallet or use clearly specified relayer and account abstraction systems.

## Project 3: Tokenization

```text
Official Scaffold-ETH 2 Next.js frontend, port 3003
        ↓ wagmi and Scaffold hooks
Burner wallet or MetaMask through RainbowKit
        ↓ signed transaction
Hardhat local JSON-RPC, chain ID 31337
        ↓ EVM call and events
OpenZeppelin ERC-721 contract
        ↓ tokenURI
NFT metadata and media, with optional IPFS exercises
```

The official interface exposes wallet connection, minting, holdings, transfers, contract debugging, and event history. `ownerOf(tokenId)` provides the onchain ownership fact. The token URI points to metadata, and the metadata points to media. A token therefore does not automatically grant an offchain legal right; a separate issuer or legal agreement must define that link.

The local burner wallet gives each browser profile a disposable key and avoids extension setup. MetaMask demonstrates the persistent browser-wallet path. The incognito exercise makes ownership transfer visible: the first window loses the NFT, the second gains it, and the `Transfer` event records the change.

## Deployment layers

The root scripts deploy only to disposable local chains. For a public deployment, treat these as separate releases:

1. Deploy the contract with a controlled deployer account and record its network address.
2. Configure the frontend for that network and contract address.
3. Host the static or server-rendered frontend.
4. Provide a dependable RPC service and monitor failures.
5. Publish source verification, security review information, and user-facing network requirements.

Election additionally needs an intentional backend deployment and key-management design because its server signs transactions.
