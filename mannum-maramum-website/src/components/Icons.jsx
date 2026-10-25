// Small hand-drawn-style line icon set, all sharing one stroke system.
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

export function Icon({ name, className = "w-6 h-6" }) {
  const icons = {
    sprout: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M12 21V11" />
        <path d="M12 11c0-4 3-6 7-6 0 4-2 7-7 7Z" />
        <path d="M12 14c0-3-2.5-5-6-5 0 3 1.5 5.5 6 5Z" />
      </svg>
    ),
    palm: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M12 21V10" />
        <path d="M12 10c-2-3-6-3-8-1 2 2 5 2.5 8 1Z" />
        <path d="M12 10c2-3 6-3 8-1-2 2-5 2.5-8 1Z" />
        <path d="M12 10c-1-3-1-5 0-7 1 2 1 4 0 7Z" />
      </svg>
    ),
    "water-drop": (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M12 3c3.5 4 6 7.5 6 10.5a6 6 0 1 1-12 0C6 10.5 8.5 7 12 3Z" />
      </svg>
    ),
    lake: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M3 17c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
        <path d="M3 12c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
      </svg>
    ),
    leaf: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M5 19c8-1 13-6 14-14-8 1-13 6-14 14Z" />
        <path d="M5 19c2-4 5-7 9-9" />
      </svg>
    ),
    "no-plastic": (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M6 6l12 12" />
      </svg>
    ),
    people: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <circle cx="8.5" cy="8" r="2.5" />
        <circle cx="16" cy="9" r="2" />
        <path d="M3.5 19c0-3 2.5-5 5-5s5 2 5 5" />
        <path d="M14 19c0-2.2 1.6-4 4-4s4 1.8 4 4" />
      </svg>
    ),
    hand: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M7 12V6a1.5 1.5 0 0 1 3 0v5" />
        <path d="M10 11V4.5a1.5 1.5 0 0 1 3 0V11" />
        <path d="M13 11.2V6a1.5 1.5 0 0 1 3 0v7" />
        <path d="M16 13v-2a1.5 1.5 0 0 1 3 0v5c0 3.5-2.5 6-6 6h-1c-3 0-4.5-1-6-3l-2.5-4c-.6-1 .3-2.2 1.4-1.8L7 14" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M12 20s-7-4.4-9.5-8.8C.8 8 2.3 4.5 5.8 4c2.1-.3 4 .8 6.2 3 2.2-2.2 4.1-3.3 6.2-3 3.5.5 5 4 3.3 7.2C19 15.6 12 20 12 20Z" />
      </svg>
    ),
    megaphone: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M3 11v2a2 2 0 0 0 2 2h1l1 4h2l-1-4h2l7 4V5l-7 4H6a2 2 0 0 0-2 2Z" />
      </svg>
    ),
    tree: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M12 21v-6" />
        <path d="M12 15c-4 0-7-2.5-7-6 1 .5 2 .7 3 .5C7 6.5 9 4 12 3c3 1 5 3.5 4 6.5 1 .2 2 0 3-.5 0 3.5-3 6-7 6Z" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M4 12.5l5 5L20 7" />
      </svg>
    ),
    pin: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.3" />
      </svg>
    ),
    camera: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
        <circle cx="12" cy="13" r="3.4" />
      </svg>
    ),
    arrow: (
      <svg viewBox="0 0 24 24" className={className} {...base}>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    ),
  };
  return icons[name] || null;
}
