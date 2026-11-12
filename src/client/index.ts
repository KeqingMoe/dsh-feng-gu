/**
 * dsh-feng-gu — browser half.
 *
 * A compact real-time label in the composer statistics row and new-session
 * options, showing whether the current Beijing time falls into DeepSeek's peak (峰) or valley (谷) API
 * pricing window — 梁文峰 (peak) or 梁文谷 (valley) — with a live countdown to the next
 * peak/valley switch that skips weekends and Chinese public holidays, plus the meme note.
 *
 * Beijing time is computed by shifting the epoch +8h and reading UTC parts,
 * so the badge is correct regardless of the browser's timezone.
 */
import type { Context } from '@deepseek-ai/cordis'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { useAnchoredPosition, useDismissOnOutsidePointer } from '@deepseek-ai/dsh-client-ui-primitives'
import { badgeCss } from './badge-css'
import { computeState, formatHms } from './calendar'
export { computeState, formatHms } from './calendar'
export type { FengGuState } from './calendar'

export const inject = ['slots']

const PLUGIN_ID = 'dsh-feng-gu'

/* 峰谷与假期日历逻辑见 ./calendar.ts（工作日、周末、法定节假日与下一次切换倒计时）。 */

type BadgePlacement = 'top' | 'bottom'
type BadgeVariant = 'dock' | 'hero'

const MEASURE_STYLE: React.CSSProperties = { visibility: 'hidden', left: 0, top: 0 }

function FengGuBadge({ side, variant }: { side: BadgePlacement; variant: BadgeVariant }): React.ReactElement {
  const [now, setNow] = React.useState(() => Date.now())
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const detailsId = React.useId()
  const position = useAnchoredPosition({
    open,
    anchorRef: rootRef,
    panelRef,
    side,
    gap: 8,
    margin: 12,
  })
  useDismissOnOutsidePointer(rootRef, open, setOpen, panelRef)

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [open])

  const state = computeState(now)
  const name = state.isValley ? '梁文谷' : '梁文峰'

  return React.createElement('span', { className: `fg-anchor fg-anchor--${variant}`, ref: rootRef },
    React.createElement('button', {
      className: `fg-pill fg-pill--${variant}`,
      onClick: () => setOpen((v) => !v),
      title: '点击查看峰谷详情',
      type: 'button',
      'aria-expanded': open,
      'aria-haspopup': 'dialog',
      'aria-controls': detailsId,
    },
      React.createElement('span', { className: 'fg-name' }, name),
    ),
    open
      ? createPortal(
          React.createElement('div', {
            id: detailsId,
            ref: panelRef,
            className: 'fg-panel',
            role: 'dialog',
            'aria-label': 'DeepSeek 峰谷定价详情',
            style: position ?? MEASURE_STYLE,
          },
            React.createElement('div', { className: 'fg-header' },
              React.createElement('span', { className: 'fg-headline' }, 'DeepSeek 峰谷定价'),
            ),
            React.createElement('div', { className: 'fg-bar', 'aria-hidden': true },
              React.createElement('span', { className: 'fg-segment fg-segment--peak' }),
            ),
            React.createElement('dl', { className: 'fg-rows' },
              React.createElement('div', { className: 'fg-row' },
                React.createElement('dt', null, '时段'),
                React.createElement('dd', { className: 'fg-status' }, state.isValley ? '低谷时段' : '高峰时段')),
              React.createElement('div', { className: 'fg-row' },
                React.createElement('dt', null, '北京时间'),
                React.createElement('dd', null, state.beijing)),
              React.createElement('div', { className: 'fg-row' },
                React.createElement('dt', null, '距切换'),
                React.createElement('dd', null, formatHms(state.remainingSec))),
              React.createElement('div', { className: 'fg-row' },
                React.createElement('dt', null, '高峰时段'),
                React.createElement('dd', null, '工作日 09:00–12:00、14:00–18:00（周末/法定节假日全天低谷）')),
              React.createElement('div', { className: 'fg-row' },
                React.createElement('dt', null, '假期日历'),
                React.createElement('dd', null, state.calendarKnown ? '已收录 2027 年法定节假日' : '未知年份，仅按工作日判定')),
            ),
          ),
          document.body,
        )
      : null,
  )
}

function ComposerFengGuBadge(): React.ReactElement {
  return React.createElement(FengGuBadge, { side: 'top', variant: 'dock' })
}

function HeroFengGuBadge(): React.ReactElement {
  return React.createElement(FengGuBadge, { side: 'bottom', variant: 'hero' })
}

/** Minimal local face of the slots service (full types live in the app shell). */
interface SlotsService {
  inject(key: string, callback: () => unknown): () => void
  register(options: { name: string; id: string; order?: number }, component: React.ComponentType): unknown
}

/** Client plugin body: owns the label's style tag and both conversation seats. */
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

  slots.inject('conversation.composer.dock', () => slots.register(
    { name: 'conversation.composer.dock', id: 'feng-gu-stats', order: 1 },
    ComposerFengGuBadge,
  ))

  slots.inject('conversation.hero.options', () => slots.register(
    { name: 'conversation.hero.options', id: 'feng-gu-hero', order: 1 },
    HeroFengGuBadge,
  ))
}
