import React from "react";
import { content, useLang } from "../i18n.jsx";

export default function PalmTrees() {
  const { t } = useLang();
  const s = content.palmTrees;
  return (
    <section id="palm-trees" className="max-w-6xl mx-auto px-5 py-20">
      <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
      <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-10">{t(s.title)}</h2>

      <div className="grid sm:grid-cols-2 gap-8 mb-12">
        {s.reasons.map((r) => (
          <div key={r.title.en}>
            <h3 className="font-display text-lg text-forest-900 mb-1">{t(r.title)}</h3>
            <p className="text-forest-900/70 text-sm max-w-sm">{t(r.desc)}</p>
          </div>
        ))}
      </div>

      <p className="text-sm font-semibold text-forest-700 mb-3">{t(s.productsLabel)}</p>
      <div className="flex flex-wrap gap-2">
        {s.products.map((p) => (
          <span key={p.en} className="text-sm bg-clay-400/25 text-clay-600 px-3 py-1.5 rounded-full">
            {t(p)}
          </span>
        ))}
      </div>
    </section>
  );
}
