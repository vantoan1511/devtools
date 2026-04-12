import type { Directive, DirectiveBinding } from 'vue'

/**
 * v-height directive to track the height of an element.
 * Usage:
 * <div v-height="onHeightChange"></div>
 * <div v-height="heightRef"></div>
 */
export const vHeight: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Fallback to contentRect if borderBoxSize is not supported or accessible
        const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height

        if (typeof binding.value === 'function') {
          binding.value(height)
        } else if (binding.value && typeof binding.value === 'object' && 'value' in binding.value) {
          binding.value.value = height
        }
      }
    })

    observer.observe(el)
    ;(el as any)._heightObserver = observer
  },
  unmounted(el: HTMLElement) {
    if ((el as any)._heightObserver) {
      (el as any)._heightObserver.disconnect()
      delete (el as any)._heightObserver
    }
  }
}
