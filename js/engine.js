/* Stage engine: stepper, paths, deep links, guided taps, keyboard, presenter notes. */
(function () {
  const D = window.PC, A = window.Acts, C = window.Console, S = window.Screens;
  const ALL = A.steps;
  const actById = Object.fromEntries(A.acts.map((a) => [a.id, a]));
  const esc = C.esc;

  const state = { path: "short", i: 0, pending: null, done: false };
  const inPath = (actId) => state.path === "full" || actById[actId].short;

  const app = document.getElementById("app");
  app.innerHTML = `
    <header class="top">
      <a class="top-logo" data-go="hero" title="Back to start"><img src="assets/puroclean-logo.svg" alt="PuroClean"/></a>
      <div class="top-title"><b>Integration strategy</b><span>Stage 1 \u00b7 MuleSoft + Tableau</span></div>
      <nav class="stepper" id="stepper"></nav>
    </header>
    <section class="talk" id="talk"></section>
    <main class="stage" id="stage">
      <section class="left" id="left"></section>
      <section class="right" id="right"></section>
    </main>
    <main class="page" id="page" hidden></main>
    <footer class="foot"><span>${esc(D.meta.disclaimer)}</span><span class="foot-tag">The Paramedics of Property Damage\u00ae</span><span class="foot-keys">\u2190 \u2192 step \u00b7 1\u20138 jump \u00b7 R reset \u00b7 N notes</span></footer>`;

  const $ = (id) => document.getElementById(id);
  const left = $("left"), talk = $("talk"), stage = $("stage"), page = $("page");
  C.init($("right"));
  if (/[?&]exec\b/.test(location.search)) document.querySelector('.cx-depth [data-depth="exec"]').click();

  /* ------------------------------------------------------------ stepper */
  function renderStepper() {
    const cur = ALL[state.i];
    $("stepper").innerHTML = A.acts
      .map((a) => {
        const on = a.id === cur.act;
        const off = !inPath(a.id);
        const label = a.n ? `<i>${a.n}</i>${esc(a.title)}` : esc(a.title);
        return `<button class="st ${on ? "on" : ""} ${off ? "off" : ""} ${a.focus ? "focus" : ""}" data-act="${a.id}" title="${esc([a.tip, a.focus].filter(Boolean).join(" \u00b7 "))}">${label}</button>`;
      })
      .join("");
  }

  function renderTalk() {
    const s = ALL[state.i];
    const a = actById[s.act];
    const seq = ALL.filter((x) => inPath(x.act) || x.act === s.act);
    const pos = seq.indexOf(s) + 1;
    const actLabel = a.n ? `Act ${a.n} \u00b7 ${a.title}` : a.title;
    talk.innerHTML = `
      <div class="tk-l">
        <div class="tk-act">${esc(actLabel)}${a.focus ? `<span class="tk-focus">${a.focus}</span>` : ""}${!inPath(s.act) ? '<span class="tk-off">Full run only</span>' : ""}</div>
        <div class="tk-title">${/^\d/.test(s.id) ? `<span class="tk-id">${s.id}</span>` : ""}${esc(s.title)}</div>
        <div class="tk-say">${esc(s.say || "")}</div>
      </div>
      <div class="tk-r">
        <div class="tk-pw">${(s.powered || []).map((p) => `<span class="chip">${esc(p)}</span>`).join("")}</div>
        <div class="tk-nav">
          <div class="seg"><button data-path="short" class="${state.path === "short" ? "on" : ""}">Short path</button><button data-path="full" class="${state.path === "full" ? "on" : ""}">Full run</button></div>
          <button class="ghost ${document.body.classList.contains("notes-off") ? "" : "on"}" id="btnNotes" title="Show or hide presenter notes (N)">Notes</button>
          <button class="ghost" id="btnReset" title="Replay this step (R)">Reset</button>
          <span class="tk-sep"></span>
          <button class="ghost" id="btnPrev" ${state.i === 0 ? "disabled" : ""}>\u2190 Back</button>
          <span class="tk-pos">${pos} / ${seq.length}</span>
          <button class="primary" id="btnNext" ${nextIndex() < 0 ? "disabled" : ""}>Next \u2192</button></div>
      </div>`;
    $("btnPrev").onclick = prev;
    $("btnNext").onclick = next;
    $("btnReset").onclick = () => go(state.i);
    $("btnNotes").onclick = () => { document.body.classList.toggle("notes-off"); $("btnNotes").classList.toggle("on"); };
  }

  function nextIndex() {
    const cur = ALL[state.i];
    for (let j = state.i + 1; j < ALL.length; j++) if (ALL[j].act === cur.act || inPath(ALL[j].act)) return j;
    return -1;
  }
  function prevIndex() {
    const cur = ALL[state.i];
    for (let j = state.i - 1; j >= 0; j--) if (ALL[j].act === cur.act || inPath(ALL[j].act)) return j;
    return -1;
  }

  /* ------------------------------------------------------------ guided taps */
  function applyPulse() {
    left.querySelectorAll(".pulse").forEach((e) => e.classList.remove("pulse"));
    if (!state.pending) return;
    state.pending.names.forEach((n) => left.querySelectorAll(`[data-tap="${n}"]`).forEach((e) => e.classList.add("pulse")));
  }

  const AUTO = /[?&]auto\b/.test(location.search);

  function tap(names, t) {
    names = [].concat(names);
    return new Promise((resolve, reject) => {
      state.pending = { names, t, resolve: (n) => { state.pending = null; applyPulse(); resolve(n); }, reject };
      applyPulse();
      if (AUTO) setTimeout(() => { if (state.pending && state.pending.t === t) state.pending.resolve(names[0]); }, 900);
    });
  }

  function cancelPending() {
    if (state.pending) {
      const p = state.pending;
      state.pending = null;
      p.reject(new Run.Cancelled());
    }
  }

  left.addEventListener("click", (e) => {
    const el = e.target.closest("[data-tap]");
    if (!el || !state.pending) return;
    if (state.pending.names.includes(el.dataset.tap)) state.pending.resolve(el.dataset.tap);
  });

  /* ------------------------------------------------------------ run a step */
  async function go(i, opt = {}) {
    cancelPending();
    const t = Run.next();
    state.i = Math.max(0, Math.min(ALL.length - 1, i));
    state.done = false;
    delete document.body.dataset.done;
    const s = ALL[state.i];
    if (!opt.noHash) history.replaceState(null, "", `#${state.path}/${s.id}`);
    document.body.dataset.step = s.id;
    renderStepper();
    renderTalk();

    if (s.layout === "full") {
      stage.hidden = true;
      page.hidden = false;
      page.innerHTML = PAGES[s.page]();
      page.scrollTop = 0;
      bindPage(s.page);
      state.done = true;
      document.body.dataset.done = "1";
      return;
    }
    stage.hidden = false;
    page.hidden = true;
    C.reset();
    left.innerHTML = `<div class="left-ui" id="leftUI"></div>${s.desc ? `<div class="left-desc"><span class="ld-k">What's happening</span>${esc(s.desc)}</div>` : ""}`;
    const leftUI = $("leftUI");
    const ctx = {
      t,
      C,
      left(html) { if (Run.alive(t)) { leftUI.innerHTML = html; applyPulse(); } },
      tap: (names) => tap(names, t),
      sleep: (ms) => Run.sleep(ms, t),
    };
    try {
      await s.run(ctx);
      if (Run.alive(t)) {
        state.done = true;
        document.body.dataset.done = "1";
        const nb = $("btnNext");
        if (nb) nb.classList.add("ready");
      }
    } catch (err) {
      if (!(err instanceof Run.Cancelled)) console.error(err);
    }
  }

  function next() { const j = nextIndex(); if (j >= 0) go(j); }
  function prev() { const j = prevIndex(); if (j >= 0) go(j); }
  function goAct(actId) { const j = ALL.findIndex((s) => s.act === actId); if (j >= 0) go(j); }

  /* ------------------------------------------------------------ controls */
  document.addEventListener("click", (e) => {
    const st = e.target.closest("[data-act]");
    if (st) return goAct(st.dataset.act);
    const p = e.target.closest("[data-path]");
    if (p) {
      state.path = p.dataset.path;
      if (ALL[state.i].act === "hero") return goAct("1");
      return go(state.i);
    }
    const g = e.target.closest("[data-go]");
    if (g) return goAct(g.dataset.go);
  });

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      if (state.pending) state.pending.resolve(state.pending.names[0]);
      else if (state.done) next();
    } else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    else if (/^[1-8]$/.test(e.key)) goAct(e.key);
    else if (e.key === "0") goAct("hero");
    else if (e.key === "r" || e.key === "R") go(state.i);
    else if (e.key === "n" || e.key === "N") $("btnNotes").click();
    else if (e.key === "e" || e.key === "E") document.querySelector(`.cx-depth button:not(.on)`).click();
  });

  function fromHash() {
    const m = location.hash.replace(/^#/, "").match(/^(short|full)?\/?(?:act-)?(.*)$/);
    if (!m) return go(0, { noHash: true });
    if (m[1]) state.path = m[1];
    const id = m[2];
    let j = ALL.findIndex((s) => s.id === id);
    if (j < 0 && id) j = ALL.findIndex((s) => s.act === id);
    go(j < 0 ? 0 : j, { noHash: !location.hash });
  }
  window.addEventListener("hashchange", () => {
    const want = location.hash.replace(/^#(short|full)\//, "").replace(/^act-/, "");
    if (ALL[state.i].id !== want) fromHash();
  });

  /* ------------------------------------------------------------ full-width pages */
  const ARCH = [
    { col: "SPAR platforms", blocks: [
      { id: "spar", t: "Dash \u00b7 PSA \u00b7 Albi \u00b7 JobSite", s: "Each franchise's job management system", d: "Franchises keep their chosen platform. MuleSoft reads job and milestone changes from each one on a watermark, so nothing about the franchise's day changes." },
      { id: "fc", t: "FranConnect", s: "Franchise master", d: "The source of truth for franchise ID, region, state and RD. Cached daily and used to enrich every job and to route alerts by region." },
    ] },
    { col: "MuleSoft Anypoint", blocks: [
      { id: "sapi", t: "System APIs", s: "One per platform", d: "dash-sapi, psa-sapi, albi-sapi, jobsite-sapi and franconnect-sapi. Each one speaks a single vendor's API and hides it from everything downstream. Adding a platform means adding one of these." },
      { id: "papi", t: "Process APIs", s: "Job Sync \u00b7 Milestones \u00b7 Franchise Reference", d: "Job Sync handles the daily lane, Milestones handles the 5-minute SLA lane, and Franchise Reference handles FranConnect enrichment. Built once, reused for every platform." },
      { id: "dw", t: "DataWeave \u2192 PuroLogic", s: "Canonical model", d: "Every platform's fields map to PuroClean's 18 PuroLogic Dates and standard loss types. PuroClean owns the definitions; MuleSoft enforces them." },
      { id: "dq", t: "Data quality", s: "Dedupe \u00b7 rules \u00b7 quarantine", d: "Duplicates from multi-location accounts are merged. Records that fail a rule are held in quarantine.job with a reason code, not silently loaded." },
      { id: "notif", t: "Notification layer", s: "Alerts by region", d: "SLA risks route to the right Regional Director using FranConnect's region mapping." },
      { id: "mon", t: "Monitoring + Visualizer", s: "Health \u00b7 alerts \u00b7 tracing", d: "Functional Monitoring checks each platform on a schedule. Dashboards, alerts and complete transaction tracing show what failed and where. Visualizer shows the live application network." },
      { id: "apim", t: "API Manager", s: "Policies at the gateway", d: "Client ID Enforcement, OAuth 2.0 Token Enforcement, JSON/XML Threat Protection, Rate Limiting and Tokenization, applied without code changes." },
      { id: "exch", t: "Exchange", s: "Catalog + documentation", d: "Every API, the canonical model and the runbooks are documented and discoverable, so the knowledge stays with PuroClean." },
    ] },
    { col: "11:11 SQL Server lake", blocks: [
      { id: "lake", t: "staging \u00b7 curated \u00b7 quarantine", s: "PuroClean's environment", d: "MuleSoft upserts into staging and promotes to curated. Quarantine holds failed records with reasons. Credentials and schema stay under PuroClean's control." },
    ] },
    { col: "Tableau", blocks: [
      { id: "sem", t: "Semantic model", s: "Certified metrics", d: "One definition per KPI from the Data Collection sheet, so every dashboard agrees." },
      { id: "rls", t: "Row-level security", s: "By region", d: "One dashboard for CJ and all 12\u201313 RDs. Each user sees their own region." },
      { id: "dash", t: "Dashboards + Pulse", s: "Drill-down and digests", d: "Network to job in four clicks, with benchmarks, data health and proactive Pulse digests." },
    ] },
  ];

  const PAGES = {
    hero: () => `
      <div class="hero">
        <div class="hero-band">
          <img src="assets/pc-logo-white.png" alt="PuroClean" class="hero-logo"/>
          <div class="hero-eyebrow">Integration strategy \u00b7 Stage 1</div>
          <h1>${esc(D.meta.title)}</h1>
          <p class="hero-sub">${esc(D.meta.northStar)}</p>
          <div class="hero-paths">
            <button class="primary big" data-path="short">Short path <small>about 22 min</small></button>
            <button class="ghost-light big" data-path="full">Full run <small>about 28 min</small></button>
          </div>
        </div>
        <div class="hero-stats">${D.meta.stats.map((s) => `<div class="hs"><b>${esc(s.v)}</b><span>${esc(s.l)}</span></div>`).join("")}</div>
        <div class="hero-split">
          <div><span class="hx">Left side</span><b>What PuroClean sees</b><p>A franchise tablet, CJ's Tableau dashboards, a Regional Director's phone.</p></div>
          <div class="dark"><span class="hx">Right side</span><b>What's happening underneath</b><p>MuleSoft APIs, DataWeave, data quality, the 11:11 lake and Tableau, in real time.</p></div>
        </div>
        <p class="hero-fine">${esc(D.meta.preparedFor)} \u00b7 Presented by ${esc(D.meta.presenter)} \u00b7 Illustrative data and simulated screens.<br/><span class="tag">The Paramedics of Property Damage\u00ae</span></p>
      </div>`,

    arch: () => `
      <div class="arch">
        <h2>How it fits together</h2>
        <p class="lede">Tap any block for what it does.</p>
        <div class="arch-grid">
          ${ARCH.map((c, ci) => `<div class="arch-col c${ci}"><div class="arch-h">${c.col}</div>${c.blocks.map((b) => `<button class="ab" data-ab="${b.id}"><b>${b.t}</b><small>${b.s}</small></button>`).join("")}</div>${ci < ARCH.length - 1 ? '<div class="arch-arrow">\u2192</div>' : ""}`).join("")}
        </div>
        <div class="arch-detail" id="archDetail"><b>Tap a block</b><p>Every block here appears in the demo. The right-hand console shows each one working.</p></div>
        <div class="arch-out"><div class="arch-h">Out of Stage 1</div>${D.scope.out.map(([k, v]) => `<div><b>${k}</b><small>${v}</small></div>`).join("")}</div>
      </div>`,

    close: () => `
      <div class="close">
        <h2>Start small. Grow to 900. Know first.</h2>
        <div class="close-cards">
          <div><i>1</i><b>One language</b><p>PuroLogic Dates across every platform.</p></div>
          <div><i>2</i><b>Start small</b><p>Wave 1 is Dash and FranConnect.</p></div>
          <div><i>3</i><b>Grows to 900</b><p>Configuration, not code.</p></div>
          <div><i>4</i><b>You'll know first</b><p>Monitoring, alerts, and nothing lost.</p></div>
        </div>
        <div class="close-row">
          <div class="waves"><div class="arch-h">Waves</div>
            <div class="wv"><span>Wave 1</span><b>Dash + FranConnect</b><small>live before the holidays</small></div>
            <div class="wv"><span>Wave 2</span><b>PSA, Albi, JobSite</b><small>as their data arrives in January</small></div>
            <div class="wv"><span>Then</span><b>Tableau dashboards</b><small>on the curated lake</small></div>
          </div>
          <div class="nexts"><div class="arch-h">Next steps</div><ol>
            <li>Confirm the four SLA objects and the Stage 1 KPIs</li>
            <li>Agree the canonical model owner</li>
            <li>Introduce the implementation partner</li>
            <li>Agree the mutual plan</li></ol></div>
          <div class="presenter"><img src="assets/puroclean-logo.svg" alt="PuroClean"/><b>${esc(D.meta.presenter.split(",")[0])}</b><small>${esc(D.meta.presenter.split(",")[1].trim())} \u00b7 Salesforce</small><button class="ghost" data-go="hero">Back to start</button></div>
        </div>
      </div>`,
  };

  function bindPage(name) {
    if (name !== "arch") return;
    const all = Object.fromEntries(ARCH.flatMap((c) => c.blocks).map((b) => [b.id, b]));
    page.querySelectorAll(".ab").forEach((b) =>
      b.addEventListener("click", () => {
        page.querySelectorAll(".ab").forEach((x) => x.classList.toggle("on", x === b));
        const x = all[b.dataset.ab];
        $("archDetail").innerHTML = `<b>${x.t}</b><small>${x.s}</small><p>${x.d}</p>`;
      })
    );
  }

  fromHash();
})();
