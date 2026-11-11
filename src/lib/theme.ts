export type ThemePreference = 'light' | 'dark' | 'auto'

export function resolveTheme(preference: ThemePreference, systemDark: boolean): 'light' | 'dark' {
  if (preference === 'auto') return systemDark ? 'dark' : 'light'
  return preference
}
