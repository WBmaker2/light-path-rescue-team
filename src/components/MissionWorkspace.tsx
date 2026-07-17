"use client";

import { useEffect, useRef, useState } from "react";
import { MISSIONS } from "../content/missions";
import { getTrace } from "../domain/light-path";
import { predictionMatchesObservation } from "../domain/prediction";
import type { TraceResult } from "../domain/types";
import { LightPathScene } from "./LightPathScene";
import { SessionSummary, type MissionRecord } from "./SessionSummary";

type WorkspaceProps = { onCompletedChange: (count: number) => void };

export function MissionWorkspace({ onCompletedChange }: WorkspaceProps) {
  const [screen, setScreen] = useState<"start" | "safety" | "mission" | "summary">("start");
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [setup, setSetup] = useState<string | null>(null);
  const [firstSetup, setFirstSetup] = useState<string | null>(null);
  const [trace, setTrace] = useState<TraceResult | null>(null);
  const [visibleSegments, setVisibleSegments] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [records, setRecords] = useState<MissionRecord[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const mission = MISSIONS[index];
  const predictionChoice = mission.predictions.find((choice) => choice.id === prediction);
  const setupChoice = mission.setups.find((choice) => choice.id === setup);

  useEffect(() => { if (screen === "mission") headingRef.current?.focus(); }, [index, screen]);
  useEffect(() => { onCompletedChange(records.filter((record) => record.id !== "light-needed-to-see").length); }, [records, onCompletedChange]);
  useEffect(() => {
    if (!trace || !window.matchMedia("(max-width: 820px)").matches) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sceneRef.current?.focus({ preventScroll: true });
    sceneRef.current?.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  }, [trace]);

  const resetTrace = () => { setTrace(null); setVisibleSegments(0); setExplanation(null); setFeedback(""); };
  const changeSetup = (choice: string) => { setSetup(choice); resetTrace(); };
  const choosePrediction = (choice: string) => { setPrediction(choice); resetTrace(); };
  const resetSession = () => { setScreen("start"); setIndex(0); setPrediction(null); setSetup(null); setFirstSetup(null); setTrace(null); setVisibleSegments(0); setAttempts(0); setExplanation(null); setFeedback(""); setRecords([]); };
  const checkTrace = () => {
    if (!prediction || !setup) return;
    const result = getTrace(mission.id, setup);
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTrace(result); setAttempts((value) => value + 1); setFirstSetup((value) => value ?? setup); setVisibleSegments(result.segments.length === 0 ? 0 : reduceMotion ? result.segments.length : 1); setExplanation(null); setFeedback("");
  };
  const chooseExplanation = (choice: string) => {
    setExplanation(choice);
    if (choice !== mission.correctExplanationId) { setFeedback("현재 경로에서 실제로 방향이 바뀌거나 모인 지점을 다시 읽고, 근거를 한 번 더 골라 봐요."); return; }
    if (!trace || trace.status !== "target-hit") { setFeedback("먼저 표적에 닿는 경로를 만들고, 그 경로를 근거로 설명해요."); return; }
    setFeedback("맞아요. 그림에서 확인한 빛길과 잘 연결했어요.");
  };
  const next = () => {
    if (!trace || !prediction || !setup || explanation !== mission.correctExplanationId) return;
    const record: MissionRecord = { id: mission.id, prediction: predictionChoice?.label ?? prediction, setup: setupChoice?.label ?? setup, changed: firstSetup !== null && firstSetup !== setup, attempts, trace, explanation: mission.explanations.find((choice) => choice.id === explanation)?.label ?? explanation };
    setRecords((current) => [...current.filter((item) => item.id !== mission.id), record]);
    if (index === MISSIONS.length - 1) { setScreen("summary"); return; }
    setIndex(index + 1); setPrediction(null); setSetup(null); setFirstSetup(null); setTrace(null); setVisibleSegments(0); setAttempts(0); setExplanation(null); setFeedback("");
  };

  if (screen === "start") return <section className="welcome" aria-labelledby="welcome-title"><p className="eyebrow">초등 5~6학년 · 약 15~20분</p><h1 id="welcome-title">빛은 어디에서 곧게 가고,<br />어디에서 방향을 바꿀까요?</h1><p>빛길을 먼저 예상하고, 거울과 렌즈의 역할을 고른 뒤 가상 경로를 관찰해 봐요.</p><div className="goal-list"><span>1. 먼저 예상하기</span><span>2. 빛길 관찰하기</span><span>3. 근거로 고쳐 보기</span></div><p className="privacy">이 앱은 이름이나 사진을 받지 않고, 선택은 이 화면을 닫으면 남지 않아요.</p><button className="primary-button" type="button" onClick={() => setScreen("safety")}>빛길 구조 시작 <span aria-hidden="true">→</span></button></section>;
  if (screen === "safety") return <section className="safety-screen" aria-labelledby="safety-title"><p className="eyebrow">시작 전 약속</p><h1 id="safety-title">이 화면은 실제 빛을 보여 주는 실험이 아니에요.</h1><div className="safety-grid"><article><h2>가상 빛줄기</h2><p>노란 선은 빛의 진행 방향을 이해하기 위한 가상 표시예요.</p></article><article><h2>제한된 모형</h2><p>볼록렌즈는 평행하게 들어오는 세 빛줄기가 모이는 장면만 보여 줘요.</p></article><article><h2>안전하게</h2><p>강한 빛이나 햇빛을 눈에 비추거나 렌즈로 모으지 않아요. 실제 실험은 선생님과 해요.</p></article></div><button className="primary-button" type="button" onClick={() => setScreen("mission")}>확인했어요</button></section>;
  if (screen === "summary") return <SessionSummary records={records} onRestart={resetSession} />;

  const canExplain = trace?.status === "target-hit";
  const explanationDone = explanation === mission.correctExplanationId && canExplain;
  const repairHint = trace && !canExplain && attempts >= 3 ? "세 번 확인했어요. 거울은 반사면이 광원을 향하는지, 렌즈는 세 슬롯 중 초점이 표적과 같은지 두 후보부터 비교해 봐요." : trace && !canExplain && attempts >= 2 ? "두 번째 확인이에요. 빛길이 마지막으로 방향을 바꾼 장치를 찾아, 위치나 방향 한 가지만 고쳐 봐요." : trace && !canExplain ? "빛길이 막혔어요. 지금 선택에서 위치나 방향 하나를 고쳐 다시 확인해요." : "";
  return <section className="workspace" aria-labelledby="mission-title"><div className="mission-topline"><span>{index === 0 ? "안내 활동" : `본 미션 ${index}/5`}</span><span>단계: 예상 → 선택 → 관찰 → 근거</span></div><div className="progress-wrap"><span>전체 6단계 중 {index + 1}단계</span><div role="progressbar" aria-label="활동 진행" aria-valuemin={1} aria-valuemax={MISSIONS.length} aria-valuenow={index + 1}><span style={{ width: `${((index + 1) / MISSIONS.length) * 100}%` }} /></div></div><h1 id="mission-title" tabIndex={-1} ref={headingRef}>{mission.title}</h1><p className="mission-request">{mission.request}</p><div className="workspace-grid"><LightPathScene ref={sceneRef} mission={mission} trace={trace} setupId={setup} visibleSegments={visibleSegments} /><div className="choice-column"><fieldset className="choice-panel"><legend>1. 내 예상은?</legend><p>결과를 보기 전에 하나를 골라요.</p><div className="choice-list">{mission.predictions.map((choice) => <label key={choice.id} className={prediction === choice.id ? "choice selected" : "choice"}><input type="radio" name="prediction" checked={prediction === choice.id} onChange={() => choosePrediction(choice.id)} /><span>{choice.label}{choice.detail && <small>{choice.detail}</small>}</span></label>)}</div></fieldset><fieldset className="choice-panel"><legend>2. {mission.setupLabel}</legend><p>준비된 보기 중 하나를 골라요.</p><div className="choice-list">{mission.setups.map((choice) => <label key={choice.id} className={setup === choice.id ? "choice selected" : "choice"}><input type="radio" name="setup" checked={setup === choice.id} onChange={() => changeSetup(choice.id)} /><span>{choice.label}{choice.detail && <small>{choice.detail}</small>}</span></label>)}</div></fieldset><button className="primary-button" type="button" disabled={!prediction || !setup} onClick={checkTrace}>빛길 확인</button>{trace && <TraceRecord trace={trace} prediction={predictionChoice?.label ?? ""} predictionMatches={predictionMatchesObservation(mission, prediction ?? "", setup ?? "")} visibleSegments={visibleSegments} onStep={() => setVisibleSegments((value) => Math.min(value + 1, trace.segments.length))} onShowAll={() => setVisibleSegments(trace.segments.length)} />}</div></div>{trace && <section className="explanation-panel" aria-labelledby="explanation-title"><h2 id="explanation-title">3. 본 것을 바탕으로 설명하기</h2><p>1. 그림에서 빛이 멈추거나 방향을 바꾼 곳을 찾아요. 2. 빛길 순서를 읽어요. 3. 알맞은 설명을 골라요.</p><p className="concept-help">{mission.conceptHelp}</p><div className="choice-list">{mission.explanations.map((choice) => <label key={choice.id} className={explanation === choice.id ? "choice selected" : "choice"}><input type="radio" name="explanation" checked={explanation === choice.id} onChange={() => chooseExplanation(choice.id)} />{choice.label}</label>)}</div>{feedback && <p className={explanationDone ? "feedback success" : "feedback"} role="status">{feedback}</p>}{repairHint && <p className="hint">{repairHint}</p>}{explanationDone && <button className="primary-button" type="button" onClick={next}>{index === MISSIONS.length - 1 ? "관찰 기록 보기" : "다음 활동으로"}</button>}</section>}<aside className="model-note"><strong>모형 약속</strong><p>{mission.modelNote}</p><p>{mission.safetyNote}</p></aside></section>;
}

function TraceRecord({ trace, prediction, predictionMatches, visibleSegments, onStep, onShowAll }: { trace: TraceResult; prediction: string; predictionMatches: boolean; visibleSegments: number; onStep: () => void; onShowAll: () => void }) {
  const noLightPath = trace.segments.length === 0;
  return <section className="trace-record" aria-labelledby="trace-title"><h2 id="trace-title">빛길 순서</h2><p className="trace-progress" role="status">{noLightPath ? "빛길이 시작되지 않음" : `현재 ${visibleSegments}/${trace.segments.length} 구간`}</p><div className="compare-record"><p><strong>첫 예상</strong><span>{prediction}</span></p><p><strong>관찰 결과</strong><span>{trace.summary}</span></p></div><p className="comparison">{predictionMatches ? "예상과 관찰이 같았어요. 어느 장치에서 빛길이 바뀌었는지 근거로 설명해 봐요." : "예상과 관찰을 비교해 봐요. 실제 빛길이 멈추거나 바뀐 지점이 수정의 근거예요."}</p>{!noLightPath && <><div className="trace-controls"><button type="button" onClick={onStep} disabled={visibleSegments >= trace.segments.length}>다음 빛길 보기</button><button type="button" onClick={onShowAll}>빛길 한 번에 보기</button></div><ol>{trace.segments.slice(0, visibleSegments).map((segment) => <li key={segment.label}>{segment.label}</li>)}</ol></>}</section>;
}
