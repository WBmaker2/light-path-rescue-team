import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { AppHeader } from "../src/components/AppHeader";
import { InfoDialog } from "../src/components/InfoDialog";
import { MissionWorkspace } from "../src/components/MissionWorkspace";
import "../app/globals.css";

function LightPathApp() {
  const [completed, setCompleted] = useState(0);
  const [dialog, setDialog] = useState<"teacher" | "model" | "updates" | "restart" | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const restart = () => { setCompleted(0); setResetSignal((value) => value + 1); };
  const dialogContent = {
    teacher: <><p>수업 전후 실제 거울·렌즈 관찰과 연결해 주세요. 앱은 개념을 준비하고 정리하는 화면 활동입니다.</p><ul><li>결과를 보기 전에 빛길을 예상했는지</li><li>직진·반사·굴절을 장치와 연결하는지</li><li>실제 실험은 교사 안내가 필요함을 아는지</li></ul></>,
    model: <><p>화면의 노란 선은 실제로 보이는 빛이 아니라 빛이 나아가는 방향을 보여 주는 선이에요.</p><p>평면거울은 빛길의 방향을 바꾸는 장면만 보여 줘요. 이 화면은 나란히 들어오는 세 빛줄기가 모이는 장면만 보여 줘요.</p><p><strong>안전:</strong> 강한 빛이나 햇빛을 눈에 비추거나 렌즈로 모으지 않습니다.</p></>,
    updates: <><h3>2026-07-18 · 학생 실사용 개선</h3><p>다시 시작 오류를 고치고, 작은 화면에서도 선택 결과 그림을 바로 볼 수 있게 했어요. 어려운 문장과 결과 기록, 실패했을 때의 도움말을 학생이 읽기 쉽게 다듬고 마지막 미션의 정답 미리 보기를 없앴어요.</p><h3>2026-07-17 · 학습 흐름 개선</h3><p>장면을 먼저 보고 예상·선택을 하도록 순서를 바꾸고, 현재 보이는 구간만 빛길 순서에 표시했어요.</p><h3>2026-07-17 · 첫 개발</h3><p>안내 활동과 직진·평면거울·볼록렌즈·장치 쓰임의 다섯 미션, 빛길 순서, 키보드 조작을 만들었습니다.</p><h3>2026-07-17 · 접근성 보완</h3><p>드래그 없는 선택, 화면 크기에 맞는 작업 화면, 동작을 줄이는 환경에서도 빛길을 바로 보여 주도록 했어요.</p></>,
    restart: <><p>지금까지의 예상과 관찰 기록이 이 화면에서 사라집니다. 처음부터 다시 시작할까요?</p><div className="dialog-actions"><button type="button" onClick={() => setDialog(null)}>계속 살펴보기</button><button className="primary-button" type="button" onClick={() => { restart(); setDialog(null); }}>처음부터 시작</button></div></>,
  };
  return <><AppHeader completed={completed} onInfo={setDialog} onRestart={() => setDialog("restart")} /><main id="main-content" tabIndex={-1}><MissionWorkspace key={resetSignal} onCompletedChange={setCompleted} /></main>{dialog && <InfoDialog title={dialog === "teacher" ? "교사용 활동 안내" : dialog === "model" ? "모형과 안전" : dialog === "updates" ? "업데이트 내역" : "처음부터 다시 시작"} onClose={() => setDialog(null)}>{dialogContent[dialog]}</InfoDialog>}</>;
}

if (typeof document !== "undefined") {
  const root = document.getElementById("root");

  if (!root) {
    throw new Error("정적 앱을 마운트할 root 요소를 찾을 수 없습니다.");
  }

  createRoot(root).render(
    <StrictMode>
      <LightPathApp />
    </StrictMode>,
  );
}
