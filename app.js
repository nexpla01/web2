/* ============================================================
   NEXPLA — app.js
   Navigation · Modals · Ask Nexpla (Claude API, grounded)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Year ─────────────────────────────────────────────────
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // ── Navigation scroll behaviour ──────────────────────────
  const nav = document.getElementById('nav');
  const isLightNav = nav && nav.classList.contains('nav-light');

  if (nav) {
    const updateNav = () => {
      if (window.scrollY > 40) {
        nav.classList.add(isLightNav ? 'scrolled-light' : 'scrolled');
      } else {
        nav.classList.remove('scrolled', 'scrolled-light');
      }
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // ── Mobile nav toggle ─────────────────────────────────────
  const toggle   = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileNav.classList.remove('open'));
    });
  }

  // ── Modals ────────────────────────────────────────────────
  const modals = {
    investor: document.getElementById('investorModal'),
    partner:  document.getElementById('partnerModal'),
  };

  function openModal(id) {
    const el = modals[id];
    if (!el) return;
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    const el = modals[id];
    if (!el) return;
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Open buttons
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });

  // Close buttons (× inside modal)
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  // Backdrop click
  Object.entries(modals).forEach(([id, el]) => {
    if (!el) return;
    el.addEventListener('click', e => {
      if (e.target === el) closeModal(id);
    });
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      Object.keys(modals).forEach(closeModal);
      closeAskPanel();
    }
  });

  // ── Form submissions (mailto fallback) ───────────────────
  function handleForm(formId, successId) {
    const form = document.getElementById(formId);
    const success = document.getElementById(successId);
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const body = [...data.entries()].map(([k, v]) => `${k}: ${v}`).join('\n');
      // Open mailto as fallback (no backend needed for static site)
      window.location.href = `mailto:rc@nexpla.com?subject=Nexpla%20Enquiry&body=${encodeURIComponent(body)}`;
      if (success) { success.style.display = 'block'; }
      form.reset();
    });
  }
  handleForm('investorForm', 'investorSuccess');
  handleForm('partnerForm', 'partnerSuccess');

  // ── Ask Nexpla ────────────────────────────────────────────
  const askFab       = document.getElementById('askFab');
  const askPanel     = document.getElementById('askPanel');
  const askClose     = document.getElementById('askClose');
  const askMessages  = document.getElementById('askMessages');
  const askInput     = document.getElementById('askInput');
  const askSend      = document.getElementById('askSend');
  const askSuggests  = document.getElementById('askSuggestions');

  let askOpen = false;
  let conversationHistory = [];

  const SYSTEM_PROMPT = `You are Ask Nexpla — an AI assistant for investors and partners exploring Nexpla. Be direct, confident, and concise. Investors want clear answers, not marketing fluff. Answer in 2-4 sentences unless the question genuinely needs more.

COMPANY:
Nexpla modernizes established pharma ERP businesses and transforms them into AI-native platforms. Founded by Ravi Chandra (CEO) and Anuj Gupta (CTO), based in Bangalore.

STRATEGY — MODERNIZE · REBUILD · REPEAT:
1. Partner with profitable legacy pharma ERP businesses (they have customers, data, domain knowledge, trust — but run on outdated tech)
2. Modernize: Streamline operations, improve reliability and UX, unlock immediate value
3. Rebuild: Rebuild the core platform with AI-native architecture
4. Repeat: One playbook, compounding across multiple ERPs

THE MARKET:
- Indian pharma market: ~$60B
- MARG ERP (founded 1992, Foxpro/DBF architecture) holds an estimated 60%+ market share among Indian pharma distributors
- In 2026, pharma ERP users are actively searching for modern alternatives — cloud access, automated GST compliance, modern UX
- This is not a shrinking market being disrupted — it's a growing market waiting for a credible modern replacement
- India ERP software market projected to grow from $5.7B (2025) to $25.47B by 2035 (CAGR 15.4%)
- AI changed the economics of rebuilding: before AI, needed large teams, years, big budgets. With AI agents, dramatically faster and cheaper.

CURRENT PORTFOLIO (names not disclosed — pharma is a closed industry, owners don't want public announcements):
- ERP Partner #1: Agreement reached, modernisation underway. 300+ customers (150+ distributors, 150+ retailers), $30M+ transactional data, 20+ years in market.
- Pipeline: 6+ additional pharma ERPs identified and in early conversations. Raising to close the next two.

THE PLATFORM:
- Layer 1 — AI-Native ERP: Data, Workflows, Business Logic
- Layer 2 — Intelligent Layer: Understand → Decide → Execute (natural language, recommendations, agentic actions)
- Layer 3 — Platform: APIs, Agents, Services (for Businesses, Fintech, Developers & ISVs, AI Agents)

THE TRANSFORMATION:
Before: Navigate → Click → Search → Wait
After: Ask → Get answers → Take action
Example: "Show me outstanding payments from top 20 distributors" → ₹18.4L outstanding, 7 invoices overdue, one-click send reminders. Or voice: "Create PO for ABC Pharma, 5,000 Amoxicillin 250mg" — confirmed instantly.

THE RAISE:
Raising USD 500K:
- First ERP partnership already closed (deal #1 done, smaller cost already handled)
- Raise funds: closing 2 more ERP partnerships from the 6+ identified in pipeline + 12-18 months transformation runway across all three
- This is not a "build from zero" raise — it's a "we proved it, now scale it" raise

TEAM:
- Ravi Chandra, CEO: Built MedPay (Medway Technologies) — 100K+ pharmacy network across India, supply chain financing, ERP integrations. 17+ yrs in pharma. rc@nexpla.com
- Anuj Gupta, CTO: 10+ yrs building products at scale. Architecture & AI.
- Anamika Shrivastava, Sales & Ops: 100s of ERP partnerships pan India. Built largest pharma ecosystem.
- Venkat Raju, Advisor: Global operator, entrepreneur & investor. AI, technology & scale.

UNFAIR ADVANTAGES (why Nexpla can do this and others can't):
1. Ravi's MedPay network: 100K+ pharmacies = direct channel to the end customers of every pharma ERP we target. No cold outreach.
2. Anamika's ERP relationships: 100s of partnerships managed = ERP owners already know her. Deal sourcing is relationship-driven, not cold outbound.
3. Niche focus: We only do India pharma distribution ERP. Not a horizontal play. Every decision comes from years inside this market.

WHAT TO SAY IF ASKED:
- About ERP names: "We don't disclose partner names publicly — pharma is a closed industry and ERP owners prefer confidentiality about transitions. Happy to discuss details confidentially."
- About revenue: "We're pre-revenue, in the partnership and transformation phase. First ERP agreement is reached."
- About valuation/terms: "We don't share that here — reach out to Ravi at rc@nexpla.com for a direct conversation."
- About anything you don't know: Be honest, suggest rc@nexpla.com.

End your reply with a CTA to rc@nexpla.com or the investor button only when it's genuinely relevant (not every message).`;

  function openAskPanel() {
    askOpen = true;
    askPanel.classList.add('open');
    askPanel.setAttribute('aria-hidden', 'false');
    askInput.focus();
  }
  function closeAskPanel() {
    askOpen = false;
    if (askPanel) {
      askPanel.classList.remove('open');
      askPanel.setAttribute('aria-hidden', 'true');
    }
  }

  if (askFab) askFab.addEventListener('click', () => askOpen ? closeAskPanel() : openAskPanel());
  if (askClose) askClose.addEventListener('click', closeAskPanel);

  function addMsg(content, role) {
    const div = document.createElement('div');
    div.className = `ask-msg ${role}`;
    div.textContent = content;
    askMessages.appendChild(div);
    askMessages.scrollTop = askMessages.scrollHeight;
    return div;
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'ask-msg assistant typing';
    div.textContent = '...';
    div.id = 'askTyping';
    askMessages.appendChild(div);
    askMessages.scrollTop = askMessages.scrollHeight;
  }
  function removeTyping() {
    const t = document.getElementById('askTyping');
    if (t) t.remove();
  }

  async function sendMessage(text) {
    if (!text.trim()) return;

    // Hide suggestions after first message
    if (askSuggests) askSuggests.style.display = 'none';

    addMsg(text, 'user');
    conversationHistory.push({ role: 'user', content: text });

    if (askInput) { askInput.value = ''; askInput.disabled = true; }
    if (askSend)  askSend.disabled = true;
    addTyping();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: conversationHistory,
        }),
      });

      const data = await response.json();
      removeTyping();

      const reply = data.content?.find(b => b.type === 'text')?.text || 'Something went wrong — please email rc@nexpla.com directly.';
      addMsg(reply, 'assistant');
      conversationHistory.push({ role: 'assistant', content: reply });

    } catch (err) {
      removeTyping();
      addMsg('Unable to connect right now. Please email rc@nexpla.com directly.', 'assistant');
    } finally {
      if (askInput)  { askInput.disabled = false; askInput.focus(); }
      if (askSend)   askSend.disabled = false;
    }
  }

  if (askSend)  askSend.addEventListener('click', () => sendMessage(askInput.value));
  if (askInput) askInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(askInput.value); });

  // Suggestion buttons
  document.querySelectorAll('.ask-suggest').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.textContent));
  });

  // ── Smooth scroll for anchor links ───────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});

/* ============================================================
   WOW LAYER — Demo Sequencer · Count-up · Scroll Reveals
   ============================================================ */

