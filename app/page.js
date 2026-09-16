'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowDown, ArrowUpRight, Check, ChevronRight, CircleDot,
  Database, Layers3, Menu, Network, Radio, ScanSearch,
  ShieldCheck, Sparkles, Workflow, X, Zap, Send
} from 'lucide-react'

/* ── Data ───────────────────────────────────────────────────── */
const contextItems = [
  { id: '01', name: 'Customers', value: '300+', desc: 'First platform · live',
    detail: '150+ distributors and 150+ retailers already running daily operations on our first ERP partner platform.',
    icon: Network, signal: 'CUSTOMER GRAPH', metric: 'RELATIONSHIPS' },
  { id: '02', name: 'Data', value: '$30M+', desc: 'Transaction history',
    detail: '$30M+ in pharma distribution transactions and 20+ years of inventory, billing, and purchase patterns.',
    icon: Database, signal: 'DATA LAYER', metric: 'HISTORY' },
  { id: '03', name: 'Workflows', value: '300+', desc: 'Embedded modules',
    detail: 'Pharma-specific workflows and business logic — expiry, schedule-H, distribution billing — accumulated inside the product.',
    icon: Workflow, signal: 'WORKFLOW GRAPH', metric: 'KNOWLEDGE' },
  { id: '04', name: 'Trust', value: 'Embedded', desc: 'Operational confidence',
    detail: 'Businesses built their livelihoods around this software. That dependency took 20 years to build. We enter with it intact.',
    icon: ShieldCheck, signal: 'TRUST LAYER', metric: 'DEPENDENCY' },
]

const team = [
  ['RC', 'Ravi Chandra', 'Cofounder & CEO',
    'Built MedPay — 100K+ pharmacy network across India · 17+ yrs in pharma supply chain & operations'],
  ['AG', 'Anuj Gupta', 'Cofounder & CTO',
    '10+ yrs building products at scale · Hands-on architecture & AI'],
  ['AS', 'Anamika Shrivastava', 'Sales & Ops',
    '100s of ERP partnerships pan India · Built largest pharma ecosystem'],
  ['VR', 'Venkat Raju', 'Advisor',
    'Global operator, entrepreneur & investor · AI, technology & scale'],
]

const prompts = [
  'Show today\'s outstanding from my top 20 distributors.',
  'Which SKUs are expiring within 30 days?',
  'Create a PO for ABC Pharma — 5,000 Amoxicillin 250mg.',
  'What changed in my distributor collection this week?',
]

const SYSTEM = `You are Ask Nexpla — an AI assistant for investors and partners exploring Nexpla. Be direct, confident, concise. Investors want clear answers. 2-4 sentences max unless genuinely needed.

COMPANY: Nexpla modernizes established pharma ERP businesses and rebuilds them on AI-native architecture. Founded by Ravi Chandra (CEO) and Anuj Gupta (CTO). Based in Bangalore.

CURRENT STATE:
- First ERP partnership: agreement reached, modernisation underway
- 300+ customers (150+ distributors, 150+ retailers) on first platform
- $30M+ transactional data from first partnership
- 20+ years of embedded pharma domain context
- 6+ additional pharma ERPs identified in pipeline
- Raising $500K to close next two partnerships + fund 12-18 month rebuild runway

MARKET: India pharma distribution ERP is dominated by MARG ERP (~60% market share among distributors), built on Foxpro/DBF in 1992. Users actively searching for modern alternatives in 2026.

WHY NOW: AI changed the economics of rebuilding software. What required large teams and years before can now be done with AI agents in a fraction of the time and cost.

UNFAIR ADVANTAGES:
1. Ravi built MedPay — 100K+ pharmacy network. End customers of every pharma ERP we target are already in that network.
2. Anamika has managed 100s of ERP partnerships pan India. ERP owners already know her.
3. We do only Indian pharma distribution ERP. Niche focus, not a horizontal play.

TEAM: Ravi Chandra CEO (MedPay, 17yr pharma), Anuj Gupta CTO (10yr scale+AI), Anamika Shrivastava Sales/Ops (100s ERP partnerships), Venkat Raju Advisor (global operator+investor). Contact: rc@nexpla.com

PLATFORM: AI-Native ERP (data+workflows+logic) → Intelligent Layer (understand+decide+execute) → Platform (APIs+agents+services for businesses, fintech, developers, AI agents).

If asked about ERP partner names: not disclosed — pharma is a closed industry.
If asked about revenue: pre-revenue, in partnership and transformation phase.
If asked about valuation/terms: direct them to rc@nexpla.com.`

