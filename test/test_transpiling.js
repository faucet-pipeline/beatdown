/* global suite, test */
"use strict";

let generateTranspiler = require("../pkg/esnext");
let { Bundle } = require("../lib/bundle");
let { Config } = require("../lib/config");
let { FIXTURES_DIR, fixturePath } = require("./util");
let { strictEqual: assertSame } = require("assert");

suite("transpiling ESNext");

test("basic transpilation", async () => {
	let bundle = makeBundle("./index.esnext.js");
	let code = await bundle.compile();
	/* eslint-disable max-len */
	assertSame(code, `
let warn = (...msg) => console.error(...msg);let lipsum = lang => \`[$\{lang}] lorem ipsum dolor sit amet\`;let echo = msg => warn(msg, lipsum("Latin"));export{echo};
	`.trim());
	/* eslint-enable max-len */

	bundle = makeBundle("./index.esnext.js", {});
	code = await bundle.compile();
	assertSame(code, `
var warn = function warn() {
  var _console2;

  return (_console2 = console).error.apply(_console2, arguments);
};var lipsum = function lipsum(lang) {
  return "[".concat(lang, "] lorem ipsum dolor sit amet");
};var echo = function echo(msg) {
  return warn(msg, lipsum("Latin"));
};export{echo};
	`.trim());
});

test("Browserslist support", async () => {
	let bundle = makeBundle("./index.esnext.js", {
		browsers: ["current Node"]
	});
	let code = await bundle.compile();
	/* eslint-disable max-len */
	assertSame(code, `
let warn = (...msg) => console.error(...msg);let lipsum = lang => \`[$\{lang}] lorem ipsum dolor sit amet\`;let echo = msg => warn(msg, lipsum("Latin"));export{echo};
	`.trim());
	/* eslint-enable max-len */
});

test("selectively skipping transpilation", async () => {
	let cwd = process.cwd();
	process.chdir(FIXTURES_DIR); // FIXME: smell
	let bundle = makeBundle("./index.esnext.js", {
		exclude: ["mylib"]
	});
	let code = await bundle.compile();
	process.chdir(cwd);
	/* eslint-disable max-len */
	assertSame(code, `
var warn = function warn() {
  var _console2;

  return (_console2 = console).error.apply(_console2, arguments);
};let lipsum = lang => \`[$\{lang}] lorem ipsum dolor sit amet\`;var echo = function echo(msg) {
  return warn(msg, lipsum("Latin"));
};export{echo};
	`.trim());
	/* eslint-enable max-len */
});

function makeBundle(entryPoint, esnext) {
	let config = new Config(fixturePath(entryPoint), {
		compact: true,
		resolve: true
	});
	if(esnext) {
		let plugin = generateTranspiler(esnext);
		config.addPlugin(plugin);
	}
	return new Bundle(config);
}