// ── Utility: sleep ──────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Hero AI Demo Sequencer ──────────────────────────────────
function initHeroDemo() {
  const msgs     = document.getElementById('demoMessages');
  const inputTxt = document.getElementById('demoInputText');
  const sendBtn  = document.getElementById('demoSend');
  if (!msgs || !inputTxt) return;

  const SEQUENCES = [
    {
      query: 'Show outstanding payments from top 20 distributors.',
      response: { type: 'card', data: { m1: '₹18.4L', l1: 'Total Outstanding', m2: '7', l2: 'Invoices Overdue', btns: ['View invoices','Send reminders'] } }
    },
    {
      query: 'Which batches are expiring within 30 days?',
      response: { type: 'card', data: { m1: '23 SKUs', l1: 'Near Expiry', m2: '₹2.1L', l2: 'Inventory at Risk', btns: ['View batches','Mark for return'] } }
    },
    {
      query: 'Create PO for ABC Pharma — 5,000 Amoxicillin 250mg.',
      response: { type: 'success', text: '✓  PO-24-01234 created and confirmed' }
    },
  ];

  function addEl(html) {
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const el = wrap.firstElementChild;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  async function typeInInput(text) {
    inputTxt.textContent = '';
    for (const ch of text) {
      inputTxt.textContent += ch;
      await sleep(28 + Math.random() * 20);
    }
  }

  async function flashSend() {
    sendBtn.classList.add('active');
    await sleep(200);
    sendBtn.classList.remove('active');
  }

  function addUserMsg(text) {
    return addEl(`<div class="demo-msg-user">${text}</div>`);
  }

  function addThinking() {
    return addEl(`<div class="demo-thinking"><span></span><span></span><span></span></div>`);
  }

  function addCardResponse(data) {
    return addEl(`
      <div class="demo-response-card">
        <div class="demo-card-row">
          <div class="demo-card-metric"><strong>${data.m1}</strong><small>${data.l1}</small></div>
          <div class="demo-card-metric"><strong>${data.m2}</strong><small>${data.l2}</small></div>
        </div>
        <div class="demo-card-btns">
          ${data.btns.map(b => `<button>${b}</button>`).join('')}
        </div>
      </div>`);
  }

  function addSuccessResponse(text) {
    return addEl(`<div class="demo-success-pill">${text}</div>`);
  }

  async function runSequence(seq) {
    // greeting on first
    if (msgs.children.length === 0) {
      addEl(`<div class="demo-msg-ai">Good morning 👋 &nbsp;How can I help you today?</div>`);
      await sleep(900);
    }

    await typeInInput(seq.query);
    await sleep(350);
    await flashSend();
    inputTxt.textContent = '';
    addUserMsg(seq.query);
    await sleep(700);

    const thinking = addThinking();
    await sleep(1400);
    thinking.remove();

    if (seq.response.type === 'card') {
      addCardResponse(seq.response.data);
    } else {
      addSuccessResponse(seq.response.text);
    }
    await sleep(3000);
  }

  async function demoLoop() {
    while (true) {
      for (const seq of SEQUENCES) {
        await runSequence(seq);
      }
      // Reset
      await sleep(1500);
      msgs.innerHTML = '';
    }
  }

  // Start after hero entrance
  setTimeout(demoLoop, 1400);
}

// ── Count-up ────────────────────────────────────────────────
function initCountUp() {
  const stats = document.querySelectorAll('.stat strong');
  if (!stats.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const el  = entry.target;
      const txt = el.textContent.trim();

      // Parse leading number
      const match = txt.match(/^([\d,.]+)/);
      if (!match) return;
      const raw  = parseFloat(match[1].replace(/,/g, ''));
      const suffix = txt.slice(match[1].length);  // e.g. "+" or " closed"

      el.closest('.stat')?.classList.add('counting');
      let start = 0;
      const duration = 1200;
      const step = 16;
      const inc = raw / (duration / step);

      const timer = setInterval(() => {
        start += inc;
        if (start >= raw) {
          el.textContent = match[1] + suffix;
          el.closest('.stat')?.classList.remove('counting');
          clearInterval(timer);
        } else {
          // Format with commas if original had them
          const val = Math.floor(start);
          const fmt = match[1].includes(',') ? val.toLocaleString() : String(val);
          el.textContent = fmt + suffix;
        }
      }, step);
    });
  }, { threshold: 0.5 });

  stats.forEach(s => io.observe(s));
}

// ── Scroll reveals ──────────────────────────────────────────
function initScrollReveals() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

// ── Animated econ bars ──────────────────────────────────────
function initEconBars() {
  const compare = document.querySelector('.economics-compare');
  if (!compare) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const bars = e.target.querySelectorAll('.bar-fill');
      bars.forEach((bar, i) => {
        setTimeout(() => bar.classList.add('animate-bar'), i * 100);
      });
    });
  }, { threshold: 0.3 });

  io.observe(compare);
}

// ── Platform stack build-in ──────────────────────────────────
function initPlatformStack() {
  const layers = document.querySelectorAll('.ps-layer');
  if (!layers.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      layers.forEach(l => l.classList.add('built'));
    });
  }, { threshold: 0.2 });

  if (layers[0]) io.observe(layers[0]);
}

// ── Boot all WOW ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHeroDemo();
  initCountUp();
  initScrollReveals();
  initEconBars();
  initPlatformStack();
});
