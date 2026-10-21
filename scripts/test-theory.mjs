import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message))

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Теория', exact: true }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'shots/20-theory-cheatsheet.png', fullPage: true })
console.log('cheat heading:', await page.locator('h1').first().innerText())

await page.getByRole('tab', { name: 'Микро-уроки' }).click()
await page.waitForTimeout(250)
await page.screenshot({ path: 'shots/21-theory-lessons.png', fullPage: true })
console.log('lesson cards:', await page.locator('.theory-card').count())

await page.locator('.theory-card').first().click()
await page.waitForTimeout(300)
console.log('lesson modal:', await page.getByRole('heading', { name: 'Как читать карточку' }).isVisible())
await page.screenshot({ path: 'shots/22-theory-modal.png', fullPage: false })
await page.getByRole('button', { name: 'Закрыть' }).click()
await page.waitForTimeout(200)

await page.getByRole('button', { name: 'Приём', exact: true }).click()
await page.getByRole('button', { name: /Начать первый приём/ }).click()
await page.waitForTimeout(300)
await page.getByRole('button', { name: 'Шпаргалка', exact: true }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'shots/23-tutorial-cheatsheet.png', fullPage: false })
console.log('tutorial cheat visible:', await page.getByRole('heading', { name: 'Шпаргалка' }).isVisible())
console.log('console errors:', errors.length ? errors : 'none')
await browser.close()
