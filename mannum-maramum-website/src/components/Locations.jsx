import React from "react";
import { content, useLang } from "../i18n.jsx";
import { Icon } from "./Icons.jsx";

export default function Locations() {
  const { t } = useLang();
  const s = content.locations;
  return (
    <section id="locations" className="bg-cream-200/60">
      <div className="max-w-6xl mx-auto px-5 py-20">
        <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
        <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-10">{t(s.title)}</h2>

        <div className="flex flex-wrap gap-3">
          {s.list.map((loc) => (
            <span key={loc.en} className="flex items-center gap-1.5 bg-cream-100 border border-forest-800/10 text-forest-800 px-4 py-2 rounded-full text-sm">
              <Icon name="pin" className="w-4 h-4 text-forest-600" />
              {t(loc)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
