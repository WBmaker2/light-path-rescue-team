import { getMission } from "../content/missions";
import type { MissionId, TraceResult } from "../domain/types";

export type MissionRecord = { id: MissionId; prediction: string; setup: string; changed: boolean; attempts: number; trace: TraceResult; explanation: string };

export function SessionSummary({ records, onRestart }: { records: MissionRecord[]; onRestart: () => void }) {
  const missions = records.filter((record) => record.id !== "light-needed-to-see");
  return <section className="summary" aria-labelledby="summary-title"><p className="eyebrow">빛길 관찰 기록</p><h1 id="summary-title">예상하고, 관찰하고, 근거로 설명했어요.</h1><p>점수 대신 내가 확인한 빛의 성질을 다시 살펴봐요.</p><ul className="summary-cards" aria-label="미션별 관찰 기록">{missions.map((record) => <li key={record.id}><article><h2>{getMission(record.id).property}</h2><p><strong>처음 생각</strong>{record.prediction}</p><p><strong>마지막 선택</strong>{record.setup}</p><p><strong>배운 점</strong>{record.trace.summary}</p><details><summary>선택 기록 자세히 보기</summary><p>{record.attempts}회 확인 · {record.changed ? "선택을 고쳐 봄" : "첫 선택 유지"}</p><p>{record.explanation}</p></details></article></li>)}</ul><section className="next-step"><h2>실제 실험에서 확인할 점</h2><p>화면의 선은 모형 표시예요. 실제 거울과 렌즈 관찰은 선생님 안내에 따라 안전하게 진행해요.</p></section><button className="primary-button" type="button" onClick={onRestart}>처음부터 다시 살펴보기</button></section>;
}
