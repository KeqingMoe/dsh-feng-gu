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
  align-items: stretch;
  margin: 10px 0 12px;
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  corner-shape: round;
  background: var(--dsw-alias-interactive-bg-hover);
}

.fg-segment {
  display: block;
  height: 100%;
  min-width: 0;
  border-radius: 999px;
  background: var(--dsw-static-blue-450);
}

/* Unknown holiday calendar: no truthful percentage, show a neutral hatch instead. */
.fg-bar--unknown {
  background: repeating-linear-gradient(
    90deg,
    var(--dsw-alias-interactive-bg-hover) 0 4px,
    transparent 4px 8px
  );
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

.fg-progress {
  font-variant-numeric: tabular-nums;
}
`;
		//#endregion
		//#region src/client/calendar.ts
		/**
		* DeepSeek 峰谷定价日历（Asia/Shanghai / UTC+8）。
		*
		* 官方规则（2026-08-17 生效，2026-11 复核）：
		*   · 高峰：非中国法定节假日的周一至周五，北京时间 09:00–12:00、14:00–18:00；
		*   · 低谷：其余时间（夜间、周末、中国法定节假日全天）。
		*   · 周末调休上班日仍按“周末”处理，全天低谷。
		*
		* 中国法定节假日数据只收录官方已公布且会出现在“下一次切换”计算范围内的年份：
		*   · 2026 年全部法定节假日已于 2026-10-07 结束，对当前及以后的倒计时没有影响，
		*     因此不收录历史日期；2026 视为“无剩余节假日”（不猜测历史）。
		*   · 2027 年按国务院办公厅 2026-11-05 通知收录。
		*   · 其余年份标记为未知（calendarKnown=false），只按工作日规则计算，不伪造结论。
		*
		* 时段边界（时段进度条与倒计时共用）：
		*   · 一次“连续时段” = 两次状态切换之间的整段区间；
		*   · 高峰时段 = 某个高峰窗口本身；
		*   · 低谷时段 = 上一次高峰结束 → 下一次高峰开始的整段区间，
		*     该区间可以跨午夜、跨周末、跨连续法定节假日，期间不会按午夜重置。
		*/
		const BEIJING_OFFSET_MS = 288e5;
		const DAY_MS = 864e5;
		/** 高峰窗口（北京时间秒偏移） */
		const PEAK_WINDOWS = [{
			start: 32400,
			end: 43200
		}, {
			start: 50400,
			end: 64800
		}];
		/**
		* 日历可信起点：2026 年只从这一天起没有后续法定节假日，
		* 因此落在该时刻之前的时段起点无法确证（此前的法定节假日未收录，不猜测）。
		*/
		const CALENDAR_HORIZON_MS = Date.UTC(2026, 9, 8) - BEIJING_OFFSET_MS;
		/** 中国法定节假日（北京时间日期，YYYY-MM-DD）。来源：国务院办公厅通知。 */
		const CHINA_HOLIDAYS = {
			2026: /* @__PURE__ */ new Set(),
			2027: /* @__PURE__ */ new Set([
				"2027-01-01",
				"2027-01-02",
				"2027-01-03",
				"2027-02-05",
				"2027-02-06",
				"2027-02-07",
				"2027-02-08",
				"2027-02-09",
				"2027-02-10",
				"2027-02-11",
				"2027-02-12",
				"2027-02-13",
				"2027-04-03",
				"2027-04-04",
				"2027-04-05",
				"2027-05-01",
				"2027-05-02",
				"2027-05-03",
				"2027-05-04",
				"2027-05-05",
				"2027-06-09",
				"2027-09-15",
				"2027-10-01",
				"2027-10-02",
				"2027-10-03",
				"2027-10-04",
				"2027-10-05",
				"2027-10-06",
				"2027-10-07"
			])
		};
		const pad = (n) => String(n).padStart(2, "0");
		/** Format a seconds count as HH:MM:SS. */
		function formatHms(total) {
			const h = Math.floor(total / 3600);
			const m = Math.floor(total % 3600 / 60);
			const s = total % 60;
			return pad(h) + ":" + pad(m) + ":" + pad(s);
		}
		/** Beijing date key (YYYY-MM-DD) for an epoch-ms instant. */
		function beijingDateKey(ms) {
			const d = new Date(ms + BEIJING_OFFSET_MS);
			const y = d.getUTCFullYear();
			const mo = pad(d.getUTCMonth() + 1);
			const day = pad(d.getUTCDate());
			return y + "-" + mo + "-" + day;
		}
		/** Beijing year for an epoch-ms instant. */
		function beijingYear(ms) {
			return new Date(ms + BEIJING_OFFSET_MS).getUTCFullYear();
		}
		function calendarKnownForYear(year) {
			return CHINA_HOLIDAYS[year] !== void 0;
		}
		function isHoliday(ms) {
			const set = CHINA_HOLIDAYS[beijingYear(ms)];
			return set !== void 0 && set.has(beijingDateKey(ms));
		}
		/** Weekend in Beijing calendar; makeup workdays on Saturday/Sunday stay weekend. */
		function isWeekend(ms) {
			const day = new Date(ms + BEIJING_OFFSET_MS).getUTCDay();
			return day === 0 || day === 6;
		}
		/** A day is a potential peak day only when it is a weekday and not a holiday. */
		function isPeakDay(ms) {
			return !isWeekend(ms) && !isHoliday(ms);
		}
		/** Beijing seconds-of-day for an epoch-ms instant. */
		function beijingSecondsOfDay(ms) {
			const d = new Date(ms + BEIJING_OFFSET_MS);
			return d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();
		}
		/** Epoch ms of Beijing midnight of the day containing `ms`. */
		function beijingDayStartMs(ms) {
			const shifted = ms + BEIJING_OFFSET_MS;
			return Math.floor(shifted / DAY_MS) * DAY_MS - BEIJING_OFFSET_MS;
		}
		/** Whether every year touched by [startMs, endMs] has published holiday data. */
		function calendarKnownForRange(startMs, endMs) {
			const from = beijingYear(startMs);
			const to = beijingYear(endMs);
			for (let year = from; year <= to; year += 1) if (!calendarKnownForYear(year)) return false;
			return true;
		}
		/**
		* Start of the most recent transition into a valley period.
		*
		* Valley periods start at the end of a peak window (12:00 / 18:00 on a peak day)
		* and run until the next peak window starts; they may span nights, weekends and
		* consecutive public holidays, so they are not reset at midnight.
		*/
		function lastValleyStartMs(now, secOfDay, dayStart) {
			if (isPeakDay(now)) {
				if (secOfDay >= 64800) return dayStart + 648e5;
				if (secOfDay >= 43200) return dayStart + 432e5;
			}
			for (let offset = 1; offset <= 400; offset += 1) {
				const day = dayStart - offset * DAY_MS;
				if (isPeakDay(day)) return day + 648e5;
			}
			return dayStart;
		}
		/** Start of the next transition into a peak period. */
		function nextPeakStartMs(now, secOfDay, dayStart) {
			if (isPeakDay(now)) {
				for (const w of PEAK_WINDOWS) if (secOfDay < w.start) return dayStart + w.start * 1e3;
			}
			for (let offset = 1; offset <= 400; offset += 1) {
				const day = dayStart + offset * DAY_MS;
				if (isPeakDay(day)) return day + PEAK_WINDOWS[0].start * 1e3;
			}
			return dayStart + 7 * DAY_MS;
		}
		/** Compute the peak/valley state for a wall-clock instant (epoch ms). */
		function computeState(now) {
			const secOfDay = beijingSecondsOfDay(now);
			const peak = PEAK_WINDOWS.find((w) => secOfDay >= w.start && secOfDay < w.end);
			const isValley = peak === void 0 || !isPeakDay(now);
			const dayStart = beijingDayStartMs(now);
			let periodStart;
			let periodEnd;
			if (!isValley && peak !== void 0) {
				periodStart = dayStart + peak.start * 1e3;
				periodEnd = dayStart + peak.end * 1e3;
			} else {
				periodStart = lastValleyStartMs(now, secOfDay, dayStart);
				periodEnd = nextPeakStartMs(now, secOfDay, dayStart);
			}
			const remainingSec = Math.max(0, Math.ceil((periodEnd - now) / 1e3));
			const known = calendarKnownForYear(beijingYear(now)) && calendarKnownForYear(beijingYear(periodEnd));
			const total = periodEnd - periodStart;
			const periodProgress = total > 0 && calendarKnownForRange(periodStart, periodEnd) && periodStart >= CALENDAR_HORIZON_MS ? Math.min(100, Math.max(0, (now - periodStart) / total * 100)) : null;
			const d = new Date(now + BEIJING_OFFSET_MS);
			return {
				isValley,
				remainingSec,
				beijing: pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + d.getUTCSeconds(),
				calendarKnown: known,
				periodStart,
				periodEnd,
				periodProgress
			};
		}
		//#endregion
		//#region src/client/index.ts
		const inject = ["slots"];
		const PLUGIN_ID = "dsh-feng-gu";
		const MEASURE_STYLE = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/** Format an elapsed share as "98.2%". */
		function formatPercent(value) {
			return (Math.round(value * 10) / 10).toFixed(1) + "%";
		}
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
			const progress = state.periodProgress;
			const progressText = progress === null ? "未知（假期数据未收录）" : formatPercent(progress);
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
				className: progress === null ? "fg-bar fg-bar--unknown" : "fg-bar",
				role: "progressbar",
				"aria-label": "当前时段进度",
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				"aria-valuenow": progress === null ? void 0 : Math.round(progress * 10) / 10,
				"aria-valuetext": progressText
			}, react.createElement("span", {
				className: "fg-segment",
				style: { width: progress === null ? "0%" : progress.toFixed(2) + "%" }
			})), react.createElement("dl", { className: "fg-rows" }, react.createElement("div", { className: "fg-row" }, react.createElement("dt", null, "时段"), react.createElement("dd", { className: "fg-status" }, state.isValley ? "低谷时段" : "高峰时段")), react.createElement("div", { className: "fg-row" }, react.createElement("dt", null, "北京时间"), react.createElement("dd", null, state.beijing)), react.createElement("div", { className: "fg-row" }, react.createElement("dt", null, "距切换"), react.createElement("dd", null, formatHms(state.remainingSec))), react.createElement("div", { className: "fg-row" }, react.createElement("dt", null, "当前时段进度"), react.createElement("dd", { className: "fg-progress" }, progressText)), react.createElement("div", { className: "fg-row" }, react.createElement("dt", null, "高峰时段"), react.createElement("dd", null, "工作日 09:00–12:00、14:00–18:00（周末/法定节假日全天低谷）")), react.createElement("div", { className: "fg-row" }, react.createElement("dt", null, "假期日历"), react.createElement("dd", null, state.calendarKnown ? "已收录 2027 年法定节假日" : "未知年份，仅按工作日判定")))), document.body) : null);
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