/**
 * Badge styles, shipped as a plain CSS string (no bundler CSS pipeline
 * needed). Injected into a plugin-owned <style> tag at apply() and removed
 * when the plugin unloads. Colors ride the app's theme tokens so the badge
 * looks native in both light and dark themes.
 */
export const badgeCss = `
.fg-wrap {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 9999;
  font-family: ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif;
  pointer-events: auto;
  user-select: none;
}
.fg-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--dsw-alias-bg-overlay);
  border: 1px solid var(--dsw-alias-border-l2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 1;
}
.fg-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex: none;
}
.fg-name {
  font-weight: 700;
  letter-spacing: 0.02em;
}
.fg-time {
  color: var(--dsw-alias-label-secondary);
  font-variant-numeric: tabular-nums;
}
.fg-panel {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  width: 304px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-overlay);
  border: 1px solid var(--dsw-alias-border-l1);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
}
.fg-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
}
.fg-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 0;
  border-bottom: 1px dashed var(--dsw-alias-border-l1);
}
.fg-row:last-of-type {
  border-bottom: none;
}
.fg-row b {
  font-variant-numeric: tabular-nums;
}
.fg-note {
  margin-top: 8px;
  color: var(--dsw-alias-label-secondary);
  line-height: 1.55;
}
`
