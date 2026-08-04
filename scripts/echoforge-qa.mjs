import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const base = "http://127.0.0.1:8080/";
await mkdir("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/screenshots/01-onboarding.png", fullPage: false });

// Begin wandering
const begin = page.getByRole("button", { name: /Begin wandering/i });
await begin.click();
await page.waitForTimeout(600);
await page.screenshot({ path: "/workspace/screenshots/02-ar.png", fullPage: false });

// Click a nearby strip card if any
const nearby = page.locator("button").filter({ hasText: /m ·|km ·|here/i }).first();
if (await nearby.count()) {
  await nearby.click().catch(() => {});
  await page.waitForTimeout(500);
}
await page.screenshot({ path: "/workspace/screenshots/03-ar-echo.png", fullPage: false });

// Map
await page.getByRole("button", { name: /^Map$/i }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: "/workspace/screenshots/04-map.png", fullPage: false });

// Create
await page.getByRole("button", { name: /^Leave$/i }).click();
await page.waitForTimeout(400);
await page.locator("textarea").fill("Soft rain on brick. I left this for whoever needs quiet.");
await page.getByRole("button", { name: /Place echo/i }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: "/workspace/screenshots/05-after-create.png", fullPage: false });

// Profile
await page.getByRole("button", { name: /^You$/i }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: "/workspace/screenshots/06-profile.png", fullPage: false });

// Serendipity
await page.getByRole("button", { name: /Serendipity/i }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: "/workspace/screenshots/07-serendipity.png", fullPage: false });

// Desktop
const desk = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await desk.goto(base, { waitUntil: "networkidle" });
await desk.waitForTimeout(500);
// may still have onboarding cleared via storage? new context so fresh
await desk.getByRole("button", { name: /Explore the map/i }).click().catch(async () => {
  await desk.getByRole("button", { name: /Begin wandering/i }).click();
});
await desk.waitForTimeout(700);
await desk.screenshot({ path: "/workspace/screenshots/08-desktop.png", fullPage: false });

const body = await page.locator("body").innerText();
console.log(JSON.stringify({ errors, bodySample: body.slice(0, 400), ok: errors.length === 0 }, null, 2));
await browser.close();
