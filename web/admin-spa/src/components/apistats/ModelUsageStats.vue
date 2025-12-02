<template>
  <div class="modern-card p-4 md:p-6">
    <div class="mb-6 flex items-center justify-between">
      <h3
        class="flex flex-col text-lg font-bold text-slate-800 dark:text-slate-100 sm:flex-row sm:items-center md:text-xl"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          >
            <i class="fas fa-robot text-lg" />
          </div>
          <div>
            <span class="block">模型使用统计</span>
            <span class="block text-xs font-normal text-slate-500 dark:text-slate-400">
              {{ statsPeriod === 'daily' ? '今日实时数据' : '本月累计数据' }}
            </span>
          </div>
        </div>
      </h3>
      <div
        class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      >
        共 {{ modelStats.length }} 个模型
      </div>
    </div>

    <!-- 模型统计加载状态 -->
    <div
      v-if="modelStatsLoading"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <div class="relative mb-4">
        <div class="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-20"></div>
        <div
          class="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
        >
          <i class="fas fa-spinner fa-spin text-xl" />
        </div>
      </div>
      <p class="text-sm font-medium text-slate-600 dark:text-slate-300">正在加载模型统计数据...</p>
    </div>

    <!-- 模型统计数据 -->
    <div v-else-if="modelStats.length > 0" class="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      <div v-for="(model, index) in modelStats" :key="index" class="model-card group">
        <!-- 头部：模型名称和总费用 -->
        <div
          class="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-700/50"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                <i class="fas fa-cube" />
              </span>
              <h4
                class="break-all font-mono text-sm font-bold text-slate-800 dark:text-slate-100 md:text-base"
              >
                {{ model.model }}
              </h4>
            </div>
            <p class="mt-1 pl-8 text-xs text-slate-500 dark:text-slate-400">
              <i class="fas fa-exchange-alt mr-1 text-[10px]"></i>
              {{ formatNumber(model.requests) }} 次请求
            </p>
          </div>
          <div class="flex-shrink-0 text-right">
            <div class="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {{ model.formatted?.total || '$0.000000' }}
            </div>
            <div class="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              总费用
            </div>
          </div>
        </div>

        <!-- 数据网格 -->
        <div class="grid grid-cols-2 gap-3">
          <!-- 输入 Token -->
          <div class="stat-mini-card bg-amber-50/50 dark:bg-amber-900/10">
            <div
              class="text-[10px] font-medium uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70"
            >
              输入 Token
            </div>
            <div class="mt-1 font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
              {{ formatNumber(model.inputTokens) }}
            </div>
          </div>

          <!-- 输出 Token -->
          <div class="stat-mini-card bg-blue-50/50 dark:bg-blue-900/10">
            <div
              class="text-[10px] font-medium uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70"
            >
              输出 Token
            </div>
            <div class="mt-1 font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
              {{ formatNumber(model.outputTokens) }}
            </div>
          </div>

          <!-- 缓存创建 -->
          <div class="stat-mini-card bg-purple-50/50 dark:bg-purple-900/10">
            <div
              class="text-[10px] font-medium uppercase tracking-wider text-purple-600/70 dark:text-purple-400/70"
            >
              缓存创建
            </div>
            <div class="mt-1 font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
              {{ formatNumber(model.cacheCreateTokens) }}
            </div>
          </div>

          <!-- 缓存读取 -->
          <div class="stat-mini-card bg-emerald-50/50 dark:bg-emerald-900/10">
            <div
              class="text-[10px] font-medium uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70"
            >
              缓存读取
            </div>
            <div class="mt-1 font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
              {{ formatNumber(model.cacheReadTokens) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无模型数据 -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500"
    >
      <div
        class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-3xl dark:bg-slate-800/50"
      >
        <i class="fas fa-chart-pie" />
      </div>
      <p class="text-sm font-medium md:text-base">
        暂无{{ statsPeriod === 'daily' ? '今日' : '本月' }}模型使用数据
      </p>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useApiStatsStore } from '@/stores/apistats'

const apiStatsStore = useApiStatsStore()
const { statsPeriod, modelStats, modelStatsLoading } = storeToRefs(apiStatsStore)

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
/* card-section removed */

.model-card {
  @apply rounded-2xl border border-slate-200/60 bg-white/60 p-5 transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-800/40;
}

.model-card:hover {
  @apply -translate-y-1 transform border-slate-300 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800;
}

.stat-mini-card {
  @apply rounded-xl border border-transparent p-2.5 transition-colors duration-300;
}

.model-card:hover .stat-mini-card {
  @apply border-black/5 bg-opacity-100 dark:border-white/5;
}
</style>
