import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message))

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle' })

await page.getByRole('button', { name: /Начать обучение/ }).click()
await page.waitForTimeout(200)

// Step 1 wrong -> M1
await page.locator('.choice').filter({ hasText: 'Стёртая дизартрия' }).click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(300)
console.log('M1 visible:', await page.getByRole('heading', { name: 'Как читать карточку' }).isVisible())
await page.screenshot({ path: 'shots/10-micro-lesson.png', fullPage: false })
await page.locator('.lesson__option').filter({ hasText: 'Дислалия' }).click()
await page.locator('.lesson__actions .btn').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: /Вернуться к шагу/ }).click()
await page.waitForTimeout(200)
await page.locator('.choice').filter({ hasText: 'Дислалия' }).first().click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)

// Step 2 noise -> M3
for (const text of ['Какой у ребёнка любимый мультфильм', 'Какой у ребёнка рост и вес', 'Сколько комнат в квартире']) {
  await page.locator('.question').filter({ hasText: text }).click()
}
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(300)
console.log('M3 visible:', await page.getByRole('heading', { name: 'Шум vs сигнал' }).isVisible())
await page.locator('.lesson__option').filter({ hasText: 'Сколько комнат в квартире' }).click()
await page.locator('.lesson__actions .btn').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: /Вернуться к шагу/ }).click()
await page.waitForTimeout(200)
// deselect noise, select critical
for (const text of ['Какой у ребёнка любимый мультфильм', 'Какой у ребёнка рост и вес', 'Сколько комнат в квартире']) {
  await page.locator('.question').filter({ hasText: text }).click()
}
for (const text of ['Проверяли ли слух', 'Когда появились первые слова', 'Были ли судороги']) {
  await page.locator('.question').filter({ hasText: text }).click()
}
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)

// Step 3 wrong type -> M4
const types = ['Замена', 'Искажение', 'Замена', 'Норма']
for (let i = 0; i < types.length; i++) {
  await page.locator('.clip').nth(i).getByRole('button', { name: types[i], exact: true }).click()
}
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(300)
console.log('M4 visible:', await page.getByRole('heading', { name: 'Искажение vs замена' }).isVisible())
await page.locator('.lesson__option').filter({ hasText: 'Замена' }).click()
await page.locator('.lesson__actions .btn').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: /Вернуться к шагу/ }).click()
await page.waitForTimeout(200)
await page.locator('.clip').nth(0).getByRole('button', { name: 'Искажение', exact: true }).click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)

// Step 4 wrong pair -> M5
const pairs = page.locator('.pair')
for (let i = 0; i < 3; i++) {
  await pairs.nth(i).getByRole('button', { name: 'Различает', exact: true }).click()
}
await pairs.nth(0).getByRole('button', { name: 'Не различает', exact: true }).click()
await page.getByRole('button', { name: 'Аграмматизмов нет', exact: true }).click()
await page.locator('.choice').filter({ hasText: 'Фонематика и грамматика сохранны' }).click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(300)
console.log('M5 visible:', await page.getByRole('heading', { name: 'Зачем фонематический слух' }).isVisible())
await page.locator('.lesson__option').filter({ hasText: 'Фонематический слух' }).click()
await page.locator('.lesson__actions .btn').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: /Вернуться к шагу/ }).click()
await page.waitForTimeout(200)
await pairs.nth(0).getByRole('button', { name: 'Различает', exact: true }).click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)

// Step 5 wrong finding -> M6
const findings = page.locator('.finding')
for (let i = 0; i < 6; i++) {
  await findings.nth(i).getByRole('button', { name: i < 2 ? 'Есть' : 'Нет', exact: true }).click()
}
await findings.nth(2).getByRole('button', { name: 'Есть', exact: true }).click()
await page.locator('.choice').filter({ hasText: 'Дислалия, функциональная' }).click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(300)
console.log('M6 visible:', await page.getByRole('heading', { name: 'Три признака дизартрии' }).isVisible())
await page.locator('.lesson__option').filter({ hasText: 'Синкинезии и истощаемость' }).click()
await page.locator('.lesson__actions .btn').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: /Вернуться к шагу/ }).click()
await page.waitForTimeout(200)
await findings.nth(2).getByRole('button', { name: 'Нет', exact: true }).click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)

