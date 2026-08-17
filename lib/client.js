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
		//#region src/client/badge-css.ts
		/**
		* Badge styles, shipped as a plain CSS string (no bundler CSS pipeline
		* needed). Injected into a plugin-owned <style> tag at apply() and removed
		* when the plugin unloads. Colors ride the app's theme tokens so the badge
		* looks native in both light and dark themes.
		*/
		const badgeCss = `
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
		function FengGuBadge() {
			const [now, setNow] = react.useState(() => Date.now());
			const [open, setOpen] = react.useState(false);
			react.useEffect(() => {
				const id = window.setInterval(() => setNow(Date.now()), 1e3);
				return () => window.clearInterval(id);
			}, []);
			const state = computeState(now);
			const name = state.isValley ? "梁文谷" : "梁文峰";
			const emoji = state.isValley ? "🌙" : "🔥";
			const accent = state.isValley ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-warn-primary)";
			return react.createElement("div", { className: "fg-wrap" }, react.createElement("div", {
				className: "fg-badge",
				onClick: () => setOpen((v) => !v),
				title: "点击查看峰谷时段"
			}, react.createElement("span", {
				className: "fg-dot",
				style: { background: accent }
			}), react.createElement("span", { className: "fg-name" }, `${emoji} ${name}`), react.createElement("span", { className: "fg-time" }, `${state.beijing} · ${formatHms(state.remainingSec)}`)), open ? react.createElement("div", { className: "fg-panel" }, react.createElement("div", { className: "fg-title" }, `DeepSeek 峰谷定价 · ${state.isValley ? "梁文谷（空闲时段）" : "梁文峰（高峰时段）"}`), react.createElement("div", { className: "fg-row" }, react.createElement("span", null, "北京时间"), react.createElement("b", null, state.beijing)), react.createElement("div", { className: "fg-row" }, react.createElement("span", null, "距切换"), react.createElement("b", null, formatHms(state.remainingSec)))) : null);
		}
		/** Client plugin body: owns the badge's style tag and the overlay seat. */
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
			slots.inject("shell.overlay", () => slots.register({
				name: "shell.overlay",
				id: "feng-gu",
				order: 100
			}, FengGuBadge));
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