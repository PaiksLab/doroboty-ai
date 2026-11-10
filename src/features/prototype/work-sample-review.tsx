import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  criterionStatusOptions,
  reviewDecisionOptions,
  workSample,
  workSampleCriteria,
  type CriterionStatus,
  type ReviewDecision,
  type WorkSampleReviewDraft,
} from "./work-sample";

export function WorkSampleReview({
  draft,
  completed,
  onDraftChange,
  onComplete,
}: {
  draft: WorkSampleReviewDraft;
  completed: boolean;
  onDraftChange: (draft: WorkSampleReviewDraft) => void;
  onComplete: () => void;
}) {
  function updateCriterion(
    id: keyof WorkSampleReviewDraft["criterionStatuses"],
    value: CriterionStatus,
  ) {
    onDraftChange({
      ...draft,
      criterionStatuses: { ...draft.criterionStatuses, [id]: value },
    });
  }

  function updateDecision(value: ReviewDecision) {
    onDraftChange({ ...draft, decision: value });
  }

  function updateText(field: "evidence" | "openQuestion", value: string) {
    onDraftChange({ ...draft, [field]: value });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onComplete();
  }

  const selectedDecision = reviewDecisionOptions.find((option) => option.value === draft.decision);

  return (
    <div className="work-sample">
      <h3>{workSample.title}</h3>
      <p className="work-sample-disclosure">
        Materiał demonstracyjny. Treść odpowiedzi jest fikcyjna, została przygotowana na potrzeby
        prototypu i nie pochodzi od Marka ani z modelu AI. To ćwiczenie nie jest używane
        produkcyjnie.
      </p>
      <p>{workSample.brief}</p>
      <dl className="work-sample-facts">
        <div>
          <dt>Czas</dt>
          <dd>{workSample.timebox}</dd>
        </div>
        <div>
          <dt>AI</dt>
          <dd>{workSample.aiPolicy}</dd>
        </div>
        <div>
          <dt>Użycie odpowiedzi</dt>
          <dd>{workSample.use}</dd>
        </div>
      </dl>

      <section className="work-sample-block" aria-labelledby="work-sample-answer-title">
        <h4 id="work-sample-answer-title">Odpowiedź demonstracyjna</h4>
        <blockquote>{workSample.response}</blockquote>
      </section>

      <form className="work-sample-review-form" onSubmit={submit}>
        <fieldset className="work-sample-criteria">
          <legend>Kryteria do omówienia</legend>
          <p className="record-caption">
            To propozycje do rozmowy, a nie zwalidowana skala ani automatyczna ocena kompetencji.
          </p>
          <ol className="work-sample-criteria-list">
            {workSampleCriteria.map((criterion) => (
              <li key={criterion.id}>
                <h4>{criterion.label}</h4>
                <p>{criterion.description}</p>
                <fieldset className="work-sample-choice-group">
                  <legend>Co widzisz w odpowiedzi?</legend>
                  <div className="work-sample-choice-options">
                    {criterionStatusOptions.map((option, index) => (
                      <label className="work-sample-choice" key={option.value}>
                        <input
                          type="radio"
                          name={`criterion-${criterion.id}`}
                          value={option.value}
                          checked={draft.criterionStatuses[criterion.id] === option.value}
                          required={index === 0}
                          onChange={() => updateCriterion(criterion.id, option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
        </fieldset>

        <fieldset className="work-sample-choice-group work-sample-decision">
          <legend>Jaki następny krok proponujesz?</legend>
          <div className="work-sample-choice-options">
            {reviewDecisionOptions.map((option, index) => (
              <label className="work-sample-choice" key={option.value}>
                <input
                  type="radio"
                  name="work-sample-decision"
                  value={option.value}
                  checked={draft.decision === option.value}
                  required={index === 0}
                  onChange={() => updateDecision(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="work-sample-field" htmlFor="work-sample-evidence">
          <span>Wskaż fragment odpowiedzi, który wspiera Twoją decyzję.</span>
          <Textarea
            id="work-sample-evidence"
            name="work-sample-evidence"
            required
            maxLength={2000}
            rows={3}
            value={draft.evidence}
            onChange={(event) => updateText("evidence", event.target.value)}
          />
        </label>

        <label className="work-sample-field" htmlFor="work-sample-question">
          <span>Czego nadal nie wiesz? Zapisz jedno pytanie do kandydata.</span>
          <Textarea
            id="work-sample-question"
            name="work-sample-question"
            required
            maxLength={2000}
            rows={3}
            value={draft.openQuestion}
            onChange={(event) => updateText("openQuestion", event.target.value)}
          />
        </label>

        <p className="record-caption">
          Ten wybór jest ćwiczeniowy: nie zmienia etapu aplikacji ani nie zapisuje się do konta.
        </p>
        <Button type="submit">
          {completed ? "Odśwież podsumowanie" : "Pokaż podsumowanie oceny"}
        </Button>
      </form>

      {completed && selectedDecision && (
        <section
          className="work-sample-result"
          aria-labelledby="work-sample-result-title"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <h4 id="work-sample-result-title">Podsumowanie oceny — w tej sesji</h4>
          <p>
            <strong>Następny krok:</strong> {selectedDecision.label}
          </p>
          <p>
            <strong>Dowód:</strong> {draft.evidence}
          </p>
          <p>
            <strong>Pytanie:</strong> {draft.openQuestion}
          </p>
          <ul>
            {workSampleCriteria.map((criterion) => {
              const status = criterionStatusOptions.find(
                (option) => option.value === draft.criterionStatuses[criterion.id],
              );
              return (
                <li key={criterion.id}>
                  <strong>{criterion.label}:</strong> {status?.label}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
