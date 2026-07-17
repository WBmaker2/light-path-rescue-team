import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { getTrace } from "../domain/light-path";
import { SessionSummary, type MissionRecord } from "./SessionSummary";

const ids = ["straight-corridor", "single-mirror-corner", "two-mirror-viewing-shaft", "convex-lens-focus", "device-use-match"] as const;
const setupById = {
  "straight-corridor": "aligned",
  "single-mirror-corner": "slot-a-down",
  "two-mirror-viewing-shaft": "both-turn",
  "convex-lens-focus": "middle",
  "device-use-match": "correct-match",
} as const;

test("summary headings distinguish every mission, including the two reflection missions", () => {
  const records: MissionRecord[] = ids.map((id) => ({
    id,
    prediction: "예상",
    setup: "선택",
    changed: false,
    attempts: 1,
    trace: getTrace(id, setupById[id]),
    explanation: "설명",
  }));
  const markup = renderToStaticMarkup(<SessionSummary records={records} onRestart={() => {}} />);

  for (const heading of ["미션 1 · 직진", "미션 2 · 반사", "미션 3 · 반사", "미션 4 · 굴절", "미션 5 · 장치 쓰임"]) {
    assert.match(markup, new RegExp(`<h2>${heading}</h2>`));
  }
});
