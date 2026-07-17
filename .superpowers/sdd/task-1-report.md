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
