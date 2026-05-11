// More views — Media, Pages, Redirects, Sitemap, Users, Settings, SEO Settings page, Media Modal

// ---------- MEDIA LIBRARY ----------
const MediaView = ({ onUpload }) => {
  const items = Array.from({length: 18}).map((_, i) => ({
    id: i,
    name: ['hero-banner.jpg','og-default.png','team-photo.jpg','product-shot-01.jpg','feature-grid.png','dashboard-dark.png','blog-cover-ai.jpg','workflow-diagram.svg','testimonial-1.png','case-study-cover.jpg','infographic-seo.png','demo-video-thumb.jpg','logo-dark.svg','logo-light.svg','icon-set-32.png','social-card-twitter.png','footer-pattern.svg','about-team.jpg'][i],
    size: ['340 KB','82 KB','1.2 MB','680 KB','520 KB','910 KB','840 KB','12 KB','220 KB','1.4 MB','480 KB','120 KB','4 KB','4 KB','64 KB','180 KB','22 KB','2.1 MB'][i],
    type: i % 5 === 0 ? 'svg' : i % 4 === 0 ? 'png' : 'jpg',
    hue: 160 + (i * 23) % 60
  }));
  return (
    <div className="content fade-in" style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'flex', gap: 12, alignItems:'center'}}>
        <div style={{display:'flex', gap: 4, padding: 4, border:'1px solid var(--line)', borderRadius: 12, background:'rgba(9,14,28,.5)'}}>
          {['All', 'Images', 'Videos', 'Documents', 'SVG'].map((t, i) => (
            <button key={t} style={{
              padding:'6px 12px', borderRadius: 8, border:'none', cursor:'pointer',
              background: i===0 ? 'rgba(4,186,191,.15)' : 'transparent',
              color: i===0 ? '#fff' : 'var(--text-2)',
              fontFamily:'inherit', fontSize: 12,
            }}>{t}</button>
          ))}
        </div>
        <div style={{position:'relative', flex: 1, maxWidth: 300}}>
          <Icon name="search" size={13} style={{position:'absolute', left: 12, top: '50%', transform:'translateY(-50%)', color:'var(--text-3)'}}/>
          <input className="input" placeholder="Search media…" style={{paddingLeft: 32, fontSize: 12}}/>
        </div>
        <div style={{marginLeft:'auto', display:'flex', gap: 8}}>
          <button className="btn">Sort: Recent <Icon name="chevron-down" size={11}/></button>
          <button className="btn primary" onClick={onUpload}><Icon name="upload" size={13}/>Upload</button>
        </div>
      </div>

      {/* Drop zone */}
      <Card padding={0} style={{overflow:'hidden'}}>
        <div onClick={onUpload} style={{
          padding: 28, display:'flex', alignItems:'center', gap: 18, cursor:'pointer',
          background:'repeating-linear-gradient(135deg, rgba(4,186,191,.03), rgba(4,186,191,.03) 10px, transparent 10px, transparent 20px)',
          borderBottom:'1px dashed rgba(4,186,191,.25)'
        }}>
          <div style={{width: 56, height: 56, borderRadius: 14, background:'rgba(4,186,191,.1)', display:'grid', placeItems:'center', boxShadow:'0 0 24px -6px rgba(4,186,191,.5)'}}>
            <Icon name="upload" size={22} style={{color:'var(--accent-2)'}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize: 14.5, fontWeight: 500}}>Drop files here, or click to browse</div>
            <div style={{fontSize: 12, color:'var(--text-3)', marginTop: 3}}>PNG, JPG, SVG, WEBP up to 25 MB · Optimized & CDN-delivered automatically</div>
          </div>
          <div style={{display:'flex', gap: 12}}>
            <div style={{textAlign:'right'}}>
              <div className="mono" style={{fontSize: 9.5, color:'var(--text-3)', letterSpacing:'.14em'}}>USED</div>
              <div style={{fontSize: 14, fontWeight: 500}}>4.2 / 50 GB</div>
            </div>
          </div>
        </div>

        <div style={{padding: 16, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap: 12}}>
          {items.map(it => (
            <div key={it.id} style={{
              borderRadius: 14, overflow:'hidden', border:'1px solid var(--line)',
              background:'rgba(9,14,28,.4)', cursor:'pointer', transition:'all .2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(4,186,191,.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{
                aspectRatio: '4/3', position:'relative',
                background:`linear-gradient(135deg, hsl(${it.hue}, 40%, 28%), hsl(${it.hue+30}, 30%, 12%))`,
                display:'grid', placeItems:'center'
              }}>
                <Icon name="image" size={28} style={{color:'rgba(255,255,255,.25)'}}/>
                <span className="mono" style={{position:'absolute', top: 6, right: 6, padding:'2px 6px', borderRadius: 4, background:'rgba(0,0,0,.45)', fontSize: 9, color:'var(--accent-2)', letterSpacing:'.1em'}}>{it.type.toUpperCase()}</span>
              </div>
              <div style={{padding: 10}}>
                <div style={{fontSize: 11.5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom: 2}}>{it.name}</div>
                <div className="mono" style={{fontSize: 9.5, color:'var(--text-3)'}}>{it.size}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ---------- MEDIA UPLOAD MODAL ----------
const MediaModal = ({ onClose }) => {
  const [files, setFiles] = React.useState([
    {name:'hero-banner-2026.jpg', size:'2.4 MB', progress: 100, status:'done'},
    {name:'team-offsite-photo.jpg', size:'4.8 MB', progress: 72, status:'uploading'},
    {name:'product-demo.png', size:'1.1 MB', progress: 100, status:'done'},
  ]);

  React.useEffect(() => {
    const t = setInterval(() => {
      setFiles(fs => fs.map(f => f.status === 'uploading'
        ? { ...f, progress: Math.min(100, f.progress + 4), status: f.progress >= 96 ? 'done' : 'uploading' }
        : f));
    }, 250);
    return () => clearInterval(t);
  }, []);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset: 0, zIndex: 100,
      background:'rgba(3, 6, 14, 0.65)',
      backdropFilter:'blur(8px)',
      display:'grid', placeItems:'center',
      animation:'fadeIn .2s ease',
      padding: 20
    }}>
      <div onClick={e=>e.stopPropagation()} className="glass glow-border" style={{
        width:'min(640px, 100%)', padding: 24,
        boxShadow:'0 40px 100px -20px rgba(0,0,0,.8), 0 0 0 1px rgba(4,186,191,.1)',
        animation:'fadeIn .3s ease'
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 18}}>
          <div>
            <div className="mono" style={{fontSize: 10, color:'var(--accent-2)', letterSpacing:'.16em', marginBottom: 4}}>MEDIA LIBRARY</div>
            <div style={{fontSize: 18, fontWeight: 600}}>Upload files</div>
          </div>
          <button className="btn icon ghost" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>

        <div style={{
          padding: 32, borderRadius: 16,
          border:'2px dashed rgba(4,186,191,.3)',
          background:'rgba(4,186,191,.04)',
          display:'flex', flexDirection:'column', alignItems:'center', gap: 10,
          marginBottom: 16
        }}>
          <div style={{width: 52, height: 52, borderRadius: 14, background:'rgba(4,186,191,.12)', display:'grid', placeItems:'center', boxShadow:'0 0 24px -4px rgba(4,186,191,.5)'}}>
            <Icon name="upload" size={22} style={{color:'var(--accent-2)'}}/>
          </div>
          <div style={{fontSize: 14, fontWeight: 500}}>Drop files to upload</div>
          <div style={{fontSize: 11.5, color:'var(--text-3)'}}>or <span style={{color:'var(--accent-2)', cursor:'pointer'}}>browse from your computer</span></div>
          <div className="mono" style={{fontSize: 9.5, color:'var(--text-3)', letterSpacing:'.12em', marginTop: 4}}>PNG · JPG · SVG · WEBP · MAX 25MB</div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap: 8, maxHeight: 240, overflowY:'auto'}} className="nice-scroll">
          {files.map((f, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap: 12, padding: 12, borderRadius: 12, border:'1px solid var(--line)', background:'rgba(9,14,28,.5)'}}>
              <div style={{width: 36, height: 36, borderRadius: 8, background:'linear-gradient(135deg, #04babf, #0e2e2e)', display:'grid', placeItems:'center', flexShrink: 0}}>
                <Icon name="image" size={16} style={{color:'#001819'}}/>
              </div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize: 12.5, marginBottom: 4}}>
                  <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{f.name}</span>
                  <span className="mono" style={{fontSize: 10.5, color:'var(--text-3)'}}>{f.size}</span>
                </div>
                <div style={{height: 3, background:'rgba(255,255,255,.04)', borderRadius: 999, overflow:'hidden'}}>
                  <div style={{width:`${f.progress}%`, height:'100%', background:'linear-gradient(90deg, var(--accent), var(--accent-2))', boxShadow:`0 0 6px var(--accent)`, transition:'width .25s'}}/>
                </div>
              </div>
              {f.status === 'done'
                ? <Icon name="check" size={16} style={{color:'var(--good)'}}/>
                : <span className="mono" style={{fontSize: 10.5, color:'var(--accent-2)'}}>{f.progress}%</span>}
            </div>
          ))}
        </div>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 18, paddingTop: 16, borderTop:'1px solid var(--line)'}}>
          <div style={{fontSize: 11.5, color:'var(--text-3)'}}>
            <Icon name="check" size={11} style={{color:'var(--good)'}}/> Auto-optimization & alt text suggestions enabled
          </div>
          <div style={{display:'flex', gap: 8}}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn primary">Insert into media</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- PAGES ----------
