import assert from "node:assert/strict";
import test from "node:test";
import type { TraceResult } from "../domain/types";
import { repairHintFor } from "./MissionWorkspace";

function trace(status: TraceResult["status"], segments = 1): TraceResult {
  return { status, events: [], summary: "", segments: Array.from({ length: segments }, () => ({ from: { x: 0, y: 0 }, to: { x: 1, y: 1 }, label: "빛길" })) };
}

test("repair hints identify every failed light-path result", () => {
  assert.equal(repairHintFor(trace("blocked", 0), 1), "빛길이 시작되지 않았어요. 광원이 켜져 있는지 확인하고 한 가지를 고쳐 다시 확인해요.");
  assert.match(repairHintFor(trace("blocked"), 2), /빛길이 끝까지 이어지지 않았어요.*한 가지를 고쳐/);
  assert.match(repairHintFor(trace("mirror-back"), 3), /빛이 거울 뒷면에 닿았어요.*두 보기를 비교/);
  assert.match(repairHintFor(trace("out-of-bounds"), 1), /빛길이 표적과 다른 방향으로 갔어요/);
  assert.match(repairHintFor(trace("focus-before-target"), 2), /빛이 표적보다 앞에서 모였어요.*한 가지를 고쳐/);
  assert.match(repairHintFor(trace("focus-after-target"), 3), /빛이 표적보다 뒤에서 모였어요.*두 보기를 비교/);
});
