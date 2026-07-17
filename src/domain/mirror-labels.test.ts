import assert from "node:assert/strict";
import test from "node:test";
import { MIRROR_ORIENTATION_LABELS } from "./mirror-labels";

test("student mirror arrows match the screen coordinate orientations", () => {
  assert.equal(MIRROR_ORIENTATION_LABELS.slash, "↗");
  assert.equal(MIRROR_ORIENTATION_LABELS.backslash, "↘");
});
