import { warn } from "./util.esnext";
import { lipsum } from "mylib/index.esnext";

export let echo = msg => warn(msg, lipsum("Latin"));
