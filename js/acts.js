/* Storyboard steps. IDs match storyboard.md. Each step's run() is an async script driven by guided taps. */
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

  const dashMap = [
    ["loss_type: \"H2O\"", "loss_type: \"Water\"", "value normalized"],
    ["loss_date (local, -06:00)", "date_of_loss (UTC)", "timezone normalized"],
    ["dispatched_at", "dispatch", ""],
    ["accepted_at", "received_accepted", ""],
    ["first_on_site", "started", "CJ: \"we call it job start\""],
    ["account DASH-M-0412/02", "franchise_id KS-0412", "from FranConnect"],
  ];

  const rosetta = (active) => {
    const rows = [
      ["Date of Loss", "date_of_loss"], ["Dispatch", "dispatch"], ["Received/Accepted", "received_accepted"],
      ["Contacted", "contacted"], ["Inspected", "inspected"], ["Started", "started"], ["Target Completion", "target_completion"], ["Loss type", "loss_type"],
    ];
    const vk = ["dash", "psa", "albi", "jobsite"];
    return `<div class="rosetta"><div class="ro-h">Rosetta Stone \u00b7 every platform's fields \u2192 PuroLogic Dates <span class="ill">vendor field names illustrative</span></div>
      <table><thead><tr><th>PuroLogic date</th>${vk.map((k) => `<th class="${k === active ? "on" : ""}">${V[k].name}</th>`).join("")}<th>Canonical</th></tr></thead>
      <tbody>${rows.map(([l, f], i) => `<tr class="${f === "started" ? "key" : ""}" style="animation-delay:${i * 70}ms"><td>${l}</td>${vk.map((k) => `<td class="${k === active ? "on" : ""}"><code>${C.esc(V[k].fields[f])}</code></td>`).join("")}<td><code class="canon">${f}</code></td></tr>`).join("")}</tbody></table></div>`;
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

  const policyGraph = () => {
    const P = D.security.policies;
    const nodes = [{ id: "req", label: "Vendor request", sub: "PSA \u2192 API", x: 10, y: 60, w: 120, h: 56, kind: "src" }];
    const short = (p) => p.replace(" Enforcement", "").replace(" Token", "").replace("JSON/XML ", "");
    const sub = (p) => (p.startsWith("JSON/XML") ? "JSON/XML policy" : "API Manager policy");
    P.forEach((p, i) => nodes.push({ id: "p" + i, label: short(p), sub: sub(p), x: 150 + i * 145, y: 60, w: 130, h: 56, kind: "proc" }));
    nodes.push({ id: "api", label: "psa-sapi", sub: "System API", x: 150 + P.length * 145, y: 60, w: 110, h: 56, kind: "sys" });
    const ids = nodes.map((n) => n.id);
    return { w: 1000, h: 140, groups: [{ label: "Anypoint API Manager \u00b7 policies at the gateway, no code changes", x: 140, y: 6, w: 720, h: 126 }], nodes, edges: ids.slice(1).map((b, i) => [ids[i], b]), _ids: ids };
  };

  const scalePanel = (idx, surge) => {
    const s = D.scale[idx];
    const q = surge ? 78 : 6 + idx * 4;
    return `<div class="sc-panel">
      <div class="sc-h">CloudHub workers \u00b7 Milestones Process API</div>
      <div class="workers">${[0, 1, 2, 3].map((i) => `<div class="wk ${i < s.workers ? "on" : ""}"><span>worker ${i + 1}</span><b>${i < s.workers ? (surge ? "92%" : "41%") : "idle"}</b></div>`).join("")}</div>
      <div class="sc-meters">
        <div><div class="sc-l">Milestone events / day</div><div class="sc-v">${(surge ? s.peak : s.events).toLocaleString()}</div></div>
        <div><div class="sc-l">Queue depth</div><div class="meter"><span style="width:${q}%" class="${surge ? "warn" : ""}"></span></div><div class="sc-s">${surge ? "surge \u00b7 draining in ~6 min" : "steady"}</div></div>
        <div><div class="sc-l">SLA-lane latency</div><div class="sc-v ok">${s.latency}</div><div class="sc-s">target \u2264 5 min</div></div>
      </div>
      <div class="sc-note">Same APIs, same canonical model, same 11:11 tables at every size. Capacity is added horizontally. <span class="ill">volumes illustrative</span></div>
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
      ${rows.slice(0, n).map((r, i) => `<div class="lin-row" style="animation-delay:${i * 60}ms"><div class="lin-k">${r[0]}</div><div class="lin-v">${C.esc(r[1])}</div><div class="lin-s">${r[2]}</div></div>${i < n - 1 ? '<div class="lin-arrow">\u2193</div>' : ""}`).join("")}</div>`;
  };

  /* ================================================================ steps */
  const steps = [
    { id: "hero", act: "hero", layout: "full", title: "Every franchise job, one trusted record", page: "hero", say: "This is the integration strategy for Stage 1: how every franchise's job data gets into one trusted record, and how CJ sees it.", powered: [] },

    /* ---------- Act 1 */
    {
      id: "1.1", act: "1", title: "A new water loss, logged in Dash",
      say: "A franchise in Wichita logs a water loss in Dash, the way they do today. Nothing about their day changes. Watch the right side.",
      powered: ["Franchise's SPAR platform", "No change for the franchise"],
      async run(x) {
        x.left(S.jobApp({ isNew: true, dates: { date_of_loss: "6:12 AM" }, actions: [{ label: "Save job", tap: "save" }], clock: "6:12 AM" }));
        C.graph(C.baseGraph()); C.tab("flow"); C.setClock("06:12:10");
        C.caption("Listening for new and changed jobs on every SPAR platform.");
        C.clock([{ l: "SLA lane", v: "every 5 min", s: "4 objects (illustrative)" }, { l: "Daily lane", v: "2:00 AM" }, { l: "Platforms", v: "5 connected" }, { l: "Dash feed today", v: "every ~2 hrs", s: "for comparison" }]);
        await C.log([
          { lvl: "info", raw: "scheduler \u00b7 dash-sapi poll ok \u00b7 0 changes", wait: 200 },
          { lvl: "info", raw: "scheduler \u00b7 psa-sapi poll ok \u00b7 0 changes", wait: 200 },
          { lvl: "info", raw: "scheduler \u00b7 albi-sapi poll ok \u00b7 2 changes", wait: 200 },
          { lvl: "ok", raw: "health \u00b7 5/5 System APIs healthy", exec: "All five connections are healthy", wait: 100 },
        ], x.t);
        await x.tap("save");
        x.left(S.jobApp({ dates: { date_of_loss: "6:12 AM" }, actions: [{ label: "Dispatch", tap: "dispatch" }], clock: "6:19 AM" }));
        await x.tap("dispatch");
        x.left(S.jobApp({ dates: datesUpTo("received_accepted"), flash: "received_accepted", clock: "6:24 AM" }));
        await C.log([{ lvl: "info", at: "06:24:00", raw: "Dash \u00b7 job D-889214 updated (franchise side)", exec: "The franchise saved and dispatched the job in Dash" }], x.t);
      },
    },
    {
      id: "1.2", act: "1", title: "MuleSoft picks it up and translates it",
      say: "One System API per platform speaks Dash. One Process API translates everything into PuroClean's language and attaches the franchise from FranConnect. That translation is built once.",
      powered: ["MuleSoft Anypoint", "System + Process APIs", "DataWeave", "FranConnect reference"],
      async run(x) {
        x.left(S.jobApp({ dates: datesUpTo("received_accepted"), clock: "6:24 AM" }));
        C.graph(C.baseGraph()); C.tab("flow"); C.setClock("06:24:05");
        C.caption("The Dash System API picks up the change on its next 5-minute poll.");
        C.payload({
          left: { title: "Dash payload (source)", obj: V.dash.payload, hl: ["loss_type", "loss_date", "dispatched_at", "accepted_at", "first_on_site", "account"] },
          right: { title: "PuroLogic canonical record", obj: D.canonical, hl: ["loss_type", "date_of_loss", "dispatch", "received_accepted", "started", "franchise_id", "region", "state"] },
          map: dashMap,
        });
        await C.packet(["dash", "s-dash"], x.t);
        await C.log([
          { lvl: "http", raw: `GET ${code(V.dash.endpoint.replace("{watermark}", "2027-02-16T12:19:00Z"))} \u2192 200 OK \u00b7 1 changed \u00b7 184 ms`, exec: "Dash System API picked up 1 new job" },
        ], x.t);
        C.caption("The Job Sync Process API translates Dash's fields into PuroLogic Dates.");
        await C.packet(["s-dash", "proc"], x.t);
        await C.log([
          { lvl: "info", raw: "job-sync \u00b7 DataWeave dash-to-purologic.dwl v1.3", exec: "Translating Dash's fields into PuroClean's language" },
          { lvl: "info", raw: `map ${code('loss_type "H2O"')} \u2192 ${code('"Water"')} \u00b7 ${code("first_on_site")} \u2192 ${code("started")}` },
          { lvl: "info", raw: "map 4 dates \u00b7 timezone America/Chicago \u2192 UTC" },
        ], x.t);
        C.caption("FranConnect adds the franchise, region and state (cached daily reference).");
        await C.packet(["fran", "s-fran", "proc"], x.t, { kind: "ref", dur: 450 });
        await C.log([{ lvl: "ok", raw: `enrich \u00b7 account DASH-M-0412/02 \u2192 franchise ${code("KS-0412")} \u00b7 Central \u00b7 KS \u00b7 cache hit 3 ms`, exec: "Matched the job to PuroClean Wichita East, Central Region" }], x.t);
        await x.sleep(500);
        C.tab("payload");
        C.caption("Same job, now in PuroClean's language. Highlighted fields were mapped or added.");
      },
    },
    {
      id: "1.3", act: "1", title: "Into the 11:11 lake, and the SLA clock starts",
      say: "Forty seconds from the franchise's screen to the lake. It's an upsert, not an insert, so if Dash resends the job we update it rather than duplicate it.",
      powered: ["MuleSoft Database Connector", "11:11 SQL Server lake (Nick's environment)"],
      async run(x) {
        x.left(S.jobApp({ dates: datesUpTo("received_accepted"), clock: "6:24 AM" }));
        const g = C.baseGraph();
        C.graph(g); ["dash", "s-dash", "fran", "s-fran"].forEach((n) => C.node(n, "ok")); C.tab("flow"); C.setClock("06:24:38");
        C.caption("Data-quality checks pass, then the record is upserted into 11:11.");
        await C.packet(["proc", "dq"], x.t);
        await C.log([{ lvl: "ok", raw: "dq \u00b7 14 rules passed \u00b7 dedupe: no match on (address, date_of_loss, carrier_claim)", exec: "Quality checks passed; not a duplicate" }], x.t);
        await C.packet(["dq", "lake"], x.t);
        await C.log([
          { lvl: "sql", raw: `${code("MERGE INTO staging.job_milestone USING @batch ON source_system = 'DASH' AND source_job_id = 'D-889214'")}`, exec: "Written to the PuroClean data lake" },
          { lvl: "sql", raw: `${code("EXEC curated.usp_promote_job @job_id = 'JOB-KS-24817'")} \u00b7 1 job \u00b7 3 milestones` },
          { lvl: "ok", raw: "end-to-end 41 s \u00b7 Dash save 6:24:00 \u2192 curated 6:24:41", exec: "41 seconds from the franchise's screen to the lake" },
        ], x.t);
        x.left(S.jobApp({ dates: datesUpTo("received_accepted"), synced: "6:24:41 AM", clock: "6:24 AM" }));
        C.clock([{ l: "End-to-end", v: "41 s", state: "ok" }, { l: "Rows written", v: "1 job \u00b7 3 dates" }, { l: "SLA timer", v: "Contacted due 6:54", s: "30 min (illustrative)", state: "run" }, { l: "Write mode", v: "upsert", s: "no duplicates" }]);
        await x.sleep(400);
        C.tab("logs");
      },
    },

    /* ---------- Act 2 */
    {
      id: "2.1", act: "2", title: "Same job, four platforms, one language",
      say: "CJ called this the Rosetta Stone. 'Arrive on site,' 'first on site,' 'job began': all of them become PuroLogic's Started. These are PuroClean's own 18 Dates. Nick owns the definitions; MuleSoft enforces them.",
      powered: ["DataWeave", "PuroLogic canonical model", "Anypoint Exchange"],
      async run(x) {
        const show = (vk) => {
          x.left(S.jobApp({ vendor: vk, switcher: true, dates: { ...datesUpTo("inspected"), started: "8:05 AM", target_completion: "Feb 19" }, flash: "started", clock: "8:05 AM" }));
          C.extra(rosetta(vk));
        };
        C.reset(); C.tab("flow"); C.setClock("08:05:00");
        C.caption("Each platform labels the same moment differently. All of them map to PuroLogic's Dates.");
        C.payload({
          sources: ["dash", "psa", "albi", "jobsite"].map((k) => ({ title: V[k].name, obj: V[k].payload, hl: [V[k].fields.started, V[k].fields.loss_type.split(":")[0]], cls: "src" })),
          right: { title: "PuroLogic canonical (one record)", obj: D.canonical, hl: ["started", "loss_type"] },
          map: ["dash", "psa", "albi", "jobsite"].map((k) => [`${V[k].name} \u00b7 ${V[k].fields.started}`, "started", V[k].labels.started]),
          mapTitle: "Four labels, one canonical field",
        });
        show("dash");
        for (const vk of ["psa", "albi", "jobsite"]) {
          await x.tap("v-" + vk);
          show(vk);
          await C.log([{ lvl: "info", raw: `${V[vk].name.toLowerCase()}-to-purologic.dwl \u00b7 ${code(V[vk].fields.started)} \u2192 ${code("started")} \u00b7 ${code(V[vk].fields.loss_type)} \u2192 ${code('"Water"')}`, exec: `${V[vk].name}'s "${V[vk].labels.started}" becomes PuroLogic's Started` }], x.t, { mirror: false });
        }
      },
    },
    {
      id: "2.2", act: "2", title: "Add a fifth platform",
      say: "Adding a platform means one new System API. Everything downstream is reused. That's the difference between a feed and a platform.",
      powered: ["Anypoint Exchange", "API-led connectivity"],
      async run(x) {
        x.left(S.addPlatform(false));
        const g = C.baseGraph();
        C.graph(g); C.tab("flow");
        C.caption("Today: four SPAR platforms plus FranConnect, each with its own System API.");
        await x.tap("add");
        x.left(S.addPlatform(true));
        const g2 = C.baseGraph({
          addNodes: [
            { id: "new", label: "New platform", sub: "5th SPAR option", x: 14, y: 384, w: 118, h: 46, kind: "src new" },
            { id: "s-new", label: "new-sapi", sub: "System API \u00b7 new", x: 186, y: 384, w: 150, h: 46, kind: "sys new" },
          ],
          addEdges: [["new", "s-new"], ["s-new", "proc"]],
        });
        g2.groups[0].h = 430;
        g2.nodes.forEach((n) => { if (["proc", "dq", "lake", "tab"].includes(n.id)) { n.state = "reuse"; n.badge = "reused"; } });
        C.graph(g2);
        C.caption("One new System API. The Process API, canonical model, data quality, 11:11 tables and Tableau are reused unchanged.");
        C.extra(`<div class="exch"><div class="ex-h">Anypoint Exchange</div><div class="ex-a"><b>purologic-canonical-job</b> v1.3<small>used by 6 APIs</small></div><div class="ex-a"><b>job-sync-papi</b> v2.0<small>reused</small></div><div class="ex-a"><b>dq-rules-restoration</b> v1.1<small>reused</small></div></div>`);
        await C.packet(["new", "s-new", "proc", "dq", "lake"], x.t, { kind: "new" });
      },
    },

    /* ---------- Act 3 */
    {
      id: "3.1", act: "3", title: "Two lanes: near-real-time and daily",
      say: "Only four things need to be as live as possible, CJ's words. We spend real-time effort only where the SLA needs it; everything else runs once a day. We'll confirm which four with CJ.",
      powered: ["MuleSoft Scheduler + Batch", "Watermark incremental sync"],
      async run(x) {
        x.left(S.jobApp({ dates: datesUpTo("received_accepted"), tapDate: "contacted", clock: "6:41 AM" }));
        C.graph(slaGraph()); C.tab("flow"); C.setClock("06:41:00");
        C.caption("The four SLA objects ride the 5-minute lane. Today, Dash syncs every couple hours.");
        C.clock([{ l: "SLA timer", v: "Contacted due 6:54", state: "run", s: "30 min (illustrative)" }, { l: "SLA lane", v: "\u2264 5 min" }, { l: "Daily lane", v: "2:00 AM" }]);
        await x.tap("d-contacted");
        x.left(S.jobApp({ dates: datesUpTo("contacted"), flash: "contacted", clock: "6:41 AM" }));
        await C.packet(["m3", "fast", "rule", "lake1"], x.t);
        await C.log([
          { lvl: "info", at: "06:44:12", raw: "milestones-papi \u00b7 poll \u00b7 1 change (contacted)", exec: "Contacted time picked up in 3 min 12 s" },
          { lvl: "ok", raw: "sla \u00b7 JOB-KS-24817 contacted 17 min after received_accepted \u00b7 SLA met", exec: "SLA met: contacted in 17 minutes" },
        ], x.t);
        C.clock([{ l: "SLA timer", v: "Met \u00b7 17 min", state: "ok", s: "30 min (illustrative)" }, { l: "Pickup latency", v: "3m 12s" }, { l: "Daily lane", v: "next run 2:00 AM" }]);
      },
    },
    {
      id: "3.2", act: "3", title: "A missed SLA reaches the RD in time",
      say: "The RD finds out while it can still be fixed, not on next week's report.",
      powered: ["MuleSoft notification API", "FranConnect region mapping"],
      async run(x) {
        x.left(S.slaAlert(true));
        const g = C.baseGraph();
        g.nodes.forEach((n) => { if (n.id === "notify") n.kind = "proc"; });
        C.graph(g); C.tab("flow"); C.setClock("07:02:00");
        C.caption("An SLA rule fails for a Sacramento job. The notification layer routes it by region.");
        await C.packet(["s-psa", "proc", "notify"], x.t, { kind: "err", finalState: "err" });
        await C.log([
          { lvl: "warn", raw: "sla \u00b7 JOB-CA-11902 not contacted 34 min after received_accepted", exec: "A Sacramento job missed the 30-minute contact SLA" },
          { lvl: "info", raw: "route \u00b7 franchise CA-0219 \u2192 region West \u2192 RD on FranConnect" },
          { lvl: "ok", raw: "notify \u00b7 push + email sent to Regional Director, West", exec: "The West Region RD was alerted immediately" },
        ], x.t);
        await x.tap("open");
      },
    },

    /* ---------- Act 4 */
    {
      id: "4.1", act: "4", title: "Duplicate and incomplete records",
      say: "Robert put it best: we're not passing garbage to the data lake. Bad records are held back with a reason, not silently loaded.",
      powered: ["DataWeave validation", "MuleSoft error handling", "Quarantine table in 11:11"],
      async run(x) {
        x.left(S.frame("sync", `<div class="ja"><div class="ja-top"><span class="ja-app">Dash <em>(simulated)</em></span><span class="ja-fr">Master account DASH-M-0412</span></div>
          <div class="q-list"><div class="q-item"><b>Resubmitted</b> JOB-KS-24817 under sub-account /03<small>same address, date of loss and carrier claim</small></div>
          <div class="q-item bad"><b>New job</b> D-889301 \u00b7 loss type blank<small>sub-account /01</small></div></div>
          <div class="ja-actions"><button class="btn primary" data-tap="sync">Sync now</button></div></div>`, { clock: "9:12 AM" }));
        const g = C.baseGraph();
        C.graph(g); C.tab("flow"); C.setClock("09:12:00");
        C.caption("A multi-location master account resubmits a job, and another arrives with no loss type.");
        await x.tap("sync");
        await C.packet(["dash", "s-dash", "proc", "dq"], x.t, { finalState: "warn" });
        await C.log([{ lvl: "warn", raw: "dedupe \u00b7 match JOB-KS-24817 on (address, date_of_loss, carrier_claim) \u00b7 merged, 0 new rows", exec: "Duplicate caught and merged; no double count" }], x.t);
        await C.packet(["dash", "s-dash", "proc", "dq", "quar"], x.t, { kind: "err", finalState: "err" });
        await C.log([{ lvl: "err", raw: `dq \u00b7 D-889301 \u00b7 ${code("DQ-014 loss_type is required")} \u2192 quarantine.job (franchise KS-0412)`, exec: "Incomplete job held back with a reason, not loaded" }], x.t);
        C.payload({
          left: { title: "Incoming D-889301 (Dash)", obj: { job_no: "D-889301", account: "DASH-M-0412/01", loss_type: "", loss_date: "2027-02-16T08:40:00-06:00" }, hl: ["loss_type"] },
          right: { title: "quarantine.job", obj: { source_job_id: "D-889301", franchise_id: "KS-0412", reason_code: "DQ-014", reason: "loss_type is required", status: "held \u00b7 franchise notified", retry: "on next update" }, hl: ["reason_code", "reason", "status"] },
        });
      },
    },
    {
      id: "4.2", act: "4", title: "Data health, CJ's own KPI",
      say: "Under 20% usable today. This is how we watch that number move, franchise by franchise.",
      powered: ["Tableau", "11:11 curated views"],
      async run(x) {
        x.left(S.tableau("health"));
        C.reset();
        C.lineage(`<div class="lin"><div class="lin-h">"Franchises with usable data" \u00b7 how it's measured</div>
          <div class="lin-row"><div class="lin-k">Tableau measure</div><div class="lin-v">Usable Data % (certified)</div><div class="lin-s">semantic model</div></div><div class="lin-arrow">\u2193</div>
          <div class="lin-row"><div class="lin-k">Rule</div><div class="lin-v">franchise has \u2265 90% of jobs with all required PuroLogic Dates + loss type</div><div class="lin-s">illustrative threshold</div></div><div class="lin-arrow">\u2193</div>
          <div class="lin-row"><div class="lin-k">Inputs</div><div class="lin-v">curated.job completeness \u00b7 quarantine.job counts by reason</div><div class="lin-s">11:11</div></div>
          <div class="lin-row note"><div class="lin-k">Also on the sheet</div><div class="lin-v">"Integrations working": CJ's addition to the Data Collection KPIs</div><div class="lin-s">confirmed</div></div></div>`);
        C.tab("lineage");
        C.caption("Data health is a dashboard, not a guess: it's computed from the same quality rules.");
      },
    },

    /* ---------- Act 5 */
    {
      id: "5.1", act: "5", title: "CJ's Tuesday afternoon: network to one job",
      say: "CJ can do this in two minutes today; an RD takes two hours. Here it's four clicks for anyone with access, on data that's minutes old, from all four platforms.",
      powered: ["Tableau", "Semantic model, certified metrics", "Live connection to 11:11"],
      async run(x) {
        x.left(S.tableau("network", { tap: true }));
        C.reset(); C.tab("logs"); C.setClock("14:00:00");
        C.caption("Every click becomes a query against the 11:11 curated views.");
        const q = async (sql, rows, ms, exec) => {
          await C.log([{ lvl: "sql", raw: `${code(sql)} \u00b7 ${rows} rows \u00b7 ${ms} ms`, exec }], x.t);
          C.clock([{ l: "Query time", v: ms + " ms", state: "ok" }, { l: "Rows", v: String(rows) }, { l: "Freshness", v: "4 min", s: "SLA lane" }, { l: "Measure", v: "Open Jobs", s: "certified" }]);
        };
        await q("SELECT state, COUNT(*) FROM curated.v_open_jobs GROUP BY state", 51, 288, "Open jobs for every state, in 0.3 s");
        await x.tap("KS");
        x.left(S.tableau("kansas", { tap: true }));
        await q("SELECT loss_type, COUNT(*) FROM curated.v_open_jobs WHERE state = 'KS' GROUP BY loss_type", 4, 142, "Kansas: 47 open jobs by loss type");
        await x.tap("Water");
        x.left(S.tableau("wichita", { tap: true }));
        await q("SELECT job_id, franchise_name, loss_type, estimate_value, current_milestone FROM curated.v_open_jobs WHERE state='KS' AND metro='Wichita' AND loss_type IN ('Water','Fire')", 11, 97, "Wichita area: 11 water and fire jobs, $80.4K estimated");
        await x.tap("job");
        x.left(S.tableau("job"));
        await q("SELECT milestone, milestone_ts FROM curated.job_milestone WHERE job_id = 'JOB-KS-24817' ORDER BY seq", 7, 31, "One job's PuroLogic Dates, from Dash via MuleSoft");
      },
    },
    {
      id: "5.2", act: "5", title: "Same dashboard, the regional director's view",
      say: "Twelve or thirteen RDs, one dashboard. Each sees their own region. No copies, no exports.",
      powered: ["Tableau row-level security", "FranConnect region reference"],
      async run(x) {
        x.left(S.tableau("rd"));
        C.reset(); C.tab("logs"); C.setClock("14:03:00");
        C.caption("Same dashboard, same SQL. Row-level security adds the region filter for this user.");
        await C.log([
          { lvl: "info", raw: "auth \u00b7 user rd.west@puroclean (illustrative) \u00b7 entitlement West", exec: "Signed in as the West Region RD" },
          { lvl: "sql", raw: code("SELECT ... FROM curated.v_open_jobs j JOIN ref.user_region u ON u.region = j.region WHERE u.user = USERNAME()"), exec: "Only CA, OR, WA and NV rows come back" },
          { lvl: "ok", raw: "rls \u00b7 4 states \u00b7 137 open jobs \u00b7 region from FranConnect", exec: "137 open jobs in the West Region" },
        ], x.t);
      },
    },
    {
      id: "5.3", act: "5", title: "Benchmarking against the network",
      say: "Benchmarking was on CJ's list. Financials come later with QuickBooks; we're showing where they'll land.",
      powered: ["Tableau"],
      async run(x) {
        x.left(S.tableau("bench"));
        C.reset();
        C.lineage(`<div class="lin"><div class="lin-h">"Network average" \u00b7 how it's calculated</div>
          <div class="lin-row"><div class="lin-k">Grain</div><div class="lin-v">per franchise, trailing 90 days</div><div class="lin-s">illustrative</div></div><div class="lin-arrow">\u2193</div>
          <div class="lin-row"><div class="lin-k">Network average</div><div class="lin-v">mean across franchises with usable data</div><div class="lin-s">excludes quarantined jobs</div></div><div class="lin-arrow">\u2193</div>
          <div class="lin-row"><div class="lin-k">KPIs</div><div class="lin-v">jobs / month \u00b7 cycle time \u00b7 on-time completion \u00b7 backlog \u00b7 rework \u00b7 cancellation</div><div class="lin-s">Data Collection sheet</div></div>
          <div class="lin-row note"><div class="lin-k">Stage 3</div><div class="lin-v">revenue \u00b7 gross margin \u00b7 labor and material % \u00b7 growth trend, with QuickBooks Online</div><div class="lin-s">later</div></div></div>`);
        C.tab("lineage");
        C.caption("Benchmarks only count franchises whose data passes the quality rules.");
      },
    },
    {
      id: "5.4", act: "5", title: "KPI lineage: where does this number come from?",
      say: "Every number on CJ's screen traces back to a field, in a specific platform, through a specific API. When someone asks 'is this right?', this is the answer.",
      powered: ["Tableau semantic model", "MuleSoft API catalog in Exchange"],
      async run(x) {
        x.left(S.tableau("lineage", { tap: true }));
        C.reset(); C.lineage(lineageTable(0)); C.tab("lineage");
        C.caption("Tap the On-time completion tile to trace it.");
        await x.tap("lineage");
        x.left(S.tableau("lineage"));
        for (let i = 1; i <= 5; i++) { C.lineage(lineageTable(i)); await x.sleep(380); }
        C.caption("From CJ's KPI, through Tableau and MuleSoft, back to each platform's field and API.");
      },
    },

    /* ---------- Act 6 */
    {
      id: "6.1", act: "6", title: "From 50 locations to 900",
      say: "CJ's planning for 900. The integration doesn't change shape; it adds capacity. A hailstorm in Ohio is a busy afternoon, not an outage.",
      powered: ["MuleSoft on CloudHub", "Horizontal scaling", "Persistent queues"],
      async run(x) {
        let idx = 0, surge = false;
        const draw = () => { x.left(S.scale(idx, surge)); C.extra(scalePanel(idx, surge)); };
        C.reset(); C.tab("flow");
        C.caption("Today's volume: one worker, plenty of headroom.");
        draw();
        await x.tap("sc-1"); idx = 1; draw();
        C.caption("430 locations on Jan 1: a second worker, same APIs.");
        await x.tap("sc-2"); idx = 2; draw();
        C.caption("900 locations: four workers. Latency stays under 5 minutes.");
        await x.tap("surge"); surge = true; draw();
        C.caption("Storm surge: the queue absorbs the spike and drains. Nothing is dropped.");
      },
    },
    {
      id: "6.2", act: "6", title: "Onboarding a franchise is configuration, not code",
      say: "This is the 'bazooka' question. You don't start with the bazooka. Wave 1 is Dash and FranConnect. Every franchise after that is a form, not a project.",
      powered: ["MuleSoft configuration properties", "FranConnect reference data"],
      async run(x) {
        x.left(S.onboard(false));
        C.reset(); C.tab("logs"); C.setClock("10:05:00");
        C.caption("Go live adds a reference row and a credential. No deployment.");
        await x.tap("golive");
        await C.log([
          { lvl: "info", raw: "ref.franchise \u00b7 INSERT OH-0731 \u00b7 region Central \u00b7 platform PSA", exec: "Franchise added to the reference list" },
          { lvl: "info", raw: "secure-properties \u00b7 credential vault://spar/psa/OH-0731 registered", exec: "Platform credential registered securely" },
          { lvl: "ok", raw: "deployments 0 \u00b7 code changes 0 \u00b7 next psa-sapi poll 10:10", exec: "No code, no deployment; jobs flow on the next cycle" },
          { lvl: "ok", at: "10:10:04", raw: "psa-sapi \u00b7 OH-0731 \u00b7 first sync \u00b7 23 open jobs", exec: "First 23 jobs from Dayton North arrived" },
        ], x.t);
        x.left(S.onboard(true));
      },
    },

    /* ---------- Act 7 */
    {
      id: "7.1", act: "7", title: "PSA goes down",
      say: "Vendors will have bad days. The question is whether you find out from a monitor or from CJ.",
      powered: ["Anypoint Monitoring", "Functional Monitoring", "Visualizer", "Retry + circuit breaker"],
      async run(x) {
        x.left(S.tableau("health-ok"));
        const g = C.baseGraph();
        g.nodes.forEach((n) => { if (n.id === "mon") n.kind = "ops"; });
        C.graph(g); C.tab("flow"); C.setClock("14:13:58");
        C.caption("Anypoint Visualizer: the live application network.");
        C.clock([{ l: "Functional monitor", v: "psa-sapi \u00b7 every 1 min" }, { l: "Queued", v: "0" }, { l: "Lost", v: "0", state: "ok" }]);
        await x.sleep(600);
        C.node("psa", "err"); C.node("s-psa", "err"); C.edge("psa", "s-psa", "err");
        await C.log([
          { lvl: "err", at: "14:14:00", raw: `functional-monitor \u00b7 psa health check \u2192 ${code("503 Service Unavailable")}`, exec: "A scheduled check caught PSA failing at 2:14 PM" },
          { lvl: "warn", raw: "psa-sapi \u00b7 retry 1 in 2 s \u00b7 503" },
          { lvl: "warn", raw: "psa-sapi \u00b7 retry 2 in 8 s \u00b7 503" },
          { lvl: "warn", raw: "psa-sapi \u00b7 retry 3 in 32 s \u00b7 503" },
          { lvl: "err", raw: "circuit-breaker \u00b7 OPEN for 10 min \u00b7 events \u2192 persistent queue", exec: "Calls to PSA paused; new events are held safely" },
        ], x.t);
        C.node("mon", "err");
        C.clock([{ l: "Functional monitor", v: "PSA failing", state: "err" }, { l: "Queued", v: D.outage.queued.toLocaleString(), state: "warn" }, { l: "Lost", v: "0", state: "ok" }, { l: "Franchises affected", v: String(D.outage.franchises) }]);
        x.left(S.tableau("health-amber"));
        C.caption("PSA is red. Events are queued, not lost. CJ's Integrations working tile is amber.");
      },
    },
    {
      id: "7.2", act: "7", title: "The alert, the trace and the recovery",
      say: "Seventeen minutes, zero data lost, and nobody had to be watching. The fix knowledge lives in the runbook and the platform, not in one person's head.",
      powered: ["Anypoint Monitoring alerts", "Dashboards", "Tracing"],
      async run(x) {
        x.left(S.failAlert(false));
        C.reset(); C.tab("monitor"); C.setClock("14:15:00");
        const dash = (recovered) => C.monitor(`<div class="mon">
          <div class="mon-h">Anypoint Monitoring \u00b7 psa-sapi <span class="pill ${recovered ? "ok" : "err"}">${recovered ? "Recovered 2:31 PM" : "Alert firing"}</span></div>
          <div class="mon-grid">
            <div class="mon-card"><div class="mc-k">Error rate</div><svg viewBox="0 0 200 60"><polyline points="0,56 40,56 70,56 80,8 100,6 130,7 150,8 ${recovered ? "160,56 200,56" : "170,7 200,6"}" fill="none" stroke="#D0232A" stroke-width="2.5"/></svg></div>
            <div class="mon-card"><div class="mc-k">Response time (p95)</div><svg viewBox="0 0 200 60"><polyline points="0,48 40,46 70,47 80,12 110,10 150,12 ${recovered ? "165,46 200,47" : "200,11"}" fill="none" stroke="#f28e2b" stroke-width="2.5"/></svg></div>
            <div class="mon-card biz"><div class="mc-k">PuroClean jobs synced / hour <small>business metric</small></div><svg viewBox="0 0 200 60"><polyline points="0,20 40,18 70,19 80,44 120,46 150,45 ${recovered ? "160,6 175,12 200,19" : "200,45"}" fill="none" stroke="#5aa9e6" stroke-width="2.5"/></svg></div>
          </div>
          <div class="trace ${recovered ? "" : "dim"}"><div class="mc-k">Trace \u00b7 one failed transaction \u00b7 PSA job P-24-55871</div>
            ${[["psa-sapi GET /api/Jobs/Changes", 0, 18, "err", "503"], ["retry 1", 20, 6, "warn", "503"], ["retry 2", 30, 10, "warn", "503"], ["retry 3", 46, 14, "warn", "503"], ["queued (circuit open)", 62, 26, "info", "held"], ["replayed \u2192 job-sync \u2192 11:11", 90, 10, "ok", "200"]]
              .map(([l, s, w, c, r]) => `<div class="tr-row"><span class="tr-l">${l}</span><span class="tr-bar"><span class="${c}" style="left:${s}%;width:${w}%"></span></span><span class="tr-r ${c}">${r}</span></div>`).join("")}
          </div></div>`);
        dash(false);
        C.caption("The alert names the API, the error, the franchises affected and the runbook.");
        await x.tap("openAlert");
        x.left(S.failAlert(true));
        await x.tap("trace");
        dash(true);
        await C.log([
          { lvl: "ok", at: "14:31:00", raw: "psa-sapi \u00b7 health check 200 \u00b7 circuit CLOSED", exec: "PSA recovered at 2:31 PM" },
          { lvl: "ok", raw: `replay \u00b7 ${D.outage.queued.toLocaleString()} events in order \u00b7 0 lost \u00b7 0 duplicates`, exec: "All 1,284 held events replayed, in order, none lost" },
          { lvl: "ok", raw: "integrations_working \u00b7 5/5 \u00b7 Tableau tile green" },
        ], x.t, { mirror: false });
        C.caption("Seventeen minutes, 1,284 events replayed in order, zero lost.");
        C.clock([{ l: "Outage", v: "17 min" }, { l: "Replayed", v: D.outage.queued.toLocaleString(), state: "ok" }, { l: "Lost", v: "0", state: "ok" }, { l: "Integrations working", v: "5 / 5", state: "ok" }]);
      },
    },
    {
      id: "7.3", act: "7", title: "Security: Nick's gating item",
      say: "SOC 2 was the gate. It's there, alongside ISO 27001 and the rest. And control stays with you: MuleSoft runs the platform, PuroClean owns the policies, the credentials and the definitions.",
      powered: ["Anypoint API Manager", "Anypoint Security", "MuleSoft Trust Center"],
      async run(x) {
        x.left(S.security());
        const pg = policyGraph();
        C.graph(pg); C.tab("flow"); C.setClock("14:40:00");
        const SR = D.security;
        C.extra(`<div class="srm"><div class="srm-h">Shared responsibility model</div><div class="srm-cols">
          <div><b>MuleSoft</b><ul>${SR.mulesoft.map((s) => `<li>${s}</li>`).join("")}</ul></div>
          <div class="pc"><b>PuroClean</b><ul>${SR.puroclean.map((s) => `<li>${s}</li>`).join("")}</ul></div></div>
          <div class="srm-src">Source: the security documentation PuroClean already received (Trust Center, Anypoint Security, Security Capabilities).</div></div>`);
        C.caption("Every request passes the same policy chain at the gateway. No code changes.");
        await C.packet(pg._ids, x.t, { dur: 380 });
        await x.sleep(300);
        C.caption("A malformed payload is stopped at JSON/XML Threat Protection.");
        pg._ids.forEach((id) => C.node(id, ""));
        await C.packet(pg._ids.slice(0, 4), x.t, { kind: "err", dur: 380, finalState: "err" });
        await C.log([{ lvl: "err", raw: "api-manager \u00b7 json-threat-protection \u00b7 max depth exceeded \u2192 400 rejected", exec: "Malicious payload blocked at the gateway" }], x.t);
      },
    },
    {
      id: "7.4", act: "7", title: "\"If you win the lottery, what happens?\"",
      say: "CJ asked the question: if you win the lottery, what happens? With this, the knowledge stays with PuroClean. Nick's still the architect. He just isn't the only one who can keep it running.",
      powered: ["Anypoint Exchange", "Anypoint Monitoring"],
      async run(x) {
        x.left(S.compare());
        const g = C.baseGraph();
        g.nodes.forEach((n) => { n.state = "ok"; if (n.id === "quar" || n.id === "notify") n.kind = n.kind.replace(" dim", ""); });
        C.graph(g); C.tab("flow");
        C.extra(`<div class="exch"><div class="ex-h">Documented in Anypoint Exchange</div>${["dash-sapi", "psa-sapi", "albi-sapi", "jobsite-sapi", "franconnect-sapi", "job-sync-papi", "milestones-papi", "notification-api", "purologic-canonical-job"].map((a) => `<div class="ex-a"><b>${a}</b><small>spec \u00b7 owner \u00b7 runbook</small></div>`).join("")}</div>`);
        C.caption("The whole application network: documented, monitored and owned by PuroClean.");
      },
    },

    /* ---------- Act 8 */
    {
      id: "8.1", act: "8", title: "Tableau Pulse: the dashboard comes to CJ",
      say: "CJ wants to be proactive, not reactive. This is the first step: the dashboard comes to you.",
      powered: ["Tableau Pulse"],
      async run(x) {
        x.left(S.pulse());
        C.reset();
        C.lineage(`<div class="lin"><div class="lin-h">Pulse metric definition</div>
          <div class="lin-row"><div class="lin-k">Metric</div><div class="lin-v">Open water jobs</div><div class="lin-s">certified, semantic model</div></div><div class="lin-arrow">\u2193</div>
          <div class="lin-row"><div class="lin-k">Dimensions</div><div class="lin-v">state \u00b7 metro \u00b7 franchise</div><div class="lin-s">daily grain</div></div><div class="lin-arrow">\u2193</div>
          <div class="lin-row"><div class="lin-k">Insight</div><div class="lin-v">unusual change vs 4-week average (\u00b1 25%)</div><div class="lin-s">illustrative threshold</div></div><div class="lin-arrow">\u2193</div>
          <div class="lin-row"><div class="lin-k">Delivered</div><div class="lin-v">daily digest to CJ (mobile, email or Slack)</div><div class="lin-s">7:30 AM</div></div></div>`);
        C.tab("lineage");
        C.caption("Pulse watches the certified metrics and flags what changed.");
      },
    },
    {
      id: "8.2", act: "8", title: "What's next, when the data is trusted",
      say: "Dashboards first, with an AI proactive mindset. Weather, agents and Data Cloud come once the data is trusted. None of it is Stage 1.",
      powered: ["Roadmap only"],
      async run(x) {
        x.left(S.whatsNext());
        C.reset();
        C.lineage(`<div class="lin"><div class="lin-h">Stage roadmap (CJ's three stages)</div>
          <div class="lin-row"><div class="lin-k">Stage 1</div><div class="lin-v">Visibility and adoption: every job, one record, Tableau</div><div class="lin-s">this project</div></div><div class="lin-arrow">\u2193</div>
          <div class="lin-row"><div class="lin-k">Stage 2</div><div class="lin-v">Compliance: jobs moving on time, nothing stuck in limbo</div><div class="lin-s">next</div></div><div class="lin-arrow">\u2193</div>
          <div class="lin-row"><div class="lin-k">Stage 3</div><div class="lin-v">Profitability: QuickBooks Online, margin by job and franchise</div><div class="lin-s">later</div></div></div>`);
        C.tab("lineage");
        C.caption("Each stage builds on the same connection layer.");
      },
    },

    { id: "arch", act: "arch", layout: "full", page: "arch", title: "How it fits together", say: "Tap any block for what it does. This is the whole Stage 1 picture on one page.", powered: [] },
    { id: "close", act: "close", layout: "full", page: "close", title: "Start small. Grow to 900. Know first.", say: "Wave 1 is Dash and FranConnect before the holidays. Everything after that reuses what we build.", powered: [] },
  ];

  return { acts, steps };
})();
