import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const formData = await readMultipartFormData(event)

  if (!formData || !formData[0]) {
    throw createError({
      statusCode: 400,
      message: '没有找到音频文件'
    })
  }

  const file = formData[0]
  const audioFormData = new FormData()
  audioFormData.append('file', new Blob([file.data], { type: file.type }), file.filename)
  audioFormData.append('model', 'whisper-1')
  audioFormData.append('response_format', 'vtt')
  audioFormData.append('prompt', '这是一节 Nuxt 3 课程视频的录音，请准确识别 Nuxt、Vue、JavaScript、TypeScript 等编程术语')

  try {
    const response = await fetch(`${config.openaiBaseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`
      },
      body: audioFormData
    })

    if (!response.ok) {
      const error = await response.json()
      throw createError({
        statusCode: response.status,
        message: error.error?.message || '转写失败'
      })
    }

    const vtt = await response.text()
    return { vtt }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '转写失败'
    })
  }
})
