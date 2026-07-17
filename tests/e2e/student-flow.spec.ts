import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Page as AxePage } from "playwright-core";

const successfulActivities = [
  ["빛이 블록과 관찰창까지 이어진 장면", "빛이 블록과 관찰창까지 이어져요", "빛이 물체에 닿고 관찰자 쪽으로 이어져야 보여요."],
  ["빛이 곧게 통과할 거예요", "두 구멍을 가운데로 맞추기", "같은 공기 속에서 빛길을 곧게 나타내어 표적에 닿았어요."],
  ["거울에서 표지판 쪽으로 바뀔 거예요", "슬롯 A · ↗ 방향 거울", "평면거울에서 빛의 방향이 바뀌어 표지판에 닿았어요."],
  ["두 번 방향이 바뀔 거예요", "거울 A ↘ · 거울 B ↗", "두 평면거울에서 반사된 뒤, 새 방향으로 직진해 관찰창에 닿았어요."],
  ["렌즈 뒤에서 빛이 모일 거예요", "렌즈를 가운데 슬롯에 놓기", "볼록렌즈에서 평행한 빛이 모이는 방향으로 바뀌어 표적 위치에 모였어요."],
  ["장치마다 쓰는 빛의 성질이 다를 거예요", "잠망경: 평면거울 반사 · 돋보기/카메라: 볼록렌즈 굴절", "잠망경은 거울의 반사, 돋보기와 카메라는 렌즈의 쓰임과 연결해 볼 수 있어요."],
] as const;

async function beginSafety(page: Page) {
  const start = page.getByRole("button", { name: "빛길 구조 시작" });
  const confirm = page.getByRole("button", { name: "확인했어요" });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await start.click();
    if (await confirm.isVisible()) return;
    await page.waitForTimeout(100);
  }
  await expect(confirm).toBeVisible();
}

async function enterActivities(page: Page) {
  await beginSafety(page);
  await page.getByRole("button", { name: "확인했어요" }).click();
}

async function completeActivity(page: Page, choices: readonly [string, string, string], isLast: boolean) {
  await page.getByLabel(choices[0], { exact: true }).check();
  await page.getByLabel(choices[1]).check();
  await page.getByRole("button", { name: "빛길 확인" }).click();
  await expect(page.getByRole("heading", { name: "빛길 순서" })).toBeVisible();
  await page.getByLabel(choices[2], { exact: true }).check();
  await page.getByRole("button", { name: isLast ? "관찰 기록 보기" : "다음 활동으로" }).click();
}

async function axeResults(page: Page) {
  return new AxeBuilder({ page: page as unknown as AxePage }).analyze();
}

test("student completes the guide and five missions with a five-mission summary", async ({ page }) => {
  await page.goto("/");
  await enterActivities(page);
  for (const [index, choices] of successfulActivities.entries()) await completeActivity(page, choices, index === successfulActivities.length - 1);
  const list = page.getByRole("list", { name: "미션별 관찰 기록" });
  await expect(list).toBeVisible();
  await expect(list.getByRole("listitem")).toHaveCount(5);
  await expect(list).not.toContainText("빛이 있어야 보여요");
});

test("시작과 안전 안내는 쉬운 학생 문구를 쓴다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("화면의 빛길", { exact: false })).toBeVisible();
  await expect(page.getByText("본 것을 설명하기", { exact: false })).toBeVisible();

  await beginSafety(page);
  await expect(page.getByRole("heading", { name: "이 화면에서 볼 수 있는 것" })).toBeVisible();
  await expect(page.getByText("이 화면은 나란히 들어오는 세 빛줄기가 모이는 장면만 보여 줘요.")).toBeVisible();

  await page.getByRole("button", { name: "확인했어요" }).click();
  await page.getByLabel(successfulActivities[0][0], { exact: true }).check();
  await page.getByLabel(successfulActivities[0][1], { exact: true }).check();
  await page.getByRole("button", { name: "빛길 확인" }).click();
  await expect(page.locator(".comparison")).toHaveText("예상과 관찰이 같았어요. 빛이 멈추거나 방향을 바꾼 곳을 찾아 설명해 봐요.");
  await page.getByLabel("광원이 꺼진 장면", { exact: true }).check();
  await page.getByRole("button", { name: "빛길 확인" }).click();
  await expect(page.locator(".comparison")).toHaveText("예상과 관찰이 달랐어요. 빛이 멈추거나 방향을 바꾼 곳을 보고 다시 생각해 봐요.");
});

