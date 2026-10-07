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

  function pulse() {
    return phone(
      "cjPhone",
      `<div class="m-app">${mHead("Tableau Pulse")}
        <div class="m-body">
          <div class="m-greet">Good morning. 1 metric needs attention.</div>
          <div class="pulse-card"><div class="pl-k">Open water jobs \u00b7 Ohio</div><div class="pl-v">61 <span class="up">\u25b2 38%</span></div>
          <svg viewBox="0 0 220 60" class="spark"><polyline points="0,46 20,44 40,47 60,43 80,45 100,42 120,44 140,40 160,38 180,24 200,14 220,10" fill="none" stroke="#0176D3" stroke-width="3"/></svg>
          <p>Up 38% vs the 4-week average, mostly Columbus and Dayton, after Tuesday's storms.</p></div>
          <div class="pulse-card small"><div class="pl-k">On-time completion \u00b7 network</div><div class="pl-v">82% <span class="flat">steady</span></div></div>
          <div class="pulse-card small"><div class="pl-k">Integrations working</div><div class="pl-v">5 / 5 <span class="flat">all green</span></div></div>
        </div></div>`,
      "7:30"
    );
  }

  /* ------------------------------------------------------------ Tableau embedded in a Lightning page */
  const OPS_TABS = ["Home", "Franchises", "Jobs", "Network Operations", "Reports"];

  function tabShell(title, crumbs, body, opt = {}) {
    const viz = `
      ${pageHead("#E97627", SVG.viz.replace("currentColor", "#fff"), "Tableau dashboard", title, btn("Subscribe") + btn("Share"), `<span class="fresh">\u25cf Data as of ${opt.fresh || "4 min ago"}</span>`)}
      <div class="tb">
        <div class="tb-crumbs">${crumbs.map((c, i) => `<span class="${i === crumbs.length - 1 ? "on" : ""}">${esc(c)}</span>`).join("<i>\u203a</i>")}${opt.viewAs ? `<span class="tb-viewas">Viewing as: ${esc(opt.viewAs)}</span>` : ""}</div>
        <div class="tb-body">${body}</div>
        <div class="tb-bar"><span>\u21b6</span><span>\u21b7</span><span>\u27f2 Revert</span><span>\u21bb Refresh</span><span class="r">\u2913 Download</span><span>\u2197 Share</span><b>Tableau</b></div>
      </div>`;
    return frame(opt.role || "cj", lx("PuroClean Ops", OPS_TABS, "Network Operations", viz, { avatar: opt.role === "rd" ? "RD" : "CB" }), { device: "laptop", clock: opt.clock || "2:00 PM" });
  }

  function kpiTiles(opt = {}) {
    return `<div class="tb-kpis">${(opt.kpis || D.kpis)
      .map((k) => `<div class="kpi ${k.lineage && opt.tapLineage ? "tappable" : ""} ${opt.hl === k.k ? "hl" : ""}" ${k.lineage && opt.tapLineage ? 'data-tap="lineage"' : ""}><div class="kpi-k">${k.k}</div><div class="kpi-v">${k.v}</div><div class="kpi-d">${k.d}</div></div>`)
      .join("")}</div>`;
  }

  function usMap(opt = {}) {
    const S = 38, G = 4, max = 96;
    const cells = D.tiles
      .map(([st, c, r]) => {
        const v = D.openJobs[st] || 0;
        const dim = opt.only && !opt.only.includes(st);
        const a = 0.15 + 0.85 * (v / max);
        const fill = dim ? "#e6e8ec" : `rgba(1,118,211,${a.toFixed(2)})`;
        const txt = dim ? "#b6b9be" : a > 0.5 ? "#fff" : "#014486";
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
        .map((j) => `<tr class="${j.id === D.job.id && opt.tap ? "tap" : ""}" ${j.id === D.job.id && opt.tap ? 'data-tap="job"' : ""}><td class="lnk">${j.id}</td><td>${j.fr}</td><td>${icon(j.loss)} ${j.loss}</td><td>${money(j.est)}</td><td>${j.stage}</td></tr>`)
        .join("");
      return tabShell("Network Operations", ["All franchises", "Kansas", "Water + Fire", "Wichita area"], `
        <div class="tb-kpis three"><div class="kpi"><div class="kpi-k">Open water + fire jobs</div><div class="kpi-v">${K.wichita.jobs}</div></div>
        <div class="kpi hl"><div class="kpi-k">Estimated value</div><div class="kpi-v">${money(K.wichita.est)}</div></div>
        <div class="kpi"><div class="kpi-k">Franchises</div><div class="kpi-v">2</div></div></div>
        <div class="tb-card"><div class="tb-h">Wichita area jobs <small>tap ${D.job.id}</small></div>
          <table class="tb-table"><thead><tr><th>Job</th><th>Franchise</th><th>Loss</th><th>Estimate</th><th>Current milestone</th></tr></thead><tbody>${rows}</tbody></table></div>`);
    }
    if (view === "job") {
      const done = D.milestones.filter((m) => m.value && !["target_start", "target_completion", "started"].includes(m.field));
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
        <div class="tb-note">1 of 12\u201313 regional directors. Same dashboard, filtered to this region.</div></div></div>`, { role: "rd", viewAs: "Regional Director, West" });
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
        <p class="tb-ask">${opt.tap ? "Tap the tile to trace it." : "Traced on the right: Tableau, MuleSoft, then each platform's field."}</p></div>`);
    }
    if (view === "health" || view === "health-amber" || view === "health-ok") {
      const amber = view === "health-amber";
      return tabShell("Data Health & Integrations", ["All franchises"], `
        <div class="tb-kpis three">
          <div class="kpi"><div class="kpi-k">Franchises with usable data</div><div class="kpi-v">64% <small class="up">from 19%</small></div></div>
          <div class="kpi ${amber ? "amber" : "green"}"><div class="kpi-k">Integrations working</div><div class="kpi-v">${amber ? "4 / 5" : "5 / 5"}</div><div class="kpi-d">${amber ? "PSA delayed \u00b7 events queued" : "all platforms syncing"}</div></div>
          <div class="kpi"><div class="kpi-k">Records quarantined (7 days)</div><div class="kpi-v">312</div><div class="kpi-d">0.4% of volume</div></div></div>
        <div class="tb-grid"><div class="tb-card"><div class="tb-h">Usable data, % of franchises</div>
          <svg viewBox="0 0 300 110" class="trend"><polyline points="0,92 40,90 80,86 120,70 160,58 200,46 240,38 280,32 300,30" fill="none" stroke="#0176D3" stroke-width="3"/><line x1="120" y1="0" x2="120" y2="110" stroke="#C50A1D" stroke-dasharray="4 3"/><text x="124" y="12" class="tr-l">Wave 1</text><line x1="200" y1="0" x2="200" y2="110" stroke="#C50A1D" stroke-dasharray="4 3"/><text x="204" y="12" class="tr-l">Wave 2</text></svg></div>
        <div class="tb-card"><div class="tb-h">Top quarantine reasons</div><div class="bars">
          ${[["Missing loss type", 41], ["Duplicate job", 33], ["Dates out of order", 17], ["Unknown franchise", 9]].map(([k, v]) => `<div class="bar-row"><span class="bl">${k}</span><span class="bt"><span style="width:${v * 2.2}%;background:#C50A1D"></span></span><span class="bv">${v}%</span></div>`).join("")}
        </div></div></div>`, { clock: amber ? "2:16 PM" : "2:00 PM", fresh: amber ? "PSA: 2 min delayed" : "4 min ago" });
    }
    return "";
  }

  return { frame, jobApp, syncQueue, addPlatform, slaAlert, failAlert, pulse, tableau, scale, onboard, security, compare, whatsNext, money, icon };
})();
