const fs = require("fs");
const loader = require("@assemblyscript/loader");
const { shortCode } = require("qcobjects");
const imports = {
  index: {
    helloWorld () {
      console.log("Hello World!")
    }
  },
  env: {
    abort(_msg, _file, line, column) {
      console.error("abort called at main.ts:" + line + ":" + column);
    }
  },
};
const wasmModule = loader.instantiateSync(fs.readFileSync(__dirname + "/build/untouched.wasm"), imports);
module.exports = wasmModule.exports;
