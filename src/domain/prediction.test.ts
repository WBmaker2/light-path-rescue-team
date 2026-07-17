import assert from "node:assert/strict";
import test from "node:test";
import { MISSIONS, getMission } from "../content/missions";
import { predictionMatchesObservation } from "./prediction";
import type { MissionId } from "./types";

test("예상과 선택한 장면의 관찰 결과를 연결한다", () => {
  const guide = getMission("light-needed-to-see");
  const straight = getMission("straight-corridor");
  const singleMirror = getMission("single-mirror-corner");
  const lens = getMission("convex-lens-focus");
  const twoMirror = getMission("two-mirror-viewing-shaft");
  const deviceUse = getMission("device-use-match");

  assert.equal(predictionMatchesObservation(guide, "visible", "visible"), true);
  assert.equal(predictionMatchesObservation(guide, "dark", "dark"), true);
  assert.equal(predictionMatchesObservation(guide, "blocked", "blocked"), true);
  assert.equal(predictionMatchesObservation(guide, "dark", "visible"), false);

  assert.equal(predictionMatchesObservation(straight, "straight", "aligned"), true);
  assert.equal(predictionMatchesObservation(straight, "straight", "upper-hole"), false);

  assert.equal(predictionMatchesObservation(singleMirror, "reflect", "slot-a-down"), true);
  assert.equal(predictionMatchesObservation(singleMirror, "reflect", "slot-a-up"), false);

  assert.equal(predictionMatchesObservation(twoMirror, "twice", "both-turn"), true);
  assert.equal(predictionMatchesObservation(lens, "focus", "left"), true);
  assert.equal(predictionMatchesObservation(lens, "focus", "middle"), true);
  assert.equal(predictionMatchesObservation(lens, "focus", "right"), true);
  assert.equal(predictionMatchesObservation(twoMirror, "once", "first-only"), true);
  assert.equal(predictionMatchesObservation(twoMirror, "once", "both-turn"), false);
  assert.equal(predictionMatchesObservation(deviceUse, "uses", "correct-match"), true);
  assert.equal(predictionMatchesObservation(deviceUse, "uses", "all-mirror"), false);

  assert.equal(predictionMatchesObservation(straight, "up", "upper-hole"), false);
  assert.equal(predictionMatchesObservation(singleMirror, "through", "slot-b-up"), false);
  assert.equal(predictionMatchesObservation(twoMirror, "gone", "wrong-turn"), false);
  assert.equal(predictionMatchesObservation(deviceUse, "same", "all-mirror"), false);
});

test("모든 미션의 예상과 선택 조합을 명시된 관찰 결과로 비교한다", () => {
  const expectedMatches: Record<MissionId, Record<string, readonly string[]>> = {
    "light-needed-to-see": { visible: ["visible"], dark: ["dark"], blocked: ["blocked"] },
    "straight-corridor": { straight: ["aligned"], up: [], down: [] },
    "single-mirror-corner": { reflect: ["slot-a-down"], wall: [], through: [] },
    "two-mirror-viewing-shaft": { twice: ["both-turn"], once: ["first-only"], gone: [] },
    "convex-lens-focus": { focus: ["left", "middle", "right"], parallel: [], mirror: [] },
    "device-use-match": { uses: ["correct-match"], same: [], none: [] },
  };

  for (const mission of MISSIONS) {
    assert.deepEqual(Object.keys(expectedMatches[mission.id]).sort(), mission.predictions.map((choice) => choice.id).sort());
    for (const prediction of mission.predictions) {
      for (const setup of mission.setups) {
        assert.equal(
          predictionMatchesObservation(mission, prediction.id, setup.id),
          expectedMatches[mission.id][prediction.id].includes(setup.id),
          `${mission.id}: ${prediction.id} / ${setup.id}`,
        );
      }
    }
  }
});
