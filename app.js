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

  const SYSTEM_PROMPT = `You are Ask Nexpla — an AI assistant for investors and ERP partners exploring Nexpla. Be direct, factual and concise. Ground answers in the current investor deck and do not invent facts.

COMPANY:
Nexpla is building an AI-Native Operating System for India’s Pharma Supply Chain. The model is Partner → Modernize → Layer → Scale.

THE PROBLEM:
- India’s domestic pharma market is ~$60B in FY26.
- The industry includes 3k+ pharma companies, 60k+ distributors and 1.3M+ retailers.
- Critical operations still depend on screen-driven, manual, fragmented software built for a pre-AI world.
- MARG ERP was established in 1992 and reported ~$11M FY2025 revenue.

THE INSIGHT:
- The ERP is the gatekeeper between critical transactions in the pharma supply chain.
- It holds customers, products, pricing, inventory, orders, demand, invoices, payments, credit and relationships.
- The software is replaceable. The accumulated context — workflows, relationships, data and trust — is not.

THE CONSTRAINT:
- Without strategic alignment, Nexpla would need to negotiate separately with ERP owners, enable customers individually and depend on separate roadmaps.
- With a strategic partnership, one modernization roadmap can reach the installed base while preserving the underlying context.

FOUNDERS INSIGHT:
- The team has lived the problem for 6+ years.
- 100K+ pharmacies onboarded / reached through the broader pharma network.
- $500K+ monthly payment volume in prior operating infrastructure.
- Supply-chain financing, payments infrastructure and pan-India network experience.

WHAT WE PARTNER WITH:
- Customers: 300+ installed base on the first ERP.
- Data: 20+ years of transactions.
- Workflows: 300+ modules.
- Domain knowledge: embedded pharma processes.
- The goal is to preserve the context needed to modernize with intelligence.

PLATFORM:
- ERP remains the system of record: customers, workflows, transactions.
- Nexpla OS adds intelligence, agents and APIs.
- Commerce, fintech and open-platform services sit above the core.
- Partnership turns the ERP from software into an extensible operating platform.

PLAYBOOK:
1. Partner with established ERPs with existing customers, proven revenue, deep workflow knowledge and embedded teams.
2. Modernize with AI-native architecture, voice + chat, automated support, zero training and a modern cloud stack.
3. Layer platform services: supply-chain intelligence, financing, commerce/order flows, APIs and agents.
4. Scale through the next strategic partnership, enrich the data, compound the network and strengthen the platform.
- First ERP gives 300+ customers day one and $30M+ annual transactions.
- Same customers can support multiple revenue streams versus one for legacy ERPs.

BUSINESS MODEL:
- ERP SaaS: $28K current annual revenue.
- Transaction layer: commerce + payments.
- Financial layer: supply-chain financing using transaction history for underwriting.
- Intelligence layer: data + APIs + agents.

PROOF OF EXECUTION:
- ERP #1 agreement signed; closing in progress.
- Full platform architecture designed: OS stack, AI layer, API framework and revenue model.
- Live AI workflows built and deployed.
- Paid pilots running with voice + chat and real pharma data.
- Team assembled and advisors confirmed.
- ERP #2 shortlisted; conversations started around a 3,000+ customer platform with 20+ years of history.

TEAM:
- Ravi Chandra, Cofounder & CEO: 17+ years across healthcare & pharma; deep supply chain and operations experience.
- Anuj Gupta, Cofounder & CTO: 10+ years building products at scale; hands-on architecture and AI.
- Anamika Shrivastava, Sales & Ops: 100s of ERP partnerships pan India; experience creating the largest pharma ecosystem.
- Venkat Raju, Advisor: Global operator, entrepreneur & investor; AI, technology & scale.

THE RAISE:
- Raising $500K.
- Allocation: $80K+ ERP #1 partnership close; $220K+ ERP #2 strategic partnership; $200K product, AI & integration.
- 15-month plan: expand strategic partnerships, get AI workflows live, launch 2+ new revenue streams, reach $100M TPV and build the next partnership pipeline; Series A ready.

If asked about partner names: do not invent or disclose names; say the deck does not name them publicly and details can be discussed confidentially with Ravi at rc@nexpla.com.
If asked about valuation or terms: say they are not provided in the deck and direct them to rc@nexpla.com.
If something is not in the deck, be transparent that it is not specified.`;


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
