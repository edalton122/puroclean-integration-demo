/* Right pane: the "backend console". All animation checks Run.alive() so a step change cancels it. */
window.Run = (function () {
  let token = 0;
  class Cancelled extends Error {}
  return {
    Cancelled,
    next() { token += 1; return token; },
    get token() { return token; },
    alive(t) { return t === token; },
    sleep(ms, t) {
      return new Promise((resolve, reject) => {
        setTimeout(() => (t === token ? resolve() : reject(new Cancelled())), ms);
      });
    },
  };
})();

window.Console = (function () {
  const NS = "http://www.w3.org/2000/svg";
  let root, els = {}, clockBase = 0, edgesById = {}, nodesById = {}, nodeSpec = {}, clockPrev = {};
  /* ?fast skips the packet tween for screenshot QA. */
  const FAST = /[?&]fast\b/.test(location.search);
  if (FAST) document.documentElement.classList.add("qa");

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmtClock = (ms) => {
    const d = new Date(ms);
    const p = (n, l = 2) => String(n).padStart(l, "0");
    return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}.${p(d.getUTCMilliseconds(), 3)}`;
  };

  function init(el) {
    root = el;
    root.innerHTML = `
      <div class="cx-head">
        <img src="assets/pc-logo-white.png" alt="PuroClean" class="cx-logo"/>
        <div class="cx-title">What's happening underneath</div>
        <div class="cx-depth" role="group" aria-label="Depth">
          <button data-depth="eng" class="on">Engineer view</button><button data-depth="exec">Exec view</button>
        </div>
      </div>
      <div class="cx-caption" id="cxCaption"></div>
      <div class="cx-narr" id="cxNarr"></div>
      <nav class="cx-tabs">
        ${["flow", "logs", "payload", "lineage", "monitor"].map((t) => `<button data-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}
      </nav>
      <div class="cx-body">
        <section class="cx-pane" data-pane="flow"><div class="cx-flow"></div><div class="cx-extra"></div></section>
        <section class="cx-pane" data-pane="logs"><div class="cx-logs"></div></section>
        <section class="cx-pane" data-pane="payload"><div class="cx-payload"></div></section>
        <section class="cx-pane" data-pane="lineage"><div class="cx-lineage"></div></section>
        <section class="cx-pane" data-pane="monitor"><div class="cx-monitor"></div></section>
      </div>
      <div class="cx-clock"></div>`;
    els = {
      caption: root.querySelector("#cxCaption"),
      narr: root.querySelector("#cxNarr"),
      flow: root.querySelector(".cx-flow"),
      extra: root.querySelector(".cx-extra"),
      logs: root.querySelector(".cx-logs"),
      payload: root.querySelector(".cx-payload"),
      lineage: root.querySelector(".cx-lineage"),
      monitor: root.querySelector(".cx-monitor"),
      clock: root.querySelector(".cx-clock"),
    };
    root.querySelectorAll(".cx-tabs button").forEach((b) => b.addEventListener("click", () => tab(b.dataset.tab)));
    root.querySelectorAll(".cx-depth button").forEach((b) =>
      b.addEventListener("click", () => {
        document.body.classList.toggle("exec", b.dataset.depth === "exec");
        root.querySelectorAll(".cx-depth button").forEach((x) => x.classList.toggle("on", x === b));
      })
    );
  }

  function reset() {
    ["flow", "extra", "logs", "payload", "lineage", "monitor", "clock", "caption", "narr"].forEach((k) => (els[k].innerHTML = ""));
    root.querySelectorAll(".cx-tabs button").forEach((b) => b.classList.remove("has"));
    edgesById = {};
    nodesById = {};
    nodeSpec = {};
    clockPrev = {};
    narrN = 0;
  }

  /* ------------------------------------------------------------ narration: short technical lines, typed out */
  let narrN = 0;
  async function narrate(eng, exec, t) {
    const row = document.createElement("div");
    row.className = "nr" + (exec ? " has-ex" : "");
    narrN += 1;
    row.innerHTML = `<span class="nr-n">${String(narrN).padStart(2, "0")}</span><span class="nr-t"><span class="nr-raw"></span>${exec ? `<span class="nr-ex">${exec}</span>` : ""}</span>`;
    els.narr.querySelectorAll(".nr").forEach((r) => r.classList.add("old"));
    els.narr.appendChild(row);
    while (els.narr.children.length > 3) els.narr.removeChild(els.narr.firstChild);
    const target = row.querySelector(".nr-raw");
    if (FAST || document.body.classList.contains("exec") && exec) { target.textContent = eng; return; }
    for (let i = 0; i <= eng.length; i += 3) {
      target.textContent = eng.slice(0, i);
      await Run.sleep(12, t);
    }
    target.textContent = eng;
  }

  function mark(name) {
    const b = root.querySelector(`.cx-tabs button[data-tab="${name}"]`);
    if (b) b.classList.add("has");
  }

  function tab(name) {
    root.querySelectorAll(".cx-tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === name));
    root.querySelectorAll(".cx-pane").forEach((p) => p.classList.toggle("on", p.dataset.pane === name));
  }

  function caption(text) {
    els.caption.innerHTML = text ? `<span class="cap-dot"></span>${text}` : "";
  }

  /* ------------------------------------------------------------ graph */
  function graph(spec) {
    mark("flow");
    const W = spec.w || 1000, H = spec.h || 450;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.classList.add("cx-graph");
    if (spec.compact) svg.classList.add("compact");
    nodesById = {};
    edgesById = {};
    nodeSpec = {};
    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML = `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5d5a5b"/></marker>`;
    svg.appendChild(defs);
    (spec.groups || []).forEach((g) => {
      const r = document.createElementNS(NS, "rect");
      Object.entries({ x: g.x, y: g.y, width: g.w, height: g.h, rx: 12, class: "cx-group" }).forEach(([k, v]) => r.setAttribute(k, v));
      svg.appendChild(r);
      const t = document.createElementNS(NS, "text");
      t.setAttribute("x", g.x + 12); t.setAttribute("y", g.y + 18); t.setAttribute("class", "cx-group-label");
      t.textContent = g.label;
      svg.appendChild(t);
    });
    const nodeMap = {};
    spec.nodes.forEach((n) => (nodeMap[n.id] = n));
    const edgeLayer = document.createElementNS(NS, "g");
    svg.appendChild(edgeLayer);
    spec.edges.forEach(([a, b, opt = {}]) => {
      const A = nodeMap[a], B = nodeMap[b];
      const x1 = A.x + A.w, y1 = A.y + A.h / 2, x2 = B.x, y2 = B.y + B.h / 2;
      let d;
      if (opt.down) {
        const ax = A.x + A.w / 2, bx = B.x + B.w / 2;
        d = `M${ax},${A.y + A.h} C${ax},${(A.y + A.h + B.y) / 2} ${bx},${(A.y + A.h + B.y) / 2} ${bx},${B.y}`;
      } else if (opt.up) {
        const ax = A.x + A.w / 2, bx = B.x + B.w / 2;
        d = `M${ax},${A.y} C${ax},${(A.y + B.y + B.h) / 2} ${bx},${(A.y + B.y + B.h) / 2} ${bx},${B.y + B.h}`;
      } else {
        const mx = (x1 + x2) / 2;
        d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
      }
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("class", "cx-edge" + (opt.dashed ? " dashed" : ""));
      p.setAttribute("marker-end", "url(#arr)");
      edgeLayer.appendChild(p);
      edgesById[a + ">" + b] = p;
    });
    spec.nodes.forEach((n) => {
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "cx-node " + (n.kind || "") + " " + (n.state || ""));
      g.setAttribute("transform", `translate(${n.x},${n.y})`);
      g.innerHTML = `<rect width="${n.w}" height="${n.h}" rx="10"/>
        <text x="${n.w / 2}" y="${n.h / 2 + (n.sub ? -3 : 5)}" text-anchor="middle" class="nl">${esc(n.label)}</text>
        ${n.sub ? `<text x="${n.w / 2}" y="${n.h / 2 + 13}" text-anchor="middle" class="ns">${esc(n.sub)}</text>` : ""}
        ${n.badge ? `<g class="nb"><rect x="${n.w - 56}" y="-9" width="62" height="18" rx="9"/><text x="${n.w - 25}" y="4" text-anchor="middle">${esc(n.badge)}</text></g>` : ""}`;
      svg.appendChild(g);
      nodesById[n.id] = g;
      nodeSpec[n.id] = n;
    });
    const fx = document.createElementNS(NS, "g");
    fx.setAttribute("class", "cx-fx");
    svg.appendChild(fx);
    els.flow.innerHTML = "";
    els.flow.appendChild(svg);
    if (spec.legend) {
      const lg = document.createElement("div");
      lg.className = "cx-legend";
      lg.innerHTML = spec.legend;
      els.flow.appendChild(lg);
    }
    return svg;
  }

  function node(id, state, badge) {
    const g = nodesById[id];
    if (!g) return;
    g.classList.remove("active", "ok", "err", "warn", "reuse", "new", "dim");
    if (state) state.split(" ").forEach((s) => g.classList.add(s));
    if (badge !== undefined) {
      let nb = g.querySelector(".nb text");
      if (nb) nb.textContent = badge;
    }
  }

  function edge(a, b, state) {
    const p = edgesById[a + ">" + b];
    if (!p) return;
    p.classList.remove("hot", "err", "ok");
    if (state) p.classList.add(state);
  }

  /* opt.quiet: move the dot without touching node/edge state (ambient traffic). Reversed edges are traversed backwards. */
  async function packet(path, t, opt = {}) {
    const svg = els.flow.querySelector("svg");
    if (!svg) return;
    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("r", opt.r || 7);
    dot.setAttribute("class", "cx-packet " + (opt.kind || ""));
    if (!opt.quiet) dot.setAttribute("filter", "url(#glow)");
    dot.setAttribute("cx", -50);
    dot.setAttribute("cy", -50);
    svg.appendChild(dot);
    const q = opt.quiet;
    try {
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i], b = path[i + 1];
        let p = edgesById[a + ">" + b], rev = false;
        if (!p && edgesById[b + ">" + a]) { p = edgesById[b + ">" + a]; rev = true; }
        if (!q) node(a, "active");
        if (!p) continue;
        if (!q) p.classList.add("hot");
        const len = p.getTotalLength();
        const dur = opt.dur || 650;
        const t0 = performance.now();
        if (FAST) await Run.sleep(dur, t);
        else await new Promise((resolve, reject) => {
          const tick = () => {
            if (!Run.alive(t) || !dot.isConnected) return reject(new Run.Cancelled());
            const k = Math.min(1, (performance.now() - t0) / dur);
            const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
            const pt = p.getPointAtLength(len * (rev ? 1 - e : e));
            dot.setAttribute("cx", pt.x);
            dot.setAttribute("cy", pt.y);
            k < 1 ? setTimeout(tick, 16) : resolve();
          };
          tick();
        });
        if (!q) {
          p.classList.remove("hot");
          p.classList.add(opt.edgeState || "ok");
          node(a, opt.trail || "ok");
        }
        if (opt.onHop) await opt.onHop(b, t);
      }
      if (!q) node(path[path.length - 1], opt.finalState || "ok");
    } finally {
      dot.remove();
    }
  }

  /* Several packets down the same path, staggered. Resolves when the last one lands. */
  async function burst(path, t, n = 5, opt = {}) {
    const runs = [];
    for (let i = 0; i < n; i++) {
      runs.push(packet(path, t, { ...opt, r: opt.r || 5, quiet: i < n - 1 ? true : opt.quiet }).catch(() => {}));
      await Run.sleep(opt.gap || 140, t);
    }
    await Promise.all(runs);
    if (!Run.alive(t)) throw new Run.Cancelled();
  }

  /* Background traffic that keeps the graph alive until the step changes or stop() is called. */
  function ambient(t, paths, opt = {}) {
    const h = { on: true, paths, stop() { h.on = false; } };
    (async () => {
      let i = 0;
      try {
        await Run.sleep(opt.delay || 300, t);
        while (h.on && Run.alive(t)) {
          const p = h.paths[i++ % h.paths.length];
          packet(p, t, { quiet: true, kind: opt.kind || "poll", r: opt.r || 3.5, dur: opt.dur || 900 }).catch(() => {});
          await Run.sleep(opt.every || 650, t);
        }
      } catch (e) {}
    })();
    return h;
  }

  /* A label that floats up from a node: response codes, row counts, field renames. */
  function tag(id, text, kind = "", opt = {}) {
    const n = nodeSpec[id];
    const fx = els.flow.querySelector(".cx-fx");
    if (!n || !fx) return;
    const w = Math.max(40, text.length * 6.6 + 16);
    const vb = (els.flow.querySelector("svg")?.getAttribute("viewBox") || "0 0 9999 9999").split(/\s+/).map(Number);
    const x = Math.max(vb[0] + 4, Math.min(vb[0] + vb[2] - w - 4, n.x + n.w / 2 - w / 2 + (opt.dx || 0)));
    const y = Math.max(vb[1] + 2, n.y - 26 + (opt.dy || 0));
    const slot = `${id}:${opt.dy || 0}`;
    fx.querySelectorAll(`g[data-slot="${slot}"]`).forEach((g) => g.remove());
    const outer = document.createElementNS(NS, "g");
    outer.setAttribute("data-slot", slot);
    outer.setAttribute("transform", `translate(${x},${y})`);
    outer.innerHTML = `<g class="cx-tag ${kind} ${opt.stay ? "stay" : ""}"><rect width="${w}" height="20" rx="10"/><text x="${w / 2}" y="14" text-anchor="middle">${esc(text)}</text></g>`;
    fx.appendChild(outer);
    if (!opt.stay) setTimeout(() => outer.remove(), FAST ? 60000 : 2600);
    return outer;
  }

  function ring(id, kind = "") {
    const n = nodeSpec[id];
    const fx = els.flow.querySelector(".cx-fx");
    if (!n || !fx) return;
    const g = document.createElementNS(NS, "g");
    g.setAttribute("transform", `translate(${n.x},${n.y})`);
    g.innerHTML = `<rect class="cx-ring ${kind}" width="${n.w}" height="${n.h}" rx="10"/>`;
    fx.appendChild(g);
    setTimeout(() => g.remove(), 1300);
  }

  /* Live DataWeave view: each source field transforms into its canonical field, one row at a time. */
  async function transform(rows, t, opt = {}) {
    const box = document.createElement("div");
    box.className = "dw";
    box.innerHTML = `<div class="dw-h"><span>DataWeave \u00b7 ${esc(opt.script || "transform")}</span><span class="dw-c">0 / ${rows.length} fields</span></div>
      ${rows.map((r) => `<div class="dw-r"><code class="s">${esc(r[0])}</code><span class="sv">${esc(r[1])}</span><span class="ar">\u2192</span><code class="d">${esc(r[2])}</code><span class="dv">${esc(r[3])}</span></div>`).join("")}`;
    (opt.into || els.extra).appendChild(box);
    const els2 = box.querySelectorAll(".dw-r"), c = box.querySelector(".dw-c");
    for (let i = 0; i < els2.length; i++) {
      els2[i].classList.add("on");
      c.textContent = `${i + 1} / ${rows.length} fields`;
      await Run.sleep(opt.pace || 260, t);
      els2[i].classList.add("done");
    }
    return box;
  }

  function extra(html) {
    els.extra.innerHTML = html || "";
    return els.extra;
  }

  /* ------------------------------------------------------------ logs */
  function setClock(hhmmss) {
    const [h, m, s] = hhmmss.split(":").map(Number);
    clockBase = Date.UTC(2027, 1, 16, h, m, s || 0);
  }

  async function log(entries, t, opt = {}) {
    mark("logs");
    for (const e of entries) {
      if (e.at) setClock(e.at);
      clockBase += e.dt != null ? e.dt : 40 + Math.floor(Math.random() * 140);
      const row = document.createElement("div");
      row.className = `lg ${e.lvl || "info"}` + (e.exec ? "" : " eng-only");
      row.innerHTML = `<span class="lt">${fmtClock(clockBase)}</span><span class="ll">${(e.lvl || "info").toUpperCase()}</span>
        <span class="lm"><span class="raw">${e.raw}</span>${e.exec ? `<span class="ex">${e.exec}</span>` : ""}</span>`;
      els.logs.appendChild(row);
      els.logs.scrollTop = els.logs.scrollHeight;
      if (opt.mirror !== false) mirror(e);
      await Run.sleep(e.wait != null ? e.wait : opt.pace || 230, t);
    }
  }

  /* A compact mirror of the latest log lines under the flow graph, so the flow tab stays alive. */
  function mirror(e) {
    let m = els.flow.querySelector(".cx-mini");
    if (!m) {
      m = document.createElement("div");
      m.className = "cx-mini";
      els.flow.appendChild(m);
    }
    const row = document.createElement("div");
    row.className = `lg ${e.lvl || "info"}` + (e.exec ? "" : " eng-only");
    row.innerHTML = `<span class="lt">${fmtClock(clockBase)}</span><span class="lm"><span class="raw">${e.raw}</span>${e.exec ? `<span class="ex">${e.exec}</span>` : ""}</span>`;
    m.appendChild(row);
    while (m.children.length > 3) m.removeChild(m.firstChild);
  }

  /* ------------------------------------------------------------ payload */
  function json(obj, hl = [], cls = "") {
    const lines = JSON.stringify(obj, null, 2).split("\n").map((ln) => {
      const m = ln.match(/^(\s*)"([^"]+)":\s?(.*)$/);
      if (!m) return `<div class="jl">${esc(ln)}</div>`;
      const [, ind, k, rest] = m;
      const on = hl.includes(k) ? " hl " + cls : "";
      const val = esc(rest).replace(/^(&quot;.*&quot;)(,?)$/, '<span class="js">$1</span>$2').replace(/^(-?\d[\d.]*)(,?)$/, '<span class="jn">$1</span>$2');
      return `<div class="jl${on}">${ind}<span class="jk">"${esc(k)}"</span>: ${val}</div>`;
    });
    return `<pre class="json">${lines.join("")}</pre>`;
  }

  function payload(spec) {
    mark("payload");
    const cols = spec.sources
      ? spec.sources.map((s) => `<div class="pl-col"><div class="pl-h">${s.title}</div>${json(s.obj, s.hl, s.cls)}</div>`).join("")
      : `<div class="pl-col"><div class="pl-h">${spec.left.title}</div>${json(spec.left.obj, spec.left.hl, "src")}</div>`;
    const map = (spec.map || [])
      .map((r) => `<tr><td><code>${esc(r[0])}</code></td><td class="arrow">\u2192</td><td><code class="canon">${esc(r[1])}</code></td><td class="pl-note">${r[2] ? esc(r[2]) : ""}</td></tr>`)
      .join("");
    els.payload.innerHTML = `
      <div class="pl-grid ${spec.sources ? "multi" : ""}">
        <div class="pl-sources">${cols}</div>
        <div class="pl-col canon"><div class="pl-h">${spec.right.title}</div>${json(spec.right.obj, spec.right.hl, "dst")}</div>
      </div>
      ${map ? `<div class="pl-map"><div class="pl-h">${spec.mapTitle || "DataWeave mapping"}</div><table>${map}</table></div>` : ""}`;
  }

  function lineage(html) { mark("lineage"); els.lineage.innerHTML = html; }
  function monitor(html) { mark("monitor"); els.monitor.innerHTML = html; return els.monitor; }

  /* ------------------------------------------------------------ clock strip */
  /* Items with a numeric `n` count up from their previous value; `v` may contain {n} as the placeholder. */
  function clock(items) {
    const fmt = (c, n) => (c.v || "{n}").replace("{n}", c.dec ? n.toFixed(c.dec) : Math.round(n).toLocaleString());
    els.clock.innerHTML = items
      .map((c, i) => `<div class="ck ${c.state || ""}"><div class="ck-l">${c.l}</div><div class="ck-v" data-i="${i}">${c.n != null ? fmt(c, clockPrev[c.l] != null ? clockPrev[c.l] : 0) : c.v}</div>${c.s ? `<div class="ck-s">${c.s}</div>` : ""}</div>`)
      .join("");
    items.forEach((c, i) => {
      if (c.n == null) return;
      const el = els.clock.querySelector(`.ck-v[data-i="${i}"]`);
      const from = clockPrev[c.l] != null ? clockPrev[c.l] : 0, to = c.n;
      clockPrev[c.l] = to;
      if (FAST || from === to) { el.textContent = fmt(c, to); return; }
      el.parentElement.classList.add("tick");
      const t0 = performance.now(), dur = c.dur || 900;
      const step = () => {
        if (!el.isConnected) return;
        const k = Math.min(1, (performance.now() - t0) / dur);
        el.textContent = fmt(c, from + (to - from) * (1 - Math.pow(1 - k, 3)));
        if (k < 1) setTimeout(step, 30); else el.parentElement.classList.remove("tick");
      };
      step();
    });
  }

  /* ------------------------------------------------------------ shared graph */
  function baseGraph(over = {}) {
    const src = (id, label, y, sub) => ({ id, label, sub, x: 14, y, w: 118, h: 46, kind: "src" });
    const sys = (id, label, y) => ({ id, label, sub: "System API \u00b7 mapping", x: 186, y, w: 150, h: 46, kind: "sys" });
    const nodes = [
      src("dash", "Dash", 30, "SPAR platform"),
      src("psa", "PSA", 96, "SPAR platform"),
      src("albi", "Albi", 162, "SPAR platform"),
      src("jobsite", "JobSite", 228, "SPAR platform"),
      src("fran", "FranConnect", 318, "franchise master"),
      sys("s-dash", "dash-sapi", 30),
      sys("s-psa", "psa-sapi", 96),
      sys("s-albi", "albi-sapi", 162),
      sys("s-jobsite", "jobsite-sapi", 228),
      sys("s-fran", "franconnect-sapi", 318),
      { id: "proc", label: "job-sync-papi", sub: "Process API \u00b7 enrich \u00b7 route", x: 392, y: 126, w: 160, h: 64, kind: "proc" },
      { id: "dq", label: "Data quality", sub: "dedupe \u00b7 rules", x: 598, y: 132, w: 132, h: 52, kind: "proc" },
      { id: "quar", label: "quarantine.job", sub: "held, with reason", x: 598, y: 30, w: 132, h: 46, kind: "store dim" },
      { id: "lake", label: "11:11 SQL Server", sub: "private link \u00b7 curated", x: 780, y: 112, w: 200, h: 92, kind: "store" },
      { id: "tab", label: "Tableau Cloud", sub: "via Bridge \u00b7 RLS", x: 800, y: 268, w: 160, h: 56, kind: "viz" },
      { id: "notify", label: "notification-api", sub: "Experience API \u00b7 alerts", x: 598, y: 268, w: 132, h: 52, kind: "proc dim" },
      { id: "mon", label: "Anypoint Monitoring", sub: "health \u00b7 alerts", x: 392, y: 372, w: 160, h: 48, kind: "ops" },
    ];
    const edges = [
      ["dash", "s-dash"], ["psa", "s-psa"], ["albi", "s-albi"], ["jobsite", "s-jobsite"], ["fran", "s-fran"],
      ["s-dash", "proc"], ["s-psa", "proc"], ["s-albi", "proc"], ["s-jobsite", "proc"], ["s-fran", "proc"],
      ["proc", "dq"], ["dq", "lake"], ["dq", "quar", { up: true }], ["lake", "tab", { down: true }], ["proc", "notify", { dashed: true }],
    ];
    return {
      w: 1000, h: 440,
      groups: [
        { label: "SPAR platforms", x: 4, y: 6, w: 138, h: 380 },
        { label: "MuleSoft Anypoint", x: 172, y: 6, w: 572, h: 424 },
        { label: "PuroClean data lake + analytics", x: 766, y: 6, w: 226, h: 340 },
      ],
      nodes: nodes.concat(over.addNodes || []),
      edges: edges.concat(over.addEdges || []),
      legend: over.legend,
    };
  }

  return { init, reset, tab, caption, narrate, graph, node, edge, packet, burst, ambient, tag, ring, transform, extra, setClock, log, payload, json, lineage, monitor, clock, baseGraph, esc };
})();
