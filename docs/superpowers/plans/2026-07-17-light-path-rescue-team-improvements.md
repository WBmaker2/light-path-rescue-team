# 빛길 구조대 학습 흐름·UI 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 학생이 장면을 먼저 읽고 정확한 예상-관찰 비교를 받은 뒤, 현재 보이는 빛길 구간만 단계적으로 확인할 수 있도록 기능과 반응형 UI를 개선한다.

**Architecture:** 기존의 `예상 → 장치 선택 → 관찰 → 근거 설명 → 수정` 흐름과 고정 광학 모형은 유지한다. 예상 일치 규칙은 콘텐츠 데이터와 순수 함수로 분리하고, 작업 화면은 장면-선택-관찰 기록의 시각·DOM 순서를 일치시킨다. 모바일 SVG 라벨은 별도 HTML 장면 안내로 보완해 축소된 SVG 글자에만 의존하지 않는다.

**Tech Stack:** React 19, TypeScript, Vinext/Vite, Node test runner, Playwright, axe-core, OpenAI Sites

## Global Constraints

- 초등 5~6학년이 혼자 읽을 수 있는 짧고 구체적인 한국어를 사용한다.
- 기존 광학 계산과 `예상 → 선택 → 관찰 → 근거 → 수정` 학습 구조를 유지한다.
- 한 코드 파일은 500줄 미만으로 유지한다.
- 모바일 320px에서 가로 스크롤 없이 사용할 수 있어야 한다.
- 모든 주요 조작 요소는 키보드로 사용할 수 있고 최소 높이 44px을 유지한다.
- 앱 안의 `업데이트 내역`에 2026-07-17 개선 기록을 추가한다.
- 새 동작은 실패하는 테스트를 먼저 확인한 뒤 최소 구현으로 통과시킨다.

---

## 1. 현재 상태 감사

### 실제 화면에서 확인한 문제

| 우선순위 | 발견 내용 | 학생에게 미치는 영향 | 근거 |
| --- | --- | --- | --- |
| P0 | 예상 일치 여부를 `성공 예상 ID + target-hit`으로만 판단한다. | `광원이 꺼질 것`을 예상하고 실제로 꺼진 장면을 골라도 “예상과 다름”으로 나온다. 렌즈가 표적 앞·뒤에서 모이는 것을 예상해도 틀렸다고 표시된다. | `MissionWorkspace.tsx`의 `successPredictions`와 `trace.status === "target-hit"` 결합 |
| P0 | 모바일에서 예상·장치 선택이 장면보다 먼저 나온다. | 무엇을 관찰해야 하는지 보지 못한 채 답부터 고르게 된다. | 320px 측정: 첫 선택 패널 top 약 451px, 장면 top 약 1153px |
| P1 | SVG 핵심 라벨이 모바일에서 지나치게 작다. | `광원`, `파란 블록`, `관찰창`을 사실상 읽기 어렵다. | 320px에서 SVG 라벨의 실제 표시 높이 약 7px |
| P1 | `한 단계씩`을 눌러도 텍스트 경로표는 전체 구간을 계속 보여 준다. | 그림과 텍스트가 서로 다른 관찰 단계를 말해 단계별 탐색 의미가 약해진다. | 안내 활동 1단계 표시 중에도 경로표 2개 구간이 모두 노출됨 |
| P2 | 상단 브랜드 링크가 실제로는 본문 건너뛰기 역할을 한다. | 화면을 보는 학생에게는 홈 링크처럼 보이고, 키보드 사용자에게는 명확한 건너뛰기 링크가 없다. | 접근성 트리에서 `빛길 구조대` 링크 이름이 `본문으로 건너뛰기`로 표시됨 |

### 기준 화면

- 데스크톱 미션: `artifacts/design-review-before-mission-desktop.png`
- 모바일 320px 미션: `artifacts/design-review-before-mission-mobile.png`

### 유지할 강점

- 점수 대신 예상과 관찰 근거를 비교하는 수업 친화적 구조
- 거울·렌즈 모형의 제한과 실제 실험 안전 안내
- 드래그 대신 검수된 선택지를 쓰는 안정적인 상호작용
- 44px 이상 조작 영역, 포커스 가능한 대화상자, 320px 무가로스크롤 기반

