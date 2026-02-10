<script setup lang="ts">
import type { PencilScreen } from '@/data/types'
import { computed } from 'vue'
import { PenTool } from 'lucide-vue-next'

const props = defineProps<{
  file: string | null
  screens: PencilScreen[]
}>()

const activeScreen = computed(() => props.screens[0] ?? null)

const layers = computed(() => {
  if (!activeScreen.value) return []
  return activeScreen.value.elements.map((el) => el.label)
})
</script>

<template>
  <div class="flex flex-col h-full text-white text-xs" style="background: #1e1e2e">
    <!-- Top bar -->
    <div class="flex items-center gap-2 px-3 py-1.5 border-b border-white/10" style="background: #2a2a3e">
      <PenTool :size="12" class="text-violet-400" />
      <span class="text-white/70 font-medium">Pencil</span>
      <span v-if="file" class="text-white/40">{{ file }}</span>
      <!-- Screen tabs -->
      <div v-if="screens.length > 1" class="flex gap-1 ml-auto">
        <div
          v-for="(screen, i) in screens"
          :key="i"
          class="px-2 py-0.5 rounded text-[10px]"
          :class="i === 0 ? 'bg-violet-500/30 text-violet-300' : 'text-white/40 hover:text-white/60'"
        >
          {{ screen.name }}
        </div>
      </div>
    </div>

    <div class="flex flex-1 min-h-0">
      <!-- Layers sidebar -->
      <div class="w-28 border-r border-white/10 overflow-auto shrink-0" style="background: #252535">
        <div class="px-2 py-1.5 text-[10px] text-white/40 uppercase tracking-wider">Layers</div>
        <div
          v-for="(layer, i) in layers"
          :key="i"
          class="flex items-center gap-1.5 px-2 py-1 text-[10px] hover:bg-white/5 cursor-default"
          :class="i === 0 ? 'text-violet-300 bg-violet-500/10' : 'text-white/60'"
        >
          <div class="w-2 h-2 rounded-sm border border-current opacity-50" />
          {{ layer }}
        </div>
      </div>

      <!-- Canvas area -->
      <div class="flex-1 flex items-center justify-center overflow-hidden" style="background: #1a1a28">
        <!-- Artboard -->
        <div
          v-if="activeScreen"
          class="relative bg-white rounded shadow-lg"
          style="width: 85%; aspect-ratio: 16/10"
        >
          <div
            v-for="(el, i) in activeScreen.elements"
            :key="i"
            class="absolute border rounded flex items-center justify-center text-[9px] font-medium"
            :style="{
              left: el.x + '%',
              top: el.y + '%',
              width: el.w + '%',
              height: el.h + '%',
              background: (el.color ?? '#6366f1') + '18',
              borderColor: (el.color ?? '#6366f1') + '40',
              color: el.color ?? '#6366f1',
            }"
          >
            {{ el.label }}
          </div>
        </div>
        <div v-else class="text-white/30 text-sm">No design loaded</div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="flex items-center justify-between px-3 py-1 border-t border-white/10 text-[10px] text-white/40" style="background: #2a2a3e">
      <span v-if="activeScreen">{{ activeScreen.name }}</span>
      <span>100%</span>
    </div>
  </div>
</template>
