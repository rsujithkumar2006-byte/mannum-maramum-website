import React from "react";
import { content, useLang } from "../i18n.jsx";
import { Icon } from "./Icons.jsx";

export default function Gallery() {
  const { t } = useLang();
  const s = content.gallery;
  return (
    <section id="gallery" className="max-w-6xl mx-auto px-5 py-20">
      <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
      <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-6">{t(s.title)}</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-soft border-2 border-dashed border-forest-800/20 flex items-center justify-center text-forest-800/30">
            <Icon name="camera" className="w-8 h-8" />
          </div>
        ))}
      </div>
      <p className="text-sm text-forest-900/50 mt-4">{t(s.placeholder)}</p>
    </section>
  );
}
