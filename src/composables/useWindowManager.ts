import { reactive, type Ref } from 'vue'
import type { WindowId } from '@/data/types'

export interface WindowGeometry {
  x: number
  y: number
  w: number
  h: number
  zIndex: number
}

type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const MIN_W = 15
const MIN_H = 15
const VISIBLE_PX = 50

const INITIAL_POSITIONS: Record<WindowId, WindowGeometry> = {
  browser: { x: 1, y: 1, w: 33, h: 48, zIndex: 1 },
  pencil: { x: 1, y: 1, w: 33, h: 48, zIndex: 0 },
  claude: { x: 35, y: 1, w: 33, h: 48, zIndex: 2 },
  vscode: { x: 1, y: 51, w: 67, h: 48, zIndex: 3 },
  teams: { x: 69, y: 1, w: 30, h: 98, zIndex: 5 },
}

export function useWindowManager(desktopRef: Ref<HTMLElement | undefined>) {
  const windows = reactive<Record<WindowId, WindowGeometry>>(
    Object.fromEntries(
      Object.entries(INITIAL_POSITIONS).map(([k, v]) => [k, { ...v }]),
    ) as Record<WindowId, WindowGeometry>,
  )

  let zCounter = 10

  function getDesktopRect() {
    const el = desktopRef.value
    if (!el) return { width: 1, height: 1 }
    return { width: el.clientWidth, height: el.clientHeight }
  }

  function pxToPercent(dx: number, dy: number) {
    const rect = getDesktopRect()
    return {
      dx: (dx / rect.width) * 100,
      dy: (dy / rect.height) * 100,
    }
  }

  function clampPosition(win: WindowGeometry) {
    const rect = getDesktopRect()
    const minX = (-win.w / 100) * rect.width + VISIBLE_PX
    const minY = 0
    const maxX = rect.width - VISIBLE_PX
    const maxY = rect.height - VISIBLE_PX

    const pxX = (win.x / 100) * rect.width
    const pxY = (win.y / 100) * rect.height

    win.x = (Math.max(minX, Math.min(maxX, pxX)) / rect.width) * 100
    win.y = (Math.max(minY, Math.min(maxY, pxY)) / rect.height) * 100
  }

  function bringToFront(id: WindowId) {
    zCounter++
    windows[id].zIndex = zCounter
  }

  function startDrag(id: WindowId, e: PointerEvent) {
    e.preventDefault()
    bringToFront(id)

    const win = windows[id]
    const startX = e.clientX
    const startY = e.clientY
    const origX = win.x
    const origY = win.y

    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)

    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'

    function onMove(ev: PointerEvent) {
      const { dx, dy } = pxToPercent(ev.clientX - startX, ev.clientY - startY)
      win.x = origX + dx
      win.y = origY + dy
      clampPosition(win)
    }

    function onUp() {
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerup', onUp)
  }

  function startResize(id: WindowId, edge: Edge, e: PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    bringToFront(id)

    const win = windows[id]
    const startX = e.clientX
    const startY = e.clientY
    const origX = win.x
    const origY = win.y
    const origW = win.w
    const origH = win.h

    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)

    document.body.style.userSelect = 'none'

    const resizesLeft = edge.includes('w')
    const resizesRight = edge.includes('e')
    const resizesTop = edge === 'n' || edge === 'nw' || edge === 'ne'
    const resizesBottom = edge === 's' || edge === 'sw' || edge === 'se'

    function onMove(ev: PointerEvent) {
      const { dx, dy } = pxToPercent(ev.clientX - startX, ev.clientY - startY)

      if (resizesRight) {
        win.w = Math.max(MIN_W, origW + dx)
      }
      if (resizesLeft) {
        const newW = Math.max(MIN_W, origW - dx)
        win.x = origX + (origW - newW)
        win.w = newW
      }
      if (resizesBottom) {
        win.h = Math.max(MIN_H, origH + dy)
      }
      if (resizesTop) {
        const newH = Math.max(MIN_H, origH - dy)
        win.y = origY + (origH - newH)
        win.h = newH
      }
    }

    function onUp() {
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerup', onUp)
      document.body.style.userSelect = ''
    }

    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerup', onUp)
  }

  return {
    windows,
    bringToFront,
    startDrag,
    startResize,
  }
}
