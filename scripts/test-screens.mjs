import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message))

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  localStorage.setItem('priem.progress.v1', JSON.stringify({
    tutorialCompleted: true,
    tutorialFirstTry: 5,
    tutorialErrors: ['M6'],
    examPassed: true,
    bestExamScore: 100,
    lastMode: 'exam',
    updatedAt: new Date().toISOString(),
  }))
})
await page.reload({ waitUntil: 'networkidle' })
await page.screenshot({ path: 'shots/13-home-progress.png', fullPage: true })

await page.getByRole('button', { name: 'Кейсы', exact: true }).click()
await page.waitForTimeout(200)
await page.screenshot({ path: 'shots/14-cases.png', fullPage: true })

await page.getByRole('button', { name: 'Прогресс', exact: true }).click()
await page.waitForTimeout(200)
await page.screenshot({ path: 'shots/15-progress.png', fullPage: true })

await page.getByRole('button', { name: 'О игре', exact: true }).click()
await page.waitForTimeout(200)
await page.screenshot({ path: 'shots/16-about.png', fullPage: true })

const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await desktop.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await desktop.evaluate(() => {
  localStorage.setItem('priem.progress.v1', JSON.stringify({
    tutorialCompleted: true, tutorialFirstTry: 5, tutorialErrors: ['M6'],
    examPassed: true, bestExamScore: 100, lastMode: 'exam', updatedAt: new Date().toISOString(),
  }))
})
await desktop.reload({ waitUntil: 'networkidle' })
await desktop.screenshot({ path: 'shots/17-home-desktop-nav.png', fullPage: false })
console.log('desktop nav visible:', await desktop.locator('.desktop-nav').isVisible())
console.log('console errors:', errors.length ? errors : 'none')
await browser.close()
