"use strict";

let { generateConfig } = require("./mapping");
let { ValidationError } = require("../util");

exports.Config = class Config {
	constructor(entryPoint, options) {
		let { input, output, plugins } = generateConfig(entryPoint, options);
		this.input = input;
		this.output = output;
		this.plugins = plugins;
	}

	reify(entryPoint, cache) {
		let plugins = this._plugins;
		if(!plugins) { // initialize
			let plugs = this.plugins;
			this._plugins = plugins = plugs.length && plugs.map(p => p.init());
		}
		return {
			input: {
				...this.input,
				...(entryPoint && { input: entryPoint }),
				...(plugins && { plugins }),
				...(cache && { cache })
			},
			output: this.output
		};
	}

	addPlugin(plugin, { before, after, replace } = {}) {
		if([before, after, replace].filter(Boolean).length > 1) {
			throw new ValidationError("`before`, `after` and `replace` must " +
					"not be combined");
		}

		let refID = before || after || replace;
		let plugins = this.plugins;
		if(!refID) {
			plugins.push(plugin);
			return;
		}
		let i = this._pluginIndex(refID);
		plugins.splice(after ? i + 1 : i, replace ? 1 : 0, plugin);
	}

	removePlugin(id) {
		let i = this._pluginIndex(id);
		this.plugins.splice(i, 1);
	}

	getPlugin(id) {
		let i = this._pluginIndex(id);
		return this.plugins[i];
	}

	_pluginIndex(id) {
		let index = null;
		this.plugins.some((plugin, i) => {
			if(plugin.id === id) {
				index = i;
				return true;
			}
		});
		if(index === null) {
			throw new ValidationError(`plugin \`${id}\` not present`);
		}
		return index;
	}
};
