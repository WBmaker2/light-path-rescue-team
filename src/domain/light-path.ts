import { add, dot, normalize, rayCircleIntersection, raySegmentIntersection, reflect, scale } from "./geometry";
import type { MissionId, PlaneMirror, Point, Ray, TraceEvent, TraceResult, TraceStatus, Vector } from "./types";

const p = (x: number, y: number): Point => ({ x, y });
const event = (id: string, kind: TraceEvent["kind"], label: string, point: Point, extra: Partial<TraceEvent> = {}): TraceEvent => ({ id, kind, label, point, ...extra });
const source = p(100, 300);

type Target = { id: string; label: string; center: Point; radius: number };
type MirrorHit = { mirror: PlaneMirror; point: Point; distance: number };

function segmentLabel(index: number, from: string, to: string) { return `구간 ${index}: ${from}에서 ${to}`; }
function exitPoint(ray: Ray): Point {
  const candidates = [ray.direction.x > 0 ? (1000 - ray.origin.x) / ray.direction.x : -ray.origin.x / ray.direction.x, ray.direction.y > 0 ? (600 - ray.origin.y) / ray.direction.y : -ray.origin.y / ray.direction.y].filter((value) => Number.isFinite(value) && value > 0.001);
  return add(ray.origin, scale(normalize(ray.direction), Math.min(...candidates)));
}

function traceMirrors(start: Point, direction: Vector, target: Target, mirrors: PlaneMirror[]): TraceResult {
  let ray: Ray = { origin: start, direction: normalize(direction) };
  const events: TraceEvent[] = [event("source", "source", "광원", start)];
  const segments: TraceResult["segments"] = [];
  for (let count = 0; count < 3; count += 1) {
    const targetHit = rayCircleIntersection(ray, target.center, target.radius);
    const mirrorHits: MirrorHit[] = mirrors.map((mirror) => {
      const hit = raySegmentIntersection(ray, { a: add(mirror.center, scale(normalize(mirror.orientation === "slash" ? { x: 1, y: -1 } : { x: 1, y: 1 }), -mirror.length / 2)), b: add(mirror.center, scale(normalize(mirror.orientation === "slash" ? { x: 1, y: -1 } : { x: 1, y: 1 }), mirror.length / 2)) });
      return hit ? { mirror, ...hit } : null;
    }).filter((hit): hit is MirrorHit => hit !== null).sort((a, b) => a.distance - b.distance || a.mirror.id.localeCompare(b.mirror.id));
    const mirrorHit = mirrorHits[0];
    if (targetHit && (!mirrorHit || targetHit.distance < mirrorHit.distance)) {
      segments.push({ from: ray.origin, to: targetHit.point, label: segmentLabel(segments.length + 1, events.at(-1)!.label, target.label) });
      events.push(event(target.id, "target", target.label, targetHit.point));
      return { status: "target-hit", events, segments, summary: `${events.filter((item) => item.kind === "mirror").length}번 반사한 가상 빛길이 ${target.label}에 닿았어요.` };
    }
    if (!mirrorHit) break;
    const side = dot(ray.direction, normalize(mirrorHit.mirror.frontNormal)) < -0.00001 ? "front" : "back";
    segments.push({ from: ray.origin, to: mirrorHit.point, label: segmentLabel(segments.length + 1, events.at(-1)!.label, mirrorHit.mirror.id) });
    events.push(event(mirrorHit.mirror.id, "mirror", mirrorHit.mirror.id, mirrorHit.point, { orientation: mirrorHit.mirror.orientation, side }));
    if (side === "back") return { status: "mirror-back", events, segments, summary: "거울의 반사면 반대쪽에 닿았어요. 거울 방향을 확인해요." };
    ray = { origin: add(mirrorHit.point, scale(reflect(ray.direction, mirrorHit.mirror.frontNormal), 0.001)), direction: reflect(ray.direction, mirrorHit.mirror.frontNormal) };
  }
  const out = exitPoint(ray);
  segments.push({ from: ray.origin, to: out, label: segmentLabel(segments.length + 1, events.at(-1)!.label, "표적과 다른 방향") });
  events.push(event("edge", "block", "표적과 다른 방향", out));
  return { status: "out-of-bounds", events, segments, summary: "빛길이 표적과 다른 방향으로 나갔어요." };
}

function simpleTrace(status: TraceStatus, points: Point[], events: TraceEvent[], summary: string): TraceResult {
  return { status, events, summary, segments: points.slice(1).map((to, index) => ({ from: points[index], to, label: segmentLabel(index + 1, events[index]?.label ?? "빛길", events[index + 1]?.label ?? "다음 지점") })) };
}

