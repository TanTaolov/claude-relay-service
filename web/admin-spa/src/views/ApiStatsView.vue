<template>
  <div class="min-h-screen p-4 md:p-6" :class="isDarkMode ? 'gradient-bg-dark' : 'gradient-bg'">
    <!-- 顶部导航 -->
    <div class="glass-nav mb-6 rounded-3xl p-4 shadow-lg md:mb-8 md:p-5">
      <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
        <LogoTitle
          :loading="oemLoading"
          :logo-src="oemSettings.siteIconData || oemSettings.siteIcon"
          :subtitle="currentTab === 'stats' ? 'API Key 使用统计' : '使用教程'"
          :title="oemSettings.siteName"
        />
        <div class="flex items-center gap-2 md:gap-4">
          <!-- 主题切换按钮 -->
          <div class="flex items-center">
            <ThemeToggle mode="dropdown" />
          </div>

          <!-- 分隔线 -->
          <div
            v-if="oemSettings.ldapEnabled || oemSettings.showAdminButton !== false"
            class="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-50 dark:via-gray-600"
          />

          <!-- 用户登录按钮 (仅在 LDAP 启用时显示) -->
          <router-link
            v-if="oemSettings.ldapEnabled"
            class="user-login-button flex items-center gap-2 rounded-2xl px-4 py-2 text-white transition-all duration-300 md:px-5 md:py-2.5"
            to="/user-login"
          >
            <i class="fas fa-user text-sm md:text-base" />
            <span class="text-xs font-semibold tracking-wide md:text-sm">用户登录</span>
          </router-link>
          <!-- 管理后台按钮 -->
          <router-link
            v-if="oemSettings.showAdminButton !== false"
            class="admin-button-refined flex items-center gap-2 rounded-2xl px-4 py-2 transition-all duration-300 md:px-5 md:py-2.5"
            to="/dashboard"
          >
            <i class="fas fa-shield-alt text-sm md:text-base" />
            <span class="text-xs font-semibold tracking-wide md:text-sm">管理后台</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="mb-6 md:mb-8">
      <div class="flex justify-center">
        <div
          class="inline-flex w-full max-w-md rounded-full border border-white/20 bg-white/10 p-1 shadow-lg backdrop-blur-xl md:w-auto"
        >
          <button
            :class="['tab-pill-button', currentTab === 'stats' ? 'active' : '']"
            @click="currentTab = 'stats'"
          >
            <i class="fas fa-chart-line mr-1 md:mr-2" />
            <span class="text-sm md:text-base">统计查询</span>
          </button>
          <button
            :class="['tab-pill-button', currentTab === 'tutorial' ? 'active' : '']"
            @click="currentTab = 'tutorial'"
          >
            <i class="fas fa-graduation-cap mr-1 md:mr-2" />
            <span class="text-sm md:text-base">使用教程</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 统计内容 -->
    <div v-if="currentTab === 'stats'" class="tab-content">
      <!-- API Key 输入区域 -->
      <ApiKeyInput />

      <!-- 错误提示 -->
      <div v-if="error" class="mb-6 md:mb-8 animate-shake">
        <div
          class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-800 backdrop-blur-sm dark:border-red-500/20 dark:bg-red-500/20 dark:text-red-200 md:text-base flex items-center shadow-lg"
        >
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3 text-red-500">
             <i class="fas fa-exclamation-triangle" />
          </div>
          <div>
            <p class="font-bold">查询出错</p>
            <p>{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- 统计数据展示区域 -->
      <div v-if="statsData" class="fade-in space-y-6">
        
        <!-- 工具栏卡片 -->
        <div class="toolbar-card flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl border border-white/20 bg-white/80 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
           <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <i class="fas fa-clock text-lg" />
              </div>
              <div>
                <span class="block text-sm font-bold text-slate-800 dark:text-slate-100">统计时间范围</span>
                <span class="block text-xs text-slate-500 dark:text-slate-400">选择查看数据的时间跨度</span>
              </div>
           </div>
           
           <div class="flex w-full items-center gap-2 md:w-auto bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
              <button
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                :class="statsPeriod === 'daily' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
                :disabled="loading || modelStatsLoading"
                @click="switchPeriod('daily')"
              >
                <i class="fas fa-calendar-day" />
                今日
              </button>
              <button
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                :class="statsPeriod === 'monthly' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
                :disabled="loading || modelStatsLoading"
                @click="switchPeriod('monthly')"
              >
                <i class="fas fa-calendar-alt" />
                本月
              </button>
           </div>
           
           <!-- 测试按钮 - 仅在单Key模式下显示 -->
            <button
              v-if="!multiKeyMode"
              class="test-btn ml-2 hidden md:flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              :disabled="loading"
              @click="openTestModal"
            >
              <i class="fas fa-vial" />
              <span>连通性测试</span>
            </button>
        </div>

        <!-- 基本信息和统计概览 -->
        <StatsOverview />

        <!-- Token 分布和限制配置 -->
        <div
          class="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2 xl:items-stretch"
        >
          <TokenDistribution class="h-full" />
          <template v-if="multiKeyMode">
            <AggregatedStatsCard class="h-full" />
          </template>
          <template v-else>
            <LimitConfig class="h-full" />
          </template>
        </div>

        <!-- 模型使用统计 -->
        <ModelUsageStats />
        
        <!-- 移动端测试按钮 (底部浮动) -->
        <div v-if="!multiKeyMode" class="fixed bottom-6 right-6 z-50 md:hidden">
           <button 
              class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
              @click="openTestModal"
           >
              <i class="fas fa-vial text-xl"></i>
           </button>
        </div>
      </div>
    </div>

    <!-- 教程内容 -->
    <div v-if="currentTab === 'tutorial'" class="tab-content">
      <div class="glass-strong rounded-3xl shadow-xl overflow-hidden">
        <TutorialView />
      </div>
    </div>

    <!-- API Key 测试弹窗 -->
    <ApiKeyTestModal
      :api-key-name="statsData?.name || ''"
      :api-key-value="apiKey"
      :show="showTestModal"
      @close="closeTestModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'
import { useThemeStore } from '@/stores/theme'
import LogoTitle from '@/components/common/LogoTitle.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import ApiKeyInput from '@/components/apistats/ApiKeyInput.vue'
import StatsOverview from '@/components/apistats/StatsOverview.vue'
import TokenDistribution from '@/components/apistats/TokenDistribution.vue'
import LimitConfig from '@/components/apistats/LimitConfig.vue'
import AggregatedStatsCard from '@/components/apistats/AggregatedStatsCard.vue'
import ModelUsageStats from '@/components/apistats/ModelUsageStats.vue'
import TutorialView from './TutorialView.vue'
import ApiKeyTestModal from '@/components/apikeys/ApiKeyTestModal.vue'

const route = useRoute()
const apiStatsStore = useApiStatsStore()
const themeStore = useThemeStore()

// 当前标签页
const currentTab = ref('stats')

// 主题相关
const isDarkMode = computed(() => themeStore.isDarkMode)

const {
  apiKey,
  apiId,
  loading,
  modelStatsLoading,
  oemLoading,
  error,
  statsPeriod,
  statsData,
  oemSettings,
  multiKeyMode
} = storeToRefs(apiStatsStore)

const { queryStats, switchPeriod, loadStatsWithApiId, loadOemSettings, reset } = apiStatsStore

// 测试弹窗状态
const showTestModal = ref(false)

// 打开测试弹窗
const openTestModal = () => {
  showTestModal.value = true
}

// 关闭测试弹窗
const closeTestModal = () => {
  showTestModal.value = false
}

// 处理键盘快捷键
const handleKeyDown = (event) => {
  // Ctrl/Cmd + Enter 查询
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (!loading.value && apiKey.value.trim()) {
      queryStats()
    }
    event.preventDefault()
  }

  // ESC 清除数据
  if (event.key === 'Escape') {
    reset()
  }
}

