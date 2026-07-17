import type { PlaneMirror, Point, Ray, Segment, Vector } from "./types";

export const EPSILON = 0.000001;
export const dot = (a: Vector, b: Vector) => a.x * b.x + a.y * b.y;
export const cross = (a: Vector, b: Vector) => a.x * b.y - a.y * b.x;
export const subtract = (a: Point, b: Point): Vector => ({ x: a.x - b.x, y: a.y - b.y });
export const add = (a: Point, b: Vector): Point => ({ x: a.x + b.x, y: a.y + b.y });
export const scale = (vector: Vector, amount: number): Vector => ({ x: vector.x * amount, y: vector.y * amount });

export function normalize(vector: Vector): Vector {
  const length = Math.hypot(vector.x, vector.y);
  if (!Number.isFinite(length) || length <= EPSILON) throw new Error("0길이 벡터는 정규화할 수 없습니다.");
  return { x: vector.x / length, y: vector.y / length };
}

export function reflect(incoming: Vector, normal: Vector): Vector {
  const unitIncoming = normalize(incoming);
  const unitNormal = normalize(normal);
  return normalize({ x: unitIncoming.x - 2 * dot(unitIncoming, unitNormal) * unitNormal.x, y: unitIncoming.y - 2 * dot(unitIncoming, unitNormal) * unitNormal.y });
}

export function mirrorSegment(mirror: PlaneMirror): Segment {
  const tangent = normalize(mirror.orientation === "slash" ? { x: 1, y: -1 } : { x: 1, y: 1 });
  const half = scale(tangent, mirror.length / 2);
  return { a: add(mirror.center, scale(half, -1)), b: add(mirror.center, half) };
}

export function raySegmentIntersection(ray: Ray, segment: Segment): { point: Point; distance: number } | null {
  const direction = normalize(ray.direction);
  const edge = subtract(segment.b, segment.a);
  const divisor = cross(direction, edge);
  if (Math.abs(divisor) <= EPSILON) return null;
  const between = subtract(segment.a, ray.origin);
  const distance = cross(between, edge) / divisor;
  const ratio = cross(between, direction) / divisor;
  if (distance <= EPSILON || ratio < -EPSILON || ratio > 1 + EPSILON) return null;
  return { point: add(ray.origin, scale(direction, distance)), distance };
}

export function rayCircleIntersection(ray: Ray, center: Point, radius: number): { point: Point; distance: number } | null {
  const direction = normalize(ray.direction);
  const delta = subtract(ray.origin, center);
  const b = 2 * dot(direction, delta);
  const c = dot(delta, delta) - radius * radius;
  const discriminant = b * b - 4 * c;
  if (discriminant < 0) return null;
  const distance = (-b - Math.sqrt(discriminant)) / 2;
  return distance > EPSILON ? { point: add(ray.origin, scale(direction, distance)), distance } : null;
}
