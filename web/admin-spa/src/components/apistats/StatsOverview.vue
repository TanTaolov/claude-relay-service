<template>
  <div class="space-y-6 md:space-y-8">
    <div
      class="grid grid-cols-1 items-start gap-4 md:gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
    >
      <!-- 基础信息 / 批量概要 -->
      <div class="card-section h-full">
        <header class="section-header">
          <div
            class="header-icon-wrapper"
            :class="
              multiKeyMode
                ? 'bg-purple-100 dark:bg-purple-900/30'
                : 'bg-blue-100 dark:bg-blue-900/30'
            "
          >
            <i
              class="header-icon"
              :class="
                multiKeyMode
                  ? 'fas fa-layer-group text-purple-600 dark:text-purple-400'
                  : 'fas fa-info-circle text-blue-600 dark:text-blue-400'
              "
            />
          </div>
          <div>
            <h3 class="header-title">{{ multiKeyMode ? '批量查询概要' : 'API Key 信息' }}</h3>
            <p class="header-subtitle">
              {{ multiKeyMode ? '多Key聚合统计数据' : '当前Key的基础信息' }}
            </p>
          </div>
        </header>

        <div v-if="multiKeyMode && aggregatedStats" class="info-grid">
          <div class="info-item group">
            <div
              class="info-icon bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400"
            >
              <i class="fas fa-key" />
            </div>
            <div>
              <p class="info-label">查询 Keys 数</p>
              <p class="info-value">{{ aggregatedStats.totalKeys }} 个</p>
            </div>
          </div>
          <div class="info-item group">
            <div
              class="info-icon bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400"
            >
              <i class="fas fa-check-circle" />
            </div>
            <div>
              <p class="info-label">有效 Keys 数</p>
              <p class="info-value text-emerald-600 dark:text-emerald-400">
                {{ aggregatedStats.activeKeys }} 个
              </p>
            </div>
          </div>
          <div v-if="invalidKeys.length > 0" class="info-item group">
            <div class="info-icon bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400">
              <i class="fas fa-times-circle" />
            </div>
            <div>
              <p class="info-label">无效 Keys 数</p>
              <p class="info-value text-red-500 dark:text-red-400">{{ invalidKeys.length }} 个</p>
            </div>
          </div>
          <div class="info-item group">
            <div class="info-icon bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
              <i class="fas fa-exchange-alt" />
            </div>
            <div>
              <p class="info-label">总请求数</p>
              <p class="info-value">{{ formatNumber(aggregatedStats.usage.requests) }}</p>
            </div>
          </div>
          <div class="info-item group">
            <div
              class="info-icon bg-violet-50 text-violet-500 dark:bg-violet-900/20 dark:text-violet-400"
            >
              <i class="fas fa-coins" />
            </div>
            <div>
              <p class="info-label">总 Token 数</p>
              <p class="info-value">{{ formatNumber(aggregatedStats.usage.allTokens) }}</p>
            </div>
          </div>
          <div class="info-item group">
            <div
              class="info-icon bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400"
            >
              <i class="fas fa-dollar-sign" />
            </div>
            <div>
              <p class="info-label">总费用</p>
              <p class="info-value text-indigo-600 dark:text-indigo-300">
                {{ aggregatedStats.usage.formattedCost }}
              </p>
            </div>
          </div>
          <div
            v-if="individualStats.length > 1"
            class="info-item !flex-col !items-start gap-3 xl:col-span-2"
          >
            <p class="info-label">Top 3 贡献占比</p>
            <div class="w-full space-y-2">
              <div v-for="stat in topContributors" :key="stat.apiId" class="contributor-item">
                <div class="flex min-w-0 items-center gap-2">
                  <div class="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span class="truncate text-xs font-medium">{{ stat.name }}</span>
                </div>
                <span class="font-mono text-xs font-bold text-slate-700 dark:text-slate-200"
                  >{{ calculateContribution(stat) }}%</span
                >
              </div>
            </div>
          </div>
        </div>

        <div v-else class="info-grid">
          <div class="info-item group">
            <div class="info-icon bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <i class="fas fa-signature" />
            </div>
            <div class="min-w-0">
              <p class="info-label">名称</p>
              <p class="info-value truncate" :title="statsData.name">{{ statsData.name }}</p>
            </div>
          </div>
          <div class="info-item group">
            <div
              class="info-icon"
              :class="
                statsData.isActive
                  ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'
              "
            >
              <i :class="statsData.isActive ? 'fas fa-check-circle' : 'fas fa-times-circle'" />
            </div>
            <div>
              <p class="info-label">状态</p>
              <p
                class="info-value font-semibold"
                :class="
                  statsData.isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400'
                "
              >
                {{ statsData.isActive ? '活跃' : '已停用' }}
              </p>
            </div>
          </div>
          <div class="info-item group">
            <div
              class="info-icon bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400"
            >
              <i class="fas fa-shield-alt" />
            </div>
            <div>
              <p class="info-label">权限</p>
              <p class="info-value">{{ formatPermissions(statsData.permissions) }}</p>
            </div>
          </div>
          <div class="info-item group">
            <div class="info-icon bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
              <i class="fas fa-calendar-plus" />
            </div>
            <div>
              <p class="info-label">创建时间</p>
              <p class="info-value text-xs">{{ formatDate(statsData.createdAt) }}</p>
            </div>
          </div>
          <div class="info-item group xl:col-span-2">
            <div
              class="info-icon bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400"
            >
              <i class="fas fa-hourglass-half" />
            </div>
            <div>
              <p class="info-label">过期时间</p>
              <div class="info-value">
                <template
                  v-if="statsData.expirationMode === 'activation' && !statsData.isActivated"
                >
                  <span class="font-medium text-amber-600 dark:text-amber-400">
                    <i class="fas fa-pause-circle mr-1" />未激活
                  </span>
                  <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    (首次使用后
                    {{ statsData.activationDays || (statsData.activationUnit === 'hours' ? 24 : 30)
                    }}{{ statsData.activationUnit === 'hours' ? '小时' : '天' }}过期)
                  </span>
                </template>
                <template v-else-if="statsData.expiresAt">
                  <span
                    v-if="isApiKeyExpired(statsData.expiresAt)"
                    class="font-medium text-red-500 dark:text-red-400"
                  >
                    <i class="fas fa-exclamation-circle mr-1" />已过期
                  </span>
                  <span
                    v-else-if="isApiKeyExpiringSoon(statsData.expiresAt)"
                    class="font-medium text-orange-500 dark:text-orange-400"
                  >
                    <i class="fas fa-clock mr-1" />{{ formatExpireDate(statsData.expiresAt) }}
                  </span>
                  <span v-else>{{ formatExpireDate(statsData.expiresAt) }}</span>
                </template>
                <template v-else>
                  <span class="font-medium text-emerald-600 dark:text-emerald-400">
                    <i class="fas fa-infinity mr-1" />永不过期
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用统计概览 -->
      <div class="card-section h-full">
        <header class="section-header">
          <div class="header-icon-wrapper bg-green-100 dark:bg-green-900/30">
            <i class="header-icon fas fa-chart-bar text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 class="header-title">使用统计概览</h3>
            <p class="header-subtitle">
              {{ statsPeriod === 'daily' ? '今日实时数据' : '本月累计数据' }}
            </p>
          </div>
          <span class="header-tag ml-auto">{{ statsPeriod === 'daily' ? '今日' : '本月' }}</span>
        </header>
        <div class="metric-grid">
          <div class="metric-card group">
            <div
              class="metric-icon-wrapper bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400"
            >
              <i class="fas fa-exchange-alt" />
            </div>
            <div class="metric-content">
              <p class="metric-value text-emerald-600 dark:text-emerald-400">
                {{ formatNumber(currentPeriodData.requests) }}
              </p>
              <p class="metric-label">总请求数</p>
            </div>
          </div>
          <div class="metric-card group">
            <div
              class="metric-icon-wrapper bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <i class="fas fa-coins" />
            </div>
            <div class="metric-content">
              <p class="metric-value text-blue-600 dark:text-blue-400">
                {{ formatNumber(currentPeriodData.allTokens) }}
              </p>
              <p class="metric-label">总Token数</p>
            </div>
          </div>
          <div class="metric-card group">
            <div
              class="metric-icon-wrapper bg-violet-50 text-violet-500 dark:bg-violet-900/20 dark:text-violet-400"
            >
              <i class="fas fa-dollar-sign" />
            </div>
            <div class="metric-content">
              <p class="metric-value text-violet-600 dark:text-violet-400">
                {{ currentPeriodData.formattedCost || '$0.000000' }}
              </p>
              <p class="metric-label">预估费用</p>
            </div>
          </div>
          <div class="metric-card group">
            <div
              class="metric-icon-wrapper bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400"
            >
              <i class="fas fa-arrow-right" />
            </div>
            <div class="metric-content">
              <p class="metric-value text-amber-600 dark:text-amber-400">
                {{ formatNumber(currentPeriodData.inputTokens) }}
              </p>
              <p class="metric-label">输入Token</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 专属账号运行状态，仅在单 key 且存在绑定时显示 -->
    <div v-if="!multiKeyMode && boundAccountList.length > 0" class="card-section">
      <header class="section-header">
        <div class="header-icon-wrapper bg-indigo-100 dark:bg-indigo-900/30">
          <i class="header-icon fas fa-plug text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 class="header-title">专属账号运行状态</h3>
          <p class="header-subtitle">实时绑定的后端账号状态</p>
        </div>
        <span class="header-tag ml-auto">
          <span class="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
          实时更新
        </span>
      </header>

      <div class="grid grid-cols-1 gap-4 md:gap-6" :class="accountGridClass">
        <div
          v-for="account in boundAccountList"
          :key="account.id || account.key"
          class="account-card group"
        >
          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span
                class="account-icon shadow-lg shadow-indigo-500/20"
                :class="account.platform === 'claude' ? 'icon-claude' : 'icon-openai'"
              >
                <i :class="account.platform === 'claude' ? 'fas fa-meteor' : 'fas fa-robot'" />
              </span>
              <div>
                <p class="account-name">{{ getAccountLabel(account) }}</p>
                <p class="account-sub">
                  {{ account.platform === 'claude' ? '会话窗口' : '额度窗口' }}
                </p>
              </div>
            </div>
            <div
              v-if="getRateLimitDisplay(account.rateLimitStatus)"
              :class="['rate-badge', getRateLimitDisplay(account.rateLimitStatus).class]"
            >
              <i class="fas fa-tachometer-alt mr-1" />
              {{ getRateLimitDisplay(account.rateLimitStatus).text }}
            </div>
          </div>

          <div v-if="account.platform === 'claude'" class="mt-3 space-y-3">
            <div class="progress-container">
              <div class="mb-1 flex justify-between text-xs">
                <span class="font-medium text-slate-500 dark:text-slate-400">窗口使用率</span>
                <span class="font-bold text-slate-700 dark:text-slate-200"
                  >{{
                    Math.min(100, Math.max(0, Math.round(account.sessionWindow?.progress || 0)))
                  }}%</span
                >
              </div>
              <div class="progress-track">
                <div
                  class="progress-bar shadow-sm"
                  :class="
                    getSessionProgressBarClass(account.sessionWindow?.sessionWindowStatus, account)
                  "
                  :style="{
                    width: `${Math.min(100, Math.max(0, account.sessionWindow?.progress || 0))}%`
                  }"
                />
              </div>
            </div>
            <div
              class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400"
            >
              <div class="flex items-center gap-1.5">
                <i class="far fa-clock"></i>
                <span>
                  {{
                    formatSessionWindowRange(
                      account.sessionWindow?.windowStart,
                      account.sessionWindow?.windowEnd
                    )
                  }}
                </span>
              </div>
              <span
                v-if="account.sessionWindow?.remainingTime > 0"
                class="rounded bg-indigo-50 px-2 py-0.5 font-medium text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
              >
                剩余 {{ formatSessionRemaining(account.sessionWindow.remainingTime) }}
              </span>
            </div>
          </div>

          <div v-else-if="account.platform === 'openai'" class="mt-3">
            <div v-if="account.codexUsage" class="space-y-3">
              <div
                v-for="type in ['primary', 'secondary']"
                :key="`${account.key}-${type}`"
                class="quota-row"
              >
                <div class="quota-header">
                  <span class="quota-tag" :class="type === 'primary' ? 'tag-indigo' : 'tag-blue'">
                    {{ getCodexWindowLabel(type) }}
                  </span>
                  <span class="quota-percent">
                    {{ formatCodexUsagePercent(account.codexUsage?.[type]) }}
                  </span>
                </div>
                <div class="progress-track mt-2">
                  <div
                    class="progress-bar shadow-sm"
                    :class="getCodexUsageBarClass(account.codexUsage?.[type])"
                    :style="{ width: getCodexUsageWidth(account.codexUsage?.[type]) }"
                  />
                </div>
                <div class="quota-foot">
                  <i class="fas fa-history mr-1"></i>
                  重置剩余 {{ formatCodexRemaining(account.codexUsage?.[type]) }}
                </div>
              </div>
            </div>
            <div
              v-else
              class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            >
              暂无额度使用数据
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-unused-vars */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { useApiStatsStore } from '@/stores/apistats'

