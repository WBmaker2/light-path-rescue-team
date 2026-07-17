# Task 1 TDD 보고서

## RED

명령: `node --import tsx --test src/content/missions.test.ts`

결과: 실패했습니다. 새 학생용 안내 테스트가 `mission.sceneGuide`가 없어 `undefined`의 `length`를 읽으려다 실패했습니다. 이는 요구한 학생용 장면 안내와 핵심 용어 풀이가 아직 데이터 모델에 없다는 예상된 원인입니다.

## 구현

- `SceneGuideItem`, `MissionDefinition.conceptHelp`, `MissionDefinition.sceneGuide`를 추가했습니다.
- 여섯 활동에 각각 세 개의 구체적인 그림 관찰 도움말과 쉬운 핵심 용어 풀이를 넣었습니다.
- 거울 방향 보기에는 화살표 기울기 뜻을 `Choice.detail`로 추가했고, `세 장치 결합 연결`을 `세 장치의 역할 고르기`로 고쳤습니다.
- 그림 카드가 공통 목록 대신 미션별 안내를 보이고, 제목을 `빛길 그림`으로 표시하게 했습니다.

## GREEN

명령: `node --import tsx --test src/content/missions.test.ts && npm run build`

결과: 콘텐츠 테스트 3개가 모두 통과했고, Vinext 프로덕션 빌드도 통과했습니다. 빌드 중 Node의 `punycode` 사용 중단 경고와 Vinext의 정적 경로 분류 안내가 있었지만 실패나 기능 오류는 없었습니다.

## Diff 검토

`git diff --check`가 빈 결과로 통과했습니다. 변경은 Task 1에 지정된 타입, 미션 콘텐츠, 콘텐츠 테스트, 그림 컴포넌트와 이 보고서에만 한정했고, 코드 파일은 모두 500줄 미만입니다.

## 리뷰 수정 · 2026-07-18

### RED

명령: `node --import tsx --test src/components/LightPathScene.test.tsx src/content/missions.test.ts`

결과: 그림 안내 렌더링 테스트가 실패했습니다. `<strong>광원</strong>`과 힌트 `<span>` 사이에 학생이 읽을 구분자 `: `가 없었기 때문입니다. 같은 실행에서 여섯 미션의 승인된 장면 안내 라벨과 핵심 힌트를 고정하는 회귀 검증을 추가했습니다.

### 구현과 GREEN

- `LightPathScene`이 라벨과 힌트 사이에 `: `를 렌더링하도록 고쳤습니다.
- 여섯 활동의 세 가지 안내 라벨과 힌트를 정확히 비교하는 회귀 테스트를 추가했습니다.
- SVG 제목을 하나의 문자열로 만들어 기존 React 서버 렌더 경고도 제거했습니다.

명령: `node --import tsx --test src/components/LightPathScene.test.tsx src/content/missions.test.ts && npm run build`

결과: 관련 테스트 5개와 빌드가 모두 통과했습니다. 빌드의 Node `punycode` 사용 중단 경고와 Vinext 정적 분류 안내는 비차단 상태입니다.

## 두 번째 리뷰 수정 · dark 장면 안내

### RED

명령: `node --import tsx --test src/components/LightPathScene.test.tsx`

결과: `setupId === "dark"` 렌더링에서 SVG는 `꺼진 광원`을 보이지만 그림 안내에는 일반 `광원`이 남아 있어 새 회귀 테스트가 실패했습니다.

### 구현과 GREEN

`LightPathScene`에서 안내 활동의 dark 상태일 때 첫 `sceneGuide` 항목만 `꺼진 광원`으로 바꾸고 나머지 안내는 유지했습니다.

명령: `node --import tsx --test src/components/LightPathScene.test.tsx && npm run build`

결과: 그림 안내 테스트 2개와 프로덕션 빌드가 통과했습니다. 빌드의 Node `punycode` 경고와 Vinext 정적 분류 안내는 비차단 상태입니다.
