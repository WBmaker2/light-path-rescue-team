# Elementary Student Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the restart and mobile-observation failures, remove the final-mission answer leak, and make the complete optics activity readable and navigable for grade 5–6 students.

**Architecture:** Keep `TraceResult` as the single source for the SVG and written path. Extend mission content with complete student-facing guidance instead of assembling Korean particles in the component, split the summary into its own component, and make the scene card an accessible focus target after mobile reveals.

**Tech Stack:** React 19, TypeScript 5.9, Vinext/Vite, Node test runner, Playwright, axe-core, CSS.

## Global Constraints

- Preserve the fixed guide + five-mission `prediction → setup → observation → evidence → revision` sequence.
- Do not add scoring, login, persistence, drag interaction, or open-ended simulation.
- Keep rendered paths and written path steps backed by the same `TraceResult`.
- Keep all code files below 500 lines.
- Keep body copy at least 16px and interactive targets at least 44px.
- Keep 320px free of horizontal overflow and honor `prefers-reduced-motion`.
- Keep the real-experiment safety warning.
- Add `2026-07-18 · 학생 실사용 개선` to the visible update history.

---

### Task 1: Student-facing mission content and scene guidance

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/content/missions.ts`
- Modify: `src/content/missions.test.ts`
- Modify: `src/components/LightPathScene.tsx`
- Test: `src/content/missions.test.ts`

**Interfaces:**
- Produces: `SceneGuideItem = { label: string; hint: string }`
- Produces on `MissionDefinition`: `conceptHelp: string` and `sceneGuide: readonly SceneGuideItem[]`
- Consumes: existing `MissionDefinition`, `Choice.detail`, and `TraceResult`

- [ ] **Step 1: Write failing content tests**

Add assertions that every mission has three non-generic `sceneGuide` items, a complete `conceptHelp` sentence, and no banned copy.

```ts
const banned = ["검수된", "텍스트 경로표", "직진와", "굴절와", "쓰임와"];
for (const mission of MISSIONS) {
  assert.equal(mission.sceneGuide.length, 3);
  assert.ok(mission.sceneGuide.every((item) => item.hint !== "장면에서 찾아봐요."));
  assert.ok(mission.conceptHelp.length >= 12);
  assert.ok(banned.every((word) => !JSON.stringify(mission).includes(word)));
}
```

- [ ] **Step 2: Run the content test and verify RED**

Run: `node --import tsx --test src/content/missions.test.ts`

Expected: FAIL because `sceneGuide` and `conceptHelp` do not exist.

- [ ] **Step 3: Add typed student guidance and easier copy**

Add to `src/domain/types.ts`:

```ts
export type SceneGuideItem = { label: string; hint: string };

export type MissionDefinition = {
  // existing fields
  conceptHelp: string;
  sceneGuide: readonly SceneGuideItem[];
};
```

Populate all six missions with the exact observations approved in the design spec. Use `Choice.detail` for mirror-arrow explanations and replace `세 장치 결합 연결` with `세 장치의 역할 고르기`.

- [ ] **Step 4: Render mission-specific hints**

In `LightPathScene`, remove `sceneKeyItems` and render `mission.sceneGuide`:

```tsx
<ul className="scene-key" aria-label="그림에서 살펴볼 점">
  {mission.sceneGuide.map((item) => (
    <li key={item.label}><strong>{item.label}</strong><span>{item.hint}</span></li>
  ))}
</ul>
```

Rename the caption heading to `빛길 그림`.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `node --import tsx --test src/content/missions.test.ts`

Expected: content tests pass and the project build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/domain/types.ts src/content/missions.ts src/content/missions.test.ts src/components/LightPathScene.tsx
git commit -m "feat: simplify student mission guidance"
```

### Task 2: Final-mission answer reveal and complete device trace

**Files:**
- Modify: `src/domain/light-path.ts`
- Modify: `src/domain/light-path.test.ts`
- Modify: `src/components/LightPathScene.tsx`
- Modify: `tests/e2e/student-flow.spec.ts`
- Test: `src/domain/light-path.test.ts`
- Test: `tests/e2e/student-flow.spec.ts`

**Interfaces:**
- Consumes: `getTrace("device-use-match", setupId)`
- Produces: correct match with exactly three student-readable relationship segments
- Produces: device cards whose role labels depend on revealed `setupId`, not hard-coded answers

- [ ] **Step 1: Write failing unit and E2E tests**

Unit assertion:

```ts
const result = getTrace("device-use-match", "correct-match");
assert.deepEqual(result.segments.map((segment) => segment.label), [
  "잠망경 → 평면거울 → 반사",
  "돋보기 → 볼록렌즈 → 굴절",
  "카메라 → 볼록렌즈 → 굴절",
]);
```

E2E assertions before reveal:

```ts
const scene = page.locator("figure.scene-card");
await expect(scene).toContainText("역할은 확인 뒤 공개");
await expect(scene).not.toContainText("평면거울 · 반사");
await expect(scene).not.toContainText("볼록렌즈 · 굴절");
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --import tsx --test src/domain/light-path.test.ts`

