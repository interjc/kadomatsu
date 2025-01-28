<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  accept?: string[]
  maxSize?: number
}>()

const emit = defineEmits<{
  drop: [files: File[]]
  select: [event: Event]
}>()

const dropzone = ref<HTMLDivElement>()
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length === 0) return

  // 检查文件类型
  if (props.accept) {
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      return props.accept?.includes(extension)
    })
    if (validFiles.length > 0) {
      emit('drop', validFiles)
    }
  } else {
    emit('drop', files)
  }
}

function handleClick() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  emit('select', e)
}
</script>

<template>
  <div
    ref="dropzone"
    class="relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer"
    :class="{
      'border-gray-300 hover:border-gray-400': !isDragging,
      'border-blue-500 bg-blue-50': isDragging
    }"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @click="handleClick"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="accept?.join(',')"
      class="hidden"
      @change="handleFileSelect"
    >

    <div class="flex flex-col items-center justify-center text-gray-600">
      <slot>
        <div class="mb-4">
          <svg
            class="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p class="text-lg">
          拖拽文件到这里或点击上传
        </p>
        <p v-if="accept" class="text-sm text-gray-500 mt-2">
          支持的格式：{{ accept.join(', ') }}
        </p>
      </slot>
    </div>
  </div>
</template>