/* ── Small components ────────────────────────────────────────── */
function Tag({ children, live = false }) {
  return <div className="tag"><span className={live ? 'liveDot' : ''} />{children}</div>
}
function Reveal({ children, className = '' }) {
  return <div className={`reveal ${className}`}>{children}</div>
}
function MiniPill({ children }) {
  return <span className="miniPill">{children}</span>
}
function Metric({ label, value, sub }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────── */
export default function Home() {
  const [menu, setMenu]               = useState(false)
  const [modal, setModal]             = useState(false)
  const [ask, setAsk]                 = useState(false)
  const [sent, setSent]               = useState(false)
  const [progress, setProgress]       = useState(0)
  const [context, setContext]         = useState(0)
  const [promptIndex, setPromptIndex] = useState(0)
  const [transform, setTransform]     = useState(58)
  const [traceStep, setTraceStep]     = useState(1)
  const [dragging, setDragging]       = useState(false)
  const [transformInteracted, setTransformInteracted] = useState(false)
  const [activeNav, setActiveNav]     = useState('top')

  // Chat state
  const [msgs, setMsgs]         = useState([])
  const [chatQ, setChatQ]       = useState('')
  const [chatBusy, setChatBusy] = useState(false)
  const messagesEndRef           = useRef(null)

  const compareRef         = useRef(null)
  const transformSectionRef = useRef(null)

  const setTransformFromPointer = useCallback((clientX) => {
    const el = compareRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setTransform(Math.round(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))))
  }, [])

  // Scroll progress
  useEffect(() => {
    const on = () => {
      const d = document.documentElement
      setProgress(d.scrollHeight <= innerHeight ? 0 : (scrollY / (d.scrollHeight - innerHeight)) * 100)
    }
    addEventListener('scroll', on, { passive: true })
    on()
    return () => removeEventListener('scroll', on)
  }, [])

  // Scroll reveals
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal').forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [])

  // Prompt rotation
  useEffect(() => {
    const t = setInterval(() => setPromptIndex(v => (v + 1) % prompts.length), 3200)
    return () => clearInterval(t)
  }, [])

  // Trace step
  useEffect(() => {
    const t = setInterval(() => setTraceStep(v => v === 4 ? 1 : v + 1), 1500)
    return () => clearInterval(t)
  }, [])

  // Drag events
  useEffect(() => {
    const onMove = e => dragging && setTransformFromPointer(e.clientX)
    const onUp   = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [dragging, setTransformFromPointer])

  // Scroll-driven transform preview
  useEffect(() => {
    const on = () => {
      if (transformInteracted || !transformSectionRef.current) return
      const r   = transformSectionRef.current.getBoundingClientRect()
      const span = Math.max(1, innerHeight + r.height)
      const p   = Math.max(0, Math.min(1, (innerHeight - r.top) / (span * 0.72)))
      setTransform(Math.round(p * 100))
    }
    addEventListener('scroll', on, { passive: true })
    on()
    return () => removeEventListener('scroll', on)
  }, [transformInteracted])

  // Active nav
  useEffect(() => {
    const ids   = ['top', 'why', 'context', 'transform', 'platform', 'edge', 'team']
    const nodes = ids.map(id => document.getElementById(id)).filter(Boolean)
    const io    = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveNav(e.target.id) }),
      { rootMargin: '-34% 0px -56% 0px', threshold: 0 }
    )
    nodes.forEach(n => io.observe(n))
    return () => io.disconnect()
  }, [])

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  // Claude API chat
  const sendMsg = async (text) => {
    const q = (text || chatQ).trim()
    if (!q || chatBusy) return
    setChatQ('')
    setChatBusy(true)
    const next = [...msgs, { role: 'user', content: q }]
    setMsgs(next)
    try {
      const res  = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 600, system: SYSTEM, messages: next }),
      })
      const data = await res.json()
      const reply = data.content?.find(b => b.type === 'text')?.text
        || 'Something went wrong. Email rc@nexpla.com directly.'
      setMsgs([...next, { role: 'assistant', content: reply }])
    } catch {
      setMsgs([...next, { role: 'assistant', content: 'Unable to connect. Email rc@nexpla.com directly.' }])
    } finally {
      setChatBusy(false)
    }
  }

  const active         = contextItems[context]
  const closeModal     = () => { setModal(false); setSent(false) }
  const compareLabel   = transform < 35 ? 'LEGACY ERP' : transform > 72 ? 'AI-NATIVE ERP' : 'REBUILD IN PROGRESS'
  const compareProgress = Math.round(Math.max(0, Math.min(100, (transform - 25) / 60 * 100)))

  return (
    <main>
      {/* Progress bar */}
      <div className="progress"><i style={{ width: `${progress}%` }} /></div>

      {/* Nav */}
      <header className="nav">
        <a className="brand" href="#top">
          <img src="/assets/nexpla-logo.png" alt="Nexpla" />
        </a>
        <nav className={menu ? 'open' : ''}>
          <a className={activeNav === 'why'       ? 'active' : ''} href="#why"       onClick={() => setMenu(false)}>Why now</a>
          <a className={activeNav === 'context'   ? 'active' : ''} href="#context"   onClick={() => setMenu(false)}>Context</a>
          <a className={activeNav === 'transform' ? 'active' : ''} href="#transform" onClick={() => setMenu(false)}>Transformation</a>
          <a className={activeNav === 'platform'  ? 'active' : ''} href="#platform"  onClick={() => setMenu(false)}>Platform</a>
          <a className={activeNav === 'team'      ? 'active' : ''} href="#team"      onClick={() => setMenu(false)}>Team</a>
          <button className="navCta" onClick={() => setModal(true)}>Investor enquiry <ArrowUpRight /></button>
        </nav>
        <button className="menub" aria-label="Menu" onClick={() => setMenu(v => !v)}>
          {menu ? <X /> : <Menu />}
        </button>
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="hero" id="top">
        <div className="heroGrid" />
        <div className="heroCopy reveal">
          <Tag live>INTELLIGENCE FOR PHARMA · FIRST DEAL CLOSED</Tag>
          <h1>The software running pharma is ready for its <em>next era.</em></h1>
          <p className="heroLead">
            One software company — built on Foxpro in 1992 — holds ~60% of India's pharma distribution ERP market.
            Their customers are actively looking for what comes next. We're building it, starting from inside.
          </p>
          <div className="actions">
            <button className="primary" onClick={() => setModal(true)}>Talk to us <ArrowUpRight /></button>
            <a className="textlink" href="#why">See why now <ArrowDown /></a>
          </div>
          <div className="heroFoot">
            <span><b>SYS</b> NEXPLA / INTELLIGENCE</span>
            <span><i /> DEAL 01 · LIVE</span>
            <span>BUILD 01.0</span>
          </div>
        </div>

        <Reveal className="heroConsole">
          <div className="consoleShell">
            <div className="consoleTop">
              <span><i /> NEXPLA / INTELLIGENCE</span>
              <span className="status"><CircleDot /> LIVE</span>
            </div>
            <div className="consoleBody">
              <div className="consoleTitle">
                <div>
                  <small>AI-NATIVE OPERATING LAYER</small>
                  <strong>Understand. Decide. Execute.</strong>
                </div>
                <div className="traceBadge"><i /> CONTEXT: ON</div>
              </div>
              <div className="metricGrid">
                <Metric label="Customers" value="300+"    sub="on first platform" />
                <Metric label="Modules"   value="300+"    sub="mapped" />
                <Metric label="Context"   value="20+ yrs" sub="preserved" />
                <Metric label="Data"      value="$30M+"   sub="transactions" />
              </div>
              <div className="askCard">
                <div className="askMeta">
                  <span>ASK NEXPLA</span>
                  <small>COMMAND / {String(promptIndex + 1).padStart(2, '0')}</small>
                </div>
                <div className="askText">
                  <span className="cursor">›</span>
                  <p>{prompts[promptIndex]}</p>
                  <button><ArrowUpRight /></button>
                </div>
              </div>
              <div className="trace">
                <div className="traceHead"><span>EXECUTION TRACE</span><small>LIVE</small></div>
                <div className="traceRow">
                  {['Read context', 'Apply workflows', 'Prepare action'].map((s, i) => (
                    <div key={s} className={traceStep === i + 1 ? 'active' : ''}>
                      <span>0{i + 1}</span><b>{s}</b><i />
                    </div>
                  ))}
                </div>
              </div>
              <div className="consoleResult">
                <div>
                  <small>RESULT</small>
                  <strong>{promptIndex === 2 ? 'PO-24-01234' : '₹18.4L'}</strong>
                  <span>{promptIndex === 2 ? 'created & confirmed' : 'total outstanding'}</span>
                </div>
                <div className="bars">
                  {[1, 2, 3, 4, 5, 6, 7].map((n, i) => <i key={n} style={{ height: `${18 + (i * 7) % 39}px` }} />)}
                </div>
                <div className="resultAction">{promptIndex === 2 ? <Check /> : <ArrowUpRight />}</div>
              </div>
            </div>
          </div>
          <div className="consoleNote">
            <span>REAL CONTEXT</span><b>→</b><span>INTELLIGENT ACTION</span>
          </div>
        </Reveal>

        <div className="heroRail">
          <span>DATA</span><i /><span>WORKFLOWS</span><i /><span>AGENTS</span><i /><span>BUSINESS LOGIC</span>
        </div>
      </section>

      {/* ── PROBLEM BAND ──────────────────────────────────────── */}
      <section className="problemBand">
        <div className="bandInner">
          <Tag>THE PARADOX</Tag>
          <h2>A <em>$60B</em> industry still runs critical operations on software built for another era.</h2>
          <div className="bandTags">
            <MiniPill>SCREEN-DRIVEN</MiniPill>
            <MiniPill>MANUAL</MiniPill>
            <MiniPill>FRAGMENTED</MiniPill>
            <MiniPill>HUMAN-DEPENDENT</MiniPill>
          </div>
          <p style={{ fontSize: '13px', color: '#7f928c', marginTop: '18px', maxWidth: '620px', lineHeight: '1.65' }}>
            MARG ERP — founded 1992, running on Foxpro/DBF — holds an estimated 60%+ of India's pharma distributor market.
            In 2026, their customers are actively searching for a modern alternative. That window is open right now.
          </p>
        </div>
      </section>

      {/* ── WHY NOW ───────────────────────────────────────────── */}
      <section className="why section" id="why">
        <div className="sectionNo">01</div>
        <Reveal>
          <Tag>WHY NOW</Tag>
          <div className="sectionHead">
            <h2>AI didn't just make software smarter.<br /><em>It changed the economics.</em></h2>
            <p>Rebuilding mission-critical software is now economically viable for the first time in decades. The first mover in each vertical owns the category.</p>
          </div>
        </Reveal>
        <Reveal className="economicsStage">
          <div className="econCard legacy">
            <div className="econTop"><span>BEFORE AI</span><small>BUILD</small></div>
            <h3>Build from scratch</h3>
            <div className="econRows">
              <div><span>Teams</span><i style={{ width: '88%' }} /></div>
              <div><span>Time</span><i style={{ width: '92%' }} /></div>
              <div><span>Cost</span><i style={{ width: '86%' }} /></div>
            </div>
            <div className="econFoot"><b>HEAVY</b><span>custom engineering</span></div>
          </div>
          <div className="econBridge">
            <div className="bridgeCore"><Sparkles /><strong>AI</strong><span>changes the equation</span></div>
            <div className="bridgeLine"><i /><i /><i /><i /><i /></div>
            <ChevronRight />
          </div>
          <div className="econCard rebuilt">
            <div className="econTop"><span>WITH AI</span><small>REBUILD</small></div>
            <h3>Rebuild with intelligence</h3>
            <div className="econRows">
              <div><span>AI agents</span><i style={{ width: '38%' }} /></div>
              <div><span>Time</span><i style={{ width: '34%' }} /></div>
              <div><span>Cost</span><i style={{ width: '42%' }} /></div>
            </div>
            <div className="econFoot"><b>LEANER</b><span>domain-aware rebuild</span></div>
          </div>
        </Reveal>
        <Reveal className="signalStrip">
          <div><span>THE INFLECTION</span><strong>AI makes the rebuild possible. Nexpla makes it happen in pharma.</strong></div>
          <div className="signalNumbers">
            <Metric label="Teams"  value="↓" sub="less bespoke build" />
            <Metric label="Time"   value="↓" sub="faster iteration" />
            <Metric label="Cost"   value="↓" sub="more leverage" />
          </div>
        </Reveal>
      </section>

      {/* ── CONTEXT ───────────────────────────────────────────── */}
      <section className="context section" id="context">
        <div className="sectionNo">02</div>
        <Reveal>
          <Tag>THE INSIGHT</Tag>
          <div className="sectionHead">
            <h2>The software is replaceable.<br /><em>The context is not.</em></h2>
            <p>What took decades to accumulate is what makes the rebuild valuable — and what makes us different from anyone starting from zero.</p>
          </div>
        </Reveal>
        <Reveal className="contextExperience">
          <div className="contextRail">
            {contextItems.map((item, i) => {
              const I = item.icon
              return (
                <button key={item.name} className={i === context ? 'active' : ''} onClick={() => setContext(i)}>
                  <span>{item.id}</span>
                  <I />
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.value} · {item.desc}</small>
                  </div>
                  <ChevronRight />
                </button>
              )
            })}
          </div>
          <div className="contextViewport">
            <div className="contextTopline">
              <span>{active.signal}</span>
              <small>CONTEXT NODE / {active.id}</small>
            </div>
            <div className="contextVisual techCanvas">
              <div className="gridGlow" />
              <div className="canvasHeader">
                <span>SYSTEM MAP / CONTEXT GRAPH</span>
                <b><i /> LIVE GRAPH</b>
              </div>
              <div className="graphViewport smartGraph" aria-label="Interactive Nexpla context graph">
                <div className="smartGraphChrome">
                  <span>CONTEXT ENGINE / LIVE GRAPH</span><b><i /> ONLINE</b>
                </div>
                <div className="smartGraphGrid" aria-hidden="true" />
                <div className="smartGraphStage">
                  <div className="smartEdge e12" aria-hidden="true" />
                  <div className="smartEdge e23" aria-hidden="true" />
                  <div className="smartEdge e34" aria-hidden="true" />
                  <div className="smartEdge e41" aria-hidden="true" />
                  <button className={`smartNode sn1 ${context === 0 ? 'selected' : ''}`} onClick={() => setContext(0)} aria-pressed={context === 0}>
                    <span>01 / CONTEXT NODE</span><strong>Customers</strong><small>300+ first platform</small><em>RELATIONSHIPS</em><b>Inspect ↗</b>
                  </button>
                  <button className={`smartNode sn2 ${context === 1 ? 'selected' : ''}`} onClick={() => setContext(1)} aria-pressed={context === 1}>
                    <span>02 / CONTEXT NODE</span><strong>Data</strong><small>$30M+ transactions</small><em>TRANSACTIONS</em><b>Inspect ↗</b>
                  </button>
                  <div className="smartEngine">
                    <span className="enginePulse" />
                    <div className="engineMark"><img src="/assets/nexpla-icon-teal.png" alt="" /></div>
                    <strong>NEXPLA</strong>
                    <small>CONTEXT ENGINE</small>
                    <b><i /> READY TO REBUILD</b>
                  </div>
                  <button className={`smartNode sn3 ${context === 2 ? 'selected' : ''}`} onClick={() => setContext(2)} aria-pressed={context === 2}>
                    <span>03 / CONTEXT NODE</span><strong>Workflows</strong><small>300+ embedded modules</small><em>BUSINESS LOGIC</em><b>Inspect ↗</b>
                  </button>
                  <button className={`smartNode sn4 ${context === 3 ? 'selected' : ''}`} onClick={() => setContext(3)} aria-pressed={context === 3}>
                    <span>04 / CONTEXT NODE</span><strong>Trust</strong><small>Embedded confidence</small><em>DEPENDENCY</em><b>Inspect ↗</b>
                  </button>
                </div>
                <div className="smartGraphTrace">
                  <span><i /> INPUTS 04</span><b>Understand</b><i /><b>Decide</b><i /><b>Execute</b><span>TRACE / LIVE</span>
                </div>
                <div className="smartGraphFooter">
                  <span>SELECT A NODE TO INSPECT THE CONTEXT</span><b>{active.signal} / ACTIVE</b>
                </div>
              </div>
            </div>
            <div className="contextDetail">
              <div><small>{active.name.toUpperCase()}</small><strong>{active.value}</strong></div>
              <p>{active.detail}</p>
              <div className="detailLine"><span>ACQUIRED</span><i /><b>REBUILD READY</b></div>
            </div>
          </div>
        </Reveal>
        <Reveal className="contextStatement">
          <strong>We are not starting with a blank screen.</strong>
          <span>We are acquiring the context to rebuild with intelligence.</span>
        </Reveal>
      </section>

      {/* ── TRANSFORMATION ────────────────────────────────────── */}
      <section className="transform section" id="transform" ref={transformSectionRef}>
        <div className="sectionNo">03</div>
        <Reveal>
          <Tag>THE TRANSFORMATION</Tag>
          <div className="sectionHead">
            <h2>Don't take our word for it.<br /><em>Move the product.</em></h2>
            <p>Drag the control. Watch a screen-driven ERP turn into an intelligence interface.</p>
          </div>
        </Reveal>
        <Reveal className="transformStage">
          <div className="transformTop">
            <div><span>LEGACY</span><b>01</b></div>
            <div className="sliderLabel">
              <span>{compareLabel}</span>
              <b>{compareProgress}% rebuilt</b>
            </div>
            <div><b>02</b><span>AI-NATIVE</span></div>
          </div>
          <div
            className="compareFrame"
            ref={compareRef}
            style={{ '--split': `${transform}%` }}
            onPointerDown={e => {
              if (e.target.closest('.compareDivider')) return
              setTransformInteracted(true)
              setDragging(true)
              setTransformFromPointer(e.clientX)
            }}
            onKeyDown={e => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setTransformInteracted(true); setTransform(v => Math.max(0, v - 5)) }
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setTransformInteracted(true); setTransform(v => Math.min(100, v + 5)) }
              if (e.key === 'Home') { e.preventDefault(); setTransformInteracted(true); setTransform(0) }
              if (e.key === 'End') { e.preventDefault(); setTransformInteracted(true); setTransform(100) }
            }}
            tabIndex={0} role="slider" aria-valuemin={0} aria-valuemax={100}
            aria-valuenow={transform} aria-label="Legacy to AI-native transformation"
          >
            <div className="compareLegacy">
              <div className="mockTop"><span>ERP / OPERATIONS</span><small>1992 / FOXPRO</small></div>
              <div className="legacyMock">
                <aside>
                  <b>MASTERS</b><span>Customers</span><span>Products</span><span>Vendors</span>
                  <b>TRANSACTIONS</b><span>Sales Order</span><span>Purchase</span><span>Inventory</span>
                  <b>REPORTS</b><span>Stock Ledger</span>
                </aside>
                <div className="legacyWork">
                  <div className="tinyTitle">SALES ORDER ENTRY</div>
                  <h3>ABC Pharma Pvt. Ltd.</h3>
                  <div className="legacyMeta">
                    <span>PO-7845</span><span>17 / 05 / 2024</span><span>DELIVERY 25 / 05</span>
                  </div>
                  <div className="fakeTable">
                    <div className="th"><span>Item</span><span>Qty</span><span>Amount</span></div>
                    <div><span>Paracetamol 500mg</span><b>10,000</b><b>₹8,500</b></div>
                    <div><span>Amoxicillin 250mg</span><b>5,000</b><b>₹6,250</b></div>
                    <div><span>Cetirizine 10mg</span><b>2,000</b><b>₹1,900</b></div>
                  </div>
                  <div className="fakeBtns">
                    <button>New</button><button>Save</button><button>Print</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="compareAI">
              <div className="mockTop"><span><i /> NEXPLA / INTELLIGENCE</span><small>CONTEXT: ON</small></div>
              <div className="aiMock">
                <div className="aiGreeting"><span className="aiDot" />Good morning, Anita.<small>How can I help you today?</small></div>
                <div className="aiUser">Show today's outstanding from my top 20 distributors.</div>
                <div className="aiAnswer">
                  <div><small>TOTAL OUTSTANDING</small><strong>₹18.4L</strong></div>
                  <div><small>OVERDUE</small><strong>7</strong></div>
                  <div className="miniChart">
                    {[2, 4, 6, 3, 7, 5, 8].map((x, i) => <i key={i} style={{ height: `${x * 5}px` }} />)}
                  </div>
                  <button>View invoices <ArrowUpRight /></button>
                </div>
                <div className="aiUser">Create a PO for ABC Pharma — 5,000 units Amoxicillin 250mg.</div>
                <div className="aiSuccess"><Check /> PO-24-01234 created and confirmed</div>
                <div className="aiCommand"><span>›</span> Ask anything or give a command... <b>↵</b></div>
              </div>
            </div>
            <div className="compareDivider" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); setTransformInteracted(true); setDragging(true); setTransformFromPointer(e.clientX) }}>
              <div className="dragHandle"><span /></div>
            </div>
            <div className="compareHint">
              <span>← LEGACY</span>
              <b>{transformInteracted ? 'DRAG OR SWIPE ANYWHERE' : 'SCROLL TO PREVIEW · DRAG TO TAKE OVER'}</b>
              <span>AI-NATIVE →</span>
            </div>
          </div>
          <div className="sliderTrack">
            <div className="smartTrack">
              <button aria-label="Show legacy ERP" onClick={() => { setTransformInteracted(true); setTransform(0) }}>01</button>
              <div className="smartRail">
                <span style={{ width: `${transform}%` }} />
                <i style={{ left: `${transform}%` }} />
              </div>
              <button aria-label="Show AI-native ERP" onClick={() => { setTransformInteracted(true); setTransform(100) }}>02</button>
            </div>
            <div className="sliderMeta">
              <span>NAVIGATE · CLICK · SEARCH · WAIT</span>
              <b>{compareProgress}% rebuilt</b>
              <span>ASK · GET ANSWERS · TAKE ACTION</span>
            </div>
          </div>
        </Reveal>
        <Reveal className="transformationProof">
          <div><small>WHAT CHANGES</small><strong>Interface</strong><span>Screen-driven → Intent-driven</span></div>
          <div><small>WHAT STAYS</small><strong>Context</strong><span>Customers · data · workflows · trust</span></div>
          <div><small>WHAT EMERGES</small><strong>Intelligence</strong><span>Understand · decide · execute</span></div>
        </Reveal>
      </section>

      {/* ── PLATFORM ──────────────────────────────────────────── */}
      <section className="platform section" id="platform">
        <div className="sectionNo">04</div>
        <Reveal>
          <Tag>THE PLATFORM</Tag>
          <div className="sectionHead">
            <h2>From system of record<br />to <em>system of intelligence.</em></h2>
            <p>The intelligence layer sits on top of the ERP — turning context into capabilities others can build on.</p>
          </div>
        </Reveal>
        <Reveal className="platformExperience">
          <div className="tracePanel">
            <div className="tracePanelHead"><span>REQUEST TRACE</span><small>LIVE / {String(traceStep).padStart(2, '0')}</small></div>
            <div className="traceRequest"><span>USER</span><strong>"Show me today's distributor exposure."</strong></div>
            <div className="traceSteps">
              {[
                ['01', 'UNDERSTAND', 'Read customer + transaction context'],
                ['02', 'DECIDE',     'Apply pharma workflow + business logic'],
                ['03', 'EXECUTE',    'Prepare the right action'],
                ['04', 'RETURN',     'Answer + next step'],
              ].map(([n, t, d], i) => (
                <div key={n} className={traceStep === i + 1 ? 'active' : ''}>
                  <span>{n}</span><div><b>{t}</b><small>{d}</small></div><i />
                </div>
              ))}
            </div>
            <div className="traceOutput">
              <small>OUTPUT</small>
              <strong>₹18.4L exposure</strong>
              <span>7 distributors need attention</span>
              <button>View the action <ArrowUpRight /></button>
            </div>
          </div>
          <div className="platformStack">
            <div className="stackNode foundation">
              <small>FOUNDATION / 01</small>
              <strong>AI-NATIVE ERP</strong>
              <div><span>DATA</span><span>WORKFLOWS</span><span>BUSINESS LOGIC</span></div>
            </div>
            <div className="stackConnector"><i /><i /><i /></div>
            <div className="stackNode intel">
              <small>INTELLIGENCE / 02</small>
              <strong>UNDERSTAND · DECIDE · EXECUTE</strong>
              <div><span>Natural language</span><span>Recommendations</span><span>Agentic actions</span></div>
              <b><i /> ACTIVE</b>
            </div>
            <div className="stackConnector"><i /><i /><i /></div>
            <div className="stackNode platformNode">
              <small>PLATFORM / 03</small>
              <strong>APIs · AGENTS · SERVICES</strong>
              <div><span>Businesses</span><span>Partners</span><span>Fintech</span><span>Developers</span><span>ISVs</span></div>
            </div>
          </div>
        </Reveal>
        <Reveal className="platformStatement">
          <Tag>THE PRINCIPLE</Tag>
          <h3>We don't replace the ERP.<br /><em>We unlock it.</em></h3>
        </Reveal>
      </section>

      {/* ── FLYWHEEL ──────────────────────────────────────────── */}
      <section className="fly section" id="flywheel">
        <div className="sectionNo">05</div>
        <Reveal>
          <Tag>THE PLAYBOOK</Tag>
          <div className="sectionHead">
            <h2>One transformation.<br /><em>Then repeat.</em></h2>
            <p>Partner with the context. Modernize the experience. Rebuild the core. Reinvest and repeat.</p>
          </div>
        </Reveal>
        <Reveal className="flyExperience">
          <div className="flyGraphic smartLoop">
            <div className="loopHeader">
              <span>TRANSFORMATION ENGINE / 04 STATES</span>
              <b><i /> READY TO COMPOUND</b>
            </div>
            <svg className="loopSvg" viewBox="0 0 900 560" preserveAspectRatio="none" aria-hidden="true">
              <circle cx="450" cy="280" r="175" />
              <circle cx="450" cy="280" r="120" className="dash" />
              <path d="M450 72 C670 72 806 190 806 280 C806 386 662 488 450 488 C240 488 94 390 94 280 C94 184 232 72 450 72" />
              <path className="loopPulse" d="M450 72 C670 72 806 190 806 280" />
            </svg>
            <div className="flyCore">
              <div className="coreRing" />
              <img src="/assets/nexpla-icon-teal.png" alt="" />
              <strong>COMPOUND</strong>
              <small>THE NEXPLA LOOP</small>
              <span><i /> ACTIVE</span>
            </div>
            {[
              ['01', 'PARTNER',   'Customers + context'],
              ['02', 'MODERNIZE', 'Operations + UX'],
              ['03', 'REBUILD',   'AI-native platform'],
              ['04', 'REPEAT',    'Reinvest + expand'],
            ].map((x, i) => (
              <div key={x[0]} className={`flyNode f${i + 1}`}>
                <b>{x[0]}</b><strong>{x[1]}</strong><small>{x[2]}</small>
                <i className="nodePulse" />
              </div>
            ))}
            <div className="loopTag lt1">CONTEXT IN</div>
            <div className="loopTag lt2">PLATFORM OUT</div>
          </div>
          <div className="flyMetrics">
            <Metric label="Customers" value="300+"   sub="first platform · live" />
            <Metric label="Pipeline"  value="6+"     sub="ERPs identified" />
            <Metric label="Data"      value="$30M+"  sub="transactions" />
            <Metric label="Runway"    value="12–18"  sub="months" />
          </div>
        </Reveal>
      </section>

      {/* ── EDGE / UNFAIR ADVANTAGES ──────────────────────────── */}
      <section className="fly section" id="edge" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <div className="sectionNo">06</div>
        <Reveal>
          <Tag>UNFAIR ADVANTAGE</Tag>
          <div className="sectionHead">
            <h2>Three moats no new<br /><em>entrant can replicate.</em></h2>
            <p>Knowing the market is one thing. Operating inside it for a decade is another.</p>
          </div>
        </Reveal>
        <Reveal className="edgeGrid">
          <div className="edgeCard">
            <div className="edgeNum">01</div>
            <strong>100K+ pharmacy network</strong>
            <p>Ravi built MedPay — 100,000+ pharmacies across India, supply chain financing, and ERP integrations. The end customers of every pharma ERP we target are already in that network. No cold outreach required.</p>
          </div>
          <div className="edgeCard">
            <div className="edgeNum">02</div>
            <strong>ERP relationships already built</strong>
            <p>Anamika has managed 100s of ERP partnerships pan India. ERP owners already know her and take her calls. Deal #1 is proof — sourced through relationships, not cold pitch.</p>
          </div>
          <div className="edgeCard">
            <div className="edgeNum">03</div>
            <strong>Built for one niche only</strong>
            <p>We do exactly one thing: India pharma distribution ERP. Every decision — which platform to partner with, what to rebuild first, which workflows matter — comes from years of operating inside this specific market.</p>
          </div>
        </Reveal>
      </section>

      {/* ── TEAM ──────────────────────────────────────────────── */}
      <section className="team section" id="team">
        <div className="sectionNo">07</div>
        <Reveal>
          <Tag>THE TEAM</Tag>
          <div className="sectionHead">
            <h2>Built to do this <em>specifically.</em></h2>
            <p>Pharma DNA + AI-native builders + ERP connectivity + execution mindset.</p>
          </div>
        </Reveal>
        <div className="teamGrid">
          {team.map(([id, name, role, bio]) => (
            <Reveal className="person" key={name}>
              <div className="personHead"><span>{id}</span><small>PROFILE / {id}</small></div>
              <h3>{name}</h3>
              <strong>{role}</strong>
              <p>{bio}</p>
              <div className="personCode">NEXPLA / TEAM / {id}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── RAISE ─────────────────────────────────────────────── */}
      <section className="raise">
        <div className="raiseGrid" />
        <Reveal>
          <Tag>FUNDING THE FIRST TRANSFORMATION</Tag>
          <div className="raiseMain">
            <div>
              <small>WE ARE RAISING</small>
              <h2>USD <em>500K</em></h2>
              <p>First deal is closed. 300+ customers, $30M+ in data, modernisation underway. Raising to close the next two ERP partnerships from our 6+ pipeline and fund the rebuild.</p>
            </div>
            <div className="raisePanel">
              <div>
                <small>DEAL 01</small>
                <strong>LIVE</strong>
                <span>300+ customers · $30M+ data · modernisation started</span>
              </div>
              <div>
                <small>PIPELINE</small>
                <strong>6+</strong>
                <span>Additional pharma ERPs identified · raising to close next two</span>
              </div>
              <div>
                <small>RUNWAY</small>
                <strong>12–18</strong>
                <span>Months to modernize, integrate and launch the new platform</span>
              </div>
            </div>
          </div>
          <div className="raiseBottom">
            <div>
              <span>THE FIRST TRANSFORMATION IS UNDERWAY.</span>
              <strong>Let's build the next operating layer for pharma.</strong>
            </div>
            <button onClick={() => setModal(true)}>Schedule investor call <ArrowUpRight /></button>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer>
        <div className="footerBrand">
          <img src="/assets/nexpla-logo.png" alt="Nexpla" />
          <small>INTELLIGENCE FOR PHARMA</small>
        </div>
        <span>From legacy software to AI-native.</span>
        <a href="mailto:rc@nexpla.com">rc@nexpla.com</a>
        <span>© Nexpla</span>
      </footer>

      {/* ── ASK NEXPLA (Claude API) ────────────────────────────── */}
      <button className="ask" onClick={() => setAsk(v => !v)}>
        <Sparkles /> Ask Nexpla <small>AI</small>
      </button>

      {ask && (
        <div className="chat">
          <div className="chatHead">
            <span><Sparkles /> Ask Nexpla <small>GROUNDED IN OUR STORY</small></span>
            <button onClick={() => setAsk(false)}><X /></button>
          </div>
          <div className="chatMsgs" id="chatMsgs">
            {msgs.length === 0 && (
              <div style={{ padding: '14px 0' }}>
                <p style={{ fontSize: '12px', color: '#68746f', lineHeight: 1.55, marginBottom: '12px' }}>
                  Ask anything about Nexpla — the thesis, the team, the raise, how the platform works.
                </p>
                {['What is the investment thesis?', 'How do you acquire the context?', 'What exactly gets rebuilt?'].map(q => (
                  <button key={q} className="chatSuggest" onClick={() => sendMsg(q)}>
                    {q}<ArrowUpRight />
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'chatMsgUser' : 'chatMsgAI'}>
                {m.content}
              </div>
            ))}
            {chatBusy && (
              <div className="chatMsgAI chatThinking">
                <span /><span /><span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatInputRow">
            <input
              value={chatQ}
              onChange={e => setChatQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="Ask anything about Nexpla..."
              disabled={chatBusy}
            />
            <button onClick={() => sendMsg()} disabled={chatBusy || !chatQ.trim()}>
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── INVESTOR MODAL ─────────────────────────────────────── */}
      {modal && (
        <div className="modalBack" onMouseDown={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            {sent ? (
              <div className="success">
                <Check />
                <small>ENQUIRY / RECEIVED</small>
                <h2>We'll take it from here.</h2>
                <p>Your message has been captured. Ravi responds personally — expect to hear back within 24 hours.</p>
              </div>
            ) : (
              <>
                <button className="close" onClick={closeModal}><X /></button>
                <Tag>INVESTOR / ERP ENQUIRY</Tag>
                <h2>Let's talk about the next transformation.</h2>
                <p>Raising USD 500K. First deal closed. Six+ more in pipeline. Tell us a little about you.</p>
                <div className="formGrid">
                  <input placeholder="Your name" />
                  <input placeholder="Fund / company" />
                  <input placeholder="Email address" />
                  <input placeholder="Phone (optional)" />
                </div>
                <textarea placeholder="What would you like to explore?" />
                <button
                  className="primary"
                  onClick={() => { setSent(true); window.location.href = 'mailto:rc@nexpla.com?subject=Nexpla%20Investor%20Enquiry' }}
                >
                  Send enquiry <ArrowUpRight />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
