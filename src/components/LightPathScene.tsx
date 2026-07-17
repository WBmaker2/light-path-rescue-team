import type { MissionDefinition, MirrorOrientation, TraceEvent, TraceResult } from "../domain/types";

type SceneProps = { mission: MissionDefinition; trace: TraceResult | null; setupId: string | null; visibleSegments: number };
const statusText = { "target-hit": "표적에 도착", blocked: "장애물에서 멈춤", "mirror-back": "거울 뒷면에 닿음", "out-of-bounds": "다른 방향으로 나감", "focus-before-target": "표적보다 앞에 모임", "focus-after-target": "표적보다 뒤에 모임" };
const sceneKeyItems: Record<MissionDefinition["id"], readonly [string, string, string]> = {
  "light-needed-to-see": ["광원", "파란 블록", "관찰창"],
  "straight-corridor": ["광원", "가림판 구멍", "표적"],
  "single-mirror-corner": ["광원", "거울 슬롯", "표지판"],
  "two-mirror-viewing-shaft": ["위쪽 물체", "거울 A·B 슬롯", "아래 관찰창"],
  "convex-lens-focus": ["평행한 세 가상 빛줄기", "렌즈 슬롯", "표적"],
  "device-use-match": ["잠망경", "돋보기", "카메라"],
};

function Barrier({ x, gapY, name }: { x: number; gapY: number; name: "first" | "second" }) {
  return <><rect x={x} y="120" width="32" height={gapY - 150} className={`slot-wall ${name}-wall`}/><rect x={x} y={gapY + 30} width="32" height={450 - gapY} className={`slot-wall ${name}-wall`}/></>;
}

function Mirror({ x, y, label, orientation, muted = false }: { x: number; y: number; label: string; orientation: MirrorOrientation; muted?: boolean }) {
  const diagonal = orientation === "slash" ? `M ${x - 24} ${y + 24} L ${x + 24} ${y - 24}` : `M ${x - 24} ${y - 24} L ${x + 24} ${y + 24}`;
  const back = orientation === "slash" ? `M ${x - 31} ${y + 24} L ${x + 17} ${y - 24}` : `M ${x - 31} ${y - 24} L ${x + 17} ${y + 24}`;
  return <g className={muted ? "scene-slot" : ""}><path d={diagonal} className="mirror"/><path d={back} className="mirror-back"/><text x={x} y={y + 48}>{label}</text></g>;
}

function SceneObject({ item }: { item: TraceEvent }) {
  if (item.kind === "mirror") return <Mirror x={item.point.x} y={item.point.y} label={item.label} orientation={item.orientation ?? "slash"} />;
  if (item.kind === "lens") return <g><ellipse cx={item.point.x} cy={item.point.y} rx="13" ry="55" className="lens"/><text x={item.point.x} y={item.point.y + 76}>{item.label}</text></g>;
  if (item.kind === "target") return <g><circle cx={item.point.x} cy={item.point.y} r="22" className="target"/><text x={item.point.x} y={item.point.y + 43}>{item.label}</text></g>;
  if (item.kind === "block") return <g><rect x={item.point.x - 18} y={item.point.y - 38} width="36" height="76" className="block"/><text x={item.point.x} y={item.point.y + 58}>{item.label}</text></g>;
  return <g><circle cx={item.point.x} cy={item.point.y} r="18" className={item.kind === "source" ? "source" : "object"}/><text x={item.point.x} y={item.point.y + 42}>{item.label}</text></g>;
}

function DeviceCard({ x, title, mirror }: { x: number; title: string; mirror?: boolean }) {
  return <g className="device-card"><rect x={x} y="180" width="210" height="220" rx="18" /><text x={x + 105} y="220">{title}</text>{mirror ? <Mirror x={x + 105} y={290} label="평면거울 · 반사" orientation="slash" /> : <><ellipse cx={x + 105} cy="290" rx="15" ry="55" className="lens"/><text x={x + 105} y="370">볼록렌즈 · 굴절</text></>}</g>;
}

