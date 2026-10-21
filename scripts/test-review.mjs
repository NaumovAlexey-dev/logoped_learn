import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(e.message))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  const due = new Date(Date.now() - 60000).toISOString()
  localStorage.setItem('priem.progress.v1', JSON.stringify({
    cases: {
      'dislalia-01': { tutorialCompleted: true, tutorialFirstTry: 5, tutorialErrors: ['M6'], examPassed: false, bestExamScore: 0, updatedAt: new Date().toISOString() },
    },
    skills: {
      articulation: { mastery: 40, attempts: 2, correct: 1, lastPracticed: due },
    },
    review: [
      { lessonId: 'M6', skillId: 'articulation', dueAt: due, intervalDays: 0, lastReviewedAt: null, lastResult: 'wrong' },
    ],
    lastCaseId: 'dislalia-01', lastMode: 'tutorial', updatedAt: new Date().toISOString(),
  }))
})
await page.reload({ waitUntil: 'networkidle' })
console.log('review card:', (await page.locator('.review-card').innerText()).replace(/\n/g, ' | '))
await page.locator('.review-card .btn').click()
await page.waitForTimeout(300)
console.log('modal:', await page.getByRole('heading', { name: 'Повторение' }).isVisible())
console.log('question:', await page.locator('.review__question').innerText())
await page.locator('.review__option').filter({ hasText: 'Синкинезии и истощаемость' }).click()
await page.locator('.review__actions .btn').click()
await page.waitForTimeout(200)
console.log('result:', (await page.locator('.review__result').innerText()).replace(/\n/g, ' | '))
await page.locator('.review__actions .btn').click()
await page.waitForTimeout(300)
console.log('summary:', (await page.locator('.review-summary').innerText()).replace(/\n/g, ' | '))
await page.getByRole('button', { name: /Готово/ }).click()
await page.waitForTimeout(300)
const saved = JSON.parse(await page.evaluate(() => localStorage.getItem('priem.progress.v1')))
console.log('saved review:', saved.review[0])
console.log('saved skill:', saved.skills.articulation)
console.log('home review:', (await page.locator('.review-card').innerText()).replace(/\n/g, ' | '))
console.log('skill rows:', await page.locator('.skill-row').count())
await page.screenshot({ path: 'shots/42-review-home.png', fullPage: false })
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