const apiStatsStore = useApiStatsStore()
const {
  statsData,
  statsPeriod,
  currentPeriodData,
  multiKeyMode,
  aggregatedStats,
  individualStats,
  invalidKeys
} = storeToRefs(apiStatsStore)

const topContributors = computed(() => {
  if (!individualStats.value || individualStats.value.length === 0) return []
  return [...individualStats.value]
    .sort((a, b) => (b.usage?.allTokens || 0) - (a.usage?.allTokens || 0))
    .slice(0, 3)
})

const calculateContribution = (stat) => {
  if (!aggregatedStats.value || !aggregatedStats.value.usage.allTokens) return 0
  const percentage = ((stat.usage?.allTokens || 0) / aggregatedStats.value.usage.allTokens) * 100
  return percentage.toFixed(1)
}

const formatDate = (dateString) => {
  if (!dateString) return '无'
  try {
    return dayjs(dateString).format('YYYY年MM月DD日 HH:mm')
  } catch (error) {
    return '格式错误'
  }
}

const formatExpireDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isApiKeyExpired = (expiresAt) => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

const isApiKeyExpiringSoon = (expiresAt) => {
  if (!expiresAt) return false
  const expireDate = new Date(expiresAt)
  const now = new Date()
  const daysUntilExpire = (expireDate - now) / (1000 * 60 * 60 * 24)
  return daysUntilExpire > 0 && daysUntilExpire <= 7
}

