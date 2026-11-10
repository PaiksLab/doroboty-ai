import { useState, type ReactNode, type Ref } from "react";
import { BackLink } from "@/components/back-link";
import { ProcessTimeline } from "@/components/process-timeline";
import { RecordSheet } from "@/components/record-sheet";
import { CvAttachment } from "./cv-attachment";
import { MatchScore } from "./match-score";
import { stageLabels, type Application, type Stage } from "./model";
import { createEmptyWorkSampleReviewDraft } from "./work-sample";
import { WorkSampleReview } from "./work-sample-review";

type RecordEvent = { stage: Stage; at: string; note?: string };
const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Role controllers authorize the record and project the history before rendering. */
export function ApplicationRecord({
  application,
  companyName,
  audience,
  history,
  showWorkSample = false,
  statusRef,
  children,
  footer,
}: {
  application: Pick<
    Application,
    "candidateId" | "candidateName" | "jobTitle" | "stage" | "answer" | "cv" | "score" | "summary"
  >;
  companyName: string;
  audience: "candidate" | "employer";
  history: RecordEvent[];
  showWorkSample?: boolean;
  statusRef?: Ref<HTMLSpanElement>;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const candidate = audience === "candidate";
  const title = candidate ? application.jobTitle : application.candidateName;
  const context = candidate ? application.candidateName : application.jobTitle;
  const submitted = history[0];
  const [workSampleDraft, setWorkSampleDraft] = useState(createEmptyWorkSampleReviewDraft);
  const [workSampleCompleted, setWorkSampleCompleted] = useState(false);
  const includeWorkSample = showWorkSample && !candidate;
  const sections = [
    {
      value: "answer",
      label: "Odpowiedź",
      content: (
        <>
          <h3>Przesłana aplikacja</h3>
          <p>{application.answer}</p>
        </>
      ),
    },
    ...(includeWorkSample
      ? [
          {
            value: "work-sample",
            label: "Próbka pracy",
            content: (
              <WorkSampleReview
                draft={workSampleDraft}
                completed={workSampleCompleted}
                onDraftChange={(draft) => {
                  setWorkSampleDraft(draft);
                  setWorkSampleCompleted(false);
                }}
                onComplete={() => setWorkSampleCompleted(true)}
              />
            ),
          },
        ]
      : []),
    {
      value: "cv",
      label: "CV",
      content: (
        <>
          <h3>CV z momentu aplikowania</h3>
          <CvAttachment
            candidateId={application.candidateId}
            fallbackText={application.cv}
            layout="row"
            preview
          />
        </>
      ),
    },
  ];
  return (
    <article className="recruiting-record">
      <header className="recruiting-header">
        <nav aria-label="Ścieżka nawigacji" className="record-breadcrumb">
          <BackLink to={candidate ? "/app/aplikacje" : "/app/kandydaci"}>
            {candidate ? "Moje aplikacje" : "Kandydaci"}
          </BackLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>
        <h1>{title}</h1>
        <div className="record-meta">
          <span>
            {context} · {companyName}
          </span>
          <span className="record-stage" tabIndex={-1} ref={statusRef}>
            {stageLabels[application.stage]}
          </span>
          <MatchScore score={application.score} />
          {submitted && (
            <span>
              Złożona:{" "}
              <time dateTime={submitted.at}>{dateFormat.format(new Date(submitted.at))}</time>
            </span>
          )}
        </div>
      </header>
      <div className="recruiting-layout">
        <RecordSheet
          label={candidate ? "Twoja wysłana aplikacja" : "Materiały kandydata"}
          sections={sections}
          footer={footer}
        >
          {children}
        </RecordSheet>
        <aside className="recruiting-margin" aria-label="Historia i podsumowanie">
          <section aria-labelledby="process-heading">
            <h2 id="process-heading">Historia procesu</h2>
            <ProcessTimeline
              items={history.map((event, index) => ({
                id: `${index}-${event.at}`,
                title: stageLabels[event.stage],
                dateTime: event.at,
                content: event.note || undefined,
              }))}
            />
          </section>
          <section className="record-summary" aria-labelledby="summary-heading">
            <h2 id="summary-heading">Podsumowanie</h2>
            <p>{application.summary}</p>
          </section>
        </aside>
      </div>
    </article>
  );
}
