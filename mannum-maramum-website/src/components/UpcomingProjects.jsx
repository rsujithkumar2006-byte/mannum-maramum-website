import React from "react";
import { content, useLang } from "../i18n.jsx";
import { Icon } from "./Icons.jsx";

export default function UpcomingProjects() {
  const { t } = useLang();
  const s = content.upcoming;
  return (
    <section id="upcoming" className="bg-forest-800 text-cream-100">
      <div className="max-w-4xl mx-auto px-5 py-20">
        <p className="text-leaf-400 font-semibold mb-3">{t(s.eyebrow)}</p>
        <h2 className="font-display text-3xl sm:text-4xl mb-10">{t(s.title)}</h2>

        <ul className="space-y-4">
          {s.items.map((item) => (
            <li key={item.en} className="flex items-start gap-3">
              <Icon name="leaf" className="w-5 h-5 mt-0.5 text-leaf-400 shrink-0" />
              <span className="text-cream-200/90">{t(item)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
