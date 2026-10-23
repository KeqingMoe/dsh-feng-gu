# dsh-feng-gu · 梁文峰 / 梁文谷 实时播报

> DeepSeek Harness 整活插件：DeepSeek API 采用**峰谷定价**（2026-08-17 生效），
> 而 DeepSeek 老板叫**梁文峰** —— 所以高峰期就是**梁文峰**，低谷期就是**梁文谷**。
> 本插件在会话统计栏和新建会话模式选项旁显示当前状态；点击可查看切换倒计时与价格说明。

## 功能

- 🔥 **梁文峰**（高峰）：北京时间每日 **09:00–12:00、14:00–18:00**，价格翻倍，缓存命中输入最高 +1100%
- 🌙 **梁文谷**（空闲时段）：**其余时间**（含夜间、周末及节假日），价格为高峰的一半
- 会话统计栏与新建会话选项栏只显示当前的 **梁文峰** 或 **梁文谷**；点击展开详情
- 详情每秒刷新北京时间与距下次切换的 `HH:MM:SS` 倒计时，并说明峰谷时段与价格
- 判断基于 UTC+8 手动换算，与浏览器时区设置无关
- 样式走 DSH 主题 token（`--dsw-alias-*`），深色/浅色主题下都自然

## 安装

一条命令，从 GitHub 直接安装（无需克隆本仓库、无需任何额外配置）：

```sh
dsh plugin --profile web add github:KeqingMoe/dsh-feng-gu#v0.1.0
```

> `--profile web` 对应你启动 Web 界面的那个 profile；从源码运行 dsh 时命令前缀
> 是 `pnpm dsh`（如 `pnpm dsh plugin --profile web add ...`）。

安装成功后重启 Web UI，会话统计栏与新建会话的模式选项旁即出现插件（从源码运行：`pnpm dsh web`）。
卸载：

```sh
dsh plugin --profile web remove dsh-feng-gu
```

> `#v0.1.0` 是钉住的 tag，不会因后续推送而静默变化。

## 它是怎么工作的

DSH 的 Web 端支持**开箱即用的第三方客户端插件**，无需重新编译 web app：

1. 本包同时声明了 `dsh.bundle`（`cordis.patch.yml` 插入一行插件）和
   `dsh.client`（`platform: web`，浏览器半）。
2. web shell 的 modules 节点半会扫描 Loader 里所有带 `dsh.client` 声明的包，
   解析其 `exports["./client"]` 构建产物，并在 `/plugins/<id>/client.js`
   下发。
3. 浏览器侧的模块加载器把 `lib/client.js` 当作一个闭包工厂
   （`window.__ModuleLoader__.load({ id, factory })`）懒加载；`react`、
   `@deepseek-ai/cordis` 等平台模块从 shell 冻结的模块表解析，其余代码全部内联。
4. 插件在 `apply()` 里通过 `slots` 服务注册到 `conversation.composer.dock` 和
   `conversation.hero.options` 座位，分别显示在会话统计栏和新建会话模式选项旁；它通过
   `ctx.effect` 托管自己的 `<style>` 标签，卸载即清理。

## 开发

```
dsh-feng-gu/
├── cordis.patch.yml        # bundle 层：插入插件行
├── tsdown.config.ts        # 双构建：node 半 lib/index.js + 浏览器半 lib/client.js
├── src/
│   ├── index.ts            # node 半（Loader 行载体，空 apply）
│   └── client/
│       ├── index.ts        # 浏览器半：computeState / 徽章组件 / apply
│       └── badge-css.ts    # 样式（纯 CSS 字符串，跟随插件生命周期）
└── scripts/smoke.mjs       # 无浏览器冒烟测试：注册、工厂物化、时段逻辑
```

常用命令：

```sh
pnpm install
pnpm build        # 构建 lib/
pnpm test         # 冒烟测试（模拟 loader 加载 lib/client.js 并验证时段边界）
pnpm typecheck    # tsc --noEmit
```

本地改完想装到自己的 profile 里看效果：

```sh
dsh plugin --profile web add ./dsh-feng-gu
dsh web
```

改动时段规则只需动 `src/client/index.ts` 顶部的 `PEAK_WINDOWS`（高峰窗口，
单位：北京时间的秒）。

## 定价依据

DeepSeek 官方 2026-08-13 调价公告（8 月 17 日 00:00 生效）：采用峰谷定价，
**高峰时段为北京时间每日 9:00–12:00、14:00–18:00**，其余时间（含夜间、周末及
节假日）为空闲时段；空闲时段价格为高峰时段的一半，高峰价格为基准价 2 倍。
V4-Pro 缓存命中输入高峰价 0.3 元/百万 tokens，较调价前 0.025 元涨幅达 1100%。
参见[官方调价公告相关报道](https://news.qq.com/rain/a/20260813A0CUCM00)。

## License

MIT © 2026 Teru Shigure (時雨てる)
