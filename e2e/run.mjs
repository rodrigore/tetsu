// Renders the main screen on common devices, in every layout, both languages and both text sizes, and checks it.
// Run with `npm run test:e2e` (builds first). Screenshots go to e2e/out for a quick look.
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const PORT = Number(process.env.PORT ?? 4310)
const BASE = `http://localhost:${PORT}/tetsu/`
const OUT = new URL('./out/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })

const DEVICES = [
  { name: 'iphone-se', w: 375, h: 667 },
  { name: 'iphone-13-mini', w: 375, h: 812 },
  { name: 'iphone-15', w: 393, h: 852 },
  { name: 'iphone-17-pro-max', w: 440, h: 956 },
  { name: 'android-small', w: 360, h: 640 },
  { name: 'android-360x800', w: 360, h: 800 },
  { name: 'tiny-320', w: 320, h: 568 },
  { name: 'ipad', w: 768, h: 1024 },
  { name: 'phone-landscape', w: 844, h: 390 },
  { name: 'phone-landscape-se', w: 667, h: 375 },
]
const CUSTOM = { order: ['pct', 'hero', 'bar', 'head', 'pr', 'chips', 'stats'], hidden: ['stats'], size: 'huge' }
const LAYOUTS = ['simple', 'complete', 'onehand', 'custom']
const LANGS = ['es', 'en']
const TEXT = ['normal', 'large']

const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' })
const stop = () => preview.kill()
process.on('exit', stop)
for (let i = 0; i < 40; i++) {
  try {
    if ((await fetch(BASE)).ok) break
  } catch {
    await new Promise((r) => setTimeout(r, 250))
  }
}

const browser = await chromium.launch()
const failures = []
const fail = (id, msg) => failures.push(`${id}: ${msg}`)
let screens = 0

for (const d of DEVICES) {
  const landscape = d.w > d.h && d.h <= 500
  for (const layout of LAYOUTS) {
    for (const lang of LANGS) {
      for (const tsize of TEXT) {
        screens++
        const id = `${d.name} · ${layout} · ${lang} · ${tsize}`
        const ctx = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: 2, hasTouch: true, isMobile: d.w < 700 })
        const page = await ctx.newPage()
        const errors = []
        page.on('pageerror', (e) => errors.push(e.message))
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
        await page.addInitScript(
          ([layoutId, language, size, custom]) => {
            localStorage.setItem(
              'tetsu:v1',
              JSON.stringify({ guideDone: true, steps: { hidden: true }, lang: language, tsize: size, layout: { id: layoutId, custom } }),
            )
          },
          [layout, lang, tsize, CUSTOM],
        )
        await page.goto(BASE)
        await page.waitForSelector('main.screen')
        await page.waitForTimeout(250)

        const r = await page.evaluate((isLandscape) => {
          const vw = window.innerWidth
          const screen = document.querySelector('main.screen')
          const dock = document.querySelector('.dock')
          const out = { overflowX: [], dock: null, clippedHero: false, lastBottom: 0, dockTop: 0, smallDock: [], gear: false }
          out.pageOverflow = document.documentElement.scrollWidth > vw + 1
          // Allowed to bleed on purpose: the bar drawing and anything inside a sideways scroller (lift tabs, plate list).
          const scrolls = (el) => {
            for (let n = el.parentElement; n && n !== screen; n = n.parentElement) {
              const o = getComputedStyle(n).overflowX
              if (o === 'auto' || o === 'scroll' || o === 'hidden') return true
            }
            return false
          }
          const skip = (el) => el.closest('.o-bar, .o-lifts, svg') || scrolls(el)
          for (const el of screen.querySelectorAll('button, input, label, span, div')) {
            if (skip(el) || !el.offsetParent) continue
            const b = el.getBoundingClientRect()
            if (b.width === 0 || b.height === 0) continue
            if (b.right > vw + 1 || b.left < -1) out.overflowX.push((el.className || el.tagName) + ` ${Math.round(b.left)}..${Math.round(b.right)}`)
          }
          const dockShown = !!dock && getComputedStyle(dock).display !== 'none'
          out.dockShown = dockShown
          if (dockShown) {
            const b = dock.getBoundingClientRect()
            out.dock = { bottom: b.bottom, h: b.height }
            for (const el of dock.querySelectorAll('button')) {
              const r2 = el.getBoundingClientRect()
              if (r2.height < 44 || r2.left < 0 || r2.right > vw + 1) out.smallDock.push(`${el.textContent.trim()} ${Math.round(r2.width)}x${Math.round(r2.height)}`)
            }
          }
          // Controls must not sit on top of each other.
          const ctl = [...screen.querySelectorAll('button, input')].filter((el) => el.offsetParent && !skip(el))
          out.overlaps = []
          for (let i = 0; i < ctl.length; i++) {
            for (let j = i + 1; j < ctl.length; j++) {
              if (ctl[i].contains(ctl[j]) || ctl[j].contains(ctl[i])) continue
              const a = ctl[i].getBoundingClientRect()
              const c = ctl[j].getBoundingClientRect()
              const w = Math.min(a.right, c.right) - Math.max(a.left, c.left)
              const h = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top)
              if (w > 2 && h > 2) out.overlaps.push(`${(ctl[i].textContent || ctl[i].id || ctl[i].className).trim().slice(0, 14)} / ${(ctl[j].textContent || ctl[j].id || ctl[j].className).trim().slice(0, 14)}`)
            }
          }
          const hero = screen.querySelector('.o-hero .line')
          if (hero && hero.scrollWidth > hero.clientWidth + 1 && !isLandscape) out.clippedHero = true
          const gear = document.querySelector('.gear')
          out.gear = !!gear && getComputedStyle(gear).display !== 'none'
          // Bottom of the scrollable content against the top of the dock.
          screen.scrollTop = screen.scrollHeight
          const kids = [...screen.children].filter((c) => c.offsetParent !== null && getComputedStyle(c).display !== 'contents')
          out.lastBottom = Math.max(...kids.map((c) => c.getBoundingClientRect().bottom))
          out.dockTop = dockShown ? dock.getBoundingClientRect().top : window.innerHeight
          screen.scrollTop = 0
          const has = {}
          for (const s of ['.o-hero', '.o-bar', '.o-pct', '.o-pr', '.o-chips', '.o-stats', '.o-header']) has[s] = !!screen.querySelector(s)
          out.has = has
          return out
        }, landscape)

        if (r.pageOverflow) fail(id, 'the page scrolls sideways')
        if (r.overflowX.length) fail(id, `content outside the screen: ${[...new Set(r.overflowX)].slice(0, 4).join('; ')}`)
        if (r.overlaps.length) fail(id, `controls overlap: ${[...new Set(r.overlaps)].slice(0, 3).join('; ')}`)
        if (r.clippedHero) fail(id, 'the big number is wider than its box')
        if (landscape) {
          if (r.dockShown) fail(id, 'the dock should be hidden on a phone on its side')
          if (!r.gear) fail(id, 'settings button missing on a phone on its side')
        } else if (!r.dockShown) {
          fail(id, 'the dock is missing')
        } else {
          if (r.dock.bottom > d.h + 1) fail(id, 'the dock goes below the screen')
          if (r.smallDock.length) fail(id, `dock buttons too small or off screen: ${r.smallDock.join('; ')}`)
          if (r.lastBottom > r.dockTop + 1) fail(id, `content hidden behind the dock (${Math.round(r.lastBottom)} > ${Math.round(r.dockTop)})`)
          if (r.dock.h > d.h * 0.3) fail(id, `the dock takes ${Math.round((r.dock.h / d.h) * 100)}% of the screen`)
        }
        const has = r.has
        if (!has['.o-hero'] || !has['.o-bar']) fail(id, 'result or bar missing')
        if (!landscape && layout === 'simple' && (has['.o-pr'] || has['.o-chips'] || has['.o-stats'])) fail(id, 'simple should hide PR, plate list and stats')
        if (!landscape && layout === 'complete' && !(has['.o-pr'] && has['.o-chips'] && has['.o-stats'] && has['.o-pct'])) fail(id, 'complete should show every block')
        if (errors.length) fail(id, `console errors: ${errors.slice(0, 2).join(' | ')}`)

        if (lang === 'es' && tsize === 'large') await page.screenshot({ path: `${OUT}${d.name}-${layout}.png` })
        await ctx.close()
      }
    }
  }
}

await browser.close()
stop()
console.log(`${screens} screens checked`)
if (failures.length) {
  console.error(`\n${failures.length} problems:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('All good.')