const PagesView = () => {
  const rows = [
    {p:'/',           t:'Homepage',                    s:'live', score: 96, last:'2h ago',  views:'248k'},
    {p:'/pricing',    t:'Pricing & plans',             s:'live', score: 94, last:'1d ago',  views:'42k'},
    {p:'/features',   t:'Features overview',           s:'live', score: 88, last:'3d ago',  views:'31k'},
    {p:'/about',      t:'About Spay',                  s:'live', score: 82, last:'1w ago',  views:'12k'},
    {p:'/customers',  t:'Customer stories',            s:'live', score: 86, last:'4d ago',  views:'18k'},
    {p:'/changelog',  t:'Product changelog',           s:'live', score: 79, last:'6h ago',  views:'8.4k'},
    {p:'/legal/dpa',  t:'Data processing addendum',    s:'live', score: 64, last:'2mo ago', views:'1.2k'},
    {p:'/blog',       t:'Blog index',                  s:'live', score: 91, last:'2h ago',  views:'88k'},
    {p:'/changelog/v3', t:'Spay 3.0 — what\'s new',    s:'draft', score: 71, last:'just now', views:'—'},
  ];
  return (
    <div className="content fade-in" style={{display:'flex', flexDirection:'column', gap: 16}}>
      <Card padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16, gap: 12, flexWrap:'wrap'}}>
          <SectionHeader eyebrow="142 PAGES" title="All pages"/>
          <div style={{display:'flex', gap: 8}}>
            <button className="btn"><Icon name="filter" size={13}/>All statuses</button>
            <button className="btn primary"><Icon name="plus" size={13}/>New page</button>
          </div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize: 13}}>
          <thead>
            <tr style={{textAlign:'left', color:'var(--text-3)', fontSize: 10, letterSpacing:'.14em'}} className="mono">
              <th style={{padding:'10px 6px', fontWeight:400}}>PATH</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>TITLE</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>STATUS</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>SEO</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>VIEWS / 30D</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>UPDATED</th>
              <th style={{padding:'10px 6px', fontWeight:400}}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{borderTop:'1px solid var(--line)'}}>
                <td style={{padding:'12px 6px', fontFamily:'Geist Mono', fontSize: 11.5, color:'var(--accent-2)'}}>{r.p}</td>
                <td style={{padding:'12px 6px'}}>{r.t}</td>
                <td style={{padding:'12px 6px'}}>
                  <span className={`chip ${r.s==='live'?'good':''}`}><span className={`dot ${r.s==='live'?'good':''}`}/>{r.s}</span>
                </td>
                <td style={{padding:'12px 6px'}}>
                  <div style={{display:'flex', alignItems:'center', gap: 8}}>
                    <div style={{width: 70, height: 4, background:'rgba(255,255,255,.05)', borderRadius:999}}>
                      <div style={{width:`${r.score}%`, height:'100%', borderRadius: 999, background: r.score >= 85 ? 'linear-gradient(90deg, var(--good), var(--accent))' : r.score >= 70 ? 'linear-gradient(90deg, var(--warn), var(--accent))' : 'var(--bad)'}}/>
                    </div>
                    <span className="mono" style={{fontSize: 10.5}}>{r.score}</span>
                  </div>
                </td>
                <td style={{padding:'12px 6px', fontFamily:'Geist Mono', color:'var(--text-2)'}}>{r.views}</td>
                <td style={{padding:'12px 6px', color:'var(--text-3)'}}>{r.last}</td>
                <td style={{padding:'12px 6px', textAlign:'right'}}>
                  <div style={{display:'flex', gap: 4, justifyContent:'flex-end'}}>
                    <button className="btn icon ghost"><Icon name="eye" size={13}/></button>
                    <button className="btn icon ghost"><Icon name="edit" size={13}/></button>
                    <button className="btn icon ghost"><Icon name="more" size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ---------- SEO SETTINGS ----------
