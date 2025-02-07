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

  const { text, type = 'default', time = new Date().toLocaleString() } = body
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

  try {
    const prompt = [`当前时间：${time}`, PROMPT_TEMPLATES[type as PromptType](inputText)].join('\n\n')

    const requestOptions = {
      uri: `${config.openaiBaseUrl}/chat/completions`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.openaiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        stream: false
      })
    }

    console.log(`${requestOptions.method}|${requestOptions.uri} Request => `, requestOptions.body);

    const response = await fetch(requestOptions.uri, {
      ...requestOptions,
    });

    if (!response.ok) {
      const error = await response.json()
      throw createError({
        statusCode: response.status,
        message: error.error?.message || '生成失败'
      })
    }

    const res = await response.json()
    const content = res.choices[0]?.message?.content || ''

    console.log(`${requestOptions.method}|${requestOptions.uri} Response => `, {
      res,
      content,
    });

    return {
      ok: true,
      content
    }

  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string }
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || '生成失败'
    })
  }
})
