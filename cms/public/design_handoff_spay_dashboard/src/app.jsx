// Main app — routing, tweaks, root render

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#04babf",
  "density": "comfortable",
  "glow": true,
  "showAI": true
}/*EDITMODE-END*/;

const TITLES = {
  dashboard: { title: 'Welcome back, Elena', subtitle: 'Here\'s what\'s happening across acme.studio today.', breadcrumb: ['Workspace', 'Dashboard'] },
  pages: { title: 'Pages', subtitle: '142 pages · 8 drafts · 3 scheduled', breadcrumb: ['Workspace', 'Pages'] },
  blogs: { title: 'Blogs', subtitle: '38 posts across 6 categories', breadcrumb: ['Workspace', 'Content', 'Blogs'] },
  editor: { title: 'Edit post', subtitle: '', breadcrumb: ['Workspace', 'Content', 'Blogs', 'Editor'] },
  analytics: { title: 'SEO Analytics', subtitle: 'Last 90 days · synced 12 minutes ago', breadcrumb: ['Workspace', 'Analytics'] },
  keywords: { title: 'Keywords', subtitle: 'Tracking 1,284 keywords across 4 search engines', breadcrumb: ['Workspace', 'SEO', 'Keywords'] },
  media: { title: 'Media library', subtitle: '4.2 GB used of 50 GB', breadcrumb: ['Workspace', 'Media'] },
  redirects: { title: 'Redirects', subtitle: '184 active redirects', breadcrumb: ['Workspace', 'SEO', 'Redirects'] },
  sitemap: { title: 'Sitemap', subtitle: 'Auto-generated · last updated 2h ago', breadcrumb: ['Workspace', 'SEO', 'Sitemap'] },
  users: { title: 'Users', subtitle: '12 of 25 seats used', breadcrumb: ['Workspace', 'Settings', 'Users'] },
  settings: { title: 'Settings', subtitle: '', breadcrumb: ['Workspace', 'Settings'] },
  'seo-settings': { title: 'SEO Settings', subtitle: 'Global metadata, indexing & schema', breadcrumb: ['Workspace', 'SEO', 'Settings'] },
};

function App() {
  const [route, setRoute] = React.useState('dashboard');
  const [editingPost, setEditingPost] = React.useState(null);
  const [showMediaModal, setShowMediaModal] = React.useState(false);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
    // derive accent-2 brighter
    document.documentElement.style.setProperty('--accent-2', t.accent === '#04babf' ? '#1ad6db' : t.accent);
    document.documentElement.style.setProperty('--accent-soft', t.accent + '24');
  }, [t.accent]);

  const meta = route === 'editor'
    ? { title: editingPost?.t || 'Untitled post', subtitle: 'Auto-saved · Mira Chen', breadcrumb: ['Workspace', 'Content', 'Blogs', 'Editor'] }
    : (TITLES[route] || TITLES.dashboard);

  let view;
  switch (route) {
    case 'dashboard': view = <DashboardView/>; break;
    case 'pages': view = <PagesView/>; break;
    case 'blogs': view = <BlogsView onEdit={(p) => { setEditingPost(p); setRoute('editor'); }}/>; break;
    case 'editor': view = <EditorView post={editingPost} onBack={() => setRoute('blogs')}/>; break;
    case 'analytics': view = <AnalyticsView/>; break;
    case 'keywords': view = <KeywordsView/>; break;
    case 'media': view = <MediaView onUpload={() => setShowMediaModal(true)}/>; break;
    case 'redirects': view = <RedirectsView/>; break;
    case 'sitemap': view = <SitemapView/>; break;
    case 'users': view = <UsersView/>; break;
    case 'settings': view = <SettingsView/>; break;
    case 'seo-settings': view = <SeoSettingsView/>; break;
    default: view = <DashboardView/>;
  }

  return (
    <div className="app">
      <Sidebar current={route === 'editor' ? 'blogs' : route} onNav={(id) => { setRoute(id); setEditingPost(null); }}/>
      <div className="main">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          breadcrumb={meta.breadcrumb}
          actions={route === 'editor' ? (
            <>
              <button className="btn ghost" onClick={() => setRoute('blogs')}><Icon name="arrow-left" size={13}/>Back</button>
              <button className="btn"><Icon name="eye" size={13}/>Preview</button>
            </>
          ) : null}
        />
        {view}
      </div>

      {showMediaModal && <MediaModal onClose={() => setShowMediaModal(false)}/>}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Accent">
          <TweakColor t={t} setTweak={setTweak} k="accent" label="Accent color" options={['#04babf','#7c5cff','#ff6b80','#2dd49a','#f5b042']}/>
        </TweakSection>
        <TweakSection title="Layout">
          <TweakRadio t={t} setTweak={setTweak} k="density" label="Density" options={[{value:'compact', label:'Compact'},{value:'comfortable', label:'Comfortable'}]}/>
          <TweakToggle t={t} setTweak={setTweak} k="glow" label="Glow effects"/>
          <TweakToggle t={t} setTweak={setTweak} k="showAI" label="Show AI helper"/>
        </TweakSection>
        <TweakSection title="Jump to">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 6}}>
            {['dashboard','blogs','editor','analytics','keywords','media','seo-settings','redirects','sitemap','users'].map(r => (
              <button key={r} onClick={()=>setRoute(r)} style={{
                padding:'7px 10px', borderRadius: 8, border:'1px solid rgba(255,255,255,.08)',
                background: route===r ? 'rgba(4,186,191,.18)' : 'rgba(255,255,255,.02)',
                color: route===r ? '#fff' : 'rgba(220,230,232,.7)',
                fontSize: 11, cursor:'pointer', textTransform:'capitalize', fontFamily:'inherit'
              }}>{r.replace('-',' ')}</button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
