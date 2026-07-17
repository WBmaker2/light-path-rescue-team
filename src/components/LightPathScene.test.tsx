import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { getMission } from "../content/missions";
import { LightPathScene } from "./LightPathScene";

test("scene guide separates a label and hint with a readable colon", () => {
  const markup = renderToStaticMarkup(<LightPathScene mission={getMission("light-needed-to-see")} trace={null} setupId={null} visibleSegments={0} />);
  assert.match(markup, /<strong>광원<\/strong>: <span>빛이 시작하는 곳이에요\.<\/span>/);
});
