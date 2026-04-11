import type { Directive } from 'vue'

export const vSpotlight: Directive = {
  mounted(el: HTMLElement) {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--x', `${x}px`)
      el.style.setProperty('--y', `${y}px`)
    }

    el.addEventListener('mousemove', handleMouseMove)
    el.classList.add('spotlight-container')
    
    // Create and prepend the glow element
    const glow = document.createElement('div')
    glow.className = 'spotlight-glow'
    el.prepend(glow)

    // Store the listener for cleanup
    ;(el as any)._spotlightHandler = handleMouseMove
  },
  unmounted(el: HTMLElement) {
    if ((el as any)._spotlightHandler) {
      el.removeEventListener('mousemove', (el as any)._spotlightHandler)
    }
  }
}
