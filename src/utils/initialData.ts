import { Achievement, Flashcard, GamificationState, QuizQuestion } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_spark',
    title: 'First Spark',
    description: 'Begin your study journey and activate your daily streak 🔥',
    iconName: 'Flame',
    xpReward: 25,
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'deep_focus',
    title: 'Deep Focus Pioneer',
    description: 'Complete your first full Pomodoro focus block',
    iconName: 'Clock',
    xpReward: 30,
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'card_master',
    title: 'Memory Alchemist',
    description: 'Mark 5 flashcards as Mastered in your 3D deck',
    iconName: 'Sparkles',
    xpReward: 50,
    unlockedAt: null,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'quiz_ace',
    title: 'Grand Quiz Ace',
    description: 'Achieve a 100% perfect score on any dynamic quiz',
    iconName: 'Trophy',
    xpReward: 60,
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'syllabus_master',
    title: 'Syllabus Navigator',
    description: 'Synchronize a Google Sheet syllabus or complete a topic module',
    iconName: 'CheckCircle2',
    xpReward: 40,
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'streak_titan',
    title: 'Astro Constellation',
    description: 'Build a consecutive 3-day study streak',
    iconName: 'Zap',
    xpReward: 80,
    unlockedAt: null,
    progress: 0,
    maxProgress: 3,
  },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    topic: 'Asymptotic Analysis & Divide-and-Conquer',
    front: 'What are the three canonical cases of the Master Theorem for T(n) = aT(n/b) + f(n)?',
    back: '1. If f(n) = O(n^{log_b(a) - ε}) for ε > 0, then T(n) = Θ(n^{log_b(a)}).\n2. If f(n) = Θ(n^{log_b(a)} log^k n), then T(n) = Θ(n^{log_b(a)} log^{k+1} n).\n3. If f(n) = Ω(n^{log_b(a) + ε}) and regularity condition holds (af(n/b) ≤ cf(n) for c < 1), then T(n) = Θ(f(n)).',
    status: 'unreviewed',
    reviewCount: 0,
    tags: ['Master Theorem', 'Divide & Conquer', 'CLRS'],
  },
  {
    id: 'fc-2',
    topic: 'Balanced Search Trees & Hash Tables',
    front: 'What property makes a hash family H "Universal", and what bound does it guarantee?',
    back: 'A family H of hash functions from U to {0, ..., m-1} is universal if for any pair of distinct keys x ≠ y, the probability Pr[h(x) = h(y)] ≤ 1/m when h is chosen uniformly at random from H.\n\nGuarantee: Under universal hashing with chaining, any key lookup takes O(1) expected time, even against an adversary.',
    status: 'unreviewed',
    reviewCount: 0,
    tags: ['Hashing', 'Universal Hash', 'Data Structures'],
  },
  {
    id: 'fc-3',
    topic: 'Graph Algorithms: BFS, DFS & Topological Sort',
    front: 'Why must a directed graph be a DAG to have a topological sorting, and how does DFS find it?',
    back: 'A topological sort linearly orders vertices so that every directed edge (u, v) has u appearing before v. If a graph has a cycle, no such linear ordering exists (mutual precedence contradiction).\n\nDFS algorithm: Run DFS on the DAG. As vertices finish (post-visit), prepend them to a linked list. The resulting list ordered by decreasing finish times is a valid topological sort.',
    status: 'unreviewed',
    reviewCount: 0,
    tags: ['DFS', 'Topological Sort', 'DAG'],
  },
  {
    id: 'fc-4',
    topic: 'Greedy Algorithms & Minimum Spanning Trees',
    front: 'State the Cut Property used to prove greedy correctness in Kruskal and Prim algorithms.',
    back: 'Let G = (V, E) be a connected undirected graph with real edge weights. Let (S, V - S) be any cut of G (a partition of V into two non-empty sets).\n\nIf e = (u, v) is a light edge crossing the cut (i.e. having strictly minimum weight among all edges with one endpoint in S and one in V - S), then e belongs to SOME Minimum Spanning Tree of G.',
    status: 'unreviewed',
    reviewCount: 0,
    tags: ['Cut Property', 'MST', 'Greedy'],
  },
  {
    id: 'fc-5',
    topic: 'Dynamic Programming: Memoization & Subproblems',
    front: 'What are the two essential hallmarks of a problem solvable by Dynamic Programming?',
    back: '1. Optimal Substructure: An optimal solution to the overall problem contains within it optimal solutions to related subproblems.\n\n2. Overlapping Subproblems: A recursive algorithm revisits the same subproblems repeatedly rather than always generating new ones. Storing results in a lookup table (memoization or tabulation) avoids exponential re-computation.',
    status: 'unreviewed',
    reviewCount: 0,
    tags: ['DP', 'Optimal Substructure', 'Algorithms'],
  },
  {
    id: 'fc-6',
    topic: 'Network Flow & Max-Flow Min-Cut Theorem',
    front: 'State the Max-Flow Min-Cut Theorem and its significance.',
    back: 'In any flow network, the maximum value of an s-t flow is exactly equal to the minimum capacity of an s-t cut.\n\nSignificance: It provides a strong duality theorem for network flows, proving that the flow cannot exceed the bottleneck cut, and guarantees that when no augmenting path remains in the residual graph, the current flow is strictly optimal.',
    status: 'unreviewed',
    reviewCount: 0,
    tags: ['Max-Flow', 'Min-Cut', 'Ford-Fulkerson'],
  },
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    topic: 'Asymptotic Analysis & Divide-and-Conquer',
    question: 'Suppose an algorithm has the recurrence relation T(n) = 4T(n/2) + n². What is its asymptotic time complexity by the Master Theorem?',
    options: [
      'A) Θ(n²)',
      'B) Θ(n² log n)',
      'C) Θ(n³)',
      'D) Θ(n log n)',
    ],
    correctIndex: 1,
    explanation: 'Here a = 4, b = 2, and f(n) = n². Calculating n^{log_b(a)} = n^{log_2(4)} = n². Since f(n) = Θ(n^{log_b(a)}) = Θ(n²), this falls directly into Case 2 of the Master Theorem with k = 0. Therefore, T(n) = Θ(n^{log_b(a)} log^{k+1} n) = Θ(n² log n).',
    whyWrong: 'Option A misses the logarithmic factor from having equal work across all recursion tree levels. Option C assumes a larger polynomial exponent than log_2(4)=2. Option D underestimates the subproblem count.',
  },
  {
    id: 'q-2',
    topic: 'Balanced Search Trees & Hash Tables',
    question: 'In a hash table of size m = 100 with simple uniform hashing, what is the expected number of collisions when inserting 50 distinct keys?',
    options: [
      'A) Exactly 0 collisions',
      'B) Approximately 12.25 collisions (by Birthday Paradox calculation)',
      'C) Exactly 50 collisions',
      'D) 25 collisions',
    ],
    correctIndex: 1,
    explanation: 'For n = 50 keys and m = 100 slots, the number of unordered pairs of keys is C(50, 2) = (50 × 49) / 2 = 1225. Under simple uniform hashing, the probability that any specific pair collides is 1/m = 1/100. By linearity of expectation, E[collisions] = 1225 × (1/100) = 12.25 collisions.',
    whyWrong: 'A is virtually impossible due to the birthday problem (p > 99% for at least one collision). C and D do not follow the combinatorial pairs expectation formula.',
  },
  {
    id: 'q-3',
    topic: 'Graph Algorithms: BFS, DFS & Topological Sort',
    question: 'During a Depth-First Search (DFS) on a directed graph G, what type of edge indicates that G contains a directed cycle?',
    options: [
      'A) Tree edge',
      'B) Forward edge',
      'C) Back edge',
      'D) Cross edge',
    ],
    correctIndex: 2,
    explanation: 'A back edge (u, v) connects vertex u to an ancestor v that is currently on the active recursion stack (marked gray/in-progress). Because v was discovered before u and u has a path back to v, this edge directly closes a directed cycle. A directed graph is acyclic if and only if DFS yields NO back edges.',
    whyWrong: 'Tree edges form the DFS spanning forest. Forward edges lead to non-ancestor descendants. Cross edges connect non-ancestor vertices across different branches.',
  },
  {
    id: 'q-4',
    topic: 'Greedy Algorithms & Minimum Spanning Trees',
    question: 'Which data structure allows Kruskal\'s algorithm to achieve an overall running time of O(E log V) or O(E α(V)) after sorting edges?',
    options: [
      'A) Fibonacci Heap',
      'B) Disjoint-Set Union-Find with Path Compression and Union by Rank',
      'C) AVL Balanced Binary Search Tree',
      'D) Suffix Trie',
    ],
    correctIndex: 1,
    explanation: 'Kruskal\'s algorithm inspects edges in increasing weight order. To test whether adding edge (u, v) creates a cycle, it performs find(u) and find(v) queries on a Disjoint-Set (Union-Find) structure. With union-by-rank and path compression, each operation takes amortized almost constant time O(α(V)), where α is the inverse Ackermann function.',
    whyWrong: 'Fibonacci Heaps are utilized in Prim\'s algorithm to optimize decrease-key operations to O(1), not Kruskal\'s edge-cycle detection.',
  },
  {
    id: 'q-5',
    topic: 'Dynamic Programming: Memoization & Subproblems',
    question: 'In the classic 0/1 Knapsack problem with n items and maximum capacity W, why is the O(n W) dynamic programming algorithm termed "pseudo-polynomial"?',
    options: [
      'A) Because it only works for floating point numbers',
      'B) Because the running time is polynomial in the numerical value of W, but exponential in the binary input length of W (which is log₂ W)',
      'C) Because it uses heuristic approximations rather than finding the exact maximum value',
      'D) Because it runs in O(2^n) time on average',
    ],
    correctIndex: 1,
    explanation: 'In computational complexity, input size is measured by the number of bits required to encode the problem instance. The capacity W is encoded in approximately k = log₂ W bits. An algorithm running in O(n W) = O(n 2^k) operations is exponential with respect to the input length of W, making it pseudo-polynomial rather than strictly polynomial.',
    whyWrong: 'A is incorrect (0/1 knapsack typically operates on integer weights). C is false because the DP algorithm is exact, not an approximation. D is untrue because the DP table size is strictly n × W.',
  },
];

