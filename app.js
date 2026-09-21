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
    const el = modals[id] || document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    const anyOpen = Object.values(modals).some(modal => modal && modal.classList.contains('open'));
    if (!anyOpen) document.body.style.overflow = '';
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
Nexpla is building the operating system for India's pharma supply chain. The strategy is to acquire legacy pharma ERPs, rebuild them with AI, layer new services, and repeat across the market. Founded by Ravi Chandra (CEO) and Anuj Gupta (CTO), based in Bangalore.

STRATEGY — ACQUIRE · REBUILD · LAYER · REPEAT:
1. Acquire profitable legacy pharma ERP businesses (customers, data, workflows, domain knowledge, trust, and teams already exist)
2. Rebuild: AI-native architecture, voice/chat interface, automated support, zero-training workflows, modern cloud stack
3. Layer: commerce, supply chain financing, transaction intelligence, platform APIs, agents, and payments
4. Repeat: acquire the next ERP; data gets richer, the network compounds, platform value increases

THE MARKET:
- India domestic pharma market: $60B FY26
- 3,000+ pharma companies, 60,000+ distributors, 1.3M+ retailers
- India is #3 globally by pharma volume
- Critical operations still depend on 90s software: screen-driven, manual, fragmented, human-dependent
- MARG ERP was established in 1992 and reported about $11M FY2025 revenue
- Core insight: the software is replaceable; the context accumulated inside it is not

OWNERSHIP THESIS:
- Integration asks permission. Ownership does not.
- Without ownership: negotiate with every ERP owner, enable every customer separately, depend on their roadmap, data stays with the ERP owner.
- With ownership: one deal closes the whole base, one upgrade reaches all customers, Nexpla controls the roadmap, and owns 20+ years of transactions, workflows, and relationships.
- Own the ERP once. Upgrade the entire installed base.

CURRENT PORTFOLIO (names not disclosed — pharma is a closed industry, owners prefer confidentiality):
- ERP #1: Agreement signed, team assembled, platform architecture designed. 300+ customers, $30M+ annual transactions, 300+ modules, 20+ years of context.
- ERP #2: Shortlisted.
- ERP #3: Pipeline target by month 15.

THE PLATFORM:
- ERP / system of record: installed base, customers, workflows, transactions
- Nexpla OS: intelligence, agents, APIs
- Operating stack: commerce, fintech, open platform
- Ownership turns the ERP from software into infrastructure

BUSINESS MODEL:
- Legacy ERP has SaaS subscription revenue
- Nexpla adds five new streams: transaction intelligence, supply chain financing, commerce and ordering, platform APIs and agents, payments TPV
- $1M+ monthly TPV is already flowing through the team's network from prior operating experience

THE TRANSFORMATION:
Before: Navigate → Click → Search → Wait
After: Ask → Get answers → Take action
Example: "Show me outstanding payments from top 20 distributors" → ₹18.4L outstanding, 7 invoices overdue, one-click send reminders. Or voice: "Create PO for ABC Pharma, 5,000 Amoxicillin 250mg" — confirmed instantly.
Execution proof: ERP #1 agreement signed, team assembled, platform architecture designed, ERP #2 shortlisted.

THE RAISE:
Raising USD 500K:
- What it unlocks in 15 months:
- Close acquisitions, AI rebuild begins, teams retained
- AI workflows live; voice + chat; support costs drop significantly
- 2+ new revenue streams live: supply chain financing, data intelligence, NRR >120%
- $100M TPV and ERP #3 pipeline; Series A ready
- Allocation: ERP #1 acquisition close $80K+, ERP #2 pipeline and close $220K+, Product/AI/Integration $200K

