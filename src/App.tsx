import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GamificationBar } from './components/GamificationBar';
import { SyllabusView } from './components/SyllabusView';
import { StudyBuddyChat } from './components/StudyBuddyChat';
import { FlashcardDeck } from './components/FlashcardDeck';
import { PomodoroTimer } from './components/PomodoroTimer';
import { QuizGenerator } from './components/QuizGenerator';
import { LevelUpModal } from './components/LevelUpModal';
import { AchievementsModal } from './components/AchievementsModal';
import { 
  Flashcard, 
  FlashcardMastery, 
  GamificationState, 
  SyllabusConfig, 
  SyllabusItem, 
  SyllabusStatus 
} from './types';
import { 
  INITIAL_FLASHCARDS, 
  INITIAL_GAMIFICATION_STATE, 
  INITIAL_QUIZ_QUESTIONS, 
  calculateLevel 
} from './utils/initialData';
import { PRESET_SYLLABI } from './utils/syllabusParser';

const LOCAL_STORAGE_KEYS = {
  GAMIFICATION: 'astro_gamification_v1',
  SYLLABUS_ITEMS: 'astro_syllabus_items_v1',
  SYLLABUS_CONFIG: 'astro_syllabus_config_v1',
  FLASHCARDS: 'astro_flashcards_v1',
};

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'syllabus' | 'buddy' | 'flashcards' | 'pomodoro' | 'quiz'>('syllabus');

  // Active selected study topic (synchronized across AI Buddy, Flashcards, Pomodoro, Quiz)
  const [selectedTopic, setSelectedTopic] = useState<string>('Asymptotic Analysis & Divide-and-Conquer');

  // Gamification State (Loaded from LocalStorage with fallback)
  const [gamification, setGamification] = useState<GamificationState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.GAMIFICATION);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_GAMIFICATION_STATE;
  });

  // Syllabus Items State (Loaded from LocalStorage with fallback to CS 161 standard)
  const [syllabusItems, setSyllabusItems] = useState<SyllabusItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SYLLABUS_ITEMS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return PRESET_SYLLABI.cs161.items;
  });

  // Syllabus Configuration State
  const [syllabusConfig, setSyllabusConfig] = useState<SyllabusConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SYLLABUS_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      sheetUrlOrId: 'cs161',
      courseName: PRESET_SYLLABI.cs161.meta.name,
      courseCode: PRESET_SYLLABI.cs161.meta.code,
      term: PRESET_SYLLABI.cs161.meta.term,
      lastSyncedAt: 'Today at 09:30 AM',
      syncSource: 'template',
    };
  });

  // Flashcards Deck State
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.FLASHCARDS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_FLASHCARDS;
  });

  // Modals
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.GAMIFICATION, JSON.stringify(gamification));
  }, [gamification]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SYLLABUS_ITEMS, JSON.stringify(syllabusItems));
  }, [syllabusItems]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SYLLABUS_CONFIG, JSON.stringify(syllabusConfig));
  }, [syllabusConfig]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
  }, [flashcards]);

  /**
   * Central Gamification & Streak State Engine
   */
  const awardXPAndActivity = (
    xpGained: number,
    action: {
      type: 'pomodoro' | 'card_mastered' | 'quiz' | 'syllabus_complete';
      focusMinutes?: number;
      isPerfectQuiz?: boolean;
    }
  ) => {
    setGamification((prev) => {
      const todayISO = new Date().toISOString().split('T')[0];

      // Calendar state machine for streaks
      let newStreak = prev.currentStreak;
      let newActivityDates = [...prev.activityDates];

      if (!newActivityDates.includes(todayISO)) {
        newActivityDates.push(todayISO);
      }

      if (prev.lastStudiedDate !== todayISO) {
        if (prev.lastStudiedDate) {
          const lastDate = new Date(prev.lastStudiedDate);
          const currDate = new Date(todayISO);
          const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      }

      const newBestStreak = Math.max(prev.bestStreak, newStreak);
      const newTotalXP = prev.totalXP + xpGained;

      // Level computation
      const levelResult = calculateLevel(newTotalXP);
      const levelIncreased = levelResult.level > prev.level;

      if (levelIncreased) {
        setLevelUpData({
          level: levelResult.level,
          title: levelResult.title,
        });
      }

      // Update metrics
      let newPomodoros = prev.totalPomodorosCompleted;
      let newCardsMastered = prev.totalCardsMastered;
      let newQuizzesPassed = prev.totalQuizzesPassed;
      let newFocusMinutes = prev.todayFocusMinutes;

      if (action.type === 'pomodoro' && action.focusMinutes) {
        newPomodoros += 1;
        newFocusMinutes += action.focusMinutes;
      } else if (action.type === 'card_mastered') {
        newCardsMastered += 1;
      } else if (action.type === 'quiz') {
        newQuizzesPassed += 1;
      }

      // Check achievements progress
      const updatedAchievements = prev.achievements.map((ach) => {
        let newProgress = ach.progress;
        let unlockedAt = ach.unlockedAt;

        if (ach.id === 'first_spark' && newStreak >= 1) {
          newProgress = 1;
          if (!unlockedAt) unlockedAt = todayISO;
        } else if (ach.id === 'deep_focus' && newPomodoros >= 1) {
          newProgress = 1;
          if (!unlockedAt) unlockedAt = todayISO;
        } else if (ach.id === 'card_master') {
          newProgress = Math.min(newCardsMastered, 5);
          if (newCardsMastered >= 5 && !unlockedAt) unlockedAt = todayISO;
        } else if (ach.id === 'quiz_ace' && action.isPerfectQuiz) {
          newProgress = 1;
          if (!unlockedAt) unlockedAt = todayISO;
        } else if (ach.id === 'syllabus_master' && action.type === 'syllabus_complete') {
          newProgress = 1;
          if (!unlockedAt) unlockedAt = todayISO;
        } else if (ach.id === 'streak_titan') {
          newProgress = Math.min(newStreak, 3);
          if (newStreak >= 3 && !unlockedAt) unlockedAt = todayISO;
        }

        return {
          ...ach,
          progress: newProgress,
          unlockedAt,
        };
      });

      return {
        ...prev,
        currentStreak: newStreak,
        bestStreak: newBestStreak,
        lastStudiedDate: todayISO,
        activityDates: newActivityDates,
        totalXP: newTotalXP,
        level: levelResult.level,
        levelTitle: levelResult.title,
        xpToNextLevel: Math.max(levelResult.nextLevelXP - newTotalXP, 0),
        achievements: updatedAchievements,
        totalPomodorosCompleted: newPomodoros,
        totalCardsMastered: newCardsMastered,
        totalQuizzesPassed: newQuizzesPassed,
        todayFocusMinutes: newFocusMinutes,
      };
    });
  };

  /**
   * Action Handlers
   */
  const handleSyllabusStatusChange = (id: string, newStatus: SyllabusStatus) => {
    setSyllabusItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (newStatus === 'Completed' && item.status !== 'Completed') {
            awardXPAndActivity(15, { type: 'syllabus_complete' });
          }
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  const handleUpdateCardStatus = (cardId: string, status: FlashcardMastery) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          if (status === 'mastered' && card.status !== 'mastered') {
            awardXPAndActivity(5, { type: 'card_mastered' });
          }
          return {
            ...card,
            status,
            reviewCount: card.reviewCount + 1,
            lastReviewedAt: new Date().toISOString(),
          };
        }
        return card;
      })
    );
  };

  const handleAddNewCard = (newCardData: Omit<Flashcard, 'id' | 'reviewCount'>) => {
    const card: Flashcard = {
      ...newCardData,
      id: `fc-${Date.now()}`,
      reviewCount: 0,
    };
    setFlashcards((prev) => [card, ...prev]);
  };

  const handleAddFlashcardsFromChat = (
    newCards: Array<{ front: string; back: string; topic: string }>
  ) => {
    const created: Flashcard[] = newCards.map((c, i) => ({
      id: `fc-chat-${Date.now()}-${i}`,
      front: c.front,
      back: c.back,
      topic: c.topic,
      status: 'unreviewed',
      reviewCount: 0,
      tags: [c.topic, 'AI Generated'],
    }));

    setFlashcards((prev) => [...created, ...prev]);
    awardXPAndActivity(5, { type: 'card_mastered' });
  };

  const handlePomodoroCompleted = (focusMinutes: number) => {
    awardXPAndActivity(10, { type: 'pomodoro', focusMinutes });
  };

  const handleQuizCompleted = (percentage: number, isPerfect: boolean) => {
    const xpReward = isPerfect ? 50 : percentage >= 70 ? 25 : 10;
    awardXPAndActivity(xpReward, { type: 'quiz', isPerfectQuiz: isPerfect });
  };

  // Cross-Navigation Shortcuts
  const handleSelectTopicForStudy = (topic: string) => {
    setSelectedTopic(topic);
    setActiveTab('buddy');
  };

  const handleSelectTopicForCards = (topic: string) => {
    setSelectedTopic(topic);
    setActiveTab('flashcards');
  };

  const handleSelectTopicForQuiz = (topic: string) => {
    setSelectedTopic(topic);
    setActiveTab('quiz');
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 3-Zone Strict Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gamification={gamification}
        onOpenAchievements={() => setShowAchievementsModal(true)}
      />

      {/* Gamification Streak & XP Progress Bar */}
      <GamificationBar
        gamification={gamification}
        onOpenAchievements={() => setShowAchievementsModal(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'syllabus' && (
          <SyllabusView
            items={syllabusItems}
            config={syllabusConfig}
            onUpdateItems={setSyllabusItems}
            onUpdateConfig={setSyllabusConfig}
            onSelectTopicForStudy={handleSelectTopicForStudy}
            onSelectTopicForQuiz={handleSelectTopicForQuiz}
            onSelectTopicForCards={handleSelectTopicForCards}
            onStatusChange={handleSyllabusStatusChange}
          />
        )}

        {activeTab === 'buddy' && (
          <StudyBuddyChat
            syllabusItems={syllabusItems}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            onAddFlashcardsToDeck={handleAddFlashcardsFromChat}
            onNavigateToFlashcards={() => setActiveTab('flashcards')}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardDeck
            cards={flashcards}
            syllabusItems={syllabusItems}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            onUpdateCardStatus={handleUpdateCardStatus}
            onAddNewCard={handleAddNewCard}
            totalCardsMastered={gamification.totalCardsMastered}
          />
        )}

        {activeTab === 'pomodoro' && (
          <PomodoroTimer
            syllabusItems={syllabusItems}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            onPomodoroCompleted={handlePomodoroCompleted}
            totalCompletedSessions={gamification.totalPomodorosCompleted}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizGenerator
            questions={INITIAL_QUIZ_QUESTIONS}
            syllabusItems={syllabusItems}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            onQuizCompleted={handleQuizCompleted}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#090D16] border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AstroStudy · Active Learning & Cognitive Recall Engine</span>
          <span className="font-mono tabular-nums">
            {gamification.currentStreak}d Streak · Lv {gamification.level} ({gamification.totalXP} XP)
          </span>
        </div>
      </footer>

      {/* Celebratory Level-Up Modal */}
      {levelUpData && (
        <LevelUpModal
          newLevel={levelUpData.level}
          newTitle={levelUpData.title}
          totalXP={gamification.totalXP}
          onClose={() => setLevelUpData(null)}
        />
      )}

      {/* Achievements Showcase Modal */}
      {showAchievementsModal && (
        <AchievementsModal
          gamification={gamification}
          onClose={() => setShowAchievementsModal(false)}
        />
      )}
    </div>
  );
}
