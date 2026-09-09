import fs from "node:fs/promises";
import path from "node:path";
import solc from "solc";

const root = path.resolve(import.meta.dirname, "..");
const source = await fs.readFile(path.join(root, "contracts", "Lock.sol"), "utf8");
const input = {
  language: "Solidity",
  sources: {
    "contracts/Lock.sol": { content: source },
    "hardhat/console.sol": { content: "pragma solidity >=0.4.22 <0.9.0; library console {}" },
  },
  settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors || []).filter(item => item.severity === "error");
if (errors.length) throw new Error(errors.map(item => item.formattedMessage).join("\n"));
const compiled = output.contracts["contracts/Lock.sol"].Lock;
const artifact = { abi: compiled.abi, bytecode: `0x${compiled.evm.bytecode.object}` };
await fs.writeFile(path.join(root, "webapp", "src", "Lock.json"), `${JSON.stringify(artifact, null, 2)}\n`);
console.log("Prepared webapp/src/Lock.json from the original Lock.sol");
