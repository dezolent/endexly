"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQBlockProps = {
  blockType: "faq";
  heading?: string | null;
  subheading?: string | null;
  items: FAQItem[];
  primaryColor?: string;
};

function FAQItem({
  question,
  answer,
  primaryColor,
}: FAQItem & { primaryColor: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-medium text-gray-900">{question}</span>
        <ChevronDown
          className="h-5 w-5 shrink-0 transition-transform"
          style={{
            color: primaryColor,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="pb-5 text-gray-600 leading-relaxed">{answer}</div>
      )}
    </div>
  );
}

export function FAQBlock({
  heading = "Frequently Asked Questions",
  subheading,
  items,
  primaryColor = "#2563eb",
}: FAQBlockProps) {
  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-6">
        {(heading || subheading) && (
          <div className="text-center mb-10">
            {heading && (
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="text-lg text-gray-600">{subheading}</p>
            )}
          </div>
        )}
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-200 px-6">
          {items.map((item, i) => (
            <FAQItem key={i} {...item} primaryColor={primaryColor} />
          ))}
        </div>
      </div>
    </section>
  );
}
