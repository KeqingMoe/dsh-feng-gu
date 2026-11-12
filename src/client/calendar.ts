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

export const BEIJING_OFFSET_MS = 8 * 3600 * 1000
const DAY_MS = 24 * 3600 * 1000
const DAY_SEC = 24 * 3600

/** 高峰窗口（北京时间秒偏移） */
export const PEAK_WINDOWS = [
  { start: 9 * 3600, end: 12 * 3600 },
  { start: 14 * 3600, end: 18 * 3600 },
] as const

/**
 * 日历可信起点：2026 年只从这一天起没有后续法定节假日，
 * 因此落在该时刻之前的时段起点无法确证（此前的法定节假日未收录，不猜测）。
 */
export const CALENDAR_HORIZON_MS = Date.UTC(2026, 9, 8) - BEIJING_OFFSET_MS

/** 中国法定节假日（北京时间日期，YYYY-MM-DD）。来源：国务院办公厅通知。 */
const CHINA_HOLIDAYS: Readonly<Record<number, ReadonlySet<string>>> = {
  // 2026 年法定节假日已于 2026-10-07 全部结束；向前倒计时无需历史日期。
  2026: new Set<string>(),
  // 国务院办公厅关于 2027 年部分节假日安排的通知（2026-11-05）
  2027: new Set<string>([
    // 元旦 1/1–1/3
    '2027-01-01', '2027-01-02', '2027-01-03',
    // 春节 2/5–2/13
    '2027-02-05', '2027-02-06', '2027-02-07', '2027-02-08', '2027-02-09',
    '2027-02-10', '2027-02-11', '2027-02-12', '2027-02-13',
    // 清明 4/3–4/5
    '2027-04-03', '2027-04-04', '2027-04-05',
    // 劳动节 5/1–5/5
    '2027-05-01', '2027-05-02', '2027-05-03', '2027-05-04', '2027-05-05',
    // 端午 6/9
    '2027-06-09',
    // 中秋 9/15
    '2027-09-15',
    // 国庆 10/1–10/7
    '2027-10-01', '2027-10-02', '2027-10-03', '2027-10-04', '2027-10-05',
    '2027-10-06', '2027-10-07',
  ]),
}

export interface FengGuState {
  /** True while Beijing time is inside an idle (valley) window. */
  isValley: boolean
  /** Seconds until the next peak/valley switch. */
  remainingSec: number
  /** Current Beijing time, HH:MM:SS. */
  beijing: string
  /** Whether the holiday calendar covers the years needed for this result. */
  calendarKnown: boolean
  /** Start of the current continuous peak/valley period (epoch ms). */
  periodStart: number
  /** End of the current continuous peak/valley period (epoch ms); equals the next switch. */
  periodEnd: number
  /** Elapsed share of the current period, 0-100; null when it cannot be determined. */
  periodProgress: number | null
}

const pad = (n: number): string => String(n).padStart(2, '0')

/** Format a seconds count as HH:MM:SS. */
export function formatHms(total: number): string {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return pad(h) + ':' + pad(m) + ':' + pad(s)
}

/** Beijing date key (YYYY-MM-DD) for an epoch-ms instant. */
function beijingDateKey(ms: number): string {
  const d = new Date(ms + BEIJING_OFFSET_MS)
  const y = d.getUTCFullYear()
  const mo = pad(d.getUTCMonth() + 1)
  const day = pad(d.getUTCDate())
  return y + '-' + mo + '-' + day
}

/** Beijing year for an epoch-ms instant. */
function beijingYear(ms: number): number {
  return new Date(ms + BEIJING_OFFSET_MS).getUTCFullYear()
}

function calendarKnownForYear(year: number): boolean {
  return CHINA_HOLIDAYS[year] !== undefined
}

function isHoliday(ms: number): boolean {
  const set = CHINA_HOLIDAYS[beijingYear(ms)]
  return set !== undefined && set.has(beijingDateKey(ms))
}

/** Weekend in Beijing calendar; makeup workdays on Saturday/Sunday stay weekend. */
function isWeekend(ms: number): boolean {
  const day = new Date(ms + BEIJING_OFFSET_MS).getUTCDay()
  return day === 0 || day === 6
}