// Step 6 wrong mechanism -> M8
const selects = page.locator('.form-grid select')
const values = ['onr', 'functional', 'fnr', 'f800', '6a010']
for (let i = 0; i < values.length; i++) await selects.nth(i).selectOption(values[i])
await page.locator('.argument').filter({ hasText: 'Изолированное нарушение произношения' }).click()
await page.locator('.argument').filter({ hasText: 'По подражанию появляется чистый' }).click()
await page.locator('.argument').filter({ hasText: 'При стёртой дизартрии были бы синкинезии' }).click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(300)
console.log('M8 visible:', await page.getByRole('heading', { name: 'Формула заключения' }).isVisible())
await page.locator('.lesson__option').filter({ hasText: 'Форму и уровень' }).click()
await page.locator('.lesson__actions .btn').click()
await page.waitForTimeout(200)
await page.getByRole('button', { name: /Вернуться к шагу/ }).click()
await page.waitForTimeout(200)
await selects.nth(0).selectOption('dislalia')
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(200)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(500)
await page.screenshot({ path: 'shots/11-debrief-with-errors.png', fullPage: true })
console.log('debrief:', await page.locator('h1').first().innerText())
console.log('progress:', await page.evaluate(() => localStorage.getItem('priem.progress.v1')))

// Exam
await page.getByRole('button', { name: /Пройти зачёт/ }).click()
await page.waitForTimeout(300)
console.log('mentor in exam:', await page.locator('.mentor').count())
// Step 1
await page.locator('.choice').filter({ hasText: 'Дислалия' }).first().click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(150)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(150)
// Step 2
for (const text of ['Проверяли ли слух', 'Когда появились первые слова', 'Были ли судороги']) {
  await page.locator('.question').filter({ hasText: text }).click()
}
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(150)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(150)
// Step 3
const types2 = ['Искажение', 'Искажение', 'Замена', 'Норма']
for (let i = 0; i < types2.length; i++) {
  await page.locator('.clip').nth(i).getByRole('button', { name: types2[i], exact: true }).click()
}
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(150)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(150)
// Step 4
for (let i = 0; i < 3; i++) await page.locator('.pair').nth(i).getByRole('button', { name: 'Различает', exact: true }).click()
await page.getByRole('button', { name: 'Аграмматизмов нет', exact: true }).click()
await page.locator('.choice').filter({ hasText: 'Фонематика и грамматика сохранны' }).click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(150)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(150)
// Step 5
for (let i = 0; i < 6; i++) await page.locator('.finding').nth(i).getByRole('button', { name: i < 2 ? 'Есть' : 'Нет', exact: true }).click()
await page.locator('.choice').filter({ hasText: 'Дислалия, функциональная' }).click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(150)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(150)
// Step 6
for (const [i, v] of ['dislalia', 'functional', 'fnr', 'f800', '6a010'].entries()) await page.locator('.form-grid select').nth(i).selectOption(v)
await page.locator('.argument').filter({ hasText: 'Изолированное нарушение произношения' }).click()
await page.locator('.argument').filter({ hasText: 'По подражанию появляется чистый' }).click()
await page.locator('.argument').filter({ hasText: 'При стёртой дизартрии были бы синкинезии' }).click()
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(150)
await page.locator('.action-bar .btn').click()
await page.waitForTimeout(500)
await page.screenshot({ path: 'shots/12-exam-debrief.png', fullPage: true })
console.log('exam debrief:', await page.locator('h1').first().innerText())
console.log('console errors:', errors.length ? errors : 'none')
await browser.close()
