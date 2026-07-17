export type MissionId =
  | "light-needed-to-see"
  | "straight-corridor"
  | "single-mirror-corner"
  | "two-mirror-viewing-shaft"
  | "convex-lens-focus"
  | "device-use-match";

export type TraceStatus =
  | "target-hit"
  | "blocked"
  | "mirror-back"
  | "out-of-bounds"
  | "focus-before-target"
  | "focus-after-target";

export type Point = { x: number; y: number };
export type Vector = Point;
export type Ray = { origin: Point; direction: Vector };
export type Segment = { a: Point; b: Point };
export type MirrorOrientation = "slash" | "backslash";
export type PlaneMirror = { id: string; center: Point; length: number; orientation: MirrorOrientation; frontNormal: Vector };

export type TraceEvent = {
  id: string;
  kind: "source" | "mirror" | "lens" | "block" | "target" | "object";
  label: string;
  point: Point;
  orientation?: MirrorOrientation;
  side?: "front" | "back";
};

export type TraceSegment = { from: Point; to: Point; label: string };

export type TraceResult = {
  status: TraceStatus;
  segments: TraceSegment[];
  events: TraceEvent[];
  summary: string;
};

export type Choice = { id: string; label: string; detail?: string };

export type MissionDefinition = {
  id: MissionId;
  title: string;
  request: string;
  property: "빛이 있어야 보여요" | "직진" | "반사" | "굴절" | "장치 쓰임";
  setupLabel: string;
  setups: Choice[];
  predictions: Choice[];
  explanations: Choice[];
  correctExplanationId: string;
  successSetup: string;
  modelNote: string;
  safetyNote: string;
};
