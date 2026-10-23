/**
 * Badge styles, shipped as a plain CSS string (no bundler CSS pipeline
 * needed). Injected into a plugin-owned <style> tag at apply() and removed
 * when the plugin unloads. Colors ride the app's theme tokens so the badge
 * looks native in both light and dark themes.
 */
export const badgeCss = `
.fg-anchor {
  display: inline-flex;
  min-width: 0;
  font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
}

.fg-anchor--hero {
  font-size: var(--dsh-content-font-size-secondary, 13px);
}

.fg-pill {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  max-width: 100%;
  padding: 1px 8px;
  border: 0;
  border-radius: var(--dsw-radius-sm);
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font: inherit;
  font-variant-numeric: tabular-nums;
  line-height: inherit;
  white-space: nowrap;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}

.fg-pill--hero {
  font-weight: 500;
  color: var(--dsw-alias-label-secondary);
}

.fg-pill:hover,
.fg-pill[aria-expanded='true'] {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
}

.fg-pill:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.fg-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fg-panel {
  position: fixed;
  z-index: 1100;
  width: min(264px, calc(100vw - 24px));
  box-sizing: border-box;
  padding: 12px;
  border: 0;
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-specific-menu);
  backdrop-filter: var(--dsw-menu-backdrop-filter);
  -webkit-backdrop-filter: var(--dsw-menu-backdrop-filter);
  --dsw-elevation-stroke-color: var(--dsw-alias-border-l1);
  box-shadow: var(--dsw-elevation-prominent);
  font-size: 12px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary);
  cursor: default;
}

.fg-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fg-headline {
  color: var(--dsw-alias-label-tertiary);
}

.fg-bar {
  display: flex;
  gap: 1px;
  margin: 10px 0 12px;
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-alias-interactive-bg-hover);
}

.fg-segment {
  height: 100%;
  border-radius: 1px;
}

.fg-segment--peak {
  width: 29.17%;
  background: var(--dsw-static-blue-450);
}

.fg-rows {
  margin: 6px 0 0;
}

.fg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 2px 0;
}

.fg-row dt,
.fg-row dd {
  min-width: 0;
  margin: 0;
}

.fg-row dt {
  color: var(--dsw-alias-label-secondary);
}

.fg-row dd {
  color: var(--dsw-alias-label-primary);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.fg-status {
  font-weight: 500;
}
`
