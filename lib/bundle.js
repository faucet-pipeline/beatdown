"use strict";

let { rollup } = require("rollup");

exports.Bundle = class Bundle {
	// `config` is a `RollupConfig` instance
	constructor(config) {
		this.config = config;
	}

	// XXX: repeated invocation might lead to race condition due to cache?
	async compile(entryPoint) {
		let options = this.config.reify(entryPoint, this._cache);
		let bundle = await rollup(options.input);
		let { output } = await bundle.generate(options.output);
		if(output.length !== 1) {
			throw new Error("unexpected chunking"); // TODO: support for code splitting
		}
		let { code, modules } = output[0];

		this._cache = bundle.cache;
		this._modules = modules;
		return code;
	}
};
