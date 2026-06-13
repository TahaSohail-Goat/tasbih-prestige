'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Palette } from 'lucide-react';
import { THEMES, type ThemeType } from '@/lib/themes';

type ThemePickerLabels = {
  button: string;
  heading: string;
  current: string;
  suffix: string;
  names: Record<ThemeType, string>;
};

type ThemePickerProps = {
  activeTheme: ThemeType;
  labels: ThemePickerLabels;
  onThemeChange: (theme: ThemeType) => void;
};

export function ThemePicker({ activeTheme, labels, onThemeChange }: ThemePickerProps) {
  const [open, setOpen] = useState(false);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [open]);

  const activeThemeName = labels.names[activeTheme];
  const themePanel = open && typeof document !== 'undefined'
    ? createPortal(
        <div
          className={`theme-${activeTheme} fixed inset-0 z-[9999] flex items-start justify-center bg-black/25 px-4 pt-20 backdrop-blur-[2px] animate-fade-in`}
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-nav-bg)] p-3 shadow-2xl shadow-black/60 animate-tab-in"
            role="listbox"
            id={listboxId}
            aria-label={labels.heading}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="px-2 pb-2">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold dynamic-accent-text">
                {labels.heading}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {labels.current}: {activeThemeName}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {THEMES.map((theme) => {
                const selected = activeTheme === theme.key;
                const themeName = labels.names[theme.key];

                return (
                  <button
                    key={theme.key}
                    type="button"
                    onClick={() => {
                      onThemeChange(theme.key);
                      setOpen(false);
                    }}
                    className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15 text-slate-100'
                        : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                    }`}
                    role="option"
                    aria-selected={selected}
                    title={`${themeName} ${labels.suffix}`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-5 w-5 rounded-full border border-white/35 shadow-sm shrink-0"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span className="text-xs font-semibold truncate">{themeName}</span>
                    </span>
                    {selected && <Check className="h-4 w-4 dynamic-accent-text shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-full bg-black/45 dynamic-accent-text border border-[var(--theme-border)] hover:bg-black/70 transition-all cursor-pointer shadow-sm"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
      >
        <Palette className="h-3.5 w-3.5" />
        <span>{labels.button}</span>
        <span className="hidden sm:inline text-slate-400 font-medium">/ {activeThemeName}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {themePanel}
    </div>
  );
}
