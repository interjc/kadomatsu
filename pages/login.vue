<script setup lang="ts">
const router = useRouter()
const key = ref('')
const error = ref('')

const handleSubmit = async () => {
  try {
    // 验证密钥是否正确
    const { data: isValid } = await useFetch('/api/verify-key', {
      method: 'POST',
      body: { key: key.value }
    })

    if (isValid.value) {
      // 将密钥和认证状态存储在 localStorage 中
      localStorage.setItem('secretKey', key.value)
      localStorage.setItem('isAuthenticated', 'true')
      router.push('/') // 重定向到主页
    } else {
      error.value = '密钥不正确'
    }
  } catch (e) {
    error.value = '验证过程发生错误'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <h2 class="text-center text-3xl font-bold">请输入访问密钥</h2>
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div>
          <input
            v-model="key"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="请输入密钥"
            required
          />
        </div>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button
          type="submit"
          class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          验证
        </button>
      </form>
    </div>
  </div>
</template>
