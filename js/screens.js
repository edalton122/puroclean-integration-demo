/* Left pane: what PuroClean sees, styled after Salesforce Lightning (SLDS 2 / Cosmos). Every function returns an HTML string. */
window.Screens = (function () {
  const D = window.PC;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const money = (v) => "$" + (v >= 1000 ? (v / 1000).toFixed(1).replace(/\.0$/, "") + "K" : v.toLocaleString());
  const icon = (k) => `<img class="ico" src="assets/icons/${{ Water: "water", Fire: "fire", Mold: "mold", Biohazard: "biohazard" }[k] || "house"}.svg" alt=""/>`;

  const SVG = {
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5l5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zm-2 15a2 2 0 0 0 4 0" fill="currentColor"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5V14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.2" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    cloud: '<svg viewBox="0 0 64 44"><path d="M26 6a12 12 0 0 1 19 3 10 10 0 0 1 14 9 10 10 0 0 1-6 18H13A11 11 0 0 1 9 15a12 12 0 0 1 17-9z" fill="#fff"/></svg>',
    viz: '<svg viewBox="0 0 24 24"><path d="M11 2h2v5h-2zM11 17h2v5h-2zM2 11h5v2H2zM17 11h5v2h-5zM6 6h1.5v3H6zM16.5 15H18v3h-1.5z" fill="currentColor"/></svg>',
  };

  /* ------------------------------------------------------------ device frame + role badge */
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

  /* ------------------------------------------------------------ Lightning desktop shell */
  function lx(app, tabs, active, body, opt = {}) {
    return `<div class="lx">
      <div class="lx-gh">
        <img class="lx-logo" src="assets/puroclean-logo.svg" alt="PuroClean"/>
        <div class="lx-search">${SVG.search}<span>Search...</span></div>
        <div class="lx-ghi"><i>${SVG.plus}</i><i>${SVG.help}</i><i>${SVG.gear}</i><i class="bell ${opt.bell ? "on" : ""}">${SVG.bell}</i><span class="lx-av">${opt.avatar || "CB"}</span></div>
      </div>
      <div class="lx-nav">
        <span class="lx-waffle">${"<b></b>".repeat(9)}</span>
        <span class="lx-app">${esc(app)}</span>
        ${tabs.map((t) => `<span class="lx-tab ${t === active ? "on" : ""}">${esc(t)}</span>`).join("")}
      </div>
      <div class="lx-body">${opt.toast || ""}${body}</div>
    </div>`;
  }

  const toast = (kind, title, sub) =>
    `<div class="lx-toast ${kind}"><span class="lx-ti">${kind === "success" ? SVG.check : "!"}</span><div><b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</div></div>`;

  const pageHead = (iconColor, iconSvg, obj, title, actions = "", sub = "") => `
    <div class="lx-ph">
      <span class="lx-oi" style="background:${iconColor}">${iconSvg}</span>
      <div class="lx-ph-t"><small>${esc(obj)}</small><b>${esc(title)}</b>${sub ? `<em>${sub}</em>` : ""}</div>
      <div class="lx-ph-a">${actions}</div>
    </div>`;

  const card = (title, body, opt = {}) => `
    <div class="lx-card ${opt.cls || ""}">
      ${title ? `<div class="lx-card-h">${opt.icon ? `<span class="lx-ci" style="background:${opt.icon}"></span>` : ""}<b>${title}</b>${opt.right ? `<span class="lx-card-r">${opt.right}</span>` : ""}</div>` : ""}
      <div class="lx-card-b">${body}</div>
    </div>`;

  const btn = (label, tap, kind = "neutral") => `<button class="sbtn ${kind}" ${tap ? `data-tap="${tap}"` : ""}>${esc(label)}</button>`;
  const houseSvg = '<img src="assets/icons/house.svg" alt="" class="oi-img"/>';
  const bldgSvg = '<img src="assets/icons/building.svg" alt="" class="oi-img"/>';
  const secSvg = '<img src="assets/icons/security.svg" alt="" class="oi-img"/>';

  /* ------------------------------------------------------------ franchise job record (Lightning record page) */
  const PATH_FIELDS = ["date_of_loss", "dispatch", "received_accepted", "contacted", "inspected", "started", "target_completion"];

  function path(set, vKey) {
    const v = D.vendors[vKey];
    const ms = D.milestones.filter((m) => PATH_FIELDS.includes(m.field));
    const cur = ms.findIndex((m) => !set[m.field]);
    return `<div class="lx-path">${ms
      .map((m, i) => {
        const st = set[m.field] ? "done" : i === cur ? "cur" : "todo";
        const lbl = (v.labels && v.labels[m.field]) || m.label;
        return `<div class="lx-pi ${st}"><span>${st === "done" ? `<i>${SVG.check}</i>` : ""}${esc(lbl)}</span></div>`;
      })
      .join("")}</div>`;
  }

  function jobApp(st = {}) {
    const vKey = st.vendor || "dash";
    const v = D.vendors[vKey];
    const J = D.job;
    const set = st.dates || {};
    const ref = st.isNew ? "pending" : v.payload.job_no || v.payload.JobNumber || v.payload.projectId || v.payload.id;
    const switcher = st.switcher
      ? `<div class="lx-switch"><span>Source platform</span><div class="sbtn-group">${Object.entries(D.vendors)
          .map(([k, x]) => `<button class="${k === vKey ? "on" : ""}" data-tap="v-${k}">${x.name}</button>`)
          .join("")}</div><em>simulated screens</em></div>`
      : "";
    const fields = D.milestones
      .filter((m) => PATH_FIELDS.includes(m.field))
      .map((m) => {
        const lbl = (v.labels && v.labels[m.field]) || m.label;
        const val = set[m.field];
        const setBtn = st.tapDate === m.field ? `<button class="sbtn brand xs" data-tap="d-${m.field}">Set now</button>` : "";
        return `<div class="lx-f ${st.flash === m.field ? "flash" : ""}"><label>${esc(lbl)}${m.sla ? '<i class="sla-tag" title="SLA lane (illustrative)">SLA</i>' : ""}</label>
          <div class="lx-fv">${val ? esc(val) : setBtn || '<span class="mut">\u2014</span>'}</div></div>`;
      })
      .join("");
    const actions = (st.actions || []).map((a) => btn(a.label, a.tap, a.kind === "ghost" ? "neutral" : "brand")).join("") || btn("Edit") + btn("Clone");
    const toastHtml = st.synced ? toast("success", "Job synced to PuroClean data lake", `${st.synced} \u00b7 via MuleSoft`) : "";
    const body = `
      ${pageHead("#F49756", houseSvg, "Job", st.isNew ? "New Job" : J.id, actions, `${v.name} ref ${esc(ref)}`)}
      <div class="lx-hl">
        <div><small>Franchise</small><b class="lnk">${esc(D.franchise.name)}</b></div>
        <div><small>Loss type</small><b>${icon(J.loss)} ${J.loss}</b></div>
        <div><small>Category</small><b>${J.category.split(" \u00b7 ")[0]}</b></div>
        <div><small>Estimate</small><b>$${J.estimate.toLocaleString()}</b></div>
      </div>
      ${switcher}
      ${path(set, vKey)}
      ${card("Job Dates", `<div class="lx-fields">${fields}</div>`, { icon: "#F49756", right: `${J.carrier} \u00b7 ${J.claim}` })}`;
    return frame("pm", lx(`${v.name} (simulated)`, ["Jobs", "Schedule", "Estimates"], "Jobs", body, { toast: toastHtml, avatar: "PM" }), { clock: st.clock || "6:12 AM" });
  }

  function syncQueue() {
    const rows = [
      ["JOB-KS-24817", "DASH-M-0412/03", "Resubmitted", "warn", "same address, date of loss and claim"],
      ["D-889301", "DASH-M-0412/01", "New \u00b7 loss type blank", "err", "required field missing"],
      ["D-889297", "DASH-M-0412/02", "Updated", "ok", "Inspected date set"],
    ];
    const body = `
      ${pageHead("#F49756", houseSvg, "Jobs", "Pending sync \u00b7 Dash multi-location", btn("Sync now", "sync", "brand"))}
      ${card("3 items \u00b7 sorted by Last Modified", `<table class="lx-dt"><thead><tr><th>Job</th><th>Account</th><th>Change</th><th>Note</th></tr></thead><tbody>${rows
        .map((r) => `<tr><td class="lnk">${r[0]}</td><td>${r[1]}</td><td><span class="lx-badge ${r[3]}">${r[2]}</span></td><td class="mut">${r[4]}</td></tr>`)
        .join("")}</tbody></table>`)}`;
    return frame("sync", lx("Dash (simulated)", ["Jobs", "Sync Queue", "Accounts"], "Sync Queue", body, { avatar: "PM" }), { clock: "9:12 AM" });
  }

  /* ------------------------------------------------------------ corporate admin (Integration Hub app) */
  const HUB_TABS = ["Home", "Platforms", "Franchises", "Monitoring"];

  function addPlatform(added) {
    const tile = (p, cls, sub, tap) => `<div class="lx-tile ${cls}" ${tap ? `data-tap="${tap}"` : ""}><span class="lx-oi sm" style="background:${cls.includes("add") ? "#c9c9c9" : "#0176D3"}">${bldgSvg}</span><div><b>${p}</b><small>${sub}</small></div>${cls.includes("on") ? '<span class="lx-badge ok">Live</span>' : ""}</div>`;
    const body = `
      ${pageHead("#0176D3", bldgSvg, "SPAR Platforms", "Connected platforms", btn("New", added ? null : "add", "brand"))}
      ${card("Platforms (" + (added ? 5 : 4) + ")", `<div class="lx-tiles">
        ${["Dash", "PSA", "Albi", "JobSite"].map((p) => tile(p, "on", "1 System API")).join("")}
        ${added ? tile("New SPAR platform", "on new", "1 new System API \u00b7 rest reused") : tile("+ Add platform", "add", "e.g. Salesforce Field Service", "add")}
      </div>`)}
      <p class="lx-note">One new System API per platform. The canonical model, data-quality rules, 11:11 tables and Tableau are reused.</p>`;
    return frame("corp", lx("Integration Hub", HUB_TABS, "Platforms", body, { avatar: "PC", toast: added ? toast("success", "Platform added", "new-sapi deployed \u00b7 0 downstream changes") : "" }), { clock: "9:10 AM" });
  }

  function scale(idx, surge) {
    const s = D.scale[idx];
    const body = `
      ${pageHead("#0176D3", bldgSvg, "Capacity", "Locations live on the platform")}
      ${card("Network size", `
        <div class="sbtn-group wide">${D.scale.map((x, i) => `<button class="${i === idx ? "on" : ""}" data-tap="sc-${i}">${x.label}</button>`).join("")}</div>
        <div class="lx-slider"><span style="width:${(s.loc / 900) * 100}%"></span><i style="left:${(s.loc / 900) * 100}%"></i></div>
        <label class="lx-toggle ${surge ? "on" : ""}" data-tap="surge"><span class="sw"></span> Storm surge (4x volume)</label>
        <div class="lx-stats"><div><small>Jobs / day</small><b>${s.jobs.toLocaleString()}</b></div><div><small>Milestone events / day</small><b>${(surge ? s.peak : s.events).toLocaleString()}</b></div><div><small>SLA-lane latency</small><b>${s.latency}</b></div></div>
        <p class="lx-note">Volumes illustrative.</p>`)}`;
    return frame("corp", lx("Integration Hub", HUB_TABS, "Home", body, { avatar: "PC" }), { clock: "10:00 AM" });
  }

  function onboard(done) {
    const f = (l, v) => `<div class="lx-in"><label>${l}</label><div>${esc(v)}</div></div>`;
    const body = `
      ${pageHead("#3BA755", bldgSvg, "Franchise", done ? "PuroClean Dayton North" : "New Franchise Connection", done ? '<span class="lx-badge ok">Live</span>' : btn("Cancel") + btn("Go live", "golive", "brand"))}
      ${card("Connection details", `<div class="lx-form">
        ${f("Franchise ID", "OH-0731")}${f("Franchise name", "PuroClean Dayton North (fictional)")}
        ${f("SPAR platform", "PSA")}${f("Platform account ID", "P-ACCT-55120")}
        ${f("Credential reference", "vault://spar/psa/OH-0731")}${f("Region", "Central")}
      </div>`)}`;
    return frame("corp", lx("Integration Hub", HUB_TABS, "Franchises", body, { avatar: "PC", toast: done ? toast("success", "OH-0731 is live", "First jobs flow on the next 5-minute cycle \u00b7 0 deployments") : "" }), { clock: "10:05 AM" });
  }

  function security() {
    const S = D.security;
    const body = `
      ${pageHead("#032D60", secSvg, "Trust", "Security & compliance")}
      ${card("Certifications", `<div class="certs">${S.certs.map((c) => `<span class="cert">${c}</span>`).join("")}</div>`, { icon: "#032D60" })}
      ${card("Platform controls", `<ul class="ticks">${S.controls.map((c) => `<li>${c}</li>`).join("")}</ul><p class="lx-note">Source: MuleSoft Trust Center and Anypoint Security.</p>`, { icon: "#032D60" })}`;
    return frame("platform", lx("Integration Hub", HUB_TABS, "Monitoring", body, { avatar: "PC" }), { clock: "2:40 PM" });
  }

  function compare() {
    const body = `
      ${pageHead("#0176D3", bldgSvg, "Operating model", "\u201cIf you win the lottery, what happens?\u201d")}
      <div class="lx-2col">
        ${card("Today", `<ul class="lx-ul"><li>Hand-coded point-to-point Dash feed</li><li>Built in about a week</li><li>Syncs every couple of hours</li><li>Under 2 hrs / week upkeep</li></ul><p class="lx-note">It works, for one feed.</p>`)}
        ${card("Stage 1 and beyond", `<ul class="lx-ul"><li>5 sources, 430 \u2192 900 locations</li><li>30-minute SLA lane</li><li>Monitoring, alerts and replay</li><li>Every API documented in Exchange</li></ul><p class="lx-note">Nick is still the architect. He just isn't the only one who can keep it running.</p>`, { cls: "accent" })}
      </div>`;
    return frame("platform", lx("Integration Hub", HUB_TABS, "Home", body, { avatar: "PC" }), { clock: "2:45 PM" });
  }

  function whatsNext() {
    const body = `
      ${pageHead("#9050E9", SVG.viz.replace("currentColor", "#fff"), "Roadmap", "What's next, when the data is trusted")}
      <div class="lx-3col">
        ${card("Weather overlays", "Storm and hail layers on job volume", { icon: "#9050E9" })}
        ${card("AI agents", "Proactive outreach and triage", { icon: "#9050E9" })}
        ${card("Data Cloud", "Unified franchise and customer view", { icon: "#9050E9" })}
      </div>
      <blockquote>"Dashboards first with an AI proactive mindset."<span>CJ, Sep 28</span></blockquote>
      <p class="lx-note">Roadmap only. Not part of Stage 1.</p>`;
    return frame("cj", lx("PuroClean Ops", ["Home", "Franchises", "Jobs", "Network Operations"], "Home", body), { clock: "7:35 AM" });
  }

  /* ------------------------------------------------------------ Salesforce mobile */
  function phone(roleKey, inner, clock) {
    return frame(roleKey, `<div class="ph">${inner}</div>`, { device: "phone", clock });
  }
  const sfApp = '<span class="sf-app">' + SVG.cloud + "</span>";
  const mHead = (title) => `<div class="m-head"><i>${SVG.back}</i><b>${esc(title)}</b><i>${SVG.bell}</i></div>`;

  function slaAlert(tappable) {
    return phone(
      "rdPhone",
      `<div class="ph-lock"><div class="ph-time">7:02</div><div class="ph-date">Tuesday, February 16</div>
        <div class="notif" ${tappable ? 'data-tap="open"' : ""}>
          <div class="nt-h">${sfApp}<span>SALESFORCE \u00b7 now</span></div>
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
        ? `<div class="m-app">${mHead("Alert")}
            <div class="m-body">
              <div class="m-card err"><span class="lx-badge err">Critical</span><b>psa-sapi \u00b7 503 Service Unavailable</b><p>Since ${O.start} \u00b7 ${O.franchises} franchises affected</p><p>${O.queued.toLocaleString()} events queued \u00b7 <b>0 lost</b></p></div>
              <div class="m-card"><small>Automatic handling</small><div>1. Retries 2s / 8s / 32s exhausted</div><div>2. Circuit breaker open (10 min)</div><div>3. Auto-replay when PSA recovers</div></div>
              <button class="sbtn brand block" data-tap="trace">View trace</button>
              <a class="m-link">Runbook: PSA outage \u203a</a>
            </div></div>`
        : `<div class="ph-lock"><div class="ph-time">2:15</div><div class="ph-date">Tuesday, February 16</div>
            <div class="notif" data-tap="openAlert"><div class="nt-h"><span class="nt-mule">M</span><span>ANYPOINT MONITORING \u00b7 now</span></div>
            <b>psa-sapi: 503 errors since ${O.start}</b><p>${O.franchises} franchises affected. Events queued, none lost. Runbook \u203a</p></div></div>`,
      "2:15"
    );
  }

  /* ------------------------------------------------------------ Tableau Pulse (Salesforce mobile) */
  function pulse() {
    const ohio = [41, 44, 42, 45, 43, 46, 44, 45, 47, 46, 52, 57, 61];
    const avg = 44.2;
    const W = 230, H = 64, P = 4, mn = 36, mx = 64;
    const X = (i) => P + (i * (W - 2 * P)) / (ohio.length - 1);
    const Y = (v) => H - P - ((v - mn) / (mx - mn)) * (H - 2 * P);
    const line = ohio.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
    const chart = `<svg class="pz-chart" viewBox="0 0 ${W} ${H}">
      <rect x="${X(9)}" y="0" width="${W - X(9)}" height="${H}" fill="#fdecec"/>
      <line x1="0" x2="${W}" y1="${Y(avg)}" y2="${Y(avg)}" stroke="#8a8a8a" stroke-dasharray="3 3"/>
      <text x="4" y="${Y(avg) - 4}" class="pz-ax">4-wk avg 44</text>
      <polygon points="${X(0)},${H} ${line} ${X(12)},${H}" fill="#0176D3" opacity=".12"/>
      <polyline points="${line}" fill="none" stroke="#0176D3" stroke-width="2.4" class="draw"/>
      <circle cx="${X(12)}" cy="${Y(61)}" r="4" fill="#C23934" stroke="#fff" stroke-width="2"/></svg>`;
    return phone(
      "cjPhone",
      `<div class="m-app">${mHead("Tableau Pulse")}
        <div class="m-body pz">
          <div class="pz-hi"><b>Good morning, CJ</b><small>Tuesday digest \u00b7 3 metrics you follow</small></div>
          <div class="pz-sum"><div class="pz-sk"><i>\u2726</i> Insights summary</div><p>Open water jobs in Ohio are <b>up 38%</b> against the 4-week average, driven by Columbus and Dayton after Tuesday's storms. Your other metrics are on track.</p></div>
          <div class="pz-card hot">
            <div class="pz-k">Open water jobs <span>Ohio \u00b7 daily</span></div>
            <div class="pz-v">61 <span class="pz-d up">\u25b2 38% vs 4-wk avg</span></div>
            ${chart}
            <div class="pz-ins"><b>Unusual change</b> Columbus +14 \u00b7 Dayton +9 \u00b7 Cincinnati +3</div>
          </div>
          <div class="pz-card"><div class="pz-k">On-time completion <span>Network</span></div><div class="pz-v sm">82% <span class="pz-d ok">\u25cf On track</span></div>${spark([76, 77, 77, 78, 78, 79, 79, 80, 80, 81, 81, 82, 82], { c: "#0176D3", w: 230, h: 22 })}</div>
          <div class="pz-card"><div class="pz-k">Integrations working <span>MuleSoft</span></div><div class="pz-v sm">5 / 5 <span class="pz-d ok">\u25cf All syncing</span></div></div>
        </div></div>`,
      "7:30"
    );
  }

  /* ------------------------------------------------------------ Tableau view embedded in a Lightning page */
  const OPS_TABS = ["Home", "Franchises", "Jobs", "Network Operations", "Reports"];
  const SHEETS = ["Overview", "Regions", "Jobs", "Benchmarks", "Data Health"];
  const T10 = { Water: "#4e79a7", Fire: "#e15759", Mold: "#59a14f", Biohazard: "#f28e2b" };
  const BLUE = ["#dce9f5", "#b5cfe8", "#87b0d8", "#5a8fc4", "#346fa9", "#1d4c80"];
  const plus = (x, y, l, t, c) => `<rect x="${x - l / 2}" y="${y - t / 2}" width="${l}" height="${t}" fill="${c}"/><rect x="${x - t / 2}" y="${y - l / 2}" width="${t}" height="${l}" fill="${c}"/>`;
  const TLOGO = `<svg class="tv-logo" viewBox="0 0 24 24">${plus(12, 12, 9, 2.2, "#E8762D")}${plus(12, 3.4, 5, 1.5, "#C72037")}${plus(12, 20.6, 5, 1.5, "#5B879B")}${plus(3.4, 12, 5, 1.5, "#1F457E")}${plus(20.6, 12, 5, 1.5, "#EB912B")}${plus(5.8, 5.8, 3.4, 1.1, "#59879B")}${plus(18.2, 5.8, 3.4, 1.1, "#1F457E")}${plus(5.8, 18.2, 3.4, 1.1, "#C72037")}${plus(18.2, 18.2, 3.4, 1.1, "#59879B")}</svg>`;

  /* 13 weekly periods, illustrative */
  const SERIES = {
    "Open jobs": { s: [1580, 1602, 1611, 1630, 1625, 1648, 1660, 1655, 1671, 1680, 1690, 1702, 1712], tone: "neu" },
    "Jobs / month / franchise": { s: [10.8, 10.9, 11.0, 11.1, 11.0, 11.2, 11.3, 11.2, 11.4, 11.5, 11.4, 11.5, 11.6], tone: "neu" },
    "Cycle time": { s: [10.4, 10.3, 10.2, 10.1, 10.2, 10.0, 9.9, 9.8, 9.8, 9.7, 9.6, 9.5, 9.4], tone: "good" },
    "On-time completion": { s: [76, 77, 77, 78, 78, 79, 79, 80, 80, 81, 81, 82, 82], tone: "good" },
    Backlog: { s: [240, 236, 238, 231, 229, 226, 224, 222, 220, 219, 217, 216, 214], tone: "good" },
  };

  function spark(s, opt = {}) {
    const w = opt.w || 100, h = opt.h || 24, p = 2.5;
    const mn = Math.min(...s), mx = Math.max(...s), r = mx - mn || 1;
    const pts = s.map((v, i) => [p + (i * (w - 2 * p)) / (s.length - 1), h - p - ((v - mn) / r) * (h - 2 * p)]);
    const line = pts.map((q) => q.map((n) => n.toFixed(1)).join(",")).join(" ");
    const last = pts[pts.length - 1];
    const c = opt.c || "#4e79a7";
    return `<svg class="tv-spark" viewBox="0 0 ${w} ${h}"><polygon points="${p},${h} ${line} ${last[0].toFixed(1)},${h}" fill="${c}" opacity=".13"/><polyline points="${line}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.3" fill="${c}"/></svg>`;
  }

  function bans(list, opt = {}) {
    return `<div class="tv-bans n${list.length}">${list
      .map((k) => {
        const m = k.s ? k : SERIES[k.k] || {};
        const tap = k.lineage && opt.tapLineage;
        const hl = opt.hl === k.k || tap;
        const d = k.d || "";
        const arrow = /^\+/.test(d) ? "\u25b2" : /^[\u2212-]/.test(d) ? "\u25bc" : "";
        const tone = k.tone || m.tone || "neu";
        return `<div class="tv-ban ${tap ? "tappable" : ""} ${hl ? "hl" : ""} ${k.cls || ""}" ${tap ? 'data-tap="lineage"' : ""}>
          <div class="tv-bk">${esc(k.k)}</div>
          <div class="tv-bv">${k.v}</div>
          <div class="tv-bd ${arrow ? tone : "mut"}">${arrow ? `<i>${arrow}</i>` : ""}${esc(d.replace(/^[+\u2212-]/, ""))}</div>
          ${m.s ? spark(m.s, { c: hl ? "#C23934" : k.sc || "#4e79a7" }) : ""}
        </div>`;
      })
      .join("")}</div>`;
  }

  const sheet = (title, body, opt = {}) =>
    `<div class="tv-sh ${opt.cls || ""}"><div class="tv-sh-h"><b>${title}</b>${opt.right ? `<small>${opt.right}</small>` : ""}</div>${body}</div>`;

  function tileMap(opt = {}) {
    const S = 30, SH = 23, G = 3, P = S + G, PH = SH + G, W = 11 * P - G, H = 8 * PH - G, max = 97;
    let tip = "";
    const cells = D.tiles
      .map(([st, c, r]) => {
        const v = D.openJobs[st] || 0;
        const dim = opt.only && !opt.only.includes(st);
        const bi = Math.min(BLUE.length - 1, Math.floor((v / max) * BLUE.length));
        const fill = dim ? "#eef0f3" : BLUE[bi];
        const txt = dim ? "#c3c6cb" : bi >= 3 ? "#fff" : "#1d4c80";
        const x = c * P, y = r * PH;
        const tap = opt.tap === st;
        const sel = opt.sel === st || tap;
        const fade = opt.sel && opt.sel !== st;
        if (opt.tip === st) {
          const k = st === "KS" ? D.kansas : null;
          const top = k ? `${k.byLoss[0].k} (${k.byLoss[0].v})` : "Water";
          tip = `<div class="tv-tip" style="left:${(((x + S + 6) / W) * 100).toFixed(1)}%;top:${((y / H) * 100).toFixed(1)}%">
            <div><span>State</span><b>${st === "KS" ? "Kansas" : st}</b></div><div><span>Open jobs</span><b>${v}</b></div><div><span>Top loss type</span><b>${top}</b></div><div><span>Franchises</span><b>${st === "KS" ? 6 : "\u2014"}</b></div>
            ${tap ? "<em>Click to drill down \u203a</em>" : ""}</div>`;
        }
        return `<g class="tv-tile ${tap ? "tap" : ""} ${fade ? "fade" : ""}" ${tap ? `data-tap="${st}"` : ""}><rect x="${x}" y="${y}" width="${S}" height="${SH}" rx="3" fill="${fill}"/>${sel ? `<rect x="${x - 1.5}" y="${y - 1.5}" width="${S + 3}" height="${SH + 3}" rx="4" fill="none" stroke="#1b1b1b" stroke-width="2"/>` : ""}<text x="${x + S / 2}" y="${y + 10}" text-anchor="middle" fill="${txt}" class="tl">${st}</text>${dim ? "" : `<text x="${x + S / 2}" y="${y + 20}" text-anchor="middle" fill="${txt}" class="tv">${v}</text>`}</g>`;
      })
      .join("");
    const legend = `<div class="tv-legend"><b>Open jobs</b><span>0</span><i style="background:linear-gradient(90deg,${BLUE.join(",")})"></i><span>${max - 1}</span></div>`;
    return `<div class="tv-map"><svg class="tv-tiles" viewBox="0 0 ${W} ${H}">${cells}</svg>${tip}</div>${opt.legend === false ? "" : legend}`;
  }

  function donut(parts, opt = {}) {
    const tot = parts.reduce((a, p) => a + p.v, 0);
    const R = 36, r = 23, cx = 40, cy = 40;
    const pt = (a, rr) => `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`;
    let a0 = -Math.PI / 2;
    const arcs = parts
      .map((p) => {
        const a1 = a0 + (p.v / tot) * Math.PI * 2;
        const lg = a1 - a0 > Math.PI ? 1 : 0;
        const d = `M${pt(a0, R)} A${R},${R} 0 ${lg} 1 ${pt(a1, R)} L${pt(a1, r)} A${r},${r} 0 ${lg} 0 ${pt(a0, r)}Z`;
        a0 = a1;
        return `<path d="${d}" fill="${p.c}" stroke="#fff" stroke-width="1.5"/>`;
      })
      .join("");
    return `<div class="tv-donut"><svg viewBox="0 0 80 80">${arcs}<text x="40" y="41" text-anchor="middle" class="dn-v">${opt.center}</text><text x="40" y="51" text-anchor="middle" class="dn-l">${opt.sub}</text></svg>
      <div class="tv-lg">${parts.map((p) => `<div><i style="background:${p.c}"></i><span>${p.k}</span><b>${Math.round((p.v / tot) * 100)}%</b></div>`).join("")}</div></div>`;
  }

  function area(s, opt = {}) {
    const W = opt.w || 300, H = opt.h || 110, L = 30, B = 15, T = 9, R = 8;
    const mn = opt.min != null ? opt.min : Math.min(...s), mx = opt.max != null ? opt.max : Math.max(...s);
    const X = (i) => L + (i * (W - L - R)) / (s.length - 1);
    const Y = (v) => T + (H - T - B) * (1 - (v - mn) / (mx - mn || 1));
    const fmt = opt.fmt || ((v) => Math.round(v).toLocaleString());
    const line = s.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
    const ticks = opt.ticks || [mn, (mn + mx) / 2, mx];
    const grid = ticks.map((t) => `<line x1="${L}" x2="${W - R}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" class="gl"/><text x="${L - 5}" y="${(Y(t) + 3).toFixed(1)}" text-anchor="end" class="ax">${fmt(t)}</text>`).join("");
    const xl = (opt.xl || []).map(([i, t]) => `<text x="${X(i).toFixed(1)}" y="${H - 3}" text-anchor="middle" class="ax">${t}</text>`).join("");
    const ann = (opt.ann || []).map(([i, t]) => `<line x1="${X(i).toFixed(1)}" x2="${X(i).toFixed(1)}" y1="${T - 4}" y2="${H - B}" class="an"/><text x="${(X(i) + 3).toFixed(1)}" y="${T + 4}" class="anl">${t}</text>`).join("");
    const ref = opt.ref != null ? `<line x1="${L}" x2="${W - R}" y1="${Y(opt.ref).toFixed(1)}" y2="${Y(opt.ref).toFixed(1)}" class="ref"/><text x="${W - R}" y="${(Y(opt.ref) - 3).toFixed(1)}" text-anchor="end" class="refl">${opt.refL || ""}</text>` : "";
    const c = opt.c || "#4e79a7";
    const n = s.length - 1;
    return `<svg class="tv-area" viewBox="0 0 ${W} ${H}">${grid}${ann}<polygon points="${L},${H - B} ${line} ${X(n).toFixed(1)},${H - B}" fill="${c}" opacity=".14"/><polyline points="${line}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round" class="draw"/>${ref}${xl}<circle cx="${X(n).toFixed(1)}" cy="${Y(s[n]).toFixed(1)}" r="3.4" fill="${c}" stroke="#fff" stroke-width="1.6"/>${opt.lastL ? `<text x="${(X(n) - 6).toFixed(1)}" y="${(Y(s[n]) - 7).toFixed(1)}" text-anchor="end" class="lbl">${opt.lastL}</text>` : ""}</svg>`;
  }

  function hbars(rows, opt = {}) {
    const max = opt.max || Math.max(...rows.map((r) => r.v));
    return `<div class="tv-hb">${rows
      .map((r) => `<div class="hb-r ${r.tap ? "tap" : ""} ${r.fade ? "fade" : ""}" ${r.tap ? `data-tap="${r.tap}"` : ""}><span class="hb-k">${r.ico || ""}${esc(r.k)}</span><span class="hb-t"><span style="width:${((r.v / max) * 100).toFixed(1)}%;background:${r.c || "#4e79a7"}"></span></span><b>${r.l != null ? r.l : r.v}</b></div>`)
      .join("")}</div>`;
  }

  function tabShell(title, crumbs, body, opt = {}) {
    const filters = (opt.filters || [["Region", "All"], ["Loss type", "All"], ["Period", "Last 13 weeks"]])
      .map(([l, v, on]) => `<div class="tv-f ${on ? "on" : ""}"><label>${l}</label><span>${esc(v)}<i>\u25be</i></span></div>`)
      .join("");
    const viz = `
      <div class="lx-card tv-wrap">
        <div class="tv-cmp">${TLOGO}<b>${esc(title)}</b><span class="tv-src">Tableau Cloud</span><span class="fresh">\u25cf ${opt.fresh || "Live \u00b7 4 min ago"}</span>${btn("Subscribe", "", "neutral xs")}</div>
        <div class="tv-tabs">${SHEETS.map((s) => `<span class="${s === (opt.sheet || "Overview") ? "on" : ""}">${s}</span>`).join("")}</div>
        <div class="tv-dash">
          <div class="tv-top">
            <div class="tv-crumbs">${crumbs.map((c, i) => `<span class="${i === crumbs.length - 1 ? "on" : ""}">${esc(c)}</span>`).join("<i>\u203a</i>")}</div>
            <div class="tv-filters">${filters}</div>
          </div>
          ${opt.viewAs ? `<div class="tv-rls"><b>Row-level security</b> Viewing as ${esc(opt.viewAs)} \u00b7 filter Region = West from the user's Salesforce attributes</div>` : ""}
          ${body}
        </div>
        <div class="tb-bar"><span>\u21b6</span><span>\u21b7</span><span>\u27f2 Revert</span><span>\u21bb Refresh</span><span>\u25f7 Pause</span><span class="r">\u2913 Download</span><span>\u2922 Full screen</span><b>${TLOGO}Tableau</b></div>
      </div>`;
    return frame(opt.role || "cj", lx("PuroClean Ops", OPS_TABS, "Network Operations", viz, { avatar: opt.role === "rd" ? "RD" : "CB" }), { device: "laptop", clock: opt.clock || "2:00 PM" });
  }

  const NET_LOSS = [
    { k: "Water", v: 58, c: T10.Water },
    { k: "Fire", v: 21, c: T10.Fire },
    { k: "Mold", v: 14, c: T10.Mold },
    { k: "Biohazard", v: 7, c: T10.Biohazard },
  ];
  const STAGES = D.milestones.map((m) => m.label);
  const toMin = (t) => {
    const m = /(\d+):(\d+)\s*(AM|PM)/.exec(t || "");
    if (!m) return null;
    return ((+m[1] % 12) + (m[3] === "PM" ? 12 : 0)) * 60 + +m[2];
  };

  function jobGantt() {
    const ms = D.milestones.filter((m) => !["target_start", "target_completion", "started"].includes(m.field)).slice(0, 8);
    const W = 420, rowH = 17, L = 104, R = 30, T = 16;
    const t0 = 6 * 60, t1 = 12 * 60;
    const X = (m) => L + ((m - t0) / (t1 - t0)) * (W - L - R);
    const H = T + ms.length * rowH + 4;
    let prev = null;
    const hours = [6, 7, 8, 9, 10, 11, 12].map((h) => `<line x1="${X(h * 60)}" x2="${X(h * 60)}" y1="${T - 4}" y2="${H}" class="gl"/><text x="${X(h * 60)}" y="${T - 7}" text-anchor="middle" class="ax">${h > 12 ? h - 12 : h}${h < 12 ? " AM" : " PM"}</text>`).join("");
    const acc = toMin("6:24 AM");
    const sla = `<rect x="${X(acc)}" y="${T + 3 * rowH + 1}" width="${X(acc + 30) - X(acc)}" height="${rowH - 2}" fill="#fbe3e3" stroke="#f0b4b4" stroke-dasharray="2 2" rx="2"/>`;
    const rows = ms
      .map((m, i) => {
        const y = T + i * rowH;
        const t = toMin(m.value);
        const lab = `<text x="${L - 8}" y="${y + 13}" text-anchor="end" class="gk ${t == null ? "pend" : ""}">${m.label}</text>`;
        if (t == null) return `${lab}<text x="${L + 4}" y="${y + 13}" class="gp">pending</text>`;
        const x0 = X(prev == null ? t : prev), x1 = X(t);
        prev = t;
        const c = m.sla ? "#4e79a7" : "#76b7b2";
        return `${lab}<rect x="${x0}" y="${y + 5}" width="${Math.max(3, x1 - x0)}" height="${rowH - 10}" rx="2" fill="${c}" opacity=".85"/><circle cx="${x1}" cy="${y + rowH / 2}" r="4" fill="${c}" stroke="#fff" stroke-width="1.5"/><text x="${x1 + 7}" y="${y + 13}" class="gv">${m.value}</text>`;
      })
      .join("");
    return `<svg class="tv-gantt" viewBox="0 0 ${W} ${H}">${hours}${sla}${rows}</svg>`;
  }

  function tableau(view, opt = {}) {
    const K = D.kansas;
    if (view === "network") {
      return tabShell("Network Operations", ["All franchises"], `${bans(D.kpis)}
        <div class="tv-g g-map">
          ${sheet("Open jobs by state", tileMap({ tap: opt.tap ? "KS" : null, tip: opt.tap ? "KS" : null }), { right: opt.tap ? "Click a state to drill down" : "All four SPAR platforms" })}
          <div class="tv-col">
            ${sheet("Open jobs by loss type", donut(NET_LOSS, { center: "1,712", sub: "open jobs" }))}
            ${sheet("Open jobs \u00b7 last 13 weeks", area(SERIES["Open jobs"].s, { w: 210, h: 64, min: 1560, max: 1720, ticks: [1600, 1700], xl: [[0, "Nov"], [6, "Dec"], [12, "Feb"]], lastL: "1,712" }))}
          </div>
        </div>`);
    }
    if (view === "kansas") {
      const metros = [
        { k: "Kansas City", v: 17 },
        { k: "Wichita", v: 14, c: "#346fa9" },
        { k: "Topeka", v: 9 },
        { k: "Other", v: 7 },
      ];
      return tabShell("Network Operations", ["All franchises", "Kansas"], `${bans([
          { k: "Open jobs \u00b7 Kansas", v: "47", d: "+3 vs last week", s: [38, 40, 39, 41, 42, 41, 43, 44, 43, 45, 44, 46, 47] },
          { k: "Water jobs", v: "31", d: "66% of open", s: [22, 23, 23, 24, 25, 24, 26, 27, 27, 28, 29, 30, 31], sc: T10.Water },
          { k: "Estimated value", v: "$338K", d: "+$21K vs last week", s: [290, 295, 298, 301, 300, 306, 311, 315, 314, 322, 327, 331, 338] },
          { k: "Cycle time", v: "9.0 days", d: "\u22120.4 vs Jan", s: [9.8, 9.7, 9.7, 9.6, 9.5, 9.5, 9.4, 9.3, 9.3, 9.2, 9.1, 9.1, 9.0], tone: "good" },
        ])}
        <div class="tv-g g-map">
          ${sheet("Open jobs by state", tileMap({ sel: "KS", tip: "KS" }), { right: "Kansas selected" })}
          <div class="tv-col">
            ${sheet(`Kansas \u00b7 open jobs by loss type`, hbars(K.byLoss.map((x) => ({ k: x.k, v: x.v, c: x.c, ico: icon(x.k), tap: opt.tap && x.k === "Water" ? "Water" : null }))), { right: opt.tap ? "Click Water" : "" })}
            ${sheet("By metro area", hbars(metros))}
          </div>
        </div>`, { filters: [["Region", "Kansas", true], ["Loss type", "All"], ["Period", "Last 13 weeks"]] });
    }
    if (view === "wichita") {
      const max = Math.max(...K.wichita.list.map((j) => j.est));
      const rows = K.wichita.list
        .map((j) => {
          const tap = j.id === D.job.id && opt.tap;
          const si = STAGES.indexOf(j.stage) + 1;
          return `<tr class="${tap ? "tap" : ""}" ${tap ? 'data-tap="job"' : ""}><td class="lnk">${j.id}</td><td>${j.fr}</td><td><i class="dot" style="background:${T10[j.loss]}"></i>${j.loss}</td>
            <td class="est"><span class="db" style="width:${((j.est / max) * 100).toFixed(0)}%"></span><b>${money(j.est)}</b></td>
            <td class="stg"><span class="pg"><span style="width:${((si / STAGES.length) * 100).toFixed(0)}%"></span></span>${j.stage}</td></tr>`;
        })
        .join("");
      return tabShell("Network Operations", ["All franchises", "Kansas", "Water + Fire", "Wichita area"], `${bans([
          { k: "Open water + fire jobs", v: String(K.wichita.jobs), d: "+2 vs last week", s: [7, 8, 8, 8, 9, 9, 9, 10, 9, 10, 10, 11, 11] },
          { k: "Estimated value", v: money(K.wichita.est), d: "+$9.6K vs last week", s: [61, 63, 64, 66, 65, 68, 70, 71, 72, 74, 75, 78, 80] },
          { k: "Franchises", v: "2", d: "Wichita East, West" },
          { k: "Avg job age", v: "2.3 days", d: "\u22120.5 vs Jan", tone: "good", s: [3.1, 3.0, 3.0, 2.9, 2.8, 2.8, 2.7, 2.6, 2.6, 2.5, 2.4, 2.4, 2.3] },
        ])}
        ${sheet("Wichita area \u00b7 open jobs", `<table class="tv-table"><thead><tr><th>Job</th><th>Franchise</th><th>Loss</th><th>Estimate</th><th>Current milestone (of 18)</th></tr></thead><tbody>${rows}</tbody></table>`, { right: opt.tap ? `Click ${D.job.id}` : "Sorted by last update" })}`,
        { sheet: "Jobs", filters: [["Region", "Kansas", true], ["Loss type", "Water, Fire", true], ["Metro", "Wichita", true]] });
    }
    if (view === "job") {
      const reached = D.milestones.filter((m) => m.value && !["target_start", "target_completion", "started"].includes(m.field)).length;
      return tabShell("Job detail", ["All franchises", "Kansas", "Wichita area", D.job.id], `${bans([
          { k: "Milestones reached", v: `${reached} / 18`, d: "PuroLogic Dates" },
          { k: "SLA milestones", v: "4 / 4 met", d: "Dispatch \u2192 Inspected", cls: "ok" },
          { k: "Elapsed", v: "5h 28m", d: "loss to estimate sent" },
          { k: "Estimate", v: `$${D.job.estimate.toLocaleString()}`, d: `${D.job.loss}, ${D.job.category}` },
        ])}
        ${sheet(`${D.job.id} \u00b7 ${D.franchise.name} \u00b7 milestone timeline`, jobGantt(), { right: "<i class=\"dot\" style=\"background:#4e79a7\"></i>SLA milestone <i class=\"dot\" style=\"background:#76b7b2\"></i>Other <i class=\"dot sq\"></i>30-min contact window" })}
        <div class="tv-foot">Source: Dash via MuleSoft job-sync \u00b7 11:11 curated.job_milestone \u00b7 Target Completion Feb 19</div>`,
        { sheet: "Jobs", filters: [["Job", D.job.id, true], ["Franchise", "Wichita East", true]] });
    }
    if (view === "rd") {
      const rows = D.west.map((s) => ({ k: { CA: "California", OR: "Oregon", WA: "Washington", NV: "Nevada" }[s], v: D.openJobs[s], c: "#346fa9" })).sort((a, b) => b.v - a.v);
      return tabShell("Network Operations", ["West Region"], `${bans(D.kpisWest)}
        <div class="tv-g g-map">
          ${sheet("Open jobs by state", tileMap({ only: D.west, legend: false }), { right: "Only West Region rows returned" })}
          <div class="tv-col">
            ${sheet("West Region \u00b7 open jobs by state", hbars(rows))}
            ${sheet("On-time completion \u00b7 13 weeks", area([79, 80, 80, 81, 81, 82, 82, 83, 82, 83, 84, 84, 84], { w: 210, h: 64, min: 76, max: 86, ticks: [78, 84], fmt: (v) => v + "%", ref: 82, refL: "Network 82%", lastL: "84%" }))}
          </div>
        </div>`, { role: "rd", viewAs: "Regional Director, West", sheet: "Regions", filters: [["Region", "West", true], ["Loss type", "All"], ["Period", "Last 13 weeks"]] });
    }
    if (view === "bench") {
      const rows = D.benchmark
        .map((b) => {
          const max = Math.max(b.fr, b.net) * 1.3;
          const good = b.better === "high" ? b.fr >= b.net : b.fr <= b.net;
          const pct = Math.round((Math.abs(b.fr - b.net) / b.net) * 100);
          return `<div class="bu-r"><span class="bu-k">${b.k}</span>
            <span class="bu-t"><span class="bu-band" style="width:${((b.net / max) * 100).toFixed(1)}%"></span><span class="bu-bar ${good ? "good" : "bad"}" style="width:${((b.fr / max) * 100).toFixed(1)}%"></span><span class="bu-ref" style="left:${((b.net / max) * 100).toFixed(1)}%"></span></span>
            <b>${b.fmt(b.fr)}</b><span class="bu-d ${good ? "good" : "bad"}">${good ? "\u25b2" : "\u25bc"} ${pct}% ${good ? "better" : "worse"}</span></div>`;
        })
        .join("");
      return tabShell("Franchise benchmarking", ["All franchises", "Kansas", D.franchise.name], `
        ${sheet(`${D.franchise.name} vs network average`, `<div class="bu-lg"><span><i class="bu-sw good"></i>Franchise</span><span><i class="bu-sw ref"></i>Network average</span><span><i class="bu-sw band"></i>0 to network average</span></div>${rows}`, { right: "Certified KPIs from CJ's list" })}
        <div class="tv-later"><b>Financial benchmarks</b> Revenue, gross margin, labor and material %, growth trend <span>Stage 3, with QuickBooks Online</span></div>`,
        { sheet: "Benchmarks", filters: [["Franchise", D.franchise.name, true], ["Compare to", "Network average", true], ["Period", "Last 13 weeks"]] });
    }
    if (view === "lineage") {
      const guide = `<div class="tv-guide"><div class="tg-h">Data Guide</div>
        <div class="tg-i"><small>Metric</small><b>On-Time Completion % <span class="cert">\u2714 Certified</span></b></div>
        <div class="tg-i"><small>Definition</small><span>Completed jobs where Majority Completion \u2264 Target Completion, \u00f7 completed jobs</span></div>
        <div class="tg-i"><small>Data source</small><span><code>curated.job_milestone</code> \u00b7 11:11 SQL Server \u00b7 live</span></div>
        <div class="tg-i"><small>Upstream</small><span>MuleSoft job-sync-papi \u00b7 4 SPAR platforms</span></div>
        <div class="tg-i"><small>Owner</small><span>PuroClean IT (Nick)</span></div></div>`;
      return tabShell("Network Operations", ["All franchises"], `${bans(D.kpis, { tapLineage: opt.tap, hl: opt.tap ? null : "On-time completion" })}
        <div class="tv-g g-lin">
          ${sheet("On-time completion \u00b7 last 13 weeks", area(SERIES["On-time completion"].s, { w: 250, h: 112, min: 74, max: 84, ticks: [76, 80, 84], fmt: (v) => v + "%", c: opt.tap ? "#4e79a7" : "#C23934", xl: [[0, "Nov"], [6, "Dec"], [12, "Feb"]], ref: 80, refL: "Target 80%", lastL: "82%" }), { right: opt.tap ? "Click the On-time completion tile" : "Traced on the right" })}
          ${guide}
        </div>`);
    }
    if (view === "health" || view === "health-amber" || view === "health-ok") {
      const amber = view === "health-amber";
      const plats = [
        ["Dash", "1 min ago", [42, 45, 44, 47, 46, 48, 50, 49]],
        ["PSA", amber ? "delayed \u00b7 events queued" : "2 min ago", amber ? [38, 40, 39, 41, 0, 0, 0, 0] : [38, 40, 39, 41, 42, 40, 43, 44]],
        ["Albi", "3 min ago", [21, 22, 21, 23, 24, 23, 25, 24]],
        ["JobSite", "1 min ago", [30, 31, 29, 32, 33, 31, 34, 35]],
        ["FranConnect", "nightly \u00b7 2:00 AM", [5, 5, 5, 5, 5, 5, 5, 5]],
      ];
      const strip = `<div class="tv-int">${plats
        .map(([n, t, s]) => {
          const bad = amber && n === "PSA";
          return `<div class="ti ${bad ? "amber" : ""}"><div class="ti-h"><i></i><b>${n}</b></div><small>${t}</small>${spark(s, { c: bad ? "#d97a00" : "#59a14f", w: 90, h: 18 })}</div>`;
        })
        .join("")}</div>`;
      return tabShell("Data Health & Integrations", ["All franchises"], `${bans([
          { k: "Franchises with usable data", v: "64%", d: "+45 pts since Wave 1", tone: "good", s: [19, 19, 21, 24, 30, 37, 43, 48, 52, 56, 59, 62, 64] },
          { k: "Integrations working", v: amber ? "4 / 5" : "5 / 5", d: amber ? "PSA delayed \u00b7 events queued" : "all platforms syncing", cls: amber ? "amber" : "ok" },
          { k: "Records quarantined \u00b7 7 days", v: "312", d: "\u22120.2 pts \u00b7 0.4% of volume", tone: "good", s: [0.9, 0.85, 0.8, 0.8, 0.7, 0.66, 0.6, 0.58, 0.55, 0.5, 0.46, 0.42, 0.4] },
        ])}
        ${strip}
        <div class="tv-g g-half">
          ${sheet("Usable data, % of franchises", area([19, 19, 21, 24, 30, 37, 43, 48, 52, 56, 59, 62, 64], { w: 230, h: 84, min: 0, max: 100, ticks: [0, 50, 100], fmt: (v) => v + "%", c: "#59a14f", ann: [[3, "Wave 1"], [7, "Wave 2"]], ref: 95, refL: "Target 95%", lastL: "64%" }))}
          ${sheet("Top quarantine reasons", hbars([["Missing loss type", 41], ["Duplicate job", 33], ["Dates out of order", 17], ["Unknown franchise", 9]].map(([k, v]) => ({ k, v, l: v + "%", c: "#e15759" })), { max: 45 }))}
        </div>`, { sheet: "Data Health", clock: amber ? "2:16 PM" : "2:00 PM", fresh: amber ? "PSA 2 min delayed" : "Live \u00b7 4 min ago" });
    }
    return "";
  }

  return { frame, jobApp, syncQueue, addPlatform, slaAlert, failAlert, pulse, tableau, scale, onboard, security, compare, whatsNext, money, icon };
})();
