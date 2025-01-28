<script setup lang="ts">
import { type PromptType, PROMPT_LABELS } from '~/constants/prompts'

const inputText = ref('')
const isLoading = ref(false)
const selectedType = ref<PromptType>('default')
const messages = ref<Array<{ type: 'user' | 'assistant'; content: string }>>([])
const copyTips = ref<{ [key: number]: boolean }>({})
const toast = useToast()
const abortController = ref<AbortController | null>(null)
const isHovering = ref(false)

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

function cancelRequest() {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
    isLoading.value = false

    // 处理最后一条消息
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.type === 'assistant') {
      if (!lastMessage.content.trim()) {
        lastMessage.content = '❌ 生成已取消'
      }
    }
  }
}

async function handleSend() {
  if (isLoading.value) {
    cancelRequest()
    return
  }

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
  abortController.value = new AbortController()

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
      },
      signal: abortController.value.signal
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
    if (error instanceof Error && error.name === 'AbortError') {
      return // 请求被取消，不需要显示错误
    }

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
    abortController.value = null
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- 头部 -->
    <div class="bg-white/60 backdrop-blur-md border-b shadow-sm sticky top-0 z-10">
      <div class="max-w-[640px] mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-800">✨ 新年祝福小助手 🎊</h1>
          <div class="flex items-center gap-3 ml-auto">
            <a
              title="关注 X@interjc"
              href="https://x.com/interjc"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xl text-gray-500 hover:text-gray-600 transition-colors duration-300"
            >
              <Icon name="mdi:twitter" />
            </a>
            <a
              title="关注我的公众号 @justinjapan"
              href="https://s.zhaikr.com/vj"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xl text-gray-500 hover:text-gray-600 transition-colors duration-300"
            >
              <Icon name="mdi:wechat" />
            </a>
            <a
              title="立即加入课程"
              href="https://s.zhaikr.com/vj"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xl text-gray-500 hover:text-gray-600 transition-colors duration-300"
            >
              <Icon name="mdi:school" />
            </a>
            <a
              title="More about Justin"
              href="https://bento.me/interjc"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xl text-gray-500 hover:text-gray-600 transition-colors duration-300"
            >
              <Icon name="simple-icons:bento" />
            </a>
          </div>
        </div>
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
            :disabled="false"
            @mouseenter="isHovering = true"
            @mouseleave="isHovering = false"
            class="px-4 py-2 bg-blue-500/90 backdrop-blur-sm text-white rounded-lg transition-all duration-200 font-medium"
            :class="[
              isLoading
                ? (isHovering ? 'bg-red-500/90 hover:bg-red-600/90' : 'bg-blue-500/90 hover:bg-blue-600/90')
                : 'bg-blue-500/90 hover:bg-blue-600/90'
            ]"
          >
            <span v-if="isLoading">
              {{ isHovering ? '取消生成' : '生成中...' }}
            </span>
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
