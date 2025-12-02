<template>
  <div class="theme-toggle-container">
    <!-- 紧凑模式：仅显示图标按钮 -->
    <button
      v-if="mode === 'compact'"
      class="theme-toggle-button"
      :title="themeTooltip"
      @click="handleCycleTheme"
    >
      <transition mode="out-in" name="fade">
        <i v-if="themeStore.themeMode === 'light'" key="sun" class="fas fa-sun" />
        <i v-else-if="themeStore.themeMode === 'dark'" key="moon" class="fas fa-moon" />
        <i v-else key="auto" class="fas fa-adjust" />
      </transition>
    </button>

    <!-- 下拉菜单模式 - 改为创意切换开关 -->
    <div v-else-if="mode === 'dropdown'" class="theme-switch-wrapper">
      <button
        class="theme-switch"
        :class="{
          'is-dark': themeStore.themeMode === 'dark',
          'is-auto': themeStore.themeMode === 'auto'
        }"
        :title="themeTooltip"
        @click="handleCycleTheme"
      >
        <!-- 背景装饰 -->
        <div class="switch-bg">
          <div class="stars">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="clouds">
            <span></span>
            <span></span>
          </div>
        </div>

        <!-- 切换滑块 -->
        <div class="switch-handle">
          <div class="handle-icon">
            <i v-if="themeStore.themeMode === 'light'" class="fas fa-sun text-amber-500" />
            <i v-else-if="themeStore.themeMode === 'dark'" class="fas fa-moon text-indigo-500" />
            <i v-else class="fas fa-adjust text-blue-500" />
          </div>
        </div>
      </button>
    </div>

    <!-- 分段按钮模式 -->
    <div v-else-if="mode === 'segmented'" class="theme-segmented">
      <button
        v-for="option in themeOptions"
        :key="option.value"
        class="theme-segment"
        :class="{ active: themeStore.themeMode === option.value }"
        :title="option.label"
        @click="selectTheme(option.value)"
      >
        <i :class="option.icon" />
        <span v-if="showLabel" class="ml-1 hidden sm:inline">{{ option.shortLabel }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

// Props
defineProps({
  // 显示模式：compact（紧凑）、dropdown（下拉）、segmented（分段）
  mode: {
    type: String,
    default: 'compact',
    validator: (value) => ['compact', 'dropdown', 'segmented'].includes(value)
  },
  // 是否显示文字标签
  showLabel: {
    type: Boolean,
    default: false
  }
})

// Store
const themeStore = useThemeStore()

// 主题选项配置
const themeOptions = [
  {
    value: 'light',
    label: '浅色模式',
    shortLabel: '浅色',
    icon: 'fas fa-sun'
  },
  {
    value: 'dark',
    label: '深色模式',
    shortLabel: '深色',
    icon: 'fas fa-moon'
  },
  {
    value: 'auto',
    label: '跟随系统',
    shortLabel: '自动',
    icon: 'fas fa-adjust'
  }
]

// 计算属性
const themeTooltip = computed(() => {
  const current = themeOptions.find((opt) => opt.value === themeStore.themeMode)
  return current ? `点击切换主题 - ${current.label}` : '切换主题'
})

// 方法
const handleCycleTheme = () => {
  themeStore.cycleThemeMode()
}

const selectTheme = (mode) => {
  themeStore.setThemeMode(mode)
}
</script>

<style scoped>
/* 容器样式 */
.theme-toggle-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* 基础按钮样式 - 更简洁优雅 */
.theme-toggle-button {
  @apply flex items-center justify-center;
  @apply h-9 w-9 rounded-full;
  @apply bg-white/90 dark:bg-gray-800/90;
  @apply hover:bg-white dark:hover:bg-gray-700;
  @apply text-gray-600 dark:text-gray-300;
  @apply border border-gray-200/50 dark:border-gray-600/50;
  @apply transition-all duration-200 ease-out;
  @apply shadow-sm hover:shadow-md;
  position: relative;
  overflow: hidden;
}

/* 简化的 hover 效果 */
.theme-toggle-button:hover {
  transform: translateY(-1px);
}

.theme-toggle-button:active {
  transform: translateY(0);
}

/* 图标样式优化 - 简洁高效 */
.theme-toggle-button i {
  @apply text-sm;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-toggle-button:hover i {
  transform: rotate(15deg) scale(1.1);
}

/* 不同主题的图标颜色 */
.theme-toggle-button i.fa-sun {
  @apply text-amber-500;
}

.theme-toggle-button i.fa-moon {
  @apply text-indigo-500;
}

.theme-toggle-button i.fa-adjust {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 创意切换开关样式 */
.theme-switch-wrapper {
  @apply inline-flex items-center;
}

.theme-switch {
  @apply relative;
  width: 68px;
  height: 34px;
  border-radius: 20px;
  padding: 3px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); /* 浅色模式背景：清新的蓝色 */
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 4px 10px rgba(59, 130, 246, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  align-items: center;
}

.theme-switch:hover {
  box-shadow:
    0 6px 15px rgba(59, 130, 246, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.theme-switch:active {
  transform: translateY(0);
}

/* 深色模式样式 */
.theme-switch.is-dark {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); /* 深色模式背景：深邃的靛蓝 */
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow:
    0 4px 10px rgba(79, 70, 229, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 自动模式样式 */
.theme-switch.is-auto {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%); /* 自动模式背景：自然的翠绿 */
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow:
    0 4px 10px rgba(16, 185, 129, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 背景装饰 */
.switch-bg {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
}

/* 切换滑块 */
.switch-handle {
  position: absolute;
  width: 26px;
  height: 26px;
  background: white;
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  left: 3px; /* 起始位置 */
  z-index: 2;
}

/* 滑块位置 */
.theme-switch.is-dark .switch-handle {
  transform: translateX(34px); /* 移动距离 = 容器宽度(68) - 滑块宽度(26) - padding(3*2) - offset adjustment */
}

.theme-switch.is-auto .switch-handle {
  transform: translateX(17px); /* 居中位置 */
}

/* 滑块图标 */
.handle-icon {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.handle-icon i {
  font-size: 12px;
  transition: all 0.3s ease;
}

/* 分段按钮样式 */
.theme-segmented {
  @apply inline-flex;
  @apply bg-gray-100/80 dark:bg-gray-800/80;
  @apply rounded-xl p-1;
  @apply border border-gray-200/50 dark:border-gray-700/50;
  @apply backdrop-blur-sm;
}

.theme-segment {
  @apply px-3 py-1.5;
  @apply text-xs font-medium;
  @apply text-gray-500 dark:text-gray-400;
  @apply transition-all duration-200;
  @apply rounded-lg;
  @apply flex items-center gap-1.5;
  @apply cursor-pointer;
  position: relative;
}

.theme-segment:hover {
  @apply text-gray-700 dark:text-gray-200;
  @apply bg-white/50 dark:bg-gray-700/50;
}

.theme-segment.active {
  @apply bg-white dark:bg-gray-700;
  @apply text-gray-900 dark:text-white;
  @apply shadow-sm;
}

.theme-segment i {
  @apply text-xs;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(-15deg);
}
</style>
