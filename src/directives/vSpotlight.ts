import type { Directive } from 'vue'

export const vSpotlight: Directive = {
  mounted(el: HTMLElement) {
    el.classList.add('spotlight-container')
    
    // Create and prepend the glow element
    const glow = document.createElement('div')
    glow.className = 'spotlight-glow'
    el.prepend(glow)

    const updateGlowPosition = () => {
      // Keep the glow element fixed to the visible area of the scrollable container
      glow.style.transform = `translate(${el.scrollLeft}px, ${el.scrollTop}px)`
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      
      // Calculate scale factors in case the element is transformed
      const scaleX = el.offsetWidth ? rect.width / el.offsetWidth : 1
      const scaleY = el.offsetHeight ? rect.height / el.offsetHeight : 1
      
      // Calculate x and y relative to the visible viewport of the element.
      // Since we translate the glow element to match the scroll position,
      // the mouse coordinates should be relative to the visible box only.
      const x = (e.clientX - rect.left) / scaleX
      const y = (e.clientY - rect.top) / scaleY
      
      el.style.setProperty('--x', `${x}px`)
      el.style.setProperty('--y', `${y}px`)
    }

    const handleScroll = () => {
      updateGlowPosition()
    }

    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial position
    updateGlowPosition()

    // Store handlers for cleanup
    ;(el as any)._spotlight = {
      mousemove: handleMouseMove,
      scroll: handleScroll
    }
  },
  unmounted(el: HTMLElement) {
    const handlers = (el as any)._spotlight
    if (handlers) {
      el.removeEventListener('mousemove', handlers.mousemove)
      el.removeEventListener('scroll', handlers.scroll)
    }
  }
}
