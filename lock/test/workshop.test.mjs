import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import path from "node:path";
import ganache from "ganache";
import { BrowserProvider, ContractFactory, parseEther } from "ethers";

test("the original Lock contract deploys, unlocks and withdraws", async () => {
  const root = path.resolve(import.meta.dirname, "..");
  await import("../scripts/prepare-artifact.mjs");
  const artifact = JSON.parse(await fs.readFile(path.join(root, "webapp/src/Lock.json"), "utf8"));
  const rpc = ganache.provider({ logging: { quiet: true }, chain: { chainId: 31337 } });
  const provider = new BrowserProvider(rpc, undefined, { cacheTimeout: -1 });
  const owner = await provider.getSigner(0);
  const now = Number((await provider.getBlock("latest")).timestamp);
  const lock = await new ContractFactory(artifact.abi, artifact.bytecode, owner).deploy(now + 600, { value: parseEther("1") });
  await lock.waitForDeployment();
  assert.equal(await provider.getBalance(await lock.getAddress()), parseEther("1"));
  await (await lock.unlock()).wait();
  await (await lock.withdraw()).wait();
  assert.equal(await provider.getBalance(await lock.getAddress()), 0n);
  provider.destroy();
  await rpc.disconnect();
});
