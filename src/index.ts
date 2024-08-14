import fs from "node:fs";
import loader from "@assemblyscript/loader";
import { shortCode } from "qcobjects";

const imports = {
  index: {
    helloWorld ():void {
      console.log(`Hello World! This is your key: ${shortCode()}`)
    }
  },
  env: {
    abort(_msg: any, _file: any, line: string, column: string):void {
      console.error("abort called at main.ts:" + line + ":" + column);
    }
  },
};
const wasmModule = loader.instantiateSync(fs.readFileSync(__dirname + "/untouched.wasm"), imports as any);
module.exports = wasmModule.exports;
