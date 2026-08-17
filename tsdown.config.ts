/**
 * Standalone build for dsh-feng-gu, mirroring the DSH monorepo's
 * client-package layout: a Node ESM library (`lib/index.js`, the host-side
 * Loader row) plus a closure-factory browser bundle (`lib/client.js`) that
 * registers itself with the web shell's module loader.
 *
 * The browser bundle keeps the shell's frozen platform modules external —
 * they resolve through the loader's injected `require` (the module table),
 * never through an import map or globals. Everything else inlines.
 */
import { defineConfig } from 'tsdown'

const ID = 'dsh-feng-gu'

/** The exact platform-module list the DSH web shell freezes into its module table. */
const PLATFORM_MODULES = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
] as const

export default defineConfig([
  {
    name: ID,
    entry: ['src/index.ts'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2022',
    fixedExtension: false,
    dts: true,
    clean: false,
  },
  {
    name: `${ID}/client`,
    entry: { client: 'src/client/index.ts' },
    // Browser bundle lands next to the node half in the same lib/ dir; the
    // entryFileNames pin keeps it exactly lib/client.js.
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2022',
    dts: false,
    clean: false,
    sourcemap: true,
    external: [...PLATFORM_MODULES],
    // Anything not in the loader module table must inline: a require() the
    // table cannot answer is a guaranteed runtime throw.
    noExternal: (id: string) => (PLATFORM_MODULES.includes(id as never) ? undefined : true),
    // Inline node-idiom substitutions so inlined deps (none today, but
    // future-proof) cannot probe process/import.meta at boot.
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
    },
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])
