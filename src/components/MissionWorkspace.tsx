"use client";

import { useEffect, useRef, useState } from "react";
import { MISSIONS } from "../content/missions";
import { getTrace } from "../domain/light-path";
import { predictionMatchesObservation } from "../domain/prediction";
import type { TraceResult } from "../domain/types";
import { LightPathScene } from "./LightPathScene";
import { SessionSummary, type MissionRecord } from "./SessionSummary";

type WorkspaceProps = { onCompletedChange: (count: number) => void };

const STEP_LABELS = ["장면 찾기", "예상", "장치", "빛길 확인", "관찰", "설명", "완료"] as const;
type Phase = (typeof STEP_LABELS)[number] | "수정";

function setupInstruction(missionId: string) {
  return missionId === "light-needed-to-see" ? "빛이 블록과 관찰창까지 이어지는 장면 하나를 골라요." : "빛길이 이어지도록 거울이나 렌즈 하나를 골라요.";
}

function stepInstruction(phase: Phase, setupCopy: string) {
  if (phase === "장면 찾기") return "그림에서 광원·장치·표적을 먼저 찾아요.";
  if (phase === "예상") return "빛길을 보기 전에 예상 하나를 골라요.";
  if (phase === "장치") return setupCopy;
  if (phase === "빛길 확인") return "고른 장치로 빛길 확인을 눌러요.";
  if (phase === "관찰") return "노란 선을 하나씩 따라가며 어디에서 바뀌는지 찾아요.";
  if (phase === "수정") return "힌트를 읽고 장치 다시 고르기를 눌러요.";
  if (phase === "설명") return "빛길에서 본 이유 하나를 골라요.";
  return "다음 활동으로 가서 빛의 규칙을 정리해요.";
}

function LockedStep({ children }: { children: string }) {
  return <p className="locked-step"><span className="locked-step-icon" aria-hidden="true">○</span>{children}</p>;
}

export function repairHintFor(trace: TraceResult, attempts: number) {
  const statusGuide = trace.status === "blocked" ? trace.segments.length === 0 ? "빛길이 시작되지 않았어요. 광원이 켜져 있는지 확인하고" : "빛길이 끝까지 이어지지 않았어요. 첫 구멍과 둘째 구멍의 높이를 비교해 보고" : trace.status === "mirror-back" ? "빛이 거울 뒷면에 닿았어요. 거울의 반짝이는 면이 광원 쪽을 보는 보기를 찾아보고" : trace.status === "out-of-bounds" ? "빛길이 표적과 다른 방향으로 갔어요. 노란 선이 꺾인 뒤 표지판 쪽으로 가는지 살펴보고" : trace.status === "focus-before-target" ? "빛이 표적보다 앞에서 모였어요. 렌즈를 표적에서 조금 더 멀리 놓는 보기를 비교해 보고" : trace.status === "focus-after-target" ? "빛이 표적보다 뒤에서 모였어요. 렌즈를 표적에 조금 더 가깝게 놓는 보기를 비교해 보고" : "빛길을 다시 확인하고";
  if (attempts >= 3) return `세 번 확인했어요. ${statusGuide} 두 보기를 비교해 한 가지를 고쳐 다시 확인해요.`;
  if (attempts >= 2) return `두 번째 확인이에요. ${statusGuide} 한 가지를 고쳐 다시 확인해요.`;
  return `${statusGuide} 한 가지를 고쳐 다시 확인해요.`;
}