// 初始化
onMounted(() => {
  // API Stats Page loaded

  // 初始化主题（因为该页面不在 MainLayout 内）
  themeStore.initTheme()

  // 加载 OEM 设置
  loadOemSettings()

  // 检查 URL 参数
  const urlApiId = route.query.apiId
  const urlApiKey = route.query.apiKey

  if (
    urlApiId &&
    urlApiId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)
  ) {
    // 如果 URL 中有 apiId，直接使用 apiId 加载数据
    apiId.value = urlApiId
    loadStatsWithApiId()
  } else if (urlApiKey && urlApiKey.length > 10) {
    // 向后兼容，支持 apiKey 参数
    apiKey.value = urlApiKey
  }

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
})

// 清理
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// 监听 API Key 变化
watch(apiKey, (newValue) => {
  if (!newValue) {
    apiStatsStore.clearData()
  }
})
</script>

<style scoped>
/* 渐变背景 */
.gradient-bg {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  background-attachment: fixed;
  min-height: 100vh;
  position: relative;
}

.gradient-bg-dark {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  background-attachment: fixed;
  min-height: 100vh;
  position: relative;
}

/* 动态背景装饰 */
.gradient-bg::before, .gradient-bg-dark::before {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: 
    radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 40%);
  z-index: 0;
  pointer-events: none;
  animation: pulse-bg 15s ease-in-out infinite alternate;
}

@keyframes pulse-bg {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

/* 导航栏玻璃态 */
.glass-nav {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 10;
}

:global(.dark) .glass-nav {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}

/* 玻璃态效果 - 通用 */
.glass-strong {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:global(.dark) .glass-strong {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.05);
}

/* 工具栏卡片 */
.toolbar-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.toolbar-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

:global(.dark) .toolbar-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

/* 按钮样式 */
.user-login-button, .admin-button-refined {
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.user-login-button::after, .admin-button-refined::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s;
  z-index: -1;
}

.user-login-button:hover::after, .admin-button-refined:hover::after {
  transform: translateX(100%);
}

.user-login-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.admin-button-refined {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
}

.test-btn {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);
}

/* Tab 按钮 */
.tab-pill-button {
  padding: 0.625rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 浅色模式下Tab按钮文字颜色 */
.gradient-bg .tab-pill-button {
  color: #64748b;
}

.gradient-bg .tab-pill-button:hover {
  background: rgba(255, 255, 255, 0.5);
  color: #334155;
}

.gradient-bg .tab-pill-button.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 深色模式下Tab按钮样式 */
.gradient-bg-dark .tab-pill-button {
  color: #94a3b8;
}

.gradient-bg-dark .tab-pill-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.gradient-bg-dark .tab-pill-button.active {
  background: #334155;
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

/* 动画效果 */
.fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
