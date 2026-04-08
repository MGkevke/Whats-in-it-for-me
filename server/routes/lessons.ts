import { Router } from "express";
import type { Request, Response } from "express";
import {
  createLesson,
  getLesson,
  getLessonByCode,
  updateLesson,
  publishLesson,
  addChatMessage,
  getChatMessages,
  addStudentResponse,
  getStudentResponses,
  getAllLessons,
} from "../db.js";
import { callClaude } from "./ai.js";

const router = Router();

// POST /api/lessons - Create a lesson
router.post("/", async (req: Request, res: Response) => {
  try {
    const { subject, course_name, extra_context, file_text } = req.body;

    if (!subject) {
      res.status(400).json({ error: "Subject is required" });
      return;
    }

    // Create the lesson in draft status first
    const lesson = createLesson({
      subject,
      course_name,
      extra_context,
      file_text,
    });

    // Call Claude to generate summary and cards
    const prompt = `Je bent een educatieve AI-assistent. Genereer het volgende op basis van het lesonderwerp en eventuele extra context:

1. **Samenvatting**: Een ZEER korte samenvatting (max 150 woorden) van het lesonderwerp. Het doel is dat studenten in 60 seconden snappen WAAR de les over gaat. Gebruik simpele taal, geen jargon. Maak het visueel scanbaar met 1-2 korte paragrafen. Begin met één pakkende openingszin.

2. **Swipe-kaartjes**: Precies 3 kaartjes. Elk kaartje is een simpele stelling over het lesonderwerp die juist of onjuist is. De stellingen moeten makkelijk te beantwoorden zijn als je de samenvatting hebt gelezen. Mix juiste en onjuiste stellingen.

Lesonderwerp: ${subject}
${extra_context ? `Extra context van de docent: ${extra_context}` : ""}
${file_text ? `Inhoud van het lesmateriaal:\n${file_text.substring(0, 3000)}` : ""}

Antwoord in dit exacte JSON formaat:
{
  "samenvatting": "...",
  "kaartjes": [
    { "stelling": "...", "correct": true/false, "uitleg": "korte uitleg waarom dit klopt of niet" },
    { "stelling": "...", "correct": true/false, "uitleg": "..." },
    { "stelling": "...", "correct": true/false, "uitleg": "..." }
  ]
}`;

    try {
      const claudeResponse = await callClaude([
        { role: "user", content: prompt },
      ]);

      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const updatedLesson = updateLesson(lesson.id, {
          summary: parsed.samenvatting,
          cards_json: JSON.stringify(parsed.kaartjes),
        });
        res.json(updatedLesson);
        return;
      }

      // If we couldn't parse the response, return the lesson without AI content
      res.json(lesson);
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      // Return the lesson even if AI fails - teacher can refine later
      res.json(lesson);
    }
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({ error: "Failed to create lesson" });
  }
});

// GET /api/lessons - Get all lessons (dashboard)
router.get("/", (_req: Request, res: Response) => {
  try {
    const lessons = getAllLessons();
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

// GET /api/lessons/code/:code - Get lesson by code (for students)
// NOTE: This must be defined BEFORE /:id to avoid "code" being matched as an id
router.get("/code/:code", (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    const lesson = getLessonByCode(code);
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }
    if (lesson.status !== "published") {
      res.status(404).json({ error: "Lesson is not yet published" });
      return;
    }
    res.json(lesson);
  } catch (error) {
    console.error("Error fetching lesson by code:", error);
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
});

// GET /api/lessons/:id - Get a single lesson
router.get("/:id", (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const lesson = getLesson(id);
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }
    res.json(lesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
});

// PUT /api/lessons/:id/publish - Publish a lesson
router.put("/:id/publish", (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const lesson = getLesson(id);
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }
    const published = publishLesson(id);
    res.json(published);
  } catch (error) {
    console.error("Error publishing lesson:", error);
    res.status(500).json({ error: "Failed to publish lesson" });
  }
});