Expected: FAIL because the final mission currently has two generic path segments.

Run: `npm run test:e2e -- --grep "마지막 종합 미션" --reporter=line --workers=1`

Expected: FAIL because device roles are visible before reveal.

- [ ] **Step 3: Implement setup-dependent device cards**

Change `DeviceCard` to accept `role: "hidden" | "mirror" | "lens"`. Before a trace, render `역할은 확인 뒤 공개`. After a trace, map the chosen setup to its displayed roles. Only `correct-match` may display mirror/lens/lens.

- [ ] **Step 4: Return three device relationship segments**

For the correct match, create a `TraceResult` with three non-overlapping card-internal segments and the exact labels from Step 1. Wrong matches keep a failed summary and display the learner's selected all-mirror or all-lens mapping.

- [ ] **Step 5: Run focused and full unit tests**

Run: `node --import tsx --test src/domain/light-path.test.ts`

Expected: PASS.

Run: `npm test`

Expected: all unit/content/rendered HTML checks pass.

- [ ] **Step 6: Commit**

```bash
git add src/domain/light-path.ts src/domain/light-path.test.ts src/components/LightPathScene.tsx tests/e2e/student-flow.spec.ts
git commit -m "fix: hide final mission answers until reveal"
```

### Task 3: Reliable restart and mobile observation focus

**Files:**
- Modify: `src/components/MissionWorkspace.tsx`
- Modify: `src/components/LightPathScene.tsx`
- Modify: `tests/e2e/student-flow.spec.ts`
- Test: `tests/e2e/student-flow.spec.ts`

**Interfaces:**
- Produces: `resetSession(): void` clearing every mission/session state field
- Produces: scene `ref` as a programmatically focusable `HTMLFigureElement`
- Produces: `#trace-title` jump target and `빛길 기록으로 가기` link after reveal

- [ ] **Step 1: Write failing restart regression test**

Complete all activities, click `처음부터 다시 살펴보기`, enter the guide again, and assert:

```ts
await expect(page.getByRole("button", { name: "빛길 확인" })).toBeDisabled();
await expect(page.getByRole("region", { name: "빛길 순서" })).toHaveCount(0);
await expect(page.getByText("장치와 빛의 성질을 알맞게 연결했어요.")).toHaveCount(0);
```

- [ ] **Step 2: Write failing 320px focus test**

```ts
await page.setViewportSize({ width: 320, height: 720 });
// choose prediction/setup and reveal
const scene = page.locator("figure.scene-card");
await expect(scene).toBeFocused();
const box = await scene.boundingBox();
expect(box?.y).toBeGreaterThanOrEqual(0);
expect(box?.y).toBeLessThan(720);
await expect(scene.getByRole("link", { name: "빛길 기록으로 가기" })).toBeVisible();
```

- [ ] **Step 3: Run both E2E tests and verify RED**

Run: `npm run test:e2e -- --grep "다시 시작|모바일 관찰" --reporter=line --workers=1`

Expected: restart test fails from stale final-mission state; focus test fails because the figure remains above the viewport.

- [ ] **Step 4: Implement complete reset**

Create one `resetSession` function that clears `screen`, `index`, `prediction`, `setup`, `firstSetup`, `trace`, `visibleSegments`, `attempts`, `explanation`, `feedback`, and `records`. Pass it to the summary restart button.

- [ ] **Step 5: Forward the scene ref and focus after mobile reveal**

Use `forwardRef<HTMLFigureElement, SceneProps>` for `LightPathScene`. In `MissionWorkspace`, react to a new trace:

```ts
useEffect(() => {
  if (!trace || !window.matchMedia("(max-width: 820px)").matches) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  sceneRef.current?.focus({ preventScroll: true });
  sceneRef.current?.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
}, [trace]);
```

The figure uses `tabIndex={trace ? -1 : undefined}` and includes a `빛길 기록으로 가기` link only when a trace exists.

- [ ] **Step 6: Run focused E2E tests and verify GREEN**

Run: `npm run test:e2e -- --grep "다시 시작|모바일 관찰" --reporter=line --workers=1`

Expected: both tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/MissionWorkspace.tsx src/components/LightPathScene.tsx tests/e2e/student-flow.spec.ts
git commit -m "fix: restore student observation and restart flow"
```

### Task 4: Student explanation, progress, summary cards, and mobile header

**Files:**
- Create: `src/components/SessionSummary.tsx`
- Modify: `src/components/MissionWorkspace.tsx`
- Modify: `src/components/AppHeader.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `tests/e2e/student-flow.spec.ts`
- Test: `tests/e2e/student-flow.spec.ts`

**Interfaces:**
- Produces: exported `MissionRecord` type from `SessionSummary.tsx`
- Produces: `SessionSummary({ records, onRestart })`
- Produces: progressbar with `aria-valuemin=1`, `aria-valuemax=6`, `aria-valuenow=index+1`
- Produces: mobile `<details className="mobile-help">` with three information buttons

- [ ] **Step 1: Update E2E expectations first**

Require:

```ts
await expect(page.getByRole("progressbar", { name: "활동 진행" })).toHaveAttribute("aria-valuemax", "6");
await expect(page.getByRole("heading", { name: "3. 본 것을 바탕으로 설명하기" })).toBeVisible();
await expect(page.getByRole("region", { name: "빛길 순서" })).toBeVisible();
await expect(page.getByRole("list", { name: "미션별 관찰 기록" }).getByRole("listitem")).toHaveCount(5);
```

At 320px, open `도움말`, then open `업데이트 내역` and assert the 2026-07-18 entry.

- [ ] **Step 2: Run updated E2E tests and verify RED**

Run: `npm run test:e2e -- --grep "진행|학생용 결과|업데이트" --reporter=line --workers=1`

Expected: FAIL because the progressbar, summary list, and mobile help do not exist.

- [ ] **Step 3: Simplify the workspace copy and feedback**

Apply the exact common replacements from the design spec. Render `Choice.detail` below its label. Replace the generated particle sentence with the fixed three-step explanation and `mission.conceptHelp`.

Rename trace controls to `다음 빛길 보기` and `빛길 한 번에 보기`. Use `맞아요. 그림에서 확인한 빛길과 잘 연결했어요.` for success feedback.

- [ ] **Step 4: Add the six-step progressbar**

Render the progress label and fill width from `(index + 1) / MISSIONS.length` without adding navigation or skipping.

- [ ] **Step 5: Extract student summary cards**

Create `SessionSummary.tsx` and render a semantic list of five cards. Each card exposes `처음 생각`, `마지막 선택`, and `배운 점`; a `<details>` reveals attempt count, whether the selection changed, and the explanation.

- [ ] **Step 6: Add the mobile help menu and update history**

Keep the current desktop header controls. Below 820px hide the desktop information controls and show `도움말` with `선생님용`, `모형과 안전`, and `업데이트 내역`. Add the approved 2026-07-18 history entry at the top of `app/page.tsx`.

- [ ] **Step 7: Add responsive CSS**

Style progress, choice details, scene jump link, summary cards, and mobile help. Ensure the mobile header prioritizes brand/progress and remains free of horizontal overflow.

- [ ] **Step 8: Run focused E2E and accessibility checks**

Run: `npm run test:e2e -- --grep "진행|학생용 결과|업데이트|axe|mobile" --reporter=line --workers=1`

Expected: all focused tests pass with no serious or critical axe violations.

- [ ] **Step 9: Commit**

```bash
git add src/components/SessionSummary.tsx src/components/MissionWorkspace.tsx src/components/AppHeader.tsx app/page.tsx app/globals.css tests/e2e/student-flow.spec.ts
git commit -m "feat: polish the elementary student learning flow"
```

### Task 5: Release documentation, full verification, social preview, and Sites publish

**Files:**
- Modify: `docs/2026-07-18-elementary-student-usability-audit.md`
- Modify: `.gstack/design-reports/design-audit-localhost-2026-07-18.md` (local-only, ignored)
- Modify: `.gstack/design-reports/design-baseline.json` (local-only, ignored)
- Create: `public/og.png` only if the generated text is correct and legible
- Modify: `app/layout.tsx` only if `public/og.png` passes inspection

**Interfaces:**
- Consumes: all previous tasks
- Produces: final before/after audit, one social preview when usable, and a deployed Sites version

- [ ] **Step 1: Run the full static verification gate**

Run in order:

```bash
npm run lint
npm run typecheck
npm test
npm run check:runtime-network
npm run build
```

Expected: every command exits 0.

- [ ] **Step 2: Run the complete browser suite**

Run: `npm run test:e2e -- --reporter=line --workers=1`

Expected: every Playwright test passes.

- [ ] **Step 3: Repeat student-perspective browser QA**

Complete all six activities at 320px and desktop, including one wrong choice and correction. Confirm the restart, answer hiding, scene focus, summary cards, help menu, update history, no overflow, and no console errors. Save after screenshots in `artifacts/student-qa-2026-07-18/`.

- [ ] **Step 4: Update the audit with verified outcomes**

Mark each P0/P1/P2 item as fixed or deferred, include final test counts, before/after evidence paths, and final design scores.

- [ ] **Step 5: Create and inspect one Sites social preview**

Generate one landscape social card using the navy, cream, yellow, and teal visual language and the exact Korean title `빛길 구조대`. Inspect all text. If any required text is wrong after the one allowed retry, omit `og:image`; otherwise save it as `public/og.png` and wire absolute-host Open Graph/X metadata.

- [ ] **Step 6: Commit the verified release source**

```bash
git add app src tests docs artifacts .gitignore
[ ! -f public/og.png ] || git add public/og.png
git commit -m "docs: record verified student experience release"
```

- [ ] **Step 7: Package and publish with Sites**

Use the existing `.openai/hosting.json` project id, package the successful build, save exactly one new version from the pushed HEAD SHA, deploy with the existing private access policy, and poll until the deployment reports `succeeded`.

- [ ] **Step 8: Verify the deployed URL**

Open the exact deployed URL in Codex after Sites reports success. Confirm the private deployment loads for the owner and report the clickable URL.