function StaticScene({ mission, setupId }: Pick<SceneProps, "mission" | "setupId">) {
  const source = mission.id === "light-needed-to-see" && setupId === "dark" ? <g className="source-off"><circle cx="100" cy="300" r="18"/><path d="M86 286 L114 314 M114 286 L86 314"/><text x="100" y="342">꺼진 광원</text></g> : <SceneObject item={{ id: "source", kind: "source", label: "광원", point: { x: 100, y: 300 } }} />;
  const target = (label: string, x: number, y: number) => <SceneObject item={{ id: label, kind: "target", label, point: { x, y } }} />;
  if (mission.id === "light-needed-to-see") return <>{source}<SceneObject item={{ id: "block", kind: "object", label: "파란 블록", point: { x: 430, y: 300 } }} />{target("관찰창", 760, 300)}<rect x="340" y="110" width="24" height="380" className="slot-wall" /></>;
  if (mission.id === "straight-corridor") return <>{source}<Barrier x={340} gapY={setupId === "upper-hole" ? 220 : 300} name="first"/><Barrier x={590} gapY={300} name="second"/>{target("표적", 850, 300)}</>;
  if (mission.id === "single-mirror-corner") return <>{source}{target("표지판", 430, 120)}<Mirror x={430} y={300} label="슬롯 A" orientation={setupId === "slot-a-up" ? "backslash" : "slash"} muted /><Mirror x={560} y={300} label="슬롯 B" orientation="backslash" muted /></>;
  if (mission.id === "two-mirror-viewing-shaft") return <>{target("위쪽 물체", 210, 110)}{target("아래 관찰창", 120, 460)}<Mirror x={400} y={110} label="거울 A 슬롯" orientation={setupId === "wrong-turn" ? "slash" : "backslash"} muted /><Mirror x={400} y={460} label="거울 B 슬롯" orientation={setupId === "wrong-turn" ? "backslash" : "slash"} muted /></>;
  if (mission.id === "convex-lens-focus") return <><g className="parallel-rays"><path d="M100 180 H600"/><path d="M100 300 H600"/><path d="M100 420 H600"/><text x="220" y="150">평행한 세 가상 빛줄기</text></g>{[340, 450, 560].map((x, index) => <g key={x} className="scene-slot"><ellipse cx={x} cy="300" rx="13" ry="55" className="lens"/><text x={x} y="385">렌즈 슬롯 {index + 1}</text></g>)}{target("표적", 700, 300)}</>;
  return <><DeviceCard x={80} title="잠망경" mirror /><DeviceCard x={395} title="돋보기" /><DeviceCard x={710} title="카메라" /></>;
}

export function LightPathScene({ mission, trace, setupId, visibleSegments }: SceneProps) {
  const overlays = trace?.events.filter((item) => item.kind === "mirror" || item.kind === "lens" || item.kind === "block") ?? [];
  const sceneKey = mission.id === "light-needed-to-see" && setupId === "dark" ? ["꺼진 광원", "파란 블록", "관찰창"] : sceneKeyItems[mission.id];
  const statusLabel = trace?.segments.length === 0 ? "빛길이 시작되지 않음" : trace ? statusText[trace.status] : "";
  return <figure className="scene-card" aria-labelledby="scene-caption"><svg className="light-scene" viewBox="0 0 1000 600" role="img" aria-labelledby="scene-title scene-description"><title id="scene-title">{mission.title} 가상 빛길 장면</title><desc id="scene-description">{trace ? trace.summary : "고정 장면의 핵심 요소를 먼저 살펴본 뒤 빛길을 확인할 수 있습니다."}</desc><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#ffd84d" /></marker></defs><rect x="20" y="20" width="960" height="560" rx="26" className="scene-bg" /><path d="M 85 535 H 915" className="floor" /><StaticScene mission={mission} setupId={setupId} />{trace?.segments.slice(0, visibleSegments).map((segment) => <path key={segment.label} d={`M ${segment.from.x} ${segment.from.y} L ${segment.to.x} ${segment.to.y}`} className="light-ray" markerEnd="url(#arrow)"><title>{segment.label}</title></path>)}{overlays.map((item) => <SceneObject key={`${item.id}-overlay`} item={item} />)}</svg><figcaption id="scene-caption"><strong>가상 빛길 작업대</strong>{trace ? <span className={`status ${trace.status}`}>{statusLabel} · {trace.summary}</span> : <span>화면의 선은 실제 빛 자체가 아닌 진행 방향 표시예요.</span>}<ul className="scene-key" aria-label="장면에서 먼저 찾기">{sceneKey.map((item) => <li key={item}><strong>{item}</strong>: 장면에서 찾아봐요.</li>)}</ul></figcaption></figure>;
}
