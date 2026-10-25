import React, { useState } from "react";
import { content, useLang } from "../i18n.jsx";
import { Icon } from "./Icons.jsx";

const inputClass =
  "w-full bg-transparent border-b border-forest-800/25 focus:border-forest-700 outline-none py-2 text-forest-900 placeholder:text-forest-900/40";

export default function ActivityProof() {
  const { t } = useLang();
  const s = content.proof;
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="max-w-2xl mx-auto px-5 py-20">
      <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
      <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-3">{t(s.title)}</h2>
      <p className="text-forest-900/70 mb-8">{t(s.desc)}</p>

      {submitted ? (
        <div className="bg-leaf-300/40 rounded-soft p-6 text-forest-900 font-medium">
          {t(s.success)}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="flex items-center gap-3 border border-dashed border-forest-800/30 rounded-soft p-5 cursor-pointer text-forest-900/70 hover:border-forest-700">
            <Icon name="camera" className="w-6 h-6" />
            <span>{t(s.fields.photo)}</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>
          <input required placeholder={t(s.fields.activity)} className={inputClass} />
          <div className="grid sm:grid-cols-2 gap-6">
            <input required placeholder={t(s.fields.location)} className={inputClass} />
            <input required type="date" className={inputClass} />
          </div>
          <button
            type="submit"
            className="bg-clay-500 text-cream-100 font-semibold px-6 py-3 rounded-soft hover:bg-clay-600 transition-colors"
          >
            {t(s.submit)}
          </button>
        </form>
      )}
    </section>
  );
}
