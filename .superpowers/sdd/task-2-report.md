# Task 2 TDD 보고서

## RED

### 단위 테스트

명령: `node --import tsx --test src/domain/light-path.test.ts`

결과: 실패했습니다. 정답 장치 연결은 일반 경로 구간 두 개를 반환했지만, 요구한 장치별 관계 세 개(`잠망경 → 평면거울 → 반사` 등)가 없었습니다.

### E2E

명령: `npm run test:e2e -- --grep "마지막 종합 미션" --reporter=line --workers=1`

결과: 실패했습니다. 마지막 미션을 확인하기 전부터 장치 카드가 `평면거울 · 반사`, `볼록렌즈 · 굴절`을 보여 주고 `역할은 확인 뒤 공개`는 없었습니다.

## 구현

- 정답 연결은 각 장치 카드 안에 놓인 세 개의 겹치지 않는 관계 구간을 반환합니다.
- 장치 카드는 확인 전에는 역할을 숨기고, 확인 뒤에 선택한 `correct-match`, `all-mirror`, `all-lens` 연결을 각각 표시합니다.
- E2E는 기본 단계별 경로표의 첫 구간 표시를 존중해 `전체 경로 보기` 뒤 세 관계를 확인합니다.

## GREEN

- `node --import tsx --test src/domain/light-path.test.ts`: 5개 통과
- `npm run test:e2e -- --grep "마지막 종합 미션" --reporter=line --workers=1`: 1개 통과
- `npm test`: 단위·콘텐츠·SSR 14개 통과
- `npm run build`: 통과

## Diff 검토

Task 2에 지정된 광학 경로, 경로 테스트, 장면 컴포넌트, E2E 테스트와 이 보고서만 변경했습니다. Task 1의 `sceneGuide`, `conceptHelp`, dark 동적 안내는 보존했고, 코드 파일은 모두 500줄 미만입니다.

## 전체 E2E 점검

명령: `npm run test:e2e -- --reporter=line --workers=1`

결과: 14개 중 12개가 통과했습니다. Task 2의 마지막 종합 미션 시나리오는 통과했습니다. 남은 두 실패는 이번 범위를 벗어난 기존 기대값입니다.

- 장면 안내 순서 테스트가 Task 1에서 승인된 미션별 `sceneGuide` 대신 이전 공통 SVG 라벨을 기대합니다.
- 업데이트 내역 대화상자 테스트가 이후 범위의 헤더/대화상자 흐름과 맞지 않습니다.

Task 2의 도메인·집중 E2E·전체 단위/콘텐츠/SSR·빌드는 모두 통과했습니다.
