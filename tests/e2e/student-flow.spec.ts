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
  await page.getByLabel(choices[1], { exact: true }).check();
  await page.getByRole("button", { name: "빛길 확인" }).click();
  await expect(page.getByText("관찰 기록 · 텍스트 경로표")).toBeVisible();
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
  const table = page.getByRole("table", { name: "미션별 관찰 기록" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(6);
  await expect(table).not.toContainText("빛이 있어야 보여요");
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
  await expect(page.getByRole("button", { name: "한 단계씩" })).toBeVisible();
  await expect(page.getByText("관찰 기록 · 텍스트 경로표")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
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
  await expect(page.getByRole("table", { name: "미션별 관찰 기록" })).toBeVisible();
  for (const result of [await axeResults(page)]) expect(result.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""))).toEqual([]);
  expect([...externalOrigins]).toEqual([]);
});
