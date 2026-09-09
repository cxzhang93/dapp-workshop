const assert = require("node:assert/strict");
const test = require("node:test");
const ganache = require("ganache");

test("the original Election backend compiles, deploys and creates an election", async () => {
  const chain = ganache.provider({ logging: { quiet: true }, chain: { chainId: 31337 } });
  global.__WORKSHOP_WEB3_PROVIDER__ = chain;
  try {
    const compile = require("../ethereum/compile");
    const deploy = require("../ethereum/deploy");
    const logic = require("../ethereum/logic");
    assert.equal(compile(), "Contract compiled successfully!");
    await deploy();
    const receipt = await logic.createElection(0, 10, "Workshop Election");
    assert.equal(receipt.status, true);
    const elections = await logic.getConductedElections();
    assert.equal(elections.length, 1);
    assert.equal(elections[0].electionName, "Workshop Election");
  } finally {
    await chain.disconnect();
    delete global.__WORKSHOP_WEB3_PROVIDER__;
  }
});
