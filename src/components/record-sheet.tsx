import type { ReactNode } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { Button } from "@/components/ui/button";

type RecordSection = { value: string; label: string; content: ReactNode };

export function RecordSheet({
  label,
  sections,
  attachment,
  children,
  footer,
  onSectionChange,
}: {
  label: string;
  sections: RecordSection[];
  attachment?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onSectionChange?: (value: string | null) => void;
}) {
  return (
    <section className="record-sheet" aria-label={label}>
      <h2 className="sr-only">{label}</h2>
      <Tabs.Root defaultValue={sections[0]?.value} onValueChange={onSectionChange}>
        <Tabs.List className="record-tabs" aria-label={label} activateOnFocus>
          {sections.map((section) => (
            <Tabs.Tab
              key={section.value}
              value={section.value}
              className="record-tab"
              render={<Button variant="ghost" />}
            >
              {section.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {attachment && <div className="record-attachment">{attachment}</div>}
        {sections.map((section) => (
          <Tabs.Panel key={section.value} value={section.value} className="record-reading">
            {section.content}
          </Tabs.Panel>
        ))}
      </Tabs.Root>
      {children && <div className="record-section">{children}</div>}
      {footer && <footer className="record-footer">{footer}</footer>}
    </section>
  );
}
