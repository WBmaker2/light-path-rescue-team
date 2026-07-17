import type { MissionDefinition, MirrorOrientation, TraceEvent, TraceResult } from "../domain/types";

type SceneProps = { mission: MissionDefinition; trace: TraceResult | null; setupId: string | null; visibleSegments: number };
const statusText = { "target-hit": "표적에 도착", blocked: "장애물에서 멈춤", "mirror-back": "거울 뒷면에 닿음", "out-of-bounds": "다른 방향으로 나감", "focus-before-target": "표적보다 앞에 모임", "focus-after-target": "표적보다 뒤에 모임" };

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
  const source = <SceneObject item={{ id: "source", kind: "source", label: "광원", point: { x: 100, y: 300 } }} />;
  const target = (label: string, x: number, y: number) => <SceneObject item={{ id: label, kind: "target", label, point: { x, y } }} />;
  if (mission.id === "light-needed-to-see") return <>{source}<SceneObject item={{ id: "block", kind: "object", label: "파란 블록", point: { x: 430, y: 300 } }} />{target("관찰창", 760, 300)}<rect x="340" y="110" width="24" height="380" className="slot-wall" /></>;
  if (mission.id === "straight-corridor") return <>{source}<rect x="340" y="120" width="32" height="150" className="slot-wall"/><rect x="340" y="330" width="32" height="150" className="slot-wall"/><rect x="590" y="120" width="32" height="150" className="slot-wall"/><rect x="590" y="330" width="32" height="150" className="slot-wall"/>{target("표적", 850, 300)}</>;
  if (mission.id === "single-mirror-corner") return <>{source}{target("표지판", 430, 120)}<Mirror x={430} y={300} label="슬롯 A" orientation={setupId === "slot-a-up" ? "backslash" : "slash"} muted /><Mirror x={560} y={300} label="슬롯 B" orientation="backslash" muted /></>;
  if (mission.id === "two-mirror-viewing-shaft") return <>{target("위쪽 물체", 210, 110)}{target("아래 관찰창", 120, 460)}<Mirror x={400} y={110} label="거울 A 슬롯" orientation={setupId === "wrong-turn" ? "slash" : "backslash"} muted /><Mirror x={400} y={460} label="거울 B 슬롯" orientation={setupId === "wrong-turn" ? "backslash" : "slash"} muted /></>;
  if (mission.id === "convex-lens-focus") return <><g className="parallel-rays"><path d="M100 180 H600"/><path d="M100 300 H600"/><path d="M100 420 H600"/><text x="220" y="150">평행한 세 가상 빛줄기</text></g>{[340, 450, 560].map((x, index) => <g key={x} className="scene-slot"><ellipse cx={x} cy="300" rx="13" ry="55" className="lens"/><text x={x} y="385">렌즈 슬롯 {index + 1}</text></g>)}{target("표적", 700, 300)}</>;
  return <><DeviceCard x={80} title="잠망경" mirror /><DeviceCard x={395} title="돋보기" /><DeviceCard x={710} title="카메라" /></>;
}

export function LightPathScene({ mission, trace, setupId, visibleSegments }: SceneProps) {
  const overlays = trace?.events.filter((item) => item.kind === "mirror" || item.kind === "lens" || item.kind === "block") ?? [];
  return <figure className="scene-card" aria-labelledby="scene-caption"><svg className="light-scene" viewBox="0 0 1000 600" role="img" aria-labelledby="scene-title scene-description"><title id="scene-title">{mission.title} 가상 빛길 장면</title><desc id="scene-description">{trace ? trace.summary : "광원, 표적과 장치 슬롯이 보이는 고정 장면입니다. 선택을 정한 뒤 빛길을 확인할 수 있습니다."}</desc><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#ffd84d" /></marker></defs><rect x="20" y="20" width="960" height="560" rx="26" className="scene-bg" /><path d="M 85 535 H 915" className="floor" /><StaticScene mission={mission} setupId={setupId} />{trace?.segments.slice(0, visibleSegments).map((segment) => <path key={segment.label} d={`M ${segment.from.x} ${segment.from.y} L ${segment.to.x} ${segment.to.y}`} className="light-ray" markerEnd="url(#arrow)"><title>{segment.label}</title></path>)}{overlays.map((item) => <SceneObject key={`${item.id}-overlay`} item={item} />)}</svg><figcaption id="scene-caption"><strong>가상 빛길 작업대</strong>{trace ? <span className={`status ${trace.status}`}>{statusText[trace.status]} · {trace.summary}</span> : <span>광원·표적·고정 슬롯을 먼저 살펴보고, 화면의 선은 실제 빛 자체가 아닌 진행 방향 표시임을 기억해요.</span>}</figcaption></figure>;
}
