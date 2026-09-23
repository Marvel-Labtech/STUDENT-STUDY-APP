import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Circle, 
  MessageSquare, 
  HelpCircle, 
  Layers, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  BookOpen
} from 'lucide-react';
import { SyllabusConfig, SyllabusItem, SyllabusStatus } from '../types';
import { fetchGoogleSheetSyllabus, PRESET_SYLLABI } from '../utils/syllabusParser';
import { ASSETS } from '../utils/assets';

interface SyllabusViewProps {
  items: SyllabusItem[];
  config: SyllabusConfig;
  onUpdateItems: (items: SyllabusItem[]) => void;
  onUpdateConfig: (config: SyllabusConfig) => void;
  onSelectTopicForStudy: (topic: string) => void;
  onSelectTopicForQuiz: (topic: string) => void;
  onSelectTopicForCards: (topic: string) => void;
  onStatusChange: (id: string, newStatus: SyllabusStatus) => void;
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({
  items,
  config,
  onUpdateItems,
  onUpdateConfig,
  onSelectTopicForStudy,
  onSelectTopicForQuiz,
  onSelectTopicForCards,
  onStatusChange,
}) => {
  const [sheetInput, setSheetInput] = useState(config.sheetUrlOrId || 'cs161');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | SyllabusStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<{ week: string; topic: string; readings: string; assignmentDue: string }>({
    week: `Week ${items.length + 1}`,
    topic: '',
    readings: '',
    assignmentDue: '',
  });

  const handleSync = async (inputToSync = sheetInput) => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const result = await fetchGoogleSheetSyllabus(inputToSync);
      onUpdateItems(result.items);
      onUpdateConfig({
        sheetUrlOrId: inputToSync,
        courseName: result.courseMeta.name,
        courseCode: result.courseMeta.code,
        term: result.courseMeta.term,
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        syncSource: result.source,
      });
      setSyncMessage(`Successfully synchronized ${result.items.length} syllabus modules!`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch {
      setSyncMessage('Failed to sync. Reverting to cached syllabus structure.');
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.topic.trim()) return;

    const created: SyllabusItem = {
      id: `custom-mod-${Date.now()}`,
      week: newItem.week || `Week ${items.length + 1}`,
      topic: newItem.topic.trim(),
      readings: newItem.readings.trim() || 'Course Materials',
      assignmentDue: newItem.assignmentDue.trim() || 'None',
      status: 'Not Started',
    };

    onUpdateItems([...items, created]);
    setShowAddModal(false);
    setNewItem({ week: `Week ${items.length + 2}`, topic: '', readings: '', assignmentDue: '' });
  };

  const filteredItems = items.filter((item) => {
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch =
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.readings.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignmentDue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const completedCount = items.filter((i) => i.status === 'Completed').length;
  const inProgressCount = items.filter((i) => i.status === 'In Progress').length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Google Sheets Syllabus Engine Configuration Bar */}
      <section className="bg-[#0D1527] border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white tracking-tight">
                Google Sheets Syllabus Engine
              </h2>
              <span className="text-xs text-slate-400 hidden sm:inline">
                · Standard Schema (Week, Topic, Readings, Assignment Due, Status)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synchronize your active course syllabus from Google Drive, Sheets URL, or sample academic curriculum.
            </p>
          </div>

          {/* Sync status & Last synced timestamp */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {config.lastSyncedAt && (
              <span>Last synced at <span className="text-slate-200 font-mono">{config.lastSyncedAt}</span></span>
            )}
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Synced
            </span>
          </div>
        </div>

        {/* Input & Action controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={sheetInput}
              onChange={(e) => setSheetInput(e.target.value)}
              placeholder="Paste Google Sheet URL, File ID, or choose a curriculum preset..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
            />
          </div>

          <button
            onClick={() => handleSync(sheetInput)}
            disabled={isSyncing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/20 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync Syllabus'}</span>
          </button>
        </div>

        {/* Presets & Quick Pickers */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Quick Curriculum Presets:</span>
          {Object.entries(PRESET_SYLLABI).map(([key, val]) => (
            <button
              key={key}
              onClick={() => {
                setSheetInput(key);
                handleSync(key);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              {val.meta.code}: {val.meta.name.split('&')[0]}
            </button>
          ))}
        </div>

        {syncMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}
      </section>

      {/* Course Overview & Progress Dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Enrolled Course</div>
          <div className="mt-1">
            <div className="text-base font-bold text-white tracking-tight">{config.courseCode}</div>
            <div className="text-xs text-cyan-300 truncate">{config.courseName}</div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">{config.term}</div>
        </div>

        <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Curriculum Progress</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {progressPercent}%
            </span>
            <span className="text-xs text-slate-400">
              ({completedCount} of {items.length} completed)
            </span>
          </div>
          <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Active Workload</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {inProgressCount}
            </span>
            <span className="text-xs text-slate-400">modules in progress</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400/80">
            {items.length - completedCount - inProgressCount} modules upcoming
          </div>
        </div>

        <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Quick Curriculum Action</div>
          <div className="mt-1">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Custom Topic</span>
            </button>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Syncs to AI Buddy & Quizzes
          </div>
        </div>
      </section>

      {/* Study Planner Table */}
      <section className="bg-[#0D1527] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Syllabus Roadmap & Study Planner</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any module to launch the AI Tutor, Flashcard Review, or Practice Quiz.
            </p>
          </div>

          {/* Interactive filter & search controls */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search topic or reading..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Empty state fallback if no modules */}
        {filteredItems.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <img
              src={ASSETS.emptySyllabus}
              alt="Empty syllabus blueprint"
              className="w-28 h-28 object-contain rounded-xl border border-slate-800 shadow-md"
              referrerPolicy="no-referrer"
            />
            <h4 className="text-sm font-semibold text-slate-200">No matching syllabus modules found</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Try adjusting your search query, clearing filters, or syncing a standard course curriculum above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 w-20">Week</th>
                  <th className="py-3 px-4">Topic / Module</th>
                  <th className="py-3 px-4 hidden md:table-cell">Required Readings</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Assignment Due</th>
                  <th className="py-3 px-4 w-36">Status</th>
                  <th className="py-3 px-4 text-right">Study Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {filteredItems.map((item) => {
                  const isExpanded = expandedRow === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-slate-800/40 transition-colors group">
                        {/* Week Column */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-400 whitespace-nowrap">
                          {item.week}
                        </td>

                        {/* Topic Column */}
                        <td className="py-3.5 px-4 font-medium text-slate-100">
                          <div className="flex items-center gap-2">
                            <span>{item.topic}</span>
                            {item.keyPoints && item.keyPoints.length > 0 && (
                              <button
                                onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                                className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                                title="Toggle study notes"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                          {/* Mobile readings subtext */}
                          <div className="md:hidden text-[11px] text-slate-400 mt-0.5 truncate">
                            {item.readings}
                          </div>
                        </td>

                        {/* Readings Column */}
                        <td className="py-3.5 px-4 hidden md:table-cell text-slate-400 max-w-xs truncate">
                          {item.readings}
                        </td>

                        {/* Assignment Due Column */}
                        <td className="py-3.5 px-4 hidden lg:table-cell text-slate-300 max-w-xs truncate font-mono text-[11px]">
                          {item.assignmentDue}
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={item.status}
                            onChange={(e) => onStatusChange(item.id, e.target.value as SyllabusStatus)}
                            className={`text-xs px-2.5 py-1 rounded-md border font-medium focus:outline-none cursor-pointer ${
                              item.status === 'Completed'
                                ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
                                : item.status === 'In Progress'
                                ? 'bg-amber-950/50 border-amber-700/60 text-amber-300'
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed (+15 XP)</option>
                          </select>
                        </td>

                        {/* Quick Study Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onSelectTopicForStudy(item.topic)}
                              className="px-2 py-1 rounded-md bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                              title="Ask AI Study Buddy about this topic"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span className="hidden sm:inline">Ask AI</span>
                            </button>

                            <button
                              onClick={() => onSelectTopicForCards(item.topic)}
                              className="px-2 py-1 rounded-md bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 text-indigo-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                              title="Study flashcards for this topic"
                            >
                              <Layers className="w-3 h-3" />
                              <span className="hidden sm:inline">Cards</span>
                            </button>

                            <button
                              onClick={() => onSelectTopicForQuiz(item.topic)}
                              className="px-2 py-1 rounded-md bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                              title="Take dynamic quiz on this topic"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">Quiz</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Notes & Key Invariants Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-900/40">
                          <td colSpan={6} className="py-3 px-6 text-xs text-slate-300 border-t border-slate-800/80">
                            <div className="space-y-2">
                              {item.notes && (
                                <div>
                                  <span className="text-cyan-400 font-semibold">Core Concept Note: </span>
                                  <span>{item.notes}</span>
                                </div>
                              )}
                              {item.keyPoints && item.keyPoints.length > 0 && (
                                <div>
                                  <span className="text-slate-400 font-semibold block mb-1">Key Theoretical Invariants:</span>
                                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-2">
                                    {item.keyPoints.map((pt, idx) => (
                                      <li key={idx}>{pt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add Custom Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0D1527] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Add Custom Syllabus Module</h3>
            <form onSubmit={handleAddCustomItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Week / Unit</label>
                <input
                  type="text"
                  value={newItem.week}
                  onChange={(e) => setNewItem({ ...newItem, week: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Topic / Subject</label>
                <input
                  type="text"
                  value={newItem.topic}
                  onChange={(e) => setNewItem({ ...newItem, topic: e.target.value })}
                  placeholder="e.g. Dynamic Programming or Neural Pathways"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Required Readings</label>
                <input
                  type="text"
                  value={newItem.readings}
                  onChange={(e) => setNewItem({ ...newItem, readings: e.target.value })}
                  placeholder="e.g. Chapter 4 or Paper Title"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assignment Due Date / Task</label>
                <input
                  type="text"
                  value={newItem.assignmentDue}
                  onChange={(e) => setNewItem({ ...newItem, assignmentDue: e.target.value })}
                  placeholder="e.g. Problem Set 2 on Friday"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100"
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
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium cursor-pointer"
                >
                  Add Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
