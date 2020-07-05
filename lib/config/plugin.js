"use strict";

let { loadExtension } = require("../util");

exports.Plugin = class Plugin {
	constructor(id, ref, config = null, supplier = null) {
		this.id = id;
		this.ref = ref;
		this.config = config;
		if(supplier) {
			this.supplier = supplier;
		}
	}

	init() {
		let { ref, config } = this;
		// lazy loading
		if(ref.substr) {
			ref = this._load(ref);
		} else if(ref.module && ref.import) {
			ref = this._load(ref.module)[ref.import];
		}

		return config === null ? ref : ref(config);
	}

	_load(pkg) {
		return loadExtension(pkg, `plugin \`${this.id}\``, this.supplier);
	}
};