test("information dialog traps focus, closes with Escape, and restores its trigger", async ({ page }) => {
  await page.goto("/");
  await beginSafety(page);
  const trigger = page.getByRole("button", { name: "모형과 안전" });
  await trigger.focus();
  await trigger.press("Enter");
  const dialog = page.getByRole("dialog", { name: "모형과 안전" });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", { name: "대화상자 닫기" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("mobile layout avoids horizontal overflow and keeps the primary button visible", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await enterActivities(page);
  await page.getByLabel(successfulActivities[0][0], { exact: true }).check();
  await page.getByLabel(successfulActivities[0][1], { exact: true }).check();
  await page.getByRole("button", { name: "빛길 확인" }).click();
  await expect(page.getByRole("button", { name: "빛길 확인" })).toBeVisible();
  await expect(page.getByRole("button", { name: "다음 빛길 보기" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "빛길 순서" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("mobile starts by showing the scene and its key objects", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await enterActivities(page);
  const scene = page.locator("figure.scene-card");
  const firstChoice = page.locator("fieldset").first();
  expect((await scene.boundingBox())?.y).toBeLessThan((await firstChoice.boundingBox())?.y ?? 0);
  const sceneKey = scene.locator(".scene-key");
  await expect(sceneKey).toBeVisible();
  await expect(sceneKey).toContainText("광원");
  await expect(sceneKey).toContainText("파란 블록");
  await expect(sceneKey).toContainText("관찰창");
});

test("위쪽 첫 구멍은 수평 빛길을 가리지 않는다", async ({ page }) => {
  await page.goto("/");
  await enterActivities(page);
  await completeActivity(page, successfulActivities[0], false);

  const scene = page.locator("figure.scene-card");
  await page.getByLabel("첫 구멍을 위로 옮기기", { exact: true }).check();
  await expect(scene.locator("rect.first-wall").first()).toHaveAttribute("height", "70");
  await expect(scene.locator("rect.first-wall").nth(1)).toHaveAttribute("y", "250");
  await expect(scene.locator("rect.second-wall").first()).toHaveAttribute("height", "150");
  await expect(scene.locator("rect.second-wall").nth(1)).toHaveAttribute("y", "330");
});

test("꺼진 광원은 빛길을 그리지 않고 0구간 상태를 보여 준다", async ({ page }) => {
  await page.goto("/");
  await enterActivities(page);
  const prediction = page.getByLabel("광원이 꺼진 장면", { exact: true });
  const setup = page.getByLabel("광원이 꺼져 있어요", { exact: true });
  await prediction.check();
  await expect(prediction).toBeChecked();
  await setup.check();
  await expect(setup).toBeChecked();
  await page.getByRole("button", { name: "빛길 확인" }).click();
  const scene = page.locator("figure.scene-card");
  await expect(scene.locator(".source-off")).toBeVisible();
  await expect(scene.locator(".source")).toHaveCount(0);
  await expect(scene.locator("svg .block")).toHaveCount(0);
  await expect(scene.locator("figcaption .scene-key")).toContainText("꺼진 광원");
  await expect(scene.locator("figcaption")).toContainText("빛길이 시작되지 않음 · 광원이 꺼져 있어 빛길이 시작되지 않아요.");
  await expect(scene.locator("figcaption")).not.toContainText("장애물에서 멈춤");
  await expect(scene.locator(".light-ray")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "빛길 순서" })).toContainText("빛길이 시작되지 않음");
});

test("마지막 종합 미션은 확인 전 장치 역할을 숨긴다", async ({ page }) => {
  await page.goto("/");
  await enterActivities(page);
  for (const choices of successfulActivities.slice(0, 5)) await completeActivity(page, choices, false);

  const scene = page.locator("figure.scene-card");
  await expect(scene).toContainText("역할은 확인 뒤 공개");
  await expect(scene).not.toContainText("평면거울 · 반사");
  await expect(scene).not.toContainText("볼록렌즈 · 굴절");

  await page.getByLabel(successfulActivities[5][0], { exact: true }).check();
  await page.getByLabel(successfulActivities[5][1], { exact: true }).check();
  await page.getByRole("button", { name: "빛길 확인" }).click();
  await expect(scene).toContainText("평면거울 · 반사");
  await expect(scene).toContainText("볼록렌즈 · 굴절");
  await page.getByRole("button", { name: "빛길 한 번에 보기" }).click();
  await expect(page.locator(".trace-record")).toContainText("잠망경 → 평면거울 → 반사");
  await expect(page.locator(".trace-record")).toContainText("돋보기 → 볼록렌즈 → 굴절");
  await expect(page.locator(".trace-record")).toContainText("카메라 → 볼록렌즈 → 굴절");
});

test("다시 시작은 마지막 미션의 선택과 기록을 모두 지운다", async ({ page }) => {
  await page.goto("/");
  await enterActivities(page);
  for (const [index, choices] of successfulActivities.entries()) await completeActivity(page, choices, index === successfulActivities.length - 1);

  await page.getByRole("button", { name: "처음부터 다시 살펴보기" }).click();
  await enterActivities(page);
  await expect(page.getByRole("button", { name: "빛길 확인" })).toBeDisabled();
  await expect(page.getByRole("region", { name: "빛길 순서" })).toHaveCount(0);
  await expect(page.getByText("세 장치와 빛의 성질을 알맞게 연결했어요.")).toHaveCount(0);
});

test("모바일 관찰은 결과 그림에 초점을 맞추고 기록 링크를 보여 준다", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await enterActivities(page);
  await page.getByLabel(successfulActivities[0][0], { exact: true }).check();
  await page.getByLabel(successfulActivities[0][1], { exact: true }).check();
  await page.getByRole("button", { name: "빛길 확인" }).click();

  const scene = page.locator("figure.scene-card");
  await expect(scene).toBeFocused();
  await expect.poll(async () => (await scene.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);
  await expect.poll(async () => (await scene.boundingBox())?.y ?? 720).toBeLessThan(720);
  await expect(scene.getByRole("link", { name: "빛길 기록으로 가기" })).toBeVisible();
});

test("진행 표시는 현재 활동과 학생용 설명 순서를 알려 준다", async ({ page }) => {
  await page.goto("/");
  await enterActivities(page);
  await expect(page.getByRole("progressbar", { name: "활동 진행" })).toHaveAttribute("aria-valuemax", "6");
  await page.getByLabel(successfulActivities[0][0], { exact: true }).check();
  await page.getByLabel(successfulActivities[0][1], { exact: true }).check();
  await page.getByRole("button", { name: "빛길 확인" }).click();
  await expect(page.getByRole("heading", { name: "3. 본 것을 바탕으로 설명하기" })).toBeVisible();
  await expect(page.getByRole("region", { name: "빛길 순서" })).toBeVisible();
});

test("학생용 결과 카드는 다섯 미션의 관찰을 보여 준다", async ({ page }) => {
  await page.goto("/");
  await enterActivities(page);
  for (const [index, choices] of successfulActivities.entries()) await completeActivity(page, choices, index === successfulActivities.length - 1);
  await expect(page.getByRole("list", { name: "미션별 관찰 기록" }).getByRole("listitem")).toHaveCount(5);
});

test("모바일 도움말에서 업데이트 내역을 연다", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  const help = page.locator(".mobile-help > summary");
  expect((await help.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  if (!await help.locator("xpath=..").evaluate((details) => (details as HTMLDetailsElement).open)) await help.click();
  await page.locator(".mobile-help button").filter({ hasText: "업데이트 내역" }).click();
  const dialog = page.getByRole("dialog", { name: "업데이트 내역" });
  await expect(dialog).toContainText("2026-07-18 · 학생 실사용 개선");
  await expect(dialog).toContainText("2026-07-17 · 접근성 보완");
});

test("모든 장면 안내와 화면 순서가 미션별 장면을 그대로 설명한다", async ({ page }) => {
  const sceneKeys = [
    ["광원", "파란 블록", "관찰창"],
    ["첫 가림판 구멍", "둘째 가림판 구멍", "표적"],
    ["광원", "거울 자리", "표지판"],
    ["거울 A", "거울 B", "아래 관찰창"],
    ["평행한 세 빛줄기", "렌즈 슬롯", "표적"],
    ["잠망경", "돋보기", "카메라"],
  ];
  await page.goto("/");
  await enterActivities(page);

  for (const [index, expectedKey] of sceneKeys.entries()) {
    const scene = page.locator("figure.scene-card");
    const sceneKey = scene.locator("figcaption .scene-key");
    await expect(sceneKey).toBeVisible();
    for (const item of expectedKey) await expect(sceneKey).toContainText(item);
    expect(await page.locator(".workspace-grid").evaluate((workspace) => {
      const currentScene = workspace.querySelector("figure.scene-card");
      const currentChoice = workspace.querySelector("fieldset");
      return currentScene !== null && currentChoice !== null && Boolean(currentScene.compareDocumentPosition(currentChoice) & Node.DOCUMENT_POSITION_FOLLOWING);
    })).toBe(true);
    if (index < successfulActivities.length) await completeActivity(page, successfulActivities[index], index === successfulActivities.length - 1);
  }
});

test("데스크톱과 모바일에서 장면이 선택보다 먼저 배치된다", async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 320, height: 720 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await enterActivities(page);
    const scene = page.locator("figure.scene-card");
    const firstChoice = page.locator("fieldset").first();
    const sceneBox = await scene.boundingBox();
    const choiceBox = await firstChoice.boundingBox();
    if (viewport.width > 820) expect(sceneBox?.x).toBeLessThan(choiceBox?.x ?? 0);
    else expect(sceneBox?.y).toBeLessThan(choiceBox?.y ?? 0);
  }
});

test("경로표는 현재 보이는 빛길 구간만 함께 보여 준다", async ({ page }) => {
  await page.goto("/");
  await enterActivities(page);
  await page.getByLabel(successfulActivities[0][0], { exact: true }).check();
  await page.getByLabel(successfulActivities[0][1], { exact: true }).check();
  await page.getByRole("button", { name: "빛길 확인" }).click();

  const record = page.getByRole("region", { name: "빛길 순서" });
  const step = page.getByRole("button", { name: "다음 빛길 보기" });
  await expect(record).toContainText("현재 1/2 구간");
  await expect(record.locator("ol li")).toHaveCount(1);

  await step.click();
  await expect(record).toContainText("현재 2/2 구간");
  await expect(record.locator("ol li")).toHaveCount(2);
  await expect(step).toBeDisabled();
});

test("렌즈의 여섯 구간을 한 단계씩 모두 확인한다", async ({ page }) => {
  await page.goto("/");
  await enterActivities(page);
  for (const choices of successfulActivities.slice(0, 4)) await completeActivity(page, choices, false);
  await page.getByLabel(successfulActivities[4][0], { exact: true }).check();
  await page.getByLabel(successfulActivities[4][1], { exact: true }).check();
  await page.getByRole("button", { name: "빛길 확인" }).click();

  const record = page.getByRole("region", { name: "빛길 순서" });
  const step = page.getByRole("button", { name: "다음 빛길 보기" });
  for (let visible = 1; visible <= 6; visible += 1) {
    await expect(record).toContainText(`현재 ${visible}/6 구간`);
    await expect(record.locator("ol li")).toHaveCount(visible);
    if (visible < 6) await step.click();
  }
  await expect(step).toBeDisabled();
});

test("첫 Tab은 본문 건너뛰기이고 개선 기록을 확인할 수 있다", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "본문으로 건너뛰기" });
  await expect(skipLink).toBeVisible();
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("main#main-content")).toBeFocused();

  await page.getByRole("button", { name: "업데이트 내역" }).click();
  const dialog = page.getByRole("dialog", { name: "업데이트 내역" });
  await expect(dialog).toContainText("2026-07-17 · 학습 흐름 개선");
  await expect(dialog).toContainText("장면을 먼저");
});

test("reduced motion reveals the complete path immediately", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await enterActivities(page);
  await page.getByLabel(successfulActivities[0][0], { exact: true }).check();
  await page.getByLabel(successfulActivities[0][1], { exact: true }).check();
  await page.getByRole("button", { name: "빛길 확인" }).click();
  await expect(page.locator(".light-ray")).toHaveCount(2);
});

test("start and mission surfaces have no serious axe violations or external requests", async ({ page }) => {
  const externalOrigins = new Set<string>();
  page.on("request", (request) => {
    const origin = new URL(request.url()).origin;
    if (origin !== "http://localhost:4173") externalOrigins.add(origin);
  });
  await page.goto("/");
  for (const result of [await axeResults(page)]) expect(result.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""))).toEqual([]);
  await enterActivities(page);
  for (const result of [await axeResults(page)]) expect(result.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""))).toEqual([]);
  for (const [index, choices] of successfulActivities.entries()) await completeActivity(page, choices, index === successfulActivities.length - 1);
  await expect(page.getByRole("list", { name: "미션별 관찰 기록" })).toBeVisible();
  for (const result of [await axeResults(page)]) expect(result.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""))).toEqual([]);
  expect([...externalOrigins]).toEqual([]);
});
