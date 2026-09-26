// Integration check: requires the normal launcher dependencies and free workshop
// ports. Run separately from tests that regenerate artifacts/deployment receipts.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdirSync, openSync, closeSync, readFileSync } from "node:fs";
import net from "node:net";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const ports = { lock: [8545, 3001], election: [8546, 4000, 3002], tokenization: [8547, 3003] };
const running = new Map();
const rpc = async (port, method, params = []) => {
  const response = await fetch(`http://127.0.0.1:${port}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: AbortSignal.timeout(5000),
  });
  const data = await response.json();
  if (data.error) throw Error(JSON.stringify(data.error));
  return data.result;
};
async function eventually(check, description, timeout = 240000) {
  const end = Date.now() + timeout;
  let error;
  while (Date.now() < end) {
    try { await check(); return; } catch (e) { error = e; }
    await delay(500);
  }
  throw Error(`${description}: ${error}`);
}
async function free(port) {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => server.close(resolve));
  });
}
function start(project) {
  mkdirSync(resolve(root, ".tmp"), { recursive: true });
  const log = resolve(root, `.tmp/${project}-integration.log`);
  const fd = openSync(log, "w");
  // A stale caller override must never redirect Election into another demo.
  const child = spawn("bash", ["launch.sh", project, "--no-open"], { cwd: root, env: { ...process.env, CI: "true", RPC_URL: "http://127.0.0.1:8545" }, stdio: ["ignore", fd, fd] });
  closeSync(fd);
  running.set(project, child);
  return eventually(async () => {
    assert.equal(child.exitCode, null, `${project} exited; see ${log}`);
    assert.match(readFileSync(log, "utf8"), /(?:dApp|Tokenization) ready:/);
    assert.equal(await rpc(ports[project][0], "eth_chainId"), "0x7a69");
    const frontend = ports[project].at(-1);
    assert.equal((await fetch(`http://127.0.0.1:${frontend}`, { signal: AbortSignal.timeout(10000) })).status, 200);
  }, `${project} startup; see ${log}`);
}
async function stop(project, signal = "SIGTERM") {
  const child = running.get(project);
  if (!child) return;
  if (child.exitCode === null && child.signalCode === null) {
    const exited = once(child, "exit", { signal: AbortSignal.timeout(15000) });
    child.kill(signal);
    await exited;
  }
  running.delete(project);
  await eventually(() => Promise.all(ports[project].map(free)), `${project} ports released`, 15000);
}

test("concurrent demos isolate transactions, reject occupied ports, and stop independently; standalone startup still works", { timeout: 900000 }, async () => {
  await Promise.all(Object.values(ports).flat().map(free));
  try {
    await Promise.all(Object.keys(ports).map(start));
    const [firstLockAccount] = await rpc(8545, "eth_accounts");
    const addresses = [101, 102, 103].map(n => `0x${n.toString(16).padStart(40, "0")}`);
    const rpcPorts = [8545, 8546, 8547];
    for (const [index, port] of rpcPorts.entries()) {
      const [from] = await rpc(port, "eth_accounts");
      const hash = await rpc(port, "eth_sendTransaction", [{ from, to: addresses[index], value: "0x123", gas: "0x5208" }]);
      await eventually(async () => assert.equal((await rpc(port, "eth_getTransactionReceipt", [hash]))?.status, "0x1"), "transaction mined");
    }
    for (const [index, port] of rpcPorts.entries()) {
      for (const [other, address] of addresses.entries()) {
        assert.equal(BigInt(await rpc(port, "eth_getBalance", [address, "latest"])), index === other ? 291n : 0n);
      }
    }
    assert.equal((await (await fetch("http://127.0.0.1:4000/health")).json()).project, "election");
    // Exercise the actual Express signing path with an inherited, wrong RPC_URL.
    const election = await (await fetch("http://127.0.0.1:4000/api/v1/newElection", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ account: 0, duration: 10, electionName: "Concurrent isolation" }),
    })).json();
    assert.equal(election.status, true);
    assert.ok(await rpc(8546, "eth_getTransactionReceipt", [election.transactionHash]));
    assert.equal(await rpc(8545, "eth_getTransactionReceipt", [election.transactionHash]), null);
    assert.equal(await rpc(8547, "eth_getTransactionReceipt", [election.transactionHash]), null);
    const elections = await (await fetch("http://127.0.0.1:4000/api/v1/getElections")).json();
    assert.equal(elections[0].electionName, "Concurrent isolation");

    // Use the same chain definition and default transports as the frontend,
    // faucet and explorer, rather than testing only explicit RPC URLs.
    const { localChain } = await import("../tokenization/packages/nextjs/utils/scaffold-eth/localChain.ts");
    const requireNext = createRequire(resolve(root, "tokenization/packages/nextjs/package.json"));
    const { createPublicClient, createWalletClient, http, webSocket } = requireNext("viem");
    const client = createPublicClient({ chain: localChain, transport: http() });
    const wallet = createWalletClient({ chain: localChain, transport: http() });
    const [account] = await wallet.getAddresses();
    const faucetHash = await wallet.sendTransaction({ account, to: addresses[2], value: 1n });
    assert.equal((await client.waitForTransactionReceipt({ hash: faucetHash })).status, "success");
    assert.equal(await client.getBalance({ address: addresses[2] }), 292n);
    const ws = createPublicClient({ chain: localChain, transport: webSocket() });
    try {
      assert.equal(await ws.getBalance({ address: addresses[2] }), 292n);
      assert.equal(await ws.getBytecode({ address: elections[0].electionAddress }), undefined);
    } finally {
      (await ws.transport.getRpcClient()).close();
    }

    // A second launcher must fail without adopting or killing the existing node.
    const duplicate = spawn("bash", ["launch.sh", "election", "--no-open"], { cwd: root });
    let output = "";
    duplicate.stderr.on("data", chunk => { output += chunk; });
    duplicate.stdout.resume();
    assert.equal((await once(duplicate, "exit"))[0], 1);
    assert.match(output, /Port 8546 is occupied/);
    await stop("tokenization");
    // With Lock still alive, Tokenization must fail closed, never fall back to 8545.
    const offlineClient = createPublicClient({ chain: localChain, transport: http(undefined, { retryCount: 0, timeout: 1000 }) });
    await assert.rejects(offlineClient.getBlockNumber());
    assert.equal(await rpc(8545, "eth_chainId"), "0x7a69");
    assert.equal(await rpc(8546, "eth_chainId"), "0x7a69");
    assert.equal((await fetch("http://127.0.0.1:3001")).status, 200);
    assert.equal((await fetch("http://127.0.0.1:3002")).status, 200);
    await stop("lock", "SIGINT");
    assert.equal(await rpc(8546, "eth_chainId"), "0x7a69");
    await stop("election");
    for (const project of Object.keys(ports)) {
      await start(project);
      if (project === "lock") assert.notEqual((await rpc(8545, "eth_accounts"))[0], firstLockAccount);
      await stop(project);
    }
  } finally {
    await Promise.all([...running.keys()].map(project => stop(project)));
  }
});
