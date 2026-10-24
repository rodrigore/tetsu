import type { Directive } from 'vue'

/**
 * Lets a horizontally scrolling row be moved with a mouse: drag it, or use the wheel.
 * Touch and trackpads already scroll natively, so only mouse pointers are handled.
 */
export const vDragScroll: Directive<HTMLElement> = {
  mounted(el) {
    let startX = 0
    let startLeft = 0
    let dragging = false
    let moved = false

    el.style.cursor = 'grab'
    // Only the row itself: stops text selection while dragging (it has no inputs).
    el.style.userSelect = 'none'
    el.style.setProperty('-webkit-user-select', 'none')

    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      dragging = true
      moved = false
      startX = e.clientX
      startLeft = el.scrollLeft
    })
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 5) {
        moved = true
        el.style.cursor = 'grabbing'
      }
      if (moved) el.scrollLeft = startLeft - dx
    })
    window.addEventListener('pointerup', () => {
      if (!dragging) return
      dragging = false
      el.style.cursor = 'grab'
    })
    // A drag must not end as a click on the button under the cursor.
    el.addEventListener(
      'click',
      (e) => {
        if (moved) {
          e.stopPropagation()
          e.preventDefault()
          moved = false
        }
      },
      true,
    )
    // Mouse wheel (vertical) scrolls the row sideways when it overflows.
    el.addEventListener(
      'wheel',
      (e) => {
        if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
        el.scrollLeft += e.deltaY
        e.preventDefault()
      },
      { passive: false },
    )
  },
}
