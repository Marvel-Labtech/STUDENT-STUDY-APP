import React from 'react';
import { X, Trophy, Flame, Clock, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { GamificationState } from '../types';
import { ASSETS } from '../utils/assets';

interface AchievementsModalProps {
  gamification: GamificationState;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  gamification,
  onClose,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-sky-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-emerald-400" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-5 h-5 text-teal-400" />;
      default:
        return <Zap className="w-5 h-5 text-amber-400" />;
    }
  };

  const unlockedCount = gamification.achievements.filter((a) => a.unlockedAt !== null).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-[#0D1527] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Academic Trophy Room & Stats
              </h2>
              <p className="text-xs text-slate-400">
                {unlockedCount} of {gamification.achievements.length} Badges Unlocked · {gamification.totalXP} Total XP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
            <span className="text-[11px] text-slate-400">Active Streak</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 flex items-center gap-1">
              <span>{gamification.currentStreak} Days</span>
              <Flame className="w-4 h-4 fill-amber-400/40" />
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
            <span className="text-[11px] text-slate-400">Total Focus Time</span>
            <span className="text-xl font-bold font-mono text-sky-400 mt-0.5">
              {gamification.todayFocusMinutes} min
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
            <span className="text-[11px] text-slate-400">Mastered Cards</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              {gamification.totalCardsMastered} Cards
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
            <span className="text-[11px] text-slate-400">Current Level</span>
            <span className="text-xl font-bold font-mono text-teal-300 mt-0.5">
              Lv {gamification.level}
            </span>
          </div>
        </div>

        {/* Achievements Showcase Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
          {gamification.achievements.map((ach) => {
            const isUnlocked = ach.unlockedAt !== null;
            const progressRatio = Math.min(ach.progress / ach.maxProgress, 1);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-slate-900/90 to-emerald-950/30 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800 opacity-75'
                }`}
              >
                <div
                  className={`p-3 rounded-xl border shrink-0 ${
                    isUnlocked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  {getIcon(ach.iconName)}
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {ach.title}
                    </h4>
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                        isUnlocked
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      +{ach.xpReward} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ach.description}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>{isUnlocked ? 'Unlocked' : 'Progress'}</span>
                      <span>
                        {ach.progress} / {ach.maxProgress}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isUnlocked ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${progressRatio * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs text-slate-400">
          <span>Complete Pomodoro blocks & quizzes to unlock more badges.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
