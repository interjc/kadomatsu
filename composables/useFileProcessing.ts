import { ref } from 'vue'
import type { ProcessingState } from '~/types'

export function useFileProcessing() {
  const file = ref<File | null>(null)
  const state = ref<ProcessingState>({
    stage: 'idle',
    progress: 0,
  })

  async function processFile(newFile: File) {
    try {
      // 重置状态
      file.value = newFile
      state.value = {
        stage: 'extracting',
        progress: 0,
        fileInfo: {
          name: newFile.name,
          size: newFile.size,
          type: newFile.type,
          lastModified: newFile.lastModified,
          extension: newFile.name.split('.').pop() || ''
        }
      }

      // 开始转写
      state.value.stage = 'transcribing'
      state.value.progress = 30

      const formData = new FormData()
      formData.append('file', newFile)

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      if (!transcribeResponse.ok) {
        throw new Error('转写失败')
      }

      const { vtt } = await transcribeResponse.json()

      // 更新 VTT 结果
      state.value.vtt = vtt
      state.value.progress = 60

      // 开始生成章节
      state.value.stage = 'summarizing'

      const chaptersResponse = await fetch('/api/generate-chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vtt })
      })

      if (!chaptersResponse.ok) {
        throw new Error('生成章节失败')
      }

      const { chapters } = await chaptersResponse.json()

      // 更新章节结果
      state.value.chapters = chapters
      state.value.progress = 100
      state.value.stage = 'completed'

      return { success: true }
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : '处理失败'
      return { success: false, error: state.value.error }
    }
  }

  function reset() {
    file.value = null
    state.value = {
      stage: 'idle',
      progress: 0
    }
  }

  return {
    file,
    state,
    processFile,
    reset
  }
}
