import React from "react";
import { content, useLang } from "../i18n.jsx";

export default function Team() {
  const { t } = useLang();
  const s = content.team;
  return (
    <section id="team" className="max-w-4xl mx-auto px-5 py-20">
      <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
      <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-2">{t(s.title)}</h2>
      <p className="text-sm text-forest-900/50 mb-10">{t(s.note)}</p>

      <div className="relative pl-10">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-forest-800/15" />
        <div className="space-y-8">
          {s.groups.map((g, i) => (
            <div key={g.title.en} className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 rounded-full bg-forest-800 text-cream-100 text-sm flex items-center justify-center font-display">
                {i + 1}
              </div>
              <h3 className="font-display text-lg text-forest-900 mb-1">{t(g.title)}</h3>
              <p className="text-forest-900/70 text-sm max-w-md">{t(g.desc)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