const formatNumber = (num) => {
  if (typeof num !== 'number') num = parseInt(num) || 0
  if (num === 0) return '0'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toLocaleString()
}

const formatPermissions = (permissions) => {
  const map = {
    claude: 'Claude',
    gemini: 'Gemini',
    all: '全部模型'
  }
  return map[permissions] || permissions || '未知'
}

const boundAccountList = computed(() => {
  const accounts = statsData.value?.accounts?.details
  if (!accounts) return []
  const result = []
  if (accounts.claude && accounts.claude.accountType === 'dedicated') {
    result.push({ key: 'claude', ...accounts.claude })
  }
  if (accounts.openai && accounts.openai.accountType === 'dedicated') {
    result.push({ key: 'openai', ...accounts.openai })
  }
  return result
})

const accountGridClass = computed(() => {
  const count = boundAccountList.value.length
  if (count <= 1) {
    return 'md:grid-cols-1 lg:grid-cols-1'
  }
  if (count === 2) {
    return 'md:grid-cols-2'
  }
  return 'md:grid-cols-2 xl:grid-cols-3'
})

const getAccountLabel = (account) => {
  if (!account) return '专属账号'
  return account.platform === 'openai' ? 'OpenAI 专属账号' : 'Claude 专属账号'
}

const formatRateLimitTime = (minutes) => {
  if (!minutes || minutes <= 0) return ''
  const total = Math.floor(minutes)
  const days = Math.floor(total / 1440)
  const hours = Math.floor((total % 1440) / 60)
  const mins = total % 60
  if (days > 0) return hours > 0 ? `${days}天${hours}小时` : `${days}天`
  if (hours > 0) return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  return `${mins}分钟`
}

