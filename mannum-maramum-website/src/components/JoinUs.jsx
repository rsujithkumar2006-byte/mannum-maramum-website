import React from "react";
import { content, useLang } from "../i18n.jsx";
import { Icon } from "./Icons.jsx";

export default function JoinUs() {
  const { t } = useLang();
  const s = content.join;
  return (
    <section id="join" className="max-w-6xl mx-auto px-5 py-20">
      <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
      <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-10">{t(s.title)}</h2>

      <div className="grid sm:grid-cols-3 gap-6">
        {s.options.map((o) => (
          <div key={o.icon} className="bg-cream-200/70 rounded-soft p-6">
            <div className="w-11 h-11 rounded-full bg-forest-800 text-cream-100 flex items-center justify-center mb-4">
              <Icon name={o.icon} className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg text-forest-900 mb-1">{t(o.title)}</h3>
            <p className="text-forest-900/70 text-sm">{t(o.desc)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
