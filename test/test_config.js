/* global suite, test, before, after */
"use strict";

let { Config } = require("../lib/config");
let { consoleMock } = require("./util");
let { strictEqual: assertSame, deepStrictEqual: assertDeep } = require("assert");

suite("configuration");

before(() => {
	consoleMock.activate();
});

after(() => {
	consoleMock.deactivate();
});

test("bundle API", () => {
	let config = new Config("./index.js", {
		format: "iife",
		exports: "MYLIB"
	});
	assertSame(config.output.name, "MYLIB");
});

test("dependency exclusion", () => {
	let config = new Config("./index.js", {
		externals: { jquery: "jQuery" }
	});
	assertDeep(config.input.external, ["jquery"]);
	assertDeep(config.output.globals, { jquery: "jQuery" });
});

test("compacting", () => {
	let config = new Config("./index.js", { compact: true });
	assertSame(config.output.compact, true);
});

test("source maps", () => {
	let config = new Config("./index.js", { sourcemaps: true });
	assertSame(config.output.sourcemap, true);
});

test("implicit module references", () => {
	let config = new Config("./index.js", { resolve: true });
	assertDeep(config.plugins.map(({ id, config }) => ({ id, config })), [{
		id: "node-resolve",
		config: {
			mainFields: ["module", "jsnext:main", "main"]
		}
	}]);

	config = new Config("./index.js", {
		resolve: true,
		extensions: [".wasm"]
	});
	assertDeep(config.plugins.map(({ id, config }) => ({ id, config })), [{
		id: "node-resolve",
		config: {
			mainFields: ["module", "jsnext:main", "main"],
			extensions: [".js", ".wasm"]
		}
	}]);

	// eslint-disable-next-line no-new
	new Config("./index.js", { extensions: [".wasm"] });
	assertDeep(console._stderr.log, [ // eslint-disable-line no-console
		["WARNING: `extensions` ignored because `resolve` is disabled"]
	]);
});

test("CommonJS support", () => {
	let config = new Config("./index.js", { commonjs: true });
	assertDeep(config.plugins.map(({ id, config }) => ({ id, config })), [{
		id: "commonjs",
		config: {
			include: "node_modules/**"
		}
	}]);

	config = new Config("./index.js", { commonjs: "lib/**" });
	assertDeep(config.plugins.map(({ id, config }) => ({ id, config })), [{
		id: "commonjs",
		config: {
			include: "lib/**"
		}
	}]);
});

test("parser extension", () => {
	let config = new Config("./index.js");
	assertSame(config.input.acornInjectPlugins, undefined);

	let JSX = Symbol("placeholder");
	config = new Config("./index.js", { parser: JSX });
	assertDeep(config.input.acornInjectPlugins, [JSX]);

	let COFFEE = Symbol("placeholder");
	config = new Config("./index.js", { parser: [JSX, COFFEE] });
	assertDeep(config.input.acornInjectPlugins, [JSX, COFFEE]);
});
