import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const systemPrefersDark = ref(false)

  const isDarkMode = computed(() => systemPrefersDark.value)

  const currentTheme = computed(() => (isDarkMode.value ? 'dark' : 'light'))

  const initTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = mediaQuery.matches
    applyTheme()
    watchSystemTheme()
  }

  const applyTheme = () => {
    const root = document.documentElement
    if (isDarkMode.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  watch(systemPrefersDark, () => {
    applyTheme()
  })

  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e) => {
      systemPrefersDark.value = e.matches
    }

    systemPrefersDark.value = mediaQuery.matches
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }

  return {
    isDarkMode,
    currentTheme,
    systemPrefersDark,
    initTheme,
    watchSystemTheme
  }
})
