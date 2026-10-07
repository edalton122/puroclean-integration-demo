/* Single source of demo data. Everything here is fictional or illustrative unless marked confirmed. */
window.PC = (function () {
  const meta = {
    title: "Every franchise job, one trusted record.",
    northStar:
      "One connected view of every franchise, so PuroClean can see, trust, and act on its data \u2014 no matter which approved platform franchisees use day to day.",
    preparedFor: "Prepared for PuroClean \u00b7 October 12, 2026",
    presenter: "Eric Dalton, Solutions Engineer",
    disclaimer: "Product screens shown with PuroClean sample data; vendor apps simulated. Prepared for PuroClean. Salesforce confidential.",
    stats: [
      { v: "430", l: "franchises" },
      { v: "4", l: "SPAR platforms" },
      { v: "8\u201310", l: "apps to support" },
      { v: "<20%", l: "usable data today" },
      { v: "95%", l: "on an approved platform by Jan 1" },
      { v: "2 min vs 2 hrs", l: "SLA report today: CJ vs an RD" },
    ],
  };

  const roles = {
    pm: { label: "Project Manager", sub: "PuroClean Wichita East", color: "#C50A1D", device: "tablet" },
    cj: { label: "CJ Bailey", sub: "VP, Software Management", color: "#00346D", device: "laptop" },
    rd: { label: "Regional Director", sub: "West Region \u00b7 CA, OR, WA, NV", color: "#00346D", device: "laptop" },
    rdPhone: { label: "Regional Director", sub: "West Region \u00b7 CA, OR, WA, NV", color: "#00346D", device: "phone" },
    oncall: { label: "Integration on-call", sub: "PuroClean IT or partner managed service (TBD)", color: "#373536", device: "phone" },
    cjPhone: { label: "CJ Bailey", sub: "VP, Software Management", color: "#00346D", device: "phone" },
    corp: { label: "PuroClean corporate", sub: "Integration administration (illustrative)", color: "#373536", device: "laptop" },
    platform: { label: "Platform review", sub: "PuroClean IT + Salesforce", color: "#373536", device: "laptop" },
    sync: { label: "Project Manager", sub: "PuroClean Wichita East \u00b7 Derby office", color: "#C50A1D", device: "tablet" },
  };

  const franchise = {
    id: "KS-0412",
    name: "PuroClean Wichita East",
    city: "Wichita",
    state: "KS",
    region: "Central Region",
    platform: "Dash",
    parent: "DASH-M-0412 (multi-location master)",
  };

  const job = {
    id: "JOB-KS-24817",
    sourceId: "D-889214",
    type: "Residential",
    loss: "Water",
    category: "Category 2 \u00b7 supply line",
    address: "2417 N Rock Rd, Wichita, KS 67226",
    carrier: "National carrier",
    claim: "CLM-7781-2027",
    estimate: 8450,
    day: "Tue, Feb 16, 2027",
  };

  /* The 18 PuroLogic Dates, in PuroClean's order. Times are illustrative. */
  const milestones = [
    { label: "Date of Loss", field: "date_of_loss", value: "6:12 AM" },
    { label: "Dispatch", field: "dispatch", value: "6:20 AM", sla: true },
    { label: "Received/Accepted", field: "received_accepted", value: "6:24 AM", sla: true },
    { label: "Contacted", field: "contacted", value: "6:41 AM", sla: true },
    { label: "Inspected", field: "inspected", value: "7:52 AM", sla: true },
    { label: "Work Authorization", field: "work_authorization", value: "8:01 AM" },
    { label: "Estimate Sent", field: "estimate_sent", value: "11:40 AM" },
    { label: "Estimate Approved", field: "estimate_approved", value: "" },
    { label: "Inventoried", field: "inventoried", value: "" },
    { label: "Target Start", field: "target_start", value: "Feb 16" },
    { label: "Into Production", field: "into_production", value: "" },
    { label: "Started", field: "started", value: "8:05 AM" },
    { label: "Majority Completion", field: "majority_completion", value: "" },
    { label: "Target Completion", field: "target_completion", value: "Feb 19" },
    { label: "COS", field: "cos", value: "" },
    { label: "Invoiced", field: "invoiced", value: "" },
    { label: "Paid", field: "paid", value: "" },
    { label: "Closed", field: "closed", value: "" },
  ];

  /* Illustrative vendor field names: not taken from vendor API docs. */
  const vendors = {
    dash: {
      name: "Dash",
      endpoint: "GET /v2/jobs?updated_since={watermark}",
      labels: {},
      fields: {
        date_of_loss: "loss_date", dispatch: "dispatched_at", received_accepted: "accepted_at",
        contacted: "customer_contacted", inspected: "inspection_date", started: "job_started",
        target_completion: "est_complete", loss_type: 'loss_type: "H2O"',
      },
      payload: {
        job_no: "D-889214", account: "DASH-M-0412/02", loss_type: "H2O", loss_cat: "2",
        loss_date: "2027-02-16T06:12:00-06:00", dispatched_at: "2027-02-16T06:20:00-06:00",
        accepted_at: "2027-02-16T06:24:00-06:00", job_started: "2027-02-16T08:05:00-06:00",
        est_complete: "2027-02-19", addr1: "2417 N Rock Rd", zip: "67226", ins_claim: "CLM-7781-2027",
      },
    },
    psa: {
      name: "PSA",
      endpoint: "GET /api/Jobs/Changes?since={watermark}",
      labels: { started: "First On Site", inspected: "Inspected DT", contacted: "Contact DT" },
      fields: {
        date_of_loss: "DateOfLoss", dispatch: "DispatchDT", received_accepted: "ReceivedDT",
        contacted: "ContactDT", inspected: "InspectedDT", started: "FirstOnSiteDT",
        target_completion: "TargetCompDT", loss_type: 'LossCategory: "Water"',
      },
      payload: {
        JobNumber: "P-24-55102", LossCategory: "Water", DateOfLoss: "02/16/2027 06:12",
        DispatchDT: "02/16/2027 06:20", ReceivedDT: "02/16/2027 06:24", FirstOnSiteDT: "02/16/2027 08:05",
        TargetCompDT: "02/19/2027", Address: { Line1: "2417 N Rock Rd", Zip: "67226" },
      },
    },
    albi: {
      name: "Albi",
      endpoint: "GET /projects?modifiedAfter={watermark}",
      labels: { started: "Arrive On Site", inspected: "Inspection At", contacted: "First Contact At" },
      fields: {
        date_of_loss: "lossDate", dispatch: "dispatchTime", received_accepted: "jobAcceptedAt",
        contacted: "firstContactAt", inspected: "inspectionAt", started: "arriveOnSite",
        target_completion: "targetCompletion", loss_type: 'lossType: "WTR"',
      },
      payload: {
        projectId: "ALB-7731", lossType: "WTR", lossDate: 1802779920000, dispatchTime: 1802780400000,
        jobAcceptedAt: 1802780640000, arriveOnSite: 1802786700000, targetCompletion: "2027-02-19",
      },
    },
    jobsite: {
      name: "JobSite",
      endpoint: "GET /jobs/delta?cursor={cursor}",
      labels: { started: "Job Began", inspected: "Inspected", contacted: "Contacted" },
      fields: {
        date_of_loss: "dol", dispatch: "dispatch_ts", received_accepted: "received",
        contacted: "contacted_ts", inspected: "inspected", started: "job_began",
        target_completion: "target_done", loss_type: 'type: "water damage"',
      },
      payload: {
        id: "JS-40918", type: "water damage", dol: "2027-02-16 06:12", dispatch_ts: "2027-02-16 06:20",
        received: "2027-02-16 06:24", job_began: "2027-02-16 08:05", target_done: "2027-02-19",
      },
    },
  };

  const canonical = {
    job_id: "JOB-KS-24817", source_system: "DASH", source_job_id: "D-889214",
    franchise_id: "KS-0412", region: "Central", state: "KS",
    loss_type: "Water", loss_category: 2,
    date_of_loss: "2027-02-16T12:12:00Z", dispatch: "2027-02-16T12:20:00Z",
    received_accepted: "2027-02-16T12:24:00Z", started: "2027-02-16T14:05:00Z",
    target_completion: "2027-02-19", carrier_claim: "CLM-7781-2027",
  };

  /* Open jobs by state (illustrative), summing to the 1,712 network total. State outlines live in usmap.js. */
  const openJobs = {
    AK:4,ME:8,WI:27,VT:4,NH:6,WA:28,ID:14,MT:9,ND:6,MN:30,IL:72,MI:51,NY:65,MA:32,OR:19,NV:16,WY:5,SD:8,IA:22,
    IN:41,OH:96,PA:61,NJ:39,CT:18,RI:6,CA:74,UT:26,CO:44,NE:19,MO:46,KY:29,WV:11,VA:49,MD:34,DE:8,AZ:47,NM:15,
    KS:47,AR:21,TN:45,NC:55,SC:31,DC:5,OK:36,LA:39,MS:17,AL:32,GA:60,HI:5,TX:120,FL:110,
  };
  const west = ["CA", "OR", "WA", "NV"];

  const kansas = {
    open: 47,
    byLoss: [
      { k: "Water", v: 31, c: "#4e79a7" },
      { k: "Fire", v: 9, c: "#e15759" },
      { k: "Mold", v: 5, c: "#59a14f" },
      { k: "Biohazard", v: 2, c: "#f28e2b" },
    ],
    wichita: {
      jobs: 11, est: 80400,
      list: [
        { id: "JOB-KS-24817", fr: "Wichita East", loss: "Water", est: 8450, stage: "Estimate Sent" },
        { id: "JOB-KS-24809", fr: "Wichita East", loss: "Fire", est: 21300, stage: "Into Production" },
        { id: "JOB-KS-24795", fr: "Wichita West", loss: "Water", est: 6100, stage: "Inspected" },
        { id: "JOB-KS-24790", fr: "Wichita West", loss: "Water", est: 4750, stage: "Work Authorization" },
        { id: "JOB-KS-24788", fr: "Wichita East", loss: "Fire", est: 14900, stage: "Estimate Approved" },
      ],
    },
  };

  const kpis = [
    { k: "Open jobs", v: "1,712", d: "+0.6% wk" },
    { k: "Jobs / month / franchise", v: "11.6", d: "network avg" },
    { k: "Cycle time", v: "9.4 days", d: "\u22121.0 since Nov" },
    { k: "On-time completion", v: "82%", d: "+6 pts since Nov", lineage: true },
    { k: "Backlog", v: "214", d: "jobs > target" },
  ];

  const kpisWest = [
    { k: "Open jobs", v: "137", d: "CA, OR, WA, NV" },
    { k: "Jobs / month / franchise", v: "12.1", d: "region avg" },
    { k: "Cycle time", v: "9.1 days", d: "\u22120.4 since Nov" },
    { k: "On-time completion", v: "84%", d: "+2 pts" },
    { k: "Backlog", v: "17", d: "jobs > target" },
  ];

  const benchmark = [
    { k: "Jobs / month", fr: 14.2, net: 11.6, fmt: (v) => v.toFixed(1), better: "high" },
    { k: "Cycle time (days)", fr: 8.1, net: 9.4, fmt: (v) => v.toFixed(1), better: "low" },
    { k: "On-time completion", fr: 88, net: 82, fmt: (v) => v + "%", better: "high" },
    { k: "Backlog (% of open jobs)", fr: 9.1, net: 12.5, fmt: (v) => v.toFixed(1) + "%", better: "low" },
    { k: "Rework rate", fr: 2.1, net: 3.4, fmt: (v) => v + "%", better: "low" },
    { k: "Cancellation rate", fr: 4.0, net: 4.6, fmt: (v) => v + "%", better: "low" },
  ];

  /* Derived from 11.6 jobs per franchise a month and roughly 40 tracked updates per job; a storm surge is 4x. */
  const scale = [
    { loc: 50, label: "50 \u00b7 first connections", jobs: 19, events: 850, peak: 3400, replicas: 2, surge: 2, latency: "avg 2m 40s" },
    { loc: 430, label: "430 \u00b7 full network", jobs: 164, events: 6850, peak: 27400, replicas: 2, surge: 3, latency: "avg 2m 40s" },
    { loc: 900, label: "900 \u00b7 growth", jobs: 343, events: 14300, peak: 57200, replicas: 2, surge: 4, latency: "avg 2m 45s" },
  ];

  const outage = { start: "2:14 PM", end: "2:31 PM", watermark: "2:13 PM", franchises: 37, behind: 21 };

  const security = {
    certs: ["ISO 27001", "SOC 1", "SOC 2", "PCI DSS"],
    supports: ["HIPAA", "GDPR"],
    controls: [
      "Independent third-party audits",
      "Encryption in transit and at rest",
      "Regular penetration testing",
      "Detailed audit logs",
      "Hosted on AWS",
      "Public status page and uptime history",
    ],
    policies: ["Client ID Enforcement", "OAuth 2.0 Token Enforcement", "JSON Threat Protection", "Rate Limiting"],
    mulesoft: ["Platform security", "Patching and updates", "Core infrastructure", "Compliance controls and audits"],
    puroclean: ["Security policies", "User access", "11:11 and vendor credentials", "Canonical definitions (owner to be agreed)"],
  };

  const scope = {
    in: ["Dash", "PSA", "Albi", "JobSite", "FranConnect (franchise master)", "11:11 SQL Server lake", "Tableau dashboards"],
    out: [
      ["Xactimate", "Verisk charges for connections"],
      ["Photos", "Stored for reference only"],
      ["QuickBooks Online", "Stage 3, financials"],
      ["AI agents and a unified customer view", "after Stage 1"],
    ],
  };

  /* Four personas: who is in the room, what they need to hear. */
  const personas = [
    {
      id: "pm",
      name: "Alex",
      role: "Project Manager",
      org: "PuroClean Wichita East",
      question: "Will franchises have to change anything?",
      need: "Keep using Dash exactly as today",
      chapters: ["1"],
      color: "#C50A1D",
      initials: "PM",
    },
    {
      id: "rd",
      name: "Jordan",
      role: "Regional Director",
      org: "West Region · CA, OR, WA, NV",
      question: "Will I know before my customer complains?",
      need: "Live SLA alerts routed by region, in Tableau Mobile",
      chapters: ["2", "4"],
      color: "#00346D",
      initials: "RD",
    },
    {
      id: "cj",
      name: "CJ Bailey",
      role: "VP, Software Management",
      org: "PuroClean Corporate",
      question: "Can I trust the numbers, and see the whole network?",
      need: "Trusted KPIs, network drilldown, self-service analytics",
      chapters: ["3", "4", "5", "8"],
      color: "#00346D",
      initials: "CJ",
    },
    {
      id: "it",
      name: "Nick's IT team",
      role: "PuroClean IT",
      org: "Platform & Security",
      question: "Is it secure and maintainable without a dedicated team?",
      need: "Security policies, runbooks, monitoring, no single point of failure",
      chapters: ["6", "7"],
      color: "#373536",
      initials: "IT",
    },
  ];

  /* Journey stops for the ribbon on the entry page */
  const journeyRibbon = [
    { time: "6:21 AM",  label: "Job in Dash",      chapter: "1", persona: "pm" },
    { time: "6:25 AM",  label: "MuleSoft picks up", chapter: "1", persona: "pm" },
    { time: "10:02 AM", label: "SLA alert",         chapter: "2", persona: "rd" },
    { time: "2:00 PM",  label: "CJ's network view", chapter: "4", persona: "cj" },
    { time: "2:14 PM",  label: "PSA outage",        chapter: "6", persona: "it" },
    { time: "2:31 PM",  label: "Recovered",         chapter: "6", persona: "it" },
    { time: "Wed 7:30 AM", label: "Pulse digest",   chapter: "8", persona: "cj" },
  ];

  return { meta, roles, franchise, job, milestones, vendors, canonical, openJobs, west, kansas, kpis, kpisWest, benchmark, scale, outage, security, scope, personas, journeyRibbon };
})();
