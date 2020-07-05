"use strict";

exports.report = console.error;
exports.warn = msg => void console.error(`WARNING: ${msg}`);
exports.raise = raise;

// attempts to load a module, prompting the user to install the corresponding
// package if it is unavailable
// XXX: largely duplicates faucet-core
exports.loadExtension = function loadExtension(pkg, context, supplier = pkg) {
	try {
		return require(pkg);
	} catch(err) {
		if(err.code !== "MODULE_NOT_FOUND") {
			throw err;
		}
		raise(`failed to activate ${context} - please install \`${supplier}\``);
	}
};

exports.ValidationError = class ValidationError extends Error {
	constructor(message, context = null) {
		super(message);
		this.name = "ValidationError";
		this.context = context;
	}
};

function raise(msg, Err = Error, ...args) {
	throw new Err(msg, ...args);
}
