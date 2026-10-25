import React from "react";
import { content, useLang } from "../i18n.jsx";

export default function About() {
  const { t } = useLang();
  const a = content.about;
  return (
    <section id="about" className="max-w-6xl mx-auto px-5 py-20 grid lg:grid-cols-2 gap-14">
      <div>
        <p className="text-clay-600 font-semibold mb-3">{t(a.eyebrow)}</p>
        <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-5 max-w-md">{t(a.title)}</h2>
        <p className="text-forest-900/75 max-w-md leading-relaxed">{t(a.body)}</p>
      </div>

      <div className="space-y-6">
        <div className="border-l-4 border-leaf-500 pl-5">
          <p className="text-sm font-semibold text-forest-700 mb-1">{t(a.visionLabel)}</p>
          <p className="text-forest-900/85">{t(a.vision)}</p>
        </div>
        <div className="border-l-4 border-clay-500 pl-5">
          <p className="text-sm font-semibold text-forest-700 mb-1">{t(a.missionLabel)}</p>
          <p className="text-forest-900/85">{t(a.mission)}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-forest-700 mb-2">{t(a.valuesLabel)}</p>
          <div className="flex flex-wrap gap-2">
            {a.values.map((v) => (
              <span key={v.en} className="text-sm bg-cream-200 border border-forest-800/10 text-forest-800 px-3 py-1.5 rounded-full">
                {t(v)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
