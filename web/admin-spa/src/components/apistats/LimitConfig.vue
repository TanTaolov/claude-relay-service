<template>
  <div class="flex h-full flex-col gap-4 md:gap-6">
    <!-- 限制配置 / 聚合模式提示 -->
    <div class="card-section flex h-full flex-col p-4 md:p-6">
      <h3
        class="mb-6 flex items-center text-lg font-bold text-slate-800 dark:text-slate-100 md:text-xl"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            <i class="fas fa-shield-alt text-lg" />
          </div>
          <span>{{ multiKeyMode ? '限制配置（聚合查询模式）' : '限制配置' }}</span>
        </div>
      </h3>

      <!-- 多 Key 模式下的聚合统计信息 -->
      <div v-if="multiKeyMode && aggregatedStats" class="space-y-4">
        <!-- API Keys 概况 -->
        <div
          class="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30"
        >
          <div class="mb-4 flex items-center justify-between">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <i class="fas fa-layer-group text-blue-500" />
              API Keys 概况
            </span>
            <span
              class="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-bold text-blue-600 shadow-sm dark:bg-slate-800/80 dark:text-blue-300"
            >
              {{ aggregatedStats.activeKeys }}/{{ aggregatedStats.totalKeys }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-2 bg-white/50 rounded-xl dark:bg-slate-800/30">
              <div class="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {{ aggregatedStats.totalKeys }}
              </div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">总计 Keys</div>
            </div>
            <div class="text-center p-2 bg-white/50 rounded-xl dark:bg-slate-800/30">
              <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {{ aggregatedStats.activeKeys }}
              </div>
              <div class="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">激活 Keys</div>
            </div>
          </div>
        </div>

        <!-- 聚合统计数据 -->
        <div
          class="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-5 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800/30"
        >
          <div class="mb-4 flex items-center">
            <div class="h-8 w-8 rounded-lg bg-white/80 flex items-center justify-center text-purple-500 shadow-sm mr-3 dark:bg-slate-800/80">
              <i class="fas fa-chart-pie" />
            </div>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-200">聚合统计摘要</span>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-2 bg-white/40 rounded-lg dark:bg-slate-800/20">
              <span class="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <i class="fas fa-database text-slate-400" />
                总请求数
              </span>
              <span class="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">
                {{ formatNumber(aggregatedStats.usage.requests) }}
              </span>
            </div>
            <div class="flex items-center justify-between p-2 bg-white/40 rounded-lg dark:bg-slate-800/20">
              <span class="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <i class="fas fa-coins text-yellow-500" />
                总 Tokens
              </span>
              <span class="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">
                {{ formatNumber(aggregatedStats.usage.allTokens) }}
              </span>
            </div>
            <div class="flex items-center justify-between p-2 bg-white/40 rounded-lg dark:bg-slate-800/20">
              <span class="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <i class="fas fa-dollar-sign text-emerald-500" />
                总费用
              </span>
              <span class="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">
                {{ aggregatedStats.usage.formattedCost }}
              </span>
            </div>
          </div>
        </div>

        <!-- 无效 Keys 提示 -->
        <div
          v-if="invalidKeys && invalidKeys.length > 0"
          class="rounded-2xl bg-red-50 p-4 text-sm dark:bg-red-900/20 border border-red-100 dark:border-red-800/30"
        >
          <div class="flex items-center gap-3 text-red-700 dark:text-red-300 font-medium">
             <i class="fas fa-exclamation-triangle text-lg" />
             <span>{{ invalidKeys.length }} 个无效的 API Key</span>
          </div>
        </div>

        <!-- 提示信息 -->
        <div
          class="rounded-xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 flex gap-3 items-start leading-relaxed"
        >
          <i class="fas fa-info-circle mt-0.5 flex-shrink-0" />
          <span>每个 API Key 有独立的限制设置，聚合模式下不显示单个限制配置。统计数据仅包含查询成功的 Key。</span>
        </div>
      </div>

      <!-- 仅在单 Key 模式下显示限制配置 -->
      <div v-if="!multiKeyMode" class="space-y-6">
        <!-- 每日费用限制 -->
        <div class="limit-item">
          <div class="mb-3 flex items-center justify-between">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <i class="fas fa-calendar-day text-blue-500"></i>
              每日费用限制
            </span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              <span v-if="statsData.limits.dailyCostLimit > 0">
                ${{ statsData.limits.currentDailyCost.toFixed(4) }} / ${{
                  statsData.limits.dailyCostLimit.toFixed(2)
                }}
              </span>
              <span v-else class="flex items-center gap-1">
                ${{ statsData.limits.currentDailyCost.toFixed(4) }} / <i class="fas fa-infinity" />
              </span>
            </span>
          </div>
          <div class="progress-container">
            <div
              v-if="statsData.limits.dailyCostLimit > 0"
              class="progress-track"
            >
              <div
                class="progress-bar shadow-sm"
                :class="getDailyCostProgressColor()"
                :style="{ width: getDailyCostProgress() + '%' }"
              />
            </div>
            <div v-else class="progress-track">
              <div class="progress-bar bg-emerald-500 w-0" />
            </div>
          </div>
        </div>

        <!-- 总费用限制 -->
        <div class="limit-item">
          <div class="mb-3 flex items-center justify-between">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <i class="fas fa-wallet text-purple-500"></i>
              总费用限制
            </span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              <span v-if="statsData.limits.totalCostLimit > 0">
                ${{ statsData.limits.currentTotalCost.toFixed(4) }} / ${{
                  statsData.limits.totalCostLimit.toFixed(2)
                }}
              </span>
              <span v-else class="flex items-center gap-1">
                ${{ statsData.limits.currentTotalCost.toFixed(4) }} / <i class="fas fa-infinity" />
              </span>
            </span>
          </div>
          <div class="progress-container">
            <div
              v-if="statsData.limits.totalCostLimit > 0"
              class="progress-track"
            >
              <div
                class="progress-bar shadow-sm"
                :class="getTotalCostProgressColor()"
                :style="{ width: getTotalCostProgress() + '%' }"
              />
            </div>
            <div v-else class="progress-track">
              <div class="progress-bar bg-blue-500 w-0" />
            </div>
          </div>
        </div>

        <!-- Opus 模型周费用限制 -->
        <div v-if="statsData.limits.weeklyOpusCostLimit > 0" class="limit-item">
          <div class="mb-3 flex items-center justify-between">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <i class="fas fa-star text-amber-500"></i>
              Opus 周费用限制
            </span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              ${{ statsData.limits.weeklyOpusCost.toFixed(4) }} / ${{
                statsData.limits.weeklyOpusCostLimit.toFixed(2)
              }}
            </span>
          </div>
          <div class="progress-container">
             <div class="progress-track">
              <div
                class="progress-bar shadow-sm"
                :class="getOpusWeeklyCostProgressColor()"
                :style="{ width: getOpusWeeklyCostProgress() + '%' }"
              />
            </div>
          </div>
        </div>

        <!-- 时间窗口限制 -->
        <div
          v-if="
            statsData.limits.rateLimitWindow > 0 &&
            (statsData.limits.rateLimitRequests > 0 ||
              statsData.limits.tokenLimit > 0 ||
              statsData.limits.rateLimitCost > 0)
          "
          class="limit-item bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50"
        >
          <WindowCountdown
            :cost-limit="statsData.limits.rateLimitCost"
            :current-cost="statsData.limits.currentWindowCost"
            :current-requests="statsData.limits.currentWindowRequests"
            :current-tokens="statsData.limits.currentWindowTokens"
            label="时间窗口限制"
            :rate-limit-window="statsData.limits.rateLimitWindow"
            :request-limit="statsData.limits.rateLimitRequests"
            :show-progress="true"
            :show-tooltip="true"
            :token-limit="statsData.limits.tokenLimit"
            :window-end-time="statsData.limits.windowEndTime"
            :window-remaining-seconds="statsData.limits.windowRemainingSeconds"
            :window-start-time="statsData.limits.windowStartTime"
          />

          <div class="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <i class="fas fa-info-circle mt-0.5" />
            <span v-if="statsData.limits.rateLimitCost > 0">
              请求次数和费用限制为"或"的关系，任一达到限制即触发限流
            </span>
            <span v-else-if="statsData.limits.tokenLimit > 0">
              请求次数和Token使用量为"或"的关系，任一达到限制即触发限流
            </span>
            <span v-else> 仅限制请求次数 </span>
          </div>
        </div>

        <!-- 其他限制信息 -->
        <div class="space-y-4 pt-2">
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">并发限制</span>
            <span class="text-sm font-bold text-slate-900 dark:text-slate-100">
              <span v-if="statsData.limits.concurrencyLimit > 0">
                {{ statsData.limits.concurrencyLimit }}
              </span>
              <span v-else class="flex items-center gap-1">
                <i class="fas fa-infinity text-slate-400" />
              </span>
            </span>
          </div>
          
          <div class="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl space-y-3">
             <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-slate-600 dark:text-slate-400">模型限制</span>
                <span class="text-sm font-bold">
                  <span v-if="hasModelRestrictions" class="text-amber-600 dark:text-amber-400">
                    <i class="fas fa-exclamation-triangle mr-1 text-xs" />
                    限制 {{ statsData.restrictions.restrictedModels.length }} 个模型
                  </span>
                  <span v-else class="text-emerald-600 dark:text-emerald-400">
                    <i class="fas fa-check-circle mr-1 text-xs" />
                    允许所有
                  </span>
                </span>
             </div>
          </div>

          <div class="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400">客户端限制</span>
              <span class="text-sm font-bold">
                <span v-if="hasClientRestrictions" class="text-amber-600 dark:text-amber-400">
                  <i class="fas fa-exclamation-triangle mr-1 text-xs" />
                  限 {{ statsData.restrictions.allowedClients.length }} 种客户端
                </span>
                <span v-else class="text-emerald-600 dark:text-emerald-400">
                  <i class="fas fa-check-circle mr-1 text-xs" />
                  允许所有
                </span>
              </span>
            </div>
            <div
              v-if="hasClientRestrictions"
              class="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700"
            >
              <span
                v-for="client in statsData.restrictions.allowedClients"
                :key="client"
                class="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-medium text-blue-600 border border-blue-100 shadow-sm dark:bg-slate-900 dark:text-blue-300 dark:border-slate-700"
              >
                <i class="fas fa-id-badge" />
                {{ client }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细限制信息 -->
    <div v-if="hasModelRestrictions" class="card-section p-4 md:p-6">
      <h3
        class="mb-4 flex items-center text-lg font-bold text-slate-900 dark:text-slate-100 md:text-xl"
      >
        <i class="fas fa-list-alt mr-2 text-sm text-amber-500 md:mr-3 md:text-base" />
        详细限制信息
      </h3>

      <div
        class="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/20"
      >
        <h4
          class="mb-3 flex items-center text-sm font-bold text-amber-800 dark:text-amber-300"
        >
          <i class="fas fa-robot mr-2" />
          受限模型列表
        </h4>
        <div class="space-y-2">
          <div
            v-for="model in statsData.restrictions.restrictedModels"
            :key="model"
            class="rounded-lg border border-amber-100 bg-white px-3 py-2 text-xs shadow-sm dark:border-amber-700/50 dark:bg-slate-800 md:text-sm flex items-center gap-2"
          >
            <i class="fas fa-ban text-red-500" />
            <span class="break-all font-mono text-slate-700 dark:text-slate-200">{{ model }}</span>
          </div>
        </div>
        <p class="mt-3 text-xs font-medium text-amber-700 dark:text-amber-400">
          <i class="fas fa-info-circle mr-1" />
          此 API Key 不能访问以上列出的模型
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'
import WindowCountdown from '@/components/apikeys/WindowCountdown.vue'

const apiStatsStore = useApiStatsStore()
const { statsData, multiKeyMode, aggregatedStats, invalidKeys } = storeToRefs(apiStatsStore)

const hasModelRestrictions = computed(() => {
  const restriction = statsData.value?.restrictions
  if (!restriction) return false
  return (
    restriction.enableModelRestriction === true &&
    Array.isArray(restriction.restrictedModels) &&
    restriction.restrictedModels.length > 0
  )
})

const hasClientRestrictions = computed(() => {
  const restriction = statsData.value?.restrictions
  if (!restriction) return false
  return (
    restriction.enableClientRestriction === true &&
    Array.isArray(restriction.allowedClients) &&
    restriction.allowedClients.length > 0
  )
})

// 获取每日费用进度
const getDailyCostProgress = () => {
  if (!statsData.value.limits.dailyCostLimit || statsData.value.limits.dailyCostLimit === 0)
    return 0
  const percentage =
    (statsData.value.limits.currentDailyCost / statsData.value.limits.dailyCostLimit) * 100
  return Math.min(percentage, 100)
}

// 获取每日费用进度条颜色
const getDailyCostProgressColor = () => {
  const progress = getDailyCostProgress()
  if (progress >= 100) return 'bg-red-500'
  if (progress >= 80) return 'bg-yellow-500'
  return 'bg-green-500'
}

// 获取总费用进度
const getTotalCostProgress = () => {
  if (!statsData.value.limits.totalCostLimit || statsData.value.limits.totalCostLimit === 0)
    return 0
  const percentage =
    (statsData.value.limits.currentTotalCost / statsData.value.limits.totalCostLimit) * 100
  return Math.min(percentage, 100)
}

// 获取总费用进度条颜色
const getTotalCostProgressColor = () => {
  const progress = getTotalCostProgress()
  if (progress >= 100) return 'bg-red-500'
  if (progress >= 80) return 'bg-yellow-500'
  return 'bg-blue-500'
}

// 获取Opus周费用进度
const getOpusWeeklyCostProgress = () => {
  if (
    !statsData.value.limits.weeklyOpusCostLimit ||
    statsData.value.limits.weeklyOpusCostLimit === 0
  )
    return 0
  const percentage =
    (statsData.value.limits.weeklyOpusCost / statsData.value.limits.weeklyOpusCostLimit) * 100
  return Math.min(percentage, 100)
}

// 获取Opus周费用进度条颜色
const getOpusWeeklyCostProgressColor = () => {
  const progress = getOpusWeeklyCostProgress()
  if (progress >= 100) return 'bg-red-500'
  if (progress >= 80) return 'bg-yellow-500'
  return 'bg-indigo-500' // 使用紫色表示Opus模型
}

// 格式化数字
const formatNumber = (num) => {
  if (typeof num !== 'number') {
    num = parseInt(num) || 0
  }

  if (num === 0) return '0'

  // 大数字使用简化格式
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toLocaleString()
  }
}
</script>

<style scoped>
.card-section {
  @apply rounded-3xl border border-white/20 bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/80;
}

.card-section:hover {
  @apply shadow-xl transform -translate-y-0.5;
}

.progress-container {
  @apply mt-2 h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden border border-slate-200 dark:border-slate-700/50;
}

.progress-track {
  @apply h-full w-full;
}

.progress-bar {
  @apply h-full rounded-full transition-all duration-500 ease-out;
  background-image: linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent);
  background-size: 1rem 1rem;
  animation: progress-stripe 1s linear infinite;
}

@keyframes progress-stripe {
  from { background-position: 1rem 0; }
  to { background-position: 0 0; }
}

/* 限制项悬停效果 */
.limit-item {
  @apply transition-all duration-200 p-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50;
}
</style>