const SeoSettingsView = () => {
  const [robots, setRobots] = React.useState(true);
  const [og, setOg] = React.useState(true);
  const [schema, setSchema] = React.useState(true);
  return (
    <div className="content fade-in" style={{display:'grid', gridTemplateColumns:'1fr 320px', gap: 16}}>
      <div style={{display:'flex', flexDirection:'column', gap: 14}}>
        <Card padding={22}>
          <SectionHeader eyebrow="GLOBAL SEO" title="Default metadata"/>
          <div style={{display:'flex', flexDirection:'column', gap: 14}}>
            <div>
              <label style={{fontSize: 11.5, color:'var(--text-2)', display:'block', marginBottom: 6}}>Site title template</label>
              <input className="input" defaultValue="%page% — Spay" style={{fontFamily:'Geist Mono', fontSize: 12.5}}/>
              <div style={{fontSize: 11, color:'var(--text-3)', marginTop: 4}}>Use <span className="mono" style={{color:'var(--accent-2)'}}>%page%</span> and <span className="mono" style={{color:'var(--accent-2)'}}>%site%</span> as variables</div>
            </div>
            <div>
              <label style={{fontSize: 11.5, color:'var(--text-2)', display:'block', marginBottom: 6}}>Default meta description</label>
              <textarea className="input" rows="3" defaultValue="Spay is the modern SEO CMS for content teams. Plan, write, optimize, and ship — all from a single workspace." style={{resize:'vertical', fontSize: 12.5}}/>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12}}>
              <div>
                <label style={{fontSize: 11.5, color:'var(--text-2)', display:'block', marginBottom: 6}}>Canonical domain</label>
                <input className="input" defaultValue="https://spay.studio" style={{fontFamily:'Geist Mono', fontSize: 12.5}}/>
              </div>
              <div>
                <label style={{fontSize: 11.5, color:'var(--text-2)', display:'block', marginBottom: 6}}>Default language</label>
                <input className="input" defaultValue="en-US" style={{fontFamily:'Geist Mono', fontSize: 12.5}}/>
              </div>
            </div>
          </div>
        </Card>

        <Card padding={22}>
          <SectionHeader eyebrow="ADVANCED" title="Indexing & crawlers"/>
          <div style={{display:'flex', flexDirection:'column', gap: 4}}>
            {[
              {k:'robots', v: robots, set: setRobots, t:'Allow indexing of this site', d:'When off, all pages serve a noindex, nofollow header'},
              {k:'og', v: og, set: setOg, t:'Auto-generate Open Graph images', d:'Spay creates social cards from page title + brand colors'},
              {k:'schema', v: schema, set: setSchema, t:'Inject structured data (JSON-LD)', d:'Article, BreadcrumbList, Product, FAQ, Organization'},
              {k:'sitemap', v: true, set: ()=>{}, t:'Auto-submit sitemap to Google & Bing', d:'Pings search engines on every publish'},
            ].map(o => (
              <div key={o.k} style={{display:'flex', alignItems:'center', gap: 14, padding:'14px 0', borderBottom:'1px solid var(--line)'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize: 13, fontWeight: 500, marginBottom: 2}}>{o.t}</div>
                  <div style={{fontSize: 11.5, color:'var(--text-3)'}}>{o.d}</div>
                </div>
                <div className={`toggle ${o.v ? 'on' : ''}`} onClick={() => o.set(!o.v)}/>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={22}>
          <SectionHeader eyebrow="ROBOTS.TXT" title="Crawler directives"/>
          <pre className="mono" style={{
            margin: 0, padding: 16, borderRadius: 12,
            background:'rgba(9,14,28,.7)', border:'1px solid var(--line)',
            fontSize: 12, color:'var(--text-2)', lineHeight: 1.7, overflowX:'auto'
          }}>{`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/internal
Disallow: /preview/

Sitemap: https://spay.studio/sitemap.xml
`}</pre>
        </Card>
      </div>

      {/* Live preview */}
      <div style={{display:'flex', flexDirection:'column', gap: 14, position:'sticky', top: 80, alignSelf:'flex-start'}}>
        <Card padding={18}>
          <div className="mono" style={{fontSize: 10, color:'var(--accent-2)', letterSpacing:'.16em', marginBottom: 12}}>SERP PREVIEW</div>
          <div style={{padding: 16, borderRadius: 12, background:'#fff', color:'#202124', fontFamily:'Arial, sans-serif'}}>
            <div style={{fontSize: 11, color:'#5f6368', marginBottom: 4}}>spay.studio › blog</div>
            <div style={{fontSize: 18, color:'#1a0dab', marginBottom: 4, fontWeight: 400, lineHeight: 1.3}}>How AI is reshaping technical SEO in 2026 — Spay</div>
            <div style={{fontSize: 12, color:'#4d5156', lineHeight: 1.5}}>A practical look at how generative engines are changing the SEO playbook — and what to do about it.</div>
          </div>
        </Card>
        <Card padding={18}>
          <div className="mono" style={{fontSize: 10, color:'var(--accent-2)', letterSpacing:'.16em', marginBottom: 12}}>OPEN GRAPH</div>
          <div style={{borderRadius: 12, overflow:'hidden', border:'1px solid var(--line)'}}>
            <div style={{aspectRatio:'1.91/1', background:'linear-gradient(135deg, #04babf, #0e2e2e)', display:'grid', placeItems:'center', position:'relative'}}>
              <div className="grid-bg"/>
              <div style={{textAlign:'center', padding: 16, position:'relative'}}>
                <div style={{fontSize: 14, color:'#fff', fontWeight: 600, lineHeight: 1.3}}>How AI is reshaping technical SEO</div>
                <div style={{fontSize: 9, color:'rgba(255,255,255,.6)', marginTop: 4}} className="mono">spay.studio</div>
              </div>
            </div>
            <div style={{padding: 10, background:'rgba(9,14,28,.7)'}}>
              <div className="mono" style={{fontSize: 9, color:'var(--text-3)'}}>SPAY.STUDIO</div>
              <div style={{fontSize: 11.5, marginTop: 2}}>How AI is reshaping technical SEO in 2026</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ---------- REDIRECTS ----------
const RedirectsView = () => {
  const rows = [
    {f:'/old-blog/seo-tips', t:'/blog/seo-tips-2026', code: 301, hits: 1284, last:'2h ago'},
    {f:'/features/optimizer', t:'/features/ai-content-optimizer', code: 301, hits: 842, last:'4h ago'},
    {f:'/v2/*', t:'/v3/*', code: 301, hits: 4218, last:'1d ago'},
    {f:'/blog/old-slug', t:'/blog/new-slug', code: 302, hits: 64, last:'3d ago'},
    {f:'/legacy-pricing', t:'/pricing', code: 301, hits: 2014, last:'5h ago'},
  ];
  return (
    <div className="content fade-in" style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 14}}>
        <StatCard label="Active redirects" value="184" hint="across the site"/>
        <StatCard label="Hits this month" value="14,820" delta="+8.2%" spark={[40,42,46,50,54,58,62,68,72,76,82,88]}/>
        <StatCard label="Broken links" value="0" hint="Last scan: 12 min ago"/>
      </div>
      <Card padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14, gap: 12}}>
          <SectionHeader eyebrow="MANAGE" title="URL redirects"/>
          <div style={{display:'flex', gap: 8}}>
            <button className="btn">Import CSV</button>
            <button className="btn primary"><Icon name="plus" size={13}/>New redirect</button>
          </div>
        </div>
        <div style={{padding: 14, borderRadius: 12, background:'rgba(9,14,28,.5)', border:'1px solid var(--line)', display:'grid', gridTemplateColumns:'1fr auto 1fr 80px auto', gap: 10, alignItems:'center', marginBottom: 12}}>
          <input className="input" placeholder="/from-path" style={{fontFamily:'Geist Mono', fontSize: 12}}/>
          <Icon name="arrow-right" size={14} style={{color:'var(--text-3)'}}/>
          <input className="input" placeholder="/to-path" style={{fontFamily:'Geist Mono', fontSize: 12}}/>
          <select className="input" style={{padding:'10px', fontSize: 12, fontFamily:'Geist Mono'}}><option>301</option><option>302</option><option>307</option></select>
          <button className="btn primary">Add</button>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize: 12.5}}>
          <thead>
            <tr style={{textAlign:'left', color:'var(--text-3)', fontSize: 10, letterSpacing:'.14em'}} className="mono">
              <th style={{padding:'10px 6px', fontWeight:400}}>FROM</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>TO</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>CODE</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>HITS</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>LAST</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{borderTop:'1px solid var(--line)'}}>
                <td style={{padding:'12px 6px', fontFamily:'Geist Mono', color:'var(--text-2)'}}>{r.f}</td>
                <td style={{padding:'12px 6px', fontFamily:'Geist Mono', color:'var(--accent-2)'}}>{r.t}</td>
                <td style={{padding:'12px 6px'}}>
                  <span className="chip" style={{padding:'2px 8px', fontFamily:'Geist Mono'}}>{r.code}</span>
                </td>
                <td style={{padding:'12px 6px', fontFamily:'Geist Mono'}}>{r.hits.toLocaleString()}</td>
                <td style={{padding:'12px 6px', color:'var(--text-3)'}}>{r.last}</td>
                <td style={{padding:'12px 6px', textAlign:'right'}}><button className="btn icon ghost"><Icon name="trash" size={13}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ---------- SITEMAP ----------
