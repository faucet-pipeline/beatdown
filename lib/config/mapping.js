"use strict";

let { Plugin } = require("./plugin");
let { warn, raise, ValidationError } = require("../util");

let MODULE_FORMATS = { // maps format identifiers to Rollup's equivalent
	esm: "es",
	es: "es", // deprecated alias
	es6: "es", // deprecated alias
	umd: "umd",
	amd: "amd",
	commonjs: "cjs",
	cjs: "cjs", // deprecated alias
	iife: "iife"
};
let NAMELESS_FORMATS = new Set(["es", "amd", "cjs"]); // NB: Rollup identifiers

// `entryPoint` is a file path pointing to a module
//
// `format` (optional; defaults to ESM) determines the bundle's module format
//
// `exports` (optional) determines the bundle's API; the name of the value
// exported by `entryPoint`, if any (e.g. `"MYLIB"`, which would become a
// global variable for IIFEs)
//
// `externals` (optional) determines which modules/packages to exclude from the
// bundle (e.g. `{ jquery: "jQuery" }` - the key refers to the respective
// module/package name, the value refers to a corresponding global variable)
//
// `compact` (boolean) activates condensed bundle code
//
// `sourcemaps` (boolean) activates inline source-map generation
//
// `resolve` (boolean) activates support for implicit module references (i.e.
// implicit file extensions and package paths via Node's resolution algorithm)
//
// `extensions` (optional; depends on `resolve`) is a list of additional file
// extensions for implicit module resolution (e.g. `[".wasm"]`)
//
// `commonJS` (boolean or glob) activates support for importing CommonJS modules
// limited to `node_modules` directory unless a custom glob pattern is specified
//
// `treeshaking` (boolean) can be used to deactivate tree shaking
//
// `parser` (optional) is an Acorn plugin or array thereof
exports.generateConfig = function generateConfig(entryPoint, {
	format = "esm",
	exports: exportID,
	externals,
	compact,
	sourcemaps,
	resolve,
	extensions = [],
	commonjs,
	treeshaking,
	parser
} = {}) {
	if(!resolve && extensions.length) {
		warn("`extensions` ignored because `resolve` is disabled");
	}

	let input = {
		input: entryPoint,
		...((treeshaking || treeshaking === false) && { treeshake: treeshaking }),
		...(parser && { acornInjectPlugins: [].concat(parser) })
	};
	if(externals) { // excluded from bundle
		input.external = Object.keys(externals);
		var globals = externals; // eslint-disable-line no-var
	}

	let plugins = [];
	if(resolve) {
		plugins.push(new Plugin("node-resolve", "@rollup/plugin-node-resolve",
				nodeResolveConfig(extensions)));
	}
	if(commonjs) {
		let defaultGlob = "node_modules/**"; // XXX: implicit reference directory
		plugins.push(new Plugin("commonjs", "@rollup/plugin-commonjs", {
			include: commonjs === true ? defaultGlob : commonjs
		}));
	}

	format = MODULE_FORMATS[format.toLowerCase()] ||
			raise(`unrecognized module format: \`${format}\``, ValidationError,
					"module format");
	let output = {
		indent: false, // TODO: configurable?
		format,
		...(compact && { compact }),
		...(globals && { globals }),
		...(sourcemaps && { sourcemap: sourcemaps })
	};
	if(exportID) {
		if(NAMELESS_FORMATS.has(format)) {
			warn(`\`${format}\` bundle format ignores \`exports\` configuration`);
		}
		output.name = exportID;
	}

	return { input, output, plugins };
};

function nodeResolveConfig(extensions) {
	let resolve = {
		// NB: `jsnext:main` retained for compatibility with older packages
		mainFields: ["module", "jsnext:main", "main"]
	};
	if(extensions && extensions.length) {
		resolve.extensions = [".js"].concat(extensions);
	}
	return resolve;
}
