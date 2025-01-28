<script setup lang="ts">
const inputText = ref('')
const isLoading = ref(false)
const result = ref(null)
const toast = useToast()

async function handleGenerate() {
  if (!inputText.value.trim()) {
    toast.add({
      title: '输入不能为空',
      color: 'red'
    })
    return
  }

  isLoading.value = true
  try {
    const response = await $fetch('/api/generate', {
      method: 'POST',
      body: {
        text: inputText.value
      }
    })
    result.value = response
  } catch (error) {
    toast.add({
      title: '生成失败',
      description: error.message,
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 头部工具栏 -->
    <div class="bg-white border-b shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold">新年祝福小助手</h1>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="flex-1 flex p-4 gap-4">
      <!-- 左侧输入区域 -->
      <div class="w-1/2 bg-white rounded-lg shadow p-4">
        <h3 class="font-medium mb-4">输入文字</h3>
        <textarea
          v-model="inputText"
          class="w-full h-64 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入新年祝福相关的文字..."
        ></textarea>
        <button
          @click="handleGenerate"
          :disabled="isLoading"
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          <span v-if="isLoading">生成中...</span>
          <span v-else>生成祝福</span>
        </button>
      </div>

      <!-- 右侧结果展示 -->
      <div class="w-1/2 bg-white rounded-lg shadow p-4">
        <h3 class="font-medium mb-4">生成结果</h3>
        <pre
          v-if="result"
          class="h-[calc(100%-3rem)] overflow-auto text-sm text-gray-700 whitespace-pre-wrap"
        >{{ JSON.stringify(result, null, 2) }}</pre>
        <div
          v-else
          class="h-[calc(100%-3rem)] flex items-center justify-center text-gray-500"
        >
          生成结果将显示在这里
        </div>
      </div>
    </div>
  </div>
</template>
