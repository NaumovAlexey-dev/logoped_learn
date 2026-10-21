import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.setItem('priem.progress.v1', JSON.stringify({
  cases: {
    'dislalia-01': { tutorialCompleted: true, tutorialFirstTry: 6, tutorialErrors: [], examPassed: true, bestExamScore: 100, updatedAt: new Date().toISOString() },
    'dysarthria-02': { tutorialCompleted: true, tutorialFirstTry: 6, tutorialErrors: [], examPassed: false, bestExamScore: 0, updatedAt: new Date().toISOString() },
  },
  lastCaseId: 'dysarthria-02', lastMode: 'tutorial', updatedAt: new Date().toISOString(),
})))
await page.reload({ waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Кейсы', exact: true }).click()
await page.waitForTimeout(200)
const nasty = page.locator('.case-card').filter({ hasText: 'Настя' })
console.log('nasty buttons:', await nasty.locator('.btn').allInnerTexts())
await nasty.getByRole('button', { name: 'Пройти зачёт', exact: true }).click()
await page.waitForTimeout(300)
console.log('exam header:', await page.locator('.session-top__title').innerText())

// Step 1
await page.locator('.choice').filter({ hasText: 'Дизартрия, стёртая форма' }).click()
await page.locator('.action-bar .btn').click(); await page.waitForTimeout(120); await page.locator('.action-bar .btn').click(); await page.waitForTimeout(120)
// Step 2
for (const text of ['Проверяли ли слух', 'Когда появились первые слова', 'Были ли судороги']) await page.locator('.question').filter({ hasText: text }).click()
await page.locator('.action-bar .btn').click(); await page.waitForTimeout(120); await page.locator('.action-bar .btn').click(); await page.waitForTimeout(120)
// Step 3
const types = ['Искажение', 'Искажение', 'Замена', 'Норма']
for (let i = 0; i < types.length; i++) await page.locator('.clip').nth(i).getByRole('button', { name: types[i], exact: true }).click()
await page.locator('.action-bar .btn').click(); await page.waitForTimeout(120); await page.locator('.action-bar .btn').click(); await page.waitForTimeout(120)
// Step 4
await page.locator('.pair').nth(0).getByRole('button', { name: 'Не различает', exact: true }).click()
await page.locator('.pair').nth(1).getByRole('button', { name: 'Не различает', exact: true }).click()
await page.locator('.pair').nth(2).getByRole('button', { name: 'Различает', exact: true }).click()
await page.getByRole('button', { name: 'Аграмматизмов нет', exact: true }).click()
await page.locator('.choice').filter({ hasText: 'Фонематика нарушена' }).click()
await page.locator('.action-bar .btn').click(); await page.waitForTimeout(120); await page.locator('.action-bar .btn').click(); await page.waitForTimeout(120)
// Step 5
for (let i = 0; i < 6; i++) await page.locator('.finding').nth(i).getByRole('button', { name: i < 5 ? 'Есть' : 'Нет', exact: true }).click()
await page.locator('.choice').filter({ hasText: 'Дизартрия, стёртая форма' }).click()
await page.locator('.action-bar .btn').click(); await page.waitForTimeout(120); await page.locator('.action-bar .btn').click(); await page.waitForTimeout(120)
// Step 6
for (const [i, v] of ['dysarthria', 'stiertaya', 'ffnr', 'r471', 'ma802'].entries()) await page.locator('.form-grid select').nth(i).selectOption(v)
await page.locator('.argument').filter({ hasText: 'Стойкие фонетические нарушения' }).click()
await page.locator('.argument').filter({ hasText: 'Просодика монотонна' }).click()
await page.locator('.argument').filter({ hasText: 'При дислалии не было бы' }).click()
await page.locator('.action-bar .btn').click(); await page.waitForTimeout(120); await page.locator('.action-bar .btn').click(); await page.waitForTimeout(500)
await page.screenshot({ path: 'shots/27-case2-exam.png', fullPage: true })
console.log('debrief:', await page.locator('h1').first().innerText())
console.log('progress:', await page.evaluate(() => localStorage.getItem('priem.progress.v1')))
await page.getByRole('button', { name: 'Прогресс', exact: true }).click().catch(() => {})
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
