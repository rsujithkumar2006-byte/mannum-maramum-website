import React from "react";
import { content, useLang } from "../i18n.jsx";
import { Icon } from "./Icons.jsx";

export default function Contact() {
  const { t } = useLang();
  const s = content.contact;
  return (
    <section id="contact" className="bg-cream-200/60">
      <div className="max-w-4xl mx-auto px-5 py-20 grid sm:grid-cols-2 gap-10">
        <div>
          <p className="text-clay-600 font-semibold mb-3">{t(s.eyebrow)}</p>
          <h2 className="font-display text-3xl text-forest-900 mb-4">{t(s.title)}</h2>
          <p className="font-display text-lg text-forest-900">{t(s.org)}</p>
          <p className="text-forest-900/70 text-sm mt-1">{t(s.founderLabel)}: {t(s.founder)}</p>
        </div>
        <div className="space-y-4 text-forest-900/85">
          <div className="flex items-start gap-3">
            <Icon name="pin" className="w-5 h-5 mt-0.5 text-forest-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-forest-700">{t(s.addressLabel)}</p>
              <p className="text-sm">{t(s.address)}</p>
            </div>
          </div>
          <p className="text-sm"><a href={`tel:${s.phone}`} className="hover:text-forest-700">{s.phone}</a></p>
          <p className="text-sm"><a href={`mailto:${s.email}`} className="hover:text-forest-700">{s.email}</a></p>
        </div>
      </div>
    </section>
  );
}
