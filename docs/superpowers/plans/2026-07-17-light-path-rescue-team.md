# 빛길 구조대 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 초등 5~6학년 학생이 예측, 장치 선택, 가상 빛길 관찰, 근거 설명을 거쳐 직진·평면거울 반사·제한된 볼록렌즈 굴절을 구분하는 서버 없는 교육용 웹 앱을 구현합니다.

**Architecture:** Sites의 React·TypeScript·Vite 기반 구조를 유지하고, 광학 계산은 UI와 분리된 순수 함수 모듈로 구성합니다. 앱 상태는 현재 탭의 React 메모리에만 두며, 고정 미션 데이터와 결정적 판정 결과를 SVG 작업대와 텍스트 경로표가 함께 사용합니다.

**Tech Stack:** Sites starter, React, TypeScript, Vite, CSS, SVG, Vitest

## Global Constraints

- 앱 이름은 `빛길 구조대`, 부제는 `거울과 렌즈로 빛의 길을 살펴봐요`입니다.
- 안내 활동 1개와 본 미션 5개를 제공합니다.
- 화면의 선은 실제 빛 자체가 아니라 진행 방향을 이해하기 위한 가상 표시라고 반복해서 밝힙니다.
- 볼록렌즈는 평행한 세 가상 빛줄기가 한곳으로 모이는 제한 장면만 다룹니다.
- 실제 강한 빛이나 햇빛을 눈에 비추거나 렌즈로 모으지 않는 안전 문구를 제공합니다.
- 드래그, 점수, 로그인, 서버 저장, 브라우저 영구 저장, 외부 런타임 요청을 사용하지 않습니다.
- 모든 핵심 조작은 키보드와 44×44px 이상의 터치 버튼으로 완료할 수 있어야 합니다.
- 모든 코드 파일은 500줄 미만으로 유지합니다.
- `업데이트 내역` 버튼과 2026-07-17 최초 개발 기록을 포함합니다.

---

### Task 1: Sites 앱 골격과 테스트 기반 마련

**Files:**
- Create: `package.json`
- Create: `app/page.tsx`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `src/test/setup.ts`
- Create: `vitest.config.ts`
- Modify: `.openai/hosting.json`

**Interfaces:**
- Consumes: Sites 초기화 스크립트가 제공하는 React·TypeScript·Vite 구조
- Produces: `npm test`, `npm run build` 명령과 앱 전역 메타데이터·스타일 토큰

- [ ] **Step 1: Sites 초기화 스크립트로 프로젝트를 구성하고 개발 미리보기를 시작합니다.**
- [ ] **Step 2: Vitest 환경 검증 테스트를 작성해 실패를 확인합니다.**
- [ ] **Step 3: 테스트 스크립트와 설정을 추가해 환경 검증 테스트를 통과시킵니다.**
- [ ] **Step 4: 앱 제목·설명·언어·뷰포트와 반응형 전역 토큰을 설정합니다.**
- [ ] **Step 5: `npm test`와 `npm run build`를 실행해 각각 종료 코드 0을 확인합니다.**

### Task 2: 결정적 광학 모형과 미션 데이터

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/light-path.ts`
- Create: `src/content/missions.ts`
- Create: `src/domain/light-path.test.ts`
- Create: `src/content/missions.test.ts`

**Interfaces:**
- Consumes: 고정 좌표 `viewBox="0 0 1000 600"`, 미션별 허용 선택 ID
- Produces: `getTrace(missionId: MissionId, setupId: string): TraceResult`, `MISSIONS: MissionDefinition[]`

- [ ] **Step 1: 직진·한 거울·두 거울·볼록렌즈의 대표 성공·실패 결과를 기대하는 단위 테스트를 작성합니다.**
- [ ] **Step 2: `npm test -- src/domain/light-path.test.ts`를 실행해 구현 부재로 실패하는지 확인합니다.**
- [ ] **Step 3: 유한 좌표의 `TraceSegment`, `TraceEvent`, `TraceResult` 타입과 결정적 `getTrace` 순수 함수를 구현합니다.**
- [ ] **Step 4: 안내 활동과 본 미션 5개의 예측·선택·근거·피드백 데이터를 구현합니다.**
- [ ] **Step 5: 미션 ID, 성공 경로, 필수 안전·모형 문구를 검증하는 콘텐츠 테스트를 추가하고 전체 단위 테스트를 통과시킵니다.**

### Task 3: 학생 활동 흐름과 접근 가능한 빛길 작업대

**Files:**
- Create: `src/components/AppHeader.tsx`
- Create: `src/components/InfoDialog.tsx`
- Create: `src/components/LightPathScene.tsx`
- Create: `src/components/MissionWorkspace.tsx`
- Create: `src/components/SessionSummary.tsx`
- Create: `src/components/mission-workspace.test.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `MISSIONS`, `getTrace`, `TraceResult`
- Produces: 시작→모형·안전→안내→예측→배치→경로 확인→근거→요약의 단일 페이지 학습 흐름

