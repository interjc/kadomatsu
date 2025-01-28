export default defineNuxtRouteMiddleware(async (to) => {
  // 如果在服务器端，直接返回
  if (process.server) return

  // 如果已经在登录页面，不需要验证
  if (to.path === '/login') return

  // 获取存储的密钥
  const storedKey = localStorage.getItem('secretKey')

  // 如果没有存储的密钥，重定向到登录页
  if (!storedKey) {
    return navigateTo('/login')
  }

  // 验证存储的密钥是否与服务器端的密钥匹配
  try {
    const { data: isValid } = await useFetch('/api/verify-key', {
      method: 'POST',
      body: { key: storedKey }
    })

    if (!isValid.value) {
      // 如果密钥不匹配，清除存储并重定向到登录页
      localStorage.removeItem('secretKey')
      localStorage.removeItem('isAuthenticated')
      return navigateTo('/login')
    }
  } catch (error) {
    // 发生错误时，清除存储并重定向到登录页
    localStorage.removeItem('secretKey')
    localStorage.removeItem('isAuthenticated')
    return navigateTo('/login')
  }
})
