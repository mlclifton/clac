/**
 * Epic 1 — Project Scaffold: Definition-of-Done verification
 *
 * Run:  npx vitest run tests/scaffold/epic1.test.js
 *
 * All tests are expected to be RED before Epic 1 is implemented.
 * See docs/implementation/Epic_1_DoD.md for the full specification.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync, spawn } from 'node:child_process'

const ROOT = process.cwd()
const at = (...parts) => join(ROOT, ...parts)
const exists = (...parts) => existsSync(at(...parts))
const read = (...parts) => readFileSync(at(...parts), 'utf-8')

// ─── Story 1.1 — Vite project initialised ─────────────────────────────────

describe('1.1 Vite project initialised', () => {
  it('package.json exists at project root', () => {
    expect(exists('package.json')).toBe(true)
  })

  it('scripts.dev is "vite"', () => {
    const pkg = JSON.parse(read('package.json'))
    expect(pkg.scripts?.dev).toBe('vite')
  })

  it('scripts.build is "vite build"', () => {
    const pkg = JSON.parse(read('package.json'))
    expect(pkg.scripts?.build).toBe('vite build')
  })

  it('scripts.preview is "vite preview"', () => {
    const pkg = JSON.parse(read('package.json'))
    expect(pkg.scripts?.preview).toBe('vite preview')
  })

  it('"vite" is listed in devDependencies', () => {
    const pkg = JSON.parse(read('package.json'))
    expect(pkg.devDependencies ?? {}).toHaveProperty('vite')
  })
})

// ─── Story 1.2 — src/ directory tree ──────────────────────────────────────

const SRC_SUBDIRS = ['editor', 'parser', 'graph', 'layout', 'renderer', 'ui']

describe('1.2 src/ directory tree', () => {
  it.each(SRC_SUBDIRS)('src/%s/ directory exists', (subdir) => {
    expect(exists('src', subdir)).toBe(true)
  })

  it.each(SRC_SUBDIRS)('src/%s/index.js placeholder exists', (subdir) => {
    expect(exists('src', subdir, 'index.js')).toBe(true)
  })
})

// ─── Story 1.3 — npm dependencies installed and pinned ────────────────────

const RUNTIME_DEPS = [
  'js-yaml',
  'd3-force',
  'd3-selection',
  'd3-zoom',
  'd3-drag',
  '@codemirror/view',
  '@codemirror/state',
  '@codemirror/language',
  '@codemirror/commands',
  '@codemirror/theme-one-dark',
]

const DEV_DEPS = ['vite', 'vite-plugin-pwa', 'vitest']

describe('1.3 npm dependencies declared and installed', () => {
  it.each(RUNTIME_DEPS)('"%s" is in dependencies', (dep) => {
    const pkg = JSON.parse(read('package.json'))
    expect(pkg.dependencies ?? {}).toHaveProperty(dep)
  })

  it.each(DEV_DEPS)('"%s" is in devDependencies', (dep) => {
    const pkg = JSON.parse(read('package.json'))
    expect(pkg.devDependencies ?? {}).toHaveProperty(dep)
  })

  it('node_modules/ directory exists (npm install has been run)', () => {
    expect(exists('node_modules')).toBe(true)
  })

  it('node_modules/js-yaml is installed', () => {
    expect(exists('node_modules', 'js-yaml')).toBe(true)
  })

  it('node_modules/d3-force is installed', () => {
    expect(exists('node_modules', 'd3-force')).toBe(true)
  })

  it('node_modules/vite-plugin-pwa is installed', () => {
    expect(exists('node_modules', 'vite-plugin-pwa')).toBe(true)
  })

  it('package-lock.json exists (dependencies are pinned)', () => {
    expect(exists('package-lock.json')).toBe(true)
  })
})

// ─── Story 1.4 — vite.config.js PWA configuration ─────────────────────────

describe('1.4 vite.config.js PWA configuration', () => {
  it('vite.config.js exists', () => {
    expect(exists('vite.config.js')).toBe(true)
  })

  it('imports from vite-plugin-pwa', () => {
    expect(read('vite.config.js')).toContain('vite-plugin-pwa')
  })

  it('references VitePWA', () => {
    expect(read('vite.config.js')).toContain('VitePWA')
  })

  it('sets registerType', () => {
    expect(read('vite.config.js')).toContain('registerType')
  })

  it('registerType is set to autoUpdate', () => {
    expect(read('vite.config.js')).toContain('autoUpdate')
  })

  it('configures workbox globPatterns', () => {
    expect(read('vite.config.js')).toContain('globPatterns')
  })

  it('globPatterns covers .js assets', () => {
    const src = read('vite.config.js')
    // The glob pattern string should contain .js (typically *.{js,...} or **/*.js)
    const globSection = src.slice(src.indexOf('globPatterns'))
    expect(globSection).toMatch(/\.js/)
  })

  it('globPatterns covers .css assets', () => {
    const src = read('vite.config.js')
    const globSection = src.slice(src.indexOf('globPatterns'))
    expect(globSection).toMatch(/\.css/)
  })

  it('globPatterns covers .html assets', () => {
    const src = read('vite.config.js')
    const globSection = src.slice(src.indexOf('globPatterns'))
    expect(globSection).toMatch(/\.html/)
  })
})

