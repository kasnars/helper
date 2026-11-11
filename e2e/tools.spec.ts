import { test, expect, type Page } from '@playwright/test'

async function fillControl(page: Page, testId: string, value: string) {
  const field = page.getByTestId(testId)
  const inner = field.locator('input, textarea')
  if (await inner.count()) await inner.first().fill(value)
  else await field.fill(value)
}

async function openTool(page: Page, path: string, storageKey: string, id: string) {
  await page.addInitScript(({ storageKey, id }) => {
    sessionStorage.setItem(storageKey, id)
  }, { storageKey, id })
  await page.goto(path)
  await expect(page.locator(`[data-active-tool="${id}"]`)).toBeVisible()
  await expect(page.locator(`[data-active-tool="${id}"] .tool-embed > *`)).toBeVisible()
}

test('command palette jumps to the pomodoro timer', async ({ page }) => {
  await page.goto('./')
  await page.locator('[data-testid="open-palette"]').click()
  const palette = page.locator('[data-testid="command-palette"]')
  await expect(palette).toBeVisible()
  const paletteInput = page.getByRole('dialog').getByRole('textbox')
  await paletteInput.fill('番茄')
  await paletteInput.press('Enter')
  await expect(page.locator('[data-active-tool="pomodoro"]')).toBeVisible()
  await expect(page.getByTestId('pomodoro-clock')).toBeVisible()
})

test('cron explains the next runs', async ({ page }) => {
  await openTool(page, 'utility', 'activeUtilityTool', 'cron')
  await fillControl(page, 'cron-input', '0 9 * * 1-5')
  await expect(page.getByText('每周一至周五')).toBeVisible()
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible()
})

test('jwt, url, diff, formatter and curl', async ({ page }) => {
  await openTool(page, 'securitytools', 'activeDevTool', 'jwt')
  await page.locator('textarea').first().fill('eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZGEifQ.sig')
  await page.getByTestId('jwt-decode').click()
  await expect(page.getByText('none', { exact: true })).toBeVisible()

  await openTool(page, 'securitytools', 'activeDevTool', 'url')
  await fillControl(page, 'url-input', 'https://example.com/search?q=1')
  await expect(page.getByText('example.com')).toBeVisible()
  await page.getByTestId('url-rebuild').click()

  await openTool(page, 'texttools', 'activeTextTool', 'filediff')
  await page.getByTestId('diff-run').click()
  await expect(page.getByText(/^修改 \d+/)).toBeVisible()

  await openTool(page, 'devtools', 'activeDevTool', 'formatter')
  await expect(page.getByText('代码格式化').first()).toBeVisible()
  await page.getByRole('button', { name: '加载示例' }).click()
  await page.getByRole('button', { name: '格式化' }).click()
  await expect(page.getByText('格式化结果')).toBeVisible()

  await openTool(page, 'devtools', 'activeDevTool', 'sql')
  await page.getByRole('button', { name: '示例' }).click()
  await page.getByRole('button', { name: '格式化' }).click()
  await expect(page.getByText(/SELECT/i).first()).toBeVisible()

  await openTool(page, 'devtools', 'activeDevTool', 'curl')
  await page.getByRole('button', { name: '示例' }).click()
  await expect(page.getByText('fetch(').first()).toBeVisible()
})

test('markdown, mock, currency, cost and backup', async ({ page }) => {
  await openTool(page, 'texttools', 'activeTextTool', 'markdown')
  await page.locator('textarea').first().fill('# 标题\n\n正文')
  await expect(page.locator('.markdown-body').getByRole('heading', { name: '标题' })).toBeVisible()

  await openTool(page, 'utility', 'activeUtilityTool', 'mock')
  await page.getByTestId('mock-generate').click()
  await expect(page.locator('pre')).toContainText('name')

  await openTool(page, 'utility', 'activeUtilityTool', 'currency')
  await expect(page.getByTestId('currency-result')).toBeVisible()

  await openTool(page, 'utility', 'activeUtilityTool', 'aicost')
  await expect(page.getByText('GPT-4o').first()).toBeVisible()

  await openTool(page, 'utility', 'activeUtilityTool', 'unit')
  await expect(page.getByText('所有换算结果')).toBeVisible()

  await openTool(page, 'utility', 'activeUtilityTool', 'backup')
  await page.getByTestId('backup-export').click()
  await expect(page.getByText('已开始下载备份文件')).toBeVisible()
})

