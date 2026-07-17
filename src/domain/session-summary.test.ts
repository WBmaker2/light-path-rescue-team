import assert from "node:assert/strict";
import test from "node:test";
import { mainMissionRecords } from "./session-summary";

test("session summary excludes the guide activity and keeps five main missions", () => {
  const records = ["light-needed-to-see", "straight-corridor", "single-mirror-corner", "two-mirror-viewing-shaft", "convex-lens-focus", "device-use-match"] as const;
  assert.deepEqual(mainMissionRecords(records.map((id) => ({ id }))).map((record) => record.id), records.slice(1));
});
