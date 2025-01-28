<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 优雅淡雅的渐变色组合
const gradients = [
  ['#fdf2f8', '#fbcfe8'], // 淡粉色
  ['#f5f3ff', '#ddd6fe'], // 淡紫色
  ['#ecfeff', '#cffafe'], // 淡青色
  ['#f0fdf4', '#dcfce7'], // 淡绿色
  ['#fff7ed', '#fed7aa'], // 淡橙色
  ['#fef2f2', '#fecaca'], // 淡红色
  ['#fffbeb', '#fde68a'], // 淡金色
  ['#f8fafc', '#e2e8f0'], // 淡蓝灰
  ['#faf5ff', '#e9d5ff'], // 淡紫罗兰
  ['#f0f9ff', '#bae6fd'], // 淡天蓝
  ['#fefce8', '#fef08a'], // 淡柠檬
  ['#fff1f2', '#fecdd3']  // 淡玫瑰
]

// 初始化时随机选择一个渐变色
const colorIndex = ref(Math.floor(Math.random() * gradients.length))

// 切换背景颜色
const changeColor = () => {
  colorIndex.value = (colorIndex.value + 1) % gradients.length
}

// 每30秒切换一次颜色
onMounted(() => {
  setInterval(changeColor, 30000)
})

const backgroundStyle = computed(() => {
  const colors = gradients[colorIndex.value]
  return {
    '--gradient-from': colors[0],
    '--gradient-to': colors[1]
  }
})
</script>

<template>
  <div class="app-container" :style="backgroundStyle">
    <div class="gradient-bg" @dblclick="changeColor"></div>
    <div class="content">
      <ClientOnly>
        <NuxtPage />
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--gradient-from), var(--gradient-to));
  z-index: 0;
  transition: background 0.3s ease;
  cursor: pointer;
}

.content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}
</style>
