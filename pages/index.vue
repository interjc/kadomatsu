<script setup lang="ts">
import type { DropdownItem } from '#ui/types'
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

// 转换为下拉菜单选项
const dropdownItems = [
  Object.entries(promptTypes).map(([value, label]) => ({
    label,
    selected: selectedType.value === value,
    click: () => selectedType.value = value as PromptType
  }))
]

// 监听选中状态变化，更新选中状态
watch(selectedType, () => {
  dropdownItems[0] = Object.entries(promptTypes).map(([value, label]) => ({
    label,
    selected: selectedType.value === value,
    click: () => selectedType.value = value as PromptType
  }))
})

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

    const data = await response.json()
    messages.value[messageIndex].content = data.content

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
  <div class="min-h-screen flex flex-col relative">
    <!-- 头部 -->
    <div class="fixed top-0 left-0 right-0 bg-white/60 backdrop-blur-md border-b border-gray-200 shadow-sm z-20">
      <div class="max-w-[640px] mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-semibold text-gray-800">✨ 新年祝福小助手 🎊</h1>
          <div class="flex items-center gap-3 ml-auto">
            <a
              title="关注 X@interjc"
              href="https://x.com/interjc"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xl text-gray-500 hover:text-gray-600 transition-colors duration-300 pt-1"
            >
              <Icon name="mdi:twitter" />
            </a>
            <a
              title="关注我的公众号 @justinjapan"
              href="https://s.zhaikr.com/vj"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xl text-gray-500 hover:text-gray-600 transition-colors duration-300 pt-1"
            >
              <Icon name="mdi:wechat" />
            </a>
            <a
              title="立即加入课程"
              href="https://justincourse.com"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xl text-gray-500 hover:text-gray-600 transition-colors duration-300 pt-1"
            >
              <Icon name="mdi:school" />
            </a>
            <a
              title="More about Justin"
              href="https://bento.me/interjc"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xl text-gray-500 hover:text-gray-600 transition-colors duration-300 pt-1"
            >
              <Icon name="simple-icons:bento" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天内容区 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 max-w-[640px] mx-auto w-full mt-[60px] mb-[76px]">
      <div v-for="(message, index) in messages" :key="index" class="flex flex-col">
        <div
          :class="[
            'max-w-[80%] p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg backdrop-blur-md',
            message.type === 'user'
              ? 'ml-auto bg-blue-500/75 text-white shadow-blue-500/20'
              : 'mr-auto bg-white/60 dark:bg-gray-800/60 shadow-sm hover:bg-white/70 dark:hover:bg-gray-800/70 text-gray-800 dark:text-gray-100 shadow-gray-500/10'
          ]"
          @click="copyToClipboard(message.content, index)"
        >
          <template v-if="message.type === 'assistant' && !message.content && isLoading">
            <div class="space-y-2">
              <USkeleton class="h-4 w-[190px]" />
              <USkeleton class="h-4 w-[160px]" />
              <USkeleton class="h-4 w-[130px]" />
            </div>
          </template>
          <pre v-else class="whitespace-pre-wrap">{{ message.content }}</pre>
        </div>
        <small
          v-if="copyTips[index]"
          :class="[
            'text-blue-600 dark:text-blue-400 mt-1 transition-opacity duration-200 font-medium',
            message.type === 'user' ? 'ml-auto' : 'mr-auto'
          ]"
        >
          已复制到剪贴板
        </small>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md border-t border-gray-200 shadow-sm z-20">
      <div class="powered-by text-xs text-gray-400 opacity-50 absolute left-1/2 -top-6 transform -translate-x-1/2 whitespace-nowrap">
        Powered by DeepSeek
      </div>
      <div class="max-w-[640px] mx-auto p-4">
        <div class="flex gap-2">
          <UDropdown
            :items="dropdownItems"
            :popper="{ placement: 'top-start' }"
            mode="click"
            :ui="{
              container: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm min-w-[8rem]',
              base: 'relative inline-flex text-left rtl:text-right w-[8rem]',
              trigger: 'inline-flex w-full items-center justify-between px-3 py-2 text-sm gap-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors duration-200 hover:bg-white/90 dark:hover:bg-gray-800/90 text-gray-800 dark:text-gray-100',
              width: 'w-[8rem]',
              height: 'mt-2',
              background: 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
              rounded: 'rounded-lg',
              shadow: 'shadow-lg',
              item: {
                base: 'relative flex items-center gap-2 px-3 py-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
                active: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white',
                selected: 'text-blue-500 dark:text-blue-400',
                disabled: 'cursor-not-allowed opacity-50',
                icon: { base: 'flex-shrink-0 h-4 w-4' },
                label: 'truncate'
              }
            }"
          >
            <span>{{ promptTypes[selectedType] }}</span>
            <template #trigger="{ open }">
              <div class="flex items-center justify-between gap-2 w-full">
                <span class="truncate">{{ promptTypes[selectedType] }}</span>
                <Icon
                  :name="open ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
                  class="w-4 h-4 text-gray-500 dark:text-gray-400"
                />
              </div>
            </template>
          </UDropdown>

          <textarea
            v-model="inputText"
            class="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors duration-200 hover:bg-white/90 dark:hover:bg-gray-800/90 text-gray-800 dark:text-gray-100"
            :placeholder="`发送给${promptTypes[selectedType]}的背景信息，越详细生成越准确`"
            rows="2"
            @keydown.enter.prevent="handleSend"
          ></textarea>

          <button
            @click="handleSend"
            :disabled="false"
            @mouseenter="isHovering = true"
            @mouseleave="isHovering = false"
            class="px-4 py-2 backdrop-blur-sm text-white rounded-lg transition-all duration-200 font-medium"
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
  @apply bg-gray-300 dark:bg-gray-600;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

::placeholder {
  @apply text-gray-400 dark:text-gray-500;
}

/* 确保头部和底部的背景始终是白色半透明 */
.fixed {
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* 确保内容区域在固定头部和底部之间滚动 */
.min-h-screen {
  height: 100vh;
  height: 100dvh;
}

/* 对话框的毛玻璃效果 */
:deep(.max-w-\[80\%\]) {
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* 用户消息特殊效果 */
:deep(.bg-blue-500\/75) {
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.25);
}

/* 助手消息特殊效果 */
:deep(.bg-white\/60) {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.25);
}
</style>
