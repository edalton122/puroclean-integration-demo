/* Stage engine: stepper, paths, deep links, guided taps, keyboard, presenter notes. */
(function () {
  const D = window.PC, A = window.Acts, C = window.Console, S = window.Screens;
  const ALL = A.steps;
  const chapterById = Object.fromEntries(A.chapters.map((c) => [c.id, c]));
  const esc = C.esc;
  const NOTES = window.NOTES || null;

  const state = { path: "short", i: 0, pending: null, done: false };
  /* Per-step short flag: each step declares if it's on the short path. */
  const inPath = (s) => state.path === "full" || !!s.short;

  const app = document.getElementById("app");
  app.innerHTML = `
    <header class="top">
      <a class="top-logo" data-go="hero" title="Back to start"><img src="assets/puroclean-logo.svg" alt="PuroClean"/></a>
      <div class="top-title"><b>MuleSoft + Tableau</b><span>Stage 1 \u00b7 PuroClean</span></div>
      <nav class="stepper" id="stepper"></nav>
    </header>
    <section class="talk" id="talk"></section>
    <main class="stage" id="stage">
      <section class="left" id="left"></section>
      <section class="right" id="right"></section>
    </main>
    <main class="page" id="page" hidden></main>
    <div class="chapter-card" id="chapterCard" hidden></div>
    <footer class="foot"><span>${esc(D.meta.disclaimer)}</span><span class="foot-tag">The Paramedics of Property Damage\u00ae</span><span class="foot-keys">\u2190 \u2192 step \u00b7 1\u20138 jump \u00b7 R reset${NOTES ? " \u00b7 N notes" : ""}</span></footer>`;

  const $ = (id) => document.getElementById(id);
  const left = $("left"), talk = $("talk"), stage = $("stage"), page = $("page");
  C.init($("right"));
  if (/[?&]exec\b/.test(location.search)) { const d = document.querySelector('.cx-depth [data-depth="exec"]'); if (d) d.click(); }

  /* ------------------------------------------------------------ stepper */
  /* Only numbered chapters 1-8 appear in the stepper. */
  const stepperChapters = A.chapters.filter((c) => c.n);

  function renderStepper() {
    const cur = ALL[state.i];
    $("stepper").innerHTML = stepperChapters
      .map((c) => {
        const on = c.id === cur.act;
        const stepsInChapter = ALL.filter((s) => s.act === c.id);
        const off = stepsInChapter.length && !stepsInChapter.some((s) => inPath(s));
        return `<button class="st ${on ? "on" : ""} ${off ? "off" : ""}" data-act="${c.id}" title="${esc(c.question || c.title)}"><i>${c.n}</i>${esc(c.title)}</button>`;
      })
      .join("");
  }

  /* Clock labels for the story (shown in talk bar). */
  const CLOCKS = {
    "hero": "", "today": "",
    "1.1": "Tue 6:21 AM", "1.2": "Tue 6:25 AM", "1.3": "Tue 6:25 AM",
    "1.4": "Tue 6:41 AM", "1.5": "Tue 8:05 AM",
    "2.1": "Tue 10:02 AM",
    "3.1": "Tue 10:12 AM", "3.2": "Tue 10:30 AM",
    "4.1": "Tue 2:00 PM", "4.2": "Tue 2:03 PM", "4.3": "Tue 2:02 PM",
    "4.4": "Tue 2:03 PM", "4.5": "Tue 2:06 PM",
    "5.1": "Tue 2:05 PM", "5.2": "Tue 2:08 PM", "5.3": "Tue 2:10 PM",
    "6.1": "Tue 2:14 PM", "6.2": "Tue 2:15 PM",
    "7.1": "Tue 2:40 PM", "7.2": "Tue 2:42 PM",
    "8.1": "Wed 7:30 AM", "8.2": "Wed 7:32 AM", "8.3": "Wed 7:45 AM",
    "arch": "", "close": "",
  };

  /* Leading persona for each chapter. */
  const CHAPTER_PERSONA = { "1": "pm", "2": "rd", "3": "cj", "4": "cj", "5": "it", "6": "it", "7": "it", "8": "cj" };
  const PERSONA_LABELS = { pm: "Project Manager", rd: "Regional Director", cj: "CJ Bailey", it: "IT" };
  const PERSONA_COLORS = { pm: "#C50A1D", rd: "#00346D", cj: "#00346D", it: "#373536" };

  function renderTalk() {
    const s = ALL[state.i];
    const ch = chapterById[s.act];
    const seq = ALL.filter((x) => inPath(x) || x.act === s.act);
    const pos = seq.indexOf(s) + 1;
    const persona = CHAPTER_PERSONA[s.act];
    const clock = CLOCKS[s.id] || "";
    const q = ch && ch.question ? ch.question : "";
    const chLabel = ch && ch.n ? `Chapter ${ch.n} \u00b7 ${ch.title}` : ch ? ch.title : "";
    const notShort = !inPath(s) && s.act !== "hero" && s.act !== "today" && s.act !== "arch" && s.act !== "close";

    talk.innerHTML = `
      <div class="tk-l">
        <div class="tk-act">
          ${chLabel ? `<span class="tk-ch">${esc(chLabel)}</span>` : ""}
          ${q ? `<span class="tk-q">\u201c${esc(q)}\u201d</span>` : ""}
          ${notShort ? '<span class="tk-off">Full run only</span>' : ""}
        </div>
        <div class="tk-title">${/^\d/.test(s.id) ? `<span class="tk-id">${s.id}</span>` : ""}${esc(s.title)}</div>
        ${NOTES ? `<div class="tk-say">${esc(NOTES[s.id] || "")}</div>` : ""}
      </div>
      <div class="tk-r">
        <div class="tk-chips">
          ${persona ? `<span class="chip-persona" style="--pc:${PERSONA_COLORS[persona]}">${esc(PERSONA_LABELS[persona])}</span>` : ""}
          ${clock ? `<span class="chip-clock">\u23f1 ${esc(clock)}</span>` : ""}
          ${(s.powered || []).map((p) => `<span class="chip">${esc(p)}</span>`).join("")}
        </div>
        <div class="tk-nav">
          <div class="seg"><button data-path="short" class="${state.path === "short" ? "on" : ""}">Short path</button><button data-path="full" class="${state.path === "full" ? "on" : ""}">Full run</button></div>
          ${NOTES ? `<button class="ghost ${document.body.classList.contains("notes-off") ? "" : "on"}" id="btnNotes" title="Show or hide presenter notes (N)">Notes</button>` : ""}
          <button class="ghost" id="btnReset" title="Replay this step (R)">Reset</button>
          <span class="tk-sep"></span>
          <button class="ghost" id="btnPrev" ${state.i === 0 ? "disabled" : ""}>\u2190 Back</button>
          <span class="tk-pos">${pos} / ${seq.length}</span>
          <button class="primary" id="btnNext" ${nextIndex() < 0 ? "disabled" : ""}>Next \u2192</button>
        </div>
      </div>`;
    $("btnPrev").onclick = prev;
    $("btnNext").onclick = next;
    $("btnReset").onclick = () => go(state.i);
    if (NOTES) $("btnNotes").onclick = () => { document.body.classList.toggle("notes-off"); $("btnNotes").classList.toggle("on"); };
  }

  function nextIndex() {
    for (let j = state.i + 1; j < ALL.length; j++) {
      const s = ALL[j];
      if (s.act === ALL[state.i].act || inPath(s)) return j;
    }
    return -1;
  }
  function prevIndex() {
    for (let j = state.i - 1; j >= 0; j--) {
      const s = ALL[j];
      if (s.act === ALL[state.i].act || inPath(s)) return j;
    }
    return -1;
  }

  /* ------------------------------------------------------------ chapter title card */
  let lastChapter = null;
  function maybeShowChapterCard(s) {
    const ch = chapterById[s.act];
    if (!ch || !ch.n || ch.id === lastChapter) return;
    lastChapter = ch.id;
    const card = $("chapterCard");
    card.hidden = false;
    card.innerHTML = `<div class="cc-inner"><div class="cc-n">Chapter ${esc(ch.n)}</div><div class="cc-title">${esc(ch.title)}</div><div class="cc-q">\u201c${esc(ch.question)}\u201d</div></div>`;
    card.classList.add("show");
    setTimeout(() => { card.classList.remove("show"); setTimeout(() => { card.hidden = true; }, 500); }, 2200);
  }

  /* ------------------------------------------------------------ guided taps */
  function applyPulse() {
    left.querySelectorAll(".pulse").forEach((e) => e.classList.remove("pulse"));
    if (!state.pending) return;
    state.pending.names.forEach((n) => left.querySelectorAll(`[data-tap="${n}"]`).forEach((e) => e.classList.add("pulse")));
    const first = left.querySelector(".pulse");
    const desc = left.querySelector(".left-desc");
    if (!first) return;
    left.style.scrollPaddingBottom = `${(desc ? desc.offsetHeight : 0) + 16}px`;
    const lr = left.getBoundingClientRect();
    const r = first.getBoundingClientRect();
    const covered = desc ? desc.getBoundingClientRect().top : lr.bottom;
    if (r.bottom > covered || r.top < lr.top) first.scrollIntoView({ block: "nearest", behavior: "smooth" });
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

    maybeShowChapterCard(s);
    stage.hidden = false;
    page.hidden = true;
    C.reset();
    left.innerHTML = `<div class="left-ui" id="leftUI"></div>${s.desc ? `<div class="left-desc"><div class="ld-h"><span class="ld-k">What\u2019s happening</span><span class="ld-s">Step ${esc(s.id)}</span></div><div class="ld-b"><p class="ld-m">${esc(s.desc)}</p>${s.why ? `<p class="ld-w"><b>Why it matters</b> ${esc(s.why)}</p>` : ""}</div></div>` : ""}`;
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
  function goAct(actId) {
    let j = ALL.findIndex((s) => s.act === actId);
    if (j < 0) j = ALL.findIndex((s) => s.id === actId);
    if (j >= 0) go(j);
  }

  /* ------------------------------------------------------------ controls */
  document.addEventListener("click", (e) => {
    const st = e.target.closest("[data-act]");
    if (st) return goAct(st.dataset.act);
    const p = e.target.closest("[data-path]");
    if (p) {
      state.path = p.dataset.path;
      const cur = ALL[state.i];
      if (cur.act === "hero" || cur.act === "today") return goAct("1");
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
    else if ((e.key === "n" || e.key === "N") && NOTES) $("btnNotes").click();
    else if (e.key === "e" || e.key === "E") { const d = document.querySelector(`.cx-depth button:not(.on)`); if (d) d.click(); }
    else if (e.key === "t" || e.key === "T") goAct("today");
    else if (e.key === "a" || e.key === "A") goAct("arch");
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
  const ARCH_BLOCKS = [
    { col: "SPAR platforms", blocks: [
      { id: "spar", t: "Dash \u00b7 PSA \u00b7 Albi \u00b7 JobSite", s: "SPAR-approved job platforms", d: "Franchises keep their chosen approved platform. MuleSoft reads job and milestone changes from each one with a 5-minute watermark poll, or by webhook where a vendor offers one (to confirm per vendor), so nothing about the franchise\u2019s day changes." },
      { id: "fc", t: "FranConnect", s: "Franchise master", d: "The source of truth for franchise ID, region and state (RD fields to confirm). Cached nightly and used to enrich every job and to route alerts by region." },
    ] },
    { col: "MuleSoft Anypoint \u00b7 CloudHub 2.0", blocks: [
      { id: "sapi", t: "System APIs", s: "One per platform, with its mapping", d: "dash-sapi, psa-sapi, albi-sapi, jobsite-sapi and franconnect-sapi. Each one speaks a single vendor\u2019s API and maps it to the canonical model with DataWeave, so nothing downstream sees vendor formats. Adding a platform means adding one of these." },
      { id: "papi", t: "Process API", s: "job-sync-papi", d: "Runs the 5-minute SLA lane and the 2:00 AM batch, enriches each job from FranConnect, applies the quality rules and writes to 11:11. Built once, reused for every platform." },
      { id: "eapi", t: "Experience API", s: "notification-api", d: "Sends SLA and integration alerts by region, by email to start. Tableau reads the curated views directly, so it doesn\u2019t need an API of its own." },
      { id: "dw", t: "Canonical model", s: "PuroClean job \u00b7 PuroLogic Dates", d: "Every platform\u2019s fields map to PuroClean\u2019s 18 PuroLogic Dates and standard loss types. PuroClean owns the definitions (owner to be agreed); MuleSoft enforces them." },
      { id: "dq", t: "Data quality", s: "Dedupe \u00b7 rules \u00b7 quarantine", d: "Duplicates from multi-location accounts are merged. Records that fail a rule are held back from the dashboards in quarantine.job with a reason code, not silently loaded, and their SLA clocks keep running." },
      { id: "mon", t: "Monitoring + Visualizer", s: "Health \u00b7 alerts \u00b7 tracing", d: "Functional Monitoring checks each connection every 5 minutes. Dashboards, email alerts and tracing (depending on subscription tier) show what failed and where. Visualizer shows the live application network." },
      { id: "apim", t: "API Manager", s: "Policies on inbound calls", d: "Client ID Enforcement, OAuth 2.0 Token Enforcement, JSON Threat Protection and Rate Limiting on every call into PuroClean\u2019s APIs, applied without code changes. Outbound polls use TLS and stored credentials." },
      { id: "exch", t: "Exchange", s: "Catalog + documentation", d: "Every API, the canonical model, the quality rules and the runbooks are documented and discoverable, so the knowledge stays with PuroClean." },
    ] },
    { col: "11:11 SQL Server lake", blocks: [
      { id: "net", t: "Secure connectivity", s: "Private Space + VPN (proposed)", d: "A CloudHub 2.0 Private Space with a site-to-site VPN (or an allowlisted endpoint) into 11:11, designed with Nick. Nothing is exposed publicly." },
      { id: "lake", t: "staging \u00b7 curated \u00b7 quarantine", s: "PuroClean\u2019s environment", d: "MuleSoft upserts into staging and promotes to curated. Quarantine holds failed records with reasons. A small config table maps each franchise to its platform accounts. Credentials and schema stay under PuroClean\u2019s control." },
    ] },
    { col: "Tableau Cloud", blocks: [
      { id: "bridge", t: "Tableau Bridge", s: "Live queries to 11:11", d: "Runs inside the 11:11 network so Tableau Cloud can query the private SQL Server live, without extracts." },
      { id: "sem", t: "Certified data sources", s: "One definition per KPI", d: "One published, certified definition per KPI from the Data Collection sheet, so every dashboard agrees." },
      { id: "rls", t: "Row-level security", s: "By region", d: "One dashboard for CJ and the RDs, each seeing their own region through an entitlement table. RD seats are sized to the license plan." },
      { id: "dash", t: "Dashboards + Pulse", s: "Drill-down and digests", d: "Network to job in three clicks, with benchmarks, data health and Pulse digests." },
    ] },
  ];

  const ANSWERS = [
    { q: "Will franchises have to change anything?", a: "No. They keep Dash, PSA, Albi or JobSite. MuleSoft reads changes on a 5-minute cycle; the franchise sees nothing different." },
    { q: "Will we know before the customer complains?", a: "Yes. A missed SLA triggers an alert in seconds, routed to the right RD by region, with a link to the job in Tableau Mobile." },
    { q: "Can we trust the numbers?", a: "Yes. Duplicates are merged automatically. Bad records are held with a reason, not loaded silently, and the SLA clock keeps running while they\u2019re held." },
    { q: "Can everyone see what matters, at their level?", a: "Yes. One dashboard, row-level security, and three clicks from the network to one job. CJ can ask Tableau Agent and save a new view \u2014 no IT ticket." },
    { q: "Will it hold at 900 locations and new platforms?", a: "Yes. CloudHub 2.0 replicas and Anypoint MQ handle the load. Adding a franchise is configuration; adding a platform is a new System API from an Exchange template." },
    { q: "What happens when something breaks?", a: "MuleSoft retries, then pauses. The watermark holds the position. When the source recovers, it catches up in order. Nothing is lost, and CJ sees it before anyone reports it." },
    { q: "Is it secure, and does it depend on one person?", a: "Yes. API Manager applies four policies to every inbound call. Everything is documented in Exchange. Monitoring and alerts mean no single point of failure." },
    { q: "Will leaders actually use the data every day?", a: "Yes. Pulse sends CJ a morning digest of what changed. She follows an insight to the dashboard, right-clicks a state, and Explain Data shows the driver." },
  ];

  const PAGES = {
    hero: () => `
      <div class="hero">
        <div class="hero-band">
          <img src="assets/pc-logo-white.png" alt="PuroClean" class="hero-logo"/>
          <div class="hero-eyebrow">MuleSoft + Tableau \u00b7 Stage 1</div>
          <h1>${esc(D.meta.title)}</h1>
          <p class="hero-sub">${esc(D.meta.northStar)}</p>
          <div class="hero-paths">
            <button class="primary big" data-path="short">Short path <small>~14 min \u00b7 13 stops</small></button>
            <button class="ghost-light big" data-path="full">Full run <small>~30 min \u00b7 all stops</small></button>
          </div>
        </div>
        <div class="hero-personas">${D.personas.map((p) => `
          <div class="hp-card" data-act="${p.chapters[0]}">
            <div class="hp-avatar" style="--pc:${p.color}">${esc(p.initials)}</div>
            <div class="hp-name">${esc(p.name)}</div>
            <div class="hp-role">${esc(p.role)}</div>
            <div class="hp-org">${esc(p.org)}</div>
            <div class="hp-q">\u201c${esc(p.question)}\u201d</div>
            <button class="ghost small" data-act="${p.chapters[0]}">Start here \u2192</button>
          </div>`).join("")}
        </div>
        <div class="hero-ribbon">
          <div class="ribbon-h">The story \u00b7 Tuesday, Feb 16 through Wednesday morning</div>
          <div class="ribbon-stops">${D.journeyRibbon.map((r) => `
            <div class="rb-stop" data-act="${r.chapter}">
              <div class="rb-time">${esc(r.time)}</div>
              <div class="rb-dot" style="--pc:${(D.personas.find((p) => p.id === r.persona) || {}).color || "#888"}"></div>
              <div class="rb-label">${esc(r.label)}</div>
            </div>`).join("")}
          </div>
        </div>
        <div class="hero-sub-row">
          <button class="ghost" data-go="today">Today vs. MuleSoft \u2192</button>
          <button class="ghost" data-go="arch">Architecture \u2192</button>
        </div>
        <p class="hero-fine">${esc(D.meta.preparedFor)} \u00b7 Presented by ${esc(D.meta.presenter)}<br/><span class="tag">The Paramedics of Property Damage\u00ae</span></p>
      </div>`,

    today: () => `
      <div class="today-page">
        <h2>Today vs. the API-led approach</h2>
        <p class="lede">Why adding a fifth connection doesn\u2019t mean a fifth custom project.</p>
        <div class="today-cols">
          <div class="today-col today-left">
            <div class="today-h">Today</div>
            ${[
              ["Data arrives", "Manually exported or via one-off scripts built per-platform"],
              ["Field names", "Different in every system \u00b7 staff reconcile on spreadsheets"],
              ["Duplicates", "From multi-location accounts \u00b7 cleaned by hand"],
              ["SLA breach", "Shows up in tomorrow\u2019s report"],
              ["Network view", "Doesn\u2019t exist"],
              ["Usable data", "<20\u202f% of franchises"],
              ["Add a platform", "New custom integration project, 6\u201312+ months"],
              ["Add 470 more locations", "At current scale, years of data-cleanup work"],
            ].map(([k, v]) => `<div class="td-row"><div class="td-k">${k}</div><div class="td-v dim">${v}</div></div>`).join("")}
          </div>
          <div class="today-col today-right">
            <div class="today-h">With MuleSoft + Tableau</div>
            ${[
              ["Data arrives", "Every 5 minutes for SLA milestones \u00b7 nightly for everything else \u00b7 no exports"],
              ["Field names", "Mapped once per platform by DataWeave \u00b7 one PuroLogic canonical model downstream"],
              ["Duplicates", "Automatically merged \u00b7 bad records held with a reason code, not silently loaded"],
              ["SLA breach", "Alert in seconds, routed to the right RD \u00b7 job link in Tableau Mobile"],
              ["Network view", "Network to one job in three clicks \u00b7 row-level security for each region"],
              ["Usable data", "Rises as each wave goes live \u00b7 CJ\u2019s own Integrations working KPI"],
              ["Add a platform", "New System API from an Exchange template \u00b7 model, rules, lake, Tableau unchanged"],
              ["Add 470 more locations", "Configuration, not code \u00b7 same replicas handle 900 locations"],
            ].map(([k, v]) => `<div class="td-row"><div class="td-k">${k}</div><div class="td-v ok">${v}</div></div>`).join("")}
          </div>
        </div>
        <div class="today-scale">
          <div class="ts-h">What changes as you scale</div>
          <div class="ts-row"><div class="ts-l">50 locations connected</div><div class="ts-bar"><span style="width:18%"></span></div><div class="ts-v">850 job events / day \u00b7 2 replicas</div></div>
          <div class="ts-row"><div class="ts-l">430 locations (full network)</div><div class="ts-bar"><span style="width:54%"></span></div><div class="ts-v">6,850 / day \u00b7 same 2 replicas</div></div>
          <div class="ts-row"><div class="ts-l">900 locations + storm surge</div><div class="ts-bar"><span class="surge" style="width:100%"></span></div><div class="ts-v">57,200 peak / day \u00b7 autoscales to 4 replicas \u00b7 0 dropped</div></div>
          <div class="ts-note">Volumes illustrative. Pickup time stays under 5\u00bd minutes at every size.</div>
        </div>
        <div class="today-nav">
          <button class="ghost" data-go="hero">\u2190 Back to start</button>
          <button class="primary" data-path="${state.path}" data-go="1">Begin the story \u2192</button>
        </div>
      </div>`,

    arch: () => `
      <div class="arch">
        <h2>How it fits together</h2>
        <p class="lede">Tap any block for what it does.</p>
        <div class="arch-grid">
          ${ARCH_BLOCKS.map((c, ci) => `<div class="arch-col c${ci}"><div class="arch-h">${c.col}</div>${c.blocks.map((b) => `<button class="ab" data-ab="${b.id}"><b>${b.t}</b><small>${b.s}</small></button>`).join("")}</div>${ci < ARCH_BLOCKS.length - 1 ? '<div class="arch-arrow">\u2192</div>' : ""}`).join("")}
        </div>
        <div class="arch-detail" id="archDetail"><b>Tap a block</b><p>Every block here appears in the demo. The right-hand console shows each one working.</p></div>
        <div class="arch-out"><div class="arch-h">Out of Stage 1</div>${D.scope.out.map(([k, v]) => `<div><b>${k}</b><small>${v}</small></div>`).join("")}</div>
      </div>`,

    close: () => `
      <div class="close">
        <h2>Your questions, answered.</h2>
        <p class="lede">Every chapter addressed one question Nick\u2019s team would ask before saying yes.</p>
        <div class="close-answers">
          ${ANSWERS.map((a, i) => `<div class="ca-row"><div class="ca-n">${i + 1}</div><div class="ca-q">\u201c${esc(a.q)}\u201d</div><div class="ca-a">${esc(a.a)}</div></div>`).join("")}
        </div>
        <div class="close-row">
          <div class="waves"><div class="arch-h">Waves</div>
            <div class="wv"><span>Wave 1</span><b>Dash + FranConnect</b><small>target mid-January, earlier if the partner plan allows</small></div>
            <div class="wv"><span>Wave 2</span><b>PSA, Albi, JobSite</b><small>as their data arrives in January and February</small></div>
            <div class="wv"><span>Throughout</span><b>Tableau dashboards</b><small>data health from Wave 1; network views fill in with Wave 2</small></div>
          </div>
          <div class="nexts"><div class="arch-h">Next steps</div><ol>
            <li>Confirm the four SLA milestones and the Stage 1 KPIs</li>
            <li>Agree the canonical model owner</li>
            <li>Design 11:11 connectivity with Nick</li>
            <li>Introduce the implementation partners</li>
            <li>Agree the mutual plan</li></ol></div>
          <div class="presenter"><img src="assets/puroclean-logo.svg" alt="PuroClean"/><b>${esc(D.meta.presenter.split(",")[0])}</b><small>${esc(D.meta.presenter.split(",")[1] ? D.meta.presenter.split(",")[1].trim() : "Solutions Engineer")} \u00b7 Salesforce</small><button class="ghost" data-go="hero">Back to start</button></div>
        </div>
      </div>`,
  };

  function bindPage(name) {
    if (name === "arch") {
      const all = Object.fromEntries(ARCH_BLOCKS.flatMap((c) => c.blocks).map((b) => [b.id, b]));
      page.querySelectorAll(".ab").forEach((b) =>
        b.addEventListener("click", () => {
          page.querySelectorAll(".ab").forEach((x) => x.classList.toggle("on", x === b));
          const x = all[b.dataset.ab];
          $("archDetail").innerHTML = `<b>${x.t}</b><small>${x.s}</small><p>${x.d}</p>`;
        })
      );
    }
    /* today page uses the document-level [data-path] and [data-go] handlers */
  }

  fromHash();
})();
