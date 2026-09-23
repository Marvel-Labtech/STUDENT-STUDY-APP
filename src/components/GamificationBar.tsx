import React from 'react';
import { Flame, Sparkles, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { GamificationState } from '../types';
import { calculateLevel } from '../utils/initialData';

interface GamificationBarProps {
  gamification: GamificationState;
  onOpenAchievements: () => void;
}

export const GamificationBar: React.FC<GamificationBarProps> = ({
  gamification,
  onOpenAchievements,
}) => {
  const levelInfo = calculateLevel(gamification.totalXP);
  const xpNeeded = Math.max(levelInfo.nextLevelXP - gamification.totalXP, 0);

  // Compute past 7 days activity status for the visual calendar tracker
  const today = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const isToday = i === 6;
    const isDone = gamification.activityDates.includes(iso);
    return { iso, dayLabel, isToday, isDone };
  });

  return (
    <div className="w-full bg-[#0D1527] border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Streak State Machine Widget */}
        <div className="flex items-center gap-3.5 bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-500/30 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-white text-sm font-semibold tracking-tight">
                {gamification.currentStreak}-Day Streak
              </span>
              <span className="text-[11px] text-amber-400 font-medium">
                {gamification.currentStreak > 0 ? 'Burning Active 🔥' : 'Start Today'}
              </span>
            </div>

            {/* 7-day visual dot matrix */}
            <div className="flex items-center gap-1.5 mt-1">
              {past7Days.map((day) => (
                <div
                  key={day.iso}
                  title={`${day.iso}: ${day.isDone ? 'Studied' : 'Pending'}`}
                  className="flex flex-col items-center gap-0.5"
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono transition-colors ${
                      day.isDone
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                        : day.isToday
                        ? 'border border-amber-400/60 bg-amber-500/10 text-amber-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Level Progression Bar Widget */}
        <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                Level {levelInfo.level}
              </span>
              <span className="text-white font-medium truncate">
                {levelInfo.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 tabular-nums">
              <span className="text-emerald-400 font-semibold">{gamification.totalXP}</span>
              <span>/</span>
              <span>{levelInfo.nextLevelXP} XP</span>
              <span className="text-slate-500 hidden sm:inline">
                ({xpNeeded} XP to next level)
              </span>
            </div>
          </div>

          {/* Animated Progression Track */}
          <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700 ease-out"
              style={{ width: `${Math.round(levelInfo.progressRatio * 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Stats Trophies Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 px-3 py-2 bg-slate-900/40 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono tabular-nums text-slate-200">
                {gamification.todayFocusMinutes}m
              </span>
              <span>focus today</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono tabular-nums text-slate-200">
                {gamification.totalCardsMastered}
              </span>
              <span>mastered</span>
            </div>
          </div>

          <button
            onClick={onOpenAchievements}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Achievements</span>
          </button>
        </div>
      </div>
    </div>
  );
};