## 2. 접근 방식 비교와 결정

### A. 시각적 장식만 개선

- 색, 그림자, 간격만 손본다.
- 구현 위험은 낮지만 P0 기능 오류와 장면 순서를 해결하지 못한다.

### B. 학습 흐름 중심 개선 — 채택

- 예상 일치 규칙을 콘텐츠에 명시하고 순수 함수로 판정한다.
- 장면을 먼저 보여 준 뒤 예상과 장치 선택을 하게 한다.
- 모바일 장면 안내와 단계 진행 상태를 HTML 텍스트로 제공한다.
- 기존 디자인 언어와 광학 계산을 유지하면서 확인된 문제를 직접 해결한다.

### C. 전체 화면 재설계

- 탭, 미션 지도, 새 내비게이션을 포함한 전면 개편이다.
- 시각 변화는 크지만 학습 흐름이 복잡해지고 현재 검증된 접근성을 다시 확인해야 하므로 이번 범위에서 제외한다.

## 3. 파일 구조

- `src/domain/prediction.ts`: 선택한 예상이 실제 관찰과 맞는지 판정하는 순수 함수
- `src/domain/prediction.test.ts`: 성공·실패 장면을 모두 포함한 예상 비교 회귀 테스트
- `src/domain/types.ts`: 예상 선택지의 `matchingSetupIds` 데이터 계약
- `src/content/missions.ts`: 각 예상이 대응하는 관찰함/장치 선택 ID 선언
- `src/components/MissionWorkspace.tsx`: 장면 우선 DOM 순서, 정확한 예상 비교, 단계 진행 표시
- `src/components/LightPathScene.tsx`: 모바일에서도 읽을 수 있는 HTML 장면 핵심 요소 안내
- `src/components/AppHeader.tsx`: 실제 건너뛰기 링크와 비상호작용 브랜드 분리
- `app/page.tsx`: 업데이트 대화상자의 2026-07-17 개선 기록 추가
- `app/globals.css`: 장면 우선 레이아웃, 모바일 라벨 안내, 건너뛰기 링크 스타일
- `tests/e2e/student-flow.spec.ts`: 모바일 장면 순서, 단계 경로표 동기화, 건너뛰기 링크 회귀 테스트

## 4. 구현 작업

### Task 1: 예상-관찰 판정 정확화

**Files:**
- Create: `src/domain/prediction.ts`
- Create: `src/domain/prediction.test.ts`
- Modify: `src/domain/types.ts`
- Modify: `src/content/missions.ts`
- Modify: `src/components/MissionWorkspace.tsx`

**Interfaces:**
- Consumes: `MissionDefinition`, 선택한 prediction ID, 선택한 setup ID
- Produces: `predictionMatchesObservation(mission, predictionId, setupId): boolean`

- [x] **Step 1: 실패 테스트 작성**

```ts
assert.equal(predictionMatchesObservation(guide, "dark", "dark"), true);
assert.equal(predictionMatchesObservation(guide, "dark", "visible"), false);
assert.equal(predictionMatchesObservation(lens, "focus", "left"), true);
assert.equal(predictionMatchesObservation(twoMirror, "once", "first-only"), true);
```

- [x] **Step 2: 실패 확인**

Run: `node --test --import tsx src/domain/prediction.test.ts`

Expected: `prediction.ts`가 아직 없어 실패한다.

- [x] **Step 3: 최소 구현**

`Choice`에 선택적 `matchingSetupIds?: string[]`를 추가하고 각 prediction 데이터에 실제로 같은 관찰을 만드는 setup ID를 기록한다. `predictionMatchesObservation`은 해당 prediction의 `matchingSetupIds`에 setup ID가 포함되는지만 반환한다.

- [x] **Step 4: 통과 확인**

Run: `node --test --import tsx src/domain/prediction.test.ts`

Expected: 모든 예상 판정 테스트 통과.

### Task 2: 장면 우선 학습 순서와 모바일 읽기 개선

