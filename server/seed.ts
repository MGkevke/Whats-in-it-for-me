import {
  createLesson,
  addStudentResponse,
  publishLesson,
} from "./db.js";

// Demo lesson: De Franse Revolutie
const summary = `De Franse Revolutie (1789-1799) veranderde Frankrijk en de hele wereld voorgoed. Het begon toen gewone burgers genoeg hadden van honger, hoge belastingen en een koning die niet luisterde.

De belangrijkste gebeurtenissen: de bestorming van de Bastille, de afschaffing van de monarchie, en de Verklaring van de Rechten van de Mens. Uiteindelijk werd koning Lodewijk XVI onthoofd. De revolutie eindigde toen Napoleon Bonaparte de macht greep. De ideeën van vrijheid, gelijkheid en broederschap leven tot vandaag voort.`;

const cards = [
  {
    stelling: "De Franse Revolutie begon in 1789 met de bestorming van de Bastille.",
    correct: true,
    uitleg: "Klopt! De bestorming van de Bastille op 14 juli 1789 wordt gezien als het begin van de Franse Revolutie.",
  },
  {
    stelling: "Napoleon Bonaparte was de koning die werd onthoofd tijdens de Franse Revolutie.",
    correct: false,
    uitleg: "Onjuist. Koning Lodewijk XVI werd onthoofd. Napoleon greep juist de macht aan het einde van de revolutie.",
  },
  {
    stelling: "De Franse Revolutie introduceerde de ideeën van vrijheid, gelijkheid en broederschap.",
    correct: true,
    uitleg: "Klopt! 'Liberté, égalité, fraternité' werd het motto van de revolutie en is nog steeds het motto van Frankrijk.",
  },
];

console.log("Seeding database...");

// Create the demo lesson
const lesson = createLesson({
  subject: "De Franse Revolutie",
  course_name: "Geschiedenis",
  code: "DEMO-0001",
  summary,
  cards_json: JSON.stringify(cards),
  status: "draft",
});

// Publish the lesson
publishLesson(lesson.id);

console.log(`Created lesson: ${lesson.code} (${lesson.id})`);

// Create 5 fake student responses
const studentResponses = [
  {
    student_name: "Lisa de Vries",
    card_results: [
      { cardIndex: 0, correct: true },
      { cardIndex: 1, correct: true },
      { cardIndex: 2, correct: true },
    ],
    wishes: [
      "Ik wil meer weten over het dagelijks leven tijdens de revolutie",
      "Hoe was het voor gewone mensen?",
    ],
  },
  {
    student_name: "Tom Bakker",
    card_results: [
      { cardIndex: 0, correct: true },
      { cardIndex: 1, correct: false },
      { cardIndex: 2, correct: true },
    ],
    wishes: [
      "Meer over Napoleon en wat er na de revolutie gebeurde",
      "Waarom duurde de revolutie zo lang?",
    ],
  },
  {
    student_name: "Sanne Jansen",
    card_results: [
      { cardIndex: 0, correct: false },
      { cardIndex: 1, correct: true },
      { cardIndex: 2, correct: false },
    ],
    wishes: [
      "Ik snap niet goed waarom de koning werd onthoofd",
      "Meer uitleg over de oorzaken van de revolutie",
    ],
  },
  {
    student_name: "Daan Mulder",
    card_results: [
      { cardIndex: 0, correct: true },
      { cardIndex: 1, correct: true },
      { cardIndex: 2, correct: true },
    ],
    wishes: [
      "Vergelijking met andere revoluties in de wereld",
      "Wat is de invloed op de Nederlandse geschiedenis?",
    ],
  },
  {
    student_name: "Eva Smit",
    card_results: [
      { cardIndex: 0, correct: true },
      { cardIndex: 1, correct: false },
      { cardIndex: 2, correct: true },
    ],
    wishes: [
      "Meer over de rol van vrouwen in de revolutie",
      "Ik wil meer weten over het dagelijks leven tijdens de revolutie",
    ],
  },
];

for (const student of studentResponses) {
  addStudentResponse({
    lesson_id: lesson.id,
    student_name: student.student_name,
    card_results_json: JSON.stringify(student.card_results),
    wishes_json: JSON.stringify(student.wishes),
  });
  console.log(`  Added response from ${student.student_name}`);
}

console.log("\nSeed completed successfully!");
console.log(`Lesson code: ${lesson.code}`);
console.log(`Total student responses: ${studentResponses.length}`);
