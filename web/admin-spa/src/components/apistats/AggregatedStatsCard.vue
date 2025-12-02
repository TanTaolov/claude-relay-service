<template>
  <div class="card-section h-full p-4 md:p-6 flex flex-col">
    <h3
      class="mb-6 flex items-center text-lg font-bold text-slate-800 dark:text-slate-100 md:text-xl"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
          <i class="fas fa-chart-pie text-lg" />
        </div>
        <div class="flex flex-col">
          <span>使用占比</span>
          <span class="text-xs font-normal text-slate-500 dark:text-slate-400">
            {{ statsPeriod === 'daily' ? '今日实时数据' : '本月累计数据' }}
          </span>
        </div>
      </div>
    </h3>

    <div v-if="aggregatedStats && individualStats.length > 0" class="space-y-4 flex-1">
      <!-- 各Key使用占比列表 -->
      <div v-for="(stat, index) in topKeys" :key="stat.apiId" class="usage-item group">
        <div class="mb-2 flex items-center justify-between text-sm">
          <span class="truncate font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-mono" :class="getProgressColorBg(index)">
              {{ index + 1 }}
            </span>
            {{ stat.name || `Key ${index + 1}` }}
          </span>
          <span class="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
            {{ calculatePercentage(stat) }}%
          </span>
        </div>
        <div class="progress-track">
          <div
            class="progress-bar"
            :class="getProgressColor(index)"
            :style="{ width: calculatePercentage(stat) + '%' }"
          />
        </div>
        <div
          class="mt-1.5 flex items-center justify-between font-mono text-[10px] text-slate-400 dark:text-slate-500"
        >
          <span><i class="fas fa-exchange-alt mr-1"></i>{{ formatNumber(getStatUsage(stat)?.requests || 0) }}</span>
          <span><i class="fas fa-dollar-sign mr-1"></i>{{ getStatUsage(stat)?.formattedCost || '$0.00' }}</span>
        </div>
      </div>

      <!-- 其他Keys汇总 -->
      <div v-if="otherKeysCount > 0" class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
        <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
              <i class="fas fa-ellipsis-h"></i>
            </span>
            其他 {{ otherKeysCount }} 个Keys
          </span>
          <span class="font-mono font-bold">{{ otherPercentage }}%</span>
        </div>
      </div>
    </div>

    <!-- 单个Key模式提示 -->
    <div
      v-else-if="!multiKeyMode"
      class="flex flex-1 flex-col items-center justify-center text-sm text-slate-400 dark:text-slate-500 py-8"
    >
      <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-3">
        <i class="fas fa-chart-pie text-2xl" />
      </div>
      <p>使用占比仅在多Key查询时显示</p>
    </div>

    <div
      v-else
      class="flex flex-1 flex-col items-center justify-center text-sm text-slate-400 dark:text-slate-500 py-8"
    >
      <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-3">
        <i class="fas fa-inbox text-2xl" />
      </div>
      暂无数据
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'

const apiStatsStore = useApiStatsStore()
const { aggregatedStats, individualStats, statsPeriod, multiKeyMode } = storeToRefs(apiStatsStore)

// 获取当前时间段的使用数据
const getStatUsage = (stat) => {
  if (!stat) return null

  if (statsPeriod.value === 'daily') {
    return stat.dailyUsage || stat.usage
  } else {
    return stat.monthlyUsage || stat.usage
  }
}

// 获取TOP Keys（最多显示5个）
const topKeys = computed(() => {
  if (!individualStats.value || individualStats.value.length === 0) return []

  return [...individualStats.value]
    .sort((a, b) => {
      const aUsage = getStatUsage(a)
      const bUsage = getStatUsage(b)
      return (bUsage?.cost || 0) - (aUsage?.cost || 0)
    })
    .slice(0, 5)
})

// 计算其他Keys数量
const otherKeysCount = computed(() => {
  if (!individualStats.value) return 0
  return Math.max(0, individualStats.value.length - 5)
})

// 计算其他Keys的占比
const otherPercentage = computed(() => {
  if (!individualStats.value || !aggregatedStats.value) return 0

  const topKeysCost = topKeys.value.reduce((sum, stat) => {
    const usage = getStatUsage(stat)
    return sum + (usage?.cost || 0)
  }, 0)
  const totalCost =
    statsPeriod.value === 'daily'
      ? aggregatedStats.value.dailyUsage?.cost || 0
      : aggregatedStats.value.monthlyUsage?.cost || 0

  if (totalCost === 0) return 0
  const otherCost = totalCost - topKeysCost
  return Math.max(0, Math.round((otherCost / totalCost) * 100))
})

// 计算单个Key的百分比
const calculatePercentage = (stat) => {
  if (!aggregatedStats.value) return 0

  const totalCost =
    statsPeriod.value === 'daily'
      ? aggregatedStats.value.dailyUsage?.cost || 0
      : aggregatedStats.value.monthlyUsage?.cost || 0

  if (totalCost === 0) return 0
  const usage = getStatUsage(stat)
  const percentage = ((usage?.cost || 0) / totalCost) * 100
  return Math.round(percentage)
}

// 获取进度条颜色
const getProgressColor = (index) => {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500']
  return colors[index] || 'bg-slate-400'
}

const getProgressColorBg = (index) => {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500']
  return colors[index] || 'bg-slate-400'
}

// 格式化数字
const formatNumber = (num) => {
  if (typeof num !== 'number') {
    num = parseInt(num) || 0
  }

  if (num === 0) return '0'

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

.usage-item {
  @apply transition-colors duration-200;
}

.progress-track {
  @apply h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden;
}

.progress-bar {
  @apply h-full rounded-full transition-all duration-500 ease-out;
}
</style>
