declare module 'react-dom' {
  import type { ReactNode, ReactPortal } from 'react'

  export function createPortal(children: ReactNode, container: Element | DocumentFragment, key?: string | null): ReactPortal
}

declare module '@deepseek-ai/dsh-client-ui-primitives' {
  import type { CSSProperties, RefObject } from 'react'

  export function useAnchoredPosition(options: {
    open: boolean
    anchorRef: RefObject<HTMLElement>
    panelRef: RefObject<HTMLElement>
    side: 'top' | 'bottom'
    gap: number
    margin: number
  }): CSSProperties | null

  export function useDismissOnOutsidePointer(
    anchorRef: RefObject<HTMLElement>,
    open: boolean,
    setOpen: (open: boolean) => void,
    panelRef?: RefObject<HTMLElement>,
  ): void
}
