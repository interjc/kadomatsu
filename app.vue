<script setup lang="ts">
const colors = [
  ['#f0f9ff', '#dbeafe'], // 天空蓝
  ['#f5f3ff', '#ddd6fe'], // 淡紫色
  ['#ecfeff', '#cffafe'], // 青色
  ['#f0fdf4', '#dcfce7'], // 翠绿
  ['#fef2f2', '#fee2e2'], // 玫瑰红
  ['#fffbeb', '#fef3c7'], // 明黄
  ['#f8fafc', '#e2e8f0'], // 冷灰
  ['#faf5ff', '#e9d5ff'], // 亮紫
  ['#f0fdfa', '#ccfbf1'], // 蒂芙尼蓝
  ['#fff7ed', '#ffedd5'], // 橙色
  ['#fdf2f8', '#fce7f3'], // 粉红
  ['#f5f5f4', '#e7e5e4']  // 暖灰
]

const currentColorIndex = ref(Math.floor(Math.random() * colors.length))
const nextColorIndex = ref(getRandomDifferentIndex())

function getRandomDifferentIndex() {
  const availableIndices = Array.from({ length: colors.length }, (_, i) => i)
    .filter(i => i !== currentColorIndex.value)
  return availableIndices[Math.floor(Math.random() * availableIndices.length)]
}

// 每60秒更换一次颜色
onMounted(() => {
  setInterval(() => {
    currentColorIndex.value = nextColorIndex.value
    nextColorIndex.value = getRandomDifferentIndex()
  }, 60 * 1000) // 60秒
})

const backgroundStyle = computed(() => {
  const currentColors = colors[currentColorIndex.value]
  const nextColors = colors[nextColorIndex.value]

  return {
    '--current-color-1': currentColors[0],
    '--current-color-2': currentColors[1],
    '--next-color-1': nextColors[0],
    '--next-color-2': nextColors[1]
  }
})
</script>

<template>
  <div class="app-container" :style="backgroundStyle">
    <div class="gradient-bg"></div>
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
  background: linear-gradient(45deg, var(--current-color-1), var(--current-color-2));
  animation: gradientAnimation 10s infinite;
  z-index: 0;
  transition: background 2s ease;
}

.gradient-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, var(--next-color-1), var(--next-color-2));
  opacity: 0;
  transition: opacity 2s ease;
}

.content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

@keyframes gradientAnimation {
  0% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  90% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
