"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const loader_1 = __importDefault(require("@assemblyscript/loader"));
const qcobjects_1 = require("qcobjects");
const imports = {
    index: {
        helloWorld() {
            console.log(`Hello World! This is your key: ${(0, qcobjects_1.shortCode)()}`);
        }
    },
    env: {
        abort(_msg, _file, line, column) {
            console.error("abort called at main.ts:" + line + ":" + column);
        }
    },
};
const wasmModule = loader_1.default.instantiateSync(node_fs_1.default.readFileSync(__dirname + "/build/untouched.wasm"), imports);
module.exports = wasmModule.exports;
