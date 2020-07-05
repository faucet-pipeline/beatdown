"use strict";

let { Plugin } = require("beatdown/lib/config/plugin");
let { report } = require("beatdown/lib/util");

let PRESET_ENV = "@babel/preset-env";

//* `browsers` (optional) is an array of Browserslist queries (e.g.
//  `["> 1%", "last 2 versions"]`) to determine which features are transpiled
//* `exclude` (optional) is a list of modules for which to skip transpilation
//  (e.g. `exclude: ["jquery"]`, perhaps due to the respective library's
//  distribution already being optimized for ES5)
module.exports = function generateTranspiler({ browsers, exclude }) {
	if(browsers && browsers.length) {
		report("transpiling JavaScript for", browsers.join(", "));
	}

	let config = {
		babelHelpers: "bundled",
		presets: [
			[PRESET_ENV, {
				modules: false,
				...(browsers && {
					targets: { browsers }
				})
			}]
		],
		...(exclude && {
			exclude: exclude.map(pkg => {
				// distinguish paths from package identifiers - as per Node's
				// resolution algorithm <https://nodejs.org/api/modules.html>, a
				// string is a path if it begins with `/`, `./` or `../`
				// XXX: implicit reference directory for `node_modules`
				return /^\.{0,2}\//.test(pkg) ? pkg : `node_modules/${pkg}/**`;
			})
		})
	};

	let plugin = new Plugin("babel", {
		module: "@rollup/plugin-babel",
		import: "default"
	}, config, "beatdown-babel");
	// ensure controlled error handling for implicit dependency
	plugin._load(PRESET_ENV);

	return plugin;
};