**Files:**
- Modify: `src/components/MissionWorkspace.tsx`
- Modify: `src/components/LightPathScene.tsx`
- Modify: `app/globals.css`
- Modify: `tests/e2e/student-flow.spec.ts`

**Interfaces:**
- Consumes: 기존 `mission`, `trace`, `setupId`, `visibleSegments`
- Produces: `.scene-card`가 `.choice-column`보다 먼저인 DOM, `.scene-key` HTML 장면 안내

- [x] **Step 1: 실패 E2E 테스트 작성**

320px 화면에서 첫 번째 `figure.scene-card`의 y 좌표가 첫 번째 `fieldset`보다 작고, `광원`·현재 미션 표적을 설명하는 `.scene-key`가 보이는지 검사한다.

- [x] **Step 2: 실패 확인**

Run: `npx playwright test tests/e2e/student-flow.spec.ts --grep "장면을 먼저"`

Expected: 기존 장면 y 좌표가 선택 패널보다 아래여서 실패한다.

- [x] **Step 3: 최소 구현**

`workspace-grid` 안에서 `LightPathScene`을 먼저 렌더링하고 선택 패널 묶음에 `choice-column` 클래스를 준다. 데스크톱은 장면 60%·선택 40% 2열, 모바일은 장면 다음 선택의 1열로 배치한다. SVG 아래에 `장면에서 먼저 찾기` 목록을 제공한다.

- [x] **Step 4: 통과 확인**

Run: `npx playwright test tests/e2e/student-flow.spec.ts --grep "장면을 먼저"`

Expected: 320px에서 장면이 먼저 보이고 가로 오버플로가 0이다.

### Task 3: 단계별 경로표 동기화

**Files:**
- Modify: `src/components/MissionWorkspace.tsx`
- Modify: `tests/e2e/student-flow.spec.ts`

**Interfaces:**
- Consumes: `trace.segments`, `visibleSegments`
- Produces: `현재 N/M 구간` 상태와 `trace.segments.slice(0, visibleSegments)` 목록

- [x] **Step 1: 실패 E2E 테스트 작성**

관찰 직후 텍스트 경로표의 행 수가 현재 보이는 구간 수와 같고, `한 단계씩` 클릭 후 한 행씩 늘어나는지 검사한다.

- [x] **Step 2: 실패 확인**

Run: `npx playwright test tests/e2e/student-flow.spec.ts --grep "경로표"`

Expected: 기존 경로표가 처음부터 모든 행을 보여 실패한다.

- [x] **Step 3: 최소 구현**

경로 목록을 `slice(0, visibleSegments)`로 제한하고 `aria-live="polite"` 상태에 `현재 ${visibleSegments}/${trace.segments.length} 구간`을 표시한다. 마지막 구간에서는 `한 단계씩`을 비활성화한다.

- [x] **Step 4: 통과 확인**

Run: `npx playwright test tests/e2e/student-flow.spec.ts --grep "경로표"`

Expected: 그림과 텍스트의 구간 수가 항상 같다.

### Task 4: 상단 접근성 의미와 업데이트 기록

**Files:**
- Modify: `src/components/AppHeader.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/e2e/student-flow.spec.ts`

**Interfaces:**
- Produces: 포커스 시 보이는 `.skip-link`, 비상호작용 `.brand`, 2026-07-17 개선 항목

- [x] **Step 1: 실패 E2E 테스트 작성**

첫 Tab 입력 시 `본문으로 건너뛰기` 링크가 보이고 Enter 후 `#main-content`로 이동하는지 검사한다.

- [x] **Step 2: 실패 확인**

Run: `npx playwright test tests/e2e/student-flow.spec.ts --grep "본문 건너뛰기"`

Expected: 기존 브랜드가 링크여서 시각적 의미 분리에 실패한다.

- [x] **Step 3: 최소 구현**

헤더 첫 자식에 독립 skip link를 추가하고 브랜드는 `div`로 바꾼다. 업데이트 대화상자에 `2026-07-17 · 학습 흐름 개선`과 판정·장면 순서·단계 경로표 내용을 추가한다.

