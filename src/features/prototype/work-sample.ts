export const workSample = {
  title: "Wybierz ograniczony pilotaż automatyzacji w finansach",
  brief:
    "BrightLabs chce wybrać jeden proces finansowy do małego pilota. Wskaż problem użytkownika, zaproponuj próbę z mierzalnym wynikiem i obsługą wyjątków, a następnie opisz swój wkład oraz użyte narzędzia.",
  timebox: "Około 10 minut — propozycja demonstracyjna do sprawdzenia.",
  aiPolicy: "Możesz korzystać z AI. Opisz, co narzędzie wniosło i co samodzielnie sprawdziłeś.",
  use: "Ćwiczenie wykorzystuje wyłącznie fikcyjne dane. Odpowiedź służy do rozmowy i nie będzie użyta w pracy produkcyjnej.",
  response:
    "Wybrałbym sprawdzanie podstawowych pól faktury, bo dziś zespół przepisuje je do arkusza i ręcznie porównuje dokumenty. Na początek porównałbym ręczną pracę z ekstrakcją AI na 20 syntetycznych fakturach w dwóch układach. Mierzyłbym czas sprawdzenia i liczbę poprawek; każdy niepewny wynik zatwierdzałaby osoba z finansów. W poprzednim projekcie prowadziłem badania i koordynowałem wdrożenie automatyzacji, które skróciło czas odpowiedzi o 25%; inżynier zbudował integrację. Użyłem ChatGPT do listy typowych wyjątków. Nie ustaliłem jeszcze progu błędów, po którym zatrzymalibyśmy pilota.",
} as const;

export const workSampleCriteria = [
  {
    id: "problem",
    label: "Wybór problemu i pilota",
    description: "Czy odpowiedź wiąże wybrany proces z konkretną potrzebą użytkownika?",
  },
  {
    id: "test",
    label: "Sposób sprawdzenia",
    description: "Czy proponowany test mierzy wynik i uwzględnia jakość lub wyjątki?",
  },
  {
    id: "contribution",
    label: "Wkład i użycie narzędzi",
    description: "Czy wiadomo, co zrobił kandydat, co zespół i jak użyto AI?",
  },
] as const;

export type WorkSampleCriterionId = (typeof workSampleCriteria)[number]["id"];
export type CriterionStatus = "evidence" | "follow-up" | "missing";
export type ReviewDecision = "invite" | "clarify" | "decline";

export type WorkSampleReviewDraft = {
  criterionStatuses: Record<WorkSampleCriterionId, CriterionStatus | "">;
  decision: ReviewDecision | "";
  evidence: string;
  openQuestion: string;
};

export const criterionStatusOptions: { value: CriterionStatus; label: string }[] = [
  { value: "evidence", label: "Jest dowód" },
  { value: "follow-up", label: "Do dopytania" },
  { value: "missing", label: "Nie widzę dowodu" },
];

export const reviewDecisionOptions: { value: ReviewDecision; label: string }[] = [
  { value: "invite", label: "Zaprosić na rozmowę" },
  { value: "clarify", label: "Dopytać o wkład lub próg błędów" },
  { value: "decline", label: "Nie kontynuować" },
];

export function createEmptyWorkSampleReviewDraft(): WorkSampleReviewDraft {
  return {
    criterionStatuses: { problem: "", test: "", contribution: "" },
    decision: "",
    evidence: "",
    openQuestion: "",
  };
}
