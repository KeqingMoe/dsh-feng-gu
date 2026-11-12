/**
 * Smoke test for the built browser bundle. Simulates the web shell's loader:
 * stubs window.__ModuleLoader__, evaluates lib/client.js, materializes the
 * registered factory with a require that answers platform modules, then runs
 * the peak/valley calendar matrix (weekdays, weekends, 2027 holidays, countdown).
 */
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const code = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')

let registered = null
globalThis.window = {
  __ModuleLoader__: {
    load(entry) { registered = entry },
  },
}

const reactStub = {
  createElement: (...args) => ({ kind: 'element', args }),
  useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
  useEffect: () => {},
  useRef: (v) => ({ current: v }),
  useId: () => 'id',
  Fragment: 'Fragment',
}

const requireStub = (id) => {
  if (id === 'react') return reactStub
  if (id === 'react/jsx-runtime') return { jsx: () => {}, jsxs: () => {}, Fragment: 'Fragment' }
  if (id === 'react-dom') return { createPortal: (node) => node }
  if (id === '@deepseek-ai/dsh-client-ui-primitives') {
    return { useAnchoredPosition: () => ({ top: 0, left: 0 }), useDismissOnOutsidePointer: () => {} }
  }
  throw new Error('unexpected require: ' + id)
}

new Function('require', code)(requireStub)
assert.ok(registered, 'bundle did not register with __ModuleLoader__')
assert.equal(registered.id, 'dsh-feng-gu', 'bundle id mismatch')
const api = registered.factory(requireStub)
assert.equal(typeof api.apply, 'function')
assert.equal(typeof api.computeState, 'function')

/** Beijing wall-clock instant: Date.UTC(...) - 8h. Month is 0-based. */
const bj = (y, mo, d, h, m, s) => Date.UTC(y, mo, d, h, m, s) - 8 * 3600 * 1000

const checks = []
function check(name, fn) {
  try { fn(); checks.push([name, true]) } catch (e) { checks.push([name, false, e.message]) }
}

// ---------- 工作日边界（2027-01-04 周一，元旦假期后首个工作日） ----------
check('工作日 08:59:59 低谷，1 秒后 09:00 高峰', () => {
  const st = api.computeState(bj(2027, 0, 4, 8, 59, 59))
  assert.equal(st.isValley, true)
  assert.equal(st.beijing, '08:59:59')
  assert.equal(st.remainingSec, 1)
})
check('工作日 09:00 高峰，剩 3 小时', () => {
  const st = api.computeState(bj(2027, 0, 4, 9, 0, 0))
  assert.equal(st.isValley, false)
  assert.equal(st.remainingSec, 3 * 3600)
})
check('工作日 11:59:59 高峰，剩 1 秒', () => {
  const st = api.computeState(bj(2027, 0, 4, 11, 59, 59))
  assert.equal(st.isValley, false)
  assert.equal(st.remainingSec, 1)
})
check('工作日 12:00 低谷，2 小时后 14:00', () => {
  const st = api.computeState(bj(2027, 0, 4, 12, 0, 0))
  assert.equal(st.isValley, true)
  assert.equal(st.remainingSec, 2 * 3600)
})
check('工作日 13:59:59 低谷，剩 1 秒', () => {
  const st = api.computeState(bj(2027, 0, 4, 13, 59, 59))
  assert.equal(st.isValley, true)
  assert.equal(st.remainingSec, 1)
})
check('工作日 14:00 高峰，剩 4 小时', () => {
  const st = api.computeState(bj(2027, 0, 4, 14, 0, 0))
  assert.equal(st.isValley, false)
  assert.equal(st.remainingSec, 4 * 3600)
})
check('工作日 17:59:59 高峰，剩 1 秒', () => {
  const st = api.computeState(bj(2027, 0, 4, 17, 59, 59))
  assert.equal(st.isValley, false)
  assert.equal(st.remainingSec, 1)
})
check('工作日 18:00 低谷，次日 09:00', () => {
  const st = api.computeState(bj(2027, 0, 4, 18, 0, 0))
  assert.equal(st.isValley, true)
  assert.equal(st.remainingSec, 15 * 3600)
})

// ---------- 周末（2027-01-09 周六 / 01-10 周日） ----------
check('周六 10:00 低谷，跳过周末到周一 09:00', () => {
  const st = api.computeState(bj(2027, 0, 9, 10, 0, 0))
  assert.equal(st.isValley, true)
  assert.equal(st.remainingSec, 47 * 3600)
})
check('周日 15:00 低谷，周一 09:00（18 小时）', () => {
  const st = api.computeState(bj(2027, 0, 10, 15, 0, 0))
  assert.equal(st.isValley, true)
  assert.equal(st.remainingSec, 18 * 3600)
})