// ─── Story 1.5 — index.html shell structure ───────────────────────────────

describe('1.5 index.html shell structure', () => {
  it('index.html exists', () => {
    expect(exists('index.html')).toBe(true)
  })

  it('contains a <header> element', () => {
    expect(read('index.html')).toContain('<header')
  })

  it('contains a <main> element', () => {
    expect(read('index.html')).toContain('<main')
  })

  it('<main> has id="app"', () => {
    expect(read('index.html')).toContain('id="app"')
  })

  it('loads main.js as a type="module" script', () => {
    const html = read('index.html')
    expect(html).toContain('type="module"')
    expect(html).toContain('src/main.js')
  })
})

// ─── Story 1.6 — src/style.css theming tokens ─────────────────────────────

describe('1.6 src/style.css theming tokens', () => {
  it('src/style.css exists', () => {
    expect(exists('src', 'style.css')).toBe(true)
  })

  it(':root block is present', () => {
    expect(read('src', 'style.css')).toContain(':root')
  })

  it('at least one CSS custom property is declared on :root', () => {
    expect(read('src', 'style.css')).toMatch(/--[a-z][\w-]*\s*:/)
  })

  it('[data-theme="dark"] override block is present', () => {
    expect(read('src', 'style.css')).toContain('[data-theme="dark"]')
  })

  it('[data-theme="high-contrast"] override block is present', () => {
    expect(read('src', 'style.css')).toContain('[data-theme="high-contrast"]')
  })
})

// ─── Story 1.7 — src/main.js mounts app shell ─────────────────────────────

describe('1.7 src/main.js entry point', () => {
  it('src/main.js exists', () => {
    expect(exists('src', 'main.js')).toBe(true)
  })

  it('src/main.js imports from the ui module', () => {
    const src = read('src', 'main.js')
    expect(src).toMatch(/['"](\.\/)?ui\/|['"](\.\/)?.*app\.js['"]/)
  })
})

// ─── Story 1.7 (cont.) — dev server HTTP check ────────────────────────────
// Slow: spawns npm run dev and polls for HTTP 200.

describe('1.7 dev server responds correctly', { timeout: 30_000 }, () => {
  let serverProcess = null

  beforeAll(async () => {
    serverProcess = spawn('npm', ['run', 'dev', '--', '--port', '5173', '--strictPort'], {
      cwd: ROOT,
      stdio: 'pipe',
    })

    let stderrOutput = ''
    serverProcess.stderr.on('data', (chunk) => { stderrOutput += chunk.toString() })
    serverProcess.stdout.on('data', (chunk) => { stderrOutput += chunk.toString() })

    await new Promise((resolve, reject) => {
      const deadline = setTimeout(
        () => reject(new Error(`Dev server did not become ready within 15 s.\nOutput:\n${stderrOutput}`)),
        15_000,
      )

      serverProcess.on('close', (code) => {
        clearTimeout(deadline)
        reject(new Error(`Dev server process exited prematurely (code ${code}).\nOutput:\n${stderrOutput}`))
      })

      const poll = async () => {
        try {
          const res = await fetch('http://localhost:5173/')
          if (res.ok) { clearTimeout(deadline); resolve() }
          else setTimeout(poll, 300)
        } catch {
          setTimeout(poll, 300)
        }
      }
      poll()
    })
  })

  afterAll(() => {
    serverProcess?.kill('SIGTERM')
  })

  it('GET http://localhost:5173/ returns HTTP 200', async () => {
    const res = await fetch('http://localhost:5173/')
    expect(res.status).toBe(200)
  })

  it('response body contains id="app"', async () => {
    const res = await fetch('http://localhost:5173/')
    const body = await res.text()
    expect(body).toContain('id="app"')
  })
})