- [ ] **Step 1: 예측 전 확인 버튼 비활성화, 선택 변경 시 이전 결과 무효화, 잘못된 근거 재시도를 기대하는 컴포넌트 테스트를 작성합니다.**
- [ ] **Step 2: 해당 테스트가 구현 부재로 실패하는지 확인합니다.**
- [ ] **Step 3: 리듀서 기반 세션 흐름과 점수 없는 미션 완료 기록을 구현합니다.**
- [ ] **Step 4: 고정 슬롯 버튼, 예상 카드, SVG 빛길, 동일 순서의 텍스트 경로표, 근거 카드 선택을 구현합니다.**
- [ ] **Step 5: 교사용 안내·모형과 안전·업데이트 내역 대화상자와 처음부터 다시 확인을 구현합니다.**
- [ ] **Step 6: 320px, 200% 확대, `prefers-reduced-motion`, 키보드 포커스가 깨지지 않도록 반응형 CSS를 완성합니다.**
- [ ] **Step 7: 컴포넌트 및 전체 테스트를 통과시킵니다.**

### Task 4: 제품 문서, 공유 이미지, 최종 검증과 게시

**Files:**
- Create: `README.md`
- Create: `docs/optics-model.md`
- Create: `docs/curriculum-alignment.md`
- Create: `public/og.png`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: 완성된 화면 문구, 남색·크림·노랑·청록 시각 언어
- Produces: 사이트 전용 소셜 미리보기, 교사용 과학 모형 문서, 게시 가능한 Sites 빌드

- [ ] **Step 1: 실제 구현 범위와 모형 한계, 개인정보 미수집, 안전 안내를 README와 문서에 기록합니다.**
- [ ] **Step 2: 완성 화면과 같은 제목·색·빛길 모티프의 소셜 미리보기 이미지를 한 장 생성하고 텍스트를 검수합니다.**
- [ ] **Step 3: 이미지가 사용 가능하면 동적 요청 호스트 기반 Open Graph·X 메타데이터를 연결합니다.**
- [ ] **Step 4: 모든 TypeScript·TSX·CSS 파일이 500줄 미만인지 확인합니다.**
- [ ] **Step 5: `npm test`와 `npm run build`를 새로 실행해 종료 코드 0을 확인합니다.**
- [ ] **Step 6: MVP 수용 기준을 다시 대조하고 Sites로 게시한 뒤 공개 주소를 확인합니다.**

## Self-Review

- 기존 MVP 문서의 핵심 학습 순환, 5개 미션, 제한된 과학 모형, 접근성, 개인정보, 업데이트 내역 요구를 각 작업에 연결했습니다.
- 서버·로그인·자유 배치·점수·외부 API 등 MVP 제외 항목은 구현 작업에서 제외했습니다.
- UI와 광학 모형의 인터페이스를 `MISSIONS`, `getTrace`, `TraceResult`로 고정해 SVG와 텍스트 표가 같은 결과를 사용하도록 했습니다.
- `TBD`, `TODO`, 임시 자리표시자 없이 실행 순서와 검증 명령을 명시했습니다.
