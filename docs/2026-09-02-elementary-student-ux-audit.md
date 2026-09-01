# 2026-09-02 초등 학습자 UX 감사

## 범위

초등 5~6학년을 주 사용자로 보고 320×800, 375×812, 1280×900 화면에서 시작부터 안내 활동·5개 미션·오답 회복·완료까지 확인했습니다. VoiceOver 검증은 범위에서 제외했습니다.

## 개선 내용

- 시작 CTA를 첫 화면 앞부분으로 이동했습니다.
- 실제 행동 수와 같은 7단계를 표시합니다: `장면 찾기 → 예상 → 장치 → 빛길 확인 → 관찰 → 설명 → 완료`.
- 다음 단계의 선택지는 숨기고 `먼저 … 하면 열려요` 잠금 안내를 보여 줍니다.
- 안전·미션·완료 화면 전환 시 제목에 포커스를 맞춥니다.
- 오답 trace에서 도움말로 바로 이동하고 `장치 다시 고르기`로 회복할 수 있습니다.
- 현재 행동 하나에만 `gi-pulse`를 적용하며 reduced-motion 환경에서는 정적 외곽선으로 표시합니다.

## 검증

- `npm run typecheck`: 통과
- `npm test`: 16개 통과
- `npm run build:pages`: 통과
- `npm run lint`, `git diff --check`: 통과
- 시스템 Chrome 전체 흐름: 5개 미션 완료, 오답 회복, 320/375/1280 CTA 노출, 가로 넘침 없음, 콘솔 오류·실패 요청 없음
- 기본 `npm run test:e2e`: bundled Chromium 실행 파일 부재로 시작 단계에서 차단됨

## 배포 확인

- 커밋: `f149dc30ed7a7175881868805c2489b7d41a2d38`
- Pages workflow: [33571979902](https://github.com/WBmaker2/light-path-rescue-team/actions/runs/33571979902) 성공
- 공개 learner 경로: [https://wbmaker2.github.io/light-path-rescue-team/](https://wbmaker2.github.io/light-path-rescue-team/)
- 공개 HTML HTTP 200, 빌드된 JS/CSS 자산 HTTP 200, 320px CTA 노출·가로 넘침 없음, 콘솔 오류 0 확인

이 기록은 실제 학생 인터뷰가 아니라 브라우저 기반 learner-flow 점검 결과입니다. 광학 경로의 정확한 위치 관계를 위해 기존 SVG 도식을 유지했으며, 장식용 생성 이미지는 추가하지 않았습니다.
