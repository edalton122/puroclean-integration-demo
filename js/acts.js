/* Storyboard steps. Eight chapters, each answering one question a CIO asks before saying yes.
   Story clock: Tuesday, Feb 16, Central time (the RD in 2.1 and 4.2 is on Pacific time).
   S marks the short-path stops; every chapter gets at least one. */
window.Acts = (function () {
  const D = window.PC, S = window.Screens, C = window.Console;
  const V = D.vendors;
  const code = (s) => `<code>${C.esc(s)}</code>`;
  const pick = (o, keys) => Object.fromEntries(keys.filter((k) => k in o).map((k) => [k, o[k]]));

  /* Ticks every [data-n] number in the left app up (or down) from data-from. Not awaited. */
  function countUp(x, ms = 900) {
    const els = [...document.querySelectorAll("#leftUI [data-n]")].filter((e) => +e.dataset.from !== +e.dataset.n);
    if (!els.length || QUICK) { els.forEach((e) => (e.textContent = (+e.dataset.n).toLocaleString())); return; }
    const t0 = performance.now();
    const tick = () => {
      if (!Run.alive(x.t)) return;
      const k = Math.min(1, Math.max(0, (performance.now() - t0) / ms)), ease = 1 - Math.pow(1 - k, 3);
      els.forEach((e) => { if (e.isConnected) e.textContent = Math.round(+e.dataset.from + (+e.dataset.n - +e.dataset.from) * ease).toLocaleString(); });
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => { if (Run.alive(x.t)) els.forEach((e) => { if (e.isConnected) e.textContent = (+e.dataset.n).toLocaleString(); }); }, ms + 120);
  }

  /* Types text into an element of the left app with a blinking caret. html:true keeps tags whole. */
  const QUICK = /[?&]fast\b/.test(location.search);
  async function typeIn(x, sel, text, opt = {}) {
    const root = document.getElementById("leftUI");
    const el = root && root.querySelector(sel);
    if (!el) return;
    const input = el.tagName === "INPUT" || el.tagName === "TEXTAREA";
    const set = (s) => { if (input) el.value = s; else if (opt.html) el.innerHTML = s; else el.textContent = s; };
    const reveal = () => { if (opt.reveal) root.querySelectorAll(".tw-hold").forEach((h) => h.classList.remove("tw-hold")); };
    if (QUICK) { set(text); reveal(); return; }
    const pane = root.parentElement, desc = pane.querySelector(".left-desc"), box = (opt.show && root.querySelector(opt.show)) || el;
    if (desc && box.getBoundingClientRect().bottom > desc.getBoundingClientRect().top) {
      pane.style.scrollPaddingBottom = `${desc.offsetHeight + 16}px`;
      box.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    const cuts = [];
    for (let i = 0, n = 0; i < text.length;) {
      if (opt.html && text[i] === "<") { i = text.indexOf(">", i) + 1 || text.length; continue; }
      i++; n++;
      if (n % (opt.chunk || 1) === 0 || i === text.length) cuts.push(i);
    }
    el.classList.add("typing");
    for (const c of cuts) {
      set(text.slice(0, c));
      if (input) el.scrollLeft = el.scrollWidth;
      await x.sleep(opt.ms || 30);
    }
    el.classList.remove("typing");
    reveal();
  }

  const chapters = [
    { id: "hero",  n: "",  title: "Overview",    question: "",                                               tip: "Story overview and cast" },
    { id: "today", n: "",  title: "Today",        question: "",                                               tip: "Today vs. the API-led approach" },
    { id: "1",     n: "1", title: "Adoption",     question: "Will franchises have to change anything?",       tip: "The franchise's day doesn't change; MuleSoft picks up the job on its own" },
    { id: "2",     n: "2", title: "Know first",   question: "Will we know before the customer complains?",    tip: "SLA alerts reach the RD in seconds; Tableau Mobile opens the job from the email" },
    { id: "3",     n: "3", title: "Trust",        question: "Can we trust the numbers?",                      tip: "Duplicates merged, bad records held with a reason; usable data tracked as a KPI" },
    { id: "4",     n: "4", title: "See it",       question: "Can everyone see what matters, at their level?", tip: "Network to one job in three clicks; row-level security; Tableau Agent authoring" },
    { id: "5",     n: "5", title: "Scale",        question: "Will it hold at 900 locations and new platforms?", tip: "CloudHub 2.0 replicas, Anypoint MQ, config-driven onboarding, Exchange template" },
    { id: "6",     n: "6", title: "Recovery",     question: "What happens when something breaks?",            tip: "Retries, circuit-breaker, watermark catch-up, monitoring alerts in seconds" },
    { id: "7",     n: "7", title: "Security",     question: "Is it secure, and can the team share the load?", tip: "API Manager policies, Trust Center certs, Exchange-documented runbooks, shared ownership" },
    { id: "8",     n: "8", title: "See it daily", question: "Will leaders actually use the data every day?",  tip: "Tableau morning digest, metric insights, Explain Data \u2013 the dashboard comes to the leader" },
    { id: "arch",  n: "",  title: "Architecture", question: "",                                               tip: "End-to-end reference architecture" },
    { id: "wrap",  n: "",  title: "Recap",        question: "",                                               tip: "The whole story in one view" },
    { id: "close", n: "",  title: "Next Steps",   question: "",                                               tip: "Wave 1 scope and answers to the eight questions" },
  ];

  const datesUpTo = (field) => {
    const out = {};
    for (const m of D.milestones) {
      if (m.value && !["target_start", "started", "target_completion"].includes(m.field)) out[m.field] = m.value;
      if (m.field === field) break;
    }
    return out;
  };

  /* FranConnect is cached nightly, so it isn't on the 5-minute polling loop. */
  const POLLS = [["s-psa", "psa", "s-psa"], ["s-albi", "albi", "s-albi"], ["s-jobsite", "jobsite", "s-jobsite"], ["s-dash", "dash", "s-dash"]];
  const FLOWS = [["s-psa", "proc", "dq", "lake"], ["s-albi", "proc", "dq", "lake"], ["s-jobsite", "proc", "dq", "lake"], ["lake", "tab"]];

  /* What Dash holds at 6:25 AM: no on-site or completion dates yet. */
  const dashSnap = pick(V.dash.payload, ["job_no", "account", "loss_type", "loss_cat", "loss_date", "dispatched_at", "accepted_at", "addr1", "zip", "ins_claim"]);
  const canonSnap = pick(D.canonical, ["job_id", "source_system", "source_job_id", "franchise_id", "region", "state", "loss_type", "loss_category", "date_of_loss", "dispatch", "received_accepted", "carrier_claim"]);

  const dashMap = [
    ["loss_type: \"H2O\"", "loss_type: \"Water\"", "value normalized"],
    ["loss_date (local, -06:00)", "date_of_loss (UTC)", "timezone normalized"],
    ["dispatched_at", "dispatch", ""],
    ["accepted_at", "received_accepted", ""],
    ["account DASH-M-0412/02", "franchise_id KS-0412", "account map + FranConnect"],
  ];

  const dwRows = [
    ["loss_type", '"H2O"', "loss_type", '"Water"'],
    ["loss_date", "06:12-06:00", "date_of_loss", "12:12:00Z"],
    ["dispatched_at", "06:20-06:00", "dispatch", "12:20:00Z"],
    ["accepted_at", "06:24-06:00", "received_accepted", "12:24:00Z"],
    ["account", "DASH-M-0412/02", "franchise_id", "KS-0412"],
    ["(lookup)", "FranConnect", "region \u00b7 state", "Central \u00b7 KS"],
  ];

  const rosetta = (active) => {
    const rows = [
      ["Date of Loss", "date_of_loss"], ["Dispatch", "dispatch"], ["Received/Accepted", "received_accepted"],
      ["Contacted", "contacted"], ["Inspected", "inspected"], ["Started", "started"], ["Target Completion", "target_completion"], ["Loss type", "loss_type"],
    ];
    const vk = ["dash", "psa", "albi", "jobsite"];
    return `<div class="rosetta"><div class="ro-h">Rosetta Stone \u00b7 every platform's fields \u2192 PuroLogic Dates <span class="ill">vendor field names illustrative</span></div>
      <table><thead><tr><th>PuroLogic date</th>${vk.map((k) => `<th class="${k === active ? "on" : ""}">${V[k].name}</th>`).join("")}<th>Canonical</th></tr></thead>
      <tbody>${rows.map(([l, f]) => `<tr class="${f === "started" ? "key" : ""}"><td>${l}</td>${vk.map((k) => `<td class="${k === active ? "on" : ""}"><code>${C.esc(V[k].fields[f])}</code></td>`).join("")}<td><code class="canon">${f}</code></td></tr>`).join("")}</tbody></table></div>`;
  };

  /* Auto-animation: four platforms' loss codes converge on MuleSoft → "Water". ~4 s, no click. */
  async function rosettaAll(t) {
    const vk = ["dash", "psa", "albi", "jobsite"];
    for (const k of vk) {
      const code = V[k].fields.loss_type;
      C.extra({ title: "Every platform \u2192 one record", rows: [
        ["Dash (PuroLogic)",  V.dash.fields.loss_type,    k === "dash" ? "\u2192 \u201cWater\u201d" : ""],
        ["PSA",               V.psa.fields.loss_type,     k === "psa"  ? "\u2192 \u201cWater\u201d" : ""],
        ["Albi",              V.albi.fields.loss_type,    k === "albi" ? "\u2192 \u201cWater\u201d" : ""],
        ["JobSite",           V.jobsite.fields.loss_type, k === "jobsite" ? "\u2192 \u201cWater\u201d" : ""],
        ["PuroLogic (canonical)", '"Water"', "one standard value"],
      ] });
      await new Promise((res) => setTimeout(res, 800));
    }
    /* Final state: all four shown together */
    C.extra({ title: "Every platform \u2192 one record", rows: [
      ["Dash (PuroLogic)",  V.dash.fields.loss_type,    '\u2192 "Water"'],
      ["PSA",               V.psa.fields.loss_type,     '\u2192 "Water"'],
      ["Albi",              V.albi.fields.loss_type,    '\u2192 "Water"'],
      ["JobSite",           V.jobsite.fields.loss_type, '\u2192 "Water"'],
      ["PuroLogic (canonical)", '"Water"', "one standard value"],
    ] });
  }

  const slaGraph = () => ({
    w: 1000, h: 380,
    groups: [
      { label: "SLA lane \u00b7 every 5 min \u00b7 4 SLA milestones (illustrative, to confirm with CJ)", x: 4, y: 6, w: 992, h: 170 },
      { label: "Daily lane \u00b7 2:00 AM batch \u00b7 everything else", x: 4, y: 196, w: 992, h: 170 },
    ],
    nodes: [
      { id: "m1", label: "Dispatch", x: 40, y: 34, w: 170, h: 28, kind: "src" },
      { id: "m2", label: "Received/Accepted", x: 40, y: 68, w: 170, h: 28, kind: "src" },
      { id: "m3", label: "Contacted", x: 40, y: 102, w: 170, h: 28, kind: "src" },
      { id: "m4", label: "Inspected", x: 40, y: 136, w: 170, h: 28, kind: "src" },
      { id: "fast", label: "job-sync-papi", sub: "SLA lane \u00b7 poll every 5 min", x: 380, y: 72, w: 190, h: 56, kind: "proc" },
      { id: "rule", label: "SLA rules", sub: "Contacted \u2264 30 min", x: 620, y: 72, w: 140, h: 56, kind: "proc" },
      { id: "lake1", label: "11:11 curated.job_milestone", x: 800, y: 72, w: 180, h: 56, kind: "store" },
      { id: "d1", label: "FranConnect franchises", x: 40, y: 224, w: 170, h: 28, kind: "src" },
      { id: "d2", label: "Other PuroLogic Dates", x: 40, y: 258, w: 170, h: 28, kind: "src" },
      { id: "d3", label: "Closures \u00b7 invoicing", x: 40, y: 292, w: 170, h: 28, kind: "src" },
      { id: "d4", label: "Job details", x: 40, y: 326, w: 170, h: 28, kind: "src" },
      { id: "batch", label: "job-sync-papi", sub: "nightly batch \u00b7 2:00 AM", x: 380, y: 262, w: 190, h: 56, kind: "proc" },
      { id: "lake2", label: "11:11 curated tables", x: 800, y: 262, w: 180, h: 56, kind: "store" },
    ],
    edges: [
      ["m1", "fast"], ["m2", "fast"], ["m3", "fast"], ["m4", "fast"], ["fast", "rule"], ["rule", "lake1"],
      ["d1", "batch"], ["d2", "batch"], ["d3", "batch"], ["d4", "batch"], ["batch", "lake2"],
    ],
  });

  /* Tableau query path. */
  const tabGraph = (who = "CJ \u00b7 browser") => ({
    w: 1000, h: 330,
    groups: [
      { label: "PuroClean data lake (11:11)", x: 4, y: 6, w: 420, h: 316 },
      { label: "Tableau Cloud", x: 440, y: 6, w: 440, h: 316 },
    ],
    nodes: [
      { id: "mule", label: "MuleSoft sync", sub: "SLA lane \u00b7 every 5 min", x: 20, y: 60, w: 150, h: 52, kind: "sys" },
      { id: "fcref", label: "Entitlements", sub: "ref.user_region", x: 20, y: 220, w: 150, h: 52, kind: "sys" },
      { id: "views", label: "11:11 curated views", sub: "v_open_jobs \u00b7 job_milestone", x: 220, y: 130, w: 190, h: 70, kind: "store" },
      { id: "bridge", label: "Tableau Bridge", sub: "live queries", x: 452, y: 135, w: 110, h: 60, kind: "proc" },
      { id: "sem", label: "Certified data source", sub: "one KPI definition", x: 590, y: 60, w: 150, h: 52, kind: "proc" },
      { id: "rls", label: "Row-level security", sub: "USERNAME() \u2192 region", x: 590, y: 220, w: 150, h: 52, kind: "proc" },
      { id: "tabd", label: "Dashboard", sub: "Network Operations", x: 760, y: 130, w: 110, h: 70, kind: "viz" },
      { id: "user", label: who, x: 892, y: 140, w: 104, h: 50, kind: "src" },
    ],
    edges: [["mule", "views"], ["fcref", "views"], ["views", "bridge"], ["bridge", "sem"], ["bridge", "rls"], ["sem", "tabd"], ["rls", "tabd"], ["tabd", "user"]],
  });

  const scaleGraph = (idx, surge) => {
    const s = D.scale[idx];
    const w = surge ? s.surge : s.replicas;
    const nodes = [
      { id: "src", label: "4 SPAR System APIs", sub: "polled once per cycle", x: 20, y: 150, w: 170, h: 64, kind: "sys" },
      { id: "q", label: "Anypoint MQ", sub: surge ? "absorbing 4x spike" : "buffers bursts", x: 240, y: 150, w: 160, h: 64, kind: surge ? "proc warn" : "proc" },
      { id: "lake", label: "11:11 SQL Server", sub: "curated", x: 790, y: 150, w: 190, h: 64, kind: "store" },
    ];
    [0, 1, 2, 3].forEach((i) => {
      const on = i < w, extra = i >= s.replicas;
      nodes.push({ id: "w" + i, label: `Replica ${i + 1}`, sub: on ? (extra ? "autoscaled \u00b7 job-sync-papi" : "job-sync-papi") : "added only in a surge", x: 470, y: 22 + i * 84, w: 220, h: 54, kind: on ? (extra ? "proc new" : "proc") : "proc dim" });
    });
    const edges = [["src", "q"]];
    [0, 1, 2, 3].forEach((i) => edges.push(["q", "w" + i], ["w" + i, "lake"]));
    if (surge) {
      nodes.push({ id: "notify", label: "notification-api", sub: "Experience API \u00b7 storm alert", x: 790, y: 262, w: 190, h: 56, kind: "exp dim" });
      edges.push(["w3", "notify"]);
    }
    return { w: 1000, h: 360, compact: true, groups: [{ label: "CloudHub 2.0 \u00b7 Process API replicas + autoscaling", x: 220, y: 4, w: 500, h: 350 }], nodes, edges };
  };

  const pulseGraph = () => ({
    w: 1000, h: 220,
    nodes: [
      { id: "views", label: "11:11 curated views", sub: "refreshed by MuleSoft", x: 20, y: 80, w: 180, h: 60, kind: "store" },
      { id: "sem", label: "Tableau metric", sub: "Jobs by franchise, West Region", x: 250, y: 80, w: 170, h: 60, kind: "proc" },
      { id: "ins", label: "Tableau insights", sub: "trend \u00b7 unexpected values \u00b7 drivers", x: 470, y: 80, w: 190, h: 60, kind: "viz" },
      { id: "dig", label: "Jordan\u2019s digest", sub: "email \u00b7 Tableau Mobile \u00b7 7:30 AM PT", x: 720, y: 80, w: 170, h: 60, kind: "src" },
    ],
    edges: [["views", "sem"], ["sem", "ins"], ["ins", "dig"]],
  });

  const policyGraph = () => {
    const P = D.security.policies;
    const short = (p) => p.replace(" Enforcement", "").replace(" Token", "").replace("JSON ", "");
    const sub = (p) => (p.startsWith("JSON") ? "JSON policy" : "API Manager policy");
    const nodes = [{ id: "req", label: "Inbound call", sub: "webhook or app", x: 10, y: 60, w: 120, h: 56, kind: "src" }];
    P.forEach((p, i) => nodes.push({ id: "p" + i, label: short(p), sub: sub(p), x: 150 + i * 145, y: 60, w: 130, h: 56, kind: "proc" }));
    nodes.push({ id: "api", label: "psa-sapi", sub: "System API \u00b7 webhook", x: 150 + P.length * 145, y: 60, w: 120, h: 56, kind: "sys" });
    const ids = nodes.map((n) => n.id);
    return { w: 1000, h: 140, groups: [{ label: "Anypoint API Manager \u00b7 policies on every inbound call, no code changes", x: 140, y: 6, w: 600, h: 126 }], nodes, edges: ids.slice(1).map((b, i) => [ids[i], b]), _ids: ids };
  };

  const scalePanel = (idx, surge) => {
    const s = D.scale[idx];
    const q = surge ? 78 : 4 + idx * 3;
    return `<div class="sc-panel">
      <div class="sc-meters">
        <div><div class="sc-l">Job updates / day</div><div class="sc-v">${(surge ? s.peak : s.events).toLocaleString()}</div></div>
        <div><div class="sc-l">Anypoint MQ depth</div><div class="meter"><span style="width:${q}%" class="${surge ? "warn" : ""}"></span></div><div class="sc-s">${surge ? "surge \u00b7 draining in ~6 min" : "steady"}</div></div>
        <div><div class="sc-l">SLA-lane pickup</div><div class="sc-v ok">${s.latency}</div><div class="sc-s">max ~5.5 min \u00b7 inside the 30-min SLA</div></div>
      </div>
      <div class="sc-note">Same APIs, same canonical model, same 11:11 tables at every size. <span class="ill">volumes illustrative</span></div>
    </div>`;
  };

  const lineageTable = (n) => {
    const rows = [
      ["Business KPI", "On-time completion", "CJ's Data Collection sheet"],
      ["Tableau measure", "On-Time Completion % (certified data source)", "definition illustrative"],
      ["Canonical field", "majority_completion \u2264 target_completion", "curated.job_milestone \u00b7 PuroLogic Dates"],
      ["Source field", "Dash est_complete \u00b7 PSA TargetCompDT \u00b7 Albi targetCompletion \u00b7 JobSite target_done", "illustrative"],
      ["API endpoint", "each platform's change feed, e.g. PSA GET /api/Jobs/Changes", "illustrative"],
    ];
    return `<div class="lin"><div class="lin-h">Documented lineage \u00b7 tile \u2192 Tableau \u2192 MuleSoft \u2192 platform</div>
      ${rows.slice(0, n).map((r, i) => `<div class="lin-row"><div class="lin-k">${r[0]}</div><div class="lin-v">${C.esc(r[1])}</div><div class="lin-s">${r[2]}</div></div>${i < n - 1 ? '<div class="lin-arrow">\u2193</div>' : ""}`).join("")}</div>`;
  };

  const linCard = (title, rows, note) => `<div class="lin"><div class="lin-h">${title}</div>
    ${rows.map((r, i) => `<div class="lin-row"><div class="lin-k">${r[0]}</div><div class="lin-v">${r[1]}</div><div class="lin-s">${r[2]}</div></div>${i < rows.length - 1 ? '<div class="lin-arrow">\u2193</div>' : ""}`).join("")}
    ${note ? `<div class="lin-row note"><div class="lin-k">${note[0]}</div><div class="lin-v">${note[1]}</div><div class="lin-s">${note[2]}</div></div>` : ""}</div>`;

  /* Tableau round trip: query travels right-to-left, results travel back. */
  async function query(x, path, opt) {
    const N = (a, b) => C.narrate(a, b, x.t);
    const back = path.slice().reverse();
    C.ring(path[0]);
    await C.packet(path, x.t, { kind: "q", dur: 380, finalState: "active" });
    C.tag(back[0], opt.rows, "ok");
    await N(opt.sql, opt.exec);
    await C.packet(back, x.t, { kind: "res", dur: 380 });
    C.tag(path[1], opt.ms, "");
  }

  /* ================================================================ steps */
  const steps = [
    { id: "hero",  act: "hero",  layout: "full", short: true,  title: "Corporate visibility into every franchise job", page: "hero", powered: [] },
    { id: "today", act: "today", layout: "full", short: true,  title: "Today vs. the API-led approach", page: "today", powered: [] },

    /* ---------- Chapter 1: Adoption */
    {
      id: "1.1", act: "1", short: true, title: "A new water loss in Dash",
      desc: "A water-damage job is dispatched to PuroClean Wichita East. The project manager logs it in Dash, the job app they already use, and accepts it, recording the dispatch and acceptance times exactly as they do today.", why: "Franchises don't change tools or add steps. MuleSoft picks up the change on its own, which is what makes high adoption realistic.",
      powered: ["Franchise's SPAR platform", "No change for the franchise"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        const logged = { date_of_loss: "6:12 AM", dispatch: "6:20 AM" };
        x.left(S.jobApp({ isNew: true, pickLoss: true, dates: logged, actions: [{ label: "Save" }], clock: "6:21 AM" }));
        C.graph(C.baseGraph()); C.tab("flow"); C.setClock("06:21:10");
        C.caption("MuleSoft checks each SPAR platform for new and changed jobs every 5 minutes (polling shown; webhooks where a vendor offers them).");
        C.ambient(x.t, POLLS, { every: 520 });
        C.clock([{ l: "Polls today", n: 308, v: "{n}", s: "4 SPAR platforms" }, { l: "SLA lane", v: "every 5 min", s: "4 SLA milestones (illustrative)" }, { l: "Connections", v: "5", s: "4 SPAR + FranConnect", state: "ok" }, { l: "Before MuleSoft", v: "Dash every ~2 hrs", s: "for comparison" }]);
        await N("job-sync-papi \u00b7 scheduler */5 \u00b7 4 SPAR System APIs \u00b7 GET ?updated_since={watermark}", "MuleSoft checks every platform for changes");
        C.caption("This is Dash, your PuroLogic job page, the app Alex already uses every day. Pick Water as the loss type.");
        await x.tap("loss");
        x.left(S.jobApp({ isNew: true, dates: logged, flash: "loss", actions: [{ label: "Save", tap: "save" }], clock: "6:21 AM" }));
        C.ring("dash"); C.tag("dash", "loss_type \"H2O\"", "");
        await N("Dash \u00b7 new job form \u00b7 Loss type Water \u00b7 stored by Dash as loss_type \"H2O\" (illustrative code)", "Dash stores Water in its own code; MuleSoft translates it later");
        C.caption("Click Save. Nothing about the franchise\u2019s workflow changes.");
        await x.tap("save");
        x.left(S.jobApp({ dates: logged, actions: [{ label: "Accept job", tap: "accept" }], clock: "6:21 AM" }));
        C.ring("dash"); C.node("dash", "active"); C.tag("dash", "INSERT D-889214", "new");
        await N("Dash \u00b7 INSERT job D-889214 \u00b7 updated_at 12:21:30Z > watermark 12:20:00Z \u2192 picked up by the 12:25 poll", "The job is saved in Dash; MuleSoft will see it on the next cycle");
        C.clock([{ l: "Polls today", n: 308, v: "{n}", s: "4 SPAR platforms" }, { l: "Changed in Dash", n: 1, v: "{n} job", state: "run" }, { l: "Connections", v: "5", s: "4 SPAR + FranConnect", state: "ok" }, { l: "Next Dash poll", v: "6:25 AM" }]);
        C.caption("Click Accept job. Acceptance is what starts the customer-contact clock.");
        await x.tap("accept");
        x.left(S.jobApp({ dates: datesUpTo("received_accepted"), flash: "received_accepted", clock: "6:24 AM" }));
        C.ring("dash"); C.tag("dash", "accepted_at", "new");
        await N("Dash \u00b7 UPDATE D-889214 SET accepted_at 12:24:00Z \u00b7 same poll window", "The franchise accepts the dispatched job");
        await C.log([{ lvl: "info", at: "06:24:00", raw: "Dash \u00b7 job D-889214 accepted (franchise side) \u00b7 dispatch and accept times set", exec: "The franchise accepted the dispatched job" }], x.t);
        C.clock([{ l: "Polls today", n: 308, v: "{n}", s: "4 SPAR platforms" }, { l: "Changed in Dash", n: 1, v: "{n} job \u00b7 3 dates", state: "run" }, { l: "Connections", v: "5", s: "4 SPAR + FranConnect", state: "ok" }, { l: "Next Dash poll", v: "6:25 AM", state: "run" }]);
      },
    },
    {
      id: "1.2", act: "1", short: true, title: "MuleSoft picks it up and translates it",
      desc: "On its next 5-minute check, MuleSoft reads the new job from Dash and translates its field names, codes and time zones into PuroClean's standard job format, then attaches the franchise's region from FranConnect.", why: "Each translation is built once per platform, centrally. Corporate never re-keys or hand-cleans franchise data.",
      powered: ["MuleSoft Anypoint", "System + Process APIs", "DataWeave", "FranConnect reference"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        const dates = datesUpTo("received_accepted");
        const app = (tapF, mapped) => x.left(S.jobApp({ dates, tapF, mapped, clock: "6:25 AM" }));
        app("loss", []);
        C.graph(C.baseGraph()); C.tab("flow"); C.setClock("06:25:00");
        C.caption("The 6:25 poll picks up the job. Click the Loss type on the Dash job to see how MuleSoft reads and translates it.");
        C.ambient(x.t, POLLS.filter((p) => p[0] !== "s-dash"), { every: 700 });
        C.payload({
          left: { title: "Dash payload (source \u00b7 field names illustrative)", obj: dashSnap, hl: ["loss_type", "loss_date", "dispatched_at", "accepted_at", "account"] },
          right: { title: "PuroClean canonical job (PuroLogic Dates)", obj: canonSnap, hl: ["loss_type", "date_of_loss", "dispatch", "received_accepted", "franchise_id", "region", "state"] },
          map: dashMap,
        });
        await x.tap("f-loss");
        await C.packet(["s-dash", "dash"], x.t, { kind: "q", dur: 420, finalState: "active" });
        C.tag("dash", "200 OK \u00b7 1 changed \u00b7 184 ms", "ok");
        await N("dash-sapi \u00b7 GET /v2/jobs?updated_since=12:20:00Z \u2192 200 \u00b7 1 record \u00b7 184 ms", "Dash's connector found 1 new job");
        await C.packet(["dash", "s-dash"], x.t);
        C.tag("s-dash", "dash-to-canonical.dwl v1.3", "");
        const box = await C.transform(dwRows.slice(0, 1), x.t, { script: "dash-sapi \u00b7 codes" });
        await N("dash-sapi \u00b7 DataWeave dash-to-canonical.dwl \u00b7 loss_type \"H2O\" \u2192 \"Water\"", "Dash's code for Water becomes PuroClean's standard value");
        app("accepted", ["loss"]);
        C.caption("Now click Received/Accepted. Dash stores local time; PuroClean stores UTC.");
        await x.tap("f-accepted");
        C.ring("s-dash");
        await C.transform(dwRows.slice(1, 4), x.t, { script: "dash-sapi \u00b7 dates and time zones", into: box.parentElement });
        await N("dash-sapi \u00b7 dash-to-canonical.dwl \u00b7 3 dates \u00b7 America/Chicago (-06:00) \u2192 UTC \u00b7 renamed to PuroLogic Dates", "Three dates renamed and moved to one time zone");
        await C.packet(["s-dash", "proc"], x.t);
        app("franchise", ["loss", "accepted"]);
        C.caption("Finally, click the Franchise. Dash only knows an account number; MuleSoft attaches PuroClean\u2019s franchise and region.");
        await x.tap("f-franchise");
        await C.packet(["fran", "s-fran", "proc"], x.t, { kind: "ref", dur: 420 });
        C.tag("s-fran", "cache hit \u00b7 3 ms", "ok");
        await N("job-sync-papi \u00b7 enrich \u00b7 account DASH-M-0412/02 \u2192 franchise KS-0412 (account map) \u00b7 region Central (illustrative) \u00b7 FranConnect cache", "Matched to PuroClean Wichita East");
        await C.transform(dwRows.slice(4), x.t, { script: "job-sync-papi \u00b7 account map + FranConnect", into: box.parentElement });
        app(null, ["loss", "accepted", "franchise"]);
        C.node("proc", "ok", undefined);
        C.clock([{ l: "Fields mapped", n: 6, v: "{n} / 6", state: "ok" }, { l: "Timezone", v: "America/Chicago \u2192 UTC" }, { l: "Enrichment", v: "KS-0412 \u00b7 Central" }, { l: "Since the poll", n: 27, v: "{n} s", state: "run" }]);
        /* Auto-play Rosetta animation: all four platforms' loss codes converge on one value */
        await rosettaAll(x.t);
      },
    },
    {
      id: "1.3", act: "1", short: false, title: "Into the 11:11 lake, and the SLA clock starts",
      desc: "The finished record lands in PuroClean's 11:11 data lake within the 5-minute cycle (in this run, about a minute and a half after the franchise accepted the job), and an illustrative 30-minute customer-contact clock starts automatically.", why: "If Dash sends the same job again, the record is updated, not duplicated. Corporate now sees the same job the franchise does.",
      powered: ["MuleSoft Database Connector", "11:11 SQL Server lake (Nick's environment)", "Private connection to 11:11"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        const dates = datesUpTo("received_accepted");
        const app = (tapF, mapped) => x.left(S.jobApp({ dates, tapF, mapped, clock: "6:25 AM" }));
        app("address", []);
        C.graph(C.baseGraph()); ["dash", "s-dash", "fran", "s-fran"].forEach((n) => C.node(n, "ok")); C.tab("flow"); C.setClock("06:25:38");
        C.caption("Quality checks, then an upsert into 11:11 over a private connection. Click the Address: it\u2019s part of the duplicate check.");
        C.ambient(x.t, POLLS.filter((p) => p[0] !== "s-dash"), { every: 700 });
        await x.tap("f-address");
        await C.packet(["proc", "dq"], x.t);
        C.tag("dq", "14 / 14 rules \u2713 \u00b7 no duplicate", "ok");
        await N("dq \u00b7 14 rules passed \u00b7 dedupe key (address, date_of_loss, carrier_claim) \u00b7 0 matches", "Quality checks passed; not a duplicate");
        app("accepted", ["address"]);
        C.caption("Click Received/Accepted to follow the job\u2019s dates into the 11:11 lake.");
        await x.tap("f-accepted");
        await C.packet(["dq", "lake"], x.t);
        C.ring("lake"); C.tag("lake", "MERGE \u00b7 1 job \u00b7 3 dates", "new");
        await N("11:11 (private link) \u00b7 MERGE staging.job_milestone \u2192 EXEC curated.usp_promote_job", "Written to the PuroClean data lake");
        await C.log([
          { lvl: "sql", raw: code("MERGE staging.job_milestone AS t USING @batch AS s ON t.source_system = s.source_system AND t.source_job_id = s.source_job_id AND t.milestone = s.milestone WHEN MATCHED THEN UPDATE SET t.ts = s.ts WHEN NOT MATCHED THEN INSERT (\u2026) VALUES (\u2026);"), exec: "Written to the data lake" },
          { lvl: "ok", raw: "poll 6:25:00 \u2192 curated 6:25:41 (41 s) \u00b7 accepted 6:24:00 \u2192 curated 1m 41s", exec: "In the lake 41 seconds after MuleSoft picked it up" },
        ], x.t);
        app("path", ["address", "accepted"]);
        C.caption("Click Contacted, the next date due on the Dates tab. Its 30-minute clock is now running on the corporate side too.");
        await x.tap("f-path");
        app(null, ["address", "accepted"]);
        C.clock([{ l: "Poll to lake", n: 41, v: "{n} s", state: "ok" }, { l: "Accept to lake", v: "1m 41s", s: "always inside ~5.5 min" }, { l: "SLA timer", v: "Contacted due 6:54", s: "30 min (illustrative)", state: "run" }, { l: "Write mode", v: "upsert", s: "no duplicates" }]);
        await C.packet(["lake", "tab"], x.t, { kind: "res" });
        C.tag("tab", "visible in Tableau", "ok");
        await N("sla \u00b7 timer started \u00b7 received_accepted 12:24Z \u00b7 contacted due \u2264 12:54Z \u00b7 Tableau reads it live via Bridge (no extract)", "The 30-minute response clock is running (illustrative)");
      },
    },
    {
      id: "1.4", act: "1", short: false, title: "Two lanes: near-real-time and daily",
      desc: "6:41 AM. The project manager contacts the customer the way they normally would: Email from the job, pick the template, send. Logging that email sets Contacted, one of the four milestones tied to customer-response SLAs (illustrative, to confirm with CJ) that sync every five minutes. Everything else, like closures and franchise reference data, syncs once a night.", why: "Nobody types a milestone time; doing the work records it. Real-time effort goes only where the SLA needs it, which keeps the integration fast and inexpensive to run.",
      powered: ["Franchise's SPAR platform", "MuleSoft Scheduler + Batch", "Watermark incremental sync"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        const dates = datesUpTo("received_accepted");
        const app = (activity, extra = {}) => x.left(S.jobApp({ dates, activity, clock: "6:41 AM", ...extra }));
        app({ tap: "email" });
        C.graph(slaGraph()); C.tab("flow"); C.setClock("06:41:00");
        C.caption("6:41 AM. The four SLA milestones ride the 5-minute lane; the rest waits for the 2:00 AM batch.");
        C.ambient(x.t, [["m1", "fast"], ["m2", "fast"], ["m4", "fast"]], { every: 800 });
        C.tag("batch", "idle \u00b7 next run 02:00", "", { stay: true });
        C.clock([{ l: "SLA timer", v: "Contacted due 6:54", state: "run", s: "30 min (illustrative)" }, { l: "SLA lane", v: "every 5 min" }, { l: "Daily lane", v: "2:00 AM" }]);
        await N("job-sync-papi \u00b7 SLA lane \u00b7 cron */5 \u00b7 4 milestones \u00b7 watermark 12:40:00Z", "The fast lane checks the four SLA milestones every 5 minutes");
        C.caption("Click Send Email to contact the customer from the Notes tab.");
        await x.tap("email");
        app({ composer: "pick", tap: "tpl" });
        C.caption("Pick the \u201cInitial contact\u201d template.");
        await x.tap("tpl");
        app({ composer: "filled", blank: true, tap: "send" });
        C.caption("The template fills in the customer, claim and next steps.");
        await typeIn(x, ".ecmp-subj", S.EMAIL_TPL.subject, { ms: 22 });
        await typeIn(x, ".ecmp-body", S.EMAIL_TPL.body, { html: true, ms: 12, chunk: 3 });
        C.caption("Ready to go. Click Send.");
        await x.tap("send");
        x.left(S.jobApp({ dates: datesUpTo("contacted"), activity: { sent: true }, flash: "contacted", clock: "6:41 AM" }));
        C.caption("Sending the email adds it to the job\u2019s Notes and sets Contacted. That change is what MuleSoft picks up.");
        await C.log([{ lvl: "info", at: "06:41:12", raw: "Dash \u00b7 activity EMAIL logged on D-889214 \u00b7 contacted_at = 12:41:12Z (set by the email, not typed)", exec: "The email is logged and Contacted is set automatically" }], x.t);
        C.ring("m3");
        await C.packet(["m3", "fast", "rule", "lake1"], x.t, { onHop: async (b) => { if (b === "rule") C.tag("rule", "17 min \u2264 30 \u2713", "ok"); } });
        await N("job-sync-papi \u00b7 contacted 12:41Z picked up by the 12:45 poll \u00b7 rule CONTACT_30 \u00b7 17 min \u2192 PASS", "Contact time picked up within the cycle; SLA met");
        C.tag("lake1", "UPSERT 1 row", "new");
        C.clock([{ l: "SLA timer", v: "Met \u00b7 17 min", state: "ok", s: "30 min (illustrative)" }, { l: "Pickup", v: "4 min", s: "next 5-minute poll" }, { l: "Daily lane", v: "next run 2:00 AM" }]);
      },
    },
    {
      id: "1.5", act: "1", short: false, title: "Same job, four platforms, one language",
      desc: "Franchises run on four different job apps. The same moment on the job is recorded as 'Started' in Dash, 'First On Site' in PSA, 'Arrive On Site' in Albi and 'Job Began' in JobSite. Click each franchise's app to see MuleSoft map it.", why: "All of them map to the same 18 PuroLogic Dates that PuroClean defines. That shared language is what makes network-wide reporting possible, without asking any franchise to change apps.",
      powered: ["DataWeave", "PuroClean canonical model", "Anypoint Exchange"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        const order = ["dash", "psa", "albi", "jobsite"];
        const show = (vk) => {
          const i = order.indexOf(vk);
          x.left(S.platforms({ active: vk, seen: order.slice(0, i + 1), next: order[i + 1] }));
          C.extra(rosetta(vk));
        };
        const g = C.baseGraph(); g.compact = true;
        C.graph(g); C.tab("flow"); C.setClock("08:05:00");
        C.caption("Each franchise's app labels the same moment differently. Click the next franchise to see it mapped to Started.");
        C.payload({
          sources: ["dash", "psa", "albi", "jobsite"].map((k) => ({ title: `${V[k].name} (illustrative)`, obj: V[k].payload, hl: [V[k].fields.started, V[k].fields.loss_type.split(":")[0]], cls: "src" })),
          right: { title: "PuroClean canonical job (one record)", obj: D.canonical, hl: ["started", "loss_type"] },
          map: ["dash", "psa", "albi", "jobsite"].map((k) => [`${V[k].name} \u00b7 ${V[k].fields.started}`, "started", V[k].labels.started || "already the standard"]),
          mapTitle: "Four platforms, one canonical field",
        });
        show("dash");
        C.tag("s-dash", "job_started \u2192 started", "new", { stay: true, dy: 2 });
        await N("dash-sapi \u00b7 dash-to-canonical.dwl \u00b7 job_started \u2192 started \u00b7 loss_type \"H2O\" \u2192 \"Water\"", "Dash already uses PuroClean's term, Started");
        for (const vk of ["psa", "albi", "jobsite"]) {
          await x.tap("v-" + vk);
          show(vk);
          const f = V[vk].fields;
          await C.packet([vk, "s-" + vk, "proc"], x.t, { dur: 420 });
          C.tag("s-" + vk, `${f.started} \u2192 started`, "new", { stay: true, dy: 2 });
          C.ring("s-" + vk);
          await N(`${vk}-sapi \u00b7 ${vk}-to-canonical.dwl \u00b7 ${f.started} \u2192 started \u00b7 ${f.loss_type} \u2192 "Water"${vk === "albi" ? " \u00b7 epoch ms \u2192 ISO-8601" : ""}`, `${V[vk].name}'s "${V[vk].labels.started}" becomes Started`);
        }
        C.clock([{ l: "Platforms mapped", n: 4, v: "{n} / 4", state: "ok" }, { l: "Canonical fields", v: "18 PuroLogic Dates" }, { l: "Mappings", v: "1 per System API" }, { l: "Process API", v: "1, shared" }]);
      },
    },

    /* ---------- Chapter 2: Know first */
    {
      id: "2.1", act: "2", short: true, title: "Franchise owner texted \u00b7 RD has the job in Tableau Mobile",
      desc: "At 10:02 AM, a Sacramento job passes 30 minutes without a customer contact. Nick already built a text: the franchise owner gets an SMS automatically. The West RD gets an alert, acknowledges it, and opens the job in Tableau Mobile \u2014 all while the customer is still waiting.", why: "Today this shows up in tomorrow\u2019s report. Here, both the owner and the RD know in seconds \u2014 not hours.",
      powered: ["MuleSoft notification-api", "FranConnect region mapping", "Tableau Mobile"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.franchiseSms({ empty: true }));
        const g = C.baseGraph();
        g.nodes.forEach((n) => { if (n.id === "notify") n.kind = "exp"; });
        C.graph(g); C.tab("flow"); C.setClock("10:02:00");
        C.caption("A scheduled SLA check finds a Sacramento job past 30 minutes. Nick already built a text \u2014 the franchise owner is notified automatically.");
        C.ambient(x.t, POLLS, { every: 650 });
        await C.packet(["s-psa", "proc"], x.t);
        C.tag("proc", "CONTACT_30 \u2717 34 min", "err");
        await N("sla-check \u00b7 every minute \u00b7 JOB-CA-11902 \u00b7 received_accepted 15:28Z \u00b7 contacted NULL at +34m (latest PSA poll) \u2192 BREACH", "A Sacramento job missed the 30-minute contact SLA");
        await C.packet(["fran", "s-fran", "proc"], x.t, { kind: "ref", dur: 420 });
        C.tag("s-fran", "CA-0219 \u2192 West \u2192 owner + RD", "");
        await N("route \u00b7 franchise CA-0219 \u2192 owner SMS + region West \u2192 Regional Director (FranConnect) \u00b7 recipient and channel illustrative", "Routed to the franchise owner and the West RD");
        await C.packet(["proc", "notify"], x.t, { kind: "err", finalState: "err" });
        C.tag("notify", "SMS + alert \u00b7 sent", "err");
        x.left(S.franchiseSms({ sms: true }));
        C.extra({ title: "Delivery rules", rows: [
          ["Owner SMS", "Always \u00b7 SLA CONTACT_30 fired", "immediate"],
          ["RD alert", "CONTACT_30 + region routing (FranConnect)", "immediate"],
          ["VP escalation", "If RD does not acknowledge in 15 min", "conditional"],
        ] });
        await N("notification-api \u00b7 POST /alerts \u00b7 sms to owner + email to rd.west \u00b7 202 Accepted \u00b7 412 ms", "The franchise owner gets a text; the RD gets an alert");
        C.caption("Tap the alert to open the job in Tableau Mobile.");
        await x.tap("open");
        C.node("notify", "ok");
        x.left(S.franchiseSms({ sms: true, rdOpen: true }));
        await N("link \u2192 Tableau Cloud \u00b7 Network Operations \u203a JOB-CA-11902 \u00b7 row-level security: West", "The RD opens the job in Tableau Mobile from the alert");
        C.clock([{ l: "Detected", v: "+34 min" }, { l: "Alert sent in", n: 0.4, dec: 1, v: "{n} s", state: "ok" }, { l: "Routed to", v: "Owner + RD" }]);
        C.caption("Tap Acknowledge so the alert doesn\u2019t escalate to the VP.");
        await x.tap("ack");
        x.left(S.franchiseSms({ sms: true, rdAcked: true }));
        await C.packet(["notify", "proc"], x.t, { kind: "res", dur: 380 });
        C.tag("notify", "acknowledged \u00b7 rd.west", "ok");
        await N("notification-api \u00b7 PATCH /alerts/A-20417 status=acknowledged by rd.west \u00b7 escalation to the VP of Operations cancelled", "Acknowledged: the alert stops escalating");
        C.caption("Tap Call franchise. The RD calls Sacramento North while the customer is still waiting.");
        await x.tap("call");
        x.left(S.franchiseSms({ sms: true, rdCalled: true }));
        await C.log([{ lvl: "info", at: "10:06:00", raw: "PSA \u00b7 JOB-CA-11902 \u00b7 franchise logs the customer call \u00b7 ContactDT = 16:06Z", exec: "After the RD's call, the franchise contacts the customer" }], x.t);
        C.setClock("10:10:00");
        await C.packet(["psa", "s-psa", "proc"], x.t, { dur: 420 });
        C.tag("proc", "CONTACT_30 closed \u00b7 38 min", "warn");
        x.left(S.franchiseSms({ sms: true, rdCalled: true, resolved: true }));
        await N("job-sync-papi \u00b7 10:10 PSA poll \u00b7 contacted 16:06Z \u2192 SLA CONTACT_30 closed late at 38 min \u00b7 alert A-20417 resolved \u00b7 Tableau updates live", "The next poll picks up the contact; the alert resolves itself. The owner gets a confirmation text.");
        C.clock([{ l: "Detected", v: "+34 min" }, { l: "Alert sent in", n: 0.4, dec: 1, v: "{n} s", state: "ok" }, { l: "Acknowledged", v: "1 min", state: "ok" }, { l: "Customer contacted", v: "+38 min", state: "warn", s: "4 min after the alert" }]);
      },
    },

    /* ---------- Chapter 3: Trust */
    {
      id: "3.1", act: "3", short: false, title: "Duplicate and incomplete records",
      desc: "Another location under the same Dash account logs a job that's already in the system, and a second job is saved with no loss type. MuleSoft merges the duplicate into the existing record and holds the incomplete one back from the dashboards with a reason, while its SLA clock keeps running.", why: "Bad records never reach the dashboards, nothing is silently thrown away, and each held record is picked up again once it's fixed in Dash.",
      powered: ["DataWeave validation", "MuleSoft error handling", "Quarantine table in 11:11"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        const derby = "PuroClean Wichita East \u00b7 Derby office";
        x.left(S.jobApp({ isNew: true, role: "sync", franchise: derby, dates: { date_of_loss: "6:12 AM", dispatch: "6:20 AM" }, actions: [{ label: "Save", tap: "save" }], clock: "10:11 AM" }));
        const g = C.baseGraph();
        g.nodes.forEach((n) => { if (n.id === "quar") n.kind = "store"; });
        C.graph(g); C.tab("flow"); C.setClock("10:11:00");
        C.caption("The Derby office logs a job the main office already logged at 6:21 AM. Click Save.");
        C.ambient(x.t, POLLS.filter((p) => p[0] !== "s-dash"), { every: 700 });
        await N("Dash \u00b7 account DASH-M-0412 (multi-location) \u00b7 location /01 Derby \u00b7 new job in progress", "A second location is entering the same job");
        await x.tap("save");
        C.ring("dash"); C.tag("dash", "INSERT D-889305", "new");
        await N("Dash \u00b7 INSERT D-889305 \u00b7 same address, date of loss and claim as D-889214 \u00b7 queued for the 10:15 poll", "Saved in Dash; MuleSoft sees it on the next cycle");
        x.left(S.jobApp({ isNew: true, role: "sync", franchise: derby, noLoss: true, address: "1180 S Webb Rd", dates: { date_of_loss: "8:40 AM", dispatch: "8:55 AM", received_accepted: "9:05 AM" }, actions: [{ label: "Save", tap: "save2" }], clock: "10:12 AM" }));
        C.setClock("10:12:00");
        C.caption("Next, a rushed entry with no loss type. Click Save.");
        await x.tap("save2");
        C.ring("dash"); C.tag("dash", "INSERT D-889301", "new");
        await N("Dash \u00b7 INSERT D-889301 \u00b7 loss_type empty \u00b7 Dash accepts it as entered", "Dash accepts it; MuleSoft's quality rules will catch it");
        x.left(S.dashJobs({ tap: true, clock: "10:13 AM" }));
        C.setClock("10:13:00");
        C.caption("The Andover office records an inspection time inline. Click Save.");
        await x.tap("inline-save");
        x.left(S.dashJobs({ saved: true }));
        C.ring("dash"); C.tag("dash", "UPDATE D-889297", "new");
        await N("Dash \u00b7 UPDATE D-889297 SET inspected_at 16:13Z \u00b7 location /03 Andover", "A clean update from a third location");
        C.setClock("10:15:00");
        C.caption("The 10:15 poll picks up the three saves from the multi-location account.");
        await C.packet(["s-dash", "dash"], x.t, { kind: "q", dur: 380, finalState: "active" });
        C.tag("dash", "200 OK \u00b7 3 changed", "ok");
        await N("dash-sapi \u00b7 GET /v2/jobs?updated_since=16:10:00Z \u2192 3 changes on DASH-M-0412", "Three changes picked up from Dash");
        await C.packet(["dash", "s-dash", "proc", "dq"], x.t, { finalState: "warn" });
        C.tag("dq", "DUPLICATE \u00b7 merged", "warn");
        await N("dedupe \u00b7 D-889305 matches JOB-KS-24817 on (address, date_of_loss, carrier_claim) \u00b7 MERGE \u00b7 0 new rows", "Duplicate caught and merged; no double count");
        await C.packet(["dash", "s-dash", "proc", "dq", "quar"], x.t, { kind: "err", finalState: "err" });
        C.tag("quar", "DQ-014 \u00b7 held", "err");
        await N("dq \u00b7 D-889301 \u00b7 DQ-014 loss_type IS NULL \u2192 curated.job dq_status = 'held' + quarantine.job (reason) \u00b7 SLA clock keeps running", "Incomplete job held from the dashboards with a reason; its SLA clock still runs");
        await C.packet(["dash", "s-dash", "proc", "dq", "lake"], x.t);
        C.tag("lake", "UPSERT D-889297", "ok");
        await N("dq \u00b7 D-889297 \u00b7 14/14 pass \u2192 MERGE curated.job \u00b7 1 row", "The clean update loads normally");
        C.payload({
          left: { title: "Incoming D-889301 (Dash \u00b7 illustrative)", obj: { job_no: "D-889301", account: "DASH-M-0412/01", loss_type: "", loss_date: "2027-02-16T08:40:00-06:00", accepted_at: "2027-02-16T09:05:00-06:00" }, hl: ["loss_type"] },
          right: { title: "quarantine.job", obj: { source_job_id: "D-889301", franchise_id: "KS-0412", reason_code: "DQ-014", reason: "loss_type is required", status: "held from dashboards \u00b7 listed on data health", sla_tracking: "on", retry: "on next Dash update" }, hl: ["reason_code", "reason", "status", "sla_tracking"] },
        });
        C.clock([{ l: "Merged", n: 1, v: "{n}", state: "warn" }, { l: "Held", n: 1, v: "{n}", state: "err", s: "SLA still tracked" }, { l: "Loaded", n: 1, v: "{n}", state: "ok" }, { l: "Bad rows on dashboards", n: 0, v: "{n}", state: "ok" }]);
      },
    },
    {
      id: "3.2", act: "3", short: true, title: "Data health: CJ's KPI",
      desc: "CJ's data health dashboard shows the share of franchises with usable data, how many records are being held back, and the top reasons they were held. CJ clicks the top reason to see exactly which franchises' records are held, including a Wichita East job saved at 10:12 AM with no loss type.", why: "Usable data climbs from under 20% as each wave goes live, and CJ can see exactly who to follow up with next.",
      powered: ["Tableau Cloud", "11:11 curated views", "Certified data source"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.tableau("health", { clock: "10:30 AM", tapReason: true }));
        const g = C.baseGraph(); g.compact = true;
        g.nodes.forEach((n) => { if (n.id === "quar") n.kind = "store"; });
        C.graph(g); C.tab("flow");
        C.caption("Data health is computed from the same quality rules MuleSoft enforces.");
        C.ambient(x.t, [["s-psa", "proc", "dq", "lake"], ["s-dash", "proc", "dq", "quar"], ["s-albi", "proc", "dq", "lake"], ["lake", "tab"]], { every: 450 });
        await N("tableau calc \u00b7 Usable Data % = franchises with \u2265 90% complete jobs \u00f7 active franchises", "Usable data is measured per franchise");
        C.tag("quar", "192 held \u00b7 7 days", "err", { stay: true });
        C.tag("lake", "64% usable", "ok", { stay: true });
        await N("SELECT reason_code, COUNT(*) FROM quarantine.job WHERE held_at > DATEADD(day, -7, SYSUTCDATETIME()) GROUP BY reason_code", "Held records, counted by reason for the last 7 days");
        C.caption("Click \u201cMissing loss type\u201d to see which franchises\u2019 records are held.");
        await x.tap("reason");
        x.left(S.tableau("health", { clock: "10:31 AM", drill: "loss", tapRow: true }));
        C.tag("quar", "100 \u00b7 missing loss type", "err", { stay: true });
        C.caption("A filter action: the reason chart filters the held-records sheet to one reason. Click Wichita East.");
        await N("SELECT franchise_id, platform, COUNT(*) FROM quarantine.job WHERE reason_code = 'DQ-014' AND held_at > DATEADD(day, -7, SYSUTCDATETIME()) GROUP BY franchise_id, platform", "Held records for missing loss type, by franchise");
        await x.tap("ks");
        x.left(S.tableau("health", { clock: "10:31 AM", drill: "loss", rec: true, tapShare: true }));
        C.ring("quar");
        await N("SELECT source_job_id, address, held_at FROM quarantine.job WHERE franchise_id = 'KS-0412' AND reason_code = 'DQ-014' \u2192 11 rows \u00b7 includes D-889301 from 10:12 AM", "Wichita East's held jobs, including D-889301, saved at 10:12 AM without a loss type");
        C.caption("Click Share to send this filtered view to the Central RD, who owns the follow-up.");
        await x.tap("share");
        x.left(S.tableau("health", { clock: "10:32 AM", drill: "loss", rec: true, sharing: true }));
        await typeIn(x, ".tv-to", S.SHARE.to, { ms: 26, show: ".tv-sharebox" });
        await typeIn(x, ".tv-msg", S.SHARE.msg, { ms: 20 });
        await x.sleep(250);
        x.left(S.tableau("health", { clock: "10:32 AM", drill: "loss", rec: true, shared: true }));
        C.tag("tab", "shared \u00b7 RD Central", "ok", { stay: true });
        await N("tableau \u00b7 share view Data Health (Reason = DQ-014, Franchise = KS-0412) \u2192 rd.central \u00b7 opens with the same filters \u00b7 row-level security: Central", "The RD gets a link to exactly these records");
        C.extra(linCard('"Franchises with usable data" \u00b7 how it\'s measured', [
          ["Tableau measure", "Usable Data % (certified data source)", "definition illustrative"],
          ["Rule", "franchise has \u2265 90% of jobs with all required PuroLogic Dates + loss type", "illustrative threshold"],
          ["Inputs", "curated.job completeness \u00b7 quarantine.job counts by reason", "11:11"],
        ], ["Also on the sheet", '"Integrations working": CJ\'s addition to the Data Collection KPIs', "confirmed"]));
        C.clock([{ l: "Usable data", n: 64, v: "{n}%", state: "ok", s: "from 19% in Nov" }, { l: "Held (7d)", n: 192, v: "{n}", s: "0.4% of updates" }, { l: "Duplicates merged (7d)", n: 146, v: "{n}" }, { l: "Integrations working", v: "5 / 5", state: "ok" }]);
      },
    },

    /* ---------- Chapter 4: See it */
    {
      id: "4.1", act: "4", short: true, title: "Network to one job",
      desc: "CJ starts at the whole network and clicks down through Kansas and Wichita to a single job and its milestone history. Each click is a live query: SLA milestones are minutes old, everything else is as of the 2:00 AM batch.", why: "Today the SLA report takes CJ two minutes and an RD two hours, and there's no network view at all. Here, anyone with access goes from the network to one job in three clicks.",
      powered: ["Tableau Cloud", "Certified data sources", "Live via Tableau Bridge"],
      async run(x) {
        x.left(S.tableau("network", { tap: true }));
        C.graph(tabGraph()); C.tab("flow"); C.setClock("14:00:00");
        C.caption("Every click is a live query to the 11:11 curated views, through Tableau Bridge.");
        C.ambient(x.t, [["mule", "views"]], { every: 900, kind: "poll" });
        const Q = ["user", "tabd", "sem", "bridge", "views"];
        const clk = (ms, rows) => C.clock([{ l: "Query time", n: ms, v: "{n} ms", state: "ok" }, { l: "Rows", n: rows, v: "{n}" }, { l: "Freshness", v: "SLA 4 min", s: "rest as of 2:00 AM" }, { l: "Measure", v: "Open Jobs", s: "certified" }]);
        await query(x, Q, { rows: "51 rows", ms: "288 ms", sql: "SELECT state, COUNT(*) FROM curated.v_open_jobs GROUP BY state \u2192 51 rows \u00b7 288 ms", exec: "Open jobs for every state, in 0.3 seconds" });
        clk(288, 51);
        await x.tap("KS");
        x.left(S.tableau("kansas", { tap: true }));
        await query(x, Q, { rows: "4 rows", ms: "142 ms", sql: "\u2026 WHERE state = 'KS' GROUP BY loss_type \u2192 4 rows \u00b7 142 ms", exec: "Kansas: 47 open jobs by loss type" });
        clk(142, 4);
        await x.tap("Water");
        x.left(S.tableau("wichita", { tap: true }));
        await query(x, Q, { rows: "11 rows", ms: "97 ms", sql: "\u2026 WHERE metro = 'Wichita' AND loss_type IN ('Water','Fire') \u2192 11 rows \u00b7 $80.4K", exec: "Wichita area: 11 water and fire jobs, $80.4K estimated" });
        clk(97, 11);
        await x.tap("job");
        x.left(S.tableau("job"));
        await query(x, Q, { rows: "8 rows", ms: "31 ms", sql: "SELECT milestone, ts FROM curated.job_milestone WHERE job_id = 'JOB-KS-24817' \u2192 8 rows \u00b7 31 ms", exec: "One job's PuroLogic Dates, from Dash via MuleSoft" });
        clk(31, 8);
      },
    },
    {
      id: "4.2", act: "4", short: false, title: "Same dashboard, the regional director's view",
      desc: "A regional director, on Pacific time, opens the exact same dashboard. Row-level security filters it to their own region automatically. The RD then clicks Subscribe & create alert, which sets up two automations: a weekly digest, and an alert that fires if on-time completion drops below 80%.", why: "One dashboard serves corporate and every region: no copies, no exports, and no one sees data they shouldn't.",
      powered: ["Tableau row-level security", "Entitlement table in 11:11", "Tableau subscriptions"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.tableau("rd"));
        const g = tabGraph("RD West \u00b7 browser");
        C.graph(g); C.tab("flow"); C.setClock("14:03:00");
        C.caption("Same dashboard, same query. Row-level security adds the region filter for this user.");
        C.ambient(x.t, [["mule", "views"], ["fcref", "views"]], { every: 900 });
        C.ring("user");
        await N("auth \u00b7 rd.west (illustrative) \u00b7 Tableau Cloud SSO \u00b7 entitlement ref.user_region \u2192 West", "Signed in as the West Region RD");
        await C.packet(["fcref", "views", "bridge", "rls"], x.t, { kind: "ref", dur: 420 });
        C.tag("rls", "region = 'West'", "new", { stay: true });
        await N("data source filter [Username] = USERNAME() \u2192 SQL: JOIN ref.user_region u ON u.region = j.region WHERE u.username = 'rd.west@\u2026'", "Only West Region rows are allowed");
        await query(x, ["user", "tabd", "rls", "bridge", "views"], { rows: "137 rows", ms: "164 ms", sql: "v_open_jobs \u2229 region West \u2192 CA 74 \u00b7 OR 19 \u00b7 WA 28 \u00b7 NV 16 = 137", exec: "137 open jobs in the West Region" });
        C.clock([{ l: "States visible", n: 4, v: "{n} of 51" }, { l: "Open jobs", n: 137, v: "{n}", state: "ok" }, { l: "Copies of the dashboard", n: 1, v: "{n}" }]);
        x.left(S.tableau("rd", { tapWatch: true }));
        C.caption("Click Subscribe in the toolbar.");
        await x.tap("watch");
        x.left(S.tableau("rd-subscribe", { tapSub: true }));
        C.ring("tabd");
        await N("RD opens Subscribe \u00b7 weekly digest every Monday 7 AM Pacific \u00b7 plus a data-driven alert: on-time completion (West) < 80%", "The RD sets a weekly digest and an alert threshold");
        C.caption("Click \u201cSubscribe & create alert\u201d to set up the automation.");
        await x.tap("subscribe");
        x.left(S.tableau("rd-subscribed", { tapPreview: true }));
        C.tag("tabd", "1 subscription \u00b7 1 alert", "ok", { stay: true });
        C.caption("Two automations, saved in Tableau Cloud. No code, no IT ticket.");
        C.extra(linCard("Automations created by the RD", [
          ["Subscription", "Network Operations (West) \u00b7 Mondays 7:00 AM PT \u00b7 email", "Tableau subscription"],
          ["Alert trigger", "On-time completion (West) < 80%", "checked hourly on live data"],
          ["Alert action", "Email + Tableau Mobile push to the RD, linked to this view", "data-driven alert"],
        ], ["Row-level security", "The digest and the alert only ever contain West Region data", "same entitlement"]));
        await N("tableau \u00b7 create subscription (weekly \u00b7 Mon 07:00 America/Los_Angeles) \u00b7 create data-driven alert on_time_completion_west < 80 \u00b7 owner rd.west", "Two automations saved in Tableau Cloud");
        C.clock([{ l: "States visible", n: 4, v: "{n} of 51" }, { l: "Open jobs", n: 137, v: "{n}", state: "ok" }, { l: "Automations", n: 2, v: "{n} active", state: "ok" }, { l: "Copies of the dashboard", n: 1, v: "{n}" }]);
        C.caption("Click \u201cPreview alert email\u201d to see what the RD gets when West slips.");
        await x.tap("preview");
        x.left(S.tableau("rd-subscribed", { preview: true }));
        C.tag("tabd", "alert preview \u00b7 fires below 80%", "warn", { stay: true });
        C.caption("If West slips below 80%, the alert reaches the RD by email and Tableau Mobile.");
        await N("hourly alert check \u00b7 on_time_completion_west = 79.4 < 80 \u2192 email + Tableau Mobile to rd.west (preview)", "When West slips below 80%, the RD hears about it first");
      },
    },
    {
      id: "4.3", act: "4", short: false, title: "Benchmarking against the network",
      desc: "One franchise compared with the network average on the KPIs from CJ's list, side by side on one screen.", why: "CJ and the RDs see where a location stands against its peers, using the same certified definitions as corporate.",
      powered: ["Tableau Cloud"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.tableau("bench", { tap: "rank" }));
        const g = tabGraph(); g.compact = true;
        C.graph(g); C.tab("flow"); C.setClock("14:02:00");
        C.caption("Benchmarks only count franchises whose data passes the quality rules.");
        C.ambient(x.t, [["mule", "views"]], { every: 900 });
        const Q = ["user", "tabd", "sem", "bridge", "views"];
        await query(x, Q, { rows: "6 KPIs", ms: "212 ms", sql: "tableau calc \u00b7 { FIXED [Franchise] : AVG([KPI]) } \u00b7 filter usable_data = 1 \u00b7 last 90 days \u2192 network baseline", exec: "Network averages, from franchises with usable data" });
        C.caption("Click the Cycle time row to see where Wichita East ranks.");
        await x.tap("rank");
        x.left(S.tableau("bench", { rank: true, tap: "who" }));
        await query(x, Q, { rows: "275 rows", ms: "96 ms", sql: "tableau calc \u00b7 RANK(AVG([Cycle time]), 'asc') over franchises with usable data \u2192 KS-0412 rank 27 of 275", exec: "Wichita East: 27th fastest of 275 franchises" });
        C.caption("Click \u201cWho\u2019s in the average?\u201d to see which franchises count.");
        await x.tap("who");
        x.left(S.tableau("bench", { rank: true, who: true, tap: "cmp" }));
        C.ring("views");
        await query(x, Q, { rows: "430 rows", ms: "74 ms", sql: "SELECT usable_data, COUNT(*) FROM curated.v_franchise_health GROUP BY usable_data \u2192 275 included \u00b7 155 excluded", exec: "155 franchises are left out until their data passes the quality rules" });
        C.caption("Switch Compare to: Central region, Wichita East\u2019s own region.");
        await x.tap("cmp");
        x.left(S.tableau("bench", { rank: true, who: true, cmp: "central" }));
        await query(x, Q, { rows: "6 KPIs", ms: "118 ms", sql: "\u2026 { FIXED [Region], [KPI] : AVG(...) } WHERE region = 'Central' AND usable_data = 1 \u2192 65 franchises", exec: "Same KPIs, compared with the Central region" });
        C.extra(linCard('"Network average" \u00b7 how it\'s calculated', [
          ["Grain", "per franchise, trailing 90 days", "illustrative"],
          ["Network average", "mean across franchises with usable data", "excludes held records"],
          ["KPIs", "jobs / month \u00b7 cycle time \u00b7 on-time completion \u00b7 backlog \u00b7 rework \u00b7 cancellation", "Data Collection sheet"],
        ], ["Stage 3", "revenue \u00b7 gross margin \u00b7 labor and material % \u00b7 growth trend, with QuickBooks Online", "later"]));
      },
    },
    {
      id: "4.4", act: "4", short: false, title: "KPI lineage: where does this number come from?",
      desc: "CJ asks where the on-time completion number comes from. The Tableau Catalog lineage shows 11:11 upstream and the workbooks downstream. The right side traces it back through MuleSoft to the exact field in each job platform.", why: "When someone asks 'is this number right?', there's a precise answer instead of a debate.",
      powered: ["Tableau Catalog", "Documented lineage", "MuleSoft API catalog in Exchange"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.tableau("lineage", { tap: true }));
        const g = C.baseGraph(); g.compact = true;
        C.graph(g); C.tab("flow"); C.setClock("14:03:00");
        C.caption("Tap the On-time completion tile to trace it backwards.");
        C.extra(lineageTable(0));
        await x.tap("lineage");
        x.left(S.tableau("lineage"));
        const hops = [
          ["tab", "On-Time Completion %", "Tableau measure \u00b7 On-Time Completion % (certified data source)"],
          ["lake", "curated.job_milestone", "canonical \u00b7 majority_completion \u2264 target_completion \u00b7 curated.job_milestone"],
          ["proc", "job-sync-papi", "job-sync-papi \u00b7 enriches and applies the quality rules"],
          ["s-psa", "TargetCompDT", "psa-sapi \u00b7 psa-to-canonical.dwl \u00b7 TargetCompDT \u2192 target_completion"],
          ["psa", "GET /api/Jobs/Changes", "endpoint \u00b7 GET /api/Jobs/Changes (illustrative)"],
        ];
        const path = ["tab", "lake", "dq", "proc", "s-psa", "psa"];
        let i = 0;
        C.ring("tab", "new");
        C.extra(lineageTable(1));
        await N(hops[0][2], "Start at the Tableau measure");
        await C.packet(path, x.t, {
          kind: "trace", dur: 480, edgeState: "ok",
          onHop: async (b) => {
            const h = hops.find((z) => z[0] === b);
            if (!h) return;
            i += 1;
            C.tag(b, h[1], "new", { stay: true });
            C.extra(lineageTable(i + 1));
            await N(h[2]);
          },
        });
        C.tag("tab", "On-Time Completion %", "new", { stay: true });
        C.extra(lineageTable(5));
        x.left(S.tableau("lineage", { tapUp: true }));
        C.caption("From CJ's KPI back to each platform's field. In the Data Guide, click the upstream table.");
        await x.tap("up");
        x.left(S.tableau("lineage", { up: true, tapDown: true }));
        C.ring("lake", "new");
        C.tag("lake", "written by job-sync-papi \u00b7 1:58 PM", "ok", { stay: true, dy: 70 });
        await N("tableau catalog \u00b7 curated.job_milestone \u00b7 columns majority_completion, target_completion \u00b7 upstream writer: MuleSoft job-sync-papi (documented) \u00b7 last write 13:58", "The exact columns behind the KPI, and the MuleSoft API that writes them");
        C.caption("Now click Downstream: what else depends on this number?");
        await x.tap("down");
        x.left(S.tableau("lineage", { up: true, down: true }));
        C.ring("tab", "new");
        C.tag("tab", "6 workbooks \u00b7 3 Tableau metrics", "ok", { stay: true, dy: 70 });
        await N("tableau catalog \u00b7 impact analysis \u00b7 curated.job_milestone \u2192 6 workbooks, 3 Tableau metrics \u00b7 owners listed", "Everything that would be affected if this source changed");
        C.caption("From CJ's KPI, through Tableau and MuleSoft, back to each platform's field and API, and forward to everything that uses it.");
      },
    },
    {
      id: "4.5", act: "4", short: true, title: "Tableau Agent: ask a question, get a view",
      desc: "CJ asks Tableau Agent which West franchises were slowest to first contact last month. The agent builds a bar chart on the certified data source. He drags Loss type onto Color and saves it \u2014 all in the browser, without an extract.", why: "CJ gets a new insight without waiting for IT or building from scratch. Row-level security still applies, and no new pipeline is needed.",
      powered: ["Tableau Agent", "Tableau web authoring", "Certified data source"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.tableau("agent", { step: 0 }));
        const g = tabGraph(); g.compact = true;
        C.graph(g); C.tab("flow"); C.setClock("14:06:00");
        C.caption("CJ opens web authoring on the certified data source and asks Tableau Agent a question.");
        C.ambient(x.t, [["mule", "views"]], { every: 900 });
        C.ring("sem");
        await N("web authoring \u00b7 curated.job_milestone \u00b7 certified data source \u00b7 row-level security still applied", "CJ is in web authoring on the certified data source");
        await x.tap("agent-ask");
        await typeIn(x, ".we-inp", S.AGENT.q, { ms: 34 });
        await x.sleep(300);
        x.left(S.tableau("agent", { step: 1 }));
        await N("Tableau Agent \u00b7 query: 'Which West franchises were slowest to first contact last month?' \u00b7 parsing intent \u2192 Franchise, AVG(minutes to contacted), filter Region = West", "Agent parsed the intent and built the query");
        await C.packet(["user", "sem", "bridge", "views"], x.t, { kind: "q", dur: 420 });
        C.tag("views", "14 West franchises \u00b7 contact speed", "ok");
        await C.packet(["views", "bridge", "sem", "user"], x.t, { kind: "res", dur: 420 });
        x.left(S.tableau("agent", { step: 2, typing: true }));
        await typeIn(x, ".we-built", S.AGENT.built, { ms: 16, reveal: true });
        await N("Agent built a bar chart \u00b7 Franchise on rows \u00b7 Avg minutes to first contact on columns \u00b7 filter Region = West from the question \u00b7 CJ's row-level security: all regions", "The view is ready in the browser");
        await x.tap("agent-drag");
        x.left(S.tableau("agent", { step: 3 }));
        await N("CJ drags Loss type onto Color \u00b7 0 new queries \u00b7 Tableau re-renders from the existing result set", "Loss type by color \u2014 same data, no new query");
        await x.tap("agent-save");
        x.left(S.tableau("agent", { step: 4, typing: true }));
        await typeIn(x, ".we-saved", S.AGENT.saved, { ms: 16 });
        await N("Saved to 'West franchise contact speed' \u00b7 published on the certified data source \u00b7 inherits the same RLS and Bridge connection", "Saved and published \u2014 no new pipeline, no extract");
        C.clock([{ l: "New extracts", n: 0, v: "{n}", state: "ok" }, { l: "New pipelines", n: 0, v: "{n}", state: "ok" }, { l: "Data source", v: "certified" }, { l: "Row-level security", v: "applied", s: "CJ sees all regions" }]);
      },
    },

    /* ---------- Chapter 5: Scale */
    {
      id: "5.1", act: "5", short: true, title: "From 50 locations to 900",
      desc: "The network grows from 50 connected locations to all 430 and then 900, and a hailstorm quadruples job volume for an afternoon. The design stays the same; capacity scales out only when it's needed, and the regional director and local franchise owners get a storm alert.", why: "Growth and storm surges are handled by scaling, not rebuilding. Spikes are queued and drained, so nothing is dropped, and the people on the ground hear about the storm in minutes.",
      powered: ["CloudHub 2.0", "Clustered replicas + autoscaling", "Anypoint MQ", "MuleSoft notification-api"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        let idx = 0, surge = false, amb, prev = null;
        const draw = () => {
          x.left(S.anypointScale(idx, surge, prev));
          countUp(x);
          prev = { idx, surge };
          C.graph(scaleGraph(idx, surge));
          C.extra(scalePanel(idx, surge));
          if (amb) amb.stop();
          const s = D.scale[idx];
          const w = surge ? s.surge : s.replicas;
          const paths = [];
          for (let i = 0; i < w; i++) paths.push(["src", "q", "w" + i, "lake"]);
          amb = C.ambient(x.t, paths, { every: surge ? 90 : [600, 360, 220][idx], dur: 1100, kind: surge ? "hot" : "poll", r: 4, delay: 50 });
          C.clock([{ l: "Locations", n: s.loc, v: "{n}" }, { l: "Replicas", n: w, v: "{n}", state: "ok" }, { l: "Updates / day", n: surge ? s.peak : s.events, v: "{n}", state: surge ? "warn" : "" }, { l: "SLA-lane pickup", v: s.latency, state: "ok" }]);
        };
        C.reset(); C.tab("flow"); C.setClock("14:05:00");
        C.caption("50 first connections: two replicas, mostly idle. Click 430 \u00b7 full network and watch the map, the counters and the chart.");
        draw();
        await N("job-sync-papi \u00b7 2 replicas, clustered (scheduler runs on one) \u00b7 570 open jobs \u00b7 850 updates/day \u00b7 CPU 6% \u00b7 queue depth ~0", "Two replicas for high availability, mostly idle");
        await x.tap("sc-1"); idx = 1; draw();
        C.caption("430 locations: 8\u00d7 the volume on the same two replicas. Only the CPU moves. Click 900 \u00b7 growth.");
        await N("430 locations \u00b7 4,920 open jobs \u00b7 6,850 updates/day (\u00d78) \u00b7 same 2 replicas, CPU 19% \u00b7 no redeploy \u00b7 pickup avg 2m 40s", "8\u00d7 the volume, same two replicas, no redeploy");
        await x.tap("sc-2"); idx = 2; draw();
        C.caption("900 locations: 17\u00d7 the volume. Still two replicas, still no code change. Now turn on Storm surge.");
        await N("900 locations \u00b7 10,290 open jobs \u00b7 14,300 updates/day (\u00d717) \u00b7 still 2 replicas, CPU 34% \u00b7 pickup avg 2m 45s, max ~5.5 min", "17\u00d7 the volume; pickup stays inside the 5-minute cycle");
        await x.tap("surge"); surge = true; draw();
        C.ring("q", "err"); C.ring("w2", "new"); C.ring("w3", "new");
        C.tag("q", "queue depth 78% \u00b7 draining", "warn", { stay: true });
        C.caption("Hailstorm over Dallas\u2013Fort Worth: Anypoint MQ absorbs the spike while CPU autoscaling adds two replicas. Watch the backlog drain.");
        const drain = async () => {
          const q = () => document.querySelector("#leftUI .mon-mq");
          for (let i = 1; i <= 16; i++) {
            await x.sleep(380);
            const el = q(); if (!el) return;
            const left = Math.round(2840 * Math.pow(1 - i / 16, 1.6));
            el.querySelector(".mq-n").textContent = left.toLocaleString();
            el.querySelector(".mq-bar span").style.width = `${Math.max(1, 100 * left / 2840)}%`;
          }
          const el = q(); if (!el) return;
          el.classList.remove("warn"); el.classList.add("ok");
          el.querySelector(".mq-s").textContent = "drained \u00b7 0 dropped";
          const foot = document.querySelector("#leftUI .mon-foot");
          if (foot) foot.textContent = "Backlog drained \u00b7 scales back to 2 replicas after the cooldown";
          const badge = document.querySelector("#leftUI .mon-h .ap-badge");
          if (badge) { badge.textContent = "Cooling down"; badge.classList.replace("warn", "ok"); }
        };
        await Promise.all([drain(), N("surge 4x \u00b7 57,200 updates/day rate \u00b7 Anypoint MQ absorbs the burst \u00b7 CPU autoscaling 2 \u2192 4 replicas \u00b7 drained in ~6 min \u00b7 0 dropped", "The queue absorbs the spike and capacity scales out; nothing is dropped")]);
        C.tag("q", "drained \u00b7 0 dropped", "ok", { stay: true });
        C.caption("The same spike triggers a storm alert. The Process API sees DFW job intake at 4\u00d7 normal, and notification-api tells the people who need to act.");
        await C.packet(["w3", "notify"], x.t, { kind: "hot", finalState: "warn" });
        C.tag("notify", "email \u00b7 RD + 24 DFW owners", "warn", { stay: true });
        await N("job-sync-papi \u00b7 intake by metro \u00b7 DFW 4.1\u00d7 the Tuesday norm (alert at 3\u00d7, illustrative) \u2192 notification-api \u00b7 POST /alerts \u00b7 FranConnect region \u2192 DFW regional director + 24 DFW franchise owners \u00b7 channel email \u00b7 202 Accepted", "A storm alert reaches the DFW regional director and franchise owners");
        C.clock([{ l: "Locations", v: "900" }, { l: "Replicas", v: "4", state: "ok" }, { l: "Storm alert", v: "RD + 24 owners", state: "warn" }, { l: "Dropped", v: "0", state: "ok" }]);
        C.extra(linCard("Storm alert \u00b7 same notification-api as the SLA alerts", [
          ["Detected", "DFW job intake at 4\u00d7 normal", "job-sync-papi \u00b7 threshold illustrative"],
          ["Sent to", "DFW regional director + owners of the 24 DFW locations \u00b7 email: \u201cHail in DFW: job volume 4\u00d7 normal. Plan crews and equipment.\u201d", "FranConnect region \u00b7 illustrative"],
        ], ["After Stage 1", "An AI agent watches the forecast and warns franchises before the hail arrives", "roadmap \u00b7 What\u2019s next"])).querySelector(".lin").scrollIntoView({ block: "start", behavior: "smooth" });
        C.caption("Capacity grew only for the storm, then returns to two replicas, and the people on the ground heard about it in minutes. Same APIs, same canonical model, same 11:11 tables at every size.");
      },
    },
    {
      id: "5.2", act: "5", short: false, title: "Onboarding a franchise is configuration, not code",
      desc: "PuroClean corporate connects a franchise that already exists in FranConnect by mapping its job-platform account. Its open jobs start flowing on the next 5-minute cycle.", why: "Onboarding is configuration, not a development project, so growing to 900 locations doesn't require a bigger team.",
      powered: ["Integration Admin (illustrative)", "Reused System APIs", "Platform account map in 11:11"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.anypointOnboard(0));
        C.graph(C.baseGraph()); C.tab("flow"); C.setClock("14:08:00");
        C.caption("Connecting a franchise adds one row to the platform account map. No deployment. Click + Connect franchise.");
        C.ambient(x.t, POLLS, { every: 650 });
        C.clock([{ l: "Franchises connected", n: 430, v: "{n}" }, { l: "Deployments", n: 0, v: "{n}" }, { l: "Jobs from OH-0731", n: 0, v: "{n}" }]);
        await x.tap("new");
        x.left(S.anypointOnboard(1, { typing: true }));
        await typeIn(x, ".ap-q", "Dayton", { ms: 90 });
        await x.sleep(200);
        x.left(S.anypointOnboard(1));
        C.ring("s-fran", "new");
        await C.packet(["fran", "s-fran"], x.t, { kind: "ref", dur: 420 });
        C.tag("s-fran", "OH-0731 \u00b7 Central \u00b7 Open", "ok");
        await N("franconnect-sapi \u00b7 GET /franchises?q=Dayton \u2192 OH-0731 Dayton North \u00b7 region Central \u00b7 status Open (cached nightly)", "The franchise already exists in FranConnect");
        C.caption("Pick Dayton North from the FranConnect results.");
        await x.tap("pick");
        x.left(S.anypointOnboard(2));
        await C.packet(["s-psa", "psa"], x.t, { kind: "q", dur: 420 });
        C.tag("psa", "account PSA-T-55120 \u00b7 200", "ok");
        await N("psa-sapi \u00b7 GET /accounts/PSA-T-55120 \u2192 200 \u00b7 account exists and PuroClean's corporate access can read it (per vendor, to confirm)", "MuleSoft checks the PSA account before anything is saved");
        C.caption("Click Connect.");
        await x.tap("golive");
        C.ring("lake", "new"); C.tag("lake", "INSERT ref.platform_account", "new");
        await N("ref.platform_account \u00b7 INSERT (OH-0731, PSA, PSA-T-55120) \u00b7 config table in 11:11", "Its PSA account is mapped to the franchise");
        C.ring("s-psa", "new"); C.tag("s-psa", "+ account PSA-T-55120", "new");
        await N("psa-sapi \u00b7 reads the account map each cycle \u00b7 deployments 0", "No code, no deployment");
        x.left(S.anypointOnboard(3));
        C.clock([{ l: "Franchises connected", n: 431, v: "{n}", state: "ok" }, { l: "Deployments", n: 0, v: "{n}", state: "ok" }, { l: "Jobs from OH-0731", n: 0, v: "{n}" }]);
        await C.burst(["psa", "s-psa", "proc", "dq", "lake"], x.t, 8, { gap: 160 });
        C.tag("lake", "+23 jobs \u00b7 OH-0731", "ok");
        await N("psa-sapi \u00b7 first sync OH-0731 \u00b7 23 open jobs \u2192 job-sync-papi \u2192 dq 23/23 \u2192 11:11", "Dayton North's first 23 jobs arrived");
        C.clock([{ l: "Franchises connected", n: 431, v: "{n}", state: "ok" }, { l: "Deployments", n: 0, v: "{n}", state: "ok" }, { l: "Jobs from OH-0731", n: 23, v: "{n}", state: "ok" }]);
      },
    },
    {
      id: "5.3", act: "5", short: false, title: "Add a fifth platform",
      desc: "PuroClean approves a fifth SPAR platform. MuleSoft creates a new System API from the Exchange template and deploys it to a sandbox. The canonical model, quality rules, Process API, data lake and dashboards are reused as they are.", why: "Each new platform becomes a small, predictable piece of work instead of a new integration project.",
      powered: ["Anypoint Exchange", "Anypoint Code Builder", "Runtime Manager", "API-led connectivity"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.anypointExchange(0));
        C.graph(C.baseGraph()); C.tab("flow"); C.setClock("14:10:00");
        C.caption("Stage 1: four SPAR platforms plus FranConnect, each with its own System API. Click the spar-system-api template in Exchange.");
        const amb = C.ambient(x.t, FLOWS, { every: 600 });
        await N("application network \u00b7 5 System APIs \u2192 job-sync-papi \u2192 dq \u2192 11:11 \u2192 Tableau", "Four platforms and FranConnect feed one shared pipeline");
        await x.tap("tpl");
        x.left(S.anypointExchange(1));
        ["s-dash", "s-psa", "s-albi", "s-jobsite"].forEach((n) => C.ring(n));
        await N("exchange \u00b7 spar-system-api v1.0 \u00b7 the pattern all four System APIs share: change-feed polling, watermark, retries, policies \u00b7 depends on puroclean-canonical-job v1.3", "The four existing connectors were built from one pattern");
        C.caption("Click Open in Code Builder.");
        await x.tap("add");
        amb.stop();
        x.left(S.anypointExchange(2, { typing: true }));
        await typeIn(x, ".ex-name", "new-sapi", { ms: 80 });
        x.left(S.anypointExchange(2));
        const g2 = C.baseGraph({
          addNodes: [
            { id: "new", label: "New platform", sub: "5th SPAR option", x: 14, y: 428, w: 118, h: 46, kind: "src new" },
            { id: "s-new", label: "new-sapi", sub: "System API + mapping", x: 186, y: 428, w: 150, h: 46, kind: "sys new" },
          ],
          addEdges: [["new", "s-new"], ["s-new", "proc"]],
        });
        g2.groups[0].h = 476;
        C.graph(g2);
        C.ring("new", "new"); C.ring("s-new", "new");
        await N("code builder \u00b7 new-sapi scaffolded from spar-system-api \u00b7 only new-to-canonical.dwl to write: the new platform's field names \u2192 18 PuroLogic Dates \u00b7 published to Exchange", "One new connector and its mapping, from a template");
        C.caption("The mapping is written and tested. In Runtime Manager, click Deploy Application.");
        await x.tap("deploy");
        x.left(S.anypointExchange(3));
        C.tag("s-new", "CloudHub 2.0 \u00b7 Sandbox", "new", { stay: true, dy: 2 });
        await N("runtime manager \u00b7 deploy new-sapi v1.0 \u2192 CloudHub 2.0 Sandbox \u00b7 API Manager applies the four policies through autodiscovery", "Deployed to a sandbox for testing");
        C.extra(`<div class="exch"><div class="ex-h">Anypoint Exchange</div><div class="ex-a"><b>puroclean-canonical-job</b> v1.3<small>used by 5 System APIs</small></div><div class="ex-a"><b>job-sync-papi</b> v2.0<small>reused</small></div><div class="ex-a"><b>dq-rules-restoration</b> v1.1<small>reused</small></div></div>`);
        await C.packet(["new", "s-new", "proc", "dq", "lake", "tab"], x.t, { kind: "new", onHop: async (b) => { if (["proc", "dq", "lake", "tab"].includes(b)) { C.tag(b, "reused \u00b7 0 changes", "ok", { stay: true }); } } });
        await N("downstream diff \u00b7 job-sync-papi 0 changes \u00b7 dq-rules 0 \u00b7 11:11 schema 0 \u00b7 Tableau 0", "Nothing downstream changed");
        C.clock([{ l: "New", v: "1 System API + mapping", state: "ok" }, { l: "Reused", n: 5, v: "{n} components", s: "model, Process API, rules, lake, Tableau" }, { l: "Downstream changes", n: 0, v: "{n}", state: "ok" }, { l: "Effort", v: "a few weeks", s: "build and test" }]);
        C.ambient(x.t, FLOWS.concat([["s-new", "proc", "dq", "lake"]]), { every: 500 });
      },
    },

    /* ---------- Chapter 6: Recovery */
    {
      id: "6.1", act: "6", short: true, title: "PSA goes down \u00b7 CJ and on-call alerted instantly",
      desc: "PSA, one of the job platforms, starts failing at 2:14 PM. MuleSoft catches it on the first failed poll, retries, then pauses PSA polling. An instant alert fires to CJ and the on-call engineer. New jobs wait in PSA, and the watermark marks exactly where to pick up.", why: "Today if a feed stops, nobody\u2019s told. Here, CJ and on-call know within seconds.",
      powered: ["Anypoint Monitoring", "Functional Monitoring", "Visualizer", "Retries + circuit-breaker pattern"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        const O = D.outage;
        x.left(S.tableau("health-ok"));
        const g = C.baseGraph();
        C.graph(g); C.tab("flow"); C.setClock("14:13:58");
        C.caption("Anypoint Visualizer: the live application network.");
        const amb = C.ambient(x.t, POLLS.slice(), { every: 450 });
        C.clock([{ l: "Functional monitors", v: "5 \u00b7 every 5 min", state: "ok" }, { l: "PSA polls", v: "every 5 min", state: "ok" }, { l: "Lost", n: 0, v: "{n}", state: "ok" }]);
        await N("functional-monitor \u00b7 5/5 checks 200 \u00b7 p95 220 ms", "All five connections healthy");
        await x.sleep(500);
        amb.paths = amb.paths.filter((p) => p[1] !== "psa");
        C.node("psa", "err"); C.ring("psa", "err");
        await C.packet(["s-psa", "psa"], x.t, { kind: "err", finalState: "err", dur: 400 });
        C.tag("psa", "503 Service Unavailable", "err", { stay: true });
        await N("psa-sapi \u00b7 14:14:00 poll \u00b7 GET /api/Jobs/Changes?since=14:13:00Z \u2192 503 Service Unavailable", "The 2:14 PM poll to PSA failed");
        for (const n of [1, 2, 3]) {
          await C.packet(["s-psa", "psa"], x.t, { kind: "err", dur: 300, finalState: "err" });
          C.tag("s-psa", `retry ${n} \u00b7 10 s \u00b7 503`, "warn");
          await x.sleep(250);
        }
        C.node("s-psa", "err"); C.edge("psa", "s-psa", "err");
        await N("psa-sapi \u00b7 3 retries 10 s apart, still 503 \u2192 circuit-breaker pattern OPEN \u00b7 PSA polls paused, probe every 60 s \u00b7 watermark held at 14:13:00Z", "PSA calls paused; MuleSoft knows exactly where to resume");
        C.lane("sys", "err");
        C.node("mon", "err"); C.ring("mon", "err");
        C.tag("s-psa", "watermark held \u00b7 0 lost", "warn", { stay: true, dy: 74 });
        C.extra({ title: "Alert sent to CJ and on-call: psa-sapi (System layer) failing since 2:14 PM", rows: [
          ["Alert channel", "Email \u00b7 Anypoint Monitoring"],
          ["Triggered by", "psa-sapi \u00b7 circuit-breaker OPEN \u00b7 3 \u00d7 503"],
          ["Notified", "CJ Bailey (VP) \u00b7 Integration on-call"],
          ["Jobs lost", "0 \u00b7 watermark held at 14:13:00Z"],
        ] });
        C.clock([{ l: "Functional monitor", v: "PSA failing", state: "err" }, { l: "PSA polls", v: "paused since 2:14", state: "warn" }, { l: "Watermark", v: `held at ${O.watermark}` }, { l: "Lost", n: 0, v: "{n}", state: "ok" }, { l: "Franchises on PSA", n: O.franchises, v: "{n}" }]);
        x.left(S.tableau("health-amber", { tapTile: true }));
        C.caption("PSA is red. Nothing is lost: the jobs wait in PSA. Click the amber Integrations working tile.");
        await N("job-sync-papi \u00b7 ops.integration_status PSA = delayed \u2192 Tableau tile amber \u00b7 alert \u2192 on-call (email)", "CJ's dashboard shows it, and on-call gets an alert");
        await x.tap("tile");
        x.left(S.tableau("health-amber", { clock: "2:15 PM", tile: true, tapPsa: true }));
        await C.packet(["tab", "lake"], x.t, { kind: "q", dur: 380 });
        C.tag("lake", "ops.integration_status", "ok");
        await N("SELECT platform, status, since, watermark, lost FROM ops.integration_status WHERE platform = 'PSA' \u2192 delayed \u00b7 14:14 \u00b7 14:13 \u00b7 0", "The tile reads the status MuleSoft writes: delayed, watermark held, nothing lost");
        C.caption("Click PSA in the integrations strip to see what MuleSoft is doing right now.");
        await x.tap("psa");
        x.left(S.tableau("health-amber", { clock: "2:15 PM", tile: true, psa: true, tapList: true }));
        await C.packet(["s-psa", "psa"], x.t, { kind: "err", dur: 380, finalState: "err" });
        C.tag("s-psa", "probe 2:15 \u00b7 503", "warn");
        await N("psa-sapi \u00b7 circuit open \u00b7 probe GET /api/health 14:15:00 \u2192 503 \u00b7 next probe 14:16:00 \u00b7 polls stay paused", "MuleSoft keeps probing PSA every minute and will resume on its own");
        C.caption(`Click View next to Franchises on PSA to see who is affected.`);
        await x.tap("list");
        x.left(S.tableau("health-amber", { clock: "2:15 PM", tile: true, psa: true, list: true }));
        await C.packet(["tab", "lake"], x.t, { kind: "q", dur: 380 });
        await N(`SELECT a.franchise_id, MAX(j.synced_at) FROM ref.platform_account a JOIN curated.job j ON \u2026 WHERE a.platform = 'PSA' GROUP BY a.franchise_id \u2192 ${O.franchises} franchises`, "CJ knows exactly which franchises are affected before anyone calls");
      },
    },
    {
      id: "6.2", act: "6", short: false, title: "The alert, the trace and the recovery",
      desc: "The on-call owner gets an email alert, opens the trace and sees exactly which call failed and why. When PSA recovers, the next poll catches up everything that changed since 2:13 PM, in order.", why: "Seventeen minutes of outage, zero data lost, and no manual cleanup afterwards.",
      powered: ["Anypoint Monitoring alerts", "Dashboards", "Distributed tracing"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        const O = D.outage;
        x.left(S.failAlert(false));
        C.setClock("14:15:00");
        const dash = (st) => C.monitor(`<div class="mon">
          <div class="mon-h">Anypoint Monitoring \u00b7 psa-sapi <span class="pill ${st === "ok" ? "ok" : "err"}">${st === "ok" ? "Recovered 2:31 PM" : "Alert firing"}</span></div>
          <div class="mon-grid">
            <div class="mon-card"><div class="mc-k">Errors / 5 min</div><svg viewBox="0 0 200 60"><polyline class="draw" points="0,56 40,56 70,56 80,8 100,6 130,7 150,8 ${st === "ok" ? "160,56 200,56" : "170,7 200,6"}" fill="none" stroke="#ff5a62" stroke-width="2.5"/></svg></div>
            <div class="mon-card"><div class="mc-k">Response time (p95)</div><svg viewBox="0 0 200 60"><polyline class="draw" points="0,48 40,46 70,47 80,12 110,10 150,12 ${st === "ok" ? "165,46 200,47" : "200,11"}" fill="none" stroke="#f5b942" stroke-width="2.5"/></svg></div>
            <div class="mon-card biz"><div class="mc-k">PuroClean jobs synced / hour <small>business metric</small></div><svg viewBox="0 0 200 60"><polyline class="draw" points="0,20 40,18 70,19 80,44 120,46 150,45 ${st === "ok" ? "160,6 175,12 200,19" : "200,45"}" fill="none" stroke="#5aa9e6" stroke-width="2.5"/></svg></div>
          </div>
          ${st === "alert" ? "" : `<div class="trace"><div class="mc-k">Trace \u00b7 one failed poll \u00b7 psa-sapi GET /api/Jobs/Changes?since=14:13Z</div>
            ${[["psa-sapi GET /api/Jobs/Changes", 0, 18, "err", "503"], ["retry 1 (10 s)", 20, 6, "warn", "503"], ["retry 2 (10 s)", 30, 10, "warn", "503"], ["retry 3 (10 s)", 46, 14, "warn", "503"], ["polls paused (circuit open)", 62, 26, "info", "held"], ["catch-up poll \u2192 job-sync-papi \u2192 11:11", 90, 10, st === "ok" ? "ok" : "info", st === "ok" ? "200" : "pending"]]
              .map(([l, s, w, c, r], i) => `<div class="tr-row" style="animation-delay:${i * 180}ms"><span class="tr-l">${l}</span><span class="tr-bar"><span class="${c}" style="left:${s}%;width:${w}%"></span></span><span class="tr-r ${c}">${r}</span></div>`).join("")}
          </div>`}</div>`);
        const g = C.baseGraph();
        C.graph(g); C.node("psa", "err"); C.node("s-psa", "err");
        dash("alert"); C.tab("monitor");
        C.caption("The alert names the API, the error, the franchises on PSA and the runbook.");
        C.clock([{ l: "Outage", v: "running", state: "err" }, { l: "Watermark", v: `held at ${O.watermark}` }, { l: "Lost", n: 0, v: "{n}", state: "ok" }]);
        await N("anypoint-monitoring \u00b7 alert psa-sapi error count > 3 in 5 min \u2192 email on-call \u00b7 notification-api adds franchise context", "The on-call owner gets an email");
        C.caption("Tap the alert to open it.");
        await x.tap("openAlert");
        x.left(S.failAlert(true));
        await N(`alert context \u00b7 ${O.franchises} franchises on PSA \u00b7 watermark 14:13:00Z \u00b7 runbook RB-PSA-01`, "The alert explains impact and links the runbook");
        C.caption("Tap Acknowledge so the team knows someone owns it.");
        await x.tap("ack");
        x.left(S.failAlert(true, { acked: true }));
        C.ring("notify");
        await N("notification-api \u00b7 PATCH /alerts/A-20431 status=acknowledged by on-call \u00b7 repeat pages suppressed while acknowledged (illustrative routing rule)", "Acknowledged: no repeat pages while it's being handled");
        C.caption("Tap View trace to see exactly which call failed.");
        await x.tap("trace");
        dash("trace");
        await N("trace \u00b7 correlation-id 7f3c\u2026a91 \u00b7 GET 503 \u2192 3 retries \u2192 polls paused \u00b7 0 data loss", "One failed poll, every hop, in order");
        await x.sleep(1600);
        C.tab("flow"); C.setClock("14:31:00");
        C.caption("2:31 PM: PSA recovers. Polling resumes from the held watermark.");
        await C.packet(["s-psa", "psa", "s-psa"], x.t, { kind: "q", dur: 400 });
        C.node("psa", "ok"); C.node("s-psa", "ok"); C.edge("psa", "s-psa", "ok");
        C.tag("psa", "200 OK \u00b7 polling resumed", "ok", { stay: true });
        await N(`psa-sapi \u00b7 probe 200 \u00b7 circuit CLOSED \u00b7 catch-up GET /api/Jobs/Changes?since=14:13:00Z \u2192 ${O.behind} changes`, "PSA is back; MuleSoft picks up where it left off");
        C.clock([{ l: "Outage", v: "17 min" }, { l: "Caught up", n: O.behind, v: "{n} changes", state: "ok", dur: 2600 }, { l: "Lost", n: 0, v: "{n}", state: "ok" }, { l: "Duplicates", n: 0, v: "{n}", state: "ok" }]);
        await C.burst(["s-psa", "proc", "dq", "lake"], x.t, 12, { gap: 110, kind: "replay" });
        C.tag("lake", `${O.behind} caught up \u00b7 0 lost`, "ok", { stay: true });
        await N(`catch-up \u00b7 ${O.behind} changes \u00b7 ordered by source updated_at \u00b7 idempotent MERGE \u00b7 0 duplicates`, `All ${O.behind} changes loaded; none lost, none doubled`);
        C.ambient(x.t, POLLS, { every: 500 });
        dash("ok"); await x.sleep(900); C.tab("monitor");
        C.caption(`Seventeen minutes, ${O.behind} changes caught up in order, zero lost.`);
      },
    },

    /* ---------- Chapter 7: Security */
    {
      id: "7.1", act: "7", short: true, title: "Security at the gateway",
      desc: "Every call into PuroClean's APIs, from a vendor webhook or an internal app, passes the same gateway checks: identity, authorization, payload inspection and rate limits. When MuleSoft polls a vendor, it uses encrypted connections and stored credentials, and validates every response.", why: "The platform is independently certified, and PuroClean keeps control of its own policies, users and credentials.",
      powered: ["Anypoint API Manager", "Anypoint Security", "MuleSoft Trust Center"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.anypointAPIManager({ tap: "valid" }));
        const pg = policyGraph();
        C.graph(pg); C.tab("flow"); C.setClock("14:40:00");
        const SR = D.security;
        C.extra(`<div class="srm"><div class="srm-h">Shared responsibility model</div><div class="srm-cols">
          <div><b>MuleSoft</b><ul>${SR.mulesoft.map((s) => `<li>${s}</li>`).join("")}</ul></div>
          <div class="pc"><b>PuroClean</b><ul>${SR.puroclean.map((s) => `<li>${s}</li>`).join("")}</ul></div></div>
          <div class="srm-src">Source: MuleSoft Trust Center, Anypoint Security and the MuleSoft security capabilities overview.</div></div>`);
        C.caption("Every inbound call passes the same policy chain at the gateway. Click Send valid request.");
        const msgs = ["client_id 3f\u2026 valid", "token valid \u00b7 scope jobs:write", "payload depth 4 \u2264 10", "12 / 600 per min"];
        await x.tap("valid");
        x.left(S.anypointAPIManager({ req: "valid", typing: true }));
        await typeIn(x, ".ap-req", S.API_BODY.valid, { ms: 14 });
        await C.packet(pg._ids, x.t, { dur: 340, onHop: async (b) => { const i = Number(b.slice(1)); if (b[0] === "p") C.tag(b, msgs[i], "ok"); } });
        x.left(S.anypointAPIManager({ sent: true, req: "valid", tap: "pol" }));
        await N("api-manager \u00b7 client-id \u2713 \u2192 oauth2 \u2713 \u2192 json-threat-protection \u2713 \u2192 rate-limit \u2713 \u2192 200", "A normal request passes all four checks");
        pg._ids.forEach((id) => C.node(id, ""));
        C.caption("Click JSON Threat Protection to see its limits.");
        await x.tap("pol");
        x.left(S.anypointAPIManager({ sent: true, req: "valid", pol: true, tap: "bad" }));
        C.ring("p2");
        await N("api-manager \u00b7 json-threat-protection config \u00b7 maxContainerDepth 10 \u00b7 maxStringValueLength 10240 \u00b7 maxObjectEntryCount 100 (illustrative values)", "Limits PuroClean sets in configuration, not code");
        C.caption("Now click Send malformed payload. It\u2019s stopped at JSON Threat Protection.");
        await x.tap("bad");
        x.left(S.anypointAPIManager({ req: "bad", pol: true, typing: true }));
        await typeIn(x, ".ap-req", S.API_BODY.bad, { ms: 12, chunk: 2 });
        await C.packet(pg._ids.slice(0, 4), x.t, { kind: "err", dur: 340, finalState: "err" });
        x.left(S.anypointAPIManager({ blocked: true, req: "bad", pol: true }));
        C.tag("p2", "depth 64 > 10 \u00b7 400", "err", { stay: true });
        await N("api-manager \u00b7 json-threat-protection \u00b7 max depth 64 > 10 \u2192 400 rejected \u00b7 never reaches psa-sapi", "A malicious payload is blocked at the gateway");
        await N("outbound polls \u00b7 TLS 1.2+ \u00b7 vendor credentials in secure properties \u00b7 response schema validated in each System API", "Polled vendors: encrypted, authenticated and validated");
        C.clock([{ l: "Inbound policies", v: "4 at gateway" }, { l: "Blocked", n: 1, v: "{n}", state: "err" }, { l: "Code changes", n: 0, v: "{n}", state: "ok" }]);
      },
    },
    {
      id: "7.2", act: "7", short: false, title: "Shared ownership: documented, monitored, runbooked",
      desc: "The whole connection layer is documented, versioned and monitored on one platform, with a runbook for each kind of failure and an owner for each API.", why: "Any team member can own a piece. The knowledge stays with PuroClean, not any one person.",
      powered: ["Anypoint Exchange", "Anypoint Monitoring"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.anypointExchangeCatalog({ tap: "asset" }));
        const g = C.baseGraph(); g.compact = true;
        g.nodes.forEach((n) => { n.state = "ok"; if (n.id === "quar" || n.id === "notify") n.kind = n.kind.replace(" dim", ""); });
        C.graph(g); C.tab("flow");
        C.ambient(x.t, POLLS.concat(FLOWS), { every: 300 });
        C.extra(`<div class="exch"><div class="ex-h">Documented in Anypoint Exchange</div>${["dash-sapi", "psa-sapi", "albi-sapi", "jobsite-sapi", "franconnect-sapi", "job-sync-papi", "notification-api", "puroclean-canonical-job", "dq-rules-restoration"].map((a) => `<div class="ex-a"><b>${a}</b><small>spec \u00b7 owner \u00b7 runbook</small></div>`).join("")}</div>`);
        C.caption("The whole application network: documented, monitored and owned by PuroClean. Click psa-sapi.");
        await N("exchange \u00b7 9 assets \u00b7 each with spec, owner, SLA and runbook \u00b7 5 functional monitors, one per connection", "Every piece is documented, owned and monitored");
        C.clock([{ l: "Assets documented", n: 9, v: "{n} / 9", state: "ok" }, { l: "Runbooks", n: 9, v: "{n}" }, { l: "Monitors", n: 5, v: "{n}", state: "ok" }]);
        await x.tap("asset");
        x.left(S.anypointExchangeCatalog({ asset: true, tap: "runbook" }));
        C.ring("s-psa", "new");
        C.tag("s-psa", "owner \u00b7 spec \u00b7 consumers", "ok", { stay: true, dy: 2 });
        await N("exchange \u00b7 psa-sapi v1.2 \u00b7 owner PuroClean IT \u00b7 OAS spec \u00b7 consumers job-sync-papi, psa-webhook-service", "Who owns it, what it does and who depends on it");
        C.caption("Click the runbook linked to it.");
        await x.tap("runbook");
        x.left(S.anypointExchangeCatalog({ asset: true, runbook: true, tap: "mon" }));
        C.ring("mon", "new");
        await N("exchange \u00b7 RB-PSA-01 PSA outage \u00b7 linked from the psa-sapi alert \u00b7 the steps the on-call owner followed in chapter 6", "The same runbook the 2:15 PM alert linked to");
        C.caption("Click the PSA functional monitor.");
        await x.tap("mon");
        x.left(S.anypointExchangeCatalog({ asset: true, runbook: true, mon: true }));
        await C.packet(["s-psa", "psa", "s-psa"], x.t, { kind: "q", dur: 380 });
        C.tag("psa", "monitor 200 \u00b7 212 ms", "ok");
        await N("functional-monitor psa-sapi \u00b7 2:42 PM \u00b7 GET /api/health \u2192 200 \u00b7 212 ms \u00b7 runs every 5 min \u00b7 alerts on-call on failure", "Checked every five minutes, whoever is on call");
      },
    },

    /* ---------- Chapter 8: See it daily */
    {
      id: "8.1", act: "8", short: true, title: "Jordan\u2019s West digest: Fresno East is slipping",
      desc: "Wednesday, 7:30 AM Pacific. Jordan\u2019s Tableau morning digest shows West Region jobs are up about 20% on last year, but Fresno East is down about 30%. He taps the card, taps Fresno East in the detail view, and opens in Tableau to see what\u2019s behind it.", why: "Jordan spots a slipping location before anyone calls. The data came to him \u2014 he didn\u2019t have to go looking.",
      powered: ["Tableau Cloud", "Tableau Bridge", "11:11 curated views"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.pulse({ blankSum: true }));
        C.graph(pulseGraph()); C.tab("flow"); C.setClock("07:30:00");
        C.caption("Wednesday, 7:30 AM PT. Tableau watches the metrics Jordan follows and flags what changed.");
        await C.packet(["views", "sem"], x.t);
        C.tag("sem", "West jobs \u00b7 +20% YoY", "");
        await N("tableau \u00b7 metric jobs_by_franchise_west \u00b7 grain weekly \u00b7 compare to prior year \u00b7 RLS: West Region", "Tableau reads Jordan\u2019s West Region metrics");
        await C.packet(["sem", "ins"], x.t);
        C.tag("ins", "Fresno East \u25bc30% \u00b7 unexpected", "warn", { stay: true });
        await N("tableau \u00b7 insight: unexpected low \u00b7 Fresno East (CA-0714) down 30% vs prior year \u00b7 West up 20% overall", "Fresno East is slipping while the rest of the West is up");
        await C.packet(["ins", "dig"], x.t, { kind: "res" });
        C.tag("dig", "delivered 7:30 AM PT", "ok", { stay: true });
        await N("tableau \u00b7 digest \u2192 Jordan \u00b7 email + Tableau Mobile \u00b7 7:30 AM PT", "The digest lands in Jordan\u2019s inbox");
        C.caption("Tableau writes Jordan a summary of what changed in his region.");
        await typeIn(x, ".pz-sumt", S.PULSE_SUM, { html: true, ms: 14, chunk: 2 });
        x.left(S.pulse({ tap: true }));
        C.caption("Tap the West Region jobs card in Jordan\u2019s digest.");
        await x.tap("card");
        x.left(S.pulseDetail({ tap: "fresno" }));
        C.ring("ins");
        C.extra(linCard("Tableau metric \u00b7 how it\u2019s measured", [
          ["Metric", "Jobs by franchise, West Region", "on a certified data source"],
          ["Insight", "unexpected low vs prior-year average \u00b7 Tableau learns the range", "built in"],
          ["Delivered", "morning digest to Jordan (email, Tableau Mobile)", "7:30 AM PT"],
        ]));
        await N("Jordan follows the insight to the metric detail page \u00b7 West up 20% overall \u00b7 Fresno East (CA-0714) down 30%", "Jordan sees which franchise is slipping");
        C.clock([{ l: "Digest", v: "7:30 AM PT" }, { l: "West Region", v: "+20% vs last year", state: "ok" }, { l: "Fresno East", v: "\u221230% \u00b7 unexpected", state: "warn" }, { l: "Reporting", v: "62 / 63 franchises" }]);
        C.caption("Tap Fresno East to see what\u2019s behind its drop.");
        await x.tap("fresno");
        x.left(S.pulseDetail({ fresno: true, tap: "open" }));
        await C.packet(["views", "sem", "ins"], x.t, { kind: "q", dur: 380 });
        C.tag("views", "CA-0714 \u00b7 Fresno East \u00b7 \u221230%", "warn", { stay: true });
        await N("tableau \u00b7 breakdown franchise = CA-0714 Fresno East \u00b7 12 jobs last 30 days vs 17 same period last year \u00b7 1 franchise connected Tuesday (reporting now 62/63)", "Fresno East has fewer jobs than this time last year \u2014 Jordan can call to find out why");
        C.caption("Tap Open in Tableau to dig in on the full dashboard.");
        await x.tap("open");
        x.left(S.tableau("rd", { clock: "7:32 AM" }));
        C.tag("dig", "opened in Tableau", "ok", { stay: true });
        await N("deep link \u2192 Tableau Cloud \u00b7 Network Operations dashboard \u00b7 West Region (row-level security)", "Jordan lands on his region\u2019s dashboard, ready to call Fresno East");
      },
    },
    {
      id: "8.2", act: "8", short: false, title: "Explain Data: why did Ohio jump? (CJ\u2019s view)",
      desc: "CJ opens the network dashboard and clicks Ohio on the map. Explain Data shows that the spike is driven by Columbus and Dayton. Clicking Dayton shows that most of its jump is Dayton North, the franchise that connected on Tuesday.", why: "The insight chain is complete: the dashboard flagged it, Tableau surfaced it, Explain Data traced it back to a single franchise connection.",
      powered: ["Tableau Explain Data"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.tableau("network", { tapState: "OH", clock: "7:32 AM" }));
        const g = tabGraph(); g.compact = true;
        C.graph(g); C.tab("flow"); C.setClock("07:32:00");
        C.caption("CJ follows the Tableau digest insight into the dashboard. Click Ohio to ask why it jumped.");
        C.ambient(x.t, [["mule", "views"]], { every: 900 });
        await N("CJ taps 'Open in Tableau' from the Tableau digest \u00b7 Network Operations dashboard opens \u00b7 Ohio highlighted", "CJ lands on the dashboard with Ohio highlighted");
        await x.tap("OH");
        x.left(S.tableau("explain-data", { tapDayton: true }));
        C.caption("Explain Data ranks what drove Ohio's number. Click Dayton to see which franchise.");
        await N("select Ohio \u2192 Explain Data \u00b7 Tableau analyses the contributing dimensions", "Explain Data finds the drivers");
        C.extra(`<div class="expl"><div class="expl-h">Explain Data \u00b7 Ohio open water jobs \u00b7 61 vs expected 38\u201352</div>
          <div class="expl-row"><div class="expl-k">Columbus metro</div><div class="expl-v warn">+9 above expected</div></div>
          <div class="expl-row"><div class="expl-k">Dayton metro</div><div class="expl-v warn">+6 above expected</div><div class="expl-note">OH-0731 (Dayton North) connected Tuesday \u00b7 first 23 jobs now visible</div></div>
          <div class="expl-row"><div class="expl-k">Cincinnati metro</div><div class="expl-v">+2</div></div>
          <div class="expl-src">Tableau analysis of contributing dimensions \u00b7 curated.v_open_jobs</div></div>`);
        await N("Explain Data: Columbus +9 (seasonal), Dayton +6, Cincinnati +2 \u00b7 contributing dimension: metro", "Columbus and Dayton drive the spike");
        await x.tap("dayton");
        x.left(S.tableau("explain-data", { expand: true, tapNew: true }));
        C.caption("Dayton's jump is the franchise that just connected. Click Dayton North to view its data.");
        await N("drill Dayton metro \u2192 franchise \u00b7 OH-0731 Dayton North 5 (first sync Tuesday \u00b7 23 jobs now in Tableau) \u00b7 OH-0702 4 \u00b7 OH-0745 3", "Dayton's jump is the franchise that just connected");
        C.clock([{ l: "Ohio open water", n: 61, v: "{n}", state: "warn" }, { l: "Columbus", v: "+9 seasonal" }, { l: "Dayton", v: "+6 \u00b7 OH-0731 new" }, { l: "Cincinnati", v: "+2" }]);
        await x.tap("dn");
        x.left(S.tableau("explain-data", { expand: true, records: true }));
        C.ring("mule", "new");
        await C.packet(["user", "tabd", "sem", "bridge", "views"], x.t, { kind: "q", dur: 380, finalState: "active" });
        C.tag("views", "23 jobs \u00b7 first_synced Tue 14:10", "ok");
        await N("view data \u00b7 SELECT COUNT(*), MIN(first_synced_at), MIN(date_of_loss) FROM curated.job WHERE franchise_id = 'OH-0731' \u2192 23 \u00b7 Tue 14:10 via psa-sapi \u00b7 losses dated before Tuesday", "Jobs that existed before Tuesday, newly visible: data working as designed");
        C.caption("Dayton North's jobs were always there. Since Tuesday's connection, corporate sees them.");
      },
    },
    {
      id: "8.3", act: "8", short: false, title: "What's next, when the data is trusted",
      desc: "Once the data is trusted, PuroClean can add weather overlays, AI agents for proactive customer outreach, and a unified view of franchises and customers.", why: "None of this is part of Stage 1. It's what the trusted foundation makes possible next.",
      powered: ["Roadmap only"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        const rows = [
          ["Stage 1", "Visibility and adoption: every job, one record, Tableau", "this project"],
          ["Stage 2", "Compliance: jobs moving on time, nothing stuck in limbo", "next"],
          ["Stage 3", "Profitability: QuickBooks Online, margin by job and franchise", "later"],
        ];
        const detail = [
          ["Builds", "4 SPAR System APIs + FranConnect \u00b7 job-sync-papi \u00b7 canonical model \u00b7 11:11 \u00b7 Tableau", "the foundation"],
          ["Reuses", "the SLA lane and 18 PuroLogic Dates \u00b7 adds compliance rules and notification-api routes", "no new connectors"],
          ["Adds", "one QuickBooks Online System API from the Exchange template \u00b7 same Process API and lake", "like step 5.3"],
        ];
        const show = (n) => {
          x.left(S.whatsNext({ seen: [1, 2, 3].slice(0, n), tap: n < 3 ? n + 1 : null }));
          C.lineage(linCard("Stage roadmap (CJ's three stages)", rows.slice(0, Math.max(1, n)), n ? detail[n - 1] : null));
        };
        C.reset();
        show(0);
        x.left(S.whatsNext({ tap: 1 }));
        C.tab("lineage");
        C.caption("Each stage builds on the same connection layer. Click Stage 1.");
        for (const n of [1, 2, 3]) {
          await x.tap("st" + n);
          show(n);
          if (n < 3) C.caption(`Click Stage ${n + 1}.`);
          await N(
            ["roadmap \u00b7 Stage 1 \u00b7 connection layer: System APIs, Process API, canonical model, 11:11, Tableau", "roadmap \u00b7 Stage 2 \u00b7 reuses the SLA lane and PuroLogic Dates \u00b7 adds compliance rules", "roadmap \u00b7 Stage 3 \u00b7 adds a QuickBooks Online System API \u00b7 everything downstream reused"][n - 1],
            ["Stage 1 builds the foundation", "Stage 2 reuses it for compliance", "Stage 3 adds one connector for profitability"][n - 1]
          );
        }
        C.caption("Each stage reuses what Stage 1 builds.");
      },
    },

    { id: "arch",  act: "arch",  layout: "full", short: false, page: "arch",  title: "How it fits together", powered: [] },
    { id: "wrap",  act: "wrap",  layout: "full", short: true,  page: "wrap",  title: "One story, start to finish", powered: [] },
    { id: "close", act: "close", layout: "full", short: true,  page: "close", title: "Your questions, answered.", powered: [] },
  ];

  return { chapters, acts: chapters, steps };
})();
