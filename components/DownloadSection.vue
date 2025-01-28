<script setup lang="ts">
import type { Chapter } from '~/types'

defineProps<{
  vttUrl?: string
  txtUrl?: string
  chapters?: Chapter[]
}>()
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">处理完成</h3>

    <div v-if="chapters?.length" class="border rounded p-4 space-y-2">
      <h4 class="font-medium">章节概要：</h4>
      <div v-for="chapter in chapters" :key="chapter.time" class="flex gap-2">
        <span class="text-gray-500">{{ chapter.time }}</span>
        <span>{{ chapter.title }}</span>
      </div>
    </div>

    <div class="flex gap-4">
      <UButton
        v-if="vttUrl"
        icon="i-heroicons-document-text"
        @click="() => window.open(vttUrl)"
      >
        下载字幕文件
      </UButton>

      <UButton
        v-if="txtUrl"
        icon="i-heroicons-document"
        @click="() => window.open(txtUrl)"
      >
        下载摘要文件
      </UButton>
    </div>
  </div>
</template>