const SitemapView = () => {
  return (
    <div className="content fade-in" style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 14}}>
        <Card padding={20}>
          <SectionHeader eyebrow="SITEMAP.XML" title="Site structure" right={<button className="btn"><Icon name="globe" size={13}/>View XML</button>}/>
          <div style={{display:'flex', flexDirection:'column', gap: 8, fontFamily:'Geist Mono', fontSize: 12}}>
            {[
              {p:'/', d: 0, n: 1},
              {p:'/blog', d: 0, n: 38},
              {p:'/blog/[slug]', d: 1, n: 38},
              {p:'/features', d: 0, n: 1},
              {p:'/features/[name]', d: 1, n: 12},
              {p:'/pricing', d: 0, n: 1},
              {p:'/customers', d: 0, n: 1},
              {p:'/customers/[story]', d: 1, n: 8},
              {p:'/about', d: 0, n: 1},
              {p:'/changelog', d: 0, n: 1},
              {p:'/changelog/[version]', d: 1, n: 24},
            ].map((it, i) => (
              <div key={i} style={{display:'flex', alignItems:'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: it.d ? 'transparent' : 'rgba(4,186,191,.04)', borderLeft: it.d ? 'none' : '2px solid rgba(4,186,191,.4)', marginLeft: it.d * 24}}>
                {it.d > 0 && <span style={{color:'var(--text-3)'}}>└─</span>}
                <span style={{color: it.d ? 'var(--text-2)' : '#fff', flex: 1}}>{it.p}</span>
                <span className="chip" style={{padding:'1px 7px', fontSize: 10}}>{it.n} URL{it.n > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </Card>
        <div style={{display:'flex', flexDirection:'column', gap: 14}}>
          <Card padding={18}>
            <div className="mono" style={{fontSize: 10, color:'var(--accent-2)', letterSpacing:'.16em', marginBottom: 14}}>STATUS</div>
            <div style={{fontSize: 32, fontWeight: 600, marginBottom: 4}}>1,284</div>
            <div style={{fontSize: 12, color:'var(--text-3)', marginBottom: 14}}>Total URLs in sitemap</div>
            <div style={{display:'flex', flexDirection:'column', gap: 10}}>
              <div style={{display:'flex', alignItems:'center', gap: 10, fontSize: 12}}>
                <span className="dot good"/><span style={{color:'var(--text-2)', flex: 1}}>Last submitted</span><span className="mono">2h ago</span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap: 10, fontSize: 12}}>
                <span className="dot"/><span style={{color:'var(--text-2)', flex: 1}}>Google indexed</span><span className="mono">1,117</span>
              </div>
              <div style={{display:'flex', alignItems:'center', gap: 10, fontSize: 12}}>
                <span className="dot warn"/><span style={{color:'var(--text-2)', flex: 1}}>Pending</span><span className="mono">86</span>
              </div>
            </div>
            <button className="btn primary" style={{width:'100%', marginTop: 16, justifyContent:'center'}}><Icon name="sparkles" size={12}/>Resubmit to Google</button>
          </Card>
          <Card padding={18}>
            <div className="mono" style={{fontSize: 10, color:'var(--accent-2)', letterSpacing:'.16em', marginBottom: 12}}>FEEDS</div>
            {['/sitemap.xml','/sitemap-pages.xml','/sitemap-blog.xml','/rss.xml'].map(p => (
              <div key={p} style={{display:'flex', alignItems:'center', gap: 8, padding:'8px 0', borderTop:'1px solid var(--line)', fontFamily:'Geist Mono', fontSize: 11.5, color:'var(--accent-2)'}}>
                <Icon name="link" size={11} style={{color:'var(--text-3)'}}/>
                <span style={{flex:1}}>{p}</span>
                <Icon name="arrow-right" size={11} style={{color:'var(--text-3)'}}/>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

// ---------- USERS ----------
const UsersView = () => {
  const users = [
    {n:'Elena Marx',     e:'elena@acme.studio',    r:'Owner',  s:'online',  l:'Now'},
    {n:'Mira Chen',      e:'mira@acme.studio',     r:'Editor', s:'online',  l:'Now'},
    {n:'Theo Ramirez',   e:'theo@acme.studio',     r:'Editor', s:'away',    l:'2h ago'},
    {n:'Aisha Patel',    e:'aisha@acme.studio',    r:'Author', s:'online',  l:'Now'},
    {n:'Jonas Berg',     e:'jonas@acme.studio',    r:'Author', s:'offline', l:'1d ago'},
    {n:'Priya Iyer',     e:'priya@acme.studio',    r:'Viewer', s:'offline', l:'3d ago'},
  ];
  return (
    <div className="content fade-in" style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14}}>
        <StatCard label="Total seats" value="12 / 25" hint="Pro plan"/>
        <StatCard label="Active today" value="8" delta="+2"/>
        <StatCard label="Pending invites" value="3"/>
        <StatCard label="Roles" value="4"/>
      </div>
      <Card padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14}}>
          <SectionHeader eyebrow="WORKSPACE" title="Members"/>
          <div style={{display:'flex', gap: 8}}>
            <button className="btn">Manage roles</button>
            <button className="btn primary"><Icon name="plus" size={13}/>Invite member</button>
          </div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize: 13}}>
          <thead>
            <tr style={{textAlign:'left', color:'var(--text-3)', fontSize: 10, letterSpacing:'.14em'}} className="mono">
              <th style={{padding:'10px 6px', fontWeight:400}}>NAME</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>ROLE</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>STATUS</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>LAST ACTIVE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} style={{borderTop:'1px solid var(--line)'}}>
                <td style={{padding:'12px 6px'}}>
                  <div style={{display:'flex', alignItems:'center', gap: 12}}>
                    <div style={{width: 32, height: 32, borderRadius:'50%', background:`linear-gradient(135deg, hsl(${180+i*30}, 50%, 35%), #0e2e2e)`, display:'grid', placeItems:'center', fontSize: 11, fontWeight: 600, color:'#fff'}}>
                      {u.n.split(' ').map(p=>p[0]).join('')}
                    </div>
                    <div>
                      <div style={{fontWeight: 500}}>{u.n}</div>
                      <div className="mono" style={{fontSize: 10.5, color:'var(--text-3)'}}>{u.e}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'12px 6px'}}><span className="chip">{u.r}</span></td>
                <td style={{padding:'12px 6px'}}>
                  <span style={{display:'inline-flex', alignItems:'center', gap: 6, fontSize: 12}}>
                    <span className={`dot ${u.s==='online'?'good':u.s==='away'?'warn':''}`} style={{background: u.s==='offline'?'var(--text-3)':undefined, boxShadow: u.s==='offline'?'none':undefined}}/>
                    {u.s}
                  </span>
                </td>
                <td style={{padding:'12px 6px', color:'var(--text-3)'}}>{u.l}</td>
                <td style={{padding:'12px 6px', textAlign:'right'}}><button className="btn icon ghost"><Icon name="more" size={13}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ---------- SETTINGS ----------
