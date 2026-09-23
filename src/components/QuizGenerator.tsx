import React, { useState } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Trophy, 
  BookOpen, 
  ArrowRight,
  Flame
} from 'lucide-react';
import { QuizQuestion, SyllabusItem } from '../types';
import { playQuizVictorySound } from '../utils/audio';
import { triggerStreakCelebration } from '../utils/confetti';
import { ASSETS } from '../utils/assets';

interface QuizGeneratorProps {
  questions: QuizQuestion[];
  syllabusItems: SyllabusItem[];
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  onQuizCompleted: (percentage: number, isPerfect: boolean) => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  questions: initialQuestions,
  syllabusItems,
  selectedTopic,
  onSelectTopic,
  onQuizCompleted,
}) => {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isGraded, setIsGraded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Compute grading
  let correctCount = 0;
  activeQuestions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correctIndex) {
      correctCount++;
    }
  });

  const totalCount = activeQuestions.length;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const isPerfect = totalCount > 0 && correctCount === totalCount;
  const isPassed = percentage >= 70;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isGraded) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleGradeQuiz = () => {
    if (isGraded || Object.keys(selectedAnswers).length === 0) return;
    setIsGraded(true);

    playQuizVictorySound(isPerfect);
    if (isPassed) {
      triggerStreakCelebration();
    }
    onQuizCompleted(percentage, isPerfect);
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsGraded(false);
  };

  const handleGenerateNewQuiz = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    handleRetake();

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic || 'Algorithms & Data Structures',
          count: 4,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate quiz');

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setActiveQuestions(data.questions);
      }
    } catch {
      setGenerationError('Could not connect to Gemini API. Using fallback question bank.');
    } finally {
      setIsGenerating(false);
    }
  };

  const allAnswered = activeQuestions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div className="space-y-6">
      {/* Header & Configuration Bar */}
      <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-white tracking-tight">
              Dynamic Quiz Generator & Examiner
            </h2>
            <span className="text-xs text-slate-400">· +50 XP for Perfect Score</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test deep theoretical mechanics and edge cases. Instant evaluation reveals comprehensive "Why is this correct?" rationale.
          </p>
        </div>

        {/* Topic Selector & Generator Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs max-w-xs">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={selectedTopic}
              onChange={(e) => {
                onSelectTopic(e.target.value);
                handleRetake();
              }}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer truncate"
            >
              <option value="" className="bg-slate-900">Select Syllabus Topic...</option>
              {syllabusItems.map((item) => (
                <option key={item.id} value={item.topic} className="bg-slate-900">
                  {item.week}: {item.topic}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateNewQuiz}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Quiz...' : 'Generate New Test'}</span>
          </button>
        </div>
      </div>

      {generationError && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generationError}</span>
        </div>
      )}

      {/* Graded Score Hero Card */}
      {isGraded && (
        <div className={`p-6 rounded-3xl border-2 transition-all shadow-2xl ${
          isPerfect
            ? 'bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-900 border-emerald-500/80 glow-emerald'
            : isPassed
            ? 'bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-slate-900 border-cyan-500/80 glow-blue'
            : 'bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/50 border-slate-700'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={ASSETS.trophy}
                  alt="Trophy"
                  className="w-16 h-16 object-contain rounded-xl border border-amber-500/30 shadow-md"
                  referrerPolicy="no-referrer"
                />
                {isPerfect && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums tracking-tight">
                    {percentage}%
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-800 text-slate-200">
                    {correctCount} / {totalCount} Correct
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                  {isPerfect
                    ? 'Flawless Mastery! +50 XP Awarded 🌟'
                    : isPassed
                    ? 'Exam Passed! +25 XP Awarded ✨'
                    : 'Study Review Recommended (+10 XP)'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed theoretical breakdowns are color-coded below for each question.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Retake Quiz
              </button>
              <button
                onClick={handleGenerateNewQuiz}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-600/30"
              >
                <span>Next Test</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {activeQuestions.map((q, qIdx) => {
          const selectedIdx = selectedAnswers[q.id];
          const hasSelected = selectedIdx !== undefined;

          return (
            <div
              key={q.id}
              className="bg-[#0D1527] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-400 font-semibold">
                  Question {qIdx + 1} of {totalCount}
                </span>
                <span className="text-slate-500 font-mono">{q.topic}</span>
              </div>

              {/* Question Stem */}
              <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {q.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {q.options.map((option, optIdx) => {
                  const isUserSelection = selectedIdx === optIdx;
                  const isCorrectAnswer = q.correctIndex === optIdx;

                  let optionStyle = 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600';

                  if (isGraded) {
                    if (isCorrectAnswer) {
                      optionStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950/50 font-semibold';
                    } else if (isUserSelection && !isCorrectAnswer) {
                      optionStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 font-semibold';
                    } else {
                      optionStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                    }
                  } else if (isUserSelection) {
                    optionStyle = 'bg-cyan-950/70 border-cyan-500 text-cyan-100 font-semibold shadow-sm shadow-cyan-900/40';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      disabled={isGraded}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all text-xs sm:text-sm flex items-start justify-between gap-3 cursor-pointer ${optionStyle}`}
                    >
                      <span>{option}</span>
                      {isGraded && (
                        <div className="shrink-0 mt-0.5">
                          {isCorrectAnswer ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isUserSelection ? (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          ) : null}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* "Why is this correct?" Explanation Box */}
              {isGraded && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Why is this correct?</span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {q.explanation}
                  </div>

                  {q.whyWrong && (
                    <div className="pt-2 border-t border-slate-800 text-xs text-amber-300/90 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Distractor Trap:</strong> {q.whyWrong}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grade Action Button */}
      {!isGraded && (
        <div className="sticky bottom-4 z-30 p-4 bg-[#0D1527]/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {Object.keys(selectedAnswers).length} of {totalCount} questions answered
          </div>

          <button
            onClick={handleGradeQuiz}
            disabled={!allAnswered}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
          >
            Submit & Grade Quiz
          </button>
        </div>
      )}
    </div>
  );
};
