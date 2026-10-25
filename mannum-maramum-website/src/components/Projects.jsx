import React from "react";
import { content, useLang } from "../i18n.jsx";
import { Icon } from "./Icons.jsx";

export default function Projects() {
  const { t } = useLang();
  const s = content.projects;
  return (
    <section id="projects" className="bg-cream-200/60">
      <div className="max-w-6xl mx-auto px-5 py-20">
        <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
        <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-2 max-w-lg">{t(s.title)}</h2>
        <p className="text-sm text-forest-900/50 mb-10">{t(s.note)}</p>

        <div className="space-y-6">
          {s.items.map((p) => (
            <div key={p.name.en} className="bg-cream-100 rounded-soft p-6 flex flex-col sm:flex-row sm:items-start gap-4 border border-forest-800/10">
              <div className="flex items-center gap-2 text-forest-700 sm:w-40 shrink-0">
                <Icon name="pin" className="w-5 h-5" />
                <span className="text-sm">{t(p.location)}</span>
              </div>
              <div>
                <h3 className="font-display text-lg text-forest-900 mb-1">{t(p.name)}</h3>
                <p className="text-forest-900/70 text-sm">{t(p.work)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