TEAM:
- Ravi Chandra, CEO: 17+ yrs across healthcare and pharma. Built MedPay - 100K+ pharmacy network, supply chain financing, payments infrastructure, and ERP integrations. rc@nexpla.com
- Anuj Gupta, CTO: 10+ yrs building products at scale. Hands-on architecture and AI.
- Anamika Shrivastava, Sales & Ops: 100s of ERP partnerships pan India; helped create the largest pharma ecosystem.
- Venkat Raju, Advisor: Global operator, entrepreneur, and investor across AI, technology, and scale.

UNFAIR ADVANTAGES (why Nexpla can do this and others can't):
1. Founders lived the problem for 6+ years through MedPay.
2. 100K+ pharmacy network and $500K+ monthly payment volume from prior operating experience.
3. ERP connectivity and relationship-driven access in a closed ecosystem.
4. Focused vertical thesis: India's pharma supply chain, not a generic horizontal AI play.

WHAT TO SAY IF ASKED:
- About ERP names: "We don't disclose partner names publicly — pharma is a closed industry and ERP owners prefer confidentiality about transitions. Happy to discuss details confidentially."
- About revenue: "The acquired ERP base has existing subscription revenue. Nexpla adds transaction intelligence, financing, commerce, APIs, agents, and payments TPV as the OS layer goes live."
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
      await sleep(500);
    }

    await typeInInput(seq.query);
    await sleep(350);
    await flashSend();
    inputTxt.textContent = '';
    addUserMsg(seq.query);
    await sleep(500);

    const thinking = addThinking();
    await sleep(850);
    thinking.remove();

    if (seq.response.type === 'card') {
      addCardResponse(seq.response.data);
    } else {
      addSuccessResponse(seq.response.text);
    }
    await sleep(3000);
  }

  async function demoLoop() {
    if (msgs.children.length === 0) {
      addEl(`<div class="demo-msg-ai">Good morning 👋 &nbsp;How can I help you today?</div>`);
      addUserMsg(SEQUENCES[0].query);
      addCardResponse(SEQUENCES[0].response.data);
      await sleep(1400);
    }

    while (true) {
      for (const seq of SEQUENCES.slice(1)) {
        await runSequence(seq);
      }
      await runSequence(SEQUENCES[0]);
      // Reset
      await sleep(1500);
      msgs.innerHTML = '';
    }
  }

  // Start after hero entrance
  setTimeout(demoLoop, 700);
}

