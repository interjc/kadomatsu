<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 喜庆艳丽的渐变色组合
const gradients = [
  ['#fff1f2', '#e11d48'], // 玫红色
  ['#fff7ed', '#ea580c'], // 橙红色
  ['#fef2f2', '#dc2626'], // 中国红
  ['#fdf4ff', '#c026d3'], // 艳紫色
  ['#fff1f2', '#be123c'], // 玫瑰红
  ['#fffbeb', '#d97706'], // 金黄色
  ['#fff1f2', '#db2777'], // 粉红色
  ['#fef2f2', '#b91c1c'], // 大红色
  ['#fff7ed', '#c2410c'], // 橘红色
  ['#fdf4ff', '#a21caf']  // 紫红色
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