// ---------- 法定节假日 ----------
check('元旦 2027-01-01 周五 10:00 低谷，下个高峰 01-04 周一 09:00', () => {
  const st = api.computeState(bj(2027, 0, 1, 10, 0, 0))
  assert.equal(st.isValley, true)
  assert.equal(st.remainingSec, (3 * 24 - 1) * 3600)
})
check('春节连续假期 2027-02-08 周一 10:00 低谷，跳过整段假期到 02-15 周一 09:00', () => {
  const st = api.computeState(bj(2027, 1, 8, 10, 0, 0))
  assert.equal(st.isValley, true)
  assert.equal(st.remainingSec, (7 * 24 - 1) * 3600)
})
check('国庆 2027-10-04 周一 10:00 低谷，到 10-08 周五 09:00', () => {
  const st = api.computeState(bj(2027, 9, 4, 10, 0, 0))
  assert.equal(st.isValley, true)
  assert.equal(st.remainingSec, (4 * 24 - 1) * 3600)
})
check('周末调休上班日 2027-01-31 周日 10:00 仍按周末低谷', () => {
  const st = api.computeState(bj(2027, 0, 31, 10, 0, 0))
  assert.equal(st.isValley, true)
  assert.equal(st.remainingSec, 23 * 3600)
})

// ---------- 跨月/跨年与未知年份 ----------
check('跨月：2027-01-31 周一 18:00 低谷，次日 09:00', () => {
  const st = api.computeState(bj(2027, 0, 31, 18, 0, 0))
  assert.equal(st.isValley, true)
  assert.equal(st.remainingSec, 15 * 3600)
})
check('跨年：2027-12-31 周五 18:00 低谷，2028-01-03 周一 09:00（63 小时）', () => {
  const st = api.computeState(bj(2027, 11, 31, 18, 0, 0))
  assert.equal(st.isValley, true)
  assert.equal(st.remainingSec, 63 * 3600)
  assert.equal(st.calendarKnown, false)
})
check('未知年份 2028-01-03 周一 10:00 按工作日高峰，且标记日历未知', () => {
  const st = api.computeState(bj(2028, 0, 3, 10, 0, 0))
  assert.equal(st.isValley, false)
  assert.equal(st.calendarKnown, false)
})
check('2027 年工作日结果标记日历已知', () => {
  const st = api.computeState(bj(2027, 0, 4, 10, 0, 0))
  assert.equal(st.calendarKnown, true)
})

