window.__ModuleLoader__.load({
	id: "dsh-feng-gu",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region src/client/badge-css.ts
		/**
		* Badge styles, shipped as a plain CSS string (no bundler CSS pipeline
		* needed). Injected into a plugin-owned <style> tag at apply() and removed
		* when the plugin unloads. Colors ride the app's theme tokens so the badge
		* looks native in both light and dark themes.
		*/
		const badgeCss = `
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
`;
		//#endregion
		//#region src/client/index.ts
		const inject = ["slots"];
		const PLUGIN_ID = "dsh-feng-gu";
		/**
		* DeepSeek 峰谷定价（2026-08-17 生效）：高峰时段 = 北京时间每日 9:00–12:00、
		* 14:00–18:00，其余时间（含夜间、周末及节假日）为空闲时段，价格 = 高峰一半。
		*/
		const BEIJING_OFFSET_MS = 288e5;
		const DAY_SEC = 86400;
		const PEAK_WINDOWS = [{
			start: 32400,
			end: 43200
		}, {
			start: 50400,
			end: 64800
		}];
		const pad = (n) => String(n).padStart(2, "0");
		/** Format a seconds count as HH:MM:SS. */
		function formatHms(total) {
			const h = Math.floor(total / 3600);
			const m = Math.floor(total % 3600 / 60);
			const s = total % 60;
			return `${pad(h)}:${pad(m)}:${pad(s)}`;
		}
		/** Compute the peak/valley state for a wall-clock instant (epoch ms). */
		function computeState(now) {
			const d = new Date(now + BEIJING_OFFSET_MS);
			const h = d.getUTCHours();
			const m = d.getUTCMinutes();
			const s = d.getUTCSeconds();
			const secOfDay = h * 3600 + m * 60 + s;
			const peak = PEAK_WINDOWS.find((w) => secOfDay >= w.start && secOfDay < w.end);
			const isValley = peak === void 0;
			let remainingSec;
			if (peak !== void 0) remainingSec = peak.end - secOfDay;
			else if (secOfDay < PEAK_WINDOWS[0].start) remainingSec = PEAK_WINDOWS[0].start - secOfDay;
			else if (secOfDay < PEAK_WINDOWS[1].start) remainingSec = PEAK_WINDOWS[1].start - secOfDay;
			else remainingSec = DAY_SEC + PEAK_WINDOWS[0].start - secOfDay;
			return {
				isValley,
				remainingSec,
				beijing: `${pad(h)}:${pad(m)}:${pad(s)}`
			};
		}
		const MEASURE_STYLE = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		function FengGuBadge({ side, variant }) {
			const [now, setNow] = react.useState(() => Date.now());
			const [open, setOpen] = react.useState(false);
			const rootRef = react.useRef(null);
			const panelRef = react.useRef(null);
			const detailsId = react.useId();
			const position = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open,
				anchorRef: rootRef,
				panelRef,
				side,
				gap: 8,
				margin: 12
			});
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(rootRef, open, setOpen, panelRef);
			react.useEffect(() => {
				const id = window.setInterval(() => setNow(Date.now()), 1e3);
				return () => window.clearInterval(id);
			}, []);
			react.useEffect(() => {
				if (!open) return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [open]);
			const state = computeState(now);
			const name = state.isValley ? "梁文谷" : "梁文峰";
			return react.createElement("span", {
				className: `fg-anchor fg-anchor--${variant}`,
				ref: rootRef
			}, react.createElement("button", {
				className: `fg-pill fg-pill--${variant}`,
				onClick: () => setOpen((v) => !v),
				title: "点击查看峰谷详情",
				type: "button",
				"aria-expanded": open,
				"aria-haspopup": "dialog",
				"aria-controls": detailsId
			}, react.createElement("span", { className: "fg-name" }, name)), open ? (0, react_dom.createPortal)(react.createElement("div", {
				id: detailsId,
				ref: panelRef,
				className: "fg-panel",
				role: "dialog",
				"aria-label": "DeepSeek 峰谷定价详情",
				style: position ?? MEASURE_STYLE
			}, react.createElement("div", { className: "fg-header" }, react.createElement("span", { className: "fg-headline" }, "DeepSeek 峰谷定价")), react.createElement("div", {
				className: "fg-bar",
				"aria-hidden": true
			}, react.createElement("span", { className: "fg-segment fg-segment--peak" })), react.createElement("dl", { className: "fg-rows" }, react.createElement("div", { className: "fg-row" }, react.createElement("dt", null, "时段"), react.createElement("dd", { className: "fg-status" }, state.isValley ? "低谷时段" : "高峰时段")), react.createElement("div", { className: "fg-row" }, react.createElement("dt", null, "北京时间"), react.createElement("dd", null, state.beijing)), react.createElement("div", { className: "fg-row" }, react.createElement("dt", null, "距切换"), react.createElement("dd", null, formatHms(state.remainingSec))), react.createElement("div", { className: "fg-row" }, react.createElement("dt", null, "高峰时段"), react.createElement("dd", null, "09:00–12:00、14:00–18:00")))), document.body) : null);
		}
		function ComposerFengGuBadge() {
			return react.createElement(FengGuBadge, {
				side: "top",
				variant: "dock"
			});
		}
		function HeroFengGuBadge() {
			return react.createElement(FengGuBadge, {
				side: "bottom",
				variant: "hero"
			});
		}
		/** Client plugin body: owns the label's style tag and both conversation seats. */
		function apply(ctx) {
			const slots = ctx.get("slots");
			if (slots === void 0) return;
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = PLUGIN_ID;
				tag.textContent = badgeCss;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "dsh-feng-gu: styles");
			slots.inject("conversation.composer.dock", () => slots.register({
				name: "conversation.composer.dock",
				id: "feng-gu-stats",
				order: 1
			}, ComposerFengGuBadge));
			slots.inject("conversation.hero.options", () => slots.register({
				name: "conversation.hero.options",
				id: "feng-gu-hero",
				order: 1
			}, HeroFengGuBadge));
		}
		//#endregion
		exports.apply = apply;
		exports.computeState = computeState;
		exports.formatHms = formatHms;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map