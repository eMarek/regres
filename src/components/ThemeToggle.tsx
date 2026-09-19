import type { Theme } from '../lib/useTheme'

interface Props {
  theme: Theme
  onChange: (theme: Theme) => void
}

// Icon-only, so the name comes from aria-label. It stays constant and
// aria-pressed carries the state: "Temna tema, toggle button, pressed".
export function ThemeToggle({ theme, onChange }: Props) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Temna tema"
      aria-pressed={isDark}
      title={isDark ? 'Preklopi na svetlo temo' : 'Preklopi na temno temo'}
      onClick={() => onChange(isDark ? 'light' : 'dark')}
    >
      {/* Shows the theme the button switches to: moon in light, sun in dark. */}
      <svg
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </>
        ) : (
          <path d="M20.99 12.79A9 9 0 1 1 11.21 3.01 7 7 0 0 0 20.99 12.79z" />
        )}
      </svg>
    </button>
  )
}