export function calculateLevel(totalXP: number): { level: number; title: string; currentLevelBaseXP: number; nextLevelXP: number; progressRatio: number } {
  const levels = [
    { level: 1, minXP: 0, title: 'Novice Explorer' },
    { level: 2, minXP: 100, title: 'Cadet Scholar' },
    { level: 3, minXP: 250, title: 'Astromath Practitioner' },
    { level: 4, minXP: 450, title: 'Deep Focus Adept' },
    { level: 5, minXP: 700, title: 'Quantum Strategist' },
    { level: 6, minXP: 1050, title: 'Stellar Grandmaster' },
    { level: 7, minXP: 1500, title: 'Constellation Paragon' },
  ];

  let current = levels[0];
  let next = levels[1];

  for (let i = 0; i < levels.length; i++) {
    if (totalXP >= levels[i].minXP) {
      current = levels[i];
      next = levels[i + 1] || { level: current.level + 1, minXP: current.minXP + 500, title: 'Legendary Luminary' };
    } else {
      break;
    }
  }

  const span = next.minXP - current.minXP;
  const progress = Math.min(Math.max((totalXP - current.minXP) / span, 0), 1);

  return {
    level: current.level,
    title: current.title,
    currentLevelBaseXP: current.minXP,
    nextLevelXP: next.minXP,
    progressRatio: progress,
  };
}

export const INITIAL_GAMIFICATION_STATE: GamificationState = {
  currentStreak: 1,
  bestStreak: 1,
  lastStudiedDate: new Date().toISOString().split('T')[0],
  activityDates: [new Date().toISOString().split('T')[0]],
  totalXP: 120, // Start with Level 2 Cadet Scholar to show active progress
  level: 2,
  levelTitle: 'Cadet Scholar',
  xpToNextLevel: 130, // 250 - 120
  achievements: INITIAL_ACHIEVEMENTS,
  totalPomodorosCompleted: 1,
  totalCardsMastered: 0,
  totalQuizzesPassed: 0,
  todayFocusMinutes: 25,
};
