import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(e.message))
const url = 'file://' + process.cwd() + '/priem-standalone.html'
await page.goto(url, { waitUntil: 'load', timeout: 30000 })
await page.waitForTimeout(1500)
console.log('h1:', await page.locator('h1').first().innerText().catch(() => 'no h1'))
console.log('root children:', await page.locator('#root').evaluate((el) => el.children.length))
console.log('boot text:', await page.locator('.boot-screen').innerText().catch(() => 'no boot'))
console.log('errors:', errors.length ? errors : 'none')
await page.screenshot({ path: 'shots/30-standalone.png', fullPage: false })
await browser.close()
