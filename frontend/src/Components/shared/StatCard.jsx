import React from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'primary', trend, trendLabel }) => {
  const colorConfig = {
    primary: {
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900',
      glow: 'shadow-blue-100 dark:shadow-blue-950',
    },
    teal: {
      gradient: 'from-teal-500 to-emerald-600',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-100 dark:border-teal-900',
      glow: 'shadow-teal-100 dark:shadow-teal-950',
    },
    green: {
      gradient: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900',
      glow: 'shadow-emerald-100 dark:shadow-emerald-950',
    },
    yellow: {
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900',
      glow: 'shadow-amber-100 dark:shadow-amber-950',
    },
    red: {
      gradient: 'from-rose-500 to-red-600',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900',
      glow: 'shadow-rose-100 dark:shadow-rose-950',
    },
    violet: {
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-100 dark:border-violet-900',
      glow: 'shadow-violet-100 dark:shadow-violet-950',
    },
  };

  const cfg = colorConfig[color] || colorConfig.primary;

  return (
    <div
      className={`
        relative bg-white dark:bg-slate-900
        rounded-2xl border ${cfg.border}
        shadow-sm ${cfg.glow}
        hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-300
        p-4 sm:p-5 lg:p-6
        overflow-hidden group
      `}
    >
      {/* Background glow blob */}
      <div
        className={`absolute -top-6 -right-6 w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-gradient-to-br ${cfg.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
            {value}
          </p>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
              }`}
            >
              <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
              {trendLabel && (
                <span className="text-slate-400 dark:text-slate-500 font-normal">{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
