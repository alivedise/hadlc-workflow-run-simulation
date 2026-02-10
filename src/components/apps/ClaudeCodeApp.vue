<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  lines: Array<{ type: 'command' | 'output'; text: string; color?: string; stepId: string }>
}>()

const scrollContainer = ref<HTMLElement>()

const colorMap: Record<string, string> = {
  green: 'text-terminal-green',
  yellow: 'text-terminal-yellow',
  cyan: 'text-terminal-cyan',
  red: 'text-terminal-red',
  white: 'text-terminal-text',
}

watch(
  () => props.lines.length,
  async () => {
    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  },
)
</script>

<template>
  <div
    class="h-full flex flex-col font-mono text-xs"
    style="background: #0d1117; color: #e6edf3"
  >
    <!-- Tab bar mimicking iTerm2 -->
    <div class="flex items-center h-6 pl-2 border-b border-white/10 shrink-0 text-[10px]" style="background: #161b22">
      <div class="px-2 h-full flex items-center text-white/60 border-r border-white/10 bg-white/5">hadlc-demo</div>
      <div class="px-2 h-full flex items-center text-white/30 border-r border-white/10">Agent</div>
      <div class="px-2 h-full flex items-center text-white/30">AIDLC</div>
    </div>
    <div ref="scrollContainer" class="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
      <div
        v-for="(line, i) in lines"
        :key="line.stepId + '-' + i"
        class="animate-message-in"
      >
        <template v-if="line.type === 'command'">
          <span class="text-terminal-green">claude&gt;</span>
          <span class="ml-2 text-terminal-text">{{ line.text }}</span>
        </template>
        <template v-else>
          <span :class="colorMap[line.color ?? 'white']">{{ line.text }}</span>
        </template>
      </div>
      <div v-if="lines.length === 0" class="text-white/20">
        <span class="text-terminal-green">claude&gt;</span>
        <span class="ml-2 animate-cursor-blink">&#9608;</span>
      </div>
      <div v-else>
        <span class="text-terminal-green">claude&gt;</span>
        <span class="ml-2 animate-cursor-blink">&#9608;</span>
      </div>
    </div>
  </div>
</template>
