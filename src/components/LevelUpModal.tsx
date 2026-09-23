import React, { useEffect } from 'react';
import { Sparkles, Trophy, X, ArrowRight } from 'lucide-react';
import { triggerLevelUpConfetti } from '../utils/confetti';
import { playLevelUpFanfare } from '../utils/audio';
import { ASSETS } from '../utils/assets';

interface LevelUpModalProps {
  newLevel: number;
  newTitle: string;
  totalXP: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  newLevel,
  newTitle,
  totalXP,
  onClose,
}) => {
  useEffect(() => {
    triggerLevelUpConfetti();
    playLevelUpFanfare();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-gradient-to-b from-[#131F37] to-[#090D16] border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 glow-emerald">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Graphic */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
          <img
            src={ASSETS.trophy}
            alt="Level Up Trophy"
            className="w-full h-full object-contain rounded-2xl border border-emerald-500/50 shadow-lg shadow-emerald-500/30 animate-pulse"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -top-2 -right-2 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500"></span>
          </span>
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <span className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-bold">
            ✦ Milestone Unlocked ✦
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Level {newLevel} Reached!
          </h2>
          <div className="text-base font-semibold text-cyan-300">
            {newTitle}
          </div>
          <p className="text-xs text-slate-300 pt-1">
            Your consistent study streaks, flashcard mastery, and focus sessions have propelled you to new heights in the academic cosmos.
          </p>
        </div>

        {/* Stats Highlight */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-around text-xs font-mono">
          <div>
            <span className="text-slate-500 block">Total Earned</span>
            <span className="text-amber-400 font-bold text-sm">{totalXP} XP</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-800" />
          <div>
            <span className="text-slate-500 block">Current Status</span>
            <span className="text-emerald-400 font-bold text-sm">Level {newLevel}</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30 cursor-pointer"
        >
          <span>Continue Studying</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
