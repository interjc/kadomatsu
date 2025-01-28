import { useRuntimeConfig } from '#imports'
import type { Chapter } from '~/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { vtt } = await readBody(event)

  if (!vtt) {
    throw createError({
      statusCode: 400,
      message: '没有找到字幕内容'
    })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的视频内容分析助手，请分析 Nuxt 3 课程视频的字幕内容，生成章节概要。
要求：
1. 每个章节概要限制在10个汉字以内
2. 使用时间戳+概要的格式，例如 "00:01:23: 开场介绍"
3. 时间戳格式为 HH:MM:SS
4. 根据内容的主题变化和重要程度来划分章节
5. 总章节数控制在10个以内
6. 确保使用准确的技术术语，如 Nuxt、Vue、Composition API 等`
          },
          {
            role: 'user',
            content: vtt
          }
        ],
        temperature: 0.3 // 降低温度以获得更稳定的输出
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw createError({
        statusCode: response.status,
        message: error.error?.message || '生成章节失败'
      })
    }

    const result = await response.json()
    const chaptersText = result.choices[0].message.content

    // 解析章节文本
    const chapters: Chapter[] = chaptersText.split('\n')
      .map((line: string) => {
        const match = line.match(/^(\d{2}:\d{2}:\d{2}):\s*(.+)$/)
        if (match) {
          return {
            time: match[1],
            title: match[2].trim()
          }
        }
        return null
      })
      .filter((chapter): chapter is Chapter => chapter !== null)

    return { chapters }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '生成章节失败'
    })
  }
})
