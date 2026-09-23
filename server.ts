import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Server-side Google GenAI initialization per skill guidelines
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * AI Study Buddy Chat Endpoint
 */
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, topic, syllabusContext, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (ai) {
    try {
      const systemInstruction = `You are Astro, an elite, interactive AI Study Buddy and academic tutor for students.
Your mission is to help students truly master concepts without overwhelming them with walls of text.
When answering:
1. Provide a crisp, intuitive 1-2 sentence core explanation first.
2. Break complex ideas down into step-by-step logical bullet points.
3. Call out common student misconceptions or exam traps ("Trap to Avoid").
4. If relevant, propose 1-2 memory mnemonics or flashcard candidates.
Current Study Topic: ${topic || 'General Academic Focus'}
Syllabus Context: ${syllabusContext ? JSON.stringify(syllabusContext) : 'Standard University Curriculum'}
Keep the tone encouraging, intellectual, and razor-sharp.`;

      const contents = [
        ...history.slice(-4).map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }],
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "Let's break that down into foundational principles.";

      // Check if flashcard extraction is useful
      let generatedCards: Array<{ front: string; back: string }> | undefined = undefined;
      if (message.toLowerCase().includes('flashcard') || message.toLowerCase().includes('card') || message.toLowerCase().includes('quiz')) {
        generatedCards = [
          {
            front: `Core Principle: ${topic || 'Study Concept'}`,
            back: replyText.split('\n')[0].replace(/^#+\s*/, '') || replyText.slice(0, 140),
          },
        ];
      }

      return res.json({
        reply: replyText,
        generatedCards,
        topic,
      });
    } catch (err: any) {
      console.warn('Gemini chat fallback engaged:', err?.message || err);
    }
  }

  // Fallback intelligent response engine if Gemini API key is missing or offline
  const fallbackReplies: Record<string, string> = {
    summary: `### Core Summary: ${topic || 'Selected Topic'}\n\n1. **Fundamental Mechanism**: Systems are best understood by analyzing how subproblems compose into optimal global solutions.\n2. **Critical Invariant**: Always ensure preconditions and edge cases are tracked across each state transition.\n3. **Exam Focus**: Expect questions comparing asymptotic tradeoffs, space vs time efficiency, and failure modes under adversarial inputs.\n\n*Action tip: Review the related 3D flashcards or initiate a quick Pomodoro sprint to solidify this.*`,
    flashcards: `Here are key concepts transformed for active recall:\n\n• **Front**: What is the recurrence for divide-and-conquer?\n  **Back**: T(n) = aT(n/b) + f(n), where a is subproblem branches and n/b is subproblem size.\n\n• **Front**: How do we prevent exponential recursion?\n  **Back**: Apply memoization (caching past solutions) or iterative bottom-up DP tabulation.`,
    explain: `### Step-by-Step Breakdown: ${topic || 'Core Principle'}\n\n1. **Intuition**: Think of this concept like an assembly line where each stage only needs knowledge of the immediate prior step.\n2. **The Mechanism**: By enforcing strict invariants, we transform an otherwise intractable O(2^n) search space into a linear or polynomial path.\n3. **Exam Trap**: Don't confuse worst-case guarantees with expected/amortized performance!`,
  };

  const lower = message.toLowerCase();
  let selected = fallbackReplies.explain;
  if (lower.includes('summar') || lower.includes('key point') || lower.includes('overview')) {
    selected = fallbackReplies.summary;
  } else if (lower.includes('flashcard') || lower.includes('deck') || lower.includes('card')) {
    selected = fallbackReplies.flashcards;
  }

  res.json({
    reply: selected,
    topic: topic || 'Active Study Topic',
  });
});

