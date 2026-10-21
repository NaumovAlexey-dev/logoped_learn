import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.setItem('priem.progress.v1', JSON.stringify({
  tutorialCompleted: true, tutorialFirstTry: 6, tutorialErrors: [], examPassed: true,
  bestExamScore: 100, lastMode: 'exam', updatedAt: new Date().toISOString(),
})))
await page.reload({ waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Кейсы', exact: true }).click()
await page.waitForTimeout(200)
const buttons = await page.locator('.case-card--featured .btn').allInnerTexts()
console.log('case buttons:', buttons)
await page.getByRole('button', { name: 'Прогресс', exact: true }).click()
await page.waitForTimeout(200)
await page.screenshot({ path: 'shots/19-progress-ring.png', fullPage: false })
await browser.close()
