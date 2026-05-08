// Additional views — second file appended into window

// ---------- BLOGS LIST ----------
const BlogsView = ({ onEdit }) => {
  const [filter, setFilter] = React.useState('all');
  const posts = [
    {t:'How AI is reshaping technical SEO in 2026', a:'Mira Chen', d:'May 6, 2026', s:'published', score: 94, views:'42.1k', cat:'AI'},
    {t:'A field guide to Core Web Vitals', a:'Theo Ramirez', d:'May 6, 2026', s:'published', score: 88, views:'18.4k', cat:'Performance'},
    {t:'Building a content engine: the Spay playbook', a:'Elena Marx', d:'May 5, 2026', s:'review', score: 76, views:'—', cat:'Strategy'},
    {t:'Internal linking strategies that scale', a:'Aisha Patel', d:'May 4, 2026', s:'draft', score: 62, views:'—', cat:'On-page'},
    {t:'Schema.org for ecommerce: a complete guide', a:'Mira Chen', d:'May 2, 2026', s:'published', score: 91, views:'9.8k', cat:'Schema'},
    {t:'When to use noindex vs canonical', a:'Theo Ramirez', d:'Apr 29, 2026', s:'published', score: 86, views:'14.2k', cat:'Technical'},
    {t:'Backlink outreach templates that convert', a:'Aisha Patel', d:'Apr 27, 2026', s:'scheduled', score: 84, views:'—', cat:'Outreach'},
  ];
  const tabs = [{k:'all', l:'All', n: posts.length},{k:'published', l:'Published', n: posts.filter(p=>p.s==='published').length},{k:'draft', l:'Drafts', n: posts.filter(p=>p.s==='draft').length},{k:'review', l:'In review', n: posts.filter(p=>p.s==='review').length},{k:'scheduled', l:'Scheduled', n: posts.filter(p=>p.s==='scheduled').length}];
  const list = filter === 'all' ? posts : posts.filter(p => p.s === filter);

  return (
    <div className="content fade-in" style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', gap: 4, padding: 4, border:'1px solid var(--line)', borderRadius: 12, background:'rgba(9,14,28,.5)'}}>
          {tabs.map(t => (
            <button key={t.k} onClick={()=>setFilter(t.k)} style={{
              padding:'7px 14px', borderRadius: 8, border:'none', cursor:'pointer',
              background: filter===t.k ? 'rgba(4,186,191,.15)' : 'transparent',
              color: filter===t.k ? '#fff' : 'var(--text-2)',
              fontFamily:'inherit', fontSize: 12.5,
              boxShadow: filter===t.k ? 'inset 0 0 0 1px rgba(4,186,191,.3)' : 'none',
              display:'flex', alignItems:'center', gap: 6
            }}>
              {t.l}
              <span className="mono" style={{fontSize: 9.5, color: filter===t.k ? 'var(--accent-2)' : 'var(--text-3)'}}>{t.n}</span>
            </button>
          ))}
        </div>
        <div style={{display:'flex', gap: 8}}>
          <button className="btn"><Icon name="filter" size={13}/>Filter</button>
          <button className="btn"><Icon name="calendar" size={13}/>This month</button>
          <button className="btn primary" onClick={()=>onEdit(null)}><Icon name="plus" size={13}/>New post</button>
        </div>
      </div>

      {/* Featured editor card */}
      <Card padding={0} glow={true} style={{overflow:'hidden', position:'relative'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', minHeight: 200}}>
          <div style={{padding: 28, display:'flex', flexDirection:'column', justifyContent:'center', position:'relative', zIndex: 1}}>
            <span className="chip" style={{alignSelf:'flex-start', marginBottom: 12}}><Icon name="sparkles" size={10}/>AI ASSISTED</span>
            <h2 style={{margin:'0 0 8px', fontSize: 24, letterSpacing:'-.02em', fontWeight: 600}}>Generate a brief from any URL</h2>
            <p style={{margin:'0 0 16px', color:'var(--text-2)', fontSize: 13.5, lineHeight: 1.55, maxWidth: 460}}>
              Spay AI analyzes the SERP, extracts entity coverage gaps and produces an outlined brief in under 30 seconds.
            </p>
            <div style={{display:'flex', gap: 8, maxWidth: 440}}>
              <input className="input" placeholder="https://example.com/article" style={{flex:1}}/>
              <button className="btn primary"><Icon name="sparkles" size={12}/>Analyze</button>
            </div>
          </div>
          <div style={{position:'relative', overflow:'hidden'}}>
            <div className="grid-bg"/>
            <svg viewBox="0 0 400 200" style={{position:'absolute', inset: 0, width:'100%', height:'100%'}}>
              <defs>
                <radialGradient id="bloom" cx="80%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#04babf" stopOpacity=".6"/>
                  <stop offset="100%" stopColor="#04babf" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <rect width="400" height="200" fill="url(#bloom)"/>
              {/* faux ai prompt rings */}
              {[40, 60, 80, 100, 120].map((r, i) => (
                <circle key={i} cx="320" cy="100" r={r} fill="none" stroke="rgba(4,186,191,.18)" strokeDasharray="3 5" style={{animation:`spin ${20 + i*5}s linear infinite`, transformOrigin:'320px 100px'}}/>
              ))}
              <circle cx="320" cy="100" r="22" fill="rgba(4,186,191,.18)"/>
              <circle cx="320" cy="100" r="10" fill="#04babf" style={{filter:'drop-shadow(0 0 12px #04babf)'}}/>
            </svg>
          </div>
        </div>
      </Card>

      {/* Posts grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(330px, 1fr))', gap: 14}}>
        {list.map((p, i) => (
          <Card key={i} padding={0} style={{overflow:'hidden', cursor:'pointer', transition:'all .2s'}}>
            <div onClick={()=>onEdit(p)}>
              <div style={{height: 120, position:'relative', overflow:'hidden', background:`linear-gradient(135deg, hsl(${180 + i*22}, 50%, 30%), #0e2e2e)`}}>
                <div className="grid-bg"/>
                <div style={{position:'absolute', top: 12, left: 12}}>
                  <span className={`chip ${p.s==='published'?'good':p.s==='review'?'warn':p.s==='scheduled'?'':''}`}>
                    <span className={`dot ${p.s==='published'?'good':p.s==='review'?'warn':''}`}/>
                    {p.s}
                  </span>
                </div>
                <div style={{position:'absolute', top: 12, right: 12, padding:'4px 10px', borderRadius: 999, background:'rgba(0,0,0,.5)', backdropFilter:'blur(8px)', border:'1px solid rgba(4,186,191,.3)', fontSize: 11, fontWeight: 500}}>
                  <span style={{color:'var(--accent-2)'}}>SEO</span> {p.score}
                </div>
                <div style={{position:'absolute', bottom: 12, left: 12, fontSize: 10, color:'var(--text-3)'}} className="mono">{p.cat.toUpperCase()}</div>
              </div>
              <div style={{padding: 16}}>
                <div style={{fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 8, minHeight: 39}}>{p.t}</div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize: 11, color:'var(--text-3)'}}>
                  <span>{p.a} · {p.d}</span>
                  <span><Icon name="eye" size={11}/> {p.views}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ---------- BLOG EDITOR ----------
const EditorView = ({ post, onBack }) => {
  const [title, setTitle] = React.useState(post?.t || 'Untitled post');
  const [score, setScore] = React.useState(78);
  const issues = [
    {t:'Add primary keyword to H1', s:'warn'},
    {t:'Meta description is 142 chars (good)', s:'good'},
    {t:'Image at line 24 missing alt text', s:'warn'},
    {t:'Word count 1,420 — strong', s:'good'},
    {t:'Internal links: 3 found, aim for 5+', s:'warn'},
    {t:'Readability: Grade 8 (good)', s:'good'},
  ];

  return (
    <div className="content fade-in" style={{display:'grid', gridTemplateColumns:'1fr 320px', gap: 16}}>
      {/* Editor */}
      <div style={{display:'flex', flexDirection:'column', gap: 14}}>
        <Card padding={20}>
          {/* Toolbar */}
          <div style={{display:'flex', gap: 4, padding: 4, borderBottom:'1px solid var(--line)', marginBottom: 16, paddingBottom: 12, flexWrap:'wrap', alignItems:'center'}}>
            <button className="btn icon ghost"><Icon name="h1" size={14}/></button>
            <button className="btn icon ghost"><Icon name="h2" size={14}/></button>
            <span style={{width:1, height: 18, background:'var(--line)', margin:'0 4px'}}/>
            <button className="btn icon ghost"><Icon name="bold" size={14}/></button>
            <button className="btn icon ghost"><Icon name="italic" size={14}/></button>
            <button className="btn icon ghost"><Icon name="underline" size={14}/></button>
            <span style={{width:1, height: 18, background:'var(--line)', margin:'0 4px'}}/>
            <button className="btn icon ghost"><Icon name="list" size={14}/></button>
            <button className="btn icon ghost"><Icon name="quote" size={14}/></button>
            <button className="btn icon ghost"><Icon name="link" size={14}/></button>
            <button className="btn icon ghost"><Icon name="image" size={14}/></button>
            <button className="btn icon ghost"><Icon name="code" size={14}/></button>
            <span style={{width:1, height: 18, background:'var(--line)', margin:'0 4px'}}/>
            <button className="btn ghost" style={{fontSize: 11.5}}><Icon name="sparkles" size={12}/>AI rewrite</button>
            <div style={{marginLeft:'auto', display:'flex', gap: 6, fontSize: 11, color:'var(--text-3)', alignItems:'center'}}>
              <span className="dot good"/>Saved 2s ago
            </div>
          </div>

          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              width:'100%', background:'transparent', border:'none', outline:'none',
              color:'#fff', fontSize: 32, fontWeight: 600, letterSpacing:'-.02em',
              fontFamily:'inherit', padding: 0, marginBottom: 6
            }}/>
          <div style={{fontSize: 12, color:'var(--text-3)', marginBottom: 18, display:'flex', gap: 12}}>
            <span><Icon name="users" size={11}/> Mira Chen</span>
            <span>·</span>
            <span>Last edited just now</span>
            <span>·</span>
            <span>1,420 words · 7 min read</span>
          </div>

          <div style={{fontSize: 14.5, lineHeight: 1.75, color:'var(--text)', display:'flex', flexDirection:'column', gap: 14}}>
            <p style={{margin:0}}>The search landscape has shifted dramatically over the past eighteen months. With <span style={{background:'rgba(4,186,191,.15)', padding:'1px 4px', borderRadius: 4, color:'var(--accent-2)'}}>generative engines</span> now mediating most informational queries, the old SEO playbook — keyword density, exact-match anchors, and thin content at scale — is finally, decisively obsolete.</p>
            <h3 style={{margin:'8px 0 0', fontSize: 20, fontWeight: 600}}>What actually moves the needle in 2026</h3>
            <p style={{margin:0}}>Three signals dominate the modern ranking stack: <strong style={{color:'#fff'}}>entity coverage</strong>, <strong style={{color:'#fff'}}>first-party experience data</strong>, and <strong style={{color:'#fff'}}>semantic freshness</strong>. We'll walk through each, with examples from publishers who 2x'd organic in the last quarter.</p>
            <div style={{padding: 14, borderRadius: 12, background:'rgba(4,186,191,.06)', border:'1px solid rgba(4,186,191,.2)', display:'flex', gap: 12, alignItems:'flex-start'}}>
              <div style={{padding: 6, borderRadius: 8, background:'rgba(4,186,191,.18)', display:'grid', placeItems:'center'}}>
                <Icon name="sparkles" size={14} style={{color:'var(--accent-2)'}}/>
              </div>
              <div>
                <div style={{fontSize: 12, color:'var(--accent-2)', fontWeight: 500, marginBottom: 4}}>AI suggestion</div>
                <div style={{fontSize: 13, color:'var(--text-2)'}}>Add a comparison table contrasting 2024 vs 2026 ranking factors — competitors covering this term include 3 such tables on average.</div>
                <div style={{display:'flex', gap: 6, marginTop: 10}}>
                  <button className="btn" style={{padding:'4px 10px', fontSize: 11}}>Insert</button>
                  <button className="btn ghost" style={{padding:'4px 10px', fontSize: 11}}>Dismiss</button>
                </div>
              </div>
            </div>
            <p style={{margin:0, color:'var(--text-2)'}}>Entity coverage refers to the breadth of related concepts, named entities, and sub-topics your content addresses…</p>
            <p style={{margin:0, color:'var(--text-3)'}}>[ Continue typing or use ⌘J for AI continue… ]</p>
          </div>
        </Card>
      </div>

      {/* Right rail */}
      <div style={{display:'flex', flexDirection:'column', gap: 14, position:'sticky', top: 80, alignSelf:'flex-start'}}>
        <Card padding={18}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
            <div className="mono" style={{fontSize: 10, color:'var(--accent-2)', letterSpacing:'.16em'}}>SEO SCORE</div>
            <span className="chip warn">Improving</span>
          </div>
          <div style={{display:'grid', placeItems:'center', padding:'8px 0 14px'}}>
            <RadialScore value={score} size={140} stroke={11}/>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap: 8}}>
            {issues.map((iss, i) => (
              <div key={i} style={{display:'flex', gap: 8, alignItems:'center', padding: 8, borderRadius: 8, background:'rgba(9,14,28,.4)', border:'1px solid var(--line)'}}>
                <Icon name={iss.s==='good'?'check':'x'} size={12} style={{color: iss.s==='good'?'var(--good)':'var(--warn)', flexShrink: 0}}/>
                <span style={{fontSize: 11.5, color:'var(--text-2)'}}>{iss.t}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={18}>
          <div className="mono" style={{fontSize: 10, color:'var(--accent-2)', letterSpacing:'.16em', marginBottom: 12}}>METADATA</div>
          <div style={{display:'flex', flexDirection:'column', gap: 12}}>
            <div>
              <label style={{fontSize: 11, color:'var(--text-3)', display:'block', marginBottom: 4}}>Slug</label>
              <input className="input" defaultValue="ai-reshaping-technical-seo-2026" style={{fontSize: 12, fontFamily:'Geist Mono'}}/>
            </div>
            <div>
              <label style={{fontSize: 11, color:'var(--text-3)', display:'block', marginBottom: 4}}>Meta description</label>
              <textarea className="input" rows="3" style={{resize:'vertical', fontSize: 12}} defaultValue="A practical look at how generative engines are changing the SEO playbook — and what to do about it."/>
              <div className="mono" style={{fontSize: 9.5, color:'var(--text-3)', textAlign:'right', marginTop: 4}}>108 / 160</div>
            </div>
            <div>
              <label style={{fontSize: 11, color:'var(--text-3)', display:'block', marginBottom: 4}}>Primary keyword</label>
              <div style={{display:'flex', gap: 6, flexWrap:'wrap'}}>
                <span className="chip" style={{borderColor:'rgba(4,186,191,.4)', color:'#fff', background:'rgba(4,186,191,.12)'}}>generative SEO <Icon name="x" size={10}/></span>
                <span className="chip">ai search</span>
                <span className="chip">technical SEO</span>
                <span className="chip" style={{borderStyle:'dashed', color:'var(--text-3)'}}>+ add</span>
              </div>
            </div>
          </div>
        </Card>

        <div style={{display:'flex', gap: 8}}>
          <button className="btn" style={{flex:1, justifyContent:'center'}} onClick={onBack}>Cancel</button>
          <button className="btn primary" style={{flex:1, justifyContent:'center'}}>Publish</button>
        </div>
      </div>
    </div>
  );
};

// ---------- ANALYTICS ----------
const AnalyticsView = () => {
  const traffic = [320, 380, 350, 420, 480, 460, 520, 580, 640, 600, 720, 780, 850, 820, 920, 980, 1040, 1120];
  const ctr = [3.2, 3.4, 3.6, 3.5, 3.9, 4.1, 4.3, 4.2, 4.6, 4.8, 5.1, 5.3, 5.4, 5.6, 5.5, 5.7, 5.6, 5.59];
  return (
    <div className="content fade-in" style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14}}>
        <StatCard label="Clicks" value="1.38M" delta="+18.4%" spark={traffic.slice(-12)}/>
        <StatCard label="Impressions" value="24.8M" delta="+22.1%" spark={[60,68,72,80,78,86,92,98,104,110,118,128]}/>
        <StatCard label="Avg CTR" value="5.59%" delta="+0.42pp" spark={ctr.slice(-12).map(x=>x*10)}/>
        <StatCard label="Avg position" value="14.2" delta="-2.8" deltaDir="up" spark={[28,26,25,24,22,21,20,19,18,16,15,14]}/>
      </div>

      <Card padding={20}>
        <SectionHeader eyebrow="LAST 90 DAYS" title="Search performance" right={
          <div style={{display:'flex', gap: 8}}>
            <span className="chip"><span className="dot"/>Clicks</span>
            <span className="chip"><span className="dot good"/>CTR</span>
          </div>
        }/>
        <AreaChart data={traffic} secondary={ctr.map(x => x * 200)} height={260}/>
      </Card>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14}}>
        <Card padding={20}>
          <SectionHeader eyebrow="DEVICE" title="Traffic split"/>
          <StackedBar segments={[
            {label:'Desktop', value: 58, color:'#04babf'},
            {label:'Mobile', value: 36, color:'#1ad6db'},
            {label:'Tablet', value: 6, color:'#0e2e2e'},
          ]}/>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12, marginTop: 18}}>
            {[
              {l:'Desktop', v:'58%', n:'802k', c:'#04babf'},
              {l:'Mobile', v:'36%', n:'498k', c:'#1ad6db'},
              {l:'Tablet', v:'6%', n:'82k', c:'#0e2e2e'},
            ].map(s => (
              <div key={s.l} style={{padding: 12, borderRadius: 12, background:'rgba(9,14,28,.4)', border:'1px solid var(--line)'}}>
                <div style={{display:'flex', alignItems:'center', gap: 6, marginBottom: 6}}>
                  <span style={{width: 6, height: 6, borderRadius:'50%', background: s.c, boxShadow:`0 0 6px ${s.c}`}}/>
                  <span style={{fontSize: 11, color:'var(--text-2)'}}>{s.l}</span>
                </div>
                <div style={{fontSize: 18, fontWeight: 600}}>{s.v}</div>
                <div className="mono" style={{fontSize: 10, color:'var(--text-3)'}}>{s.n}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={20}>
          <SectionHeader eyebrow="TRAFFIC SOURCES" title="Where visitors come from"/>
          <BarChart data={[820, 412, 288, 184, 96, 62, 38]} labels={['Google','Direct','Referral','Bing','Social','LinkedIn','DDG']} height={170}/>
        </Card>
      </div>

      <Card padding={20}>
        <SectionHeader eyebrow="TOP PAGES" title="Best performing content" right={<button className="btn ghost" style={{fontSize:12}}>Export <Icon name="arrow-right" size={11}/></button>}/>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize: 12.5}}>
          <thead>
            <tr style={{textAlign:'left', color:'var(--text-3)', fontSize: 10, letterSpacing:'.14em'}} className="mono">
              <th style={{padding:'8px 6px', fontWeight:400}}>PAGE</th>
              <th style={{padding:'8px 6px', fontWeight:400}}>CLICKS</th>
              <th style={{padding:'8px 6px', fontWeight:400}}>IMPRESSIONS</th>
              <th style={{padding:'8px 6px', fontWeight:400}}>CTR</th>
              <th style={{padding:'8px 6px', fontWeight:400}}>POSITION</th>
              <th style={{padding:'8px 6px', fontWeight:400}}>30-DAY</th>
            </tr>
          </thead>
          <tbody>
            {[
              {p:'/blog/ai-reshaping-technical-seo-2026', c:'42,180', i:'612k', ctr:'6.89%', pos: 2.4, t:[40,46,52,58,64,72,80,86,92]},
              {p:'/blog/core-web-vitals-field-guide', c:'28,440', i:'498k', ctr:'5.71%', pos: 3.1, t:[50,52,56,60,68,72,78,82,84]},
              {p:'/features/ai-content-optimizer', c:'21,890', i:'382k', ctr:'5.73%', pos: 4.2, t:[60,62,68,70,72,76,78,80,82]},
              {p:'/blog/schema-org-ecommerce-guide', c:'18,220', i:'318k', ctr:'5.73%', pos: 5.6, t:[40,44,48,54,60,66,70,74,78]},
              {p:'/pricing', c:'14,680', i:'241k', ctr:'6.09%', pos: 1.8, t:[80,82,84,86,88,90,92,94,96]},
              {p:'/blog/internal-linking-at-scale', c:'12,440', i:'201k', ctr:'6.19%', pos: 6.3, t:[20,28,38,50,62,72,80,84,86]},
            ].map((r, i) => (
              <tr key={i} style={{borderTop:'1px solid var(--line)'}}>
                <td style={{padding:'12px 6px', fontFamily:'Geist Mono', fontSize: 11.5, color:'var(--text-2)'}}>{r.p}</td>
                <td style={{padding:'12px 6px', fontWeight: 500}}>{r.c}</td>
                <td style={{padding:'12px 6px', color:'var(--text-2)'}}>{r.i}</td>
                <td style={{padding:'12px 6px', color:'var(--accent-2)'}}>{r.ctr}</td>
                <td style={{padding:'12px 6px', fontFamily:'Geist Mono'}}>{r.pos}</td>
                <td style={{padding:'12px 6px'}}><Sparkline data={r.t} width={90} height={24}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ---------- KEYWORDS ----------
const KeywordsView = () => {
  const data = Array.from({length: 14}).map((_, i) => ({
    kw: ['ai content optimization','enterprise seo platform','spay cms','best blog editor','core web vitals','metadata generator','schema markup tool','seo audit software','content brief generator','keyword cluster tool','site speed optimizer','indexability checker','sitemap validator','robots.txt tester'][i],
    pos: [2,4,1,7,3,9,5,12,6,8,11,4,2,15][i],
    ch: ['+4','+1','0','-2','+6','+3','+1','-4','+2','-1','+5','+8','0','+3'][i],
    vol: [18200,9400,5800,12600,24300,7200,4400,11800,3200,6900,8800,2200,1900,3400][i],
    diff: [78,62,45,84,72,38,52,68,40,58,66,28,32,44][i],
    intent: ['Commercial','Commercial','Branded','Informational','Informational','Tool','Tool','Commercial','Tool','Tool','Tool','Tool','Tool','Tool'][i],
  }));
  return (
    <div className="content fade-in" style={{display:'flex', flexDirection:'column', gap: 16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14}}>
        <StatCard label="Tracked keywords" value="1,284" delta="+42" spark={[60,62,66,70,74,78,82,86,90,92,96,100]}/>
        <StatCard label="Top 3 positions" value="312" delta="+28" spark={[40,44,52,58,64,72,80,86,90,94,98,104]}/>
        <StatCard label="Avg position" value="12.4" delta="-1.8" deltaDir="up" spark={[24,22,20,19,18,17,16,15,14,13,12.5,12.4]}/>
        <StatCard label="Opportunities" value="68" delta="+12" spark={[20,24,28,32,36,42,48,52,56,60,64,68]}/>
      </div>

      <Card padding={20}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16, gap: 12, flexWrap:'wrap'}}>
          <SectionHeader eyebrow="ALL KEYWORDS" title="Tracking 1,284 keywords"/>
          <div style={{display:'flex', gap: 8}}>
            <div style={{position:'relative'}}>
              <Icon name="search" size={13} style={{position:'absolute', left: 12, top: '50%', transform:'translateY(-50%)', color:'var(--text-3)'}}/>
              <input className="input" placeholder="Search keywords…" style={{paddingLeft: 32, fontSize: 12, width: 220}}/>
            </div>
            <button className="btn"><Icon name="filter" size={13}/>All intents</button>
            <button className="btn primary"><Icon name="plus" size={13}/>Add keyword</button>
          </div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize: 12.5}}>
          <thead>
            <tr style={{textAlign:'left', color:'var(--text-3)', fontSize: 10, letterSpacing:'.14em'}} className="mono">
              <th style={{padding:'10px 6px', fontWeight:400}}>KEYWORD</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>INTENT</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>POSITION</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>Δ 30D</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>VOLUME</th>
              <th style={{padding:'10px 6px', fontWeight:400}}>DIFFICULTY</th>
              <th style={{padding:'10px 6px', fontWeight:400}}></th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i} style={{borderTop:'1px solid var(--line)', cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(4,186,191,.04)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'12px 6px'}}>{r.kw}</td>
                <td style={{padding:'12px 6px'}}><span className="chip" style={{padding:'2px 8px', fontSize: 10}}>{r.intent}</span></td>
                <td style={{padding:'12px 6px'}}>
                  <span style={{
                    display:'inline-flex', minWidth: 28, height: 22, padding:'0 8px', borderRadius: 6, alignItems:'center', justifyContent:'center',
                    background: r.pos <= 3 ? 'rgba(4,186,191,.18)' : r.pos <= 10 ? 'rgba(255,255,255,.04)' : 'rgba(255,107,128,.06)',
                    border: `1px solid ${r.pos <= 3 ? 'rgba(4,186,191,.35)' : r.pos <= 10 ? 'var(--line)' : 'rgba(255,107,128,.2)'}`,
                    fontSize: 11.5, fontWeight: 500
                  }}>#{r.pos}</span>
                </td>
                <td style={{padding:'12px 6px', fontFamily:'Geist Mono', color: r.ch.startsWith('+')?'var(--good)':r.ch==='0'?'var(--text-3)':'var(--bad)'}}>{r.ch}</td>
                <td style={{padding:'12px 6px', fontFamily:'Geist Mono', color:'var(--text-2)'}}>{r.vol.toLocaleString()}</td>
                <td style={{padding:'12px 6px'}}>
                  <div style={{display:'flex', alignItems:'center', gap: 8}}>
                    <div style={{width: 80, height: 4, background:'rgba(255,255,255,.05)', borderRadius: 999}}>
                      <div style={{width: `${r.diff}%`, height: '100%', background: r.diff < 40 ? 'var(--good)' : r.diff < 70 ? 'var(--warn)' : 'var(--bad)', borderRadius: 999}}/>
                    </div>
                    <span className="mono" style={{fontSize: 10.5, color:'var(--text-2)'}}>{r.diff}</span>
                  </div>
                </td>
                <td style={{padding:'12px 6px', textAlign:'right'}}><button className="btn icon ghost"><Icon name="more" size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

window.BlogsView = BlogsView;
window.EditorView = EditorView;
window.AnalyticsView = AnalyticsView;
window.KeywordsView = KeywordsView;
