const fs = require("fs-extra");
const path = require("path");
const solc = require("solc");

const compile = () => {
  try {
    const buildPath = path.resolve(__dirname, "./build");
    fs.removeSync(buildPath);

    const contractPath = path.resolve(__dirname, "./contracts", "election.sol");
    console.log(contractPath);
    const source = fs.readFileSync(contractPath, "utf8");
    const compiled = solc.compile(source, 1);
    if (compiled.errors && compiled.errors.some(message => /Error:/.test(message))) {
      throw new Error(compiled.errors.join("\n"));
    }
    const output = compiled.contracts;

    fs.ensureDirSync(buildPath);

    for (let contract in output) {
      fs.outputJSONSync(
        path.resolve(buildPath, contract.replace(":", "") + ".json"),
        output[contract]
      );
    }

    return "Contract compiled successfully!";
  } catch (error) {
    console.error(error);
    return error;
  }
};

// console.log(compile());

module.exports = compile;
