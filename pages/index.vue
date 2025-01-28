<script setup lang="ts">
import { type PromptType, PROMPT_LABELS } from '~/constants/prompts'

const inputText = ref('')
const isLoading = ref(false)
const selectedType = ref<PromptType>('default')
const messages = ref<Array<{ type: 'user' | 'assistant'; content: string }>>([])
const copyTips = ref<{ [key: number]: boolean }>({})
const toast = useToast()

const promptTypes = PROMPT_LABELS

async function copyToClipboard(text: string, index: number) {
  try {
    await navigator.clipboard.writeText(text)
    copyTips.value[index] = true
    setTimeout(() => {
      copyTips.value[index] = false
    }, 2000)
  } catch (error) {
    toast.add({
      title: '复制失败',
      color: 'red'
    })
  }
}

async function handleSend() {
  if (!inputText.value.trim()) {
    toast.add({
      title: '输入不能为空',
      color: 'red'
    })
    return
  }

  messages.value.push({ type: 'user', content: inputText.value })
  const userMessage = inputText.value
  inputText.value = ''
  isLoading.value = true

  try {
    // 添加一个空的助手消息
    const messageIndex = messages.value.length
    messages.value.push({
      type: 'assistant',
      content: ''
    })

    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        text: userMessage,
        type: selectedType.value
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) throw new Error('请求失败')

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('无法读取响应')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.trim()) continue
        const text = line.replace('data: ', '').trim()

        if (text === '[DONE]') {
          isLoading.value = false
          break
        }

        messages.value[messageIndex].content += text
      }
    }
  } catch (error: unknown) {
    toast.add({
      title: '生成失败',
      description: error instanceof Error ? error.message : '未知错误',
      color: 'red'
    })
    // 如果出错，移除空消息
    if (messages.value[messages.value.length - 1]?.content === '') {
      messages.value.pop()
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- 头部 -->
    <div class="bg-white/60 backdrop-blur-md border-b shadow-sm sticky top-0 z-10">
      <div class="max-w-[640px] mx-auto px-4 py-3">
        <h1 class="text-xl font-semibold text-gray-800">新年祝福小助手</h1>
      </div>
    </div>

    <!-- 聊天内容区 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 max-w-[640px] mx-auto w-full">
      <div v-for="(message, index) in messages" :key="index" class="flex flex-col">
        <div
          :class="[
            'max-w-[80%] p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg',
            message.type === 'user'
              ? 'ml-auto bg-blue-500/85 backdrop-blur-md text-white'
              : 'mr-auto bg-white/70 backdrop-blur-md shadow-sm hover:bg-white/80'
          ]"
          @click="copyToClipboard(message.content, index)"
        >
          <pre class="whitespace-pre-wrap">{{ message.content }}</pre>
        </div>
        <small
          v-if="copyTips[index]"
          :class="[
            'text-blue-600 mt-1 transition-opacity duration-200 font-medium',
            message.type === 'user' ? 'ml-auto' : 'mr-auto'
          ]"
        >
          已复制到剪贴板
        </small>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="sticky bottom-0 bg-white/60 backdrop-blur-md border-t shadow-sm z-10">
      <div class="max-w-[640px] mx-auto p-4">
        <div class="flex gap-2">
          <select
            v-model="selectedType"
            class="w-28 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-colors duration-200 hover:bg-white/90"
          >
            <option
              v-for="(label, type) in promptTypes"
              :key="type"
              :value="type"
            >
              {{ label }}
            </option>
          </select>

          <textarea
            v-model="inputText"
            class="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-colors duration-200 hover:bg-white/90"
            :placeholder="'请输入需要生成' + promptTypes[selectedType] + '的相关文字...'"
            rows="1"
            @keydown.enter.prevent="handleSend"
          ></textarea>

          <button
            @click="handleSend"
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-500/90 backdrop-blur-sm text-white rounded-lg hover:bg-blue-600/90 disabled:bg-gray-400/90 transition-colors duration-200 font-medium"
          >
            <span v-if="isLoading">发送中...</span>
            <span v-else>发送</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  resize: none;
  min-height: 40px;
  max-height: 200px;
  overflow-y: auto;
}

/* 自定义滚动条样式 */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
</style>
