import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import lessonsRouter from "./routes/lessons.js";
import { parseFile } from "./fileParser.js";
import {
  createLesson,
  addStudentResponse,
  publishLesson,
  getLessonByCode,
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

// Mount lesson routes
app.use("/api/lessons", lessonsRouter);

// File upload endpoint
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const text = await parseFile(filePath, mimeType);

    res.json({
      text,
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to process uploaded file" });
  }
});

// Seed demo endpoint
app.post("/api/seed-demo", (_req, res) => {
  try {
    // Check if demo lesson already exists
    const existing = getLessonByCode("DEMO-0001");
    if (existing) {
      res.json({ message: "Demo data already exists", lessonId: existing.id });
      return;
    }

    const summary = `De Franse Revolutie (1789-1799) veranderde Frankrijk en de hele wereld voorgoed. Het begon toen gewone burgers genoeg hadden van honger, hoge belastingen en een koning die niet luisterde.

De belangrijkste gebeurtenissen: de bestorming van de Bastille, de afschaffing van de monarchie, en de Verklaring van de Rechten van de Mens. Uiteindelijk werd koning Lodewijk XVI onthoofd. De revolutie eindigde toen Napoleon Bonaparte de macht greep. De ideeën van vrijheid, gelijkheid en broederschap leven tot vandaag voort.`;

    const cards = [
      { stelling: "De Franse Revolutie begon in 1789 met de bestorming van de Bastille.", correct: true, uitleg: "Klopt! De bestorming van de Bastille op 14 juli 1789 wordt gezien als het begin van de Franse Revolutie." },
      { stelling: "Napoleon Bonaparte was de koning die werd onthoofd tijdens de Franse Revolutie.", correct: false, uitleg: "Onjuist. Koning Lodewijk XVI werd onthoofd. Napoleon greep juist de macht aan het einde van de revolutie." },
      { stelling: "De Franse Revolutie introduceerde de ideeën van vrijheid, gelijkheid en broederschap.", correct: true, uitleg: "Klopt! 'Liberté, égalité, fraternité' werd het motto van de revolutie en is nog steeds het motto van Frankrijk." },
    ];

    const lesson = createLesson({
      subject: "De Franse Revolutie",
      course_name: "Geschiedenis",
      code: "DEMO-0001",
      summary,
      cards_json: JSON.stringify(cards),
      status: "draft",
    });
    publishLesson(lesson.id);

    const students = [
      { name: "Lisa de Vries", results: [{ cardIndex: 0, correct: true }, { cardIndex: 1, correct: true }, { cardIndex: 2, correct: true }], wishes: ["Ik wil meer weten over het dagelijks leven tijdens de revolutie", "Hoe was het voor gewone mensen?"] },
      { name: "Tom Bakker", results: [{ cardIndex: 0, correct: true }, { cardIndex: 1, correct: false }, { cardIndex: 2, correct: true }], wishes: ["Meer over Napoleon en wat er na de revolutie gebeurde", "Waarom duurde de revolutie zo lang?"] },
      { name: "Sanne Jansen", results: [{ cardIndex: 0, correct: false }, { cardIndex: 1, correct: true }, { cardIndex: 2, correct: false }], wishes: ["Ik snap niet goed waarom de koning werd onthoofd", "Meer uitleg over de oorzaken van de revolutie"] },
      { name: "Daan Mulder", results: [{ cardIndex: 0, correct: true }, { cardIndex: 1, correct: true }, { cardIndex: 2, correct: true }], wishes: ["Vergelijking met andere revoluties in de wereld", "Wat is de invloed op de Nederlandse geschiedenis?"] },
      { name: "Eva Smit", results: [{ cardIndex: 0, correct: true }, { cardIndex: 1, correct: false }, { cardIndex: 2, correct: true }], wishes: ["Meer over de rol van vrouwen in de revolutie", "Ik wil meer weten over het dagelijks leven tijdens de revolutie"] },
    ];

    for (const s of students) {
      addStudentResponse({
        lesson_id: lesson.id,
        student_name: s.name,
        card_results_json: JSON.stringify(s.results),
        wishes_json: JSON.stringify(s.wishes),
      });
    }

    res.json({ message: "Demo data created", lessonId: lesson.id });
  } catch (error) {
    console.error("Seed demo error:", error);
    res.status(500).json({ error: "Failed to seed demo data" });
  }
});

