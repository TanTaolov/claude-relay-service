<template>
  <div class="card-section flex h-full flex-col p-4 md:p-6">
    <h3
      class="mb-6 flex items-center text-lg font-bold text-slate-800 dark:text-slate-100 md:text-xl"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        >
          <i class="fas fa-coins text-lg" />
        </div>
        <div class="flex flex-col">
          <span>Token 使用分布</span>
          <span class="text-xs font-normal text-slate-500 dark:text-slate-400">
            {{ statsPeriod === 'daily' ? '今日实时数据' : '本月累计数据' }}
          </span>
        </div>
      </div>
    </h3>

    <div class="flex flex-1 flex-col justify-center space-y-4">
      <div class="distribution-item group">
        <div class="mb-1 flex items-center justify-between">
          <span class="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
            <div
              class="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400"
            >
              <i class="fas fa-arrow-right" />
            </div>
            输入 Token
          </span>
          <span class="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
            {{ formatNumber(currentPeriodData.inputTokens) }}
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50">
          <div
            class="h-full rounded-full bg-emerald-500"
            :style="{ width: calculatePercentage(currentPeriodData.inputTokens) + '%' }"
          ></div>
        </div>
      </div>

      <div class="distribution-item group">
        <div class="mb-1 flex items-center justify-between">
          <span class="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
            <div
              class="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <i class="fas fa-arrow-left" />
            </div>
            输出 Token
          </span>
          <span class="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
            {{ formatNumber(currentPeriodData.outputTokens) }}
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50">
          <div
            class="h-full rounded-full bg-blue-500"
            :style="{ width: calculatePercentage(currentPeriodData.outputTokens) + '%' }"
          ></div>
        </div>
      </div>

      <div class="distribution-item group">
        <div class="mb-1 flex items-center justify-between">
          <span class="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
            <div
              class="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400"
            >
              <i class="fas fa-save" />
            </div>
            缓存创建
          </span>
          <span class="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
            {{ formatNumber(currentPeriodData.cacheCreateTokens) }}
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50">
          <div
            class="h-full rounded-full bg-purple-500"
            :style="{ width: calculatePercentage(currentPeriodData.cacheCreateTokens) + '%' }"
          ></div>
        </div>
      </div>

      <div class="distribution-item group">
        <div class="mb-1 flex items-center justify-between">
          <span class="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
            <div
              class="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400"
            >
              <i class="fas fa-download" />
            </div>
            缓存读取
          </span>
          <span class="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
            {{ formatNumber(currentPeriodData.cacheReadTokens) }}
          </span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50">
          <div
            class="h-full rounded-full bg-orange-500"
            :style="{ width: calculatePercentage(currentPeriodData.cacheReadTokens) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div class="mt-6 border-t border-slate-100 pt-4 dark:border-slate-700/50">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-500 dark:text-slate-400">
          {{ statsPeriod === 'daily' ? '今日' : '本月' }}总计
        </span>
        <span class="font-mono text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {{ formatNumber(currentPeriodData.allTokens) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'

const apiStatsStore = useApiStatsStore()
const { statsPeriod, currentPeriodData } = storeToRefs(apiStatsStore)

// 计算百分比
const calculatePercentage = (value) => {
  if (!currentPeriodData.value.allTokens || currentPeriodData.value.allTokens === 0) return 0
  if (!value) return 0
  return Math.min(100, (value / currentPeriodData.value.allTokens) * 100)
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
  @apply -translate-y-0.5 transform shadow-xl;
}

.distribution-item {
  @apply rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50;
}
</style>