export function MissionWorkspace({ onCompletedChange }: WorkspaceProps) {
  const [screen, setScreen] = useState<"start" | "safety" | "mission" | "summary">("start");
  const [index, setIndex] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [sceneViewed, setSceneViewed] = useState(false);
  const [setup, setSetup] = useState<string | null>(null);
  const [firstSetup, setFirstSetup] = useState<string | null>(null);
  const [trace, setTrace] = useState<TraceResult | null>(null);
  const [visibleSegments, setVisibleSegments] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [records, setRecords] = useState<MissionRecord[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const safetyHeadingRef = useRef<HTMLHeadingElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const mission = MISSIONS[index];
  const predictionChoice = mission.predictions.find((choice) => choice.id === prediction);
  const setupChoice = mission.setups.find((choice) => choice.id === setup);

  useEffect(() => {
    if (screen === "mission") headingRef.current?.focus();
    if (screen === "safety") safetyHeadingRef.current?.focus();
    if (screen === "summary") window.scrollTo({ top: 0, behavior: "auto" });
  }, [index, screen]);
  useEffect(() => { onCompletedChange(records.filter((record) => record.id !== "light-needed-to-see").length); }, [records, onCompletedChange]);
  useEffect(() => {
    if (!trace || !window.matchMedia("(max-width: 820px)").matches) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sceneRef.current?.focus({ preventScroll: true });
    sceneRef.current?.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  }, [trace]);

  const resetTrace = () => { setTrace(null); setVisibleSegments(0); setExplanation(null); setFeedback(""); };
  const changeSetup = (choice: string) => { setSetup(choice); resetTrace(); };
  const choosePrediction = (choice: string) => { setPrediction(choice); setSetup(null); resetTrace(); };
  const resetSession = () => { setScreen("start"); setIndex(0); setSceneViewed(false); setPrediction(null); setSetup(null); setFirstSetup(null); setTrace(null); setVisibleSegments(0); setAttempts(0); setExplanation(null); setFeedback(""); setRecords([]); };
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
  const repairSetup = () => { setSetup(null); setTrace(null); setVisibleSegments(0); setExplanation(null); setFeedback(""); };
  const next = () => {
    if (!trace || !prediction || !setup || explanation !== mission.correctExplanationId) return;
    const record: MissionRecord = { id: mission.id, prediction: predictionChoice?.label ?? prediction, setup: setupChoice?.label ?? setup, changed: firstSetup !== null && firstSetup !== setup, attempts, trace, explanation: mission.explanations.find((choice) => choice.id === explanation)?.label ?? explanation };
    setRecords((current) => [...current.filter((item) => item.id !== mission.id), record]);
    if (index === MISSIONS.length - 1) { setScreen("summary"); return; }
    setIndex(index + 1); setSceneViewed(false); setPrediction(null); setSetup(null); setFirstSetup(null); setTrace(null); setVisibleSegments(0); setAttempts(0); setExplanation(null); setFeedback("");
  };

  if (screen === "start") return (
    <section className="welcome" aria-labelledby="welcome-title">
      <p className="eyebrow">초등 5~6학년 · 약 15~20분</p>
      <h1 id="welcome-title">빛은 어디에서 곧게 가고,<br />어디에서 방향을 바꿀까요?</h1>
      <p>빛길을 먼저 예상하고, 거울과 렌즈의 역할을 고른 뒤 화면의 빛길을 관찰해 봐요.</p>
      <p className="start-action-copy">준비가 되면 아래 버튼을 눌러 시작해요.</p>
      <button className="primary-button gi-pulse start-action" type="button" onClick={() => setScreen("safety")}>
        <span className="now-label">지금 할 일 · </span>빛길 구조 시작 <span aria-hidden="true">→</span>
      </button>
      <div className="solve-guide">
        <h2>이렇게 풀어요</h2>
        <ol>
          <li>그림에서 광원·장치·표적을 찾아요.</li>
          <li>빛이 어떻게 갈지 먼저 예상해요.</li>
          <li>빛길을 이어 줄 장치를 골라요.</li>
          <li>노란 선을 따라가며 본 것을 설명해요.</li>
        </ol>
      </div>
      <div className="goal-list"><span>1. 먼저 예상하기</span><span>2. 빛길 관찰하기</span><span>3. 본 것을 설명하기</span></div>
      <p className="privacy">이 앱은 이름이나 사진을 받지 않고, 선택은 이 화면을 닫으면 남지 않아요.</p>
    </section>
  );
  if (screen === "safety") return (
    <section className="safety-screen" aria-labelledby="safety-title">
      <p className="eyebrow">시작 전 약속</p>
      <h1 id="safety-title" ref={safetyHeadingRef} tabIndex={-1}>이 화면은 실제 빛을 보여 주는 실험이 아니에요.</h1>
      <div className="solve-guide"><h2>이렇게 풀어요</h2><p>화면의 노란 선을 처음부터 따라가며 빛이 멈추거나 꺾이는 곳을 찾아요.</p></div>
      <div className="safety-grid">
        <article><h2>화면 속 빛줄기</h2><p>노란 선은 빛이 나아가는 방향을 보여 주는 선이에요.</p></article>
        <article><h2>이 화면에서 볼 수 있는 것</h2><p>이 화면은 나란히 들어오는 세 빛줄기가 모이는 장면만 보여 줘요.</p></article>
        <article><h2>안전하게</h2><p>강한 빛이나 햇빛을 눈에 비추거나 렌즈로 모으지 않아요. 실제 실험은 선생님과 해요.</p></article>
      </div>
      <button className="primary-button gi-pulse" type="button" onClick={() => setScreen("mission")}><span className="now-label">지금 할 일 · </span>확인했어요</button>
    </section>
  );
  if (screen === "summary") return <SessionSummary records={records} onRestart={resetSession} />;

  const canExplain = trace?.status === "target-hit";
  const explanationDone = explanation === mission.correctExplanationId && canExplain;
  const repairHint = trace && !canExplain ? repairHintFor(trace, attempts) : "";
  const phase: Phase = !sceneViewed ? "장면 찾기" : !prediction ? "예상" : !setup ? "장치" : !trace ? "빛길 확인" : !canExplain ? "수정" : visibleSegments < trace.segments.length ? "관찰" : !explanationDone ? "설명" : "완료";
  const stepNumber = phase === "수정" ? STEP_LABELS.indexOf("빛길 확인") + 1 : STEP_LABELS.indexOf(phase) + 1;
  const canCheck = Boolean(prediction && setup);
  const pulse = (target: string) => target === "장면 찾기" ? "" : phase === target ? " gi-pulse" : "";
  return (
    <section className="workspace" aria-labelledby="mission-title">
      <div className="mission-topline"><span>{index === 0 ? "안내 활동" : `본 미션 ${index}/5`}</span><span>전체 7단계 · 현재: <strong>{phase}</strong></span></div>
      <div className="progress-wrap"><span className="progress-sequence">{STEP_LABELS.join(" → ")}</span><div role="progressbar" aria-label="활동 진행" aria-valuemin={1} aria-valuemax={MISSIONS.length} aria-valuenow={index + 1}><span style={{ width: `${((index + 1) / MISSIONS.length) * 100}%` }} /></div></div>
      <h1 id="mission-title" tabIndex={-1} ref={headingRef}>{mission.title}</h1>
      <p className="mission-request">{mission.request}</p>
      <section className="current-step" aria-live="polite">
        <span className="step-badge" aria-hidden="true">{stepNumber}/7</span>
        <div><strong>지금 할 일</strong><span>{stepInstruction(phase, setupInstruction(mission.id))}</span></div>
      </section>
      <div className="workspace-grid">
        <LightPathScene ref={sceneRef} mission={mission} trace={trace} setupId={setup} visibleSegments={visibleSegments} />
        <div className="choice-column">
          <fieldset className={`choice-panel scene-step${sceneViewed ? " is-complete" : ""}${pulse("장면 찾기")}`}>
            <legend>1. 그림에서 먼저 찾아요</legend>
            {sceneViewed ? <p className="step-complete" role="status">장면을 확인했어요. 이제 예상 하나를 골라요.</p> : <>
              <p>그림에서 광원·장치·표적을 찾아요. 다 찾으면 아래 버튼을 눌러요.</p>
              <div className="scene-find-list">{mission.sceneGuide.map((item) => <span key={item.label}><strong>{item.label}</strong> · {item.hint}</span>)}</div>
            </>}
            <button type="button" className={sceneViewed ? "secondary-action" : "primary-button gi-pulse"} onClick={() => setSceneViewed(true)} disabled={sceneViewed}>{sceneViewed ? "찾았어요 ✓" : "찾았어요"}</button>
          </fieldset>
          <fieldset className={`choice-panel${!sceneViewed ? " is-locked" : ""}${prediction ? " is-complete" : ""}${pulse("예상")}`}>
            <legend>2. 내 예상은?</legend>
            {sceneViewed ? <>
              <p>{prediction ? "다른 생각이 들면 예상을 바꿔도 좋아요." : "빛길을 보기 전에 예상 하나를 골라요."}</p>
              <div className="choice-list">{mission.predictions.map((choice) => <label key={choice.id} className={prediction === choice.id ? "choice selected" : "choice"}><input type="radio" name="prediction" checked={prediction === choice.id} onChange={() => choosePrediction(choice.id)} /><span>{choice.label}{choice.detail && <small>{choice.detail}</small>}</span></label>)}</div>
            </> : <LockedStep>먼저 그림을 보고 ‘찾았어요’를 눌러요.</LockedStep>}
          </fieldset>
          <fieldset className={`choice-panel${!prediction ? " is-locked" : ""}${setup ? " is-complete" : ""}${pulse("장치")}`}>
            <legend>3. {mission.setupLabel}</legend>
            {prediction ? <>
              <p>{setupInstruction(mission.id)}</p>
              <div className="choice-list">{mission.setups.map((choice) => <label key={choice.id} className={setup === choice.id ? "choice selected" : "choice"}><input type="radio" name="setup" checked={setup === choice.id} onChange={() => changeSetup(choice.id)} /><span>{choice.label}{choice.detail && <small>{choice.detail}</small>}</span></label>)}</div>
            </> : <LockedStep>먼저 예상 하나를 골라요.</LockedStep>}
          </fieldset>
          <div className="check-action">
            <button className={`primary-button${phase === "빛길 확인" ? " gi-pulse" : ""}`} type="button" disabled={!canCheck} onClick={checkTrace}><span className="now-label">지금 할 일 · </span>빛길 확인</button>
            {!canCheck && <p className="action-lock">예상과 장치를 고르면 이 버튼이 열려요.</p>}
          </div>
          {trace && <TraceRecord trace={trace} prediction={predictionChoice?.label ?? ""} predictionMatches={predictionMatchesObservation(mission, prediction ?? "", setup ?? "")} canExplain={canExplain} visibleSegments={visibleSegments} pulseNext={phase === "관찰"} onStep={() => setVisibleSegments((value) => Math.min(value + 1, trace.segments.length))} onShowAll={() => setVisibleSegments(trace.segments.length)} />}
        </div>
      </div>
      {trace && <section className={`explanation-panel${pulse("설명")}`} aria-labelledby="explanation-title">
        <h2 id="explanation-title">4. 본 것을 설명해요</h2>
        <p>빛길에서 멈춤·꺾임·모임을 찾고, 왜 그런지 골라요.</p>
        <p className="concept-help">{mission.conceptHelp}</p>
        {!canExplain && <p className="locked-choice-note">표적에 닿는 빛길을 만들면 설명을 고를 수 있어요.</p>}
        <div className="choice-list">{mission.explanations.map((choice) => <label key={choice.id} className="choice"><input type="radio" name="explanation" disabled={!canExplain} checked={explanation === choice.id} onChange={() => chooseExplanation(choice.id)} />{choice.label}</label>)}</div>
        {feedback && <p className={explanationDone ? "feedback success" : "feedback"} role="status">{feedback}</p>}
        {repairHint && <><p className="hint">{repairHint}</p><button type="button" className={phase === "수정" ? "secondary-action gi-pulse" : "secondary-action"} onClick={repairSetup}>장치 다시 고르기</button></>}
        {explanationDone && <button className={`primary-button${pulse("완료")}`} type="button" onClick={next}><span className="now-label">지금 할 일 · </span>{index === MISSIONS.length - 1 ? "관찰 기록 보기" : "다음 활동으로"}</button>}
      </section>}
      <aside className="model-note"><strong>모형 약속</strong><p>{mission.modelNote}</p><p>{mission.safetyNote}</p></aside>
    </section>
  );
}

function TraceRecord({ trace, prediction, predictionMatches, canExplain, visibleSegments, pulseNext, onStep, onShowAll }: { trace: TraceResult; prediction: string; predictionMatches: boolean; canExplain: boolean; visibleSegments: number; pulseNext: boolean; onStep: () => void; onShowAll: () => void }) {
  const noLightPath = trace.segments.length === 0;
  return <section className="trace-record" aria-labelledby="trace-title"><h2 id="trace-title">빛길 순서</h2><p className="trace-progress" role="status">{noLightPath ? "빛길이 시작되지 않음" : `현재 ${visibleSegments}/${trace.segments.length} 구간`}</p><div className="compare-record"><p><strong>첫 예상</strong><span>{prediction}</span></p><p><strong>관찰 결과</strong><span>{trace.summary}</span></p></div><p className="comparison">{predictionMatches ? "예상과 관찰이 같았어요. 빛이 멈추거나 방향을 바꾼 곳을 찾아 설명해 봐요." : "예상과 관찰이 달랐어요. 빛이 멈추거나 방향을 바꾼 곳을 보고 다시 생각해 봐요."}</p>{!noLightPath && <><div className="trace-controls"><button className={pulseNext ? "gi-pulse" : ""} type="button" onClick={onStep} disabled={visibleSegments >= trace.segments.length}><span className="now-label">지금 할 일 · </span>다음 빛길 보기</button><button type="button" onClick={onShowAll}>빛길 한 번에 보기</button></div><ol>{trace.segments.slice(0, visibleSegments).map((segment) => <li key={segment.label}>{segment.label}</li>)}</ol></>}{!canExplain && <a className="trace-next-link" href="#explanation-title">다음: 아래 도움말 보기</a>}</section>;
}
