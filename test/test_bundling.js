/* global suite, test */
"use strict";

let { Bundle } = require("../lib/bundle");
let { Config } = require("../lib/config");
let { fixturePath, consoleMock } = require("./util");
let path = require("path");
let { strictEqual: assertSame } = require("assert");

let ROOT = path.resolve(__dirname, "..");

suite("module bundling");

test("basic compilation", async () => {
	let bundle = makeBundle("./empty.js");
	consoleMock.activate("warn");
	let code = await bundle.compile();
	consoleMock.deactivate();
	assertSame(code, "");

	bundle = makeBundle("./main.js");
	code = await bundle.compile();
	assertSame(code, "function main() {}export default main;");

	bundle = makeBundle("./main.js", { compact: false });
	code = await bundle.compile();
	assertSame(code, `
function main() {}

export default main;
	`.trim() + "\n");
});

test("custom entry point", async () => {
	let config = new Config(null, { compact: true });
	let bundle = new Bundle(config);
	let code = await bundle.compile(fixturePath("./main.js"));
	assertSame(code, "function main() {}export default main;");

	code = await bundle.compile(fixturePath("./empty.js"));
	assertSame(code, "");
});

test("module resolution", async () => {
	let bundle = makeBundle("./index.js");
	consoleMock.activate("warn");
	let code = await bundle.compile();
	consoleMock.deactivate();
	assertSame(code, `
import {LIPSUM}from'mylib';function warn(...msg) {
	console.error(...msg);
}function echo(msg) {
	warn(msg, LIPSUM);
}export{echo};
	`.trim());

	bundle = makeBundle("./index.js", { resolve: true });
	code = await bundle.compile();
	assertSame(code, `
function warn(...msg) {
	console.error(...msg);
}let LIPSUM = "lorem ipsum dolor sit amet";function echo(msg) {
	warn(msg, LIPSUM);
}export{echo};
	`.trim());

	// XXX: CommonJS glob is relative to CWD
	let filepath = path.relative(ROOT, fixturePath("legacy.js"));
	bundle = makeBundle("./index.legacy.js", { commonjs: filepath });
	code = await bundle.compile();
	assertSame(code, `
var token = "abc123";function warn(...msg) {
	console.error(...msg);
}function echo(msg) {
	warn(msg, token);
}export{echo};
	`.trim());
});

test("tree shaking", async () => {
	let bundle = makeBundle("./index.treeshaking.js");
	let code = await bundle.compile();
	assertSame(code, `
function warn(...msg) {
	console.error(...msg);
}function echo(msg) {
	return warn(msg);
}export{echo};
	`.trim());

	bundle = makeBundle("./index.treeshaking.js", { treeshaking: false });
	code = await bundle.compile();
	assertSame(code, `
function report(...msg) {
	console.log(...msg); // eslint-disable-line no-console
}

function warn(...msg) {
	console.error(...msg);
}function echo(msg) {
	return warn(msg);
}export{echo};
	`.trim());
});

function makeBundle(entryPoint, options) {
	let config = new Config(fixturePath(entryPoint), {
		compact: true,
		...options
	});
	return new Bundle(config);
}
