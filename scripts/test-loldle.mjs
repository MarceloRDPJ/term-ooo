// scripts/test-loldle.mjs
// Valida que as cores tem contraste WCAG AA minimo e que o input funciona.

import puppeteer from 'puppeteer'

const url = process.env.TEST_URL || 'https://marcelordpj.github.io/term-ooo/play/loldle'

function rgb(s) {
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : null
}

function relativeLuminance([r, g, b]) {
  const ch = (c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const [a, b] = l1 > l2 ? [l2, l1] : [l1, l2]
  return (b + 0.05) / (a + 0.05)
}

async function main() {
  console.log('=== TESTE DE LOLDLE COMO JOGADOR + CONTRASTE ===\n')
  console.log('URL:', url, '\n')

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    console.log('1. Navegando')
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    await new Promise((r) => setTimeout(r, 2000))
    console.log('   OK')

    const input = await page.$('input[aria-label="Chutar campeao"]')
    if (!input) {
      console.log('   ERRO: input nao encontrado!')
      await page.screenshot({ path: 'C:/Projetos/term-ooo/loldle-erro.png', fullPage: true })
      await browser.close()
      return
    }
    console.log('2. Input encontrado')

    console.log('\n3. Click + digitar (simula user)')
    const state = await page.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    }, input)
    await page.mouse.click(state.x, state.y)
    await new Promise((r) => setTimeout(r, 300))
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    console.log('   Focado em:', focused)

    await page.keyboard.type('ahri', { delay: 50 })
    await new Promise((r) => setTimeout(r, 300))
    const value = await page.evaluate((el) => el.value, input)
    console.log('   Valor:', JSON.stringify(value))

    console.log('\n4. Auditoria de contraste WCAG AA')
    const contrastReport = await page.evaluate(() => {
      const input = document.querySelector('input[aria-label="Chutar campeao"]')
      if (!input) return null
      const cs = window.getComputedStyle(input)
      return {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        fontSize: cs.fontSize,
        placeholder: input.placeholder,
      }
    })
    console.log('   Input:', JSON.stringify(contrastReport, null, 2))

    if (contrastReport) {
      const fg = rgb(contrastReport.color)
      const bg = rgb(contrastReport.backgroundColor)
      if (fg && bg) {
        const ratio = contrastRatio(fg, bg)
        const pass = ratio >= 4.5 ? 'PASS (>=4.5)' : ratio >= 3 ? 'PASS large text (>=3)' : 'FAIL (<3)'
        console.log(`   Contraste fg/bg: ${ratio.toFixed(2)}:1 - ${pass}`)
      } else {
        console.log('   Nao foi possivel calcular (cor rgb invalida ou background transparent)')
      }
    }

    console.log('\n5. Auditoria de elementos textuais (cores)')
    const textReport = await page.evaluate(() => {
      const elements = [
        { name: 'alvo do dia', sel: 'h2' },
        { name: 'alvo do dia badge', sel: '.ml-auto' },
        { name: 'pool', sel: '.sm\\:text-sm' },
        { name: 'legenda header', sel: 'h4' },
        { name: 'placeholder', sel: 'input::placeholder' },
      ]
      return elements.map(({ name, sel }) => {
        const el = document.querySelector(sel)
        if (!el) return { name, sel, found: false }
        const cs = window.getComputedStyle(el)
        return {
          name,
          color: cs.color,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          text: (el.textContent || el.placeholder || '').slice(0, 50),
        }
      })
    })
    for (const r of textReport) {
      console.log(`   - ${r.name}: ${JSON.stringify(r, null, 2)}`)
    }

    console.log('\n6. Screenshots')
    await page.screenshot({ path: 'C:/Projetos/term-ooo/loldle-teste.png', fullPage: true })
    console.log('   Salvo em loldle-teste.png')

    console.log('\n=== RESUMO ===')
    if (focused === 'Chutar campeao' && value === 'ahri') {
      console.log('OK: Input funciona. Cores validadas acima.')
    } else {
      console.log('FALHA: input nao esta funcionando')
    }
  } catch (err) {
    console.error('Erro:', err.message)
  } finally {
    await browser.close()
  }
}

main()