- [x] **Step 4: 통과 확인**

Run: `npx playwright test tests/e2e/student-flow.spec.ts --grep "본문 건너뛰기"`

Expected: 키보드 건너뛰기와 업데이트 기록 테스트 통과.

### Task 5: 전체 회귀·시각 검증·배포

**Files:**
- Modify: `docs/manual-accessibility-qa.md` only if the observed manual result changes
- Create: `artifacts/design-review-after-mission-desktop.png`
- Create: `artifacts/design-review-after-mission-mobile.png`

**Interfaces:**
- Produces: 검증된 빌드와 Sites 비공개 새 버전

- [x] **Step 1: 정적·단위 검증**

Run: `npm run lint && npm run typecheck && npm test`

Expected: exit code 0, 실패 0개.

- [x] **Step 2: 브라우저 회귀 검증**

Run: `npm run test:e2e`

Expected: 모든 Playwright 테스트 통과, axe serious/critical 위반 0개, 320px 가로 오버플로 0.

- [x] **Step 3: 네트워크·빌드 검증**

Run: `npm run check:runtime-network && npm run build`

Expected: 외부 런타임 요청 없음, exit code 0.

- [x] **Step 4: 전후 화면 비교**

1200px 및 320px에서 같은 미션 화면을 캡처하고 장면 우선 순서, 장면 안내, 헤더, 경로표 진행 상태를 비교한다.

- [ ] **Step 5: 커밋·Sites 배포 검증**

정확히 검증한 커밋 SHA를 Sites 소스 저장소에 push하고 새 버전을 저장·비공개 배포한 뒤 배포 상태가 `succeeded`인지 확인한다.

## 5. 완료 기준

- 실패 장면을 예상한 학생도 실제 선택과 같으면 “예상과 관찰이 같았어요” 피드백을 받는다.
- 렌즈가 표적 앞·위치·뒤에서 모이는 세 선택 모두 `빛이 모일 것` 예상과 일치한다.
- 320px에서 장면이 첫 선택 패널보다 위에 있고, 핵심 요소를 14px 이상 HTML 텍스트로 읽을 수 있다.
- 텍스트 경로표의 행 수와 화면에 그려진 빛길 구간 수가 일치한다.
- 첫 Tab으로 명확한 본문 건너뛰기 링크를 사용할 수 있다.
- 업데이트 내역, 자동화 테스트, 전후 스크린샷, 배포 주소가 모두 남는다.

## 6. 2026-07-17 구현·검증 기록

### 구현 결과

- 예상과 관찰의 일치 여부를 성공 여부가 아닌 미션별 실제 관찰 의미로 비교하도록 바꿨다.
- 작업대 DOM을 `장면 → 예상 → 장치 선택 → 관찰 기록` 순서로 바꾸고, 데스크톱에서는 장면 60%·선택 40% 2열을 유지했다.
- 6개 활동마다 실제 장면에 맞는 핵심 요소 3개를 15.2px HTML 목록으로 제공했다.
- 단계별 그림과 텍스트 경로표를 같은 `visibleSegments`로 동기화하고 `현재 N/M 구간`을 표시했다.
- 브랜드와 본문 건너뛰기 링크를 분리하고 첫 Tab에서 건너뛰기 링크가 보이도록 했다.
- 앱의 업데이트 내역에 `2026-07-17 · 학습 흐름 개선` 항목을 추가했다.

### 전후 측정

| 항목 | 개선 전 | 개선 후 |
| --- | --- | --- |
| 320px 장면 top | 약 1153px | 약 303px |
| 320px 첫 선택 패널 top | 약 451px | 약 744px |
| 모바일 핵심 라벨 | SVG 표시 높이 약 7px | HTML 텍스트 15.2px |
| 단계 1 경로표 | 전체 2구간 노출 | 현재 1/2 구간만 노출 |
| 가로 오버플로 | 0px | 0px 유지 |
| 데스크톱 작업대 | 선택 약 38%·장면 약 62%, 선택이 DOM상 먼저 | 장면 60%·선택 40%, 장면이 DOM상 먼저 |

