"use client";

type HeaderProps = { completed: number; onInfo: (kind: "teacher" | "model" | "updates") => void; onRestart: () => void };

export function AppHeader({ completed, onInfo, onRestart }: HeaderProps) {
  return <header className="app-header">
    <a className="skip-link" href="#main-content" onClick={() => document.getElementById("main-content")?.focus()}>본문으로 건너뛰기</a>
    <div className="brand"><span aria-hidden="true">✦</span><span>빛길 구조대<small>거울과 렌즈로 빛의 길을 살펴봐요</small></span></div>
    <div className="header-actions">
      <span className="completion" aria-label={`본 미션 ${completed}개 완료`}>관찰 {completed}/5</span>
      <button type="button" onClick={() => onInfo("teacher")}>교사용 활동 안내</button>
      <button type="button" onClick={() => onInfo("model")}>모형과 안전</button>
      <button type="button" onClick={() => onInfo("updates")}>업데이트 내역</button>
      <button className="quiet-button" type="button" onClick={onRestart}>처음부터</button>
    </div>
    <details className="mobile-help"><summary>도움말</summary><button type="button" onClick={() => onInfo("teacher")}>선생님용</button><button type="button" onClick={() => onInfo("model")}>모형과 안전</button><button type="button" onClick={() => onInfo("updates")}>업데이트 내역</button></details>
  </header>;
}
