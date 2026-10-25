import React from "react";
import { content, useLang } from "../i18n.jsx";

export default function Awards() {
  const { t } = useLang();
  const s = content.awards;
  return (
    <section id="awards" className="bg-cream-200/60">
      <div className="max-w-6xl mx-auto px-5 py-20">
        <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
        <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-10">{t(s.title)}</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {s.items.map((a) => (
            <div key={a.en} className="border border-clay-500/40 rounded-soft px-5 py-4 text-forest-900">
              {t(a)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
