/* Left pane: what PuroClean sees. Every function returns an HTML string. */
window.Screens = (function () {
  const D = window.PC;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const money = (v) => "$" + (v >= 1000 ? (v / 1000).toFixed(1).replace(/\.0$/, "") + "K" : v.toLocaleString());
  const icon = (k) => `<img class="ico" src="assets/icons/${{ Water: "water", Fire: "fire", Mold: "mold", Biohazard: "biohazard" }[k] || "house"}.svg" alt=""/>`;

  function frame(roleKey, inner, opt = {}) {
    const r = D.roles[roleKey];
    const device = opt.device || r.device;
    const clock = opt.clock ? `<span class="dv-clock">${opt.clock}</span>` : "";
    return `
      <div class="badge-role" style="--rc:${r.color}">
        <span class="br-dot">${r.label.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</span>
        <span><b>${esc(r.label)}</b><small>${esc(r.sub)}</small></span>
      </div>
      <div class="device ${device}" style="--rc:${r.color}">
        <div class="dv-bar">${clock}<span class="dv-cam"></span></div>
        <div class="dv-screen">${inner}</div>
      </div>`;
  }

  /* ------------------------------------------------------------ franchise job app */
  function jobApp(st = {}) {
    const vKey = st.vendor || "dash";
    const v = D.vendors[vKey];
    const J = D.job;
    const set = st.dates || {};
    const switcher = st.switcher
      ? `<div class="ja-switch">${Object.entries(D.vendors)
          .map(([k, x]) => `<button class="${k === vKey ? "on" : ""}" data-tap="v-${k}">${x.name}</button>`)
          .join("")}<span class="ja-sim">simulated screens</span></div>`
      : "";
    const show = st.show || ["date_of_loss", "dispatch", "received_accepted", "contacted", "inspected", "started", "target_completion"];
    const rows = D.milestones
      .filter((m) => show.includes(m.field))
      .map((m) => {
        const lbl = (v.labels && v.labels[m.field]) || m.label;
        const val = set[m.field];
        const btn = st.tapDate === m.field ? `<button class="ja-set" data-tap="d-${m.field}">Set now</button>` : "";
        return `<div class="ja-row ${val ? "done" : ""} ${st.flash === m.field ? "flash" : ""}">
          <span class="ja-lbl">${esc(lbl)}${m.sla ? '<i class="sla-tag" title="SLA lane (illustrative)">SLA</i>' : ""}</span>
          <span class="ja-val">${val ? esc(val) : btn || '<span class="mut">\u2014</span>'}</span></div>`;
      })
      .join("");
    const actions = (st.actions || [])
      .map((a) => `<button class="btn ${a.kind || "primary"}" data-tap="${a.tap}">${esc(a.label)}</button>`)
      .join("");
    return frame(
      "pm",
      `<div class="ja">
        <div class="ja-top"><span class="ja-app">${v.name} <em>(simulated)</em></span><span class="ja-fr">${esc(D.franchise.name)} \u00b7 ${D.franchise.id}</span></div>
        ${switcher}
        <div class="ja-head">
          <div class="ja-ic">${icon(J.loss)}</div>
          <div><div class="ja-id">${st.isNew ? "New job" : J.id} <span class="mut">\u00b7 ${v.name} ref ${st.isNew ? "pending" : (v.payload.job_no || v.payload.JobNumber || v.payload.projectId || v.payload.id)}</span></div>
          <div class="ja-sub">${J.type} \u00b7 ${J.loss} \u00b7 ${J.category}</div>
          <div class="ja-sub mut">${J.address} \u00b7 ${J.carrier} claim ${J.claim}</div></div>
          ${st.synced ? `<span class="ja-sync">\u2713 Synced to PuroClean data lake \u00b7 ${st.synced}</span>` : ""}
        </div>
        <div class="ja-tabs"><span>Details</span><span class="on">Dates</span><span>Notes</span><span>Photos</span></div>
        <div class="ja-dates">${rows}</div>
        <div class="ja-actions">${actions}</div>
      </div>`,
      { clock: st.clock || "6:12 AM" }
    );
  }

  function addPlatform(added) {
    return frame(
      "corp",
      `<div class="card-pad">
        <h3>SPAR platforms connected</h3>
        <div class="plat-grid">
          ${["Dash", "PSA", "Albi", "JobSite"].map((p) => `<div class="plat on"><b>${p}</b><small>live \u00b7 1 System API</small></div>`).join("")}
          <div class="plat ${added ? "on new" : "add"}" ${added ? "" : 'data-tap="add"'}>
            <b>${added ? "New SPAR platform" : "+ Add platform"}</b><small>${added ? "1 new System API \u00b7 everything else reused" : "e.g. Salesforce Field Service (5th option)"}</small>
          </div>
        </div>
        <p class="mut small">Adding a platform is one new System API. The PuroLogic canonical model, data-quality rules, 11:11 tables and Tableau are reused.</p>
      </div>`,
      { clock: "9:10 AM" }
    );
  }

  /* ------------------------------------------------------------ phone */
  function phone(roleKey, inner, clock) {
    return frame(roleKey, `<div class="ph">${inner}</div>`, { device: "phone", clock });
  }

  function slaAlert(tappable) {
    return phone(
      "rdPhone",
      `<div class="ph-lock"><div class="ph-time">7:02</div><div class="ph-date">Tuesday, February 16</div>
        <div class="notif ${tappable ? "" : ""}" ${tappable ? 'data-tap="open"' : ""}>
          <div class="nt-h"><img src="assets/puroclean-logo.svg" alt=""/><span>PuroClean Ops \u00b7 now</span></div>
          <b>SLA risk: JOB-CA-11902</b>
          <p>PuroClean Sacramento North \u00b7 not Contacted 34 min after Received/Accepted. SLA 30 min <em>(illustrative)</em>.</p>
        </div></div>`,
      "7:02"
    );
  }

  function failAlert(open) {
    const O = D.outage;
    return phone(
      "oncall",
      open
        ? `<div class="ph-app"><div class="ph-apphead">Anypoint Monitoring alert</div>
            <div class="al-card err"><b>psa-sapi \u00b7 503 Service Unavailable</b><p>Since ${O.start} \u00b7 ${O.franchises} franchises affected</p><p>${O.queued.toLocaleString()} events queued \u00b7 <b>0 lost</b></p></div>
            <div class="al-steps"><div>1. Circuit breaker open (10 min)</div><div>2. Retries 2s / 8s / 32s exhausted</div><div>3. Auto-replay when PSA recovers</div></div>
            <button class="btn primary" data-tap="trace">View trace</button>
            <a class="al-run">Runbook: PSA outage \u203a</a></div>`
        : `<div class="ph-lock"><div class="ph-time">2:15</div><div class="ph-date">Tuesday, February 16</div>
            <div class="notif" data-tap="openAlert"><div class="nt-h"><span class="nt-mule">M</span><span>Anypoint Monitoring \u00b7 now</span></div>
            <b>psa-sapi: 503 errors since ${O.start}</b><p>${O.franchises} franchises affected. Events queued, none lost. Runbook \u203a</p></div></div>`,
      "2:15"
    );
  }

  function pulse() {
    return phone(
      "cjPhone",
      `<div class="ph-app"><div class="ph-apphead">Tableau Pulse \u00b7 your daily digest</div>
        <div class="pulse-card"><div class="pl-k">Open water jobs \u00b7 Ohio</div><div class="pl-v">61 <span class="up">\u25b2 38%</span></div>
        <svg viewBox="0 0 220 60" class="spark"><polyline points="0,46 20,44 40,47 60,43 80,45 100,42 120,44 140,40 160,38 180,24 200,14 220,10" fill="none" stroke="#4e79a7" stroke-width="3"/></svg>
        <p>Up 38% vs the 4-week average, mostly Columbus and Dayton, after Tuesday's storms.</p></div>
        <div class="pulse-card small"><div class="pl-k">On-time completion \u00b7 network</div><div class="pl-v">82% <span class="flat">steady</span></div></div>
        <div class="pulse-card small"><div class="pl-k">Integrations working</div><div class="pl-v">5 / 5 <span class="flat">all green</span></div></div></div>`,
      "7:30"
    );
  }

  /* ------------------------------------------------------------ Tableau */
  function tabShell(title, crumbs, body, opt = {}) {
    return frame(
      opt.role || "cj",
      `<div class="tb">
        <div class="tb-top"><img src="assets/pc-logo-white.png" alt="PuroClean"/><span class="tb-title">${esc(title)}</span>
          <span class="tb-fresh">\u25cf Data as of ${opt.fresh || "4 min ago"}</span><span class="tb-brand">Tableau</span></div>
        <div class="tb-crumbs">${crumbs.map((c, i) => `<span class="${i === crumbs.length - 1 ? "on" : ""}">${esc(c)}</span>`).join('<i>\u203a</i>')}${opt.viewAs ? `<span class="tb-viewas">View as: ${esc(opt.viewAs)}</span>` : ""}</div>
        <div class="tb-body">${body}</div>
      </div>`,
      { device: "laptop", clock: opt.clock || "2:00 PM" }
    );
  }

  function kpiTiles(opt = {}) {
    return `<div class="tb-kpis">${(opt.kpis || D.kpis)
      .map((k) => `<div class="kpi ${k.lineage && opt.tapLineage ? "tappable" : ""} ${opt.hl === k.k ? "hl" : ""}" ${k.lineage && opt.tapLineage ? 'data-tap="lineage"' : ""}><div class="kpi-k">${k.k}</div><div class="kpi-v">${k.v}</div><div class="kpi-d">${k.d}</div></div>`)
      .join("")}</div>`;
  }

  function usMap(opt = {}) {
    const S = 38, G = 4;
    const max = 96;
    const cells = D.tiles
      .map(([st, c, r]) => {
        const v = D.openJobs[st] || 0;
        const dim = opt.only && !opt.only.includes(st);
        const a = 0.15 + 0.85 * (v / max);
        const fill = dim ? "#e6e8ec" : `rgba(0,52,109,${a.toFixed(2)})`;
        const txt = dim ? "#b6b9be" : a > 0.5 ? "#fff" : "#00346D";
        const tap = opt.tap === st ? `data-tap="${st}" class="tile tap"` : 'class="tile"';
        const sel = opt.sel === st ? `<rect x="${c * (S + G) - 2}" y="${r * (S + G) - 2}" width="${S + 4}" height="${S + 4}" rx="7" fill="none" stroke="#C50A1D" stroke-width="3"/>` : "";
        return `<g ${tap}><rect x="${c * (S + G)}" y="${r * (S + G)}" width="${S}" height="${S}" rx="5" fill="${fill}"/>
          <text x="${c * (S + G) + S / 2}" y="${r * (S + G) + 16}" text-anchor="middle" fill="${txt}" class="tl">${st}</text>
          <text x="${c * (S + G) + S / 2}" y="${r * (S + G) + 30}" text-anchor="middle" fill="${txt}" class="tv">${dim ? "" : v}</text></g>${sel}`;
      })
      .join("");
    return `<svg class="usmap" viewBox="0 0 ${11 * (S + G)} ${8 * (S + G)}">${cells}</svg>`;
  }

  function lossBars(opt = {}) {
    const max = Math.max(...D.kansas.byLoss.map((x) => x.v));
    return `<div class="bars">${D.kansas.byLoss
      .map((x) => `<div class="bar-row ${opt.tap === x.k ? "tap" : ""}" ${opt.tap === x.k ? `data-tap="${x.k}"` : ""}><span class="bl">${icon(x.k)} ${x.k}</span>
        <span class="bt"><span style="width:${(x.v / max) * 100}%;background:${x.c}"></span></span><span class="bv">${x.v}</span></div>`)
      .join("")}</div>`;
  }

  function tableau(view, opt = {}) {
    const K = D.kansas;
    if (view === "network") {
      return tabShell("Network Operations", ["All franchises"], `${kpiTiles()}
        <div class="tb-grid"><div class="tb-card wide"><div class="tb-h">Open jobs by state <small>tap a state</small></div>${usMap({ tap: opt.tap ? "KS" : null })}</div>
        <div class="tb-card"><div class="tb-h">Loss type \u00b7 network</div>
          <div class="donut-legend"><div><i style="background:#4e79a7"></i>Water 58%</div><div><i style="background:#e15759"></i>Fire 21%</div><div><i style="background:#59a14f"></i>Mold 14%</div><div><i style="background:#f28e2b"></i>Biohazard 7%</div></div>
          <div class="tb-note">Sources: Dash, PSA, Albi, JobSite \u00b7 via MuleSoft</div></div></div>`);
    }
    if (view === "kansas") {
      return tabShell("Network Operations", ["All franchises", "Kansas"], `${kpiTiles()}
        <div class="tb-grid"><div class="tb-card wide"><div class="tb-h">Open jobs by state</div>${usMap({ sel: "KS" })}</div>
        <div class="tb-card"><div class="tb-h">Kansas \u00b7 ${K.open} open jobs by loss type <small>tap Water</small></div>${lossBars({ tap: opt.tap ? "Water" : null })}</div></div>`);
    }
    if (view === "wichita") {
      const rows = K.wichita.list
        .map((j) => `<tr class="${j.id === D.job.id && opt.tap ? "tap" : ""}" ${j.id === D.job.id && opt.tap ? 'data-tap="job"' : ""}><td>${j.id}</td><td>${j.fr}</td><td>${icon(j.loss)} ${j.loss}</td><td>${money(j.est)}</td><td>${j.stage}</td></tr>`)
        .join("");
      return tabShell("Network Operations", ["All franchises", "Kansas", "Water + Fire", "Wichita area"], `
        <div class="tb-kpis three"><div class="kpi"><div class="kpi-k">Open water + fire jobs</div><div class="kpi-v">${K.wichita.jobs}</div></div>
        <div class="kpi hl"><div class="kpi-k">Estimated value</div><div class="kpi-v">${money(K.wichita.est)}</div></div>
        <div class="kpi"><div class="kpi-k">Franchises</div><div class="kpi-v">2</div></div></div>
        <div class="tb-card"><div class="tb-h">Wichita area jobs <small>tap ${D.job.id}</small></div>
          <table class="tb-table"><thead><tr><th>Job</th><th>Franchise</th><th>Loss</th><th>Estimate</th><th>Current milestone</th></tr></thead><tbody>${rows}</tbody></table></div>`);
    }
    if (view === "job") {
      const done = D.milestones.filter((m) => m.value && !["target_start", "target_completion"].includes(m.field) && m.field !== "started");
      const steps = D.milestones
        .filter((m) => !["target_start", "target_completion", "started"].includes(m.field))
        .slice(0, 9)
        .map((m) => `<div class="tl-step ${m.value ? "done" : ""}"><span class="tl-dot"></span><span class="tl-l">${m.label}</span><span class="tl-v">${m.value || ""}</span></div>`)
        .join("");
      return tabShell("Job detail", ["All franchises", "Kansas", "Wichita area", D.job.id], `
        <div class="tb-card"><div class="tb-h">${D.job.id} \u00b7 ${D.franchise.name} \u00b7 ${D.job.loss}, ${D.job.category} \u00b7 est. $${D.job.estimate.toLocaleString()}</div>
        <div class="tl">${steps}</div>
        <div class="tb-note">PuroLogic Dates, from Dash via MuleSoft \u00b7 ${done.length} of 18 milestones reached \u00b7 Target Completion Feb 19</div></div>`);
    }
    if (view === "rd") {
      return tabShell("Network Operations", ["West Region"], `${kpiTiles({ kpis: D.kpisWest })}
        <div class="tb-grid"><div class="tb-card wide"><div class="tb-h">Open jobs by state \u00b7 row-level security applied</div>${usMap({ only: D.west })}</div>
        <div class="tb-card"><div class="tb-h">West Region</div><div class="rd-list">${D.west.map((s) => `<div><b>${s}</b><span>${D.openJobs[s]} open</span></div>`).join("")}</div>
        <div class="tb-note">1 of 12\u201313 regional directors. Same dashboard, filtered to this region.</div></div></div>`, { role: "rd", viewAs: "Regional Director, West Region" });
    }
    if (view === "bench") {
      const rows = D.benchmark
        .map((b) => {
          const max = Math.max(b.fr, b.net) * 1.25;
          const good = b.better === "high" ? b.fr >= b.net : b.fr <= b.net;
          return `<div class="bm-row"><span class="bm-k">${b.k}</span><span class="bm-bars"><span class="bm-fr ${good ? "good" : "bad"}" style="width:${(b.fr / max) * 100}%">${b.fmt(b.fr)}</span><span class="bm-net" style="width:${(b.net / max) * 100}%">${b.fmt(b.net)}</span></span></div>`;
        })
        .join("");
      return tabShell("Franchise benchmarking", ["All franchises", "Kansas", D.franchise.name], `
        <div class="tb-card"><div class="tb-h">${D.franchise.name} vs network average <small><i class="lg-fr"></i>franchise <i class="lg-net"></i>network</small></div>${rows}
        <div class="bm-fin">Revenue \u00b7 gross margin \u00b7 labor and material % \u00b7 growth trend <span>Stage 3, with QuickBooks Online</span></div></div>`);
    }
    if (view === "lineage") {
      return tabShell("Network Operations", ["All franchises"], `${kpiTiles({ tapLineage: opt.tap, hl: opt.tap ? null : "On-time completion" })}
        <div class="tb-card"><div class="tb-h">Where does "On-time completion" come from?</div>
        <p class="tb-ask">Tap the tile. The right side traces it from Tableau, through MuleSoft, back to each platform's field.</p></div>`);
    }
    if (view === "health" || view === "health-amber" || view === "health-ok") {
      const amber = view === "health-amber";
      return tabShell("Data Health & Integrations", ["All franchises"], `
        <div class="tb-kpis three">
          <div class="kpi"><div class="kpi-k">Franchises with usable data</div><div class="kpi-v">64% <small class="up">from 19%</small></div></div>
          <div class="kpi ${amber ? "amber" : "green"}"><div class="kpi-k">Integrations working</div><div class="kpi-v">${amber ? "4 / 5" : "5 / 5"}</div><div class="kpi-d">${amber ? "PSA delayed \u00b7 events queued" : "all platforms syncing"}</div></div>
          <div class="kpi"><div class="kpi-k">Records quarantined (7 days)</div><div class="kpi-v">312</div><div class="kpi-d">0.4% of volume</div></div></div>
        <div class="tb-grid"><div class="tb-card"><div class="tb-h">Usable data, % of franchises</div>
          <svg viewBox="0 0 300 110" class="trend"><polyline points="0,92 40,90 80,86 120,70 160,58 200,46 240,38 280,32 300,30" fill="none" stroke="#00346D" stroke-width="3"/><line x1="120" y1="0" x2="120" y2="110" stroke="#C50A1D" stroke-dasharray="4 3"/><text x="124" y="12" class="tr-l">Wave 1</text><line x1="200" y1="0" x2="200" y2="110" stroke="#C50A1D" stroke-dasharray="4 3"/><text x="204" y="12" class="tr-l">Wave 2</text></svg></div>
        <div class="tb-card"><div class="tb-h">Top quarantine reasons</div><div class="bars">
          ${[["Missing loss type", 41], ["Duplicate job", 33], ["Dates out of order", 17], ["Unknown franchise", 9]].map(([k, v]) => `<div class="bar-row"><span class="bl">${k}</span><span class="bt"><span style="width:${v * 2.2}%;background:#C50A1D"></span></span><span class="bv">${v}%</span></div>`).join("")}
        </div></div></div>`, { clock: amber ? "2:16 PM" : "2:00 PM", fresh: amber ? "PSA: 2 min delayed" : "4 min ago" });
    }
    return "";
  }

  /* ------------------------------------------------------------ scale + onboarding */
  function scale(idx, surge) {
    const s = D.scale[idx];
    return frame(
      "corp",
      `<div class="card-pad">
        <h3>Locations live on the platform</h3>
        <div class="sc-stops">${D.scale.map((x, i) => `<button class="${i === idx ? "on" : ""}" data-tap="sc-${i}">${x.label}</button>`).join("")}</div>
        <div class="sc-track"><span style="width:${(s.loc / 900) * 100}%"></span></div>
        <label class="sc-surge ${surge ? "on" : ""}" data-tap="surge"><span class="sw"></span> Storm surge (4x)</label>
        <div class="sc-kpis"><div><b>${s.jobs.toLocaleString()}</b><small>jobs / day</small></div><div><b>${(surge ? s.peak : s.events).toLocaleString()}</b><small>milestone events / day</small></div><div><b>${s.latency}</b><small>SLA-lane latency</small></div></div>
        <p class="mut small">CJ is planning toward 900 locations. The integration doesn't change shape; it adds capacity. <em>Volumes illustrative.</em></p>
      </div>`,
      { clock: "10:00 AM" }
    );
  }

  function onboard(done) {
    return frame(
      "corp",
      `<div class="card-pad">
        <h3>Onboard a franchise</h3>
        <div class="form">
          <label>Franchise ID<input value="OH-0731" readonly/></label>
          <label>Franchise<input value="PuroClean Dayton North (fictional)" readonly/></label>
          <label>SPAR platform<input value="PSA" readonly/></label>
          <label>Platform account ID<input value="P-ACCT-55120" readonly/></label>
          <label>Credential reference<input value="vault://spar/psa/OH-0731" readonly/></label>
        </div>
        ${done ? `<div class="ok-banner">\u2713 Live. First jobs will flow in the next 5-minute cycle. 0 deployments, 0 code changes.</div>` : `<button class="btn primary" data-tap="golive">Go live</button>`}
      </div>`,
      { clock: "10:05 AM" }
    );
  }

  /* ------------------------------------------------------------ security + compare + what's next */
  function security() {
    const S = D.security;
    return frame(
      "platform",
      `<div class="card-pad sec">
        <h3>Security &amp; compliance</h3>
        <p class="mut small">The same controls in the security documentation PuroClean already received.</p>
        <div class="certs">${S.certs.map((c) => `<span class="cert">${c}</span>`).join("")}</div>
        <ul class="ticks">${S.controls.map((c) => `<li>${c}</li>`).join("")}</ul>
        <p class="mut tiny">Source: MuleSoft Trust Center and Anypoint Security.</p>
      </div>`,
      { clock: "2:40 PM" }
    );
  }

  function compare() {
    return frame(
      "platform",
      `<div class="card-pad">
        <h3>"If you win the lottery, what happens?"</h3>
        <div class="cmp">
          <div class="cmp-col"><div class="cmp-h">Today</div><ul>
            <li>Hand-coded point-to-point Dash feed</li><li>Built in about a week</li><li>Syncs every couple of hours</li><li>Under 2 hrs / week upkeep</li></ul>
            <div class="cmp-foot">It works, for one feed.</div></div>
          <div class="cmp-col on"><div class="cmp-h">Stage 1 and beyond</div><ul>
            <li>5 sources, 430 \u2192 900 locations</li><li>30-minute SLA lane</li><li>Monitoring, alerts and replay</li><li>Every API documented in Exchange</li></ul>
            <div class="cmp-foot">Nick is still the architect. He just isn't the only one who can keep it running.</div></div>
        </div>
      </div>`,
      { clock: "2:45 PM" }
    );
  }

  function whatsNext() {
    return frame(
      "cj",
      `<div class="card-pad">
        <h3>What's next, when the data is trusted</h3>
        <div class="next-grid"><div><b>Weather overlays</b><small>Storm and hail layers on job volume</small></div><div><b>AI agents</b><small>Proactive outreach and triage</small></div><div><b>Data Cloud</b><small>Unified franchise and customer view</small></div></div>
        <blockquote>"Dashboards first with an AI proactive mindset."<span>CJ, Sep 28</span></blockquote>
        <p class="mut small">Roadmap only. Not part of Stage 1.</p>
      </div>`,
      { clock: "7:35 AM" }
    );
  }

  return { frame, jobApp, addPlatform, slaAlert, failAlert, pulse, tableau, scale, onboard, security, compare, whatsNext, money, icon };
})();
