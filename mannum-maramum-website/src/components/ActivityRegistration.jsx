import React, { useState } from "react";
import { content, useLang } from "../i18n.jsx";

const inputClass =
  "w-full bg-transparent border-b border-forest-800/25 focus:border-forest-700 outline-none py-2 text-forest-900 placeholder:text-forest-900/40";

export default function ActivityRegistration() {
  const { t } = useLang();
  const s = content.registration;
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="join-activity" className="bg-cream-200/60">
      <div className="max-w-2xl mx-auto px-5 py-20">
        <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
        <h2 className="font-display text-3xl sm:text-4xl text-forest-900 mb-3">{t(s.title)}</h2>
        <p className="text-forest-900/70 mb-8">{t(s.desc)}</p>

        {submitted ? (
          <div className="bg-leaf-300/40 rounded-soft p-6 text-forest-900 font-medium">
            {t(s.success)}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-6">
            <input required placeholder={t(s.fields.name)} className={inputClass} />
            <input required placeholder={t(s.fields.phone)} className={inputClass} />
            <input required type="email" placeholder={t(s.fields.email)} className={inputClass} />
            <input required placeholder={t(s.fields.activity)} className={inputClass} />
            <input required placeholder={t(s.fields.location)} className={inputClass} />
            <input required type="date" placeholder={t(s.fields.date)} className={inputClass} />
            <button
              type="submit"
              className="sm:col-span-2 mt-2 bg-forest-800 text-cream-100 font-semibold py-3 rounded-soft hover:bg-forest-700 transition-colors"
            >
              {t(s.submit)}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
