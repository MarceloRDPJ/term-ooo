// scripts/test-games.mjs
// Valida input + cores em varios jogos para garantir que esta tudo visivel.

import puppeteer from 'puppeteer'

const games = [
  { name: 'Loldle Classic', url: 'https://marcelordpj.github.io/term-ooo/play/loldle' },
  { name: 'Loldle Quote', url: 'https://marcelordpj.github.io/term-ooo/play/loldle-quote' },
  { name: 'Narutodle Classic', url: 'https://marcelordpj.github.io/term-ooo/play/narutodle' },
  { name: 'Pitaco Atributos', url: 'https://marcelordpj.github.io/term-ooo/play/pitaco-atributos' },
]

async function main() {
  console.log('=== AUDITORIA DE JOGOS EM PRODUCAO ===\n')

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  let allPass = true

  for (const game of games) {
    console.log(`--- ${game.name} ---`)
    console.log(`URL: ${game.url}`)
    try {
      const page = await browser.newPage()
      await page.setViewport({ width: 1280, height: 800 })
      await page.goto(game.url, { waitUntil: 'networkidle0', timeout: 30000 })
      await new Promise((r) => setTimeout(r, 2000))

      // Verifica se tem input
      const input = await page.$('input[type="text"]')
      if (!input) {
        console.log('  FALHA: input nao encontrado')
        allPass = false
        await page.close()
        continue
      }

      // Testa click
      const state = await page.evaluate((el) => {
        const r = el.getBoundingClientRect()
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
      }, input)
      await page.mouse.click(state.x, state.y)
      await new Promise((r) => setTimeout(r, 300))
      const focused = await page.evaluate(() => document.activeElement?.tagName)
      const isFocused = focused === 'INPUT'
      console.log(`  Click focou: ${isFocused ? 'SIM' : 'NAO'}`)

      // Testa digitar
      await page.keyboard.type('test', { delay: 50 })
      await new Promise((r) => setTimeout(r, 300))
      const value = await page.evaluate((el) => el.value, input)
      console.log(`  Valor apos digitar: ${JSON.stringify(value)}`)

      // Verifica contraste do input
      const inputState = await page.evaluate((el) => {
        const cs = window.getComputedStyle(el)
        return {
          color: cs.color,
          fontSize: cs.fontSize,
        }
      }, input)
      console.log(`  Cor: ${inputState.color}, fontSize: ${inputState.fontSize}`)

      // Verifica se tem mode selector
      const hasModeSelector = await page.evaluate(() => {
        const pills = document.querySelectorAll('button, [role="tab"]')
        return Array.from(pills).some((b) => b.textContent && (b.textContent.toLowerCase().includes('classic') || b.textContent.toLowerCase().includes('classico')))
      })
      console.log(`  Mode selector: ${hasModeSelector ? 'SIM' : 'NAO'}`)

      if (!isFocused || value !== 'test') {
        allPass = false
      }
      await page.close()
    } catch (err) {
      console.log(`  ERRO: ${err.message}`)
      allPass = false
    }
    console.log()
  }

  await browser.close()
  console.log(allPass ? '=== TODOS OS JOGOS PASSARAM ===' : '=== ALGUNS JOGOS FALHARAM ===')
}

main()
