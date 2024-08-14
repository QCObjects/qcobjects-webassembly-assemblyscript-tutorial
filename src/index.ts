import fs from "node:fs";
import { shortCode } from "qcobjects";
const AsBind = require("as-bind/dist/as-bind.cjs.js");

const wasm = fs.readFileSync(__dirname + "/optimized.wasm")

export const asyncTask = async () => {
  const asBindInstance = await AsBind.instantiate(wasm);

  // You can now use your wasm / as-bind instance!
  const response = asBindInstance.exports.myExportedFunctionThatTakesAString(
    "Hello World!"
  );
  console.log(response); // AsBind: Hello World!
};

