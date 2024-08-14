"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncTask = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const AsBind = require("as-bind/dist/as-bind.cjs.js");
const wasm = node_fs_1.default.readFileSync(__dirname + "/optimized.wasm");
const asyncTask = async () => {
    const asBindInstance = await AsBind.instantiate(wasm);
    // You can now use your wasm / as-bind instance!
    const response = asBindInstance.exports.myExportedFunctionThatTakesAString("Hello World!");
    console.log(response); // AsBind: Hello World!
};
exports.asyncTask = asyncTask;