test('design and image tools render their main controls', async ({ page }) => {
  await openTool(page, 'webtools', 'activeDevTool', 'palette')
  await page.getByTestId('palette-css').click()
  await expect(page.getByText('--brand-500')).toBeVisible()

  await openTool(page, 'webtools', 'activeDevTool', 'color')
  await page.getByRole('button', { name: '生成色阶' }).click()
  await expect(page.locator('[data-active-tool="palette"]')).toBeVisible()

  await openTool(page, 'webtools', 'activeDevTool', 'cssgen')
  await page.getByTestId('cssgen-copy').click()
  await expect(page.getByText('box-shadow:')).toBeVisible()

  await openTool(page, 'devtools', 'activeDevTool', 'svgoptimize')
  await page.getByRole('button', { name: '加载示例' }).click()
  await expect(page.locator('textarea').first()).not.toHaveValue('')

  await openTool(page, 'imagetools', 'activeImageTool', 'crop')
  await expect(page.getByText(/裁剪|上传|拖拽/).first()).toBeVisible()
  await openTool(page, 'imagetools', 'activeImageTool', 'watermark')
  await expect(page.getByText(/水印/).first()).toBeVisible()
  await openTool(page, 'imagetools', 'activeImageTool', 'exif')
  await expect(page.getByText(/EXIF|拖拽/).first()).toBeVisible()
  await openTool(page, 'imagetools', 'activeImageTool', 'stitch')
  await expect(page.getByText('纵向')).toBeVisible()
  await openTool(page, 'imagetools', 'activeImageTool', 'ocr')
  await expect(page.getByTestId('ocr-run')).toBeVisible()
  await openTool(page, 'imagetools', 'activeImageTool', 'videogif')
  await expect(page.getByText('SharedArrayBuffer')).toBeVisible()
  await openTool(page, 'imagetools', 'activeImageTool', 'favicon')
  await expect(page.getByText(/图标|Favicon|上传/).first()).toBeVisible()
})

test('life calculators produce a result', async ({ page }) => {
  await openTool(page, 'life', 'activeLifeTool', 'pomodoro')
  await page.getByTestId('pomodoro-toggle').click()
  await expect(page.getByTestId('pomodoro-toggle')).toHaveText('暂停')

  await openTool(page, 'life', 'activeLifeTool', 'expense')
  await page.getByTestId('expense-add').click()
  await expect(page.getByText('餐饮').first()).toBeVisible()

  await openTool(page, 'life', 'activeLifeTool', 'countdown')
  await fillControl(page, 'event-title', '发版')
  await page.getByTestId('event-date').fill('2026-12-31')
  await page.getByTestId('event-add').click()
  await expect(page.getByRole('heading', { name: '发版' })).toBeVisible()

  await openTool(page, 'life', 'activeLifeTool', 'tax')
  await page.getByTestId('tax-calc').click()
  await expect(page.getByText('当月应预扣')).toBeVisible()

  await openTool(page, 'life', 'activeLifeTool', 'mortgage')
  await page.getByTestId('mortgage-calc').click()
  await expect(page.getByText('首月月供')).toBeVisible()
})

test.describe('dark mode follows the class, not the system scheme', () => {
  test.use({ colorScheme: 'light' })

  test('toggle changes a dark: background', async ({ page }) => {
    await page.goto('./')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    const shell = page.locator('.min-h-screen').first()
    const before = await shell.evaluate((element) => getComputedStyle(element).backgroundColor)
    const beforeElement = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--el-bg-color').trim())
    await page.getByRole('button', { name: '切换主题' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    const after = await shell.evaluate((element) => getComputedStyle(element).backgroundColor)
    const afterElement = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--el-bg-color').trim())
    expect(after).not.toBe(before)
    expect(afterElement.toLowerCase()).not.toBe(beforeElement.toLowerCase())
  })
})

test('currency reports a live rate or an offline fallback', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('helper_currency_rates'))
  await openTool(page, 'utility', 'activeUtilityTool', 'currency')
  const source = page.getByTestId('currency-source')
  await expect(source).toBeVisible()
  await expect(source).toHaveText(/实时汇率|使用本地缓存|离线估算/)
})

test('favorite appears on the home page', async ({ page }) => {
  await openTool(page, 'life', 'activeLifeTool', 'tax')
  await page.getByRole('button', { name: '收藏' }).click()
  await page.goto('./')
  await expect(page.getByRole('button', { name: '个税计算', exact: true })).toBeVisible()
})
