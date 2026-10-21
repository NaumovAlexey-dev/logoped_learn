import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(e.message))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  const due = new Date(Date.now() - 60000).toISOString()
  const last = new Date().toISOString()
  localStorage.setItem('priem.progress.v1', JSON.stringify({
    cases: {
      'dislalia-01': { tutorialCompleted: true, tutorialFirstTry: 4, tutorialErrors: ['M6'], examPassed: false, bestExamScore: 0, updatedAt: last },
    },
    skills: {
      anamnesis: { mastery: 82, attempts: 3, correct: 3, lastPracticed: last },
      sounds: { mastery: 71, attempts: 2, correct: 2, lastPracticed: last },
      phonemics: { mastery: 64, attempts: 2, correct: 1, lastPracticed: last },
      grammar: { mastery: 58, attempts: 1, correct: 1, lastPracticed: last },
      articulation: { mastery: 42, attempts: 2, correct: 1, lastPracticed: last },
      conclusion: { mastery: 55, attempts: 1, correct: 1, lastPracticed: last },
      ethics: { mastery: 50, attempts: 0, correct: 0, lastPracticed: null },
    },
    review: [
      { lessonId: 'M6', skillId: 'articulation', dueAt: due, intervalDays: 0, lastReviewedAt: last, lastResult: 'wrong' },
      { lessonId: 'M5', skillId: 'phonemics', dueAt: due, intervalDays: 0, lastReviewedAt: last, lastResult: 'wrong' },
    ],
    lastCaseId: 'dislalia-01', lastMode: 'tutorial', updatedAt: last,
  }))
})
await page.reload({ waitUntil: 'networkidle' })
await page.screenshot({ path: 'shots/43-home-learning.png', fullPage: true })
await page.getByRole('button', { name: 'Прогресс', exact: true }).click()
await page.waitForTimeout(300)
console.log('skill rows:', await page.locator('.skill-row').count())
console.log('review stat:', (await page.locator('.review-stat').innerText()).replace(/\n/g, ' | '))
await page.screenshot({ path: 'shots/44-progress-learning.png', fullPage: true })
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
