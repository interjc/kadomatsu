import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'

export const useAudioProcessing = () => {
  const ffmpeg = ref<FFmpeg>()
  const loading = ref(false)

  const initFFmpeg = async () => {
    if (!ffmpeg.value) {
      loading.value = true
      try {
        ffmpeg.value = new FFmpeg()

        // 加载核心文件
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
        await ffmpeg.value.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
      } finally {
        loading.value = false
      }
    }
    return ffmpeg.value
  }

  const compressAudio = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Blob> => {
    const ff = await initFFmpeg()
    if (!ff) throw new Error('Failed to initialize FFmpeg')

    try {
      // 写入文件
      const inputFileName = 'input.' + file.name.split('.').pop()
      await ff.writeFile(inputFileName, await fetchFile(file))

      // 转换进度回调
      ff.on('progress', ({ progress }: { progress: number }) => {
        onProgress?.(Math.round(progress * 100))
      })

      // 执行压缩转换
      await ff.exec([
        '-i', inputFileName,
        '-map', '0:a',  // 只保留音频流
        '-b:a', '64k',  // 降低比特率
        '-ar', '22050', // 降低采样率
        '-ac', '1',     // 转换为单声道
        'output.mp3'
      ])

      // 读取结果
      const data = await ff.readFile('output.mp3')

      // 清理文件
      await ff.deleteFile(inputFileName)
      await ff.deleteFile('output.mp3')

      return new Blob([data], { type: 'audio/mp3' })
    } catch (error) {
      console.error('Audio compression failed:', error)
      throw new Error('音频压缩失败')
    }
  }

  return {
    loading,
    compressAudio
  }
}
