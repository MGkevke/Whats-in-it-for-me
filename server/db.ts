import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "lesprep.db");
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    course_name TEXT,
    extra_context TEXT,
    file_text TEXT,
    summary TEXT,
    cards_json TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS student_responses (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    student_name TEXT,
    card_results_json TEXT,
    wishes_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
  );
`);

// ---------- Types ----------

export interface Lesson {
  id: string;
  code: string;
  subject: string;
  course_name: string | null;
  extra_context: string | null;
  file_text: string | null;
  summary: string | null;
  cards_json: string | null;
  status: string;
  created_at: string;
}

export interface StudentResponse {
  id: string;
  lesson_id: string;
  student_name: string | null;
  card_results_json: string | null;
  wishes_json: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  lesson_id: string;
  role: string;
  content: string;
  created_at: string;
}

// ---------- Helper functions ----------

export function generateLessonCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const checkUnique = db.prepare("SELECT id FROM lessons WHERE code = ?");

  let code: string;
  do {
    const prefix =
      letters[Math.floor(Math.random() * 26)] +
      letters[Math.floor(Math.random() * 26)] +
      letters[Math.floor(Math.random() * 26)];
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    code = `${prefix}-${suffix}`;
  } while (checkUnique.get(code));

  return code;
}

export function createLesson(data: {
  subject: string;
  course_name?: string;
  extra_context?: string;
  file_text?: string;
  summary?: string;
  cards_json?: string;
  status?: string;
  code?: string;
}): Lesson {
  const id = uuidv4();
  const code = data.code ?? generateLessonCode();

  const stmt = db.prepare(`
    INSERT INTO lessons (id, code, subject, course_name, extra_context, file_text, summary, cards_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    code,
    data.subject,
    data.course_name ?? null,
    data.extra_context ?? null,
    data.file_text ?? null,
    data.summary ?? null,
    data.cards_json ?? null,
    data.status ?? "draft"
  );

  return getLesson(id)!;
}

export function getLesson(id: string): Lesson | undefined {
  const stmt = db.prepare("SELECT * FROM lessons WHERE id = ?");
  return stmt.get(id) as Lesson | undefined;
}

export function getLessonByCode(code: string): Lesson | undefined {
  const stmt = db.prepare("SELECT * FROM lessons WHERE code = ?");
  return stmt.get(code) as Lesson | undefined;
}

export function updateLesson(
  id: string,
  data: Partial<
    Pick<
      Lesson,
      | "subject"
      | "course_name"
      | "extra_context"
      | "file_text"
      | "summary"
      | "cards_json"
      | "status"
    >
  >
): Lesson | undefined {
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return getLesson(id);

  values.push(id);
  const stmt = db.prepare(
    `UPDATE lessons SET ${fields.join(", ")} WHERE id = ?`
  );
  stmt.run(...values);

  return getLesson(id);
}

export function publishLesson(id: string): Lesson | undefined {
  return updateLesson(id, { status: "published" });
}

export function addChatMessage(
  lessonId: string,
  role: string,
  content: string
): ChatMessage {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO chat_messages (id, lesson_id, role, content)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, lessonId, role, content);

  return db.prepare("SELECT * FROM chat_messages WHERE id = ?").get(id) as ChatMessage;
}

export function getChatMessages(lessonId: string): ChatMessage[] {
  const stmt = db.prepare(
    "SELECT * FROM chat_messages WHERE lesson_id = ? ORDER BY created_at ASC"
  );
  return stmt.all(lessonId) as ChatMessage[];
}

export function addStudentResponse(data: {
  lesson_id: string;
  student_name?: string;
  card_results_json?: string;
  wishes_json?: string;
}): StudentResponse {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO student_responses (id, lesson_id, student_name, card_results_json, wishes_json)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    data.lesson_id,
    data.student_name ?? null,
    data.card_results_json ?? null,
    data.wishes_json ?? null
  );

  return db
    .prepare("SELECT * FROM student_responses WHERE id = ?")
    .get(id) as StudentResponse;
}

export function getStudentResponses(lessonId: string): StudentResponse[] {
  const stmt = db.prepare(
    "SELECT * FROM student_responses WHERE lesson_id = ? ORDER BY created_at ASC"
  );
  return stmt.all(lessonId) as StudentResponse[];
}

export function getAllLessons(): Lesson[] {
  const stmt = db.prepare("SELECT * FROM lessons ORDER BY created_at DESC");
  return stmt.all() as Lesson[];
}

export default db;
