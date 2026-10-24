// The three browser calls the site needs that plinth doesn't have. All
// other browser code on the site is Bea (src/bea_site/browser/).
import { Ok, Error } from "../../gleam.mjs";

export function prefers_dark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function replace_url(url) {
  history.replaceState(null, "", url);
}

// Runs f, turning a crash (a compiler bug, say) into an Error.
export function rescue(f) {
  try {
    return new Ok(f());
  } catch (error) {
    return new Error(String(error));
  }
}
