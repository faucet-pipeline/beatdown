/* global suite, test */
"use strict";

let diskless = require("../lib/diskless");
let { Bundle } = require("../lib/bundle");
let { Config } = require("../lib/config");
let { Plugin } = require("../lib/config/plugin");
let { FIXTURES_DIR, consoleMock } = require("./util");
let assert = require("assert");

let { strictEqual: assertSame, deepStrictEqual: assertDeep } = assert;

suite("diskless plugin");

test("virtual modules", async () => {
	let virtual = diskless({ referenceDir: FIXTURES_DIR });
	let plugin = new Plugin("diskless", virtual);

	let config = new Config("diskless:index.js", { compact: true });
	config.addPlugin(plugin);

	let bundle = new Bundle(config);
	await assert.rejects(() => {
		return bundle.compile();
	}, /missing diskless module: `index.js`/);

	virtual.register("index.js", "export let TOKEN = 123;");
	let res = await bundle.compile();
	assertSame(res, "let TOKEN = 123;export{TOKEN};");
});

test("module resolution", async () => {
	let virtual = diskless({ referenceDir: FIXTURES_DIR });
	let plugin = new Plugin("diskless", virtual);

	let config = new Config("diskless:index.js", { compact: true });
	config.addPlugin(plugin);
	let bundle = new Bundle(config);

	virtual.register("index.js", `
import { info } from "diskless:util.js";

export default msg => info("hello", msg);
	`);
	await assert.rejects(() => {
		return bundle.compile();
	}, /missing diskless module: `util.js`/);

	virtual.register("util.js", `
export function info(...msg) {
	console.log(...msg);
}
	`);
	assertSame(await bundle.compile(), `
function info(...msg) {
	console.log(...msg);
}var diskless_index = msg => info("hello", msg);export default diskless_index;
	`.trim());

	virtual.register("index.js", `
import { warn } from "./util.js";

export default msg => warn("hello", msg);
	`);
	assertSame(await bundle.compile(), `
function warn(...msg) {
	console.error(...msg);
}var diskless_index = msg => warn("hello", msg);export default diskless_index;
	`.trim());
});

test("implicit module references are unsupported", async () => {
	let virtual = diskless({ referenceDir: FIXTURES_DIR });
	let plugin = new Plugin("diskless", virtual);

	let config = new Config("diskless:index.js", {
		resolve: true,
		compact: true
	});
	config.addPlugin(plugin);
	let bundle = new Bundle(config);

	virtual.register("index.js", `
import { warn } from "./util";

export default msg => warn("hello", msg);
	`);
	await assert.rejects(() => {
		return bundle.compile();
	}, / ENOENT: no such file or directory/);

	virtual.register("index.js", `
import { LIPSUM } from "mylib";

export default msg => info(LIPSUM, msg);
	`);

	consoleMock.activate();
	await bundle.compile();
	assertDeep(console._stderr.log, [ // eslint-disable-line no-console
		// eslint-disable-next-line max-len
		["'mylib' is imported by diskless:index.js, but could not be resolved – treating it as an external dependency"]
	]);
	consoleMock.deactivate();
});
