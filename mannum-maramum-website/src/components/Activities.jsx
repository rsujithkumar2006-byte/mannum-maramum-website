import React from "react";
import { content, useLang } from "../i18n.jsx";
import { Icon } from "./Icons.jsx";

export default function Activities() {
  const { t } = useLang();
  const s = content.activities;
  return (
    <section id="activities" className="bg-cream-200/60">
      <div className="max-w-6xl mx-auto px-5 py-20">
        <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
        <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-10 max-w-lg">{t(s.title)}</h2>

        <div className="divide-y divide-forest-800/10 border-t border-b border-forest-800/10">
          {s.items.map((item) => (
            <div key={item.icon} className="py-6 flex items-start gap-5">
              <div className="w-12 h-12 shrink-0 rounded-full bg-forest-800/10 flex items-center justify-center text-forest-700">
                <Icon name={item.icon} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-lg text-forest-900 mb-1">{t(item.title)}</h3>
                <p className="text-forest-900/70 text-sm max-w-md">{t(item.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
