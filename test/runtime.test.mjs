import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const read = name => readFileSync(join(root, name), "utf8");

test("manual commands and all RPC consumers agree on isolated ports", () => {
  assert.equal(JSON.parse(read("lock/webapp/src/blockchainnet.json")).TestnetRpc, "http://127.0.0.1:8545/");
  assert.match(read("election/ethereum/web3.js"), /process\.env\.RPC_URL \|\| "http:\/\/127\.0\.0\.1:8546"/);
  const scripts = JSON.parse(read("tokenization/packages/hardhat/package.json")).scripts;
  for (const script of [scripts.chain, scripts.fork]) assert.match(script, /--port 8547/);
  assert.match(read("tokenization/packages/hardhat/hardhat.config.ts"), /url: 'http:\/\/127\.0\.0\.1:8547'/);
  const base = "tokenization/packages/nextjs/";
  const chain = read(base + "utils/scaffold-eth/localChain.ts");
  assert.match(chain, /http: \["http:\/\/127\.0\.0\.1:8547"\]/);
  assert.match(chain, /webSocket: \["ws:\/\/127\.0\.0\.1:8547"\]/);
  assert.match(read(base + "scaffold.config.ts"), /targetNetworks:\s*\[\s*localChain/);
  for (const file of ["components/scaffold-eth/Faucet.tsx", "components/scaffold-eth/FaucetButton.tsx", "app/blockexplorer/_components/AddressStorageTab.tsx", "app/blockexplorer/_components/ContractTabs.tsx", "hooks/scaffold-eth/useFetchBlocks.ts"]) {
    const source = read(base + file);
    assert.match(source, /chain: localChain/, file);
    assert.doesNotMatch(source, /8545|chain: hardhat/, file);
  }
});

test("service supervisor preserves exit status", async () => {
  const child = spawn(process.execPath, ["scripts/run-service.mjs", root, process.execPath, "-e", "process.exit(7)"], { cwd: root });
  assert.equal((await once(child, "exit"))[0], 7);
});

test("service supervisor terminates grandchildren without killing unrelated processes", async () => {
  const dir = mkdtempSync(join(tmpdir(), "workshop-service-"));
  const pidFile = join(dir, "pid");
  const unrelated = spawn(process.execPath, ["-e", "setInterval(()=>{},1000)"]);
  const command = `const {spawn}=require('node:child_process'); const fs=require('node:fs'); const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'inherit'}); fs.writeFileSync(${JSON.stringify(pidFile)},String(child.pid)); setInterval(()=>{},1000);`;
  const service = spawn(process.execPath, ["scripts/run-service.mjs", root, process.execPath, "-e", command], { cwd: root });
  let grandchild;
  try {
    for (let i = 0; i < 100 && !existsSync(pidFile); i++) await delay(50);
    grandchild = Number(readFileSync(pidFile, "utf8"));
    const exited = once(service, "exit");
    service.kill("SIGTERM");
    assert.equal((await exited)[0], 143);
    for (let i = 0; i < 100; i++) {
      try { process.kill(grandchild, 0); } catch { break; }
      await delay(50);
    }
    assert.throws(() => process.kill(grandchild, 0), { code: "ESRCH" });
    assert.doesNotThrow(() => process.kill(unrelated.pid, 0));
  } finally {
    service.kill("SIGTERM");
    unrelated.kill("SIGTERM");
    if (grandchild) { try { process.kill(grandchild, "SIGKILL"); } catch {} }
    rmSync(dir, { recursive: true, force: true });
  }
});