// ─── Story 1.8 — Production build succeeds ────────────────────────────────
// Slow: runs npm run build synchronously then inspects dist/.

describe('1.8 production build', { timeout: 60_000 }, () => {
  let buildResult = null

  beforeAll(() => {
    buildResult = spawnSync('npm', ['run', 'build'], {
      cwd: ROOT,
      encoding: 'utf-8',
    })
    if (buildResult.status !== 0) {
      throw new Error(
        `npm run build failed (exit ${buildResult.status}):\n` +
        `STDOUT:\n${buildResult.stdout}\n` +
        `STDERR:\n${buildResult.stderr}`,
      )
    }
  })

  it('npm run build exits with code 0', () => {
    expect(buildResult.status).toBe(0)
  })

  it('dist/ directory exists after build', () => {
    expect(exists('dist')).toBe(true)
  })

  it('dist/index.html exists', () => {
    expect(exists('dist', 'index.html')).toBe(true)
  })

  it('dist/assets/ directory exists', () => {
    expect(exists('dist', 'assets')).toBe(true)
  })

  it('dist/assets/ contains at least one .js file', () => {
    const files = readdirSync(at('dist', 'assets'))
    expect(files.some((f) => f.endsWith('.js'))).toBe(true)
  })

  it('dist/assets/ contains at least one .css file', () => {
    const files = readdirSync(at('dist', 'assets'))
    expect(files.some((f) => f.endsWith('.css'))).toBe(true)
  })
})

// ─── Story 1.8 (cont.) — preview server HTTP check ────────────────────────

describe('1.8 preview server responds correctly', { timeout: 30_000 }, () => {
  let previewProcess = null

  beforeAll(async () => {
    // Build must have succeeded for preview to make sense
    if (!exists('dist', 'index.html')) {
      throw new Error('dist/index.html not found — run the build first (Story 1.8 build tests)')
    }

    previewProcess = spawn('npm', ['run', 'preview', '--', '--port', '4173', '--strictPort'], {
      cwd: ROOT,
      stdio: 'pipe',
    })

    let output = ''
    previewProcess.stderr.on('data', (chunk) => { output += chunk.toString() })
    previewProcess.stdout.on('data', (chunk) => { output += chunk.toString() })

    await new Promise((resolve, reject) => {
      const deadline = setTimeout(
        () => reject(new Error(`Preview server did not become ready within 10 s.\nOutput:\n${output}`)),
        10_000,
      )

      previewProcess.on('close', (code) => {
        clearTimeout(deadline)
        reject(new Error(`Preview server exited prematurely (code ${code}).\nOutput:\n${output}`))
      })

      const poll = async () => {
        try {
          const res = await fetch('http://localhost:4173/')
          if (res.ok) { clearTimeout(deadline); resolve() }
          else setTimeout(poll, 300)
        } catch {
          setTimeout(poll, 300)
        }
      }
      poll()
    })
  })

  afterAll(() => {
    previewProcess?.kill('SIGTERM')
  })

  it('GET http://localhost:4173/ returns HTTP 200', async () => {
    const res = await fetch('http://localhost:4173/')
    expect(res.status).toBe(200)
  })

  it('response body contains id="app"', async () => {
    const res = await fetch('http://localhost:4173/')
    const body = await res.text()
    expect(body).toContain('id="app"')
  })
})
