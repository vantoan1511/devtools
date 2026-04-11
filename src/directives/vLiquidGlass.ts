/**
 * v-liquid-glass  —  Vue 3 + TypeScript
 *
 * Usage:
 *   import { LiquidGlassPlugin } from './v-liquid-glass'
 *   app.use(LiquidGlassPlugin)
 *
 *   <div v-liquid-glass>…</div>
 *   <div v-liquid-glass="{ blur: 20, tint: 'rgba(255,255,255,0.08)' }">…</div>
 */

import type { App, Directive, DirectiveBinding, ObjectDirective } from 'vue'

// ─── Public option types ──────────────────────────────────────────────────────

/** All options accepted by v-liquid-glass (every field is optional). */
export interface LiquidGlassOptions {
  /** Backdrop blur in px. @default 16 */
  blur?: number
  /** CSS color string used as the glass tint. @default 'rgba(255,255,255,0.10)' */
  tint?: string
  /** backdrop-filter saturate value in %. @default 180 */
  saturation?: number
  /** Show an iridescent inset border. @default true */
  border?: boolean
  /** Enable a mouse-tracking radial shine. @default true */
  shine?: boolean
  /** Show a drop-shadow beneath the element. @default true */
  shadow?: boolean
  /** CSS border-radius value. @default '1.25rem' */
  radius?: string
  /** Overlay a subtle noise-grain texture. @default true */
  noise?: boolean
}

/** Resolved (all-required) options after defaults are applied. */
type ResolvedOptions = Required<LiquidGlassOptions>

// ─── Augment HTMLElement to carry our private listener reference ──────────────

declare global {
  interface HTMLElement {
    /** @internal attached mousemove handler, stored for later removal */
    __lgMouseMove?: (e: MouseEvent) => void
  }
}

// ─── Shared noise SVG data-URI ────────────────────────────────────────────────

const NOISE_SVG =
  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E' +
  '%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E' +
  '%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")'

// ─── One-time <style> injection ───────────────────────────────────────────────

let styleInjected = false

function ensureBaseStyles(): void {
  if (styleInjected || typeof document === 'undefined') return
  styleInjected = true

  const style = document.createElement('style')
  style.textContent = /* css */ `
    /* === Liquid Glass Base === */
    [data-liquid-glass] {
      position: relative;
      isolation: isolate;
      overflow: hidden;
    }

    /* Noise grain overlay */
    [data-liquid-glass][data-lg-noise]::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      border-radius: inherit;
      background-image: ${NOISE_SVG};
      background-size: 128px 128px;
      opacity: 0.035;
      mix-blend-mode: overlay;
    }

    /* Mouse-tracking shine */
    [data-liquid-glass][data-lg-shine]::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      border-radius: inherit;
      background: radial-gradient(
        circle at var(--lg-mx, 50%) var(--lg-my, 0%),
        rgba(255,255,255,0.18) 0%,
        rgba(255,255,255,0.04) 40%,
        transparent 70%
      );
      transition: background 0.1s ease;
    }

    /* Iridescent inset border */
    [data-liquid-glass][data-lg-border]::before,
    [data-liquid-glass][data-lg-noise][data-lg-border]::before {
      box-shadow:
        inset 0 1.5px 0 0 rgba(255,255,255,0.55),
        inset 0 -1px  0 0 rgba(255,255,255,0.12),
        inset  1px 0  0 0 rgba(255,255,255,0.22),
        inset -1px 0  0 0 rgba(255,255,255,0.10);
    }
  `
  document.head.appendChild(style)
}

// ─── Vendor-prefix helper ─────────────────────────────────────────────────────
//
// `webkitBackdropFilter` is a valid runtime property but is absent from the
// TypeScript DOM lib's CSSStyleDeclaration. Casting through a typed helper
// keeps the assignment safe without scattering `(el.style as any)` everywhere.

type VendorStyle = CSSStyleDeclaration & {
  webkitBackdropFilter: string
}