// POST /api/lessons/:id/chat - Chat refinement
router.post("/:id/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const id = req.params.id as string;
    const lesson = getLesson(id);
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }

    // Save the user message
    addChatMessage(lesson.id, "user", message);

    // Get chat history
    const chatMessages = getChatMessages(lesson.id);
    const chatHistory = chatMessages
      .map((m) => `${m.role === "user" ? "Docent" : "Assistent"}: ${m.content}`)
      .join("\n");

    const prompt = `Je bent een educatieve AI-assistent die een docent helpt met het verfijnen van lesmateriaal.

Huidige samenvatting:
${lesson.summary}

Huidige kaartjes:
${lesson.cards_json}

Chatgeschiedenis:
${chatHistory}

Nieuwe instructie van de docent: ${message}

Pas de samenvatting en/of kaartjes aan op basis van de instructie. Geef de VOLLEDIGE bijgewerkte versie terug.

Antwoord in dit exacte JSON formaat:
{
  "samenvatting": "...",
  "kaartjes": [
    { "stelling": "...", "correct": true/false, "uitleg": "..." },
    ...
  ]
}`;

    try {
      const claudeResponse = await callClaude([
        { role: "user", content: prompt },
      ]);

      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const updatedLesson = updateLesson(lesson.id, {
          summary: parsed.samenvatting,
          cards_json: JSON.stringify(parsed.kaartjes),
        });

        // Save the assistant response
        addChatMessage(lesson.id, "assistant", claudeResponse);

        const messages = getChatMessages(lesson.id);
        res.json({ lesson: updatedLesson, messages });
        return;
      }

      // If parsing failed, still save the response
      addChatMessage(lesson.id, "assistant", claudeResponse);
      const messages = getChatMessages(lesson.id);
      res.json({ lesson, messages });
    } catch (aiError) {
      console.error("AI chat error:", aiError);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

// POST /api/lessons/:id/respond - Save student response
router.post("/:id/respond", (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const lesson = getLesson(id);
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }

    const { student_name, card_results, wishes } = req.body;

    const response = addStudentResponse({
      lesson_id: lesson.id,
      student_name: student_name || undefined,
      card_results_json: card_results ? JSON.stringify(card_results) : undefined,
      wishes_json: wishes ? JSON.stringify(wishes) : undefined,
    });

    res.json({ success: true, response });
  } catch (error) {
    console.error("Error saving student response:", error);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// GET /api/lessons/:id/stats - Get card statistics
router.get("/:id/stats", (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const lesson = getLesson(id);
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }

    const responses = getStudentResponses(lesson.id);
    const totalResponses = responses.length;

    if (totalResponses === 0) {
      res.json({ totalResponses: 0, cards: [] });
      return;
    }

    // Aggregate card results
    const cardStats: Record<
      number,
      { understood: number; notUnderstood: number }
    > = {};

    for (const response of responses) {
      if (!response.card_results_json) continue;

      try {
        const cardResults = JSON.parse(response.card_results_json);
        if (Array.isArray(cardResults)) {
          cardResults.forEach(
            (
              result: { cardIndex: number; correct: boolean },
              index: number
            ) => {
              const cardIndex = result.cardIndex ?? index;
              if (!cardStats[cardIndex]) {
                cardStats[cardIndex] = { understood: 0, notUnderstood: 0 };
              }
              if (result.correct) {
                cardStats[cardIndex].understood++;
              } else {
                cardStats[cardIndex].notUnderstood++;
              }
            }
          );
        }
      } catch {
        // Skip malformed results
      }
    }

    const cards = Object.entries(cardStats).map(([index, stats]) => {
      const total = stats.understood + stats.notUnderstood;
      return {
        cardIndex: parseInt(index),
        understood: stats.understood,
        notUnderstood: stats.notUnderstood,
        total,
        understoodPercentage:
          total > 0 ? Math.round((stats.understood / total) * 100) : 0,
        notUnderstoodPercentage:
          total > 0 ? Math.round((stats.notUnderstood / total) * 100) : 0,
      };
    });

    res.json({ totalResponses, cards });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// GET /api/lessons/:id/feedback - Get AI-generated feedback summary
router.get("/:id/feedback", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const lesson = getLesson(id);
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }

    const responses = getStudentResponses(lesson.id);
    if (responses.length === 0) {
      res.json({ bulletpoints: [], totalResponses: 0 });
      return;
    }

    // Collect all wishes
    const allWishes: string[] = [];
    for (const response of responses) {
      if (!response.wishes_json) continue;
      try {
        const wishes = JSON.parse(response.wishes_json);
        if (Array.isArray(wishes)) {
          allWishes.push(...wishes.filter((w: string) => w && w.trim()));
        } else if (typeof wishes === "string" && wishes.trim()) {
          allWishes.push(wishes);
        }
      } catch {
        // Skip malformed wishes
      }
    }

    if (allWishes.length === 0) {
      res.json({ bulletpoints: [], totalResponses: responses.length });
      return;
    }

    const prompt = `Hier zijn de leerwensen van studenten voor het lesonderwerp "${lesson.subject}":
${allWishes.join("\n")}

Maak een gerankte lijst van maximaal 10 bulletpoints die samenvatten wat studenten het meest willen leren. Cluster vergelijkbare wensen. Zet de meest genoemde/belangrijkste bovenaan. Houd het beknopt en actionable voor de docent. Geef bij elk punt aan hoeveel studenten iets vergelijkbaars noemden.

Antwoord in JSON: { "bulletpoints": [{ "punt": "...", "aantal_studenten": N }] }`;

    try {
      const claudeResponse = await callClaude([
        { role: "user", content: prompt },
      ]);

      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({
          bulletpoints: parsed.bulletpoints,
          totalResponses: responses.length,
        });
        return;
      }

      res.json({ bulletpoints: [], totalResponses: responses.length });
    } catch (aiError) {
      console.error("AI feedback error:", aiError);
      res.status(500).json({ error: "Failed to generate feedback" });
    }
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

export default router;
