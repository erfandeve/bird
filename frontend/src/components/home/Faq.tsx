import { ChevronDown } from "lucide-react";
import { JsonLd } from "@/components/layout/JsonLd";
import { faqs } from "@/lib/data/content";

export function FaqList() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <div className="divide-y divide-olive-200 border-y border-olive-200">
        {faqs.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex min-h-14 list-none items-center justify-between gap-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="max-w-[70ch] pb-4 leading-8 text-olive-800">{f.a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
