/* Left pane: what each person sees. Every function returns an HTML string.
   Shells: "vendor" is a neutral stand-in for a franchise's job platform (not the vendor's real UI),
   "admin" is an illustrative PuroClean admin console, "tableau" is Tableau Cloud. */
window.Screens = (function () {
  const D = window.PC;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const money = (v) => "$" + (v >= 1000 ? (Math.round(v / 100) / 10).toFixed(1).replace(/\.0$/, "") + "K" : v.toLocaleString());
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
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M4 7.5l8 6 8-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
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

  /* ------------------------------------------------------------ app shell */
  function lx(app, tabs, active, body, opt = {}) {
    const kind = opt.kind || "admin";
    const brand =
      kind === "tableau"
        ? `<span class="lx-brand">${TLOGO}<b>Tableau Cloud</b><em>PuroClean</em></span>`
        : kind === "anypoint"
        ? `<span class="lx-brand">${APLOGO}<b>Anypoint Platform</b><em>${esc(app)}</em></span>`
        : kind === "admin"
        ? `<span class="lx-brand"><img class="lx-logo" src="assets/puroclean-logo.svg" alt="PuroClean"/><b>${esc(app)}</b>${opt.tag ? `<em>${esc(opt.tag)}</em>` : ""}</span>`
        : `<span class="lx-brand"><span class="vx-mark">${esc(app[0])}</span><b>${esc(app)}</b>${opt.tag ? `<em>${esc(opt.tag)}</em>` : ""}</span>`;
    const search = kind === "tableau" ? "Search views, metrics and data sources" : kind === "anypoint" ? "Search Anypoint Platform" : "Search...";
    return `<div class="lx ${kind}">
      <div class="lx-gh">
        ${brand}
        <div class="lx-search">${SVG.search}<span>${search}</span></div>
        <div class="lx-ghi"><i>${SVG.help}</i>${kind === "tableau" || kind === "anypoint" ? "" : `<i>${SVG.gear}</i>`}<i class="bell ${opt.bell ? "on" : ""}">${SVG.bell}</i><span class="lx-av">${opt.avatar || "CB"}</span></div>
      </div>
      ${kind === "anypoint" ? `<div class="ap-env-bar"><span class="ap-env-sel">Production <i>\u25be</i></span>${(tabs || []).map((t) => `<span class="lx-tab ${t === active ? "on" : ""}">${esc(t)}</span>`).join("")}</div>` : `<div class="lx-nav">${(tabs || []).map((t) => `<span class="lx-tab ${t === active ? "on" : ""}">${esc(t)}</span>`).join("")}</div>`}
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

  /* ------------------------------------------------------------ franchise job record (neutral stand-in for the vendor app) */
  const PATH_FIELDS = ["date_of_loss", "dispatch", "received_accepted", "contacted", "inspected", "started", "target_completion"];

  const GUIDE = {
    date_of_loss: { keys: ["date_of_loss", "loss"], tip: "Record when the loss happened, from the customer or the carrier\u2019s assignment." },
    dispatch: { keys: ["dispatch", "carrier"], tip: "Log the time the carrier or TPA dispatched the job to your office." },
    received_accepted: { keys: ["dispatch", "received_accepted"], tip: "Accept the job as soon as you receive it. The 30-minute customer-contact clock starts at acceptance (illustrative SLA)." },
    contacted: { keys: ["received_accepted", "contacted"], tip: "Contact the customer within 30 minutes of accepting the job. Email or call from Activity; Contacted is set when it\u2019s logged." },
    inspected: { keys: ["contacted", "inspected"], tip: "Inspect the loss, capture photos and moisture readings, then record the inspection time." },
    started: { keys: ["inspected", "started"], tip: "Record when mitigation work began on site." },
    target_completion: { keys: ["started", "target_completion"], tip: "Set a completion date the customer and the carrier can plan around." },
  };

  function path(set, vKey, flash) {
    const v = D.vendors[vKey];
    const lbl = (f) => (v.labels && v.labels[f]) || (D.milestones.find((m) => m.field === f) || {}).label;
    const ms = D.milestones.filter((m) => PATH_FIELDS.includes(m.field));
    const cur = ms.findIndex((m) => !set[m.field]);
    const focus = ms[cur < 0 ? ms.length - 1 : cur];
    const g = GUIDE[focus.field];
    const keyVal = (k) =>
      k === "loss" ? ["Loss type", D.job.loss] : k === "carrier" ? ["Carrier", D.job.carrier] : [lbl(k), set[k] || "\u2014"];
    const keys = g.keys.map((k) => [k, ...keyVal(k)]).map(([k, a, b]) => `<div class="lx-kf ${k === flash ? "flash" : ""}"><small>${esc(a)}</small><span>${esc(b)}</span></div>`).join("");
    return `<div class="lx-pathc">
      <div class="lx-path"><span class="lx-ptog" title="Hide guidance">${SVG.chev}</span><div class="lx-ptrack">${ms
        .map((m, i) => {
          const st = set[m.field] ? "done" : i === cur ? "cur" : "todo";
          return `<div class="lx-pi ${st} ${m.field === flash ? "just" : ""}" title="${esc(lbl(m.field))}">${st === "done" ? `<i>${SVG.check}</i>` : `<span>${esc(lbl(m.field))}</span>`}</div>`;
        })
        .join("")}</div></div>
      <div class="lx-coach">
        <div><div class="lx-ct">Key Fields <a>Edit</a></div><div class="lx-kfs">${keys}</div></div>
        <div><div class="lx-ct">Guidance for Success <a>Edit</a></div><p>${esc(g.tip)}</p></div>
      </div>
    </div>`;
  }

  const PHONE = '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="currentColor"/></svg>';
  const TPL = '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const CUSTOMER = { name: "Dana Whitfield", email: "dana.whitfield@example.com" };
  const EMAIL_TPL = {
    subject: "PuroClean: next steps on your water damage claim",
    body: `Hi Dana, this is Alex, your project manager at PuroClean Wichita East. We\u2019ve received your claim (${D.job.claim}) and our crew is ready to help.<br/><br/>Reply or call (316) 555-0142 to confirm an inspection window this morning.<br/>\u2014 Alex`,
  };

  /* Activity timeline + docked email composer. a = { composer: "pick" | "filled", sent, tap } */
  function activityCard(a) {
    const item = (k, ico, title, sub, time, cls = "") =>
      `<div class="at-i ${cls}"><span class="at-ic ${k}">${ico}</span><div class="at-t"><b>${title}</b><small>${sub}</small></div><time>${time}</time></div>`;
    const upcoming = a.sent
      ? ""
      : `<div class="at-sec">Upcoming &amp; Overdue</div>${item("task", SVG.check, "Contact customer", "Due 6:54 AM \u00b7 30 min after acceptance (illustrative SLA)", "6:54 AM", "due")}`;
    const sent = a.sent ? item("email", SVG.mail, `Email: ${EMAIL_TPL.subject}`, `To ${CUSTOMER.name} \u00b7 template \u201cInitial contact \u00b7 water loss\u201d \u00b7 Contacted set`, "6:41 AM", "new") : "";
    return `<div class="lx-card at-card">
      <div class="at-tabs"><span class="on">Activity</span><span>Job dates</span><span>Notes</span></div>
      <div class="at-acts">
        <button class="at-btn" ${a.tap === "email" ? 'data-tap="email"' : ""}>${SVG.mail} Email</button>
        <button class="at-btn">${PHONE} Log a Call</button>
        <button class="at-btn">${SVG.check} New Task</button>
      </div>
      ${upcoming}
      <div class="at-sec">Today \u00b7 ${D.job.day.replace(", 2027", "")}</div>
      <div class="at-list">
        ${sent}
        ${item("task", SVG.check, "Job accepted", "Alex \u00b7 Received/Accepted set", "6:24 AM")}
        ${item("call", PHONE, `Dispatched by ${D.job.carrier}`, `Claim ${D.job.claim}`, "6:20 AM")}
        ${item("event", SVG.bell, "Loss reported", `${D.job.loss} \u00b7 ${D.job.category.split(" \u00b7 ")[1] || ""}`, "6:12 AM")}
      </div>
    </div>`;
  }

  function composer(a) {
    if (!a.composer) return "";
    const filled = a.composer === "filled";
    const tpls = [["Initial contact \u00b7 water loss", "First outreach after acceptance", "tpl"], ["Inspection reminder", "Day-before reminder"], ["Estimate ready for review", "Sends the estimate link"]];
    const picker = a.composer === "pick"
      ? `<div class="ecmp-pick"><div class="ecmp-ph">Insert email template</div><div class="ecmp-search">${SVG.search}<span>Search templates\u2026</span></div>${tpls
          .map(([n, d, tap]) => `<div class="ecmp-tpl" ${tap && a.tap === "tpl" ? `data-tap="${tap}"` : ""}><b>${n}</b><small>${d}</small></div>`)
          .join("")}</div>`
      : "";
    return `<div class="ecmp">
      <div class="ecmp-h"><span>${SVG.mail} New Email</span><i>\u2013 \u2922 \u2715</i></div>
      <div class="ecmp-r"><label>From</label><span>Alex &lt;alex@pcwichitaeast.example&gt;</span></div>
      <div class="ecmp-r"><label>To</label><span class="ecmp-pill">${CUSTOMER.name}</span></div>
      <div class="ecmp-r"><label>Subject</label><span>${filled ? EMAIL_TPL.subject : ""}</span></div>
      <div class="ecmp-body ${filled ? "filled" : ""}">${filled ? EMAIL_TPL.body : ""}</div>
      ${picker}
      <div class="ecmp-f"><span class="ecmp-tool ${a.composer === "pick" ? "on" : ""}">${TPL} Insert template</span><button class="sbtn brand" ${a.tap === "send" ? 'data-tap="send"' : ""}>Send</button></div>
    </div>`;
  }

  function jobApp(st = {}) {
    const vKey = st.vendor || "dash";
    const v = D.vendors[vKey];
    const J = D.job;
    const set = st.dates || {};
    const ref = v.payload.job_no || v.payload.JobNumber || v.payload.projectId || v.payload.id;
    const switcher = st.switcher
      ? `<div class="lx-switch"><span>Source platform</span><div class="sbtn-group">${Object.entries(D.vendors)
          .map(([k, x]) => `<button class="${k === vKey ? "on" : ""}" data-tap="v-${k}">${x.name}</button>`)
          .join("")}</div><em>simulated screens \u00b7 vendor labels illustrative</em></div>`
      : "";
    const fields = D.milestones
      .filter((m) => PATH_FIELDS.includes(m.field))
      .map((m) => {
        const lbl = (v.labels && v.labels[m.field]) || m.label;
        const val = set[m.field];
        return `<div class="lx-f ${st.flash === m.field ? "flash" : ""}"><label>${esc(lbl)}</label>
          <div class="lx-fv">${val ? esc(val) : '<span class="mut">\u2014</span>'}</div></div>`;
      })
      .join("");
    const actions = (st.actions || []).map((a) => btn(a.label, a.tap, a.kind === "ghost" ? "neutral" : "brand")).join("") || btn("Edit");
    const body = `
      ${pageHead("#5f7480", houseSvg, `${v.name} job`, st.isNew ? "New job" : ref, actions)}
      <div class="lx-hl">
        <div><small>Franchise</small><b class="lnk">${esc(st.franchise || D.franchise.name)}</b></div>
        <div><small>Loss type</small><b>${icon(J.loss)} ${J.loss}</b></div>
        <div><small>Category</small><b>${J.category.split(" \u00b7 ")[0]}</b></div>
        <div><small>Address</small><b>${esc(J.address.split(",")[0])}</b></div>
      </div>
      ${switcher}
      ${path(set, vKey, st.flash)}
      ${st.activity ? activityCard(st.activity) : card("Job dates", `<div class="lx-fields">${fields}</div>`, { right: `${J.carrier} \u00b7 ${J.claim}` })}
      ${st.activity ? composer(st.activity) : ""}
      ${st.activity && st.activity.sent ? `<div class="sf-toast">${SVG.check}<span>Email was sent. <small>Contacted set to 6:41 AM</small></span></div>` : ""}`;
    return frame(st.role || "pm", lx(v.name, ["Jobs", "Schedule", "Estimates"], "Jobs", body, { kind: "vendor", tag: "simulated", avatar: "PM" }), { clock: st.clock || "6:21 AM" });
  }

  /* Recent changes on a Dash multi-location account, as the franchise sees them. */
  function dashJobs() {
    const rows = [
      ["D-889305", "/01 Derby", "2417 N Rock Rd", "Water", "Created 10:12 AM"],
      ["D-889301", "/01 Derby", "1180 S Webb Rd", "\u2014", "Created 10:09 AM"],
      ["D-889297", "/03 Andover", "905 E Central Ave", "Fire", "Inspected set 10:04 AM"],
    ];
    const body = `
      ${pageHead("#5f7480", houseSvg, "Dash jobs", "Recently changed", btn("New job"), "Account DASH-M-0412 \u00b7 3 locations")}
      ${card("3 jobs \u00b7 sorted by last modified", `<table class="lx-dt"><thead><tr><th>Job</th><th>Location</th><th>Address</th><th>Loss type</th><th>Last change</th></tr></thead><tbody>${rows
        .map((r) => `<tr><td class="lnk">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td class="mut">${r[4]}</td></tr>`)
        .join("")}</tbody></table>`)}
      <p class="lx-note">D-889305 repeats the address, date of loss and claim of D-889214, logged earlier at the main office. D-889301 was saved without a loss type.</p>`;
    return frame("sync", lx("Dash", ["Jobs", "Schedule", "Estimates"], "Jobs", body, { kind: "vendor", tag: "simulated", avatar: "PM" }), { clock: "10:15 AM" });
  }

  /* ------------------------------------------------------------ PuroClean integration admin (illustrative) */
  const HUB_TABS = ["Home", "Platforms", "Franchises", "Monitoring", "Security"];
  const admin = (role, active, body, clock, opt = {}) =>
    frame(role, lx("Integration Admin", HUB_TABS, active, body, { kind: "admin", tag: "illustrative", avatar: "PC", ...opt }), { clock });

  function addPlatform(added) {
    const tile = (p, cls, sub, tap) => `<div class="lx-tile ${cls}" ${tap ? `data-tap="${tap}"` : ""}><span class="lx-oi sm" style="background:${cls.includes("add") ? "#c9c9c9" : "var(--sf)"}">${bldgSvg}</span><div><b>${p}</b><small>${sub}</small></div>${cls.includes("new") ? '<span class="lx-badge warn">In test</span>' : cls.includes("on") ? '<span class="lx-badge ok">Live</span>' : ""}</div>`;
    const body = `
      ${pageHead("var(--sf)", bldgSvg, "SPAR platforms", "Connected platforms", added ? "" : btn("New platform", "add", "brand"))}
      ${card("Platforms (" + (added ? 5 : 4) + ")", `<div class="lx-tiles">
        ${["Dash", "PSA", "Albi", "JobSite"].map((p) => tile(p, "on", "System API + mapping")).join("")}
        ${added ? tile("New SPAR platform", "on new", "new System API + mapping") : tile("+ Add platform", "add", "once PuroClean approves it", "add")}
      </div>`)}
      <p class="lx-note">Each platform gets one System API with its own mapping, typically a few weeks of build and test. The Process API, quality rules, 11:11 tables and Tableau are reused as they are.</p>`;
    return admin("corp", "Platforms", body, "9:10 AM", { toast: added ? toast("success", "new-sapi deployed to test", "0 changes downstream") : "" });
  }

  function scale(idx, surge) {
    const s = D.scale[idx];
    const reps = surge ? s.surge : s.replicas;
    const body = `
      ${pageHead("var(--sf)", bldgSvg, "Capacity", "Franchise locations connected")}
      ${card("Network size", `
        <div class="sbtn-group wide">${D.scale.map((x, i) => `<button class="${i === idx ? "on" : ""}" data-tap="sc-${i}">${x.label}</button>`).join("")}</div>
        <div class="lx-slider"><span style="width:${(s.loc / 900) * 100}%"></span><i style="left:${(s.loc / 900) * 100}%"></i></div>
        <label class="lx-toggle ${surge ? "on" : ""}" data-tap="surge"><span class="sw"></span> Storm surge (4x volume)</label>
        <div class="lx-stats"><div><small>Jobs / day</small><b>${s.jobs.toLocaleString()}</b></div><div><small>Job updates / day</small><b>${(surge ? s.peak : s.events).toLocaleString()}</b></div><div><small>Replicas</small><b>${reps}${reps > s.replicas ? ` <small>autoscaled</small>` : ""}</b></div><div><small>SLA-lane pickup</small><b>${s.latency}</b></div></div>
        <p class="lx-note">Volumes illustrative: 11.6 jobs per franchise a month, about 40 tracked updates per job.</p>`)}`;
    return admin("corp", "Home", body, "2:05 PM");
  }

  function onboard(done) {
    const f = (l, v) => `<div class="lx-in"><label>${l}</label><div>${esc(v)}</div></div>`;
    const body = `
      ${pageHead("#3BA755", bldgSvg, "Franchise", "PuroClean Dayton North", done ? '<span class="lx-badge ok">Connected</span>' : btn("Cancel") + btn("Connect", "golive", "brand"), "OH-0731 (fictional)")}
      ${card("From FranConnect", `<div class="lx-form">
        ${f("Franchise ID", "OH-0731")}${f("Franchise name", "PuroClean Dayton North (fictional)")}
        ${f("Region", "Central")}${f("Status", "Open")}
      </div>`)}
      ${card("Platform account mapping", `<div class="lx-form">
        ${f("SPAR platform", "PSA")}${f("Platform account", "PSA-T-55120")}
        ${f("Access", "PuroClean's corporate PSA integration (per vendor, to confirm)")}${f("Sync lanes", "SLA every 5 min \u00b7 nightly 2:00 AM")}
      </div>`)}`;
    return admin("corp", "Franchises", body, "2:08 PM", { toast: done ? toast("success", "OH-0731 connected", "First jobs flow on the next 5-minute cycle \u00b7 no deployment") : "" });
  }

  function security() {
    const S = D.security;
    const body = `
      ${pageHead("#032D60", secSvg, "Trust", "Security & compliance")}
      ${card("Certifications", `<div class="certs">${S.certs.map((c) => `<span class="cert">${c}</span>`).join("")}</div><p class="lx-note">Supports customer compliance with ${S.supports.join(" and ")}.</p>`, { icon: "#032D60" })}
      ${card("Platform controls", `<ul class="ticks">${S.controls.map((c) => `<li>${c}</li>`).join("")}</ul><p class="lx-note">Source: MuleSoft Trust Center, Anypoint Security and the MuleSoft security capabilities overview.</p>`, { icon: "#032D60" })}`;
    return admin("platform", "Security", body, "2:40 PM");
  }

  function compare() {
    const body = `
      ${pageHead("var(--sf)", bldgSvg, "Operating model", "Keeping it running doesn't depend on one person")}
      <div class="lx-2col">
        ${card("Today", `<ul class="lx-ul"><li>Hand-coded point-to-point Dash feed</li><li>Built in about a week</li><li>Syncs every couple of hours</li><li>Under 2 hrs / week upkeep</li></ul><p class="lx-note">It works, for one feed.</p>`)}
        ${card("Stage 1 and beyond", `<ul class="lx-ul"><li>5 sources, 430 \u2192 900 locations</li><li>5-minute lane for 30-minute SLAs</li><li>Monitoring, alerts and catch-up</li><li>Every API documented in Exchange</li></ul><p class="lx-note">PuroClean's IT team stays in charge of the design. Running it doesn't depend on any one person.</p>`, { cls: "accent" })}
      </div>`;
    return admin("platform", "Home", body, "2:45 PM");
  }

  function whatsNext() {
    return `<div class="roadmap-card">
      <div class="rm-h">Stage roadmap</div>
      <div class="rm-stages">
        <div class="rm-s on"><div class="rm-n">Stage 1</div><div class="rm-t">Visibility &amp; adoption</div><div class="rm-d">Every job, one record, Tableau. This project.</div></div>
        <div class="rm-s"><div class="rm-n">Stage 2</div><div class="rm-t">Compliance</div><div class="rm-d">Jobs moving on time. Nothing stuck in limbo.</div></div>
        <div class="rm-s"><div class="rm-n">Stage 3</div><div class="rm-t">Profitability</div><div class="rm-d">QuickBooks Online. Margin by job and franchise.</div></div>
      </div>
      <div class="rm-extras">
        <div class="rm-ex"><div class="rm-et">Weather overlays</div><small>Storm and hail layers on job volume</small></div>
        <div class="rm-ex"><div class="rm-et">AI agents</div><small>Proactive customer outreach</small></div>
        <div class="rm-ex"><div class="rm-et">Unified view</div><small>Franchise and customer, one screen</small></div>
      </div>
      <blockquote class="rm-q">&ldquo;Dashboards first with an AI proactive mindset.&rdquo;<span>CJ, Sep 28</span></blockquote>
      <p class="rm-note">Roadmap only &middot; not part of Stage 1.</p>
    </div>`;
  }

  /* ------------------------------------------------------------ Tableau Mobile */
  function tableauMobile() {
    return phone(
      "rdPhone",
      `<div class="m-app">
        <div class="m-head"><i>${SVG.back}</i><b>${TLOGO} Tableau Mobile</b><i>${SVG.gear}</i></div>
        <div class="m-body tm">
          <div class="tm-banner">Network Operations · West Region</div>
          <div class="tm-job">
            <div class="tm-row"><span>Job</span><b>JOB-CA-11902</b></div>
            <div class="tm-row"><span>Franchise</span><b>PuroClean Sacramento North</b></div>
            <div class="tm-row"><span>Loss type</span><b>Water</b></div>
            <div class="tm-row sla"><span>Contact SLA</span><b class="err">34 min &nbsp;·&nbsp; MISSED (30 min)</b></div>
            <div class="tm-row"><span>Received/Accepted</span><b>10:28 AM PT</b></div>
            <div class="tm-row"><span>Contacted</span><b class="mut">— (not yet)</b></div>
          </div>
          <div class="tm-ml"><div class="tm-mlh">Milestones</div>
            ${["Date of Loss", "Dispatch", "Received/Accepted", "Contacted"].map((m, i) => {
              const done = i < 3;
              return `<div class="tm-mi ${done ? "done" : "open"}"><i>${done ? SVG.check : ""}</i><span>${m}</span>${done ? "" : "<b class='err'>SLA missed</b>"}</div>`;
            }).join("")}
          </div>
          <div class="tm-foot"><span class="cert">&#9998; Certified data source</span><small>Live via Tableau Bridge</small></div>
        </div></div>`,
      "10:02"
    );
  }

  /* ------------------------------------------------------------ Tableau Pulse metric detail */
  function pulseDetail() {
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
    const contribs = [
      { metro: "Columbus", delta: "+9", note: "seasonal increase" },
      { metro: "Dayton", delta: "+6", note: "OH-0731 connected Tuesday · first 23 jobs" },
      { metro: "Cincinnati", delta: "+2", note: "" },
    ];
    return phone(
      "cjPhone",
      `<div class="m-app">
        ${mHead("Tableau Pulse")}
        <div class="m-body pz">
          <div class="pz-back"><i>${SVG.back}</i><span>Open water jobs · Ohio</span></div>
          <div class="pz-metric-h">
            <div class="pz-mv">61</div>
            <div class="pz-md up">&#9650; 38% vs 4-week avg · unexpected</div>
            <div class="pz-ms">Expected range: 38–52 (based on 12 weeks)</div>
          </div>
          ${chart}
          <div class="pz-sec">Top contributors this week</div>
          ${contribs.map((c) => `<div class="pz-contrib"><div class="pz-ck">${c.metro}</div><div class="pz-cd warn">${c.delta} vs expected</div>${c.note ? `<div class="pz-cn">${c.note}</div>` : ""}</div>`).join("")}
          <div class="pz-follow"><button class="sbtn brand xs">Follow this metric</button></div>
        </div></div>`,
      "7:30"
    );
  }

  /* ------------------------------------------------------------ Anypoint Runtime Manager (step 5.1) */
  function anypointRM(idx, surge) {
    const s = D.scale[idx];
    const reps = surge ? s.surge : s.replicas;
    const autoscaled = surge && s.surge > s.replicas;
    const mqDepth = surge ? 78 : 4 + idx * 3;
    const workers = Array.from({ length: reps }, (_, i) => {
      const extra = i >= s.replicas;
      return `<div class="ap-worker ${extra ? "new" : ""}">
        <div class="ap-wh"><span class="ap-dot ok"></span> Worker ${i + 1}${extra ? " <em>autoscaled</em>" : ""}</div>
        <div class="ap-wm"><span style="width:${30 + Math.round(Math.random() * 8)}%"></span><small>CPU ${31 + i + (surge ? 18 : 0)}%</small></div>
        <div class="ap-wm"><span style="width:${55 + Math.round(Math.random() * 6)}%"></span><small>Mem 412 MB / 512 MB</small></div>
      </div>`;
    }).join("");
    const body = `
      <div class="ap-page-h">
        <div class="ap-ph-l"><i>${SVG.back}</i><div><b>job-sync-papi</b><small>v2.0.4 · CloudHub 2.0 · us-east-1</small></div></div>
        <div class="ap-ph-r"><span class="ap-badge ok">Running</span></div>
      </div>
      <div class="ap-grid">
        <div class="ap-sect">
          <div class="ap-sh">Workers (${reps}${autoscaled ? " · autoscaled" : ""})</div>
          <div class="ap-workers">${workers}</div>
          <div class="ap-as"><span class="ap-ash">Autoscaling</span><span class="ap-ast">Min 2 · Max 4</span><span class="ap-badge ${autoscaled ? "warn" : "ok"}">${autoscaled ? "Scaling out" : "Enabled"}</span></div>
        </div>
        <div class="ap-sect">
          <div class="ap-sh">Anypoint MQ · puroclean-job-updates</div>
          <div class="ap-mq">
            <div><small>Messages in queue</small><b class="${mqDepth > 50 ? "warn" : ""}">${surge ? "2,840" : (mqDepth).toString()}</b></div>
            <div><small>In-flight</small><b>${surge ? "78" : "2"}</b></div>
            <div><small>Throughput</small><b>${surge ? "High · draining" : "Normal"}</b></div>
          </div>
          <div class="ap-mq-bar"><span style="width:${Math.min(100, mqDepth)}%" class="${mqDepth > 50 ? "warn" : ""}"></span></div>
        </div>
      </div>`;
    return lx("Runtime Manager", ["Applications", "Alerts", "Servers"], "Applications", body, { kind: "anypoint", avatar: "PC" });
  }

  function anypointScale(idx, surge) {
    const s = D.scale[idx];
    const ctrl = `<div class="demo-ctrl">
      <div class="dc-label">Demo control · network size</div>
      <div class="sbtn-group wide">${D.scale.map((x, i) => `<button class="${i === idx ? "on" : ""}" data-tap="sc-${i}">${x.label}</button>`).join("")}</div>
      <label class="lx-toggle ${surge ? "on" : ""}" data-tap="surge"><span class="sw"></span> Storm surge (4× volume)</label>
    </div>`;
    return ctrl + frame("it", anypointRM(idx, surge), { clock: "2:05 PM" });
  }

  /* ------------------------------------------------------------ Anypoint Runtime Manager (step 5.2) */
  function anypointOnboard(done) {
    const body = `
      <div class="ap-page-h">
        <div class="ap-ph-l"><i>${SVG.back}</i><div><b>Franchise connections</b><small>Platform account map · config table in 11:11</small></div></div>
        <div class="ap-ph-r">${done ? "" : `<button class="sbtn brand" data-tap="golive">+ Connect franchise</button>`}</div>
      </div>
      ${done ? `<div class="ap-toast ok">${SVG.check} <b>OH-0731 connected</b> · First jobs flow on the next 5-minute cycle · no deployment needed</div>` : ""}
      <div class="ap-sect">
        <div class="ap-sh">Franchise · ${done ? "431" : "430"} connected</div>
        <table class="ap-tbl"><thead><tr><th>Franchise ID</th><th>Name</th><th>Platform</th><th>Account</th><th>Status</th></tr></thead>
        <tbody>
          ${done ? `<tr class="new"><td>OH-0731</td><td>PuroClean Dayton North</td><td>PSA</td><td>PSA-T-55120</td><td><span class="ap-badge ok">Live</span></td></tr>` : ""}
          <tr><td>KS-0412</td><td>PuroClean Wichita East</td><td>Dash</td><td>DASH-M-0412</td><td><span class="ap-badge ok">Live</span></td></tr>
          <tr><td>CA-0219</td><td>PuroClean Sacramento North</td><td>PSA</td><td>PSA-T-22190</td><td><span class="ap-badge ok">Live</span></td></tr>
          <tr class="mut"><td colspan="5">· · · ${done ? "431" : "430"} franchises total</td></tr>
        </tbody></table>
      </div>
      <div class="ap-sect">
        <div class="ap-sh">No deployment required · adding a row triggers the next poll cycle</div>
      </div>`;
    return frame("it", lx("Runtime Manager", ["Applications", "Alerts", "Franchises"], "Franchises", body, { kind: "anypoint", avatar: "PC" }), { clock: "2:08 PM" });
  }

  /* ------------------------------------------------------------ Anypoint Exchange (step 5.3) */
  function anypointExchange(added) {
    const assets = [
      { n: "dash-sapi", t: "REST API", v: "1.4" },
      { n: "psa-sapi", t: "REST API", v: "1.2" },
      { n: "albi-sapi", t: "REST API", v: "1.1" },
      { n: "jobsite-sapi", t: "REST API", v: "1.3" },
      { n: "franconnect-sapi", t: "REST API", v: "2.0" },
      { n: "job-sync-papi", t: "REST API", v: "2.0" },
      { n: "notification-api", t: "REST API", v: "1.0" },
      { n: "puroclean-canonical-job", t: "DataWeave", v: "1.3" },
      { n: "dq-rules-restoration", t: "DataWeave", v: "1.1" },
    ];
    const body = `
      <div class="ap-page-h">
        <div class="ap-ph-l"><div><b>Exchange · PuroClean</b><small>${added ? "10" : "9"} assets · spar-system-api template available</small></div></div>
        <div class="ap-ph-r">${added ? "" : `<button class="sbtn brand" data-tap="add">+ From template</button>`}</div>
      </div>
      ${added ? `<div class="ap-toast ok">${SVG.check} <b>new-sapi deployed to sandbox</b> · canonical model, Process API, quality rules, 11:11 and Tableau: 0 changes</div>` : ""}
      <div class="ex-grid">
        ${added ? `<div class="ex-asset new"><div class="ex-an">new-sapi</div><div class="ex-at">REST API · v1.0 · In test</div><div class="ex-ad">from spar-system-api template · new mapping</div></div>` : ""}
        ${assets.map((a) => `<div class="ex-asset"><div class="ex-an">${a.n}</div><div class="ex-at">${a.t} · v${a.v}</div><div class="ex-ad">spec · owner · runbook</div></div>`).join("")}
      </div>`;
    return frame("it", lx("Exchange", [], "", body, { kind: "anypoint", avatar: "PC" }), { clock: "2:10 PM" });
  }

  /* ------------------------------------------------------------ Anypoint API Manager (step 7.1) */
  function anypointAPIManager() {
    const policies = D.security.policies;
    const body = `
      <div class="ap-page-h">
        <div class="ap-ph-l"><i>${SVG.back}</i><div><b>psa-sapi v2.0</b><small>REST API · Production · all inbound calls</small></div></div>
        <div class="ap-ph-r"><span class="ap-badge ok">Active</span></div>
      </div>
      <div class="ap-sect">
        <div class="ap-sh">Applied policies (${policies.length})</div>
        <div class="ap-policies">
          ${policies.map((p, i) => `<div class="ap-pol">
            <div class="ap-pol-n"><span class="ap-badge ok">${i + 1}</span> <b>${p}</b></div>
            <div class="ap-pol-s">API Manager · enforced at the gateway · no code changes</div>
          </div>`).join("")}
        </div>
      </div>
      <div class="ap-sect">
        <div class="ap-sh">Contracts</div>
        <table class="ap-tbl"><thead><tr><th>Consumer</th><th>Status</th><th>Since</th></tr></thead>
        <tbody>
          <tr><td>psa-webhook-service</td><td><span class="ap-badge ok">Active</span></td><td>Jan 2027</td></tr>
          <tr><td>job-sync-papi (outbound poller)</td><td><span class="ap-badge ok">Active</span></td><td>Jan 2027</td></tr>
        </tbody></table>
      </div>
      <div class="ap-note">Outbound polls: TLS 1.2+ · vendor credentials in Anypoint Secrets Manager · response schema validated per System API.</div>`;
    return frame("it", lx("API Manager", ["APIs", "Contracts", "Alerts"], "APIs", body, { kind: "anypoint", avatar: "PC" }), { clock: "2:40 PM" });
  }

  /* ------------------------------------------------------------ Anypoint Exchange catalog (step 7.2) */
  function anypointExchangeCatalog() {
    const assets = [
      { n: "dash-sapi", t: "REST API", v: "1.4", doc: "spec · account map · runbook RB-DASH-01" },
      { n: "psa-sapi", t: "REST API", v: "1.2", doc: "spec · webhook config · runbook RB-PSA-01" },
      { n: "albi-sapi", t: "REST API", v: "1.1", doc: "spec · OAuth setup · runbook RB-ALBI-01" },
      { n: "jobsite-sapi", t: "REST API", v: "1.3", doc: "spec · cursor pagination · runbook RB-JS-01" },
      { n: "franconnect-sapi", t: "REST API", v: "2.0", doc: "spec · cache config · runbook RB-FC-01" },
      { n: "job-sync-papi", t: "REST API", v: "2.0", doc: "spec · SLA lane · DQ rules · runbook RB-SYNC-01" },
      { n: "notification-api", t: "REST API", v: "1.0", doc: "spec · routing config · runbook RB-NOTIF-01" },
      { n: "puroclean-canonical-job", t: "DataWeave", v: "1.3", doc: "18 PuroLogic Dates · canonical spec · owner" },
      { n: "dq-rules-restoration", t: "DataWeave", v: "1.1", doc: "14 rules · reason codes · quarantine logic" },
    ];
    const body = `
      <div class="ap-page-h">
        <div class="ap-ph-l"><div><b>Exchange · PuroClean organization</b><small>9 assets · all documented · all monitored</small></div></div>
      </div>
      <div class="ap-sect">
        <div class="ap-sh">Assets (9 / 9 documented)</div>
        <table class="ap-tbl wide"><thead><tr><th>Asset</th><th>Type</th><th>Version</th><th>Documentation</th></tr></thead>
        <tbody>${assets.map((a) => `<tr><td class="lnk">${a.n}</td><td class="mut">${a.t}</td><td class="mut">v${a.v}</td><td class="mut">${a.doc}</td></tr>`).join("")}
        </tbody></table>
      </div>
      <div class="ap-sect">
        <div class="ap-sh">Monitoring coverage (5 functional monitors · one per connection)</div>
        <div class="ap-mon-row">${["Dash", "PSA", "Albi", "JobSite", "FranConnect"].map((n) => `<div class="ap-mon ok"><span class="ap-dot ok"></span>${n}<small>every 5 min</small></div>`).join("")}</div>
      </div>`;
    return frame("it", lx("Exchange", ["Browse", "My assets"], "Browse", body, { kind: "anypoint", avatar: "PC" }), { clock: "2:42 PM" });
  }

  /* ------------------------------------------------------------ phone */
  function phone(roleKey, inner, clock) {
    return frame(roleKey, `<div class="ph">${inner}</div>`, { device: "phone", clock });
  }
  const mailApp = `<span class="ml-app">${SVG.mail}</span>`;
  const mHead = (title) => `<div class="m-head"><i>${SVG.back}</i><b>${esc(title)}</b><i>${SVG.bell}</i></div>`;

  function slaAlert(tappable) {
    return phone(
      "rdPhone",
      `<div class="ph-lock"><div class="ph-time">8:02</div><div class="ph-date">Tuesday, February 16</div>
        <div class="notif" ${tappable ? 'data-tap="open"' : ""}>
          <div class="nt-h">${mailApp}<span>MAIL \u00b7 now</span></div>
          <b>SLA alert: JOB-CA-11902</b>
          <p>PuroClean Sacramento North \u00b7 not Contacted 34 min after Received/Accepted (7:28 AM). SLA 30 min <em>(illustrative)</em>. Open in Tableau \u203a</p>
        </div></div>`,
      "8:02"
    );
  }

  function failAlert(open) {
    const O = D.outage;
    return phone(
      "oncall",
      open
        ? `<div class="m-app">${mHead("Alert email")}
            <div class="m-body">
              <div class="m-card err"><span class="lx-badge err">Critical</span><b>psa-sapi \u00b7 polls failing (503)</b><p>Since ${O.start} \u00b7 ${O.franchises} franchises on PSA</p><p>Jobs wait in PSA \u00b7 watermark held at ${O.watermark} \u00b7 <b>0 lost</b></p></div>
              <div class="m-card"><small>Automatic handling</small><div>1. 3 retries, 10 s apart</div><div>2. PSA polls paused (circuit-breaker pattern)</div><div>3. Catch-up from the watermark when PSA recovers</div></div>
              <button class="sbtn brand block" data-tap="trace">View trace</button>
              <a class="m-link">Runbook RB-PSA-01: PSA outage \u203a</a>
            </div></div>`
        : `<div class="ph-lock"><div class="ph-time">2:15</div><div class="ph-date">Tuesday, February 16</div>
            <div class="notif" data-tap="openAlert"><div class="nt-h">${mailApp}<span>MAIL \u00b7 now</span></div>
            <b>Anypoint alert: psa-sapi failing since ${O.start}</b><p>${O.franchises} franchises on PSA. Watermark held at ${O.watermark}, nothing lost. Runbook \u203a</p></div></div>`,
      "2:15"
    );
  }

  /* ------------------------------------------------------------ Tableau Pulse (Tableau Mobile) */
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
          <div class="pz-hi"><b>Good morning, CJ</b><small>Wednesday digest \u00b7 3 metrics you follow</small></div>
          <div class="pz-sum"><div class="pz-sk"><i>\u2726</i> Insights summary</div><p>Open water jobs in Ohio are <b>up 38%</b> against the 4-week average, driven by Columbus and Dayton (Dayton includes a franchise connected Tuesday). Your other metrics are on track.</p></div>
          <div class="pz-card hot">
            <div class="pz-k">Open water jobs <span>Ohio \u00b7 daily</span></div>
            <div class="pz-v">61 <span class="pz-d up">\u25b2 38% vs 4-wk avg</span></div>
            ${chart}
            <div class="pz-ins"><b>Above expected range (38\u201352)</b> Columbus +9 \u00b7 Dayton +6 \u00b7 Cincinnati +2</div>
          </div>
          <div class="pz-card"><div class="pz-k">On-time completion <span>Network</span></div><div class="pz-v sm">82% <span class="pz-d ok">\u25cf On track</span></div>${spark([76, 77, 77, 78, 78, 79, 79, 80, 80, 81, 81, 82, 82], { c: "#0176D3", w: 230, h: 22 })}</div>
          <div class="pz-card"><div class="pz-k">Integrations working <span>MuleSoft</span></div><div class="pz-v sm">5 / 5 <span class="pz-d ok">\u25cf All syncing</span></div></div>
        </div></div>`,
      "7:30"
    );
  }

  /* ------------------------------------------------------------ Tableau Cloud views */
  const OPS_TABS = ["Home", "Explore", "Favorites", "Pulse", "Data Guide"];
  const SHEETS = ["Overview", "Regions", "Jobs", "Benchmarks", "Data Health"];
  const T10 = { Water: "#4e79a7", Fire: "#e15759", Mold: "#59a14f", Biohazard: "#f28e2b" };
  const BLUE = ["#dce9f5", "#b5cfe8", "#87b0d8", "#5a8fc4", "#346fa9", "#1d4c80"];
  const plus = (x, y, l, t, c) => `<rect x="${x - l / 2}" y="${y - t / 2}" width="${l}" height="${t}" fill="${c}"/><rect x="${x - t / 2}" y="${y - l / 2}" width="${t}" height="${l}" fill="${c}"/>`;
  const TLOGO = `<svg class="tv-logo" viewBox="0 0 24 24">${plus(12, 12, 9, 2.2, "#E8762D")}${plus(12, 3.4, 5, 1.5, "#C72037")}${plus(12, 20.6, 5, 1.5, "#5B879B")}${plus(3.4, 12, 5, 1.5, "#1F457E")}${plus(20.6, 12, 5, 1.5, "#EB912B")}${plus(5.8, 5.8, 3.4, 1.1, "#59879B")}${plus(18.2, 5.8, 3.4, 1.1, "#1F457E")}${plus(5.8, 18.2, 3.4, 1.1, "#C72037")}${plus(18.2, 18.2, 3.4, 1.1, "#59879B")}</svg>`;
  const APLOGO = `<svg class="ap-logo-ico" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#FF4040"/><path d="M16 7l7 4.5v9L16 25l-7-4.5v-9z" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/><circle cx="16" cy="16" r="3" fill="#fff"/></svg>`;

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

  /* Tableau filled map: lower-48 state outlines from js/usmap.js, shaded by open jobs. */
  function stateMap(opt = {}) {
    const M = window.US_MAP, max = Math.max(...Object.values(D.openJobs)) + 1;
    const [vx, vy, W, H] = M.vb;
    let tip = "";
    const marks = [], front = [], labels = [];
    Object.entries(M.states).forEach(([st, s]) => {
      const v = D.openJobs[st] || 0;
      const dim = opt.only && !opt.only.includes(st);
      const bi = Math.min(BLUE.length - 1, Math.floor((v / max) * BLUE.length));
      const fill = dim ? "#e6e8eb" : BLUE[bi];
      const txt = bi >= 3 ? "#fff" : "#1d4c80";
      const tap = opt.tap === st;
      const sel = opt.sel === st || tap;
      const fade = opt.sel && opt.sel !== st;
      const [lx, ly, r] = s.l;
      const mark = `<g class="tv-st ${dim ? "base" : ""} ${tap ? "tap" : ""} ${sel ? "sel" : ""} ${fade ? "fade" : ""}" ${tap ? `data-tap="${st}"` : ""}><path d="${s.d}" fill="${fill}"/></g>`;
      (sel ? front : marks).push(mark);
      if (!dim && r >= 14) {
        const two = r >= 24;
        labels.push(`<g class="${fade ? "fade" : ""}"><text x="${lx}" y="${two ? ly - 2 : ly + 7}" fill="${txt}" class="sl">${st}</text>${two ? `<text x="${lx}" y="${ly + 18}" fill="${txt}" class="sv">${v}</text>` : ""}</g>`);
      }
      if (opt.tip === st) {
        const k = st === "KS" ? D.kansas : null;
        const top = k ? `${k.byLoss[0].k} (${k.byLoss[0].v})` : "Water";
        const rows = st === "OH"
          ? [["State", s.n], ["Open jobs", v], ["Open water jobs", "61"], ["Expected", "38\u201352"]]
          : [["State", s.n], ["Open jobs", v], ["Top loss type", top], ["Franchises", st === "KS" ? 6 : "\u2014"]];
        const hint = st === "OH" ? "Click to Explain Data \u203a" : "Click to drill down \u203a";
        tip = `<div class="tv-tip" style="left:${(((lx - vx + r + 14) / W) * 100).toFixed(1)}%;top:${(((ly - vy) / H) * 100).toFixed(1)}%">
          ${rows.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join("")}
          ${tap ? `<em>${hint}</em>` : ""}</div>`;
      }
    });
    const legend = `<div class="tv-legend"><b>Open jobs</b><span>0</span><i style="background:linear-gradient(90deg,${BLUE.join(",")})"></i><span>${max - 1}</span></div>`;
    return `<div class="tv-map"><svg class="tv-usmap" viewBox="${vx} ${vy} ${W} ${H}">${marks.join("")}${front.join("")}<g class="tv-sl">${labels.join("")}</g></svg>${tip}<span class="tv-attr">Lower 48 shown \u00b7 \u00a9 Mapbox \u00a9 OpenStreetMap</span></div>${opt.legend === false ? "" : legend}`;
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
    const ann = (opt.ann || []).map(([i, t]) => `<line x1="${X(i).toFixed(1)}" x2="${X(i).toFixed(1)}" y1="${T - 4}" y2="${H - B}" class="an"/><text x="${(X(i) - 3).toFixed(1)}" y="${T + 4}" text-anchor="end" class="anl">${t}</text>`).join("");
    const ref = opt.ref != null ? `<line x1="${L}" x2="${W - R}" y1="${Y(opt.ref).toFixed(1)}" y2="${Y(opt.ref).toFixed(1)}" class="ref"/><text x="${L + 3}" y="${(Y(opt.ref) - 3).toFixed(1)}" class="refl">${opt.refL || ""}</text>` : "";
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
        <div class="tv-cmp">${TLOGO}<b>${esc(title)}</b><span class="tv-src">Live via Tableau Bridge</span><span class="fresh">\u25cf ${opt.fresh || "SLA data 4 min ago \u00b7 rest as of 2:00 AM"}</span></div>
        <div class="tv-tabs">${SHEETS.map((s) => `<span class="${s === (opt.sheet || "Overview") ? "on" : ""}">${s}</span>`).join("")}</div>
        <div class="tv-dash">
          <div class="tv-top">
            <div class="tv-crumbs">${crumbs.map((c, i) => `<span class="${i === crumbs.length - 1 ? "on" : ""}">${esc(c)}</span>`).join("<i>\u203a</i>")}</div>
            <div class="tv-filters">${filters}</div>
          </div>
          ${opt.viewAs ? `<div class="tv-rls"><b>Row-level security</b> Viewing as ${esc(opt.viewAs)} \u00b7 Region = West from the entitlement table ref.user_region, matched on USERNAME()</div>` : ""}
          ${body}
        </div>
        <div class="tb-bar"><span>\u21b6</span><span>\u21b7</span><span>\u27f2 Revert</span><span>\u21bb Refresh</span><span>\u25f7 Pause</span><span class="r">\u2913 Download</span><span>\u2922 Full screen</span><b>${TLOGO}Tableau</b></div>
      </div>`;
    return frame(opt.role || "cj", lx("Tableau Cloud", OPS_TABS, "Explore", viz, { kind: "tableau", avatar: opt.role === "rd" ? "RD" : "CB" }), { device: "laptop", clock: opt.clock || "2:00 PM" });
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
    const ms = D.milestones.filter((m) => m.value && !["target_start", "target_completion"].includes(m.field)).sort((a, b) => toMin(a.value) - toMin(b.value));
    ms.push(D.milestones.find((m) => m.field === "estimate_approved"));
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
      const tapSt = opt.tapState || (opt.tap ? "KS" : null);
      const right = tapSt === "OH" ? "Click Ohio to explain the jump" : tapSt ? "Click a state to drill down" : "All four SPAR platforms";
      return tabShell("Network Operations", ["All franchises"], `${bans(D.kpis)}
        <div class="tv-g g-map">
          ${sheet("Open jobs by state", stateMap({ tap: tapSt, tip: tapSt }), { right })}
          <div class="tv-col">
            ${sheet("Open jobs by loss type", donut(NET_LOSS, { center: "1,712", sub: "open jobs" }))}
            ${sheet("Open jobs \u00b7 last 13 weeks", area(SERIES["Open jobs"].s, { w: 210, h: 64, min: 1560, max: 1720, ticks: [1600, 1700], xl: [[0, "Nov"], [6, "Jan"], [12, "Feb"]], lastL: "1,712" }))}
          </div>
        </div>`, { clock: opt.clock });
    }
    if (view === "kansas") {
      const metros = [
        { k: "Kansas City", v: 17 },
        { k: "Wichita", v: 14, c: "#346fa9" },
        { k: "Topeka", v: 9 },
        { k: "Other", v: 7 },
      ];
      return tabShell("Network Operations", ["All franchises", "Kansas"], `${bans([
          { k: "Open jobs \u00b7 Kansas", v: "47", d: "+3 vs last week", s: [38, 40, 39, 41, 42, 41, 43, 44, 43, 45, 44, 44, 47] },
          { k: "Water jobs", v: "31", d: "66% of open", s: [22, 23, 23, 24, 25, 24, 26, 27, 27, 28, 29, 30, 31], sc: T10.Water },
          { k: "Estimated value", v: "$338K", d: "+$21K vs last week", s: [290, 295, 298, 301, 300, 306, 311, 315, 314, 322, 316, 317, 338] },
          { k: "Cycle time", v: "9.0 days", d: "\u22120.8 since Nov", s: [9.8, 9.7, 9.7, 9.6, 9.5, 9.5, 9.4, 9.3, 9.3, 9.2, 9.1, 9.1, 9.0], tone: "good" },
        ])}
        <div class="tv-g g-map">
          ${sheet("Open jobs by state", stateMap({ sel: "KS", tip: "KS" }), { right: "Kansas selected" })}
          <div class="tv-col">
            ${sheet(`Kansas \u00b7 open jobs by loss type`, hbars(K.byLoss.map((x) => ({ k: x.k, v: x.v, c: x.c, ico: icon(x.k), tap: opt.tap && (x.k === "Water" || x.k === "Fire") ? "Water" : null }))), { right: opt.tap ? "Select Water + Fire" : "" })}
            ${sheet("By metro area", hbars(metros))}
          </div>
        </div>`, { filters: [["State", "Kansas", true], ["Loss type", "All"], ["Period", "Last 13 weeks"]] });
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
          { k: "Open water + fire jobs", v: String(K.wichita.jobs), d: "+2 vs last week", s: [7, 8, 8, 8, 9, 9, 9, 10, 9, 10, 10, 9, 11] },
          { k: "Estimated value", v: money(K.wichita.est), d: "+$9.6K vs last week", s: [61, 63, 64, 66, 65, 68, 70, 71, 72, 74, 72, 70.8, 80.4] },
          { k: "Franchises", v: "2", d: "Wichita East, West" },
          { k: "Avg job age", v: "2.3 days", d: "\u22120.8 since Nov", tone: "good", s: [3.1, 3.0, 3.0, 2.9, 2.8, 2.8, 2.7, 2.6, 2.6, 2.5, 2.4, 2.4, 2.3] },
        ])}
        ${sheet(`Wichita area \u00b7 open jobs \u00b7 top 5 of ${K.wichita.jobs}`, `<table class="tv-table"><thead><tr><th>Job</th><th>Franchise</th><th>Loss</th><th>Estimate</th><th>Current milestone (of 18)</th></tr></thead><tbody>${rows}</tbody></table>`, { right: opt.tap ? `Click ${D.job.id}` : "Sorted by last update" })}`,
        { sheet: "Jobs", filters: [["State", "Kansas", true], ["Loss type", "Water, Fire", true], ["Metro", "Wichita", true]] });
    }
    if (view === "job") {
      const reached = D.milestones.filter((m) => m.value && !["target_start", "target_completion"].includes(m.field)).length;
      return tabShell("Job detail", ["All franchises", "Kansas", "Wichita area", D.job.id], `${bans([
          { k: "Milestones reached", v: `${reached} / 18`, d: "PuroLogic Dates" },
          { k: "SLA milestones", v: "4 / 4 met", d: "Dispatch \u2192 Inspected (illustrative)", cls: "ok" },
          { k: "Elapsed", v: "5h 28m", d: "loss to estimate sent" },
          { k: "Estimate", v: `$${D.job.estimate.toLocaleString()}`, d: `${D.job.loss}, ${D.job.category}` },
        ])}
        ${sheet(`${D.job.id} \u00b7 ${D.franchise.name} \u00b7 milestone timeline`, jobGantt(), { right: "<i class=\"dot\" style=\"background:#4e79a7\"></i>SLA milestone <i class=\"dot\" style=\"background:#76b7b2\"></i>Other <i class=\"dot sq\"></i>30-min contact window" })}
        <div class="tv-foot">Source: Dash via MuleSoft (dash-sapi \u2192 job-sync-papi) \u00b7 11:11 curated.job_milestone \u00b7 Target Completion Feb 19</div>`,
        { sheet: "Jobs", filters: [["Job", D.job.id, true], ["Franchise", "Wichita East", true]] });
    }
    if (view === "rd" || view === "rd-subscribe" || view === "rd-subscribed") {
      const rows = D.west.map((s) => ({ k: { CA: "California", OR: "Oregon", WA: "Washington", NV: "Nevada" }[s], v: D.openJobs[s], c: "#346fa9" })).sort((a, b) => b.v - a.v);
      const autos = `<div class="tv-dialog tv-autos ${opt.preview ? "pv" : ""}">
        <div class="tv-dh ok">${SVG.check} Automations created</div>
        <div class="ta-item"><span class="ta-ico">${SVG.mail}</span><div><b>Subscription \u00b7 Network Operations (West)</b><small>Weekly \u00b7 Mondays 7:00 AM PT \u00b7 email</small></div><span class="lx-badge ok">Active</span></div>
        <div class="ta-item"><span class="ta-ico">${SVG.bell}</span><div><b>Data-driven alert \u00b7 On-time completion (West)</b><small>When it falls below 80% \u00b7 checked on every data refresh \u00b7 email + Tableau Mobile</small></div><span class="lx-badge ok">Active</span></div>
        ${opt.preview
          ? `<div class="ta-mail"><div class="ta-mh"><span class="ta-from">Tableau Cloud \u00b7 alert email</span><span>preview</span></div>
              <b>Data alert: On-time completion (West) is 79.4%, below 80%</b>
              <div class="ta-mv">${spark([84, 84, 83, 83, 82, 82, 81, 80.5, 79.4], { c: "#e15759", w: 200, h: 26 })}<span>79.4%</span></div>
              <small>Example of what Jordan receives if West slips (today: 84%) \u00b7 opens this view, filtered to West</small>
              <button class="sbtn brand xs">View in Tableau</button></div>`
          : `<div class="tv-dbtns"><button class="sbtn neutral" ${opt.tapPreview ? 'data-tap="preview"' : ""}>Preview alert email</button></div>`}
      </div>`;
      const subscribeDialog = view === "rd-subscribed" ? autos : view === "rd-subscribe" ? `<div class="tv-dialog">
        <div class="tv-dh">Subscribe to this view</div>
        <div class="tv-drow"><label>Frequency</label><select><option>Weekly &#9660;</option></select></div>
        <div class="tv-drow"><label>Day &amp; time</label><select><option>Mondays, 7:00 AM PT &#9660;</option></select></div>
        <div class="tv-drow"><label>Send by</label><div class="sbtn-group"><button class="on">Email</button><button>Tableau Mobile</button></div></div>
        <div class="tv-dalert"><b>Also create a data-driven alert</b><br/><small>On-time completion (West) falls below</small> <span class="tv-thres">80%</span> <small>&#8594; email me</small></div>
        <div class="tv-dbtns"><button class="sbtn neutral">Cancel</button><button class="sbtn brand" ${opt.tapSub ? 'data-tap="subscribe"' : ""}>Subscribe &amp; create alert</button></div>
      </div>` : "";
      return tabShell("Network Operations", ["West Region"], `${bans(D.kpisWest)}
        <div class="tv-g g-map">
          ${sheet("Open jobs by state", stateMap({ only: D.west, legend: false }), { right: "Only West Region rows returned" })}
          <div class="tv-col">
            ${sheet("West Region \u00b7 open jobs by state", hbars(rows))}
            ${sheet("On-time completion \u00b7 13 weeks", area([79, 80, 80, 81, 81, 82, 82, 83, 82, 83, 84, 84, 84], { w: 210, h: 64, min: 76, max: 86, ticks: [78, 84], fmt: (v) => v + "%", ref: 82, refL: "Network 82%", lastL: "84%" }))}
          </div>
        </div>${subscribeDialog}`, { role: "rd", clock: "12:03 PM", viewAs: "Regional Director, West", sheet: "Regions", filters: [["Region", "West", true], ["Loss type", "All"], ["Period", "Last 13 weeks"]] });
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
        ${sheet(`${D.franchise.name} vs network average`, `<div class="bu-lg"><span><i class="bu-sw good"></i>Franchise</span><span><i class="bu-sw ref"></i>Network average</span><span><i class="bu-sw band"></i>0 to network average</span></div>${rows}`, { right: "KPIs from CJ's Data Collection sheet" })}
        <div class="tv-later"><b>Financial benchmarks</b> Revenue, gross margin, labor and material %, growth trend <span>Stage 3, with QuickBooks Online</span></div>`,
        { sheet: "Benchmarks", filters: [["Franchise", D.franchise.name, true], ["Compare to", "Network average", true], ["Period", "Last 13 weeks"]] });
    }
    if (view === "lineage") {
      const guide = `<div class="tv-guide"><div class="tg-h">Data Guide</div>
        <div class="tg-i"><small>Metric</small><b>On-Time Completion % <span class="cert">\u2714 Certified data source</span></b></div>
        <div class="tg-i"><small>Definition <em>(illustrative)</em></small><span>Completed jobs where Majority Completion \u2264 Target Completion, \u00f7 completed jobs</span></div>
        <div class="tg-i"><small>Data source</small><span><code>curated.job_milestone</code> \u00b7 11:11 SQL Server \u00b7 live via Bridge</span></div>
        <div class="tg-i"><small>Upstream (documented)</small><span>MuleSoft job-sync-papi \u00b7 4 SPAR System APIs</span></div>
        <div class="tg-i"><small>Owner</small><span>PuroClean (owner to be agreed)</span></div></div>`;
      return tabShell("Network Operations", ["All franchises"], `${bans(D.kpis, { tapLineage: opt.tap, hl: opt.tap ? null : "On-time completion" })}
        <div class="tv-g g-lin">
          ${sheet("On-time completion \u00b7 last 13 weeks", area(SERIES["On-time completion"].s, { w: 250, h: 112, min: 74, max: 84, ticks: [76, 80, 84], fmt: (v) => v + "%", c: opt.tap ? "#4e79a7" : "#C23934", xl: [[0, "Nov"], [6, "Jan"], [12, "Feb"]], lastL: "82%" }), { right: opt.tap ? "Click the On-time completion tile" : "Traced on the right" })}
          ${guide}
        </div>`);
    }
    if (view === "health" || view === "health-amber" || view === "health-ok") {
      const amber = view === "health-amber";
      const plats = [
        ["Dash", "1 min ago", [42, 45, 44, 47, 46, 48, 50, 49]],
        ["PSA", amber ? "delayed \u00b7 polls paused" : "2 min ago", amber ? [38, 40, 39, 41, 0, 0, 0, 0] : [38, 40, 39, 41, 42, 40, 43, 44]],
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
      const usable = [19, 19, 20, 20, 21, 21, 22, 22, 34, 45, 52, 59, 64];
      const drill = opt.drill === "loss";
      const reasons = [["Missing loss type", 52], ["Dates out of order", 27], ["Unknown account", 14], ["Bad date format", 7]]
        .map(([k, v]) => ({ k, v, l: v + "%", c: "#e15759", tap: opt.tapReason && k === "Missing loss type" ? "reason" : null, fade: drill && k !== "Missing loss type" }));
      const held = [
        ["TX-0233", "Houston NW", "PSA", 12],
        ["KS-0412", "Wichita East", "Dash", 11, true],
        ["FL-0108", "Tampa Bay", "Albi", 9],
        ["OH-0715", "Columbus E.", "JobSite", 8],
      ];
      const heldSheet = sheet("Held \u00b7 missing loss type", `<table class="tv-table tv-held"><thead><tr><th>Franchise</th><th>Platform</th><th>Held</th></tr></thead><tbody>${held
        .map(([id, n, p, v, hl]) => `<tr class="${hl ? "hl" : ""}"><td><b>${id}</b> ${n}</td><td>${p}</td><td class="r">${v}</td></tr>`)
        .join("")}</tbody></table><div class="tv-note">Top 4 of 31 franchises \u00b7 100 records \u00b7 Wichita East includes D-889301 (10:12 AM)</div>`, { right: "Filtered" });
      const trend = sheet("Usable data, % of franchises", area(usable, { w: 230, h: 84, min: 0, max: 100, ticks: [0, 50, 100], fmt: (v) => v + "%", c: "#59a14f", ann: [[8, "Wave 1"], [11, "Wave 2"]], ref: 90, refL: "Goal 90% (illustrative)", lastL: "64%" }));
      return tabShell("Data Health & Integrations", drill ? ["All franchises", "Missing loss type"] : ["All franchises"], `${bans([
          { k: "Franchises with usable data", v: "64%", d: "+45 pts since Nov", tone: "good", s: usable },
          { k: "Integrations working", v: amber ? "4 / 5" : "5 / 5", d: amber ? "PSA delayed \u00b7 catch-up when back" : "all platforms syncing", cls: amber ? "amber" : "ok" },
          { k: "Records held \u00b7 7 days", v: "192", d: "0.4% of updates", tone: "good", s: [0.9, 0.85, 0.8, 0.8, 0.7, 0.66, 0.6, 0.58, 0.55, 0.5, 0.46, 0.42, 0.4] },
          { k: "Duplicates merged \u00b7 7 days", v: "146", d: "never double-counted" },
        ])}
        ${strip}
        <div class="tv-g g-half">
          ${drill ? "" : trend}
          ${sheet("Top reasons records are held", hbars(reasons, { max: 56 }), { right: opt.tapReason ? "Click a reason" : "" })}
          ${drill ? heldSheet : ""}
        </div>`, { sheet: "Data Health", clock: opt.clock || (amber ? "2:14 PM" : "2:13 PM"), fresh: amber ? "PSA delayed since 2:14 PM" : undefined });
    }
    if (view === "agent") {
      const step = opt.step || 0;
      const fields = ["Abc Franchise", "Abc Region", "Abc Loss type", "# Days to contacted", "# Cycle time", "# Estimate"].map((f) => `<div class="we-f">${f}</div>`).join("");
      const shelves = [
        ["Columns", "Avg days to first contact"],
        ["Rows", "Franchise"],
        ["Color", step >= 3 ? "Loss type" : "—"],
        ["Filters", "Region = West, Last month"],
      ];
      const bars = ["CA-0219 Sacramento N.", "CA-0714 Riverside", "CA-0881 Long Beach", "NV-0220 Las Vegas", "OR-0312 Portland", "WA-0115 Seattle"].map((f, i) => {
        const v = [14.2, 12.8, 11.4, 10.9, 9.6, 8.1][i];
        const c = step >= 3 ? ["#4e79a7", "#4e79a7", "#e15759", "#e15759", "#59a14f", "#59a14f"][i] : "#4e79a7";
        return `<div class="we-br"><span class="we-bk">${f}</span><span class="we-bt"><span style="width:${(v / 16) * 100}%;background:${c}"></span></span><b>${v}d</b></div>`;
      }).join("");
      const agentPanel = `<div class="we-agent ${step >= 1 ? "open" : ""}">
        <div class="we-ah">${TLOGO} Tableau Agent <span class="chip-new">Tableau+</span></div>
        ${step === 0 ? `<div class="we-ai"><input placeholder="Ask a question about your data…" data-tap="agent-ask" class="we-inp"/></div>` : ""}
        ${step >= 1 ? `<div class="we-aq">"Which West franchises were slowest to first contact last month?"</div>` : ""}
        ${step === 1 ? `<div class="we-ar">Building your view&hellip; <span class="we-spin"></span></div>` : ""}
        ${step >= 2 ? `<div class="we-ar ok">View built &bull; 14 franchises &bull; Avg days to first contact &bull; Region = West</div>` : ""}
        ${step >= 2 && step < 3 ? `<div class="we-hint">Drag &ldquo;Loss type&rdquo; onto Color to split by loss type <button class="sbtn neutral xs" data-tap="agent-drag">Do it</button></div>` : ""}
        ${step === 3 ? `<div class="we-hint">Loss type added to Color. <button class="sbtn brand xs" data-tap="agent-save">Save view</button></div>` : ""}
        ${step >= 4 ? `<div class="we-ar ok">&#10003; Saved &bull; "West franchise contact speed" &bull; published on certified data source</div>` : ""}
      </div>`;
      const certBadge = `<div class="we-cert">&#10003; Certified data source &bull; curated.job_milestone &bull; RLS applied</div>`;
      const body = `<div class="we-layout">
        <div class="we-left">
          <div class="we-lh">Data</div>
          <div class="we-src">curated.job_milestone <span class="cert">&#10003;</span></div>
          <div class="we-fields">${fields}</div>
        </div>
        <div class="we-main">
          ${certBadge}
          ${agentPanel}
          ${step >= 2 ? `<div class="we-viz">${bars}</div>` : ""}
        </div>
        <div class="we-shelves">
          ${shelves.map(([l, v]) => `<div class="we-sh"><div class="we-shl">${l}</div><div class="we-shv">${v}</div></div>`).join("")}
        </div>
      </div>`;
      const viewTitle = step >= 4 ? "West franchise contact speed (saved)" : "Web authoring · curated.job_milestone";
      return tabShell(viewTitle, ["All franchises", "Web edit"], `<div class="lx-card tv-wrap we-wrap">${body}</div>`, { sheet: "Overview", fresh: "Certified data source · live via Bridge" });
    }

    if (view === "explain-data") {
      const open = !!opt.expand;
      const dayton = open
        ? `<div class="ex-fr">${[["OH-0731 Dayton North", 7, "new"], ["OH-0702 Dayton South", 5], ["OH-0745 Springfield", 3]]
            .map(([f, v, n]) => `<div class="ex-fb ${n ? "new" : ""}"><span>${f}</span><i><s style="width:${(v / 8) * 100}%"></s></i><b>${v}</b>${n ? '<em>connected Tue</em>' : ""}</div>`)
            .join("")}<div class="ex-dd">Without Dayton North, Dayton is in its normal range. The jobs were always there; now corporate sees them.</div></div>`
        : `<div class="ex-dd">OH-0731 (Dayton North) connected Tuesday \u00b7 first 23 jobs now visible</div>${opt.tapDayton ? '<div class="ex-more">See franchises \u203a</div>' : ""}`;
      const explainPane = `<div class="tv-explain ${open ? "open" : ""}"><div class="ex-head">${TLOGO} Explain Data &nbsp; <small>Ohio · open water jobs</small></div>
        <div class="ex-val"><b>61</b><span class="warn">Above expected (38–52)</span></div>
        <div class="ex-sect">Top contributing dimensions</div>
        <div class="ex-dim"><div class="ex-dk">Columbus metro</div><div class="ex-dv warn">+9 above expected</div><div class="ex-dd">Seasonal increase vs prior 12-week average</div></div>
        <div class="ex-dim ${opt.tapDayton ? "tap" : ""} ${open ? "sel" : ""}" ${opt.tapDayton ? 'data-tap="dayton"' : ""}><div class="ex-dk">Dayton metro${open ? " \u00b7 open water jobs by franchise" : ""}</div><div class="ex-dv warn">+6 above expected</div>${dayton}</div>
        <div class="ex-dim"><div class="ex-dk">Cincinnati metro</div><div class="ex-dv">+2</div><div class="ex-dd">Within historical range</div></div>
        <div class="ex-src">Tableau analysis · curated.v_open_jobs · illustrative</div>
      </div>`;
      return tabShell("Network Operations", ["All franchises"], `${bans(D.kpis)}
        <div class="tv-g g-explain">
          ${sheet("Open jobs by state · Ohio selected", stateMap({ sel: "OH" }))}
          ${explainPane}
        </div>`, { sheet: "Overview", clock: opt.clock || "7:33 AM" });
    }

    return "";
  }

  return { frame, jobApp, dashJobs, addPlatform, slaAlert, failAlert, pulse, pulseDetail, tableauMobile, tableau, scale, anypointScale, anypointOnboard, anypointExchange, anypointAPIManager, anypointExchangeCatalog, onboard, security, compare, whatsNext, money, icon };
})();
