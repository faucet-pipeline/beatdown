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
		if(ref.substr) { // lazy loading
			ref = loadExtension(ref, "plugin");
		}
		return config === null ? ref : ref(config);
	}
};
