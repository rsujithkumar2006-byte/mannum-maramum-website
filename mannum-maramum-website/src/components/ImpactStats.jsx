import React from "react";
import { content, useLang } from "../i18n.jsx";

export default function ImpactStats() {
  const { t } = useLang();
  const s = content.stats;
  const stats = [
    [t(s.seedsValue), t(s.seeds)],
    [t(s.treesValue), t(s.trees)],
    [t(s.sinceValue), t(s.since)],
    [t(s.locationsValue), t(s.locations)],
  ];
  return (
    <section className="bg-forest-800 text-cream-100">
      <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map(([value, label]) => (
          <div key={label} className="text-center lg:text-left">
            <div className="font-display text-3xl sm:text-4xl text-leaf-300">{value}</div>
            <div className="text-cream-200/75 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-center text-cream-200/50 text-xs pb-6">{t(s.note)}</p>
    </section>
  );
}