### 디자인 감사 점수

- 첫인상·수업 목적 전달: 8.5/10 → 9/10
- 시각 계층·학습 순서: 6/10 → 9/10
- 모바일 가독성: 6/10 → 8.5/10
- 상호작용·피드백 일관성: 7/10 → 9/10
- 접근성·키보드 의미: 8/10 → 9/10

### 검증 증거

- `npm run lint`: 통과
- `npm run typecheck`: 통과
- `npm test`: 10개 통과
- `npm run test:e2e -- --reporter=line --workers=1`: 13/13 통과
- `npm run build`: 통과
- `npm run check:runtime-network`: 외부 런타임 요청과 브라우저 영구 저장 없음
- `git diff --check`: 통과
- 개선 후 데스크톱: `artifacts/design-review-after-mission-desktop.png`
- 개선 후 모바일: `artifacts/design-review-after-mission-mobile.png`
- 꺼진 광원 0구간: `artifacts/design-review-after-dark-source.png`
- 위쪽 구멍 수평 차단: `artifacts/design-review-after-straight-blocked.png`

## 7. 독립 코드 리뷰 후 추가 개선

배포 전 별도 읽기 전용 리뷰에서 테스트 통과만으로 발견하기 어려운 그림-설명 불일치를 추가 확인했다. 아래 항목은 같은 날 후속 TDD 범위로 포함한다.

### 추가 발견

| 우선순위 | 발견 내용 | 개선 방향 |
| --- | --- | --- |
| P0 | `첫 구멍을 위로 옮기기`에서 결과는 막힘인데 빛줄기는 `(100,300) → (350,220)` 대각선으로 그려져 빛이 위로 휘는 것처럼 보인다. | 빛줄기를 y=300 수평으로 유지해 첫 가림판에서 멈추고, 정적 장면의 첫 구멍 위치를 실제로 위로 옮긴다. |
| P1 | `광원이 꺼져 있어요`를 골라도 노란 광원이 계속 보인다. | 꺼진 광원 전용 SVG 상태와 `꺼진 광원` HTML 장면 안내를 제공한다. |
| P1 | 단계 경로표·장면 안내·건너뛰기 링크 테스트가 대표 장면만 확인한다. | 6구간 렌즈 단계, 모든 미션 장면 안내, 데스크톱·모바일 순서, `#main-content` 실제 포커스를 추가 검증한다. |
| P2 | `figcaption` 뒤에 `scene-key` 목록이 있어 figure 자식 구조가 올바르지 않다. | 장면 안내 목록을 `figcaption` 내부로 옮긴다. |

### 후속 완료 기준

- `upper-hole` 실패 경로의 모든 segment 시작·끝 y가 300이며 첫 가림판 x=340에서 끝난다.
- `upper-hole` 장면의 첫 구멍은 위쪽, 두 번째 구멍은 가운데로 보인다.
- `dark` 장면은 `.source-off`를 표시하고 `.scene-key`에 `꺼진 광원`을 표시한다.
- `dark` 장면은 노란 빛줄기와 장애물 오버레이를 그리지 않고 `빛길이 시작되지 않음` 상태를 표시한다.
- 렌즈 6구간이 1개씩 증가하고, 마지막에 6/6 및 단계 버튼 비활성화가 확인된다.
- 6개 활동의 장면 안내 3개가 콘텐츠와 일치한다.
- 본문 건너뛰기 후 `main#main-content`가 실제 포커스를 받는다.

### 후속 구현 결과

- 위쪽 구멍 실패 경로를 `(100,300) → (340,300)` 수평 1구간으로 고치고 첫 구멍만 위로 옮긴 SVG를 적용했다.
- 꺼진 광원은 `segments=[]`, `.source-off`, 0구간 기록으로 처리해 그림·배지·텍스트가 같은 관찰을 설명한다.
- 예상-선택 54개 조합, 6개 활동 장면 안내, 렌즈 6구간, 양쪽 반응형 순서와 실제 본문 포커스를 자동 검증한다.
- 최종 독립 재리뷰 결과 Critical, Important, Minor 미해결 항목은 없다.
