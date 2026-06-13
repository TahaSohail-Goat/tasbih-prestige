export const THEMES = [
  { key: 'emerald', color: '#10b981' },
  { key: 'desert', color: '#e2a122' },
  { key: 'shiraz', color: '#f43f5e' },
  { key: 'alhambra', color: '#f97316' },
  { key: 'ocean', color: '#06b6d4' },
  { key: 'kaaba', color: '#d4af37' },
] as const;

export type ThemeType = (typeof THEMES)[number]['key'];

export const isThemeType = (value: string | null): value is ThemeType => {
  return THEMES.some((theme) => theme.key === value);
};
