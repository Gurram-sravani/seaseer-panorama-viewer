import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import puppeteer from 'puppeteer'
import { mkdir } from 'fs/promises'
import path from 'path'

const BASE_URL        = 'http://localhost:5173'
const SCREENSHOTS_DIR = path.join(process.cwd(), 'test-artifacts')

let browser, page

beforeAll(async () => {
  await mkdir(SCREENSHOTS_DIR, { recursive: true })
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 720 })
})

afterAll(async () => {
  await browser?.close()
})

async function waitForCanvas(p) {
  await p.waitForSelector(
    '[data-testid="panorama-container"] canvas',
    { timeout: 15000 }
  )
  await new Promise(r => setTimeout(r, 2000))
}

async function saveScreenshot(p, name) {
  const fp = path.join(SCREENSHOTS_DIR, name)
  await p.screenshot({ path: fp })
  console.log('Saved:', fp)
}

describe('Panorama 1 — initial load', () => {
  it('renders canvas, shows Panorama 1 label, Prev is disabled', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
    await waitForCanvas(page)

    const label = await page.$eval(
      '[data-testid="panorama-label"]',
      el => el.textContent.trim()
    )
    expect(label).toBe('Panorama 1')

    const prevDisabled = await page.$eval(
      '[data-testid="btn-prev"]', btn => btn.disabled
    )
    expect(prevDisabled).toBe(true)

    const canvasWidth = await page.$eval(
      '[data-testid="panorama-container"] canvas', c => c.width
    )
    expect(canvasWidth).toBeGreaterThan(0)

    await saveScreenshot(page, 'panorama-1-initial.png')
  })
})

describe('Panorama 2 — navigate forward', () => {
  it('shows Panorama 2 after clicking Next', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
    await waitForCanvas(page)

    await page.click('[data-testid="btn-next"]')
    await new Promise(r => setTimeout(r, 2000))

    const label = await page.$eval(
      '[data-testid="panorama-label"]',
      el => el.textContent.trim()
    )
    expect(label).toBe('Panorama 2')

    const prevDisabled = await page.$eval(
      '[data-testid="btn-prev"]', btn => btn.disabled
    )
    expect(prevDisabled).toBe(false)

    await saveScreenshot(page, 'panorama-2-navigated.png')
  })
})

describe('Panorama 3 — navigate to last', () => {
  it('shows Panorama 3, Next button becomes disabled', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
    await waitForCanvas(page)

    await page.click('[data-testid="btn-next"]')
    await new Promise(r => setTimeout(r, 1500))
    await page.click('[data-testid="btn-next"]')
    await new Promise(r => setTimeout(r, 2000))

    const label = await page.$eval(
      '[data-testid="panorama-label"]',
      el => el.textContent.trim()
    )
    expect(label).toBe('Panorama 3')

    const nextDisabled = await page.$eval(
      '[data-testid="btn-next"]', btn => btn.disabled
    )
    expect(nextDisabled).toBe(true)

    await saveScreenshot(page, 'panorama-3-final.png')
  })
})