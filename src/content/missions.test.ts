import assert from "node:assert/strict";
import test from "node:test";
import { MISSIONS } from "./missions";

test("one guide and five missions carry required model and safety language", () => {
  assert.equal(MISSIONS.length, 6);
  assert.deepEqual(MISSIONS.map((mission) => mission.id), [
    "light-needed-to-see", "straight-corridor", "single-mirror-corner", "two-mirror-viewing-shaft", "convex-lens-focus", "device-use-match",
  ]);
  assert.ok(MISSIONS.every((mission) => !mission.modelNote.includes("가상")));
  assert.ok(MISSIONS.some((mission) => mission.safetyNote.includes("햇빛")));
});

test("student wording uses agreed easy labels", () => {
  const guide = MISSIONS.find((mission) => mission.id === "light-needed-to-see");
  const lens = MISSIONS.find((mission) => mission.id === "convex-lens-focus");
  const device = MISSIONS.find((mission) => mission.id === "device-use-match");

  assert.equal(guide?.setupLabel, "관찰할 장면");
  assert.equal(lens?.modelNote, "이 화면은 나란히 들어오는 세 빛줄기가 모이는 장면만 보여 줘요.");
  assert.equal(device?.conceptHelp, "장치의 쓰임을 보면 거울이나 렌즈가 어디에 쓰였는지 알 수 있어요.");
});

test("mirror setup labels use arrows that match their actual orientations", () => {
  const singleMirror = MISSIONS.find((mission) => mission.id === "single-mirror-corner")!;
  assert.deepEqual(singleMirror.setups.map((choice) => choice.label), ["슬롯 A · ↗ 방향 거울", "슬롯 A · ↘ 방향 거울", "슬롯 B · ↘ 방향 거울"]);
  const twoMirror = MISSIONS.find((mission) => mission.id === "two-mirror-viewing-shaft")!;
  assert.match(twoMirror.setups[0].label, /거울 A ↘ · 거울 B ↗/);
});

test("every mission offers clear scene guidance and student-friendly copy", () => {
  const banned = ["검수된", "텍스트 경로표", "가상 빛줄기", "가상 표시", "가상 빛길", "가상 자료", "직진와", "굴절와", "쓰임와"];
  for (const mission of MISSIONS) {
    assert.equal(mission.sceneGuide.length, 3);
    assert.ok(mission.sceneGuide.every((item) => item.hint !== "장면에서 찾아봐요."));
    assert.ok(mission.conceptHelp.length >= 12);
    assert.ok(banned.every((word) => !JSON.stringify(mission).includes(word)));
  }
});

test("scene guides keep the six approved labels and observation hints", () => {
  assert.deepEqual(MISSIONS.map((mission) => mission.sceneGuide), [
    [{ label: "광원", hint: "빛이 시작하는 곳이에요." }, { label: "파란 블록", hint: "빛이 닿아야 보이는 물체예요." }, { label: "관찰창", hint: "빛이 이어지는 마지막 곳이에요." }],
    [{ label: "첫 가림판 구멍", hint: "두 구멍이 같은 높이인지 살펴봐요." }, { label: "둘째 가림판 구멍", hint: "첫 구멍과 높이를 비교해요." }, { label: "표적", hint: "두 구멍을 지난 빛이 닿는 곳이에요." }],
    [{ label: "광원", hint: "빛이 시작하는 곳이에요." }, { label: "거울 자리", hint: "빛이 닿을 거울 자리와 기울기를 비교해요." }, { label: "표지판", hint: "방향이 바뀐 빛이 닿는 곳이에요." }],
    [{ label: "거울 A", hint: "첫 번째로 방향이 바뀌는 자리예요." }, { label: "거울 B", hint: "두 번째로 방향이 바뀌는 자리예요." }, { label: "아래 관찰창", hint: "두 번 방향이 바뀐 빛이 닿는 곳이에요." }],
    [{ label: "평행한 세 빛줄기", hint: "나란히 들어오는 세 빛줄기예요." }, { label: "렌즈 슬롯", hint: "렌즈 뒤 어느 곳에서 빛이 모이는지 비교해요." }, { label: "표적", hint: "빛이 모이는 위치와 비교할 곳이에요." }],
    [{ label: "잠망경", hint: "선택 뒤 거울 역할을 확인해요." }, { label: "돋보기", hint: "선택 뒤 렌즈 역할을 확인해요." }, { label: "카메라", hint: "선택 뒤 렌즈 역할을 확인해요." }],
  ]);
});
