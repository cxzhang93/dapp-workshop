const Web3 = require("web3");

// The original application signs transactions in the Express server. The
// workshop launcher provides a private Ganache chain on this loopback URL.
const provider = global.__WORKSHOP_WEB3_PROVIDER__ || process.env.RPC_URL || "http://127.0.0.1:8545";
const web3 = new Web3(provider);
const web3Network = "ganache";

module.exports = { web3, web3Network };
