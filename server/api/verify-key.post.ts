export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { key } = body

  // 验证提供的密钥是否与环境变量中的密钥匹配
  return key === process.env.SECRET_KEY
})
