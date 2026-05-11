import * as React from "react";

export type IconName =
  | "dashboard" | "pages" | "blogs" | "analytics" | "keywords" | "media"
  | "redirects" | "sitemap" | "users" | "settings" | "search" | "bell"
  | "plus" | "trend-up" | "trend-down" | "check" | "x" | "arrow-right"
  | "arrow-left" | "sparkles" | "chevron-down" | "chevron-right" | "more"
  | "eye" | "eye-off" | "edit" | "trash" | "globe" | "link" | "upload" | "image"
  | "filter" | "calendar" | "menu" | "bold" | "italic" | "underline"
  | "list" | "h1" | "h2" | "quote" | "code" | "logout"
  | "builder" | "layers" | "grip" | "monitor" | "tablet" | "mobile"
  | "palette" | "gradient" | "type" | "button" | "undo" | "redo" | "save"
  | "rocket" | "lock" | "unlock" | "play" | "pause" | "copy" | "duplicate"
  | "history" | "branch" | "wand" | "grid" | "align-left" | "align-center"
  | "align-right" | "device" | "layout" | "zap" | "anchor" | "footer"
  | "header" | "card" | "puzzle" | "info" | "cookie" | "dot-grid";

type Props = {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: React.CSSProperties;
  className?: string;
};

export default function Icon({ name, size = 16, stroke = 1.6, style, className }: Props) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style,
    className,
  };
  switch (name) {
    case "dashboard":
      return (<svg {...props}><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>);
    case "pages":
      return (<svg {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>);
    case "blogs":
      return (<svg {...props}><path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 9h2M9 13h6M9 17h6"/></svg>);
    case "analytics":
      return (<svg {...props}><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/><circle cx="7" cy="14" r="1.2"/><circle cx="11" cy="10" r="1.2"/><circle cx="14" cy="13" r="1.2"/><circle cx="19" cy="7" r="1.2"/></svg>);
    case "keywords":
      return (<svg {...props}><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="7"/><path d="M8 11h6M11 8v6"/></svg>);
    case "media":
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="m21 16-5-5L5 21"/></svg>);
    case "redirects":
      return (<svg {...props}><path d="M4 7h12l-3-3M4 7l3 3"/><path d="M20 17H8l3 3M20 17l-3-3"/></svg>);
    case "sitemap":
      return (<svg {...props}><rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="9" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v3M5 17v-2h14v2M12 12v3"/></svg>);
    case "users":
      return (<svg {...props}><circle cx="9" cy="8" r="3.5"/><path d="M2 21c1.5-3.5 4-5.5 7-5.5s5.5 2 7 5.5"/><circle cx="17" cy="6" r="2.5"/><path d="M22 16c-.7-2.4-2.3-3.7-4.5-3.7"/></svg>);
    case "settings":
      return (<svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>);
    case "search":
      return (<svg {...props}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>);
    case "bell":
      return (<svg {...props}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>);
    case "plus":
      return (<svg {...props}><path d="M12 5v14M5 12h14"/></svg>);
    case "trend-up":
      return (<svg {...props}><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>);
    case "trend-down":
      return (<svg {...props}><path d="m3 7 6 6 4-4 8 8"/><path d="M14 17h7v-7"/></svg>);
    case "check":
      return (<svg {...props}><path d="m5 13 4 4L19 7"/></svg>);
    case "x":
      return (<svg {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>);
    case "arrow-right":
      return (<svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>);
    case "arrow-left":
      return (<svg {...props}><path d="M19 12H5M11 5l-7 7 7 7"/></svg>);
    case "sparkles":
      return (<svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.3 6.3 2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5"/></svg>);
    case "chevron-down":
      return (<svg {...props}><path d="m6 9 6 6 6-6"/></svg>);
    case "chevron-right":
      return (<svg {...props}><path d="m9 6 6 6-6 6"/></svg>);
    case "more":
      return (<svg {...props}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>);
    case "eye":
      return (<svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>);
    case "edit":
      return (<svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>);
    case "trash":
      return (<svg {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>);
    case "globe":
      return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>);
    case "link":
      return (<svg {...props}><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>);
    case "upload":
      return (<svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>);
    case "image":
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="m21 16-5-5L5 21"/></svg>);
    case "filter":
      return (<svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>);
    case "calendar":
      return (<svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>);
    case "menu":
      return (<svg {...props}><path d="M3 6h18M3 12h18M3 18h18"/></svg>);
    case "bold":
      return (<svg {...props}><path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/></svg>);
    case "italic":
      return (<svg {...props}><path d="M19 4h-9M14 20H5M15 4 9 20"/></svg>);
    case "underline":
      return (<svg {...props}><path d="M6 4v8a6 6 0 0 0 12 0V4M4 21h16"/></svg>);
    case "list":
      return (<svg {...props}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>);
    case "h1":
      return (<svg {...props}><path d="M4 6v12M12 6v12M4 12h8M17 18V8l-2 2"/></svg>);
    case "h2":
      return (<svg {...props}><path d="M4 6v12M12 6v12M4 12h8M16 9c0-1 1-2 2-2s2 1 2 2-1 2-3 4l-1 1h4"/></svg>);
    case "quote":
      return (<svg {...props}><path d="M3 7h6v6H3zM3 13c0 4 2 6 5 6M15 7h6v6h-6zM15 13c0 4 2 6 5 6"/></svg>);
    case "code":
      return (<svg {...props}><path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 4l-4 16"/></svg>);
    case "logout":
      return (<svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>);
    case "eye-off":
      return (<svg {...props}><path d="M3 3l18 18M10.6 6.2A9 9 0 0 1 22 12a14.7 14.7 0 0 1-3.8 4.8M6 6.7A14.7 14.7 0 0 0 2 12s3 7 10 7c1.7 0 3.2-.3 4.5-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>);
    case "builder":
      return (<svg {...props}><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="M7 21l5-4 5 4"/><circle cx="6" cy="6" r=".7" fill="currentColor"/><circle cx="9" cy="6" r=".7" fill="currentColor"/></svg>);
    case "layers":
      return (<svg {...props}><path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>);
    case "grip":
      return (<svg {...props}><circle cx="9" cy="6" r="1.4" fill="currentColor"/><circle cx="15" cy="6" r="1.4" fill="currentColor"/><circle cx="9" cy="12" r="1.4" fill="currentColor"/><circle cx="15" cy="12" r="1.4" fill="currentColor"/><circle cx="9" cy="18" r="1.4" fill="currentColor"/><circle cx="15" cy="18" r="1.4" fill="currentColor"/></svg>);
    case "monitor":
      return (<svg {...props}><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>);
    case "tablet":
      return (<svg {...props}><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/></svg>);
    case "mobile":
      return (<svg {...props}><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>);
    case "palette":
      return (<svg {...props}><path d="M12 22a10 10 0 1 1 10-10c0 2.5-2.2 4-4.5 4H15a2 2 0 0 0-2 2c0 1 .5 1.5.5 2.5S12.7 22 12 22z"/><circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="11" cy="6.5" r="1.2" fill="currentColor"/><circle cx="16" cy="8" r="1.2" fill="currentColor"/></svg>);
    case "gradient":
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 7h18M3 11h18M3 15h18M3 19h18" strokeOpacity=".4"/></svg>);
    case "type":
      return (<svg {...props}><path d="M4 7V5h16v2M9 5v14M15 19h-6"/></svg>);
    case "button":
      return (<svg {...props}><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M8 12h8"/></svg>);
    case "undo":
      return (<svg {...props}><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>);
    case "redo":
      return (<svg {...props}><path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/></svg>);
    case "save":
      return (<svg {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>);
    case "rocket":
      return (<svg {...props}><path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2 2 0 0 0-2.9-.1z"/><path d="M12 15 9 12c.5-1.6 1.5-3.2 3-4.5C14.2 5.7 17.5 4.5 22 4c-.5 4.5-1.7 7.8-3.5 10-1.3 1.5-2.9 2.5-4.5 3z"/><path d="M9 12H4s.5-2.7 2-4c1.7-1.4 5-1 5-1M12 15v5s2.7-.5 4-2c1.4-1.7 1-5 1-5"/></svg>);
    case "lock":
      return (<svg {...props}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
    case "unlock":
      return (<svg {...props}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>);
    case "play":
      return (<svg {...props}><polygon points="6 4 20 12 6 20 6 4"/></svg>);
    case "pause":
      return (<svg {...props}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>);
    case "copy":
      return (<svg {...props}><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>);
    case "duplicate":
      return (<svg {...props}><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/><path d="M14 14h2M15 13v2"/></svg>);
    case "history":
      return (<svg {...props}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>);
    case "branch":
      return (<svg {...props}><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M6 8v8M18 8v3a4 4 0 0 1-4 4H8"/></svg>);
    case "wand":
      return (<svg {...props}><path d="m15 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/><path d="m20 14 .5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5z"/><path d="m4 22 14-14"/><path d="m6 9 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></svg>);
    case "grid":
      return (<svg {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>);
    case "align-left":
      return (<svg {...props}><path d="M4 6h16M4 12h10M4 18h14"/></svg>);
    case "align-center":
      return (<svg {...props}><path d="M4 6h16M7 12h10M5 18h14"/></svg>);
    case "align-right":
      return (<svg {...props}><path d="M4 6h16M10 12h10M6 18h14"/></svg>);
    case "device":
      return (<svg {...props}><rect x="2" y="6" width="20" height="11" rx="1"/><path d="M14 17v4M10 17v4M8 21h8"/></svg>);
    case "layout":
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>);
    case "zap":
      return (<svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);
    case "anchor":
      return (<svg {...props}><circle cx="12" cy="5" r="2"/><path d="M12 7v15M5 16a7 7 0 0 0 14 0M3 16h4M17 16h4"/></svg>);
    case "footer":
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 16h18"/></svg>);
    case "header":
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18"/></svg>);
    case "card":
      return (<svg {...props}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>);
    case "puzzle":
      return (<svg {...props}><path d="M10 3h4v3a2 2 0 0 0 4 0h3v4a2 2 0 0 1 0 4v4h-3a2 2 0 0 0-4 0H10v-4a2 2 0 0 1 0-4V3z"/></svg>);
    case "info":
      return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>);
    case "cookie":
      return (<svg {...props}><path d="M21 11.5A9 9 0 1 1 12.5 3a4.5 4.5 0 0 0 4.5 4.5 4.5 4.5 0 0 0 4 3.5z"/><circle cx="9" cy="13" r=".7" fill="currentColor"/><circle cx="14" cy="16" r=".7" fill="currentColor"/><circle cx="15" cy="11" r=".7" fill="currentColor"/></svg>);
    case "dot-grid":
      return (<svg {...props}><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="12" cy="6" r="1" fill="currentColor"/><circle cx="18" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="18" cy="12" r="1" fill="currentColor"/><circle cx="6" cy="18" r="1" fill="currentColor"/><circle cx="12" cy="18" r="1" fill="currentColor"/><circle cx="18" cy="18" r="1" fill="currentColor"/></svg>);
    default:
      return null;
  }
}