// ---------- 当前时段进度条 ----------
// 进度条 = (now - 时段起点) / (时段终点 - 时段起点)，与倒计时共用同一边界。
const near = (a, b, eps = 0.001) => Math.abs(a - b) <= eps
check('12:00 低谷刚开始，进度约 0%', () => {
  const st = api.computeState(bj(2027, 0, 4, 12, 0, 0))
  assert.equal(st.isValley, true)
  assert.ok(st.periodProgress !== null)
  assert.ok(near(st.periodProgress, 0, 0.001), 'got ' + st.periodProgress)
})
check('13:00 低谷进行一半，进度约 50%', () => {
  const st = api.computeState(bj(2027, 0, 4, 13, 0, 0))
  assert.equal(st.isValley, true)
  assert.ok(near(st.periodProgress, 50, 0.001), 'got ' + st.periodProgress)
})
check('13:57:50 低谷进度约 98.2%', () => {
  const st = api.computeState(bj(2027, 0, 4, 13, 57, 50))
  assert.equal(st.isValley, true)
  assert.ok(near(st.periodProgress, 98.19, 0.02), 'got ' + st.periodProgress)
})
check('14:00 进入高峰，新时段进度约 0%', () => {
  const st = api.computeState(bj(2027, 0, 4, 14, 0, 0))
  assert.equal(st.isValley, false)
  assert.ok(near(st.periodProgress, 0, 0.001), 'got ' + st.periodProgress)
})
check('16:00 高峰进行一半，进度约 50%', () => {
  const st = api.computeState(bj(2027, 0, 4, 16, 0, 0))
  assert.equal(st.isValley, false)
  assert.ok(near(st.periodProgress, 50, 0.001), 'got ' + st.periodProgress)
})
check('18:00 进入低谷，新时段进度约 0%', () => {
  const st = api.computeState(bj(2027, 0, 4, 18, 0, 0))
  assert.equal(st.isValley, true)
  assert.ok(near(st.periodProgress, 0, 0.001), 'got ' + st.periodProgress)
})
check('上午高峰 10:00 进度约 33.3%', () => {
  const st = api.computeState(bj(2027, 0, 4, 10, 0, 0))
  assert.equal(st.isValley, false)
  assert.ok(near(st.periodProgress, 100 / 3, 0.01), 'got ' + st.periodProgress)
})
check('进度始终夹在 0%~100%', () => {
  for (const [h, m] of [[0, 0], [3, 30], [8, 59], [12, 30], [17, 59], [23, 59]]) {
    const st = api.computeState(bj(2027, 0, 4, h, m, 0))
    if (st.periodProgress === null) continue
    assert.ok(st.periodProgress >= 0 && st.periodProgress <= 100, 'got ' + st.periodProgress)
  }
})
check('时段边界与倒计时一致：periodEnd - now = remainingSec', () => {
  for (const [h, m, s] of [[9, 0, 0], [11, 59, 59], [12, 0, 0], [13, 30, 0], [14, 0, 0], [17, 59, 59], [18, 0, 0], [23, 0, 0]]) {
    const now = bj(2027, 0, 4, h, m, s)
    const st = api.computeState(now)
    assert.equal(Math.round((st.periodEnd - now) / 1000), st.remainingSec)
  }
})
check('周末连续低谷：周六 10:00 起点为周五 18:00，不按午夜归零', () => {
  const now = bj(2027, 0, 9, 10, 0, 0)
  const st = api.computeState(now)
  assert.equal(st.isValley, true)
  assert.equal(st.periodStart, bj(2027, 0, 8, 18, 0, 0))
  assert.equal(st.periodEnd, bj(2027, 0, 11, 9, 0, 0))
  assert.ok(near(st.periodProgress, (16 / 63) * 100, 0.01), 'got ' + st.periodProgress)
})
check('周末连续低谷：周日 15:00 进度不按午夜重置', () => {
  const now = bj(2027, 0, 10, 15, 0, 0)
  const st = api.computeState(now)
  assert.equal(st.isValley, true)
  assert.equal(st.periodStart, bj(2027, 0, 8, 18, 0, 0))
  assert.ok(near(st.periodProgress, (45 / 63) * 100, 0.01), 'got ' + st.periodProgress)
})
check('连续法定节假日：2027-02-08 低谷起点为节前 02-04 18:00', () => {
  const now = bj(2027, 1, 8, 10, 0, 0)
  const st = api.computeState(now)
  assert.equal(st.isValley, true)
  assert.equal(st.periodStart, bj(2027, 1, 4, 18, 0, 0))
  assert.equal(st.periodEnd, bj(2027, 1, 15, 9, 0, 0))
})
check('节假日不误算成高峰：国庆期间进度照常推进', () => {
  const st = api.computeState(bj(2027, 9, 4, 10, 0, 0))
  assert.equal(st.isValley, true)
  assert.ok(st.periodProgress !== null)
  assert.ok(st.periodProgress > 0 && st.periodProgress < 100, 'got ' + st.periodProgress)
})
check('未知年份不伪造精确进度：periodProgress 为 null', () => {
  const st = api.computeState(bj(2028, 0, 3, 10, 0, 0))
  assert.equal(st.calendarKnown, false)
  assert.equal(st.periodProgress, null)
})
check('跨年低谷（2027→2028）进度不可知', () => {
  const st = api.computeState(bj(2027, 11, 31, 18, 0, 0))
  assert.equal(st.calendarKnown, false)
  assert.equal(st.periodProgress, null)
})
check('进度条百分比文本格式', () => {
  assert.equal(typeof st0(), 'number')
  function st0() { return api.computeState(bj(2027, 0, 4, 13, 57, 50)).periodProgress }
})

// ---------- 格式 ----------
check('formatHms', () => {
  assert.equal(api.formatHms(3661), '01:01:01')
  assert.equal(api.formatHms(8 * 3600), '08:00:00')
  assert.equal(api.formatHms(0), '00:00:00')
})

const failed = checks.filter(([, ok]) => !ok)
for (const [name, ok, err] of checks) console.log((ok ? 'PASS ' : 'FAIL ') + name + (err ? '  <- ' + err : ''))
console.log('\n' + (checks.length - failed.length) + '/' + checks.length + ' checks passed')
if (failed.length > 0) process.exit(1)
