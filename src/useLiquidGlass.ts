import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { LiquidGlassOptions } from './directives/vLiquidGlass'
// ─── Glass tints ─────────────────────────────────────────────────────────────

const LIGHT_TINT = 'rgba(255, 255, 255, 0.55)'
const DARK_TINT = 'rgba(15,  17,  23,  0.55)'

// ─── Detect the dark-mode class PrimeVue toggles on <html> ───────────────────
//
// PrimeVue v4 controls dark mode by toggling a class on document.documentElement
// (configured via darkModeSelector in your PrimeVue setup, typically 'app-dark').
// We observe that element directly — no VueUse or PrimeVue composable needed.

function isDarkMode(): boolean {
    return document.documentElement.classList.contains('p-dark')
}

// ─── useToolbarGlass ──────────────────────────────────────────────────────────

export function useToolbarGlass() {
    const isDark = ref(false)

    // ─── Dark mode observer ──────────────────────────────────────────────────
    let mo: MutationObserver | null = null

    function startDarkObserver(): void {
        isDark.value = isDarkMode()

        mo = new MutationObserver(() => {
            isDark.value = isDarkMode()
        })

        mo.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        })
    }

    // ─── Glass options (re-computed whenever dark mode flips) ────────────────
    const glassOpts = computed<LiquidGlassOptions>(() => ({
        blur: 5,
        tint: isDark.value ? DARK_TINT : LIGHT_TINT,
        saturation: 300,
        border: false,   // toolbar already has border-b from Tailwind
        radius: '0px',   // full-width bar — no rounded corners
        shadow: true,
        noise: true,
        shine: true,   // distracting on a full-width element
    }))

    // ─── Toolbar height tracking (prevents content overlap) ─────────────────
    const toolbarRef = ref<HTMLElement | null>(null)
    const toolbarHeight = ref(0)
    let ro: ResizeObserver | null = null

    onMounted(() => {
        startDarkObserver()

        ro = new ResizeObserver(entries => {
            toolbarHeight.value = entries[0]?.contentRect.height ?? 0
        })
        if (toolbarRef.value) ro.observe(toolbarRef.value)
    })

    onUnmounted(() => {
        mo?.disconnect()
        ro?.disconnect()
    })

    return { glassOpts, toolbarRef, toolbarHeight }
}