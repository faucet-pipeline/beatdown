"use strict";

let { Plugin } = require("./plugin");
let { report } = require("../util");

module.exports = function generateTranspiler({ browsers, exclude }) {
	if(browsers && browsers.length) {
		report("transpiling JavaScript for", browsers.join(", "));
	}
	return new Plugin("babel", {
		// FIXME: @babel/core and @babel/preset-env are additional dependencies
		module: "@rollup/plugin-babel",
		import: "default"
	}, {
		babelHelpers: "bundled",
		presets: [
			["@babel/preset-env", {
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
	});
};
