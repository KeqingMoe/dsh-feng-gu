/**
 * dsh-feng-gu — browser half.
 *
 * A floating real-time badge in the `shell.overlay` seat: shows whether the
 * current Beijing time falls into DeepSeek's peak (峰) or valley (谷) API
 * pricing window — 梁文峰 (peak) or 梁文谷 (valley) — with a live countdown
 * to the next switch and, on click, the full schedule plus the meme note.
 *
 * Beijing time is computed by shifting the epoch +8h and reading UTC parts,
 * so the badge is correct regardless of the browser's timezone.
 */
import type { Context } from '@deepseek-ai/cordis'
import * as React from 'react'
import { badgeCss } from './badge-css'

export const inject = ['slots']

const PLUGIN_ID = 'dsh-feng-gu'

/**
 * DeepSeek 峰谷定价（2026-08-17 生效）：高峰时段 = 北京时间每日 9:00–12:00、
 * 14:00–18:00，其余时间（含夜间、周末及节假日）为空闲时段，价格 = 高峰一半。
 */
const BEIJING_OFFSET_MS = 8 * 3600 * 1000
const DAY_SEC = 24 * 3600
const PEAK_WINDOWS = [
  { start: 9 * 3600, end: 12 * 3600 }, // 09:00–12:00
  { start: 14 * 3600, end: 18 * 3600 }, // 14:00–18:00
] as const

export interface FengGuState {
  /** True while Beijing time is inside an idle (valley) window. */
  isValley: boolean
  /** Seconds until the next peak/valley switch. */
  remainingSec: number
  /** Current Beijing time, HH:MM:SS. */
  beijing: string
}

const pad = (n: number): string => String(n).padStart(2, '0')

/** Format a seconds count as HH:MM:SS. */
export function formatHms(total: number): string {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

/** Compute the peak/valley state for a wall-clock instant (epoch ms). */
export function computeState(now: number): FengGuState {
  const d = new Date(now + BEIJING_OFFSET_MS)
  const day = d.getDay()
  const h = d.getUTCHours()
  const m = d.getUTCMinutes()
  const s = d.getUTCSeconds()
  const secOfDay = h * 3600 + m * 60 + s

  const peak = PEAK_WINDOWS.find((w) => secOfDay >= w.start && secOfDay < w.end)
  const isWeekend = day === 0 || day === 6
  const isValley = !isWeekend && (peak === undefined) // 是工作日且在高峰时段

  let remainingSec: number
  if (peak !== undefined) {
    remainingSec = peak.end - secOfDay // 当前高峰窗口结束
  } else if (secOfDay < PEAK_WINDOWS[0].start) {
    remainingSec = PEAK_WINDOWS[0].start - secOfDay // 00:00–09:00 → 今天 9:00
  } else if (secOfDay < PEAK_WINDOWS[1].start) {
    remainingSec = PEAK_WINDOWS[1].start - secOfDay // 12:00–14:00 → 今天 14:00
  } else {
    remainingSec = DAY_SEC + PEAK_WINDOWS[0].start - secOfDay // 18:00–24:00 → 次日 9:00
  }

  return { isValley, remainingSec, beijing: `${pad(h)}:${pad(m)}:${pad(s)}` }
}

function FengGuBadge(): React.ReactElement {
  const [now, setNow] = React.useState(() => Date.now())
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const state = computeState(now)
  const name = state.isValley ? '梁文谷' : '梁文峰'
  const emoji = state.isValley ? '🌙' : '🔥'
  const accent = state.isValley
    ? 'var(--dsw-alias-state-success-primary)'
    : 'var(--dsw-alias-state-warn-primary)'

  return React.createElement('div', { className: 'fg-wrap' },
    React.createElement('div', {
      className: 'fg-badge',
      onClick: () => setOpen((v) => !v),
      title: '点击查看峰谷时段',
    },
      React.createElement('span', { className: 'fg-dot', style: { background: accent } }),
      React.createElement('span', { className: 'fg-name' }, `${emoji} ${name}`),
      React.createElement('span', { className: 'fg-time' },
        `${state.beijing} · ${formatHms(state.remainingSec)}`),
    ),
    open
      ? React.createElement('div', { className: 'fg-panel' },
          React.createElement('div', { className: 'fg-title' },
            `DeepSeek 峰谷定价 · ${state.isValley ? '梁文谷（空闲时段）' : '梁文峰（高峰时段）'}`),
          React.createElement('div', { className: 'fg-row' },
            React.createElement('span', null, '北京时间'),
            React.createElement('b', null, state.beijing)),
          React.createElement('div', { className: 'fg-row' },
            React.createElement('span', null, '距切换'),
            React.createElement('b', null, formatHms(state.remainingSec))),
        )
      : null,
  )
}

/** Minimal local face of the slots service (full types live in the app shell). */
interface SlotsService {
  inject(key: string, callback: () => unknown): () => void
  register(options: { name: string; id: string; order?: number }, component: React.ComponentType): unknown
}

/** Client plugin body: owns the badge's style tag and the overlay seat. */
export function apply(ctx: Context): void {
  const slots = ctx.get('slots') as SlotsService | undefined
  if (slots === undefined) return

  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.plugin = PLUGIN_ID
    tag.textContent = badgeCss
    document.head.appendChild(tag)
    return () => {
      tag.remove()
    }
  }, 'dsh-feng-gu: styles')

  slots.inject('shell.overlay', () => slots.register(
    { name: 'shell.overlay', id: 'feng-gu', order: 100 },
    FengGuBadge,
  ))
}
