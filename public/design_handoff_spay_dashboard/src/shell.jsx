// App shell — sidebar, top nav, layout

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'pages', label: 'Pages', icon: 'pages', count: 142 },
  { id: 'blogs', label: 'Blogs', icon: 'blogs', count: 38 },
  { id: 'analytics', label: 'SEO Analytics', icon: 'analytics' },
  { id: 'keywords', label: 'Keywords', icon: 'keywords', count: 1284 },
  { id: 'media', label: 'Media Library', icon: 'media' },
  { id: 'redirects', label: 'Redirects', icon: 'redirects' },
  { id: 'sitemap', label: 'Sitemap', icon: 'sitemap' },
  { id: 'users', label: 'Users', icon: 'users' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const Sidebar = ({ current, onNav }) => {
  return (
    <aside className="sidebar" style={{
      borderRight: '1px solid var(--line)',
      padding: '20px 14px',
      display:'flex', flexDirection:'column', gap: 10,
      position: 'sticky', top: 0, height: '100vh',
      background: 'linear-gradient(180deg, rgba(14,46,46,.25), rgba(9,14,28,.65))',
      backdropFilter: 'blur(20px)'
    }}>
      {/* Brand */}
      <div style={{display:'flex', alignItems:'center', gap: 10, padding:'4px 10px 14px'}}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, overflow:'hidden', position:'relative',
          boxShadow:'0 0 0 1px rgba(4,186,191,.3), 0 0 18px -2px rgba(4,186,191,.5)'
        }}>
          <img src="assets/spay-logo.jpeg" alt="Spay" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
        </div>
        <div style={{display:'flex', flexDirection:'column'}}>
          <div style={{fontSize: 16, fontWeight: 600, letterSpacing:'-.01em'}}>Spay<span style={{color:'var(--accent)'}}>.</span></div>
          <div className="mono" style={{fontSize: 9, color:'var(--text-3)', letterSpacing:'.15em'}}>SEO · CMS · v3.2</div>
        </div>
      </div>

      {/* Workspace switcher */}
      <button className="btn" style={{justifyContent:'space-between', width:'100%', padding:'8px 10px', borderRadius: 12}}>
        <span style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{width:18, height:18, borderRadius: 5, background:'linear-gradient(135deg, #04babf, #0e2e2e)'}}/>
          <span style={{fontSize: 12.5}}>Acme Studio</span>
        </span>
        <Icon name="chevron-down" size={14}/>
      </button>

      {/* Nav */}
      <div style={{marginTop: 6, display:'flex', flexDirection:'column', gap: 1}}>
        <div className="mono" style={{fontSize: 9, color:'var(--text-3)', letterSpacing:'.18em', padding:'10px 12px 6px'}}>NAVIGATION</div>
        {NAV.map(item => {
          const active = current === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              display:'flex', alignItems:'center', gap: 10,
              padding:'8px 12px', borderRadius: 10,
              border: 'none', background: active ? 'rgba(4,186,191,.10)' : 'transparent',
              color: active ? '#fff' : 'var(--text-2)',
              fontFamily:'inherit', fontSize: 13, cursor: 'pointer',
              position: 'relative', textAlign:'left',
              boxShadow: active ? 'inset 0 0 0 1px rgba(4,186,191,.25), 0 0 18px -8px rgba(4,186,191,.6)' : 'none',
              transition:'all .15s ease'
            }}
            onMouseEnter={e => { if(!active) e.currentTarget.style.background='rgba(255,255,255,.03)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-2)'; }}}>
              {active && <div style={{position:'absolute', left: 0, top: 8, bottom: 8, width: 2, background:'var(--accent)', borderRadius: 2, boxShadow:'0 0 10px var(--accent)'}}/>}
              <Icon name={item.icon} size={16} stroke={active ? 1.8 : 1.6}/>
              <span style={{flex:1}}>{item.label}</span>
              {item.count != null && (
                <span className="mono" style={{
                  fontSize: 10, color: active ? 'var(--accent-2)' : 'var(--text-3)',
                  background: active ? 'rgba(4,186,191,.1)' : 'rgba(255,255,255,.03)',
                  padding:'2px 6px', borderRadius: 999
                }}>{item.count > 999 ? `${(item.count/1000).toFixed(1)}k` : item.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* AI helper card */}
      <div className="glass glow-border" style={{marginTop:'auto', padding: 14}}>
        <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 8}}>
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background:'radial-gradient(circle at 30% 30%, #1ad6db, #04babf 60%, #0e2e2e)',
            display:'grid', placeItems:'center',
            boxShadow:'0 0 16px -2px rgba(4,186,191,.6)'
          }}>
            <Icon name="sparkles" size={14}/>
          </div>
          <div style={{fontSize: 12.5, fontWeight: 600}}>Spay AI</div>
          <span className="chip" style={{padding:'2px 6px', fontSize: 9, marginLeft:'auto'}}>BETA</span>
        </div>
        <div style={{fontSize: 11.5, color:'var(--text-2)', lineHeight: 1.45, marginBottom: 10}}>
          Generate optimized meta, headings & briefs from any URL.
        </div>
        <button className="btn primary" style={{width:'100%', padding:'7px 10px', fontSize: 12, justifyContent:'center'}}>
          Open assistant
          <Icon name="arrow-right" size={12}/>
        </button>
      </div>

      {/* User */}
      <div style={{display:'flex', alignItems:'center', gap: 10, padding: '10px 8px', borderTop:'1px solid var(--line)', marginTop: 4}}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background:'linear-gradient(135deg, #1ad6db, #0e2e2e)',
          display:'grid', placeItems:'center', fontSize: 11, fontWeight: 600, color:'#001819',
          boxShadow:'0 0 0 2px rgba(4,186,191,.2)'
        }}>EM</div>
        <div style={{flex:1, minWidth: 0}}>
          <div style={{fontSize: 12.5, fontWeight: 500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Elena Marx</div>
          <div className="mono" style={{fontSize: 9.5, color:'var(--text-3)'}}>elena@acme.studio</div>
        </div>
        <button className="btn icon ghost" title="Sign out"><Icon name="logout" size={14}/></button>
      </div>
    </aside>
  );
};

