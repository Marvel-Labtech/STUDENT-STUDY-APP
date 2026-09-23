import React, { useState } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  Sparkles, 
  Volume2, 
  Check, 
  Layers,
  Trophy
} from 'lucide-react';
import { Flashcard, FlashcardMastery, SyllabusItem } from '../types';
import { playCardFlipSound, playMasteredChime } from '../utils/audio';
import { ASSETS } from '../utils/assets';

interface FlashcardDeckProps {
  cards: Flashcard[];
  syllabusItems: SyllabusItem[];
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  onUpdateCardStatus: (cardId: string, status: FlashcardMastery) => void;
  onAddNewCard: (card: Omit<Flashcard, 'id' | 'reviewCount'>) => void;
  totalCardsMastered: number;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  cards,
  syllabusItems,
  selectedTopic,
  onSelectTopic,
  onUpdateCardStatus,
  onAddNewCard,
  totalCardsMastered,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterTopic, setFilterTopic] = useState<string>(selectedTopic || 'all');
  const [filterStatus, setFilterStatus] = useState<'all' | FlashcardMastery>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTopic, setNewTopic] = useState(selectedTopic || 'Core Concept');

  // Filter cards
  const filteredCards = cards.filter((card) => {
    const matchesTopic = filterTopic === 'all' || card.topic.toLowerCase().includes(filterTopic.toLowerCase());
    const matchesStatus = filterStatus === 'all' || card.status === filterStatus;
    return matchesTopic && matchesStatus;
  });

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playCardFlipSound();
  };

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    playCardFlipSound();
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    playCardFlipSound();
  };

  const handleShuffle = () => {
    if (filteredCards.length <= 1) return;
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * filteredCards.length));
    playCardFlipSound();
  };

  const handleStatusUpdate = (status: FlashcardMastery) => {
    if (!currentCard) return;
    if (status === 'mastered') {
      playMasteredChime();
    }
    onUpdateCardStatus(currentCard.id, status);
    // Auto advance
    setTimeout(() => {
      handleNext();
    }, 250);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    onAddNewCard({
      front: newFront.trim(),
      back: newBack.trim(),
      topic: newTopic.trim() || 'General Concept',
      status: 'unreviewed',
      tags: [newTopic.trim()],
    });

    setNewFront('');
    setNewBack('');
    setShowAddModal(false);
  };

  // Stats calculation
  const masteredCount = cards.filter((c) => c.status === 'mastered').length;
  const strugglingCount = cards.filter((c) => c.status === 'struggling').length;
  const reviewLaterCount = cards.filter((c) => c.status === 'review_later').length;
  const unreviewedCount = cards.filter((c) => c.status === 'unreviewed').length;

  return (
    <div className="space-y-6">
      {/* Deck Header & Active Filters */}
      <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white tracking-tight">
              Interactive 3D Flashcard Deck
            </h2>
            <span className="text-xs text-slate-400">· Active Recall Engine</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Click the card or press Space to flip. Categorize cards to update your mastery metrics and earn +5 XP per mastered card!
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterTopic}
            onChange={(e) => {
              setFilterTopic(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[200px] truncate"
          >
            <option value="all">All Topics ({cards.length})</option>
            {syllabusItems.map((item) => (
              <option key={item.id} value={item.topic}>
                {item.week}: {item.topic}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All States</option>
            <option value="mastered">Mastered ({masteredCount})</option>
            <option value="struggling">Struggling ({strugglingCount})</option>
            <option value="review_later">Review Later ({reviewLaterCount})</option>
            <option value="unreviewed">Unreviewed ({unreviewedCount})</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Card</span>
          </button>
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Mastered: {masteredCount} (+{masteredCount * 5} XP)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Struggling: {strugglingCount}
            </span>
            <span className="flex items-center gap-1.5 text-sky-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Review Later: {reviewLaterCount}
            </span>
          </div>
          <span className="font-mono tabular-nums text-slate-300">
            {cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0}% Mastered
          </span>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${cards.length ? (masteredCount / cards.length) * 100 : 0}%` }}
            title={`Mastered: ${masteredCount}`}
          />
          <div
            className="bg-amber-500 transition-all duration-300"
            style={{ width: `${cards.length ? (strugglingCount / cards.length) * 100 : 0}%` }}
            title={`Struggling: ${strugglingCount}`}
          />
          <div
            className="bg-sky-500 transition-all duration-300"
            style={{ width: `${cards.length ? (reviewLaterCount / cards.length) * 100 : 0}%` }}
            title={`Review Later: ${reviewLaterCount}`}
          />
        </div>
      </div>

      {/* 3D Interactive Card Stage */}
      {filteredCards.length === 0 ? (
        <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <img
            src={ASSETS.trophy}
            alt="Mastery Trophy"
            className="w-28 h-28 object-contain rounded-2xl border border-slate-800 shadow-md"
            referrerPolicy="no-referrer"
          />
          <h3 className="text-base font-semibold text-white">All Cards in this filter completed!</h3>
          <p className="text-xs text-slate-400 max-w-md">
            You've reviewed all cards matching this criteria. Try selecting "All Topics" or click "New Card" to add more concept prompts.
          </p>
          <button
            onClick={() => {
              setFilterTopic('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6">
          {/* Card Meta & Position Counter */}
          <div className="flex items-center justify-between w-full max-w-2xl px-2 text-xs text-slate-400">
            <span className="font-mono text-cyan-400 font-semibold truncate max-w-xs">
              Topic: {currentCard.topic}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono tabular-nums">
                Card {currentIndex + 1} of {filteredCards.length}
              </span>
              {currentCard.status !== 'unreviewed' && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                    currentCard.status === 'mastered'
                      ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                      : currentCard.status === 'struggling'
                      ? 'bg-amber-950/60 border border-amber-800 text-amber-300'
                      : 'bg-sky-950/60 border border-sky-800 text-sky-300'
                  }`}
                >
                  {currentCard.status === 'mastered' ? 'Mastered' : currentCard.status === 'struggling' ? 'Struggling' : 'Review Later'}
                </span>
              )}
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={handleFlip}
            className="w-full max-w-2xl h-[340px] sm:h-[380px] perspective-1000 cursor-pointer select-none group"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT FACE */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-[#0D1527] to-[#131F37] border-2 border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl group-hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-cyan-300 font-mono text-[11px]">
                    FRONT · QUESTION
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-cyan-400" />
                    Click to flip
                  </span>
                </div>

                <div className="my-auto py-4 text-center">
                  <h3 className="text-base sm:text-xl font-semibold text-white leading-relaxed tracking-tight">
                    {currentCard.front}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    {currentCard.tags?.map((tag, tIdx) => (
                      <span key={tIdx} className="text-slate-400">#{tag}</span>
                    ))}
                  </div>
                  <span>Reviewed {currentCard.reviewCount} times</span>
                </div>
              </div>

              {/* BACK FACE */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-[#101B30] to-[#0A1120] border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl glow-emerald">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 font-mono text-[11px] border border-emerald-800">
                    BACK · ACTIVE RECALL EXPLANATION
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-emerald-400" />
                    Click to flip back
                  </span>
                </div>

                <div className="my-auto py-4 overflow-y-auto max-h-[220px]">
                  <div className="text-xs sm:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed text-left space-y-2">
                    {currentCard.back}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400/80">
                  <span>Theoretical Verification Complete</span>
                  <span>Press Space to Flip</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Mastery Tracking */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-2xl">
            <button
              onClick={() => handleStatusUpdate('struggling')}
              className="flex-1 min-w-[130px] px-4 py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-700/60 text-amber-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Struggling</span>
            </button>

            <button
              onClick={() => handleStatusUpdate('review_later')}
              className="flex-1 min-w-[130px] px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-sky-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Review Later</span>
            </button>

            <button
              onClick={() => handleStatusUpdate('mastered')}
              className="flex-1 min-w-[130px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/30 hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Mastered (+5 XP)</span>
            </button>
          </div>

          {/* Deck Navigation Controls */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Previous Card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleShuffle}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Shuffle Cards"
            >
              <Shuffle className="w-4 h-4 text-cyan-400" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={handleFlip}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Flip Card"
            >
              <RotateCw className="w-4 h-4 text-amber-400" />
              <span>Flip (Space)</span>
            </button>

            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Next Card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* New Custom Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0D1527] border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Create New 3D Flashcard</h3>
            <form onSubmit={handleCreateCard} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Topic / Syllabus Module</label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  {syllabusItems.map((item) => (
                    <option key={item.id} value={item.topic}>
                      {item.week}: {item.topic}
                    </option>
                  ))}
                  <option value="General Academic Principles">General Academic Principles</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Front Prompt / Conceptual Question</label>
                <textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  rows={3}
                  placeholder="e.g. What is the Master Theorem condition when f(n) matches the critical polynomial exponent?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Back Explanation / Solution</label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  rows={4}
                  placeholder="e.g. Case 2: T(n) = Θ(n^{log_b a} log^{k+1} n). Work is evenly distributed across all tree levels."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer"
                >
                  Save to Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
