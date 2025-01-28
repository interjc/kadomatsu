import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body?.text) {
    throw createError({
      statusCode: 400,
      message: '请输入文字内容'
    })
  }

  const text = body.text

  try {
    const prompt = `你是一个新年祝福助手，请根据以下内容：
${text}

1. 生成一副对联，格式要求：
   - 上联和下联各7-9个字
   - 横批4个字
   - 格式：上联：...\n下联：...\n横批：...

2. 生成一段50字左右的祝福语

3. 生成一个100词内的英文生图prompt，适合用于AI绘画

请以JSON格式返回结果，格式如下：
{
  "couplet": "上联：...\n下联：...\n横批：...",
  "blessing": "...",
  "imagePrompt": "..."
}`

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
        response_format: { type: "json_object" }  // 确保返回JSON格式
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw createError({
        statusCode: response.status,
        message: error.error?.message || '生成失败'
      })
    }

    const data = await response.json()
    return JSON.parse(data.choices[0]?.message?.content || '{}')

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '生成失败'
    })
  }
})
