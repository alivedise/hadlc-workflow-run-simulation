<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { TeamsAction } from '@/data/types'
import { CheckCircle } from 'lucide-vue-next'

const props = defineProps<{
  messages: Array<TeamsAction & { stepId: string }>
}>()

const scrollContainer = ref<HTMLElement>()

const roleColor: Record<string, string> = {
  ADM: 'bg-role-adm',
  PM: 'bg-role-pm',
  RD: 'bg-role-rd',
  UX: 'bg-role-ux',
  Agent: 'bg-role-agent',
}

const roleTextColor: Record<string, string> = {
  ADM: 'text-role-adm',
  PM: 'text-role-pm',
  RD: 'text-role-rd',
  UX: 'text-role-ux',
  Agent: 'text-role-agent',
}

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  },
)
</script>

<template>
  <div class="flex flex-col h-full text-white text-sm" style="background: #292b3a">
    <!-- Meeting/Channel header -->
    <div class="px-3 py-2 border-b border-white/10 shrink-0 flex items-center gap-2">
      <div class="w-8 h-8 rounded bg-purple-600/60 flex items-center justify-center text-xs font-bold shrink-0">AI</div>
      <div class="min-w-0">
        <div class="text-xs font-semibold text-white/90 truncate">AI Team Weekly Meeting</div>
        <div class="text-[10px] text-white/40"># emap-floor-plan</div>
      </div>
    </div>
    <!-- Messages -->
    <div ref="scrollContainer" class="flex-1 overflow-y-auto px-3 py-2 space-y-2.5 min-h-0">
      <div
        v-for="(msg, i) in messages"
        :key="msg.stepId + '-' + i"
        class="flex items-start gap-2 animate-message-in"
      >
        <!-- Avatar -->
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
          :class="roleColor[msg.from.role]"
        >
          {{ msg.from.name.charAt(0) }}
        </div>
        <div class="min-w-0">
          <div class="flex items-baseline gap-2">
            <span class="text-xs font-semibold" :class="roleTextColor[msg.from.role]">
              {{ msg.from.name }}
            </span>
            <span class="text-[10px] text-white/30">{{ msg.from.role }}</span>
          </div>
          <p class="text-xs text-white/80 leading-relaxed mt-0.5">
            <CheckCircle v-if="msg.isApproval" :size="14" class="inline-block mr-1 text-green-400 align-text-bottom" />{{ msg.text }}
          </p>
        </div>
      </div>
      <div v-if="messages.length === 0" class="text-center text-white/20 text-xs py-8">
        Waiting for messages...
      </div>
    </div>
  </div>
</template>
