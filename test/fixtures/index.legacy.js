import { token } from "./legacy";
import { warn } from "./util";

export function echo(msg) {
	warn(msg, token);
}
