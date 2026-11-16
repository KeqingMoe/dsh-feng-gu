/**
 * Local anchored-panel helpers.
 *
 * Older builds of this plugin borrowed `useAnchoredPosition` and
 * `useDismissOnOutsidePointer` from `@deepseek-ai/dsh-client-ui-primitives`.
 * That package is a *frozen shell module*: its exports belong to the running
 * web build, not to this package, and DSH 0.2.2-rc.3 dropped
 * `useAnchoredPosition` (the composer badge crashed with
 * `useAnchoredPosition is not a function`). Everything below is implemented
 * with React and the DOM only, so the badge keeps working across shell
 * versions instead of tracking every primitives release.
 */
import * as React from 'react'

export interface AnchoredPanelOptions {
  /** Whether the panel is mounted. */
  open: boolean
  /** Badge element the panel hangs off. */
  anchorRef: React.RefObject<HTMLElement>
  /** Portaled panel element. */
  panelRef: React.RefObject<HTMLElement>
  /** Preferred side of the anchor; flipped when it does not fit. */
  side: 'top' | 'bottom'
  /** Distance between anchor and panel. */
  gap: number
  /** Minimum distance to the viewport edges. */
  margin: number
}

/**
 * Compute the fixed-position coordinates for a portaled panel.
 *
 * Returns `null` until the first measurement, which lets the caller render the
 * panel hidden at the origin (its size is still measurable while hidden) and
 * then place it on the next commit — no flicker at the top-left corner.
 */
export function useAnchoredPanelStyle(options: AnchoredPanelOptions): React.CSSProperties | null {
  const { open, anchorRef, panelRef, side, gap, margin } = options
  const [style, setStyle] = React.useState<React.CSSProperties | null>(null)

  React.useLayoutEffect(() => {
    if (!open) {
      setStyle(null)
      return
    }

    const place = (): void => {
      const anchor = anchorRef.current
      if (anchor === null) return
      const panel = panelRef.current
      const anchorRect = anchor.getBoundingClientRect()
      const width = panel?.offsetWidth ?? 0
      const height = panel?.offsetHeight ?? 0
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Right-align with the anchor (the badge sits in a right-aligned row),
      // then keep the panel inside the viewport.
      const left = Math.min(
        Math.max(anchorRect.right - width, margin),
        Math.max(margin, viewportWidth - margin - width),
      )

      const above = anchorRect.top - gap - height
      const below = anchorRect.bottom + gap
      let top = side === 'bottom' ? below : above
      if (top < margin) top = below
      if (top + height > viewportHeight - margin) top = Math.max(margin, above)

      setStyle((previous) => (
        previous !== null && previous.left === left && previous.top === top
          ? previous
          : { left, top }
      ))
    }

    place()
    // A second pass catches web fonts and late text metrics changing the size.
    const frame = window.requestAnimationFrame(place)
    const onViewportChange = (): void => { place() }
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  }, [open, side, gap, margin, anchorRef, panelRef])

  return style
}

/** Close the panel on a pointer press outside both the anchor and the panel. */
export function useDismissOnOutsidePointer(
  anchorRef: React.RefObject<HTMLElement>,
  open: boolean,
  setOpen: (open: boolean) => void,
  panelRef?: React.RefObject<HTMLElement>,
): void {
  React.useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (anchorRef.current?.contains(target) === true) return
      if (panelRef?.current?.contains(target) === true) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => { document.removeEventListener('pointerdown', onPointerDown, true) }
  }, [anchorRef, open, panelRef, setOpen])
}