/** A day is a potential peak day only when it is a weekday and not a holiday. */
function isPeakDay(ms: number): boolean {
  return !isWeekend(ms) && !isHoliday(ms)
}

/** Beijing seconds-of-day for an epoch-ms instant. */
function beijingSecondsOfDay(ms: number): number {
  const d = new Date(ms + BEIJING_OFFSET_MS)
  return d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds()
}

/** Epoch ms of Beijing midnight of the day containing `ms`. */
function beijingDayStartMs(ms: number): number {
  const shifted = ms + BEIJING_OFFSET_MS
  return Math.floor(shifted / DAY_MS) * DAY_MS - BEIJING_OFFSET_MS
}

/** Whether every year touched by [startMs, endMs] has published holiday data. */
function calendarKnownForRange(startMs: number, endMs: number): boolean {
  const from = beijingYear(startMs)
  const to = beijingYear(endMs)
  for (let year = from; year <= to; year += 1) {
    if (!calendarKnownForYear(year)) return false
  }
  return true
}

/**
 * Start of the most recent transition into a valley period.
 *
 * Valley periods start at the end of a peak window (12:00 / 18:00 on a peak day)
 * and run until the next peak window starts; they may span nights, weekends and
 * consecutive public holidays, so they are not reset at midnight.
 */
function lastValleyStartMs(now: number, secOfDay: number, dayStart: number): number {
  if (isPeakDay(now)) {
    if (secOfDay >= 18 * 3600) return dayStart + 18 * 3600 * 1000
    if (secOfDay >= 12 * 3600) return dayStart + 12 * 3600 * 1000
  }
  // Before the first peak window of today: the valley started at 18:00 of the
  // most recent peak day before today.
  for (let offset = 1; offset <= 400; offset += 1) {
    const day = dayStart - offset * DAY_MS
    if (isPeakDay(day)) return day + 18 * 3600 * 1000
  }
  return dayStart
}

/** Start of the next transition into a peak period. */
function nextPeakStartMs(now: number, secOfDay: number, dayStart: number): number {
  if (isPeakDay(now)) {
    for (const w of PEAK_WINDOWS) {
      if (secOfDay < w.start) return dayStart + w.start * 1000
    }
  }
  for (let offset = 1; offset <= 400; offset += 1) {
    const day = dayStart + offset * DAY_MS
    if (isPeakDay(day)) return day + PEAK_WINDOWS[0].start * 1000
  }
  // Defensive fallback: never return a negative/invalid boundary.
  return dayStart + 7 * DAY_MS
}

/** Compute the peak/valley state for a wall-clock instant (epoch ms). */
export function computeState(now: number): FengGuState {
  const secOfDay = beijingSecondsOfDay(now)
  const peak = PEAK_WINDOWS.find((w) => secOfDay >= w.start && secOfDay < w.end)
  const isValley = peak === undefined || !isPeakDay(now)
  const dayStart = beijingDayStartMs(now)

  let periodStart: number
  let periodEnd: number
  if (!isValley && peak !== undefined) {
    periodStart = dayStart + peak.start * 1000
    periodEnd = dayStart + peak.end * 1000
  } else {
    periodStart = lastValleyStartMs(now, secOfDay, dayStart)
    periodEnd = nextPeakStartMs(now, secOfDay, dayStart)
  }

  const remainingSec = Math.max(0, Math.ceil((periodEnd - now) / 1000))
  const known = calendarKnownForYear(beijingYear(now)) && calendarKnownForYear(beijingYear(periodEnd))
  const total = periodEnd - periodStart
  const progressKnown = total > 0
    && calendarKnownForRange(periodStart, periodEnd)
    && periodStart >= CALENDAR_HORIZON_MS
  const periodProgress = progressKnown
    ? Math.min(100, Math.max(0, ((now - periodStart) / total) * 100))
    : null

  const d = new Date(now + BEIJING_OFFSET_MS)
  return {
    isValley,
    remainingSec,
    beijing: pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + d.getUTCSeconds(),
    calendarKnown: known,
    periodStart,
    periodEnd,
    periodProgress,
  }
}
