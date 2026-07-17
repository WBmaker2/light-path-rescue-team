import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("social preview uses the deployed Sites host", () => {
  const layout = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /metadataBase:\s*new URL\("https:\/\/light-path-rescue-team\.wbmaker\.chatgpt\.site"\)/);
  assert.match(layout, /url: "\/og\.png"/);
  assert.doesNotMatch(layout, /제한된 굴절/);
});
