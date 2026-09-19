import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

// Keep in sync with the inline script in index.html, which applies the stored
// theme before first paint.
const STORAGE_KEY = 'regres-theme'

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Storage can be blocked (private mode); fall back to the system setting.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // The theme still applies for this visit.
    }
  }, [theme])

  return [theme, setTheme]
}
