import assert from "node:assert/strict";
import test from "node:test";
import { MISSIONS } from "./missions";

test("one guide and five missions carry required model and safety language", () => {
  assert.equal(MISSIONS.length, 6);
  assert.deepEqual(MISSIONS.map((mission) => mission.id), [
    "light-needed-to-see", "straight-corridor", "single-mirror-corner", "two-mirror-viewing-shaft", "convex-lens-focus", "device-use-match",
  ]);
  assert.ok(MISSIONS.every((mission) => mission.modelNote.includes("가상")));
  assert.ok(MISSIONS.some((mission) => mission.safetyNote.includes("햇빛")));
});

test("mirror setup labels use arrows that match their actual orientations", () => {
  const singleMirror = MISSIONS.find((mission) => mission.id === "single-mirror-corner")!;
  assert.deepEqual(singleMirror.setups.map((choice) => choice.label), ["슬롯 A · ↗ 방향 거울", "슬롯 A · ↘ 방향 거울", "슬롯 B · ↘ 방향 거울"]);
  const twoMirror = MISSIONS.find((mission) => mission.id === "two-mirror-viewing-shaft")!;
  assert.match(twoMirror.setups[0].label, /거울 A ↘ · 거울 B ↗/);
});