const SettingsView = () => {
  return (
    <div className="content fade-in" style={{display:'flex', flexDirection:'column', gap: 16, maxWidth: 920}}>
      <Card padding={22}>
        <SectionHeader eyebrow="WORKSPACE" title="General"/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
          <div><label style={{fontSize: 11.5, color:'var(--text-2)', display:'block', marginBottom: 6}}>Workspace name</label><input className="input" defaultValue="Acme Studio"/></div>
          <div><label style={{fontSize: 11.5, color:'var(--text-2)', display:'block', marginBottom: 6}}>Slug</label><input className="input" defaultValue="acme-studio" style={{fontFamily:'Geist Mono', fontSize: 12.5}}/></div>
          <div><label style={{fontSize: 11.5, color:'var(--text-2)', display:'block', marginBottom: 6}}>Primary domain</label><input className="input" defaultValue="https://acme.studio" style={{fontFamily:'Geist Mono', fontSize: 12.5}}/></div>
          <div><label style={{fontSize: 11.5, color:'var(--text-2)', display:'block', marginBottom: 6}}>Time zone</label><input className="input" defaultValue="America/New_York"/></div>
        </div>
      </Card>

      <Card padding={22}>
        <SectionHeader eyebrow="INTEGRATIONS" title="Connected services"/>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 12}}>
          {[
            {n:'Google Search Console', d:'Verified · sync every 6h', on: true},
            {n:'Google Analytics 4', d:'Property G-9F8X2L', on: true},
            {n:'Ahrefs', d:'API key configured', on: true},
            {n:'Slack', d:'Notifications to #seo-team', on: true},
            {n:'Zapier', d:'4 zaps connected', on: false},
            {n:'Webhooks', d:'2 endpoints configured', on: true},
          ].map(it => (
            <div key={it.n} style={{padding: 14, borderRadius: 12, border:'1px solid var(--line)', background:'rgba(9,14,28,.4)', display:'flex', alignItems:'center', gap: 12}}>
              <div style={{width: 36, height: 36, borderRadius: 10, background:'linear-gradient(135deg, rgba(4,186,191,.2), rgba(14,46,46,.4))', display:'grid', placeItems:'center'}}>
                <Icon name="globe" size={16} style={{color:'var(--accent-2)'}}/>
              </div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 13, fontWeight: 500}}>{it.n}</div>
                <div style={{fontSize: 11, color:'var(--text-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{it.d}</div>
              </div>
              <span className={`chip ${it.on?'good':''}`} style={{padding:'2px 8px'}}>
                <span className={`dot ${it.on?'good':''}`} style={{background: !it.on?'var(--text-3)':undefined, boxShadow:!it.on?'none':undefined}}/>
                {it.on ? 'Active' : 'Off'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card padding={22}>
        <SectionHeader eyebrow="DANGER ZONE" title="Account deletion"/>
        <div style={{display:'flex', alignItems:'center', gap: 14, padding: 16, borderRadius: 12, border:'1px solid rgba(255,107,128,.2)', background:'rgba(255,107,128,.04)'}}>
          <div style={{flex:1}}>
            <div style={{fontSize: 13, fontWeight: 500, marginBottom: 3}}>Delete this workspace</div>
            <div style={{fontSize: 11.5, color:'var(--text-3)'}}>All pages, blogs, and analytics history will be permanently removed.</div>
          </div>
          <button className="btn" style={{borderColor:'rgba(255,107,128,.3)', color:'#ffb1bd'}}>Delete workspace</button>
        </div>
      </Card>
    </div>
  );
};

window.MediaView = MediaView;
window.MediaModal = MediaModal;
window.PagesView = PagesView;
window.SeoSettingsView = SeoSettingsView;
window.RedirectsView = RedirectsView;
window.SitemapView = SitemapView;
window.UsersView = UsersView;
window.SettingsView = SettingsView;
