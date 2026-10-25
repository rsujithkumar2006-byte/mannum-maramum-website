import React from "react";
import { content, useLang } from "../i18n.jsx";
import { Icon } from "./Icons.jsx";

const links = [
  ["home", "#home"],
  ["about", "#about"],
  ["activities", "#activities"],
  ["team", "#team"],
  ["join", "#join"],
  ["contact", "#contact"],
];

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-forest-950 text-cream-200/70">
      <div className="max-w-6xl mx-auto px-5 py-14 grid sm:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 font-display text-lg text-cream-100 mb-2">
            <Icon name="tree" className="w-6 h-6 text-leaf-400" />
            {t(content.hero.org)}
          </div>
          <p className="text-sm">{t(content.footer.tagline)}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-cream-100 mb-3">{t(content.footer.quickLinks)}</p>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            {links.map(([key, href]) => (
              <a key={key} href={href} className="hover:text-leaf-300">{t(content.nav[key])}</a>
            ))}
          </div>
        </div>
        <div className="text-sm space-y-2">
          <p>{content.contact.phone}</p>
          <p>{content.contact.email}</p>
        </div>
      </div>
      <div className="border-t border-cream-100/10 text-center text-xs py-5">
        © {new Date().getFullYear()} {t(content.hero.org)} — {t(content.footer.rights)}
      </div>
    </footer>
  );
}
