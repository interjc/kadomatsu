import { useRuntimeConfig } from '#imports'
import { PROMPT_TEMPLATES, type PromptType } from '~/constants/prompts'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body || typeof body !== 'object' || !body.text || typeof body.text !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Invalid request body. Expected { text: string, type: PromptType }'
    })
  }

  const { text, type = 'default' } = body
  const inputText = text.trim()

  if (!inputText) {
    throw createError({
      statusCode: 400,
      message: 'Text cannot be empty'
    })
  }

  if (!(type in PROMPT_TEMPLATES)) {
    throw createError({
      statusCode: 400,
      message: `Invalid prompt type. Valid types are: ${Object.keys(PROMPT_TEMPLATES).join(', ')}`
    })
  }

  // 设置响应头为 text/event-stream
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  try {
    const prompt = PROMPT_TEMPLATES[type as PromptType](inputText)
    const response = await fetch(`${config.openaiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.openaiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        stream: true
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw createError({
        statusCode: response.status,
        message: error.error?.message || '生成失败'
      })
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw createError({
        statusCode: 500,
        message: '无法读取响应流'
      })
    }

    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep the last incomplete line in the buffer

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || trimmedLine === '[DONE]') continue
        if (!trimmedLine.startsWith('data: ')) continue

        const data = trimmedLine.slice(5)
        if (data === '[DONE]') continue

        try {
          const json = JSON.parse(data)
          const content = json.choices[0]?.delta?.content || ''
          if (content) {
            await sendStream(event, content)
          }
        } catch (e) {
          console.error('Error parsing JSON:', e, '\nRaw data:', data)
        }
      }
    }

    // Handle any remaining data in the buffer
    if (buffer.trim()) {
      const trimmedLine = buffer.trim()
      if (trimmedLine.startsWith('data: ')) {
        const data = trimmedLine.slice(5)
        try {
          const json = JSON.parse(data)
          const content = json.choices[0]?.delta?.content || ''
          if (content) {
            await sendStream(event, content)
          }
        } catch (e) {
          console.error('Error parsing JSON:', e, '\nRaw data:', data)
        }
      }
    }

    await sendStream(event, '[DONE]')
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || '生成失败'
    })
  }
})

function sendStream(event: any, data: string) {
  return event.node.res.write(`data: ${data}\n\n`)
}
