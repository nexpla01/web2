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
- The largest pharma ERP (MARG ERP, founded 1992) runs on Foxpro/DBF — pre-internet architecture
- A $60B+ industry runs on software built for a pre-AI world: screen-driven, manual, fragmented, human-dependent
- AI changed the economics of rebuilding: before AI, needed large teams, years, big budgets. With AI agents, dramatically faster and cheaper.

CURRENT PORTFOLIO (names not disclosed — pharma is a closed industry, owners don't want public announcements):
- ERP Partner #1: Agreement reached. 300+ customers, 20+ years in market, 300+ modules.
- ERP Partner #2: Shortlisted. 3,000+ customers, 20+ years in market, 300+ modules.
- Combined: $100M+ transactional data, 3,300+ customers, 20+ years market maturity, 300+ modules.

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
- $300K+ total partnership/acquisition cost ($80K ERP #1, $220K ERP #2)
- 12-18 months transformation runway
- Use of funds: Partner with 2 ERPs + fund modernization and rebuild

TEAM:
- Ravi Chandra, CEO: 17+ yrs healthcare & pharma. Supply chain & operations. rc@nexpla.com
- Anuj Gupta, CTO: 10+ yrs building products at scale. Architecture & AI.
- Anamika Shrivastava, Sales & Ops: 100s of ERP partnerships pan India. Built largest pharma ecosystem.
- Venkat Raju, Advisor: Global operator, entrepreneur & investor. AI, technology & scale.

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
