import { ref, watch } from 'vue'

/**
 * Theme composable with no-flicker initialization
 * Applies theme class to documentElement before app mount
 */
export function useTheme() {
  const isDark = ref(false)

  // Initialize theme immediately (before mount)
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    isDark.value = shouldBeDark
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Toggle theme
  const toggle = () => {
    isDark.value = !isDark.value
  }

  // Watch for changes and persist
  watch(isDark, (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  })

  return {
    isDark,
    toggle,
    initTheme
  }
}
