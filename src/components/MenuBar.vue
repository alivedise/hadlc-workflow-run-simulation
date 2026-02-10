<script setup lang="ts">
defineProps<{
  appName: string
  phaseName: string
  phaseIndex: number
  stepInPhase: number
  totalStepsInPhase: number
  totalSteps: number
  currentStepIndex: number
}>()
</script>

<template>
  <div
    class="h-7 flex items-center justify-between px-4 text-white/90 text-xs backdrop-blur-xl shrink-0 select-none"
    style="background: rgba(30, 30, 40, 0.8)"
  >
    <div class="flex items-center gap-4">
      <span class="text-sm font-medium"></span>
      <span class="font-semibold">{{ appName }}</span>
      <span class="text-white/40">File</span>
      <span class="text-white/40">Edit</span>
      <span class="text-white/40">View</span>
      <span class="text-white/40">Window</span>
      <span class="text-white/40">Help</span>
    </div>
    <div class="flex items-center gap-4">
      <span
        v-if="currentStepIndex >= 0"
        class="px-2 py-0.5 rounded-full text-[10px] font-medium"
        :class="{
          'bg-blue-500/30 text-blue-300': phaseIndex === 0,
          'bg-green-500/30 text-green-300': phaseIndex === 1,
          'bg-orange-500/30 text-orange-300': phaseIndex === 2,
          'bg-purple-500/30 text-purple-300': phaseIndex === 3,
        }"
      >
        Phase {{ phaseIndex + 1 }}: {{ phaseName }}
      </span>
      <span v-if="currentStepIndex >= 0" class="text-white/50 tabular-nums">
        {{ stepInPhase }}/{{ totalStepsInPhase }}
        <span class="text-white/30 ml-1">({{ currentStepIndex + 1 }}/{{ totalSteps }})</span>
      </span>
      <span v-else class="text-white/50">Press &rarr; to start</span>
    </div>
  </div>
</template>
