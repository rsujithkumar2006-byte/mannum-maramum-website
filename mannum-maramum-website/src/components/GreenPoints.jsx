import React from "react";
import { content, useLang } from "../i18n.jsx";

export default function GreenPoints() {
  const { t } = useLang();
  const s = content.greenPoints;
  return (
    <section className="bg-forest-900 text-cream-100">
      <div className="max-w-4xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-leaf-400 font-semibold mb-3">{t(s.eyebrow)}</p>
          <h2 className="font-display text-3xl text-cream-100 mb-3">{t(s.title)}</h2>
          <p className="text-cream-200/70 max-w-sm">{t(s.desc)}</p>

          <p className="text-sm font-semibold text-leaf-400 mt-8 mb-3">{t(s.badgesLabel)}</p>
          <div className="flex flex-wrap gap-2">
            {s.badges.map((b) => (
              <span key={b.en} className="text-sm border border-cream-100/25 px-3 py-1.5 rounded-full">
                {t(b)}
              </span>
            ))}
          </div>
        </div>

        <div className="divide-y divide-cream-100/15 border-y border-cream-100/15 self-start">
          {s.scoring.map((row) => (
            <div key={row.label.en} className="flex items-center justify-between py-3">
              <span className="text-cream-200/85">{t(row.label)}</span>
              <span className="font-display text-leaf-300">{row.points}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