function vendorStyle(el: HTMLElement): VendorStyle {
  return el.style as VendorStyle
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveOptions(
  binding: DirectiveBinding<LiquidGlassOptions | undefined>,
): ResolvedOptions {
  const raw = binding.value ?? {}
  return {
    blur:       raw.blur       ?? 16,
    tint:       raw.tint       ?? 'rgba(255,255,255,0.10)',
    saturation: raw.saturation ?? 180,
    border:     raw.border     !== false,
    shine:      raw.shine      !== false,
    shadow:     raw.shadow     !== false,
    radius:     raw.radius     ?? '1.25rem',
    noise:      raw.noise      !== false,
  }
}

function applyStyles(el: HTMLElement, opts: ResolvedOptions): void {
  const value = `blur(${opts.blur}px) saturate(${opts.saturation}%)`
  el.style.backdropFilter             = value
  vendorStyle(el).webkitBackdropFilter = value
  el.style.backgroundColor      = opts.tint
  el.style.borderRadius         = opts.radius

  el.style.boxShadow = opts.shadow
    ? '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(255,255,255,0.08)'
    : ''

  el.dataset['liquidGlass'] = ''
  if (opts.noise)  el.dataset['lgNoise']  = ''
  if (opts.shine)  el.dataset['lgShine']  = ''
  if (opts.border) el.dataset['lgBorder'] = ''
}

function removeStyles(el: HTMLElement): void {
  el.style.backdropFilter              = ''
  vendorStyle(el).webkitBackdropFilter = ''
  el.style.backgroundColor      = ''
  el.style.borderRadius         = ''
  el.style.boxShadow            = ''

  delete el.dataset['liquidGlass']
  delete el.dataset['lgNoise']
  delete el.dataset['lgShine']
  delete el.dataset['lgBorder']
}

function onMouseMove(e: MouseEvent): void {
  const el   = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x    = (((e.clientX - rect.left) / rect.width)  * 100).toFixed(1)
  const y    = (((e.clientY - rect.top)  / rect.height) * 100).toFixed(1)
  el.style.setProperty('--lg-mx', `${x}%`)
  el.style.setProperty('--lg-my', `${y}%`)
}

function attachShine(el: HTMLElement): void {
  if (el.__lgMouseMove) return
  el.__lgMouseMove = onMouseMove
  el.addEventListener('mousemove', el.__lgMouseMove)
}

function detachShine(el: HTMLElement): void {
  if (!el.__lgMouseMove) return
  el.removeEventListener('mousemove', el.__lgMouseMove)
  delete el.__lgMouseMove
}

// ─── The Directive ────────────────────────────────────────────────────────────

/**
 * Typed Vue 3 directive object.
 *
 * The generic parameter `LiquidGlassOptions` is the value type users pass
 * in the template:  v-liquid-glass="{ blur: 20 }"
 */
export const liquidGlass: ObjectDirective<HTMLElement, LiquidGlassOptions | undefined> = {
  mounted(el, binding) {
    ensureBaseStyles()
    const opts = resolveOptions(binding)
    applyStyles(el, opts)
    if (opts.shine) attachShine(el)
  },

  updated(el, binding) {
    const opts = resolveOptions(binding)
    removeStyles(el)
    applyStyles(el, opts)

    if (opts.shine) {
      attachShine(el)
    } else {
      detachShine(el)
    }
  },

  beforeUnmount(el) {
    detachShine(el)
    removeStyles(el)
  },
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

export const LiquidGlassPlugin = {
  install(app: App): void {
    app.directive('liquid-glass', liquidGlass as Directive)
  },
}

export default LiquidGlassPlugin

// ─── Module augmentation — gives template type-checking in Volar/vue-tsc ──────
//
// With this block, Volar will validate the binding value type in <template>
// and show IntelliSense for every option field.
//
declare module 'vue' {
  interface ComponentCustomProperties {
    vLiquidGlass: ObjectDirective<HTMLElement, LiquidGlassOptions | undefined>
  }
}