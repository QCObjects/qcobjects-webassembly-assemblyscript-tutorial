#!/usr/bin/env node
console.log("Initializing tests...");
describe("QCObjects Integrity", function () {
  const path = require("path");
  const absolutePath = path.resolve( __dirname, "./" );
  const package_config = require(absolutePath+"/../package.json");

  it("Verifying the version of CLI Tool", function () {
    console.log("Verifying the version of QCObjects is required and same for devDependencies and peerDependencies...");
    expect(package_config.devDependencies.qcobjects).toEqual(package_config.peerDependencies.qcobjects);
    console.log("Verifying the version of CLI Tool... OK");
  });


});
