import React from "react";
import { content, useLang } from "../i18n.jsx";

export default function Impact() {
  const { t } = useLang();
  const s = content.impact;
  return (
    <section id="impact" className="max-w-6xl mx-auto px-5 py-20">
      <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
      <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-10 max-w-lg">{t(s.title)}</h2>

      <p className="text-sm font-semibold text-forest-700 mb-3">{t(s.highlightsLabel)}</p>
      <div className="flex flex-wrap gap-2">
        {s.highlights.map((h) => (
          <span key={h.en} className="text-sm bg-cream-200 border border-forest-800/10 text-forest-800 px-3 py-1.5 rounded-full">
            {t(h)}
          </span>
        ))}
      </div>
    </section>
  );
}
