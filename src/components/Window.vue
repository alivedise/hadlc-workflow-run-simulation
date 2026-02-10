<script setup lang="ts">
import type { WindowId } from '@/data/types'
import type { useWindowManager } from '@/composables/useWindowManager'

const props = defineProps<{
  title: string
  active?: boolean
  windowId: WindowId
  manager: ReturnType<typeof useWindowManager>
}>()

function onTitlePointerDown(e: PointerEvent) {
  props.manager.startDrag(props.windowId, e)
}

function onWindowPointerDown() {
  props.manager.bringToFront(props.windowId)
}

type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

function onResizePointerDown(edge: Edge, e: PointerEvent) {
  props.manager.startResize(props.windowId, edge, e)
}
</script>

<template>
  <div
    class="absolute flex flex-col rounded-xl overflow-hidden border border-white/10"
    :class="active ? 'animate-glow' : ''"
    style="background: rgba(30, 30, 40, 0.95)"
    @pointerdown="onWindowPointerDown"
  >
    <!-- Resize handles -->
    <!-- Edges -->
    <div class="absolute inset-x-2 top-0 h-1.5 cursor-n-resize z-20" @pointerdown="(e) => onResizePointerDown('n', e)" />
    <div class="absolute inset-x-2 bottom-0 h-1.5 cursor-s-resize z-20" @pointerdown="(e) => onResizePointerDown('s', e)" />
    <div class="absolute inset-y-2 left-0 w-1.5 cursor-w-resize z-20" @pointerdown="(e) => onResizePointerDown('w', e)" />
    <div class="absolute inset-y-2 right-0 w-1.5 cursor-e-resize z-20" @pointerdown="(e) => onResizePointerDown('e', e)" />
    <!-- Corners -->
    <div class="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-30" @pointerdown="(e) => onResizePointerDown('nw', e)" />
    <div class="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-30" @pointerdown="(e) => onResizePointerDown('ne', e)" />
    <div class="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-30" @pointerdown="(e) => onResizePointerDown('sw', e)" />
    <div class="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-30" @pointerdown="(e) => onResizePointerDown('se', e)" />

    <!-- Title bar (drag handle) -->
    <div
      class="h-8 flex items-center px-3 shrink-0 select-none border-b border-white/5 cursor-grab active:cursor-grabbing z-10"
      :style="{ background: active ? 'rgba(50, 50, 65, 0.95)' : 'rgba(40, 40, 50, 0.95)' }"
      @pointerdown="onTitlePointerDown"
    >
      <!-- Traffic lights -->
      <div class="flex items-center gap-1.5">
        <div class="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div class="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <div class="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      </div>
      <!-- Title -->
      <div class="flex-1 text-center text-xs text-white/60 font-medium -ml-[52px]">
        {{ title }}
      </div>
    </div>
    <!-- Content -->
    <div class="flex-1 overflow-hidden min-h-0">
      <slot />
    </div>
  </div>
</template>
