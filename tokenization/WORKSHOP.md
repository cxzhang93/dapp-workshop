# Scaffold-ETH 2 Tokenization workshop notes

This folder comes from the official Scaffold-ETH 2 SpeedRunEthereum `challenge-tokenization` extension. It provides a maintained Next.js frontend, RainbowKit/wagmi wallet integration, Hardhat contracts, OpenZeppelin ERC-721 behavior, automated tests, and IPFS exercises.

Run:

```bash
./run-tokenization.command
```

The launcher uses the bundled Yarn 4.13.0 release, starts a Hardhat chain on port 8545, deploys `YourCollectible`, and starts the official frontend on `http://127.0.0.1:3003/myNFTs`.

Suggested demonstration:

1. Use the local burner wallet for the quickest path, or connect MetaMask to chain ID 31337.
2. Use the faucet if the selected address needs local ETH.
3. Mint an NFT and inspect its image, token ID, owner address, and metadata link.
4. Open an incognito window to obtain a second burner address, fund it, and transfer the NFT.
5. Verify the new owner through the second window, the Transfers page, and `ownerOf` under Debug Contracts.

The explanation should separate three facts: ERC-721 records ownership onchain, `tokenURI` identifies metadata, and the media may live outside the chain. A token only represents a real-world legal right when an issuer and legal framework establish that connection.

Run `./run-tokenization.command --test` for the official deploy/mint/enumeration tests and the Next.js TypeScript check. Optional IPFS upload and public testnet deployment require internet and are outside the one-hour local session.
