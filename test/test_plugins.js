/* global suite, test */
"use strict";

let { Config } = require("../lib/config");
let { Plugin } = require("../lib/config/plugin");
let assert = require("assert");

let { strictEqual: assertSame, deepStrictEqual: assertDeep } = assert;

suite("configuration: plugins");

test("customization", () => {
	let config = new Config("./index.js");
	assertSame(config.plugins.length, 0);

	let plugin = new Plugin("dummy", "rollup-plugin-dummy", { max: 9 });
	config.addPlugin(plugin);
	assertPlugins(config, ["dummy"]);

	config = makeConfig();
	assertPlugins(config, ["node-resolve", "commonjs"]);

	config = makeConfig();
	config.addPlugin(plugin, { before: "commonjs" });
	assertPlugins(config, ["node-resolve", "dummy", "commonjs"]);

	config = makeConfig();
	config.addPlugin(plugin, { after: "node-resolve" });
	assertPlugins(config, ["node-resolve", "dummy", "commonjs"]);

	config = makeConfig();
	config.addPlugin(plugin, { replace: "node-resolve" });
	assertPlugins(config, ["dummy", "commonjs"]);

	config = makeConfig();
	let cfg = config.getPlugin("commonjs").config;
	assertDeep(cfg, { include: "node_modules/**" });

	config = makeConfig();
	config.removePlugin("node-resolve");
	assertPlugins(config, ["commonjs"]);

	assert.throws(() => {
		config.getPlugin("N/A");
	}, /ValidationError: plugin `N.A` not present/);

	assert.throws(() => {
		config.addPlugin(plugin, { before: "commonjs", after: "node-resolve" });
	}, /ValidationError: `before`, `after` and `replace` must not be combined/);
});

function makeConfig() {
	return new Config("./index.js", {
		resolve: true,
		commonjs: true
	});
}

function assertPlugins(config, ids) {
	let list = config.plugins.map(({ id }) => id);
	assertDeep(list, ids);
}
