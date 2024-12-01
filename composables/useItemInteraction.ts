import { ref, computed, watch } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useBoardStore } from '~/stores/board'

interface Position {
  x: number
  y: number
  width: number
  height: number
}

export function useItemInteraction(
  position: Position,
  onUpdate: (updates: Partial<Position>) => void,
  options = {
    minWidth: 300,
    minHeight: 300,
    grid: 1
  }
) {
  const boardStore = useBoardStore()
  const isMoving = ref(false)
  const isResizing = ref(false)
  const startPos = ref({ x: 0, y: 0 })
  const initialPos = ref({ ...position })
  const currentPos = ref({ ...position })
  const resizeHandle = ref<string | null>(null)

  // Watch for external position changes
  watch(() => position, (newPos) => {
    if (!isMoving.value && !isResizing.value) {
      // Preserve size if not explicitly changed
      currentPos.value = {
        x: newPos.x,
        y: newPos.y,
        width: newPos.width || currentPos.value.width,
        height: newPos.height || currentPos.value.height
      }
    }
  }, { deep: true })

  const style = computed(() => ({
    transform: `translate(${currentPos.value.x}px, ${currentPos.value.y}px)`,
    width: `${currentPos.value.width}px`,
    height: `${currentPos.value.height}px`,
  }))

  function startMove(e: MouseEvent) {
    if (e.button !== 0) return // Only handle left mouse button
    isMoving.value = true
    initialPos.value = { ...currentPos.value }
    startPos.value = {
      x: e.clientX,
      y: e.clientY
    }
  }

  function startResize(handle: string, e: MouseEvent) {
    if (e.button !== 0) return // Only handle left mouse button
    isResizing.value = true
    resizeHandle.value = handle
    initialPos.value = { ...currentPos.value }
    startPos.value = {
      x: e.clientX,
      y: e.clientY
    }
  }

  function move(e: MouseEvent) {
    const scale = boardStore.scale

    if (isMoving.value) {
      const dx = (e.clientX - startPos.value.x)
      const dy = (e.clientY - startPos.value.y)

      const newX = Math.round((initialPos.value.x + dx / scale) / options.grid) * options.grid
      const newY = Math.round((initialPos.value.y + dy / scale) / options.grid) * options.grid

      currentPos.value = {
        ...currentPos.value,
        x: newX,
        y: newY
      }

      onUpdate({ x: newX, y: newY })
    }

    if (isResizing.value && resizeHandle.value) {
      const dx = (e.clientX - startPos.value.x)
      const dy = (e.clientY - startPos.value.y)
      const newPos = { ...initialPos.value }
      const handle = resizeHandle.value

      // Handle width changes
      if (handle.includes('e')) {
        newPos.width = Math.max(options.minWidth, initialPos.value.width + dx / scale)
      } else if (handle.includes('w')) {
        const newWidth = Math.max(options.minWidth, initialPos.value.width - dx / scale)
        if (newWidth !== initialPos.value.width) {
          newPos.x = initialPos.value.x + (initialPos.value.width - newWidth)
          newPos.width = newWidth
        }
      }

      // Handle height changes
      if (handle.includes('s')) {
        newPos.height = Math.max(options.minHeight, initialPos.value.height + dy / scale)
      } else if (handle.includes('n')) {
        const newHeight = Math.max(options.minHeight, initialPos.value.height - dy / scale)
        if (newHeight !== initialPos.value.height) {
          newPos.y = initialPos.value.y + (initialPos.value.height - newHeight)
          newPos.height = newHeight
        }
      }

      currentPos.value = newPos
      onUpdate(newPos)
    }
  }

  function stopInteraction() {
    isMoving.value = false
    isResizing.value = false
    resizeHandle.value = null
  }

  // Set up event listeners
  useEventListener(window, 'mousemove', move)
  useEventListener(window, 'mouseup', stopInteraction)
  useEventListener(window, 'mouseleave', stopInteraction)

  return {
    style,
    isMoving,
    isResizing,
    startMove,
    startResize,
    stopInteraction
  }
}
