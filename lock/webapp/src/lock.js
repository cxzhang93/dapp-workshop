import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import artifact from "./Lock.json";
import blockchainnet from "./blockchainnet.json";

export let LockContractAddress = "0x0";
export const Testnet = blockchainnet.Testnet;
export const TestnetRpc = blockchainnet.TestnetRpc;

const LOCAL_CHAIN_ID = "0x7a69";
const web3 = new Web3(TestnetRpc);
export let contract = new web3.eth.Contract(artifact.abi);

export const setLockContractAddress = address => {
  LockContractAddress = address;
  contract = new web3.eth.Contract(artifact.abi, address);
};

async function getMetaMask() {
  const provider = await detectEthereumProvider();
  if (!provider) throw new Error("Please install MetaMask first.");
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: LOCAL_CHAIN_ID }] });
  } catch (error) {
    if (error.code !== 4902) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: LOCAL_CHAIN_ID,
        chainName: "dApp Workshop Local Chain",
        nativeCurrency: { name: "Local Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: [TestnetRpc],
      }],
    });
  }
  return provider;
}

async function waitForReceipt(transactionHash) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    if (receipt) return receipt;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error("Transaction was submitted but confirmation timed out.");
}

function readableError(error) {
  return error?.data?.message || error?.message || String(error);
}

export const deployContract = async (unlockTime, valueInWei) => {
  if (!/^\d+$/.test(String(valueInWei))) throw new Error("Lock amount must be a whole number of wei.");
  const provider = await getMetaMask();
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const creation = contract.deploy({ data: artifact.bytecode, arguments: [String(unlockTime)] });
  const value = web3.utils.numberToHex(valueInWei);
  const estimatedGas = await creation.estimateGas({ from: accounts[0], value });
  const transactionHash = await provider.request({
    method: "eth_sendTransaction",
    params: [{
      from: accounts[0],
      value,
      gas: web3.utils.numberToHex(Math.ceil(estimatedGas * 1.2)),
      data: creation.encodeABI(),
    }],
  });
  const receipt = await waitForReceipt(transactionHash);
  if (!receipt.status) throw new Error("Contract deployment reverted.");
  return receipt.contractAddress;
};

export const checkTimestampValidity = async unlockTimestamp => {
  const latestBlock = await web3.eth.getBlock("latest");
  const requested = Number(unlockTimestamp);
  const current = Number(latestBlock.timestamp);
  return { valid: Number.isFinite(requested) && requested > current, timestamp: current };
};

export const showBlance = async address => ({
  address,
  balance: String(await web3.eth.getBalance(address)),
});

async function sendContractCall(functionName) {
  try {
    if (!web3.utils.isAddress(LockContractAddress) || LockContractAddress === "0x0") {
      throw new Error("Deploy a Lock contract first.");
    }
    const provider = await getMetaMask();
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const estimatedGas = await contract.methods[functionName]().estimateGas({ from: accounts[0] });
    const transactionHash = await provider.request({
      method: "eth_sendTransaction",
      params: [{
        from: accounts[0],
        to: LockContractAddress,
        value: "0x0",
        gas: web3.utils.numberToHex(Math.ceil(estimatedGas * 1.2)),
        data: contract.methods[functionName]().encodeABI(),
      }],
    });
    const receipt = await waitForReceipt(transactionHash);
    return Boolean(receipt.status);
  } catch (error) {
    window.alert(readableError(error));
    return false;
  }
}

export const unlock = () => sendContractCall("unlock");
export const withdraw = () => sendContractCall("withdraw");

export const enableEthereumButton = async () => {
  try {
    const provider = await getMetaMask();
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    return accounts[0];
  } catch (error) {
    window.alert(readableError(error));
    return undefined;
  }
};
