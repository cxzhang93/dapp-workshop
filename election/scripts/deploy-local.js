const compile = require("../ethereum/compile");
const deploy = require("../ethereum/deploy");

async function main() {
  const result = compile();
  if (result instanceof Error) throw result;
  await deploy();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
