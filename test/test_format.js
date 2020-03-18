/* global suite, test, before, after */
"use strict";

let { Config } = require("../lib/config");
let { consoleMock } = require("./util");
let assert = require("assert");

let { strictEqual: assertSame } = assert;

suite("configuration: module format");

before(() => {
	consoleMock.activate();
});

after(() => {
	consoleMock.deactivate();
});

test("module-format mapping", () => {
	let config = new Config("./index.js");
	assertSame(config.output.format, "es");

	Object.entries({
		esm: "es",
		es: "es",
		es6: "es",
		umd: "umd",
		amd: "amd",
		commonjs: "cjs",
		cjs: "cjs",
		iife: "iife"
	}).forEach(([format, rollupID]) => {
		let config = new Config("./index.js", { format });
		assertSame(config.output.format, rollupID);
	});
});

test("exports handling", () => {
	let { log, reset } = console._stderr; // eslint-disable-line no-console
	assertSame(log.length, 0);
	["esm", "amd", "commonjs"].forEach(format => {
		// eslint-disable-next-line no-new
		new Config("./index.js", { format, exports: "MYLIB" });
		assertSame(log.length, 1);
		assertSame(log[0].length, 1);
		assert(log[0][0].includes("bundle format ignores `exports` configuration"));
		reset();
	});
	["umd", "iife"].forEach(format => {
		// eslint-disable-next-line no-new
		new Config("./index.js", { format, exports: "MYLIB" });
		assertSame(log.length, 0);
	});
});
