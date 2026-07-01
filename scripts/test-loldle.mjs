// scripts/test-loldle.mjs
// Testa o Loldle como jogador real: foca no input, digita, e verifica.

import puppeteer from 'puppeteer'

const url = process.env.TEST_URL || 'http://localhost:5180/play/loldle'

async function main() {
  console.log('=== TESTE DE LOLDLE COMO JOGADOR ===\n')

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    const errors = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`)
    })

    console.log('1. Navegando para', url)
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    console.log('   OK')

    await new Promise((r) => setTimeout(r, 3000))

    console.log('\n2. Erros do console:', errors.length === 0 ? 'nenhum' : errors)

    console.log('\n3. Procurando o input')
    const input = await page.$('input[aria-label="Chutar campeao"]')
    if (!input) {
      console.log('   ERRO: input nao encontrado!')
      const bodyText = await page.evaluate(() => document.body.innerText)
      console.log('   Texto da pagina:', bodyText.slice(0, 500))
      await page.screenshot({ path: 'C:/Projetos/term-ooo/loldle-erro.png', fullPage: true })
      console.log('   Screenshot salvo em loldle-erro.png')
      await browser.close()
      return
    }
    console.log('   Input encontrado')

    console.log('\n4. Estado do input')
    const state = await page.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return {
        disabled: el.disabled,
        readOnly: el.readOnly,
        tagName: el.tagName,
        type: el.type,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        style: {
          pointerEvents: window.getComputedStyle(el).pointerEvents,
          userSelect: window.getComputedStyle(el).userSelect,
          tabIndex: el.tabIndex,
        },
      }
    }, input)
    console.log('   ', JSON.stringify(state, null, 2))

    console.log('\n5. Teste A: page.focus() direto')
    await page.focus('input[aria-label="Chutar campeao"]')
    const focused1 = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    console.log('   Focado em:', focused1)

    if (focused1 === 'Chutar campeao') {
      console.log('   SUCESSO no focus!')
      console.log('\n6. Digitando "ahri"')
      await page.keyboard.type('ahri', { delay: 100 })
      await new Promise((r) => setTimeout(r, 500))
      const value1 = await page.evaluate((el) => el.value, input)
      console.log('   Valor:', JSON.stringify(value1))
    } else {
      console.log('   FALHA no focus. Tentando Teste B...')

      console.log('\n5. Teste B: page.click() com x,y')
      const box = state.rect
      const x = box.x + box.w / 2
      const y = box.y + box.h / 2
      await page.mouse.click(x, y)
      await new Promise((r) => setTimeout(r, 500))
      const focused2 = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
      console.log('   Focado em:', focused2)

      if (focused2 === 'Chutar campeao') {
        console.log('   SUCESSO no click!')
        console.log('\n6. Digitando "ahri"')
        await page.keyboard.type('ahri', { delay: 100 })
        await new Promise((r) => setTimeout(r, 500))
        const value2 = await page.evaluate((el) => el.value, input)
        console.log('   Valor:', JSON.stringify(value2))
      } else {
        console.log('   FALHA no click tambem.')

        console.log('\n5. Teste C: page.evaluate(el => el.focus()) direto')
        await page.evaluate((el) => el.focus(), input)
        const focused3 = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
        console.log('   Focado em:', focused3)

        if (focused3 === 'Chutar campeao') {
          console.log('   SUCESSO com focus direto!')
          await page.keyboard.type('ahri', { delay: 100 })
          await new Promise((r) => setTimeout(r, 500))
          const value3 = await page.evaluate((el) => el.value, input)
          console.log('   Valor:', JSON.stringify(value3))
        } else {
          console.log('   FALHA total. Bug real.')
        }
      }
    }

    console.log('\n7. Investigando o que cobre o input')
    const overlay = await page.evaluate((el) => {
      const r = el.getBoundingClientRect()
      const cx = r.x + r.width / 2
      const cy = r.y + r.height / 2
      const stack = document.elementsFromPoint(cx, cy)
      return stack.map((node) => {
        const t = node
        return {
          tag: t.tagName,
          class: (t.className || '').slice(0, 60),
          id: t.id,
          pointerEvents: window.getComputedStyle(t).pointerEvents,
          isInput: t === el,
        }
      })
    }, input)
    console.log('   Elementos no centro do input (top-down):')
    for (const e of overlay) {
      console.log('     -', e.tag, e.class, e.pointerEvents, e.isInput ? '<-- INPUT' : '')
    }

    console.log('\n8. Screenshot')
    await page.screenshot({ path: 'C:/Projetos/term-ooo/loldle-teste.png', fullPage: true })
    console.log('   Salvo em loldle-teste.png')
  } catch (err) {
    console.error('Erro:', err.message)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main()