const getRateLimitDisplay = (status) => {
  if (!status) {
    return {
      text: '状态未知',
      class: 'text-gray-400'
    }
  }
  if (status.isRateLimited) {
    const remaining = formatRateLimitTime(status.minutesRemaining)
    const suffix = remaining ? ` · 剩余约 ${remaining}` : ''
    return {
      text: `限流中${suffix}`,
      class: 'text-red-500 dark:text-red-400'
    }
  }
  return {
    text: '未限流',
    class: 'text-green-600 dark:text-emerald-400'
  }
}

const formatSessionWindowRange = (start, end) => {
  if (!start || !end) return '暂无时间窗口信息'
  const s = new Date(start)
  const e = new Date(end)
  const fmt = (d) => `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`
  return `${fmt(s)} - ${fmt(e)}`
}

const formatSessionRemaining = (minutes) => {
  if (!minutes || minutes <= 0) return ''
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

const getSessionProgressBarClass = (status, account) => {
  if (!status) return 'bg-gradient-to-r from-blue-500 to-indigo-500'
  if (account?.rateLimitStatus?.isRateLimited) return 'bg-gradient-to-r from-red-500 to-red-600'
  const normalized = String(status).toLowerCase()
  if (normalized === 'rejected') return 'bg-gradient-to-r from-red-500 to-red-600'
  if (normalized === 'allowed_warning') return 'bg-gradient-to-r from-yellow-500 to-orange-500'
  return 'bg-gradient-to-r from-blue-500 to-indigo-500'
}

const normalizeCodexUsagePercent = (usageItem) => {
  if (!usageItem) return null
  const percent =
    typeof usageItem.usedPercent === 'number' && !Number.isNaN(usageItem.usedPercent)
      ? usageItem.usedPercent
      : null
  const resetAfterSeconds =
    typeof usageItem.resetAfterSeconds === 'number' && !Number.isNaN(usageItem.resetAfterSeconds)
      ? usageItem.resetAfterSeconds
      : null
  const remainingSeconds =
    typeof usageItem.remainingSeconds === 'number' ? usageItem.remainingSeconds : null
  const resetAtMs = usageItem.resetAt ? Date.parse(usageItem.resetAt) : null
  const resetElapsed =
    resetAfterSeconds !== null &&
    ((remainingSeconds !== null && remainingSeconds <= 0) ||
      (resetAtMs !== null && !Number.isNaN(resetAtMs) && Date.now() >= resetAtMs))
  if (resetElapsed) return 0
  if (percent === null) return null
  return Math.max(0, Math.min(100, percent))
}

const getCodexUsageBarClass = (usageItem) => {
  const percent = normalizeCodexUsagePercent(usageItem)
  if (percent === null) return 'bg-gradient-to-r from-gray-300 to-gray-400'
  if (percent >= 90) return 'bg-gradient-to-r from-red-500 to-red-600'
  if (percent >= 75) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
  return 'bg-gradient-to-r from-emerald-500 to-teal-500'
}

const getCodexUsageWidth = (usageItem) => {
  const percent = normalizeCodexUsagePercent(usageItem)
  if (percent === null) return '0%'
  return `${percent}%`
}

const formatCodexUsagePercent = (usageItem) => {
  const percent = normalizeCodexUsagePercent(usageItem)
  if (percent === null) return '--'
  return `${percent.toFixed(1)}%`
}

const formatCodexRemaining = (usageItem) => {
  if (!usageItem) return '--'
  let seconds = usageItem.remainingSeconds
  if (seconds === null || seconds === undefined) {
    seconds = usageItem.resetAfterSeconds
  }
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) {
    return '--'
  }
  seconds = Math.max(0, Math.floor(Number(seconds)))
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (days > 0) return hours > 0 ? `${days}天${hours}小时` : `${days}天`
  if (hours > 0) return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
  if (minutes > 0) return `${minutes}分钟`
  return `${secs}秒`
}

