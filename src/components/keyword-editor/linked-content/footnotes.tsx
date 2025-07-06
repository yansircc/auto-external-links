"use client";

import type { EditorMessages } from "../core/messages";
import type { Footnote } from "../core/types";

interface FootnotesProps {
	footnotes: Footnote[];
	messages: EditorMessages["linkedContent"];
}

export function Footnotes({ footnotes, messages }: FootnotesProps) {
	if (footnotes.length === 0) return null;

	return (
		<div className="mt-8 border-t pt-6">
			<h3 className="mb-4 font-medium text-sm">{messages.footnotes}</h3>
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
