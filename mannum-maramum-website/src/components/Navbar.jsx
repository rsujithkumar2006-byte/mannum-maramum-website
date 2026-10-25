import React, { useState } from "react";
import { content, useLang } from "../i18n.jsx";
import { Icon } from "./Icons.jsx";

const links = [
  ["home", "#home"],
  ["about", "#about"],
  ["activities", "#activities"],
  ["goGreen", "#go-green"],
  ["impact", "#impact"],
  ["projects", "#projects"],
  ["team", "#team"],
  ["join", "#join"],
  ["contact", "#contact"],
];

export default function Navbar() {
  const { lang, toggleLang, t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream-100/90 backdrop-blur border-b border-forest-800/10">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2.5 font-display text-lg font-semibold text-forest-900">
          <img src="/logo.png" alt="Mannum Maramum Logo" className="w-9 h-9 rounded-full object-cover border border-forest-700/30 shadow-sm" onError={(e)=>{e.target.onerror=null;e.target.src='logo.png';}} />
          <span>{t(content.hero.org)}</span>
        </a>

        <nav className="hidden lg:flex items-center gap-6 text-sm text-forest-900/80">
          {links.map(([key, href]) => (
            <a key={key} href={href} className="hover:text-forest-700 transition-colors">
              {t(content.nav[key])}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="text-sm font-medium px-3 py-1.5 rounded-full border border-forest-800/20 text-forest-900 hover:bg-forest-800 hover:text-cream-100 transition-colors"
            aria-label="Switch language"
          >
            {lang === "en" ? "தமிழ்" : "English"}
          </button>
          <button
            className="lg:hidden text-forest-900"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-forest-800/10 bg-cream-100 px-5 py-3 flex flex-col gap-3 text-forest-900/85">
          {links.map(([key, href]) => (
            <a key={key} href={href} onClick={() => setOpen(false)} className="py-1">
              {t(content.nav[key])}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
