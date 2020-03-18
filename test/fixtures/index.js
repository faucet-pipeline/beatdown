import { warn } from "./util";
import { LIPSUM } from "mylib";

export function echo(msg) {
	warn(msg, LIPSUM);
}
