"use strict";

let { loadExtension } = require("../util");

exports.Plugin = class Plugin {
	constructor(id, ref, config = null) {
		this.id = id;
		this.ref = ref;
		this.config = config;
	}

	init() {
		let { ref, config } = this;
		// lazy loading
		if(ref.substr) {
			ref = loadExtension(ref, `plugin \`${this.id}\``);
		} else if(ref.module && ref.import) {
			ref = loadExtension(ref.module, `plugin \`${this.id}\``)[ref.import];
		}

		return config === null ? ref : ref(config);
	}
};
