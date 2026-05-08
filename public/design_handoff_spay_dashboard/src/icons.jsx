// Inline icon set — clean stroke icons matching dashboard aesthetic
const Icon = ({ name, size = 16, stroke = 1.6, style, className }) => {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round",
    style, className
  };
  switch (name) {
    case 'dashboard':
      return (<svg {...props}><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>);
    case 'pages':
      return (<svg {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>);
    case 'blogs':
      return (<svg {...props}><path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 9h2M9 13h6M9 17h6"/></svg>);
    case 'analytics':
      return (<svg {...props}><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/><circle cx="7" cy="14" r="1.2"/><circle cx="11" cy="10" r="1.2"/><circle cx="14" cy="13" r="1.2"/><circle cx="19" cy="7" r="1.2"/></svg>);
    case 'keywords':
      return (<svg {...props}><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="7"/><path d="M8 11h6M11 8v6"/></svg>);
    case 'media':
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="m21 16-5-5L5 21"/></svg>);
    case 'redirects':
      return (<svg {...props}><path d="M4 7h12l-3-3M4 7l3 3"/><path d="M20 17H8l3 3M20 17l-3-3"/></svg>);
    case 'sitemap':
      return (<svg {...props}><rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="9" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v3M5 17v-2h14v2M12 12v3"/></svg>);
    case 'users':
      return (<svg {...props}><circle cx="9" cy="8" r="3.5"/><path d="M2 21c1.5-3.5 4-5.5 7-5.5s5.5 2 7 5.5"/><circle cx="17" cy="6" r="2.5"/><path d="M22 16c-.7-2.4-2.3-3.7-4.5-3.7"/></svg>);
    case 'settings':
      return (<svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>);
    case 'search':
      return (<svg {...props}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>);
    case 'bell':
      return (<svg {...props}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>);
    case 'plus':
      return (<svg {...props}><path d="M12 5v14M5 12h14"/></svg>);
    case 'trend-up':
      return (<svg {...props}><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>);
    case 'trend-down':
      return (<svg {...props}><path d="m3 7 6 6 4-4 8 8"/><path d="M14 17h7v-7"/></svg>);
    case 'check':
      return (<svg {...props}><path d="m5 13 4 4L19 7"/></svg>);
    case 'x':
      return (<svg {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>);
    case 'arrow-right':
      return (<svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>);
    case 'arrow-left':
      return (<svg {...props}><path d="M19 12H5M11 5l-7 7 7 7"/></svg>);
    case 'sparkles':
      return (<svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.3 6.3 2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5"/></svg>);
    case 'chevron-down':
      return (<svg {...props}><path d="m6 9 6 6 6-6"/></svg>);
    case 'chevron-right':
      return (<svg {...props}><path d="m9 6 6 6-6 6"/></svg>);
    case 'more':
      return (<svg {...props}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>);
    case 'eye':
      return (<svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>);
    case 'edit':
      return (<svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>);
    case 'trash':
      return (<svg {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>);
    case 'globe':
      return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>);
    case 'link':
      return (<svg {...props}><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>);
    case 'upload':
      return (<svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>);
    case 'image':
      return (<svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="m21 16-5-5L5 21"/></svg>);
    case 'filter':
      return (<svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>);
    case 'calendar':
      return (<svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>);
    case 'menu':
      return (<svg {...props}><path d="M3 6h18M3 12h18M3 18h18"/></svg>);
    case 'bold': return (<svg {...props}><path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/></svg>);
    case 'italic': return (<svg {...props}><path d="M19 4h-9M14 20H5M15 4 9 20"/></svg>);
    case 'underline': return (<svg {...props}><path d="M6 4v8a6 6 0 0 0 12 0V4M4 21h16"/></svg>);
    case 'list': return (<svg {...props}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>);
    case 'h1': return (<svg {...props}><path d="M4 6v12M12 6v12M4 12h8M17 18V8l-2 2"/></svg>);
    case 'h2': return (<svg {...props}><path d="M4 6v12M12 6v12M4 12h8M16 9c0-1 1-2 2-2s2 1 2 2-1 2-3 4l-1 1h4"/></svg>);
    case 'quote': return (<svg {...props}><path d="M3 7h6v6H3zM3 13c0 4 2 6 5 6M15 7h6v6h-6zM15 13c0 4 2 6 5 6"/></svg>);
    case 'code': return (<svg {...props}><path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 4l-4 16"/></svg>);
    case 'logout': return (<svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>);
    default: return null;
  }
};

window.Icon = Icon;
