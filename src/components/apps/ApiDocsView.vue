<script setup lang="ts">
import type { ApiEndpoint } from '@/data/types'

defineProps<{
  endpoints: ApiEndpoint[]
}>()

const methodColor: Record<string, string> = {
  GET: 'bg-method-get text-white',
  POST: 'bg-method-post text-white',
  PUT: 'bg-method-put text-white',
  PATCH: 'bg-method-patch text-white',
  DELETE: 'bg-method-delete text-white',
}
</script>

<template>
  <div class="p-3 space-y-2">
    <div class="text-xs text-white/40 uppercase tracking-wider mb-2">
      E-Map Floor Plan API
    </div>
    <div v-if="endpoints.length === 0" class="text-white/20 text-xs text-center py-4">
      No endpoints defined yet
    </div>
    <div
      v-for="ep in endpoints"
      :key="ep.method + ep.path"
      class="flex items-center gap-2 px-3 py-1.5 rounded border border-white/10 animate-message-in"
      style="background: rgba(255,255,255,0.03)"
    >
      <span
        class="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
        :class="methodColor[ep.method]"
      >
        {{ ep.method }}
      </span>
      <span class="text-xs text-white/70 font-mono">{{ ep.path }}</span>
      <span class="text-[10px] text-white/40 ml-auto truncate">{{ ep.summary }}</span>
    </div>
  </div>
</template>
