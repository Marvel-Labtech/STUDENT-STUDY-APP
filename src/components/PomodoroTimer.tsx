import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Flame, 
  Clock, 
  Volume2, 
  VolumeX, 
  Sliders, 
  BookOpen,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { PomodoroMode, SyllabusItem } from '../types';
import { playPomodoroCompletionSound } from '../utils/audio';

interface PomodoroTimerProps {
  syllabusItems: SyllabusItem[];
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  onPomodoroCompleted: (minutes: number) => void;
  totalCompletedSessions: number;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  syllabusItems,
  selectedTopic,
  onSelectTopic,
  onPomodoroCompleted,
  totalCompletedSessions,
}) => {
  const [mode, setMode] = useState<PomodoroMode>('study');
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [cycleCount, setCycleCount] = useState(totalCompletedSessions % 4);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Total time for active mode
  const totalModeDuration = (
    mode === 'study'
      ? studyMinutes
      : mode === 'short_break'
      ? shortBreakMinutes
      : longBreakMinutes
  ) * 60;

  // Sync time left when durations change and timer is paused
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'study') setTimeLeft(studyMinutes * 60);
      else if (mode === 'short_break') setTimeLeft(shortBreakMinutes * 60);
      else setTimeLeft(longBreakMinutes * 60);
    }
  }, [mode, studyMinutes, shortBreakMinutes, longBreakMinutes]);

  // Main countdown timer interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, studyMinutes, shortBreakMinutes, longBreakMinutes]);

  const handleSessionEnd = () => {
    setIsRunning(false);

    if (soundEnabled) {
      playPomodoroCompletionSound();
    }

    if (mode === 'study') {
      onPomodoroCompleted(studyMinutes);
      const nextCycle = (cycleCount + 1) % 4;
      setCycleCount(nextCycle);

      // Automatically route to long break every 4 sessions, otherwise short break
      if (nextCycle === 0) {
        setMode('long_break');
        setTimeLeft(longBreakMinutes * 60);
      } else {
        setMode('short_break');
        setTimeLeft(shortBreakMinutes * 60);
      }
    } else {
      // Break concluded, back to study
      setMode('study');
      setTimeLeft(studyMinutes * 60);
    }
  };

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalModeDuration);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'study') {
      setMode('short_break');
      setTimeLeft(shortBreakMinutes * 60);
    } else {
      setMode('study');
      setTimeLeft(studyMinutes * 60);
    }
  };

  // Formatter for MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG Circular progress math
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalModeDuration > 0 ? (totalModeDuration - timeLeft) / totalModeDuration : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const getModeColor = () => {
    if (mode === 'study') return { ring: '#F59E0B', text: 'text-amber-400', glow: 'glow-amber' };
    if (mode === 'short_break') return { ring: '#10B981', text: 'text-emerald-400', glow: 'glow-emerald' };
    return { ring: '#38BDF8', text: 'text-cyan-400', glow: 'glow-blue' };
  };

  const colorConfig = getModeColor();

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-white tracking-tight">
              Smart Pomodoro Focus Engine
            </h2>
            <span className="text-xs text-slate-400">· +10 XP per Focus Session</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maintain deep cognitive focus with structured study intervals and restorative breaks. Custom Web Audio chimes notify you when blocks conclude.
          </p>
        </div>

        {/* Focus Topic Connector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">Active Goal:</span>
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 max-w-xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={selectedTopic}
              onChange={(e) => onSelectTopic(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer truncate"
            >
              <option value="" className="bg-slate-900">General Deep Focus Session</option>
              {syllabusItems.map((item) => (
                <option key={item.id} value={item.topic} className="bg-slate-900">
                  {item.week}: {item.topic}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              showSettings ? 'bg-amber-950/60 border-amber-600 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Configure Durations"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled ? 'bg-slate-800 border-slate-700 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title={soundEnabled ? 'Audio Chime Enabled' : 'Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings Panel Drawer */}
      {showSettings && (
        <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-fadeIn">
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Study Focus Duration</span>
              <span className="font-mono text-amber-400">{studyMinutes} min</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={studyMinutes}
              onChange={(e) => setStudyMinutes(Number(e.target.value))}
              disabled={isRunning}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Short Break Duration</span>
              <span className="font-mono text-emerald-400">{shortBreakMinutes} min</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              step={1}
              value={shortBreakMinutes}
              onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
              disabled={isRunning}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Long Break Duration</span>
              <span className="font-mono text-cyan-400">{longBreakMinutes} min</span>
            </div>
            <input
              type="range"
              min={10}
              max={30}
              step={5}
              value={longBreakMinutes}
              onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
              disabled={isRunning}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex items-center p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner">
          <button
            onClick={() => {
              if (isRunning) return;
              setMode('study');
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'study'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Study Focus ({studyMinutes}m)
          </button>

          <button
            onClick={() => {
              if (isRunning) return;
              setMode('short_break');
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'short_break'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Short Break ({shortBreakMinutes}m)
          </button>

          <button
            onClick={() => {
              if (isRunning) return;
              setMode('long_break');
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'long_break'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Long Break ({longBreakMinutes}m)
          </button>
        </div>
      </div>

      {/* Circular Countdown Stage */}
      <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
        {/* Ambient subtle backdrop glow */}
        <div
          className="absolute w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: colorConfig.ring }}
        />

        {/* SVG Circular Countdown Ring */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
            {/* Background Track */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              className="text-slate-800"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Dynamic Progress Stroke */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke={colorConfig.ring}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Central Digital Countdown & Status */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs uppercase tracking-widest font-mono text-slate-400 font-semibold">
              {mode === 'study' ? 'Deep Study Sprint' : mode === 'short_break' ? 'Short Break' : 'Restorative Break'}
            </span>

            <span className="text-5xl sm:text-6xl font-bold font-mono text-white tracking-tight tabular-nums">
              {formatTime(timeLeft)}
            </span>

            {selectedTopic && mode === 'study' && (
              <span className="text-xs text-amber-400/90 font-medium max-w-[200px] truncate">
                {selectedTopic}
              </span>
            )}

            {/* Micro 4-Dot Cycle Indicator */}
            <div className="flex items-center gap-1.5 pt-2">
              {[0, 1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  title={`Round ${idx + 1} of 4`}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    idx < cycleCount
                      ? 'bg-amber-400 shadow-xs shadow-amber-400/50'
                      : idx === cycleCount && mode === 'study'
                      ? 'border border-amber-400 bg-amber-400/30 animate-pulse'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={handleResetTimer}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 cursor-pointer ${
              isRunning
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Focus (+10 XP)</span>
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Skip to Next Block"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Motivational Gamification Footer */}
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>
            Finishing a 25-minute study block automatically awards <strong className="text-amber-300">+10 XP</strong> and locks in your daily streak!
          </span>
        </div>
      </div>
    </div>
  );
};
