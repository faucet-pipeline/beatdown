"use strict";

let path = require("path");

let FIXTURES_DIR = path.resolve(__dirname, "fixtures");
let CONSOLE = console;

exports.FIXTURES_DIR = FIXTURES_DIR;
exports.fixturePath = filepath => path.resolve(FIXTURES_DIR, filepath);

exports.consoleMock = {
	activate() {
		let [log, stdout] = bufferedStream();
		let [warn, stderr] = bufferedStream();
		console = { // eslint-disable-line no-global-assign
			log,
			warn,
			error: warn,
			_stdout: stdout,
			_stderr: stderr
		};
	},
	deactivate() {
		console = CONSOLE; // eslint-disable-line no-global-assign
	}
};

function bufferedStream() {
	let buffer = [];
	let append = (...msg) => void buffer.push(msg);
	return [append, {
		log: buffer,
		reset: () => void buffer.splice(0, buffer.length)
	}];
}
