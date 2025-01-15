"use client";

import { type Footnote } from "../core/types";
import { useTranslations } from "next-intl";

interface FootnotesProps {
  footnotes: Footnote[];
}

export function Footnotes({ footnotes }: FootnotesProps) {
  const t = useTranslations('keyword-editor.linked-content');
  if (footnotes.length === 0) return null;

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="mb-4 text-sm font-medium">{t('footnotes')}</h3>
      <div className="space-y-3 text-sm">
        {footnotes.map((footnote, index) => {
          const footnoteNumber = index + 1;
          return (
            <div
              key={footnote.keyword}
              id={`footnote-${footnoteNumber}`}
              className="flex gap-2 text-muted-foreground"
            >
              <a
                href={`#link-${footnote.referenceIds[0]}`}
                className="text-xs hover:text-primary"
                aria-label={`Back to reference ${footnoteNumber}`}
              >
                [{footnoteNumber}]
              </a>
              <p>{footnote.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