const getCodexWindowLabel = (type) => (type === 'secondary' ? '周限' : '5h')
</script>

<style scoped>
.card-section {
  @apply flex h-full flex-col rounded-3xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/80;
}

.card-section:hover {
  @apply -translate-y-0.5 transform shadow-xl;
}

.section-header {
  @apply mb-6 flex items-center gap-4;
}

.header-icon-wrapper {
  @apply flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300;
}

.card-section:hover .header-icon-wrapper {
  @apply rotate-3 scale-110;
}

.header-icon {
  @apply text-xl;
}

.header-title {
  @apply text-lg font-bold text-slate-800 dark:text-slate-100;
}

.header-subtitle {
  @apply mt-0.5 text-xs text-slate-500 dark:text-slate-400;
}

.header-tag {
  @apply rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300;
}

.info-grid {
  @apply grid gap-4;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .info-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.info-item {
  @apply flex items-center gap-3 rounded-2xl border border-slate-200/50 bg-white/50 p-4 transition-all duration-300 dark:border-slate-700/50 dark:bg-slate-800/40;
}

.info-item:hover {
  @apply border-slate-300 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800;
}

.info-icon {
  @apply flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300;
}

.info-item:hover .info-icon {
  @apply scale-110;
}

.info-label {
  @apply text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400;
}

.info-value {
  @apply mt-0.5 font-mono text-sm font-semibold text-slate-800 dark:text-slate-100;
}

.contributor-item {
  @apply flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700;
}

.metric-grid {
  @apply grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4;
}

.metric-card {
  @apply flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/50 bg-white/50 p-6 text-center transition-all duration-300 dark:border-slate-700/50 dark:bg-slate-800/40;
}

.metric-card:hover {
  @apply -translate-y-1 transform border-slate-300 bg-white shadow-md dark:border-slate-600 dark:bg-slate-800;
}

.metric-icon-wrapper {
  @apply mb-1 flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-all duration-300;
}

.metric-card:hover .metric-icon-wrapper {
  @apply rotate-6 scale-110;
}

.metric-value {
  @apply font-mono text-xl font-bold tracking-tight md:text-2xl;
}

.metric-label {
  @apply text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400;
}

.account-card {
  @apply rounded-2xl border border-slate-200/50 bg-white/60 p-5 shadow-sm transition-all duration-300 dark:border-slate-700/50 dark:bg-slate-800/50;
}

.account-card:hover {
  @apply border-slate-300 bg-white shadow-md dark:border-slate-600 dark:bg-slate-800;
}

.account-icon {
  @apply inline-flex h-12 w-12 items-center justify-center rounded-2xl text-lg text-white transition-transform duration-300;
}

.account-card:hover .account-icon {
  @apply rotate-3 scale-110;
}

.icon-claude {
  @apply bg-gradient-to-br from-orange-500 to-red-600;
}

.icon-openai {
  @apply bg-gradient-to-br from-teal-400 to-emerald-600;
}

.account-name {
  @apply text-base font-bold text-slate-800 dark:text-slate-100;
}

.account-sub {
  @apply text-xs font-medium text-slate-500 dark:text-slate-400;
}

.rate-badge {
  @apply rounded-full px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-sm;
}

.progress-container {
  @apply mb-2;
}

.progress-track {
  @apply h-2.5 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700/50 dark:bg-slate-700/50;
}

.progress-bar {
  @apply h-full rounded-full transition-all duration-500 ease-out;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
  animation: progress-stripe 1s linear infinite;
}

@keyframes progress-stripe {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}

.quota-row {
  @apply rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-white dark:border-slate-700/30 dark:bg-slate-800/30 dark:hover:bg-slate-800;
}

.quota-header {
  @apply mb-1 flex items-center justify-between;
}

.quota-tag {
  @apply inline-flex items-center justify-center rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider;
}

.tag-indigo {
  @apply bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300;
}

.tag-blue {
  @apply bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300;
}

.quota-percent {
  @apply font-mono text-xs font-bold text-slate-700 dark:text-slate-200;
}

.quota-foot {
  @apply mt-2 flex items-center justify-end text-[10px] font-medium text-slate-400 dark:text-slate-500;
}
</style>
