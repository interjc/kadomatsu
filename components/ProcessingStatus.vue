<script setup lang="ts">
const props = defineProps<{
  status: string
  progress: number
}>()

const statusMap = {
  extracting: '正在提取音频...',
  transcribing: '正在转写文字...',
  summarizing: '正在生成摘要...',
  completed: '处理完成'
}

const currentStatus = computed(() => statusMap[props.status] || '处理中...')
</script>

<template>
  <div class="text-center">
    <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
    <p class="mt-2">{{ currentStatus }}</p>
    <UProgress
      v-if="progress > 0"
      :value="progress"
      class="mt-2"
    />
  </div>
</template>
