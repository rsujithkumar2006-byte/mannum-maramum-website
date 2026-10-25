import React from "react";
import { content, useLang } from "../i18n.jsx";

const tints = ["bg-leaf-300/40", "bg-clay-400/30", "bg-forest-700/10"];

export default function GenZNatureExperience() {
  const { t } = useLang();
  const s = content.genz;
  return (
    <section id="go-green" className="max-w-6xl mx-auto px-5 py-20">
      <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
      <h2 className="font-display text-3xl sm:text-4xl text-forest-900">{t(s.title)}</h2>
      <p className="font-display italic text-xl text-forest-700 mt-2 mb-5">{t(s.tagline)}</p>
      <p className="text-sm text-forest-900/60 max-w-lg mb-10 border-l-2 border-clay-500 pl-3">
        {t(s.disclaimer)}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {s.items.map((item, i) => (
          <div
            key={item.title.en}
            className={`rounded-soft p-5 ${tints[i % tints.length]} hover:-translate-y-1 transition-transform`}
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-forest-900 mb-1">{t(item.title)}</h3>
            <p className="text-sm text-forest-900/70">{t(item.desc)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
