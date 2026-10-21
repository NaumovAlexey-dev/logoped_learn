import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message))

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'shots/01-home-mobile.png', fullPage: true })
console.log('home title:', await page.locator('h1').first().innerText())

await page.getByRole('button', { name: /Начать первый приём/ }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'shots/02-step-1.png', fullPage: true })

// Step 1
await page.locator('.choice').filter({ hasText: 'Дислалия' }).first().click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)

// Step 2
for (const text of ['Проверяли ли слух', 'Когда появились первые слова', 'Были ли судороги']) {
  await page.locator('.question').filter({ hasText: text }).click()
}
await page.screenshot({ path: 'shots/03-step-2.png', fullPage: true })
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)

// Step 3
const types = ['Искажение', 'Искажение', 'Замена', 'Норма']
for (let i = 0; i < types.length; i++) {
  await page.locator('.clip').nth(i).getByRole('button', { name: types[i], exact: true }).click()
}
await page.screenshot({ path: 'shots/04-step-3.png', fullPage: true })
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)

// Step 4
const pairs = page.locator('.pair')
for (let i = 0; i < 3; i++) {
  await pairs.nth(i).getByRole('button', { name: 'Различает', exact: true }).click()
}
await page.getByRole('button', { name: 'Аграмматизмов нет', exact: true }).click()
await page.locator('.choice').filter({ hasText: 'Фонематика и грамматика сохранны' }).click()
await page.screenshot({ path: 'shots/05-step-4.png', fullPage: true })
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)

// Step 5
const findings = page.locator('.finding')
for (let i = 0; i < 6; i++) {
  const yes = i < 2
  await findings.nth(i).getByRole('button', { name: yes ? 'Есть' : 'Нет', exact: true }).click()
}
await page.locator('.choice').filter({ hasText: 'Дислалия, функциональная' }).click()
await page.screenshot({ path: 'shots/06-step-5.png', fullPage: true })
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)

// Step 6
const selects = page.locator('.form-grid select')
const values = ['dislalia', 'functional', 'fnr', 'f800', '6a010']
for (let i = 0; i < values.length; i++) {
  await selects.nth(i).selectOption(values[i])
}
await page.locator('.argument').filter({ hasText: 'Изолированное нарушение произношения' }).click()
await page.locator('.argument').filter({ hasText: 'По подражанию появляется чистый' }).click()
await page.locator('.argument').filter({ hasText: 'При стёртой дизартрии были бы синкинезии' }).click()
await page.screenshot({ path: 'shots/07-step-6.png', fullPage: true })
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(400)

const passedText = await page.locator('.feedback--ok, .feedback--warn').first().innerText().catch(() => 'no feedback')
console.log('final feedback:', passedText.replace(/\n/g, ' '))

if (await page.getByRole('button', { name: /Завершить приём/ }).count()) {
  await page.getByRole('button', { name: /Завершить приём/ }).click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'shots/08-debrief.png', fullPage: true })
  console.log('debrief heading:', await page.locator('h1').first().innerText())
}

// Desktop home
const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 })
await desktop.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await desktop.screenshot({ path: 'shots/09-home-desktop.png', fullPage: true })

console.log('console errors:', errors.length ? errors : 'none')
await browser.close()