// Auto-seed demo data on startup
function seedDemoData() {
  try {
    const existing = getLessonByCode("DEMO-0001");
    if (existing) {
      console.log("Demo data already exists (DEMO-0001)");
      return;
    }

    const summary = `De Franse Revolutie (1789-1799) veranderde Frankrijk en de hele wereld voorgoed. Het begon toen gewone burgers genoeg hadden van honger, hoge belastingen en een koning die niet luisterde.

De belangrijkste gebeurtenissen: de bestorming van de Bastille, de afschaffing van de monarchie, en de Verklaring van de Rechten van de Mens. Uiteindelijk werd koning Lodewijk XVI onthoofd. De revolutie eindigde toen Napoleon Bonaparte de macht greep. De ideeën van vrijheid, gelijkheid en broederschap leven tot vandaag voort.`;

    const cards = [
      { stelling: "De Franse Revolutie begon in 1789 met de bestorming van de Bastille.", correct: true, uitleg: "Klopt! De bestorming van de Bastille op 14 juli 1789 wordt gezien als het begin van de Franse Revolutie." },
      { stelling: "Napoleon Bonaparte was de koning die werd onthoofd tijdens de Franse Revolutie.", correct: false, uitleg: "Onjuist. Koning Lodewijk XVI werd onthoofd. Napoleon greep juist de macht aan het einde van de revolutie." },
      { stelling: "De Franse Revolutie introduceerde de ideeën van vrijheid, gelijkheid en broederschap.", correct: true, uitleg: "Klopt! 'Liberté, égalité, fraternité' werd het motto van de revolutie en is nog steeds het motto van Frankrijk." },
    ];

    const lesson = createLesson({
      subject: "De Franse Revolutie",
      course_name: "Geschiedenis",
      code: "DEMO-0001",
      summary,
      cards_json: JSON.stringify(cards),
      status: "draft",
    });
    publishLesson(lesson.id);

    const students = [
      { name: "Lisa de Vries", results: [{ cardIndex: 0, correct: true }, { cardIndex: 1, correct: true }, { cardIndex: 2, correct: true }], wishes: ["Ik wil meer weten over het dagelijks leven tijdens de revolutie", "Hoe was het voor gewone mensen?"] },
      { name: "Tom Bakker", results: [{ cardIndex: 0, correct: true }, { cardIndex: 1, correct: false }, { cardIndex: 2, correct: true }], wishes: ["Meer over Napoleon en wat er na de revolutie gebeurde", "Waarom duurde de revolutie zo lang?"] },
      { name: "Sanne Jansen", results: [{ cardIndex: 0, correct: false }, { cardIndex: 1, correct: true }, { cardIndex: 2, correct: false }], wishes: ["Ik snap niet goed waarom de koning werd onthoofd", "Meer uitleg over de oorzaken van de revolutie"] },
      { name: "Daan Mulder", results: [{ cardIndex: 0, correct: true }, { cardIndex: 1, correct: true }, { cardIndex: 2, correct: true }], wishes: ["Vergelijking met andere revoluties in de wereld", "Wat is de invloed op de Nederlandse geschiedenis?"] },
      { name: "Eva Smit", results: [{ cardIndex: 0, correct: true }, { cardIndex: 1, correct: false }, { cardIndex: 2, correct: true }], wishes: ["Meer over de rol van vrouwen in de revolutie", "Ik wil meer weten over het dagelijks leven tijdens de revolutie"] },
    ];

    for (const s of students) {
      addStudentResponse({
        lesson_id: lesson.id,
        student_name: s.name,
        card_results_json: JSON.stringify(s.results),
        wishes_json: JSON.stringify(s.wishes),
      });
    }

    console.log("Demo data seeded successfully (DEMO-0001)");
  } catch (error) {
    console.error("Failed to seed demo data:", error);
  }
}

seedDemoData();

app.listen(PORT, () => {
  console.log(`LesPrep server running on http://localhost:${PORT}`);
});
