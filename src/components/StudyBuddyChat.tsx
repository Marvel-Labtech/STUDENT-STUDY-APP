import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  FileText, 
  Layers, 
  Lightbulb, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, Flashcard, SyllabusItem } from '../types';
import { ASSETS } from '../utils/assets';

interface StudyBuddyChatProps {
  syllabusItems: SyllabusItem[];
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  onAddFlashcardsToDeck: (cards: Array<{ front: string; back: string; topic: string }>) => void;
  onNavigateToFlashcards: () => void;
}

export const StudyBuddyChat: React.FC<StudyBuddyChatProps> = ({
  syllabusItems,
  selectedTopic,
  onSelectTopic,
  onAddFlashcardsToDeck,
  onNavigateToFlashcards,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text: `Hello! I'm **Astro**, your dedicated AI Study Buddy. Select any topic from your synced syllabus or paste your lecture notes below. I can deliver step-by-step concept breakdowns, extract automated 3D flashcards, and highlight exam traps to avoid!`,
      timestamp: 'Just now',
      topicRef: selectedTopic || 'Algorithms & Systems',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedCardsId, setAddedCardsId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topicRef: selectedTopic,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const activeSyllabusItem = syllabusItems.find((i) => i.topic === selectedTopic);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          topic: selectedTopic || activeSyllabusItem?.topic || 'Core Academic Topic',
          syllabusContext: {
            topic: selectedTopic,
            notes: studentNotes || activeSyllabusItem?.notes,
            readings: activeSyllabusItem?.readings,
            assignment: activeSyllabusItem?.assignmentDue,
          },
          history: messages.slice(-4),
        }),
      });

      if (!response.ok) {
        throw new Error('Chat API returned error');
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        text: data.reply || "Let's review the fundamental invariants governing this topic.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        topicRef: selectedTopic,
        generatedCards: data.generatedCards,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Offline / fallback response
      const fallbackReply = `### Key Takeaways: ${selectedTopic || 'Selected Concept'}\n\n1. **Core Principle**: Understand how subproblem states map directly to optimal parent states.\n2. **Critical Invariant**: Preconditions must remain satisfied across every inductive step.\n3. **Exam Trap**: Pay close attention to boundary cases (e.g. empty lists, disconnected nodes, or leaf nodes).`;

      setMessages((prev) => [
        ...prev,
        {
          id: `ast-fb-${Date.now()}`,
          role: 'assistant',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          topicRef: selectedTopic,
          generatedCards: [
            {
              front: `Core Definition: ${selectedTopic || 'Fundamental Invariant'}`,
              back: `The invariant condition that must hold true at every iteration or inductive transition.`,
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCards = (msgId: string, cards: Array<{ front: string; back: string }>) => {
    onAddFlashcardsToDeck(
      cards.map((c) => ({
        ...c,
        topic: selectedTopic || 'AI Study Buddy Concept',
      }))
    );
    setAddedCardsId(msgId);
    setTimeout(() => setAddedCardsId(null), 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[550px] bg-[#0D1527] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Top Header Bar with Synced Topic Dropdown & Notes Toggle */}
      <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={ASSETS.buddyAvatar}
              alt="Astro AI Study Buddy"
              className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#090D16] rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-tight">Astro AI Study Buddy</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-mono">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized concept explanations, automated flashcards, and exam advice.
            </p>
          </div>
        </div>

        {/* Dynamic Syllabus Topic Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={selectedTopic}
              onChange={(e) => onSelectTopic(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="" className="bg-slate-900">Select Syllabus Topic...</option>
              {syllabusItems.map((item) => (
                <option key={item.id} value={item.topic} className="bg-slate-900">
                  {item.week}: {item.topic}
                </option>
              ))}
            </select>
          </div>

          {/* Student Notes Drawer Button */}
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className={`px-2.5 py-1 text-xs rounded-lg border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showNotesDrawer
                ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Attach Notes</span>
          </button>
        </div>
      </div>

      {/* Expandable Notes Drawer */}
      {showNotesDrawer && (
        <div className="bg-slate-900/95 border-b border-slate-800 p-3 sm:p-4 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span>Student Lecture Notes / Excerpt / Upload:</span>
            <span className="text-[11px] text-slate-500">Will be injected as context for Astro</span>
          </div>
          <textarea
            value={studentNotes}
            onChange={(e) => setStudentNotes(e.target.value)}
            rows={3}
            placeholder="Paste your rough lecture notes, professor slides, textbook paragraphs, or assignment prompts here..."
            className="w-full bg-[#090D16] border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          />
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isUser && (
                <img
                  src={ASSETS.buddyAvatar}
                  alt="Astro"
                  className="w-8 h-8 rounded-lg object-cover border border-cyan-500/40 shrink-0 mt-0.5"
                  referrerPolicy="no-referrer"
                />
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs'
                }`}
              >
                {/* Topic tag kicker */}
                {msg.topicRef && !isUser && (
                  <div className="text-[11px] font-mono text-cyan-400 font-semibold mb-1 flex items-center gap-1.5">
                    <span>Topic:</span>
                    <span>{msg.topicRef}</span>
                  </div>
                )}

                {/* Formatted Text */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={pIdx} className="text-sm sm:text-base font-bold text-white pt-1">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('• ') || paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                      return (
                        <div key={pIdx} className="pl-2 space-y-1 border-l-2 border-cyan-500/40 my-1 text-slate-200">
                          {paragraph.split('\n').map((item, iIdx) => (
                            <div key={iIdx}>{item}</div>
                          ))}
                        </div>
                      );
                    }
                    return <p key={pIdx}>{paragraph}</p>;
                  })}
                </div>

                {/* Automated Flashcards Block */}
                {msg.generatedCards && msg.generatedCards.length > 0 && (
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-950/70 border border-indigo-800/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Generated Flashcard for 3D Deck</span>
                      </span>
                      {addedCardsId === msg.id ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                          <Check className="w-3 h-3" /> Added to Deck!
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddCards(msg.id, msg.generatedCards!)}
                          className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Add to Deck (+5 XP)
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {msg.generatedCards.map((card, cIdx) => (
                        <div key={cIdx} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <div className="text-cyan-300 font-medium">Q: {card.front}</div>
                          <div className="text-slate-300 mt-1">A: {card.back}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer timestamp and copy */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <img
              src={ASSETS.buddyAvatar}
              alt="Astro"
              className="w-8 h-8 rounded-lg object-cover border border-cyan-500/40 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-xs p-4 flex items-center gap-2 text-xs text-cyan-300">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Astro is analyzing concept invariants and synthesizing explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Shortcuts */}
      <div className="px-4 py-2 bg-slate-900/70 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-slate-500 shrink-0">Quick Prompts:</span>
        <button
          onClick={() => handleSendMessage(`Provide a step-by-step breakdown of ${selectedTopic || 'this topic'} with clear proof intuition and examples.`)}
          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 shrink-0"
        >
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Step-by-step Breakdown</span>
        </button>

        <button
          onClick={() => handleSendMessage(`Summarize the core takeaways and formula invariants for ${selectedTopic || 'this topic'} in 3 concise bullet points.`)}
          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 shrink-0"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Quick Summary</span>
        </button>

        <button
          onClick={() => handleSendMessage(`Generate active-recall flashcards for ${selectedTopic || 'this topic'} testing deep theoretical mechanisms.`)}
          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 shrink-0"
        >
          <Layers className="w-3 h-3 text-indigo-400" />
          <span>Generate Flashcards</span>
        </button>

        <button
          onClick={() => handleSendMessage(`What are the common exam traps or subtle student pitfalls in ${selectedTopic || 'this topic'}?`)}
          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 shrink-0"
        >
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>Common Exam Traps</span>
        </button>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask Astro about ${selectedTopic || 'any study concept, formula, or proof'}...`}
          className="flex-1 bg-[#090D16] border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
