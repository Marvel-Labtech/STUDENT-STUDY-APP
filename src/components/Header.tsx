import React from 'react';
import { Flame, Trophy } from 'lucide-react';
import { GamificationState } from '../types';

interface HeaderProps {
  activeTab: 'syllabus' | 'buddy' | 'flashcards' | 'pomodoro' | 'quiz';
  setActiveTab: (tab: 'syllabus' | 'buddy' | 'flashcards' | 'pomodoro' | 'quiz') => void;
  gamification: GamificationState;
  onOpenAchievements: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  gamification,
  onOpenAchievements,
}) => {
  const navItems = [
    { id: 'syllabus', label: 'Planner & Syllabus' },
    { id: 'buddy', label: 'AI Study Buddy' },
    { id: 'flashcards', label: '3D Flashcards' },
    { id: 'pomodoro', label: 'Smart Pomodoro' },
    { id: 'quiz', label: 'Quiz Lab' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark Brand Title (Single line) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('syllabus')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-emerald-400 p-[1px] shadow-sm shadow-cyan-500/20">
              <div className="w-full h-full bg-[#090D16] rounded-[7px] flex items-center justify-center">
                <span className="text-cyan-400 font-bold text-sm tracking-tight">✦</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                AstroStudy
              </span>
            </div>
          </button>

          {/* Quick Streak Indicator */}
          <div
            title={`Active ${gamification.currentStreak}-Day Study Streak! Complete a session or quiz to keep it burning.`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium cursor-help"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse fill-amber-500/30" />
            <span className="font-mono tabular-nums font-semibold">{gamification.currentStreak}d</span>
          </div>
        </div>

        {/* Zone 2: 4-6 Clean Text Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 shadow-sm shadow-cyan-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 Primary Actions & Gamification Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAchievements}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-medium transition-colors cursor-pointer group"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="font-mono tabular-nums font-semibold text-amber-300">
              {gamification.totalXP} XP
            </span>
            <span className="hidden sm:inline text-slate-400">·</span>
            <span className="hidden sm:inline text-slate-300 font-medium">
              Lv {gamification.level}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Scroller */}
      <div className="md:hidden flex items-center gap-1 pt-2.5 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