const TopBar = ({ title, subtitle, breadcrumb, actions }) => {
  return (
    <header style={{
      position:'sticky', top: 0, zIndex: 20,
      padding: '14px 28px',
      borderBottom: '1px solid var(--line)',
      background: 'linear-gradient(180deg, rgba(9,14,28,.85), rgba(9,14,28,.5))',
      backdropFilter: 'blur(16px)',
      display:'flex', alignItems:'center', gap: 16
    }}>
      <div style={{display:'flex', flexDirection:'column', gap: 3, minWidth: 0}}>
        {breadcrumb && (
          <div className="mono" style={{fontSize: 10, color:'var(--text-3)', letterSpacing:'.12em', display:'flex', gap: 6, alignItems:'center'}}>
            {breadcrumb.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icon name="chevron-right" size={10}/>}
                <span style={{color: i === breadcrumb.length - 1 ? 'var(--accent-2)' : 'inherit'}}>{c}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 style={{margin: 0, fontSize: 20, fontWeight: 600, letterSpacing:'-.01em'}}>{title}</h1>
        {subtitle && <div style={{fontSize: 12, color:'var(--text-2)'}}>{subtitle}</div>}
      </div>

      {/* Search */}
      <div style={{flex:1, display:'flex', justifyContent:'center', maxWidth: 520, marginLeft: 'auto'}}>
        <div style={{position:'relative', width: '100%'}}>
          <Icon name="search" size={14} style={{position:'absolute', left: 12, top: '50%', transform:'translateY(-50%)', color:'var(--text-3)'}}/>
          <input className="input" placeholder="Search pages, keywords, blogs…  ⌘K" style={{paddingLeft: 36, fontSize: 12.5, height: 38}}/>
          <span className="mono" style={{position:'absolute', right: 10, top:'50%', transform:'translateY(-50%)', fontSize: 9.5, color:'var(--text-3)', border:'1px solid var(--line)', padding:'2px 6px', borderRadius: 6}}>⌘K</span>
        </div>
      </div>

      <div style={{display:'flex', alignItems:'center', gap: 8}}>
        {actions}
        <button className="btn icon ghost" title="Notifications" style={{position:'relative'}}>
          <Icon name="bell" size={15}/>
          <span style={{position:'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background:'var(--accent)', boxShadow:'0 0 8px var(--accent)'}}/>
        </button>
        <button className="btn primary" style={{height: 38}}>
          <Icon name="sparkles" size={13}/>
          New content
        </button>
      </div>
    </header>
  );
};

// Section header used inside views
const SectionHeader = ({ eyebrow, title, right }) => (
  <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap: 16, marginBottom: 14}}>
    <div>
      {eyebrow && <div className="mono" style={{fontSize: 10, color:'var(--accent-2)', letterSpacing:'.16em', marginBottom: 6}}>{eyebrow}</div>}
      <h2 style={{margin: 0, fontSize: 17, fontWeight: 600, letterSpacing:'-.005em'}}>{title}</h2>
    </div>
    {right}
  </div>
);

window.Sidebar = Sidebar;
window.TopBar = TopBar;
window.SectionHeader = SectionHeader;
window.NAV = NAV;
