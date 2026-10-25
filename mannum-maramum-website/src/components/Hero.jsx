import React from "react";
import { content, useLang } from "../i18n.jsx";

export default function Hero() {
  const { t } = useLang();
  return (
    <section id="home" className="relative overflow-hidden bg-forest-900 text-cream-100">
      <div className="max-w-6xl mx-auto px-5 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="uppercase tracking-wide text-leaf-400 text-sm font-semibold mb-4">
            {t(content.hero.since)}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-6">
            {t(content.hero.headline)}
          </h1>
          <p className="text-cream-200/85 text-lg max-w-md mb-8">
            {t(content.hero.sub)}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#activities" className="bg-leaf-400 text-forest-950 font-semibold px-6 py-3 rounded-soft hover:bg-leaf-300 transition-colors">
              {t(content.hero.ctaPrimary)}
            </a>
            <a href="#go-green" className="border border-cream-100/40 px-6 py-3 rounded-soft hover:bg-cream-100/10 transition-colors">
              {t(content.hero.ctaSecondary)}
            </a>
          </div>
        </div>

        <div className="relative h-72 lg:h-96 [animation:grow_1.1s_ease-out]">
          <svg viewBox="0 0 400 320" className="w-full h-full">
            <ellipse cx="200" cy="300" rx="160" ry="14" fill="#0E2A1E" opacity="0.6" />
            <g style={{ transformOrigin: "200px 300px" }}>
              <path d="M200 300 L200 160" stroke="#C9A27B" strokeWidth="10" strokeLinecap="round" />
              <path d="M200 210 C140 190 120 140 150 100 C170 140 190 170 200 210Z" fill="#52B788" />
              <path d="M200 190 C260 165 285 115 260 75 C235 115 215 150 200 190Z" fill="#2D6A4F" />
              <path d="M200 170 C160 130 165 80 200 45 C235 80 240 130 200 170Z" fill="#74C69D" />
            </g>
            <circle cx="90" cy="90" r="5" fill="#95D5B2" />
            <circle cx="320" cy="60" r="4" fill="#95D5B2" />
            <circle cx="60" cy="200" r="4" fill="#95D5B2" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes grow {
          from { opacity: 0; transform: translateY(16px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </section>
  );
}
