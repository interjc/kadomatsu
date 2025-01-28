<script setup lang="ts">
const { processFile, state, file, result, reset } = useFileProcessing()
const isProcessing = computed(() => ['extracting', 'transcribing', 'summarizing'].includes(state.value.stage))
const showVtt = computed(() => state.value.vtt !== undefined)
const showChapters = computed(() => state.value.chapters !== undefined)
const toast = useToast()

async function handleFileDrop(files: File[]) {
  if (files.length > 0) {
    const { success, error } = await processFile(files[0])
    if (!success && error) {
      toast.add({
        title: '处理失败',
        description: error,
        color: 'red'
      })
    }
  }
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    const { success, error } = await processFile(input.files[0])
    if (!success && error) {
      toast.add({
        title: '处理失败',
        description: error,
        color: 'red'
      })
    }
  }
}

const downloadVtt = () => {
  if (!result.value?.vtt) return
  const blob = new Blob([result.value.vtt], { type: 'text/vtt' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${file.value?.name || 'transcription'}.vtt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 头部工具栏 -->
    <div class="bg-white border-b shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold">音频转字幕</h1>

          <div class="flex items-center gap-4">
            <template v-if="!file">
              <label
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
              >
                选择音频文件
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a"
                  class="hidden"
                  @change="handleFileSelect"
                >
              </label>
            </template>

            <template v-else>
              <FileInfo
                v-if="state.fileInfo"
                :file-info="state.fileInfo"
                class="inline-flex items-center"
              />
              <label
                class="px-3 py-1 text-gray-600 hover:text-gray-800 border rounded cursor-pointer"
              >
                重新生成
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a"
                  class="hidden"
                  @change="handleFileSelect"
                >
              </label>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="flex-1 flex">
      <!-- 上传区域 -->
      <template v-if="!file">
        <div class="w-full p-4">
          <DropZone
            :accept="['.mp3', '.wav', '.m4a']"
            @drop="handleFileDrop"
            @select="handleFileSelect"
            class="h-full"
          >
            <div class="text-center">
              <svg
                class="w-12 h-12 mx-auto mb-4 text-gray-400"
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
              <p>拖拽音频文件到这里</p>
              <p class="text-sm text-gray-500 mt-2">
                支持的格式：MP3, WAV, M4A
              </p>
            </div>
          </DropZone>
        </div>
      </template>

      <!-- 处理中和结果展示 -->
      <template v-else>
        <div class="flex-1 flex p-4 gap-4">
          <!-- VTT 内容 -->
          <div class="flex-1 bg-white rounded-lg shadow p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium">字幕内容</h3>
              <button
                v-if="showVtt"
                @click="downloadVtt"
                class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                下载 VTT
              </button>
            </div>
            <template v-if="showVtt">
              <pre class="h-[calc(100%-3rem)] overflow-auto text-sm text-gray-700 whitespace-pre-wrap">{{ state.vtt }}</pre>
            </template>
            <template v-else>
              <div class="h-full flex items-center justify-center">
                <div class="text-center">
                  <div v-if="state.stage === 'transcribing'" class="animate-spin w-10 h-10 mx-auto mb-4">
                    <svg class="w-full h-full text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                  <p class="text-gray-500">正在生成字幕...</p>
                </div>
              </div>
            </template>
          </div>

          <!-- Chapters 内容 -->
          <div class="flex-1 bg-white rounded-lg shadow p-4">
            <h3 class="font-medium mb-4">章节信息</h3>
            <template v-if="showChapters">
              <div class="h-[calc(100%-3rem)] overflow-auto">
                <div v-if="state.chapters?.length" class="space-y-2">
                  <div
                    v-for="chapter in state.chapters"
                    :key="chapter.time"
                    class="flex items-start gap-4 p-2 hover:bg-gray-50 rounded"
                  >
                    <span class="text-sm font-mono text-gray-500">{{ chapter.time }}</span>
                    <span class="text-sm">{{ chapter.title }}</span>
                  </div>
                </div>
                <p v-else class="text-gray-500 text-center mt-4">暂无章节信息</p>
              </div>
            </template>
            <template v-else>
              <div class="h-full flex items-center justify-center">
                <div class="text-center">
                  <div v-if="state.stage === 'summarizing'" class="animate-spin w-10 h-10 mx-auto mb-4">
                    <svg class="w-full h-full text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                  <p class="text-gray-500">正在生成章节...</p>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
