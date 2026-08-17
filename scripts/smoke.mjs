/**
 * Smoke test for the built browser bundle. Simulates the web shell's loader:
 * stubs `window.__ModuleLoader__`, evaluates `lib/client.js`, materializes the
 * registered factory with a `require` that answers only platform modules, and
 * asserts the exported API plus the peak/valley time logic.
 */
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const code = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')

let registered = null
globalThis.window = {
  __ModuleLoader__: {
    load(entry) {
      registered = entry
    },
  },
}

const reactStub = {
  createElement: (...args) => ({ kind: 'element', args }),
  useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
  useEffect: () => {},
}

const requireStub = (id) => {
  if (id === 'react') return reactStub
  if (id === 'react/jsx-runtime') return { jsx: () => {} }
  throw new Error(`unexpected require: ${id}`)
}

// Evaluate the bundle: top-level only calls __ModuleLoader__.load(...).
new Function('require', code)(requireStub)

assert.ok(registered, 'bundle did not register with __ModuleLoader__')
assert.equal(registered.id, 'dsh-feng-gu', 'bundle id mismatch')

// Materialize the factory the way the loader's lazy CJS table does.
const api = registered.factory(requireStub)
assert.equal(typeof api.apply, 'function', 'client half must export apply')
assert.equal(typeof api.computeState, 'function', 'client half must export computeState')

// Beijing wall-clock instants: now = Beijing time minus the +8h shift.
const bj = (h, m, s) => Date.UTC(2026, 0, 1, h, m, s) - 8 * 3600 * 1000

// 08:59:59 → idle, peak opens today at 09:00 in one second.
let st = api.computeState(bj(8, 59, 59))
assert.equal(st.isValley, true, '08:59:59 must be idle')
assert.equal(st.beijing, '08:59:59')
assert.equal(st.remainingSec, 1, '08:59:59 must count down to today 09:00')

// 09:00:00 → peak window 1, ends at 12:00 (3h).
st = api.computeState(bj(9, 0, 0))
assert.equal(st.isValley, false, '09:00:00 must be peak')
assert.equal(st.remainingSec, 3 * 3600)

// 11:59:59 → still peak, one second left.
st = api.computeState(bj(11, 59, 59))
assert.equal(st.isValley, false, '11:59:59 must be peak')
assert.equal(st.remainingSec, 1)

// 12:00:00 → idle, peak window 2 opens at 14:00 (2h).
st = api.computeState(bj(12, 0, 0))
assert.equal(st.isValley, true, '12:00:00 must be idle')
assert.equal(st.remainingSec, 2 * 3600)

// 13:59:59 → idle, one second left.
st = api.computeState(bj(13, 59, 59))
assert.equal(st.isValley, true, '13:59:59 must be idle')
assert.equal(st.remainingSec, 1)

// 14:00:00 → peak window 2, ends at 18:00 (4h).
st = api.computeState(bj(14, 0, 0))
assert.equal(st.isValley, false, '14:00:00 must be peak')
assert.equal(st.remainingSec, 4 * 3600)

// 17:59:59 → still peak, one second left.
st = api.computeState(bj(17, 59, 59))
assert.equal(st.isValley, false, '17:59:59 must be peak')
assert.equal(st.remainingSec, 1)

// 18:00:00 → idle, next peak is tomorrow 09:00 (15h).
st = api.computeState(bj(18, 0, 0))
assert.equal(st.isValley, true, '18:00:00 must be idle')
assert.equal(st.remainingSec, 15 * 3600)

// 00:00:00 → idle, next peak today 09:00 (9h).
st = api.computeState(bj(0, 0, 0))
assert.equal(st.isValley, true, '00:00:00 must be idle')
assert.equal(st.remainingSec, 9 * 3600)

// 23:59:59 → idle, next peak tomorrow 09:00 (9h + 1s).
st = api.computeState(bj(23, 59, 59))
assert.equal(st.isValley, true, '23:59:59 must be idle')
assert.equal(st.remainingSec, 9 * 3600 + 1)

assert.equal(api.formatHms(3661), '01:01:01')
assert.equal(api.formatHms(8 * 3600), '08:00:00')

console.log('smoke ok: bundle registers, factory materializes, time logic correct')
