export const PROMPT_TEMPLATES = {
  default: (text: string) => `
请根据以下内容生成一段传统中国风格的新年祝福语，要求：
- 字数在50字左右
- 中规中矩、大方得体
- 包含传统节日元素和美好祝愿
内容：${text}`,

  elder: (text: string) => `
请根据以下内容生成一段给长辈的新年祝福语，要求：
- 字数在50字左右
- 语气恭敬、用词讲究
- 多用吉祥喜庆的成语
- 适当使用emoji表情，让祝福更温暖
- 体现对长辈的尊重和关爱
内容：${text}`,

  friend: (text: string) => `
请根据以下内容生成一段给好友的新年祝福语，要求：
- 字数在50字左右
- 语气轻松活泼、略带幽默
- 可以用一些俏皮的网络用语
- 体现朋友间的亲密和真诚
- 祝福要有新意，避免老套
内容：${text}`,

  colleague: (text: string) => `
请根据以下内容生成一段给同事的新年祝福语，要求：
- 字数在30字左右，简短精炼
- 语气正式得体、专业大方
- 可以适当融入职场元素
- 保持商务化的礼貌距离
- 祝福要积极向上
内容：${text}`,
} as const

export type PromptType = keyof typeof PROMPT_TEMPLATES

export const PROMPT_LABELS = {
  default: '传统祝福',
  elder: '给长辈',
  friend: '给好友',
  colleague: '给同事'
} as const