/**
 * Dynamic Quiz Generator Endpoint
 */
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  const { topic = 'Core Principles', count = 3 } = req.body;

  if (ai) {
    try {
      const prompt = `Generate ${count} high-yield, university-level multiple choice questions on the topic: "${topic}".
Each question must include:
- A clear, scenario-based question stem.
- Exactly 4 realistic options (A, B, C, D) without obvious false tell-tales.
- The 0-based index of the correct option (0 for A, 1 for B, 2 for C, 3 for D).
- A detailed "Why is this correct?" markdown explanation explaining the precise theoretical mechanism and why this choice is right.
- A concise "Common Trap" explaining why students frequently fall for the distractors.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                whyWrong: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctIndex', 'explanation'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        const questions = parsed.map((q: any, idx: number) => ({
          id: `quiz-gen-${Date.now()}-${idx}`,
          topic,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          whyWrong: q.whyWrong || 'Distractor options fail because they overlook the critical boundary conditions.',
        }));
        return res.json({ questions });
      }
    } catch (err: any) {
      console.warn('Gemini quiz generation fallback:', err?.message || err);
    }
  }

  // Fallback high-quality curated question set
  const fallbackQuestions = [
    {
      id: `quiz-fb-${Date.now()}-1`,
      topic,
      question: `Regarding ${topic}, which of the following statements represents the fundamental invariant governing its optimal execution?`,
      options: [
        'A) All recursive subproblems must be computed independently without memoization',
        'B) The optimal solution to the global problem incorporates optimal solutions to overlapping sub-instances',
        'C) Execution runtime scales exponentially regardless of input state distribution',
        'D) In-place transformation requires auxiliary stack space proportional to O(2^n)',
      ],
      correctIndex: 1,
      explanation: `**Why this is correct:** The hallmark principle of optimal substructure dictates that an optimal global state is constructed directly from already-optimal sub-solutions. This guarantees that greedy or dynamic-programming recurrence relations maintain correctness without exhaustive backtracking.`,
      whyWrong: `Option A leads directly to exponential O(2^n) re-computation. Option C is false because structured invariants reduce search complexity to polynomial time. Option D wildly exaggerates stack bounds.`,
    },
    {
      id: `quiz-fb-${Date.now()}-2`,
      topic,
      question: `When evaluating adversarial worst-case inputs in ${topic}, what design choice provides the strongest safeguard?`,
      options: [
        'A) Randomization of pivot or hashing function from a 2-universal family',
        'B) Relying strictly on deterministic fixed first-element selection',
        'C) Omitting load-factor re-balancing to minimize CPU cycles',
        'D) Using single-threaded synchronous polling without timeout guards',
      ],
      correctIndex: 0,
      explanation: `**Why this is correct:** Randomization chosen independently of input guarantees that no fixed adversarial dataset can force quadratic Θ(n²) behavior. Universal hashing ensures an expected O(1) collision bound regardless of key distribution.`,
      whyWrong: `Fixed selection (B) is notoriously vulnerable to sorted or maliciously crafted inputs. Omitting re-balancing (C) degrades search trees into degenerate linear linked lists.`,
    },
    {
      id: `quiz-fb-${Date.now()}-3`,
      topic,
      question: `What distinguishes expected runtime from amortized runtime in algorithm analysis for ${topic}?`,
      options: [
        'A) Expected runtime uses random variables over coin flips; amortized runtime averages over any worst-case sequence of operations without probabilities',
        'B) Expected runtime is strictly worse than worst-case runtime',
        'C) Amortized runtime only applies to hardware cache lines',
        'D) Both terms are mathematically identical synonyms',
      ],
      correctIndex: 0,
      explanation: `**Why this is correct:** Expected runtime relies on probabilistic randomness within the algorithm itself (e.g. randomized quicksort). Amortized analysis (e.g. dynamic array doubling or disjoint-set union) proves that ANY valid sequence of n operations takes O(n) total time in the deterministic worst case, averaging out occasional expensive steps.`,
      whyWrong: `They represent completely distinct mathematical proof frameworks: probability over algorithm coin flips vs deterministic sequence accounting (potential method/aggregate method).`,
    },
  ];

  return res.json({ questions: fallbackQuestions });
});

/**
 * Dynamic Flashcards Generator Endpoint
 */
app.post('/api/generate-flashcards', async (req: Request, res: Response) => {
  const { topic = 'Academic Concept', text = '', count = 4 } = req.body;

  if (ai) {
    try {
      const prompt = `Generate ${count} high-retention flashcards for active recall study on the topic: "${topic}".
Context notes: "${text.slice(0, 1000)}"
Each flashcard must have:
- "front": A concise, challenging question or prompt testing understanding rather than simple vocabulary.
- "back": A clear, punchy answer with 1-3 bullet points or key takeaway.
- "tags": 1-2 keyword tags.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['front', 'back'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cards = parsed.map((c: any, i: number) => ({
          id: `card-gen-${Date.now()}-${i}`,
          topic,
          front: c.front,
          back: c.back,
          tags: c.tags || [topic],
          status: 'unreviewed',
          reviewCount: 0,
        }));
        return res.json({ cards });
      }
    } catch (err: any) {
      console.warn('Gemini flashcard generation fallback:', err?.message || err);
    }
  }

  // Fallback flashcards
  const fallbackCards = [
    {
      id: `card-fb-${Date.now()}-1`,
      topic,
      front: `What is the core definition and significance of ${topic}?`,
      back: `It establishes the fundamental structure where components interact under strict invariant conditions, preventing cascading state degradation.`,
      tags: [topic, 'Foundations'],
      status: 'unreviewed',
      reviewCount: 0,
    },
    {
      id: `card-fb-${Date.now()}-2`,
      topic,
      front: `What is the most common student pitfall when solving problems in ${topic}?`,
      back: `Failing to check boundary constraints (e.g. null leaves, empty sets, or off-by-one indices) before applying recursive transitions.`,
      tags: [topic, 'Traps'],
      status: 'unreviewed',
      reviewCount: 0,
    },
  ];

  res.json({ cards: fallbackCards });
});

// Vite Middleware for Development / Static Serve for Production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`AstroStudy server listening on port ${PORT}`);
  });
}

setupVite();
