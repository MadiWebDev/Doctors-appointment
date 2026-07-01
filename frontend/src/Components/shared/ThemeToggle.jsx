import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

/* ─── icon map ─────────────────────────────────────────────────── */
const icons = {
  light:  { Icon: Sun,     label: 'Light',  bg: 'bg-amber-400',  ring: 'ring-amber-400/40',  text: 'text-amber-500' },
  dark:   { Icon: Moon,    label: 'Dark',   bg: 'bg-indigo-500', ring: 'ring-indigo-500/40', text: 'text-indigo-500' },
  system: { Icon: Monitor, label: 'System', bg: 'bg-slate-500',  ring: 'ring-slate-400/40',  text: 'text-slate-500' },
};

const modes = ['light', 'dark', 'system'];

/* ─── Compact toggle for the top header ───────────────────────── */
export function ThemeToggleCompact() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = icons[theme] || icons.system;
  const { Icon } = current;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
          bg-slate-100 dark:bg-slate-800
          hover:bg-slate-200 dark:hover:bg-slate-700
          text-slate-600 dark:text-slate-300
          transition-all duration-200 text-sm font-medium
          border border-slate-200 dark:border-slate-700
          select-none"
        aria-label={`Theme: ${current.label}`}
      >
        <Icon className={`w-3.5 h-3.5 ${current.text} dark:opacity-90`} />
        <span className="hidden sm:inline text-xs">{current.label}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden z-50 animate-slide-down">
          {modes.map((mode) => {
            const { Icon: MIcon, label, text } = icons[mode];
            const isActive = theme === mode;
            return (
              <button
                key={mode}
                onClick={() => { setTheme(mode); setOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }
                `}
              >
                <MIcon className={`w-4 h-4 ${text} dark:opacity-90`} />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Full pill for the sidebar footer ────────────────────────── */
export function ThemeTogglePill() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      {modes.map((mode) => {
        const { Icon, label, bg, ring } = icons[mode];
        const isActive = theme === mode;
        return (
          <button
            key={mode}
            onClick={() => setTheme(mode)}
            title={label}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg
              text-xs font-medium transition-all duration-200 select-none
              ${isActive
                ? `bg-white dark:bg-slate-700 shadow-sm ring-1 ${ring} text-slate-900 dark:text-white`
                : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }
            `}
            aria-pressed={isActive}
            aria-label={`${label} mode`}
          >
            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? icons[mode].text : ''}`} />
            <span className="hidden sm:inline truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Default export — icon-only cycle button ─────────────────── */
export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycle = () => {
    const next = { light: 'dark', dark: 'system', system: 'light' };
    setTheme(next[theme]);
  };

  const ActiveIcon = resolvedTheme === 'dark' ? Moon : Sun;
  const isSystem = theme === 'system';

  return (
    <button
      onClick={cycle}
      title={`Theme: ${theme} — click to cycle`}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl
        bg-slate-100 dark:bg-slate-800
        hover:bg-slate-200 dark:hover:bg-slate-700
        text-slate-600 dark:text-slate-300
        border border-slate-200 dark:border-slate-700
        transition-all duration-200"
      aria-label="Toggle theme"
    >
      <ActiveIcon className={`w-[18px] h-[18px] transition-all duration-300 ${resolvedTheme === 'dark' ? 'text-indigo-400' : 'text-amber-500'}`} />
      {/* System mode dot indicator */}
      {isSystem && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
      )}
    </button>
  );
}
