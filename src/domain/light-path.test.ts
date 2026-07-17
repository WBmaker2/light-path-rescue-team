import assert from "node:assert/strict";
import test from "node:test";
import { getTrace } from "./light-path";
import { dot, normalize, raySegmentIntersection, reflect } from "./geometry";

test("straight corridor distinguishes aligned and blocked paths", () => {
  assert.equal(getTrace("straight-corridor", "aligned").status, "target-hit");
  const upperHole = getTrace("straight-corridor", "upper-hole");
  assert.equal(upperHole.status, "blocked");
  assert.equal(upperHole.segments.length, 1);
  assert.deepEqual(upperHole.segments[0], {
    from: { x: 100, y: 300 },
    to: { x: 340, y: 300 },
    label: "구간 1: 광원에서 가림판",
  });
  assert.ok(upperHole.segments.every((segment) => segment.from.y === 300 && segment.to.y === 300));
});

test("꺼진 광원은 빛길 구간을 만들지 않는다", () => {
  const dark = getTrace("light-needed-to-see", "dark");
  assert.equal(dark.status, "blocked");
  assert.deepEqual(dark.segments, []);
});

test("mirror and lens missions return stable success and repair feedback", () => {
  assert.equal(getTrace("single-mirror-corner", "slot-a-down").status, "target-hit");
  assert.equal(getTrace("single-mirror-corner", "slot-b-up").status, "mirror-back");
  assert.equal(getTrace("two-mirror-viewing-shaft", "both-turn").events.filter((event) => event.kind === "mirror").length, 2);
  assert.equal(getTrace("convex-lens-focus", "middle").status, "target-hit");
  assert.equal(getTrace("convex-lens-focus", "left").status, "focus-before-target");
  assert.equal(getTrace("convex-lens-focus", "middle").segments.length, 6);
});

test("finite mirror geometry reflects deterministically without non-finite values", () => {
  const hit = raySegmentIntersection(
    { origin: { x: 0, y: 0 }, direction: normalize({ x: 1, y: 0 }) },
    { a: { x: 5, y: -2 }, b: { x: 5, y: 2 } },
  );
  assert.deepEqual(hit?.point, { x: 5, y: 0 });
  assert.equal(raySegmentIntersection({ origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 } }, { a: { x: -5, y: -2 }, b: { x: -5, y: 2 } }), null);
  const reflected = reflect(normalize({ x: 1, y: 0 }), normalize({ x: -1, y: -1 }));
  assert.ok(Math.abs(dot(reflected, reflected) - 1) < 0.000001);
  assert.ok(reflected.y < -0.99);
  const first = getTrace("two-mirror-viewing-shaft", "both-turn");
  assert.deepEqual(first, getTrace("two-mirror-viewing-shaft", "both-turn"));
  assert.equal(first.events.filter((event) => event.kind === "mirror").length, 2);
  assert.deepEqual(first.events.filter((event) => event.kind === "mirror").map((event) => event.orientation), ["backslash", "slash"]);
  assert.equal(getTrace("single-mirror-corner", "slot-a-down").events.find((event) => event.kind === "mirror")?.side, "front");
  const backFace = getTrace("single-mirror-corner", "slot-b-up");
  assert.equal(backFace.status, "mirror-back");
  assert.equal(backFace.events.find((event) => event.kind === "mirror")?.side, "back");
  assert.ok(first.segments.every((segment) => Object.values(segment.from).concat(Object.values(segment.to)).every(Number.isFinite)));
});