function initHeroDemoFollow() {
  const hero = document.querySelector('.hero');
  const demoWrap = document.querySelector('.hero-demo');
  const demoWindow = document.querySelector('.demo-window');
  const contentEnd = document.querySelector('.hero-stats');
  if (!hero || !demoWrap || !demoWindow || !contentEnd) return;

  let ticking = false;

  function update() {
    ticking = false;

    if (window.innerWidth <= 900) {
      demoWrap.style.transform = '';
      return;
    }

    const heroRect = hero.getBoundingClientRect();
    const normalTop = 136;
    const stickyTop = 112;
    const bottomGap = 8;
    const travel = Math.max(0, -heroRect.top + stickyTop - normalTop);
    const contentBottom = contentEnd.offsetTop + contentEnd.offsetHeight;
    const maxTravel = Math.max(0, contentBottom - demoWindow.offsetHeight - normalTop - bottomGap);
    const y = Math.min(travel, maxTravel);

    demoWrap.style.transform = `translate3d(0, ${y}px, 0)`;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.setInterval(requestUpdate, 180);
  update();
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

// ── Approach sticky scroll cards ────────────────────────────
function initApproachScrollCards() {
  const story = document.getElementById('approachScrollStory');
  if (!story) return;

  const stage = story.querySelector('.approach-scroll-stage');
  const card = story.querySelector('.approach-scroll-card');
  const steps = [...story.querySelectorAll('.approach-scroll-step')];
  const stepEl = document.getElementById('approachCardStep');
  const labelEl = document.getElementById('approachCardLabel');
  const kickerEl = document.getElementById('approachCardKicker');
  const titleEl = document.getElementById('approachCardTitle');
  const bodyEl = document.getElementById('approachCardBody');
  const pointsEl = document.getElementById('approachCardPoints');
  const progress = [...story.querySelectorAll('.approach-scroll-progress i')];
  const nodes = [...story.querySelectorAll('.diagram-node')];
  if (!stage || !card || !steps.length || !titleEl || !bodyEl || !pointsEl) return;

  let activeIndex = -1;
  let ticking = false;
  let transitionTimer = 0;

  function render(index) {
    const step = steps[index];
    if (!step) return;

    activeIndex = index;
    card.classList.add('is-changing');
    window.clearTimeout(transitionTimer);

    transitionTimer = window.setTimeout(() => {
      const number = step.dataset.step || String(index + 1).padStart(2, '0');
      const label = step.dataset.label || '';
      const pointItems = (step.dataset.points || '').split('|').filter(Boolean);
      const nodeItems = (step.dataset.nodes || '').split('|').filter(Boolean);

      if (stepEl) stepEl.textContent = number;
      if (labelEl) labelEl.textContent = label;
      if (kickerEl) kickerEl.textContent = `Operating move ${number}`;
      titleEl.textContent = step.dataset.title || '';
      bodyEl.textContent = step.dataset.body || '';
      pointsEl.innerHTML = pointItems.map(item => `<li>${item}</li>`).join('');

      nodes.forEach((node, nodeIndex) => {
        node.textContent = nodeItems[nodeIndex] || node.textContent;
      });

      progress.forEach((bar, barIndex) => {
        bar.classList.toggle('active', barIndex <= index);
      });

      card.classList.remove('is-changing');
    }, 170);
  }

  function getMetrics() {
    const storyRect = story.getBoundingClientRect();
    const navHeight = document.querySelector('.nav')?.offsetHeight || 72;
    const topOffset = Math.max(86, navHeight + 20);
    const storyTop = storyRect.top + window.scrollY;
    const storyHeight = story.offsetHeight;
    const stageHeight = stage.offsetHeight;
    const start = storyTop - topOffset;
    const end = storyTop + storyHeight - stageHeight - topOffset;

    return {
      end,
      stageHeight,
      start,
      storyHeight,
      storyRect,
      topOffset,
      total: Math.max(1, end - start),
    };
  }

  function clearStagePosition() {
    stage.removeAttribute('style');
  }

  function pinStage(metrics) {
    const y = window.scrollY;

    if (y < metrics.start) {
      clearStagePosition();
      return;
    }

    if (y >= metrics.end) {
      stage.style.position = 'absolute';
      stage.style.top = `${metrics.storyHeight - metrics.stageHeight}px`;
      stage.style.left = '0';
      stage.style.right = '0';
      stage.style.width = '100%';
      stage.style.minHeight = `${metrics.stageHeight}px`;
      return;
    }

    stage.style.position = 'fixed';
    stage.style.top = `${metrics.topOffset}px`;
    stage.style.left = `${metrics.storyRect.left}px`;
    stage.style.right = 'auto';
    stage.style.width = `${metrics.storyRect.width}px`;
    stage.style.minHeight = `${metrics.stageHeight}px`;
  }

  function getActiveIndex(metrics) {
    const progress = (window.scrollY - metrics.start) / metrics.total;
    const index = Math.floor(progress * steps.length);
    return Math.max(0, Math.min(steps.length - 1, index));
  }

  function update() {
    ticking = false;
    const metrics = getMetrics();

    const nextIndex = getActiveIndex(metrics);
    pinStage(metrics);
    if (nextIndex !== activeIndex) render(nextIndex);
  }

  function requestUpdate() {
    if (window.innerWidth <= 760) {
      clearStagePosition();
      if (activeIndex !== 0) render(0);
      return;
    }
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  render(0);
  requestUpdate();
}

// ── Boot all WOW ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHeroDemo();
  initHeroDemoFollow();
  initCountUp();
  initScrollReveals();
  initEconBars();
  initPlatformStack();
  initApproachScrollCards();
});