function lensTrace(setupId: string): TraceResult {
  const lensX = setupId === "left" ? 340 : setupId === "right" ? 560 : 450;
  const focus = p(lensX + 250, 300);
  const status: TraceStatus = focus.x === 700 ? "target-hit" : focus.x < 700 ? "focus-before-target" : "focus-after-target";
  const levels = [180, 300, 420];
  const labels = ["위", "가운데", "아래"];
  return { status, events: [event("source", "source", "세 평행 광선", p(100, 300)), event("lens", "lens", "볼록렌즈", p(lensX, 300)), event("focus", status === "target-hit" ? "target" : "object", status === "target-hit" ? "표적 위치의 초점" : "빛이 모이는 위치", focus)], segments: levels.flatMap((y, index) => [{ from: p(100, y), to: p(lensX, y), label: `구간 ${index * 2 + 1}: ${labels[index]}쪽 평행 광선에서 볼록렌즈` }, { from: p(lensX, y), to: focus, label: `구간 ${index * 2 + 2}: 볼록렌즈에서 초점` }]), summary: status === "target-hit" ? "세 평행 광선이 표적 위치에서 모였어요." : status === "focus-before-target" ? "빛이 표적보다 앞에서 모였어요." : "빛이 표적보다 뒤에서 모여요." };
}

function deviceTrace(setupId: string): TraceResult {
  if (setupId === "correct-match") return {
    status: "target-hit",
    events: [event("periscope", "object", "잠망경", p(185, 290)), event("magnifier", "object", "돋보기", p(500, 290)), event("camera", "object", "카메라", p(815, 290))],
    segments: [
      { from: p(130, 290), to: p(240, 290), label: "잠망경 → 평면거울 → 반사" },
      { from: p(445, 290), to: p(555, 290), label: "돋보기 → 볼록렌즈 → 굴절" },
      { from: p(760, 290), to: p(870, 290), label: "카메라 → 볼록렌즈 → 굴절" },
    ],
    summary: "세 장치와 빛의 성질을 알맞게 연결했어요.",
  };
  const selectedRole = setupId === "all-mirror" ? "평면거울 역할" : "볼록렌즈 역할";
  return simpleTrace("blocked", [source, p(420, 300)], [event("source", "source", "장치 카드", source), event("block", "block", "맞지 않는 연결", p(420, 300))], `세 장치를 모두 ${selectedRole}로 연결했어요. 장치마다 알맞은 역할을 다시 살펴봐요.`);
}

const singleMirrors: Record<string, PlaneMirror[]> = {
  "slot-a-down": [{ id: "평면거울 A", center: p(430, 300), length: 110, orientation: "slash", frontNormal: p(-1, -1) }],
  "slot-a-up": [{ id: "평면거울 A", center: p(430, 300), length: 110, orientation: "backslash", frontNormal: p(-1, 1) }],
  "slot-b-up": [{ id: "평면거울 B", center: p(560, 300), length: 110, orientation: "backslash", frontNormal: p(1, -1) }],
};
const twoMirrors: Record<string, PlaneMirror[]> = {
  "both-turn": [{ id: "평면거울 A", center: p(400, 110), length: 100, orientation: "backslash", frontNormal: p(-1, 1) }, { id: "평면거울 B", center: p(400, 460), length: 100, orientation: "slash", frontNormal: p(-1, -1) }],
  "first-only": [{ id: "평면거울 A", center: p(400, 110), length: 100, orientation: "backslash", frontNormal: p(-1, 1) }],
  "wrong-turn": [{ id: "평면거울 A", center: p(400, 110), length: 100, orientation: "slash", frontNormal: p(-1, -1) }, { id: "평면거울 B", center: p(400, 460), length: 100, orientation: "backslash", frontNormal: p(-1, 1) }],
};

export function getTrace(missionId: MissionId, setupId: string): TraceResult {
  if (missionId === "light-needed-to-see") {
    if (setupId === "visible") return simpleTrace("target-hit", [source, p(430, 300), p(760, 300)], [event("source", "source", "광원", source), event("block", "object", "파란 블록", p(430, 300)), event("target", "target", "관찰창", p(760, 300))], "빛이 블록과 관찰창까지 이어져 보여요.");
    if (setupId === "dark") return { status: "blocked", events: [event("source-off", "source", "꺼진 광원", source)], segments: [], summary: "광원이 꺼져 있어 빛길이 시작되지 않아요." };
    return simpleTrace("blocked", [source, p(360, 300)], [event("source", "source", "광원", source), event("block", "block", "가림판", p(360, 300))], "빛이 블록 앞 가림판에서 멈췄어요.");
  }
  if (missionId === "straight-corridor") return setupId === "aligned" ? simpleTrace("target-hit", [source, p(350, 300), p(600, 300), p(850, 300)], [event("source", "source", "광원", source), event("gap-a", "object", "첫 번째 구멍", p(350, 300)), event("gap-b", "object", "두 번째 구멍", p(600, 300)), event("target", "target", "표적", p(850, 300))], "빛이 같은 공기 속에서 곧게 나아가 표적에 닿았어요.") : simpleTrace("blocked", [source, p(340, 300)], [event("source", "source", "광원", source), event("block", "block", "가림판", p(340, 300))], "빛이 어긋난 가림판에서 멈췄어요.");
  if (missionId === "single-mirror-corner") return traceMirrors(source, p(1, 0), { id: "target", label: "표지판", center: p(430, 120), radius: 26 }, singleMirrors[setupId] ?? []);
  if (missionId === "two-mirror-viewing-shaft") return traceMirrors(p(210, 110), p(1, 0), { id: "target", label: "아래 관찰창", center: p(120, 460), radius: 26 }, twoMirrors[setupId] ?? []);
  if (missionId === "convex-lens-focus") return lensTrace(setupId);
  return deviceTrace(setupId);
}
