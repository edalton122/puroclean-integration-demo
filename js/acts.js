/* Storyboard steps. IDs match storyboard.md. Each step's run() is an async script driven by guided taps.
   Every tap on the left triggers animation and a narrated, technical line on the right. */
window.Acts = (function () {
  const D = window.PC, S = window.Screens, C = window.Console;
  const V = D.vendors;
  const code = (s) => `<code>${C.esc(s)}</code>`;

  const acts = [
    { id: "hero", n: "", title: "Start", short: true },
    { id: "1", n: "1", title: "A job is born", short: true },
    { id: "2", n: "2", title: "Rosetta Stone", short: true },
    { id: "3", n: "3", title: "30-minute clock", short: false },
    { id: "4", n: "4", title: "Dirty to trusted", short: false },
    { id: "5", n: "5", title: "Drill-down", short: true, focus: "CJ focus 1" },
    { id: "6", n: "6", title: "Scale to 900", short: true, focus: "CJ focus 2" },
    { id: "7", n: "7", title: "When it breaks", short: true, focus: "CJ focus 3" },
    { id: "8", n: "8", title: "Proactive", short: false },
    { id: "arch", n: "", title: "How it fits", short: false },
    { id: "close", n: "", title: "Close", short: true },
  ];

  const datesUpTo = (field) => {
    const out = {};
    for (const m of D.milestones) {
      if (m.value && !["target_start", "started", "target_completion"].includes(m.field)) out[m.field] = m.value;
      if (m.field === field) break;
    }
    return out;
  };

  const POLLS = [["s-psa", "psa", "s-psa"], ["s-albi", "albi", "s-albi"], ["s-jobsite", "jobsite", "s-jobsite"], ["s-dash", "dash", "s-dash"], ["s-fran", "fran", "s-fran"]];
  const FLOWS = [["s-psa", "proc", "dq", "lake"], ["s-albi", "proc", "dq", "lake"], ["s-jobsite", "proc", "dq", "lake"], ["lake", "tab"]];

  const dashMap = [
    ["loss_type: \"H2O\"", "loss_type: \"Water\"", "value normalized"],
    ["loss_date (local, -06:00)", "date_of_loss (UTC)", "timezone normalized"],
    ["dispatched_at", "dispatch", ""],
    ["accepted_at", "received_accepted", ""],
    ["first_on_site", "started", "CJ: \"we call it job start\""],
    ["account DASH-M-0412/02", "franchise_id KS-0412", "from FranConnect"],
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

  const slaGraph = () => ({
    w: 1000, h: 380,
    groups: [
      { label: "SLA lane \u00b7 near-real-time \u00b7 every 5 min  (4 objects, illustrative)", x: 4, y: 6, w: 992, h: 170 },
      { label: "Daily lane \u00b7 2:00 AM batch \u00b7 everything else", x: 4, y: 196, w: 992, h: 170 },
    ],
    nodes: [
      { id: "m1", label: "Dispatch", x: 40, y: 34, w: 170, h: 28, kind: "src" },
      { id: "m2", label: "Received/Accepted", x: 40, y: 68, w: 170, h: 28, kind: "src" },
      { id: "m3", label: "Contacted", x: 40, y: 102, w: 170, h: 28, kind: "src" },
      { id: "m4", label: "Inspected", x: 40, y: 136, w: 170, h: 28, kind: "src" },
      { id: "fast", label: "Milestones Process API", sub: "poll 5 min \u00b7 watermark", x: 380, y: 72, w: 190, h: 56, kind: "proc" },
      { id: "rule", label: "SLA rules", sub: "Contacted \u2264 30 min", x: 620, y: 72, w: 140, h: 56, kind: "proc" },
      { id: "lake1", label: "11:11 curated.job_milestone", x: 800, y: 72, w: 180, h: 56, kind: "store" },
      { id: "d1", label: "FranConnect accounts", x: 40, y: 224, w: 170, h: 28, kind: "src" },
      { id: "d2", label: "Royalties", x: 40, y: 258, w: 170, h: 28, kind: "src" },
      { id: "d3", label: "Closures \u00b7 invoicing", x: 40, y: 292, w: 170, h: 28, kind: "src" },
      { id: "d4", label: "All other dates", x: 40, y: 326, w: 170, h: 28, kind: "src" },
      { id: "batch", label: "Batch Process API", sub: "daily 2:00 AM", x: 380, y: 262, w: 190, h: 56, kind: "proc" },
      { id: "lake2", label: "11:11 curated tables", x: 800, y: 262, w: 180, h: 56, kind: "store" },
    ],
    edges: [
      ["m1", "fast"], ["m2", "fast"], ["m3", "fast"], ["m4", "fast"], ["fast", "rule"], ["rule", "lake1"],
      ["d1", "batch"], ["d2", "batch"], ["d3", "batch"], ["d4", "batch"], ["batch", "lake2"],
    ],
  });

  /* Tableau query path: right-to-left is the query, left-to-right is the result set. */
  const tabGraph = (who = "CJ \u00b7 browser") => ({
    w: 1000, h: 330,
    groups: [
      { label: "PuroClean data lake", x: 4, y: 6, w: 420, h: 316 },
      { label: "Tableau", x: 440, y: 6, w: 420, h: 316 },
    ],
    nodes: [
      { id: "mule", label: "MuleSoft sync", sub: "SLA lane \u00b7 every 5 min", x: 20, y: 60, w: 150, h: 52, kind: "sys" },
      { id: "fcref", label: "FranConnect ref", sub: "regions \u00b7 RDs", x: 20, y: 220, w: 150, h: 52, kind: "sys" },
      { id: "views", label: "11:11 curated views", sub: "v_open_jobs \u00b7 job_milestone", x: 220, y: 130, w: 190, h: 70, kind: "store" },
      { id: "sem", label: "Semantic model", sub: "certified metrics", x: 470, y: 60, w: 160, h: 52, kind: "proc" },
      { id: "rls", label: "Row-level security", sub: "USERNAME() \u2192 region", x: 470, y: 220, w: 160, h: 52, kind: "proc" },
      { id: "tabd", label: "Tableau dashboard", sub: "Network Operations", x: 680, y: 130, w: 160, h: 70, kind: "viz" },
      { id: "user", label: who, x: 880, y: 140, w: 110, h: 50, kind: "src" },
    ],
    edges: [["mule", "views"], ["fcref", "views"], ["views", "sem"], ["views", "rls"], ["sem", "tabd"], ["rls", "tabd"], ["tabd", "user"]],
  });

  const scaleGraph = (idx, surge) => {
    const w = D.scale[idx].workers;
    const nodes = [
      { id: "src", label: "SPAR System APIs", sub: "Dash \u00b7 PSA \u00b7 Albi \u00b7 JobSite", x: 20, y: 150, w: 170, h: 64, kind: "sys" },
      { id: "q", label: "Persistent queue", sub: surge ? "absorbing 4x spike" : "buffers spikes", x: 240, y: 150, w: 160, h: 64, kind: surge ? "proc warn" : "proc" },
      { id: "lake", label: "11:11 SQL Server", sub: "curated", x: 790, y: 150, w: 190, h: 64, kind: "store" },
    ];
    [0, 1, 2, 3].forEach((i) => nodes.push({ id: "w" + i, label: `Worker ${i + 1}`, sub: i < w ? "CloudHub \u00b7 Milestones API" : "not needed", x: 470, y: 22 + i * 84, w: 220, h: 54, kind: i < w ? "proc" : "proc dim" }));
    const edges = [["src", "q"]];
    [0, 1, 2, 3].forEach((i) => edges.push(["q", "w" + i], ["w" + i, "lake"]));
    return { w: 1000, h: 360, compact: true, groups: [{ label: "MuleSoft Anypoint \u00b7 horizontal scaling", x: 220, y: 4, w: 500, h: 350 }], nodes, edges };
  };

  const pulseGraph = () => ({
    w: 1000, h: 220,
    nodes: [
      { id: "views", label: "11:11 curated views", sub: "refreshed by MuleSoft", x: 20, y: 80, w: 180, h: 60, kind: "store" },
      { id: "sem", label: "Certified metric", sub: "Open water jobs", x: 250, y: 80, w: 170, h: 60, kind: "proc" },
      { id: "ins", label: "Pulse insights", sub: "trend \u00b7 anomaly \u00b7 drivers", x: 470, y: 80, w: 190, h: 60, kind: "viz" },
      { id: "dig", label: "CJ's digest", sub: "mobile \u00b7 email \u00b7 Slack", x: 720, y: 80, w: 170, h: 60, kind: "src" },
    ],
    edges: [["views", "sem"], ["sem", "ins"], ["ins", "dig"]],
  });

  const policyGraph = () => {
    const P = D.security.policies;
    const short = (p) => p.replace(" Enforcement", "").replace(" Token", "").replace("JSON/XML ", "");
    const sub = (p) => (p.startsWith("JSON/XML") ? "JSON/XML policy" : "API Manager policy");
    const nodes = [{ id: "req", label: "Vendor request", sub: "PSA \u2192 API", x: 10, y: 60, w: 120, h: 56, kind: "src" }];
    P.forEach((p, i) => nodes.push({ id: "p" + i, label: short(p), sub: sub(p), x: 150 + i * 145, y: 60, w: 130, h: 56, kind: "proc" }));
    nodes.push({ id: "api", label: "psa-sapi", sub: "System API", x: 150 + P.length * 145, y: 60, w: 110, h: 56, kind: "sys" });
    const ids = nodes.map((n) => n.id);
    return { w: 1000, h: 140, groups: [{ label: "Anypoint API Manager \u00b7 policies at the gateway, no code changes", x: 140, y: 6, w: 720, h: 126 }], nodes, edges: ids.slice(1).map((b, i) => [ids[i], b]), _ids: ids };
  };

  const scalePanel = (idx, surge) => {
    const s = D.scale[idx];
    const q = surge ? 78 : 6 + idx * 4;
    return `<div class="sc-panel">
      <div class="sc-meters">
        <div><div class="sc-l">Milestone events / day</div><div class="sc-v">${(surge ? s.peak : s.events).toLocaleString()}</div></div>
        <div><div class="sc-l">Queue depth</div><div class="meter"><span style="width:${q}%" class="${surge ? "warn" : ""}"></span></div><div class="sc-s">${surge ? "surge \u00b7 draining in ~6 min" : "steady"}</div></div>
        <div><div class="sc-l">SLA-lane latency</div><div class="sc-v ok">${s.latency}</div><div class="sc-s">target \u2264 5 min</div></div>
      </div>
      <div class="sc-note">Same APIs, same canonical model, same 11:11 tables at every size. <span class="ill">volumes illustrative</span></div>
    </div>`;
  };

  const lineageTable = (n) => {
    const rows = [
      ["Business KPI", "On-time completion", "CJ's Data Collection sheet"],
      ["Tableau measure", "On-Time Completion % (certified)", "semantic model"],
      ["Canonical field", "majority_completion \u2264 target_completion", "curated.job \u00b7 PuroLogic Dates"],
      ["Source field", "Dash est_complete \u00b7 PSA TargetCompDT \u00b7 Albi targetCompletion \u00b7 JobSite target_done", "illustrative"],
      ["API endpoint", "GET /jobs/{id}/dates per platform System API", "illustrative"],
    ];
    return `<div class="lin"><div class="lin-h">KPI lineage \u00b7 tile \u2192 Tableau \u2192 MuleSoft \u2192 platform</div>
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
    { id: "hero", act: "hero", layout: "full", title: "Every franchise job, one trusted record", page: "hero", say: "This is the integration strategy for Stage 1: how every franchise's job data gets into one trusted record, and how CJ sees it.", powered: [] },

    /* ---------- Act 1 */
    {
      id: "1.1", act: "1", title: "A new water loss, logged in Dash",
      desc: "A franchise logs a new water job in its usual job app. Nothing changes for them; MuleSoft is already listening.",
      say: "A franchise in Wichita logs a water loss in Dash, the way they do today. Nothing about their day changes. Watch the right side.",
      powered: ["Franchise's SPAR platform", "No change for the franchise"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.jobApp({ isNew: true, dates: { date_of_loss: "6:12 AM" }, actions: [{ label: "Save", tap: "save" }], clock: "6:12 AM" }));
        C.graph(C.baseGraph()); C.tab("flow"); C.setClock("06:12:10");
        C.caption("MuleSoft polls every SPAR platform for new and changed jobs.");
        C.ambient(x.t, POLLS, { every: 520 });
        C.clock([{ l: "Polls today", n: 1184, v: "{n}" }, { l: "SLA lane", v: "every 5 min", s: "4 objects (illustrative)" }, { l: "Platforms", v: "5 connected", state: "ok" }, { l: "Dash feed today", v: "every ~2 hrs", s: "for comparison" }]);
        await N("scheduler \u00b7 5 System APIs polling on watermark \u00b7 GET ?updated_since={last_run}", "MuleSoft checks every platform for changes");
        await x.tap("save");
        x.left(S.jobApp({ dates: { date_of_loss: "6:12 AM" }, actions: [{ label: "Dispatch", tap: "dispatch" }], clock: "6:19 AM" }));
        C.ring("dash"); C.node("dash", "active"); C.tag("dash", "INSERT D-889214", "new");
        await N("Dash \u00b7 INSERT job D-889214 \u00b7 updated_at 12:19:02Z > watermark 12:15:00Z \u2192 eligible for next poll", "The job is saved in Dash and flagged as new");
        C.clock([{ l: "Polls today", n: 1190, v: "{n}" }, { l: "Changed in Dash", n: 1, v: "{n} job", state: "run" }, { l: "Platforms", v: "5 connected", state: "ok" }, { l: "Next dash-sapi poll", v: "in 0:58" }]);
        await x.tap("dispatch");
        x.left(S.jobApp({ dates: datesUpTo("received_accepted"), flash: "received_accepted", clock: "6:24 AM" }));
        C.ring("dash"); C.tag("dash", "dispatched_at \u00b7 accepted_at", "new");
        await N("Dash \u00b7 UPDATE D-889214 SET dispatched_at, accepted_at \u00b7 2 milestone fields changed", "Dispatch and acceptance times recorded");
        await C.log([{ lvl: "info", at: "06:24:00", raw: "Dash \u00b7 job D-889214 updated (franchise side) \u00b7 2 SLA fields", exec: "The franchise dispatched and accepted the job" }], x.t);
        C.clock([{ l: "Polls today", n: 1196, v: "{n}" }, { l: "Changed in Dash", n: 1, v: "{n} job \u00b7 3 dates", state: "run" }, { l: "Platforms", v: "5 connected", state: "ok" }, { l: "Next dash-sapi poll", v: "now", state: "run" }]);
      },
    },
    {
      id: "1.2", act: "1", title: "MuleSoft picks it up and translates it",
      desc: "MuleSoft picks up the new job and translates Dash's fields into PuroClean's standard job format.",
      say: "One System API per platform speaks Dash. One Process API translates everything into PuroClean's language and attaches the franchise from FranConnect. That translation is built once.",
      powered: ["MuleSoft Anypoint", "System + Process APIs", "DataWeave", "FranConnect reference"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.jobApp({ dates: datesUpTo("received_accepted"), clock: "6:24 AM" }));
        C.graph(C.baseGraph()); C.tab("flow"); C.setClock("06:24:05");
        C.caption("The Dash System API picks up the change and the Process API translates it.");
        C.ambient(x.t, POLLS.filter((p) => p[0] !== "s-dash"), { every: 700 });
        C.payload({
          left: { title: "Dash payload (source)", obj: V.dash.payload, hl: ["loss_type", "loss_date", "dispatched_at", "accepted_at", "first_on_site", "account"] },
          right: { title: "PuroLogic canonical record", obj: D.canonical, hl: ["loss_type", "date_of_loss", "dispatch", "received_accepted", "started", "franchise_id", "region", "state"] },
          map: dashMap,
        });
        await C.packet(["s-dash", "dash"], x.t, { kind: "q", dur: 420, finalState: "active" });
        C.tag("dash", "200 OK \u00b7 1 changed \u00b7 184 ms", "ok");
        await N("dash-sapi \u00b7 GET /v2/jobs?updated_since=12:15:00Z \u2192 200 \u00b7 1 record \u00b7 184 ms", "Dash's connector found 1 new job");
        await C.packet(["dash", "s-dash", "proc"], x.t);
        C.tag("proc", "dash-to-purologic.dwl v1.3", "");
        await N("job-sync-papi \u00b7 DataWeave dash-to-purologic.dwl \u00b7 mapping 6 fields \u2192 PuroLogic canonical", "Translating Dash's fields into PuroClean's format");
        const tf = C.transform(dwRows.slice(0, 5), x.t, { script: "dash-to-purologic.dwl" });
        await C.packet(["fran", "s-fran", "proc"], x.t, { kind: "ref", dur: 420 });
        C.tag("s-fran", "cache hit \u00b7 3 ms", "ok");
        const box = await tf;
        await N("enrich \u00b7 account DASH-M-0412/02 \u2192 franchise KS-0412 \u00b7 region Central \u00b7 FranConnect cache", "Matched to PuroClean Wichita East, Central Region");
        await C.transform(dwRows.slice(5), x.t, { script: "franconnect lookup", into: box.parentElement });
        C.node("proc", "ok", undefined);
        C.clock([{ l: "Fields mapped", n: 6, v: "{n} / 6", state: "ok" }, { l: "Timezone", v: "America/Chicago \u2192 UTC" }, { l: "Enrichment", v: "KS-0412 \u00b7 Central" }, { l: "Elapsed", n: 27, v: "{n} s", state: "run" }]);
      },
    },
    {
      id: "1.3", act: "1", title: "Into the 11:11 lake, and the SLA clock starts",
      desc: "The job lands in PuroClean's data lake about 40 seconds after it was saved, and the 30-minute response clock starts.",
      say: "Forty seconds from the franchise's screen to the lake. It's an upsert, not an insert, so if Dash resends the job we update it rather than duplicate it.",
      powered: ["MuleSoft Database Connector", "11:11 SQL Server lake (Nick's environment)"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.jobApp({ dates: datesUpTo("received_accepted"), clock: "6:24 AM" }));
        C.graph(C.baseGraph()); ["dash", "s-dash", "fran", "s-fran"].forEach((n) => C.node(n, "ok")); C.tab("flow"); C.setClock("06:24:38");
        C.caption("Quality checks pass, then the record is upserted into 11:11.");
        C.ambient(x.t, POLLS.filter((p) => p[0] !== "s-dash"), { every: 700 });
        await C.packet(["proc", "dq"], x.t);
        C.tag("dq", "14 / 14 rules \u2713 \u00b7 no duplicate", "ok");
        await N("dq \u00b7 14 rules passed \u00b7 dedupe key (address, date_of_loss, carrier_claim) \u00b7 0 matches", "Quality checks passed; not a duplicate");
        await C.packet(["dq", "lake"], x.t);
        C.ring("lake"); C.tag("lake", "MERGE \u00b7 1 job \u00b7 3 dates", "new");
        await N("11:11 \u00b7 MERGE staging.job_milestone ON (source_system, source_job_id) \u2192 EXEC curated.usp_promote_job", "Written to the PuroClean data lake");
        await C.log([
          { lvl: "sql", raw: code("MERGE INTO staging.job_milestone USING @batch ON source_system = 'DASH' AND source_job_id = 'D-889214'"), exec: "Written to the data lake" },
          { lvl: "ok", raw: "end-to-end 41 s \u00b7 Dash save 6:24:00 \u2192 curated 6:24:41", exec: "41 seconds from the franchise's screen to the lake" },
        ], x.t);
        x.left(S.jobApp({ dates: datesUpTo("received_accepted"), synced: "6:24:41 AM", clock: "6:24 AM" }));
        C.clock([{ l: "End-to-end", n: 41, v: "{n} s", state: "ok" }, { l: "Rows written", n: 3, v: "1 job \u00b7 {n} dates" }, { l: "SLA timer", v: "Contacted due 6:54", s: "30 min (illustrative)", state: "run" }, { l: "Write mode", v: "upsert", s: "no duplicates" }]);
        await C.packet(["lake", "tab"], x.t, { kind: "res" });
        C.tag("tab", "visible in Tableau", "ok");
        await N("sla \u00b7 timer started \u00b7 received_accepted 12:24Z \u00b7 contacted due \u2264 12:54Z \u00b7 Tableau extract not required (live)", "The 30-minute response clock is running");
      },
    },

    /* ---------- Act 2 */
    {
      id: "2.1", act: "2", title: "Same job, four platforms, one language",
      desc: "The same job, entered in four different platforms. Each platform names things differently; each becomes the same PuroClean record.",
      say: "CJ called this the Rosetta Stone. 'Arrive on site,' 'first on site,' 'job began': all of them become PuroLogic's Started. These are PuroClean's own 18 Dates. Nick owns the definitions; MuleSoft enforces them.",
      powered: ["DataWeave", "PuroLogic canonical model", "Anypoint Exchange"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        const show = (vk) => {
          x.left(S.jobApp({ vendor: vk, switcher: true, dates: { ...datesUpTo("inspected"), started: "8:05 AM", target_completion: "Feb 19" }, flash: "started", clock: "8:05 AM" }));
          C.extra(rosetta(vk));
        };
        const g = C.baseGraph(); g.compact = true;
        C.graph(g); C.tab("flow"); C.setClock("08:05:00");
        C.caption("Each platform labels the same moment differently. All of them map to PuroLogic's Started.");
        C.payload({
          sources: ["dash", "psa", "albi", "jobsite"].map((k) => ({ title: V[k].name, obj: V[k].payload, hl: [V[k].fields.started, V[k].fields.loss_type.split(":")[0]], cls: "src" })),
          right: { title: "PuroLogic canonical (one record)", obj: D.canonical, hl: ["started", "loss_type"] },
          map: ["dash", "psa", "albi", "jobsite"].map((k) => [`${V[k].name} \u00b7 ${V[k].fields.started}`, "started", V[k].labels.started]),
          mapTitle: "Four labels, one canonical field",
        });
        show("dash");
        C.tag("s-dash", "first_on_site \u2192 started", "new", { stay: true, dy: 2 });
        await N("dash-to-purologic.dwl \u00b7 first_on_site \u2192 started \u00b7 loss_type \"H2O\" \u2192 \"Water\"", "Dash's \"First On Site\" becomes Started");
        for (const vk of ["psa", "albi", "jobsite"]) {
          await x.tap("v-" + vk);
          show(vk);
          const f = V[vk].fields;
          await C.packet([vk, "s-" + vk, "proc"], x.t, { dur: 420 });
          C.tag("s-" + vk, `${f.started} \u2192 started`, "new", { stay: true, dy: 2 });
          C.ring("proc");
          await N(`${V[vk].name.toLowerCase()}-to-purologic.dwl \u00b7 ${f.started} \u2192 started \u00b7 ${f.loss_type} \u2192 "Water"${vk === "albi" ? " \u00b7 epoch ms \u2192 ISO-8601" : ""}`, `${V[vk].name}'s "${V[vk].labels.started}" becomes Started`);
        }
        C.clock([{ l: "Platforms mapped", n: 4, v: "{n} / 4", state: "ok" }, { l: "Canonical fields", v: "18 PuroLogic Dates" }, { l: "Process APIs", v: "1, shared" }]);
      },
    },
    {
      id: "2.2", act: "2", title: "Add a fifth platform",
      desc: "Adding a fifth platform means building one new connector. Everything behind it is reused as is.",
      say: "Adding a platform means one new System API. Everything downstream is reused. That's the difference between a feed and a platform.",
      powered: ["Anypoint Exchange", "API-led connectivity"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.addPlatform(false));
        C.graph(C.baseGraph()); C.tab("flow");
        C.caption("Today: four SPAR platforms plus FranConnect, each with its own System API.");
        const amb = C.ambient(x.t, FLOWS, { every: 600 });
        await N("application network \u00b7 5 System APIs \u2192 1 Process API \u2192 dq \u2192 11:11 \u2192 Tableau", "Four platforms and FranConnect feed one shared pipeline");
        await x.tap("add");
        amb.stop();
        x.left(S.addPlatform(true));
        const g2 = C.baseGraph({
          addNodes: [
            { id: "new", label: "New platform", sub: "5th SPAR option", x: 14, y: 384, w: 118, h: 46, kind: "src new" },
            { id: "s-new", label: "new-sapi", sub: "System API \u00b7 new", x: 186, y: 384, w: 150, h: 46, kind: "sys new" },
          ],
          addEdges: [["new", "s-new"], ["s-new", "proc"]],
        });
        g2.groups[0].h = 430;
        C.graph(g2);
        C.ring("new", "new"); C.ring("s-new", "new");
        await N("Exchange \u00b7 scaffold new-sapi from spar-system-api template \u00b7 deploy CloudHub \u00b7 1 new artifact", "One new connector is created from a template");
        C.extra(`<div class="exch"><div class="ex-h">Anypoint Exchange</div><div class="ex-a"><b>purologic-canonical-job</b> v1.3<small>used by 6 APIs</small></div><div class="ex-a"><b>job-sync-papi</b> v2.0<small>reused</small></div><div class="ex-a"><b>dq-rules-restoration</b> v1.1<small>reused</small></div></div>`);
        await C.packet(["new", "s-new", "proc", "dq", "lake", "tab"], x.t, { kind: "new", onHop: async (b) => { if (["proc", "dq", "lake", "tab"].includes(b)) { C.tag(b, "reused \u00b7 0 changes", "ok", { stay: true }); } } });
        await N("downstream diff \u00b7 job-sync-papi 0 changes \u00b7 dq-rules 0 \u00b7 11:11 schema 0 \u00b7 Tableau 0", "Nothing downstream changed");
        C.clock([{ l: "New artifacts", n: 1, v: "{n}", state: "ok" }, { l: "Reused", n: 4, v: "{n} components" }, { l: "Downstream changes", n: 0, v: "{n}", state: "ok" }]);
        C.ambient(x.t, FLOWS.concat([["s-new", "proc", "dq", "lake"]]), { every: 500 });
      },
    },

    /* ---------- Act 3 */
    {
      id: "3.1", act: "3", title: "Two lanes: near-real-time and daily",
      desc: "Time-critical milestones sync every five minutes. Everything else syncs once a night.",
      say: "Only four things need to be as live as possible, CJ's words. We spend real-time effort only where the SLA needs it; everything else runs once a day. We'll confirm which four with CJ.",
      powered: ["MuleSoft Scheduler + Batch", "Watermark incremental sync"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.jobApp({ dates: datesUpTo("received_accepted"), tapDate: "contacted", clock: "6:41 AM" }));
        C.graph(slaGraph()); C.tab("flow"); C.setClock("06:41:00");
        C.caption("The four SLA objects ride the 5-minute lane. The rest waits for the 2:00 AM batch.");
        C.ambient(x.t, [["m1", "fast"], ["m2", "fast"], ["m4", "fast"]], { every: 800 });
        C.tag("batch", "idle \u00b7 next run 02:00", "", { stay: true });
        C.clock([{ l: "SLA timer", v: "Contacted due 6:54", state: "run", s: "30 min (illustrative)" }, { l: "SLA lane", v: "\u2264 5 min" }, { l: "Daily lane", v: "2:00 AM" }]);
        await N("milestones-papi \u00b7 cron */5 \u00b7 4 objects \u00b7 watermark 12:40:00Z", "The fast lane checks the four SLA milestones every 5 minutes");
        await x.tap("d-contacted");
        x.left(S.jobApp({ dates: datesUpTo("contacted"), flash: "contacted", clock: "6:41 AM" }));
        C.ring("m3");
        await C.packet(["m3", "fast", "rule", "lake1"], x.t, { onHop: async (b) => { if (b === "rule") C.tag("rule", "17 min \u2264 30 \u2713", "ok"); } });
        await N("milestones-papi \u00b7 contacted 12:41Z picked up in 3m12s \u00b7 rule CONTACT_30 \u00b7 17 min \u2192 PASS", "Contact time picked up in 3 minutes; SLA met");
        C.tag("lake1", "UPSERT 1 row", "new");
        C.clock([{ l: "SLA timer", v: "Met \u00b7 17 min", state: "ok", s: "30 min (illustrative)" }, { l: "Pickup latency", v: "3m 12s" }, { l: "Daily lane", v: "next run 2:00 AM" }]);
      },
    },
    {
      id: "3.2", act: "3", title: "A missed SLA reaches the RD in time",
      desc: "A job in Sacramento misses its 30-minute contact window. The right regional director is alerted while it can still be fixed.",
      say: "The RD finds out while it can still be fixed, not on next week's report.",
      powered: ["MuleSoft notification API", "FranConnect region mapping"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.slaAlert(false));
        const g = C.baseGraph();
        g.nodes.forEach((n) => { if (n.id === "notify") n.kind = "proc"; });
        C.graph(g); C.tab("flow"); C.setClock("07:02:00");
        C.caption("An SLA rule fails for a Sacramento job. The notification layer routes it by region.");
        C.ambient(x.t, POLLS, { every: 650 });
        await C.packet(["s-psa", "proc"], x.t);
        C.tag("proc", "CONTACT_30 \u2717 34 min", "err");
        await N("sla \u00b7 JOB-CA-11902 \u00b7 received_accepted 12:28Z \u00b7 contacted NULL at +34m \u2192 BREACH", "A Sacramento job missed the 30-minute contact SLA");
        await C.packet(["fran", "s-fran", "proc"], x.t, { kind: "ref", dur: 420 });
        C.tag("s-fran", "CA-0219 \u2192 West \u2192 RD", "");
        await N("route \u00b7 franchise CA-0219 \u2192 region West \u2192 Regional Director (FranConnect)", "Routed to the West Region RD");
        await C.packet(["proc", "notify"], x.t, { kind: "err", finalState: "err" });
        C.tag("notify", "push + email \u00b7 sent", "err");
        x.left(S.slaAlert(true));
        await N("notification-api \u00b7 POST /alerts \u00b7 channel push,email \u00b7 202 Accepted \u00b7 412 ms", "The RD's phone gets the alert");
        await x.tap("open");
        C.tag("notify", "read 7:02:41 \u00b7 acknowledged", "ok");
        C.node("notify", "ok");
        await N("notification-api \u00b7 delivery receipt \u00b7 read 12:02:41Z \u00b7 deep link /lightning/r/Job/JOB-CA-11902", "Alert opened; the RD is on it");
        C.clock([{ l: "Detected", v: "+34 min" }, { l: "Alert sent in", n: 0.4, dec: 1, v: "{n} s", state: "ok" }, { l: "Routed to", v: "RD, West" }]);
      },
    },

    /* ---------- Act 4 */
    {
      id: "4.1", act: "4", title: "Duplicate and incomplete records",
      desc: "A duplicate job is merged and an incomplete one is held back, so bad data never reaches reporting.",
      say: "Robert put it best: we're not passing garbage to the data lake. Bad records are held back with a reason, not silently loaded.",
      powered: ["DataWeave validation", "MuleSoft error handling", "Quarantine table in 11:11"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.syncQueue());
        const g = C.baseGraph();
        g.nodes.forEach((n) => { if (n.id === "quar") n.kind = "store"; });
        C.graph(g); C.tab("flow"); C.setClock("09:12:00");
        C.caption("A multi-location account resubmits a job, and another arrives with no loss type.");
        C.ambient(x.t, POLLS.filter((p) => p[0] !== "s-dash"), { every: 700 });
        await N("dash-sapi \u00b7 3 pending changes on DASH-M-0412 (multi-location master)", "Three changes waiting in Dash");
        await x.tap("sync");
        await C.packet(["dash", "s-dash", "proc", "dq"], x.t, { finalState: "warn" });
        C.tag("dq", "DUPLICATE \u00b7 merged", "warn");
        await N("dedupe \u00b7 match JOB-KS-24817 on (address, date_of_loss, carrier_claim) \u00b7 MERGE \u00b7 0 new rows", "Duplicate caught and merged; no double count");
        await C.packet(["dash", "s-dash", "proc", "dq", "quar"], x.t, { kind: "err", finalState: "err" });
        C.tag("quar", "DQ-014 \u00b7 held", "err");
        await N("dq \u00b7 D-889301 \u00b7 DQ-014 loss_type IS NULL \u2192 INSERT quarantine.job (reason_code, payload)", "Incomplete job held back with a reason");
        await C.packet(["dash", "s-dash", "proc", "dq", "lake"], x.t);
        C.tag("lake", "UPSERT D-889297", "ok");
        await N("dq \u00b7 D-889297 \u00b7 14/14 pass \u2192 MERGE curated.job \u00b7 1 row", "The clean update loads normally");
        C.payload({
          left: { title: "Incoming D-889301 (Dash)", obj: { job_no: "D-889301", account: "DASH-M-0412/01", loss_type: "", loss_date: "2027-02-16T08:40:00-06:00" }, hl: ["loss_type"] },
          right: { title: "quarantine.job", obj: { source_job_id: "D-889301", franchise_id: "KS-0412", reason_code: "DQ-014", reason: "loss_type is required", status: "held \u00b7 franchise notified", retry: "on next update" }, hl: ["reason_code", "reason", "status"] },
        });
        C.clock([{ l: "Merged", n: 1, v: "{n}", state: "warn" }, { l: "Quarantined", n: 1, v: "{n}", state: "err" }, { l: "Loaded", n: 1, v: "{n}", state: "ok" }, { l: "Bad rows in lake", n: 0, v: "{n}", state: "ok" }]);
      },
    },
    {
      id: "4.2", act: "4", title: "Data health, CJ's own KPI",
      desc: "CJ watches the share of franchises with usable data climb, and sees exactly why records are held back.",
      say: "Under 20% usable today. This is how we watch that number move, franchise by franchise.",
      powered: ["Tableau", "11:11 curated views"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.tableau("health"));
        const g = C.baseGraph(); g.compact = true;
        g.nodes.forEach((n) => { if (n.id === "quar") n.kind = "store"; });
        C.graph(g); C.tab("flow");
        C.caption("Data health is computed from the same quality rules MuleSoft enforces.");
        C.ambient(x.t, [["s-psa", "proc", "dq", "lake"], ["s-dash", "proc", "dq", "quar"], ["s-albi", "proc", "dq", "lake"], ["lake", "tab"]], { every: 450 });
        await N("tableau \u00b7 Usable Data % = franchises with \u2265 90% complete jobs \u00f7 active franchises", "Usable data is measured per franchise");
        C.tag("quar", "312 held \u00b7 7 days", "err", { stay: true });
        C.tag("lake", "64% usable", "ok", { stay: true });
        await N("tableau \u00b7 SELECT reason_code, COUNT(*) FROM quarantine.job WHERE held_at > now()-7d GROUP BY 1", "Quarantine reasons, counted for the last 7 days");
        C.extra(linCard('"Franchises with usable data" \u00b7 how it\'s measured', [
          ["Tableau measure", "Usable Data % (certified)", "semantic model"],
          ["Rule", "franchise has \u2265 90% of jobs with all required PuroLogic Dates + loss type", "illustrative threshold"],
          ["Inputs", "curated.job completeness \u00b7 quarantine.job counts by reason", "11:11"],
        ], ["Also on the sheet", '"Integrations working": CJ\'s addition to the Data Collection KPIs', "confirmed"]));
        C.clock([{ l: "Usable data", n: 64, v: "{n}%", state: "ok", s: "from 19%" }, { l: "Quarantined (7d)", n: 312, v: "{n}" }, { l: "Integrations working", v: "5 / 5", state: "ok" }]);
      },
    },

    /* ---------- Act 5 */
    {
      id: "5.1", act: "5", title: "CJ's Tuesday afternoon: network to one job",
      desc: "CJ drills from the whole network down to a single job in four clicks, on data that's minutes old.",
      say: "CJ can do this in two minutes today; an RD takes two hours. Here it's four clicks for anyone with access, on data that's minutes old, from all four platforms.",
      powered: ["Tableau", "Semantic model, certified metrics", "Live connection to 11:11"],
      async run(x) {
        x.left(S.tableau("network", { tap: true }));
        C.graph(tabGraph()); C.tab("flow"); C.setClock("14:00:00");
        C.caption("Every click is a live query against the 11:11 curated views.");
        C.ambient(x.t, [["mule", "views"], ["fcref", "views"]], { every: 900, kind: "poll" });
        const Q = ["user", "tabd", "sem", "views"];
        const clk = (ms, rows) => C.clock([{ l: "Query time", n: ms, v: "{n} ms", state: "ok" }, { l: "Rows", n: rows, v: "{n}" }, { l: "Freshness", v: "4 min", s: "SLA lane" }, { l: "Measure", v: "Open Jobs", s: "certified" }]);
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
        await query(x, Q, { rows: "7 rows", ms: "31 ms", sql: "SELECT milestone, ts FROM curated.job_milestone WHERE job_id = 'JOB-KS-24817' \u2192 7 rows \u00b7 31 ms", exec: "One job's PuroLogic Dates, from Dash via MuleSoft" });
        clk(31, 7);
      },
    },
    {
      id: "5.2", act: "5", title: "Same dashboard, the regional director's view",
      desc: "A regional director opens the same dashboard and sees only their own region. No copies, no exports.",
      say: "Twelve or thirteen RDs, one dashboard. Each sees their own region. No copies, no exports.",
      powered: ["Tableau row-level security", "FranConnect region reference"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.tableau("rd"));
        const g = tabGraph("RD West \u00b7 browser");
        C.graph(g); C.tab("flow"); C.setClock("14:03:00");
        C.caption("Same dashboard, same SQL. Row-level security adds the region filter for this user.");
        C.ambient(x.t, [["mule", "views"], ["fcref", "views"]], { every: 900 });
        C.ring("user");
        await N("auth \u00b7 rd.west (illustrative) \u00b7 entitlement lookup ref.user_region \u2192 West", "Signed in as the West Region RD");
        await C.packet(["fcref", "views", "rls"], x.t, { kind: "ref", dur: 420 });
        C.tag("rls", "WHERE region = 'West'", "new", { stay: true });
        await N("rls \u00b7 JOIN ref.user_region u ON u.region = j.region WHERE u.user = USERNAME()", "Only West Region rows are allowed");
        await query(x, ["user", "tabd", "rls", "views"], { rows: "137 rows", ms: "164 ms", sql: "v_open_jobs \u2229 region West \u2192 CA 74 \u00b7 OR 19 \u00b7 WA 28 \u00b7 NV 16 = 137", exec: "137 open jobs in the West Region" });
        C.clock([{ l: "States visible", n: 4, v: "{n} of 51" }, { l: "Open jobs", n: 137, v: "{n}", state: "ok" }, { l: "Copies of the dashboard", n: 1, v: "{n}" }]);
      },
    },
    {
      id: "5.3", act: "5", title: "Benchmarking against the network",
      desc: "One franchise compared with the network average, on the KPIs from CJ's list.",
      say: "Benchmarking was on CJ's list. Financials come later with QuickBooks; we're showing where they'll land.",
      powered: ["Tableau"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.tableau("bench"));
        const g = tabGraph(); g.compact = true;
        C.graph(g); C.tab("flow");
        C.caption("Benchmarks only count franchises whose data passes the quality rules.");
        C.ambient(x.t, [["mule", "views"]], { every: 900 });
        await query(x, ["user", "tabd", "sem", "views"], { rows: "6 KPIs", ms: "212 ms", sql: "AVG(kpi) OVER franchises WHERE usable_data = 1 AND window = 90d \u2192 network baseline", exec: "Network averages, from franchises with usable data" });
        C.extra(linCard('"Network average" \u00b7 how it\'s calculated', [
          ["Grain", "per franchise, trailing 90 days", "illustrative"],
          ["Network average", "mean across franchises with usable data", "excludes quarantined jobs"],
          ["KPIs", "jobs / month \u00b7 cycle time \u00b7 on-time completion \u00b7 backlog \u00b7 rework \u00b7 cancellation", "Data Collection sheet"],
        ], ["Stage 3", "revenue \u00b7 gross margin \u00b7 labor and material % \u00b7 growth trend, with QuickBooks Online", "later"]));
      },
    },
    {
      id: "5.4", act: "5", title: "KPI lineage: where does this number come from?",
      desc: "Every number on the dashboard traces back to the platform and field it came from.",
      say: "Every number on CJ's screen traces back to a field, in a specific platform, through a specific API. When someone asks 'is this right?', this is the answer.",
      powered: ["Tableau semantic model", "MuleSoft API catalog in Exchange"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.tableau("lineage", { tap: true }));
        const g = C.baseGraph(); g.compact = true;
        C.graph(g); C.tab("flow");
        C.caption("Tap the On-time completion tile to trace it backwards.");
        C.extra(lineageTable(0));
        await x.tap("lineage");
        x.left(S.tableau("lineage"));
        const hops = [
          ["tab", "On-Time Completion %", "Tableau measure \u00b7 On-Time Completion % (certified, semantic model)"],
          ["lake", "curated.job", "canonical \u00b7 majority_completion \u2264 target_completion \u00b7 curated.job"],
          ["proc", "DataWeave", "job-sync-papi \u00b7 target_completion \u2190 est_complete | TargetCompDT | targetCompletion | target_done"],
          ["s-psa", "TargetCompDT", "psa-sapi \u00b7 source field TargetCompDT"],
          ["psa", "GET /api/Jobs", "endpoint \u00b7 GET /api/Jobs/{id} (illustrative)"],
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
        C.caption("From CJ's KPI, through Tableau and MuleSoft, back to each platform's field and API.");
      },
    },

    /* ---------- Act 6 */
    {
      id: "6.1", act: "6", title: "From 50 locations to 900",
      desc: "The network grows from 50 locations to 900, and a storm quadruples volume. The design doesn't change; capacity does.",
      say: "CJ's planning for 900. The integration doesn't change shape; it adds capacity. A hailstorm in Ohio is a busy afternoon, not an outage.",
      powered: ["MuleSoft on CloudHub", "Horizontal scaling", "Persistent queues"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        let idx = 0, surge = false, amb;
        const draw = () => {
          x.left(S.scale(idx, surge));
          C.graph(scaleGraph(idx, surge));
          C.extra(scalePanel(idx, surge));
          if (amb) amb.stop();
          const w = D.scale[idx].workers;
          const paths = [];
          for (let i = 0; i < w; i++) paths.push(["src", "q", "w" + i, "lake"]);
          amb = C.ambient(x.t, paths, { every: surge ? 90 : [520, 300, 170][idx], dur: 1100, kind: surge ? "hot" : "poll", r: 4, delay: 50 });
          const s = D.scale[idx];
          C.clock([{ l: "Locations", n: s.loc, v: "{n}" }, { l: "Workers", n: s.workers, v: "{n}", state: "ok" }, { l: "Events / day", n: surge ? s.peak : s.events, v: "{n}", state: surge ? "warn" : "" }, { l: "SLA-lane latency", v: s.latency, state: "ok" }]);
        };
        C.reset(); C.tab("flow");
        C.caption("Today's volume: one worker, plenty of headroom.");
        draw();
        await N("milestones-papi \u00b7 1 worker \u00b7 2,700 events/day \u00b7 CPU 41% \u00b7 queue depth 6", "One worker handles today's volume");
        await x.tap("sc-1"); idx = 1; draw();
        C.ring("w1", "new");
        C.caption("430 locations on Jan 1: a second worker, same APIs.");
        await N("scale-out \u00b7 replicas 1 \u2192 2 \u00b7 no redeploy of logic \u00b7 23,200 events/day \u00b7 latency 2m05s", "A second worker is added automatically");
        await x.tap("sc-2"); idx = 2; draw();
        C.ring("w2", "new"); C.ring("w3", "new");
        C.caption("900 locations: four workers. Latency stays under 5 minutes.");
        await N("scale-out \u00b7 replicas 2 \u2192 4 \u00b7 48,600 events/day \u00b7 p95 latency 2m31s \u2264 5m target", "Four workers at 900 locations; still under 5 minutes");
        await x.tap("surge"); surge = true; draw();
        C.ring("q", "err");
        C.tag("q", "queue depth 78% \u00b7 draining", "warn", { stay: true });
        C.caption("Storm surge: the queue absorbs the spike and drains. Nothing is dropped.");
        await N("surge \u00b7 194,400 events/day \u00b7 persistent queue absorbs backlog \u00b7 drain ETA ~6 min \u00b7 0 dropped", "The queue absorbs the spike; nothing is dropped");
      },
    },
    {
      id: "6.2", act: "6", title: "Onboarding a franchise is configuration, not code",
      desc: "Connecting a new franchise is a short form, not a project. Its jobs start flowing on the next cycle.",
      say: "This is the 'bazooka' question. You don't start with the bazooka. Wave 1 is Dash and FranConnect. Every franchise after that is a form, not a project.",
      powered: ["MuleSoft configuration properties", "FranConnect reference data"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.onboard(false));
        C.graph(C.baseGraph()); C.tab("flow"); C.setClock("10:05:00");
        C.caption("Go live adds a reference row and a credential. No deployment.");
        C.ambient(x.t, POLLS, { every: 650 });
        C.clock([{ l: "Franchises live", n: 430, v: "{n}" }, { l: "Deployments", n: 0, v: "{n}" }, { l: "Jobs from OH-0731", n: 0, v: "{n}" }]);
        await N("integration hub \u00b7 new connection OH-0731 \u00b7 platform PSA \u00b7 awaiting go-live", "A new franchise connection is ready to go live");
        await x.tap("golive");
        C.ring("lake", "new"); C.tag("lake", "INSERT ref.franchise OH-0731", "new");
        await N("ref.franchise \u00b7 INSERT OH-0731 (region Central, platform PSA) \u00b7 cache invalidated", "Franchise added to the reference list");
        C.ring("s-psa", "new"); C.tag("s-psa", "+ tenant OH-0731", "new");
        await N("secure-properties \u00b7 vault://spar/psa/OH-0731 registered \u00b7 psa-sapi tenant list reloaded \u00b7 deployments 0", "Credential registered; no code, no deployment");
        x.left(S.onboard(true));
        C.clock([{ l: "Franchises live", n: 431, v: "{n}", state: "ok" }, { l: "Deployments", n: 0, v: "{n}", state: "ok" }, { l: "Jobs from OH-0731", n: 0, v: "{n}" }]);
        await C.burst(["psa", "s-psa", "proc", "dq", "lake"], x.t, 8, { gap: 160 });
        C.tag("lake", "+23 jobs \u00b7 OH-0731", "ok");
        await N("psa-sapi \u00b7 first sync OH-0731 \u00b7 23 open jobs \u2192 job-sync \u2192 dq 23/23 \u2192 11:11", "Dayton North's first 23 jobs arrived");
        C.clock([{ l: "Franchises live", n: 431, v: "{n}", state: "ok" }, { l: "Deployments", n: 0, v: "{n}", state: "ok" }, { l: "Jobs from OH-0731", n: 23, v: "{n}", state: "ok" }]);
      },
    },

    /* ---------- Act 7 */
    {
      id: "7.1", act: "7", title: "PSA goes down",
      desc: "One of the job platforms goes down. Monitoring catches it within a minute, and incoming jobs are held safely.",
      say: "Vendors will have bad days. The question is whether you find out from a monitor or from CJ.",
      powered: ["Anypoint Monitoring", "Functional Monitoring", "Visualizer", "Retry + circuit breaker"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.tableau("health-ok"));
        const g = C.baseGraph();
        C.graph(g); C.tab("flow"); C.setClock("14:13:58");
        C.caption("Anypoint Visualizer: the live application network.");
        const amb = C.ambient(x.t, POLLS.slice(), { every: 450 });
        C.clock([{ l: "Functional monitor", v: "psa-sapi \u00b7 every 1 min", state: "ok" }, { l: "Queued", n: 0, v: "{n}" }, { l: "Lost", n: 0, v: "{n}", state: "ok" }]);
        await N("functional-monitor \u00b7 5/5 health checks 200 \u00b7 p95 220 ms", "All five connections healthy");
        await x.sleep(500);
        amb.paths = amb.paths.filter((p) => p[1] !== "psa");
        C.node("psa", "err"); C.ring("psa", "err");
        await C.packet(["s-psa", "psa"], x.t, { kind: "err", finalState: "err", dur: 400 });
        C.tag("psa", "503 Service Unavailable", "err", { stay: true });
        await N("functional-monitor \u00b7 GET psa/health \u2192 503 Service Unavailable \u00b7 14:14:00", "A scheduled check caught PSA failing at 2:14 PM");
        for (const [n, s] of [[1, "2 s"], [2, "8 s"], [3, "32 s"]]) {
          await C.packet(["s-psa", "psa"], x.t, { kind: "err", dur: 300, finalState: "err" });
          C.tag("s-psa", `retry ${n} \u00b7 ${s} \u00b7 503`, "warn");
          await x.sleep(250);
        }
        C.node("s-psa", "err"); C.edge("psa", "s-psa", "err");
        await N("psa-sapi \u00b7 retries 2s/8s/32s exhausted \u2192 circuit OPEN 10 min \u2192 events to persistent queue", "Calls to PSA paused; new events are held safely");
        C.node("mon", "err"); C.ring("mon", "err");
        C.tag("s-psa", "queued \u00b7 0 lost", "warn", { stay: true, dy: 74 });
        C.clock([{ l: "Functional monitor", v: "PSA failing", state: "err" }, { l: "Queued", n: D.outage.queued, v: "{n}", state: "warn", dur: 2400 }, { l: "Lost", n: 0, v: "{n}", state: "ok" }, { l: "Franchises affected", n: D.outage.franchises, v: "{n}" }]);
        x.left(S.tableau("health-amber"));
        C.caption("PSA is red. Events are queued, not lost. CJ's Integrations working tile is amber.");
        await N("tableau \u00b7 integrations_working 5 \u2192 4 \u00b7 tile state amber \u00b7 alert \u2192 on-call", "CJ's dashboard shows it, and on-call is paged");
      },
    },
    {
      id: "7.2", act: "7", title: "The alert, the trace and the recovery",
      desc: "The on-call owner gets the alert, sees exactly what failed, and the system recovers on its own with nothing lost.",
      say: "Seventeen minutes, zero data lost, and nobody had to be watching. The fix knowledge lives in the runbook and the platform, not in one person's head.",
      powered: ["Anypoint Monitoring alerts", "Dashboards", "Tracing"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.failAlert(false));
        C.setClock("14:15:00");
        const dash = (st) => C.monitor(`<div class="mon">
          <div class="mon-h">Anypoint Monitoring \u00b7 psa-sapi <span class="pill ${st === "ok" ? "ok" : "err"}">${st === "ok" ? "Recovered 2:31 PM" : "Alert firing"}</span></div>
          <div class="mon-grid">
            <div class="mon-card"><div class="mc-k">Error rate</div><svg viewBox="0 0 200 60"><polyline class="draw" points="0,56 40,56 70,56 80,8 100,6 130,7 150,8 ${st === "ok" ? "160,56 200,56" : "170,7 200,6"}" fill="none" stroke="#ff5a62" stroke-width="2.5"/></svg></div>
            <div class="mon-card"><div class="mc-k">Response time (p95)</div><svg viewBox="0 0 200 60"><polyline class="draw" points="0,48 40,46 70,47 80,12 110,10 150,12 ${st === "ok" ? "165,46 200,47" : "200,11"}" fill="none" stroke="#f5b942" stroke-width="2.5"/></svg></div>
            <div class="mon-card biz"><div class="mc-k">PuroClean jobs synced / hour <small>business metric</small></div><svg viewBox="0 0 200 60"><polyline class="draw" points="0,20 40,18 70,19 80,44 120,46 150,45 ${st === "ok" ? "160,6 175,12 200,19" : "200,45"}" fill="none" stroke="#5aa9e6" stroke-width="2.5"/></svg></div>
          </div>
          ${st === "alert" ? "" : `<div class="trace"><div class="mc-k">Trace \u00b7 one failed transaction \u00b7 PSA job P-24-55871</div>
            ${[["psa-sapi GET /api/Jobs/Changes", 0, 18, "err", "503"], ["retry 1", 20, 6, "warn", "503"], ["retry 2", 30, 10, "warn", "503"], ["retry 3", 46, 14, "warn", "503"], ["queued (circuit open)", 62, 26, "info", "held"], ["replayed \u2192 job-sync \u2192 11:11", 90, 10, st === "ok" ? "ok" : "info", st === "ok" ? "200" : "pending"]]
              .map(([l, s, w, c, r], i) => `<div class="tr-row" style="animation-delay:${i * 180}ms"><span class="tr-l">${l}</span><span class="tr-bar"><span class="${c}" style="left:${s}%;width:${w}%"></span></span><span class="tr-r ${c}">${r}</span></div>`).join("")}
          </div>`}</div>`);
        const g = C.baseGraph();
        C.graph(g); C.node("psa", "err"); C.node("s-psa", "err");
        dash("alert"); C.tab("monitor");
        C.caption("The alert names the API, the error, the franchises affected and the runbook.");
        C.clock([{ l: "Outage", v: "running", state: "err" }, { l: "Queued", n: D.outage.queued, v: "{n}", state: "warn" }, { l: "Lost", n: 0, v: "{n}", state: "ok" }]);
        await N("alert \u00b7 rule psa-sapi error_rate > 20% for 1m \u2192 FIRING \u00b7 notify on-call (push, email)", "The on-call owner is paged");
        await x.tap("openAlert");
        x.left(S.failAlert(true));
        await N("alert \u00b7 context attached: 37 franchises, 1,284 queued, runbook RB-PSA-01", "The alert explains impact and links the runbook");
        await x.tap("trace");
        dash("trace");
        await N("trace \u00b7 correlation-id 7f3c\u2026a91 \u00b7 GET 503 \u2192 3 retries \u2192 queued \u00b7 0 data loss", "One transaction, every hop, in order");
        await x.sleep(1600);
        C.tab("flow"); C.setClock("14:31:00");
        C.caption("2:31 PM: PSA recovers. The circuit closes and the queue replays in order.");
        await C.packet(["s-psa", "psa", "s-psa"], x.t, { kind: "q", dur: 400 });
        C.node("psa", "ok"); C.node("s-psa", "ok"); C.edge("psa", "s-psa", "ok");
        C.tag("psa", "200 OK \u00b7 circuit CLOSED", "ok", { stay: true });
        await N("psa-sapi \u00b7 health 200 \u00b7 circuit HALF-OPEN \u2192 CLOSED \u00b7 replay queue FIFO", "PSA is back; held events replay in order");
        C.clock([{ l: "Outage", v: "17 min" }, { l: "Replayed", n: D.outage.queued, v: "{n}", state: "ok", dur: 2600 }, { l: "Lost", n: 0, v: "{n}", state: "ok" }, { l: "Duplicates", n: 0, v: "{n}", state: "ok" }]);
        await C.burst(["s-psa", "proc", "dq", "lake"], x.t, 12, { gap: 110, kind: "replay" });
        C.tag("lake", "1,284 replayed \u00b7 0 lost", "ok", { stay: true });
        await N("replay \u00b7 1,284 events \u00b7 ordered by source_ts \u00b7 idempotent MERGE \u00b7 0 duplicates", "All 1,284 events replayed; none lost, none doubled");
        C.ambient(x.t, POLLS, { every: 500 });
        dash("ok"); await x.sleep(900); C.tab("monitor");
        C.caption("Seventeen minutes, 1,284 events replayed in order, zero lost.");
      },
    },
    {
      id: "7.3", act: "7", title: "Security: Nick's gating item",
      desc: "Every request passes through the same security checks at the gateway, under independently certified controls.",
      say: "SOC 2 was the gate. It's there, alongside ISO 27001 and the rest. And control stays with you: MuleSoft runs the platform, PuroClean owns the policies, the credentials and the definitions.",
      powered: ["Anypoint API Manager", "Anypoint Security", "MuleSoft Trust Center"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.security());
        const pg = policyGraph();
        C.graph(pg); C.tab("flow"); C.setClock("14:40:00");
        const SR = D.security;
        C.extra(`<div class="srm"><div class="srm-h">Shared responsibility model</div><div class="srm-cols">
          <div><b>MuleSoft</b><ul>${SR.mulesoft.map((s) => `<li>${s}</li>`).join("")}</ul></div>
          <div class="pc"><b>PuroClean</b><ul>${SR.puroclean.map((s) => `<li>${s}</li>`).join("")}</ul></div></div>
          <div class="srm-src">Source: the security documentation PuroClean already received (Trust Center, Anypoint Security, Security Capabilities).</div></div>`);
        C.caption("Every request passes the same policy chain at the gateway. No code changes.");
        const msgs = ["client_id 3f\u2026 valid", "JWT verified \u00b7 scope jobs:read", "payload depth 4 \u2264 10", "12 / 600 per min", "PII fields tokenized"];
        await C.packet(pg._ids, x.t, { dur: 340, onHop: async (b) => { const i = Number(b.slice(1)); if (b[0] === "p") C.tag(b, msgs[i], "ok"); } });
        await N("api-manager \u00b7 client-id \u2713 \u2192 oauth2 \u2713 \u2192 threat-protection \u2713 \u2192 rate-limit \u2713 \u2192 tokenization \u2713 \u2192 200", "A normal request passes all five checks");
        pg._ids.forEach((id) => C.node(id, ""));
        C.caption("A malformed payload is stopped at JSON/XML Threat Protection.");
        await C.packet(pg._ids.slice(0, 4), x.t, { kind: "err", dur: 340, finalState: "err" });
        C.tag("p2", "depth 64 > 10 \u00b7 400", "err", { stay: true });
        await N("api-manager \u00b7 json-threat-protection \u00b7 max depth 64 > 10 \u2192 400 rejected \u00b7 never reaches psa-sapi", "A malicious payload is blocked at the gateway");
        C.clock([{ l: "Policies", v: "5 at gateway" }, { l: "Blocked", n: 1, v: "{n}", state: "err" }, { l: "Code changes", n: 0, v: "{n}", state: "ok" }]);
      },
    },
    {
      id: "7.4", act: "7", title: "\"If you win the lottery, what happens?\"",
      desc: "The whole connection layer is documented and monitored, so keeping it running doesn't depend on one person.",
      say: "CJ asked the question: if you win the lottery, what happens? With this, the knowledge stays with PuroClean. Nick's still the architect. He just isn't the only one who can keep it running.",
      powered: ["Anypoint Exchange", "Anypoint Monitoring"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.compare());
        const g = C.baseGraph(); g.compact = true;
        g.nodes.forEach((n) => { n.state = "ok"; if (n.id === "quar" || n.id === "notify") n.kind = n.kind.replace(" dim", ""); });
        C.graph(g); C.tab("flow");
        C.ambient(x.t, POLLS.concat(FLOWS), { every: 300 });
        C.extra(`<div class="exch"><div class="ex-h">Documented in Anypoint Exchange</div>${["dash-sapi", "psa-sapi", "albi-sapi", "jobsite-sapi", "franconnect-sapi", "job-sync-papi", "milestones-papi", "notification-api", "purologic-canonical-job"].map((a) => `<div class="ex-a"><b>${a}</b><small>spec \u00b7 owner \u00b7 runbook</small></div>`).join("")}</div>`);
        C.caption("The whole application network: documented, monitored and owned by PuroClean.");
        await N("exchange \u00b7 9 assets \u00b7 each with RAML/OAS spec, owner, SLA, runbook \u00b7 monitored by 5 functional checks", "Every piece is documented, owned and monitored");
        C.clock([{ l: "APIs documented", n: 9, v: "{n} / 9", state: "ok" }, { l: "Runbooks", n: 9, v: "{n}" }, { l: "Monitors", n: 5, v: "{n}", state: "ok" }]);
      },
    },

    /* ---------- Act 8 */
    {
      id: "8.1", act: "8", title: "Tableau Pulse: the dashboard comes to CJ",
      desc: "Tableau Pulse sends CJ a morning digest of what changed, without opening a dashboard.",
      say: "CJ wants to be proactive, not reactive. This is the first step: the dashboard comes to you.",
      powered: ["Tableau Pulse"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.pulse());
        C.graph(pulseGraph()); C.tab("flow");
        C.caption("Pulse watches the certified metrics and flags what changed.");
        await C.packet(["views", "sem"], x.t);
        C.tag("sem", "61 open \u00b7 Ohio", "");
        await N("pulse \u00b7 metric open_water_jobs \u00b7 grain daily \u00b7 dims state, metro, franchise", "Pulse reads the certified metric");
        await C.packet(["sem", "ins"], x.t);
        C.tag("ins", "+38% vs 4-wk avg", "warn", { stay: true });
        await N("pulse \u00b7 insight UNUSUAL_CHANGE \u00b7 +38% vs 4-week mean \u00b7 drivers Columbus, Dayton", "An unusual jump in Ohio water jobs");
        await C.packet(["ins", "dig"], x.t, { kind: "res" });
        C.tag("dig", "delivered 7:30 AM", "ok", { stay: true });
        await N("pulse \u00b7 digest \u2192 CJ \u00b7 channels mobile, email, Slack \u00b7 7:30 AM", "The digest lands on CJ's phone");
        C.extra(linCard("Pulse metric definition", [
          ["Metric", "Open water jobs", "certified, semantic model"],
          ["Insight", "unusual change vs 4-week average (\u00b1 25%)", "illustrative threshold"],
          ["Delivered", "daily digest to CJ (mobile, email or Slack)", "7:30 AM"],
        ]));
      },
    },
    {
      id: "8.2", act: "8", title: "What's next, when the data is trusted",
      desc: "What becomes possible once the data is trusted. None of it is part of Stage 1.",
      say: "Dashboards first, with an AI proactive mindset. Weather, agents and Data Cloud come once the data is trusted. None of it is Stage 1.",
      powered: ["Roadmap only"],
      async run(x) {
        const N = (a, b) => C.narrate(a, b, x.t);
        x.left(S.whatsNext());
        C.reset();
        C.lineage(linCard("Stage roadmap (CJ's three stages)", [
          ["Stage 1", "Visibility and adoption: every job, one record, Tableau", "this project"],
          ["Stage 2", "Compliance: jobs moving on time, nothing stuck in limbo", "next"],
          ["Stage 3", "Profitability: QuickBooks Online, margin by job and franchise", "later"],
        ]));
        C.tab("lineage");
        C.caption("Each stage builds on the same connection layer.");
        await N("roadmap \u00b7 Stage 1 connection layer reused by Stage 2 (compliance) and Stage 3 (QuickBooks Online)", "Each stage reuses what Stage 1 builds");
      },
    },

    { id: "arch", act: "arch", layout: "full", page: "arch", title: "How it fits together", say: "Tap any block for what it does. This is the whole Stage 1 picture on one page.", powered: [] },
    { id: "close", act: "close", layout: "full", page: "close", title: "Start small. Grow to 900. Know first.", say: "Wave 1 is Dash and FranConnect before the holidays. Everything after that reuses what we build.", powered: [] },
  ];

  return { acts, steps };
})();
