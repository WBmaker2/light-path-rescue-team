import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("social preview uses the deployed GitHub Pages host and relative favicon", () => {
  const layout = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /metadataBase:\s*new URL\("https:\/\/wbmaker2\.github\.io\/light-path-rescue-team\/"\)/);
  assert.match(layout, /<link rel="icon" href="\/favicon\.svg" \/>/);
  assert.doesNotMatch(layout, /icons:\s*\{/);
  assert.match(layout, /url: "\/og\.png"/);
  assert.doesNotMatch(layout, /제한된 굴절/);
});
