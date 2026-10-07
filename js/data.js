/* Single source of demo data. Everything here is fictional or illustrative unless marked confirmed. */
window.PC = (function () {
  const meta = {
    title: "Every franchise job, one trusted record.",
    northStar:
      "One connected view of every franchise, so PuroClean can see, trust, and act on its data \u2014 no matter which tools franchisees use day to day.",
    preparedFor: "Prepared for PuroClean \u00b7 October 12, 2026",
    presenter: "Eric Dalton, Solutions Engineer",
    disclaimer: "Illustrative data and simulated screens. Prepared for PuroClean. Salesforce confidential.",
    stats: [
      { v: "430", l: "franchises" },
      { v: "4", l: "SPAR platforms" },
      { v: "8\u201310", l: "apps to support" },
      { v: "<20%", l: "usable data today" },
      { v: "95%", l: "adoption expected after Jan 1" },
      { v: "2 min vs 2 hrs", l: "CJ vs an RD, today" },
    ],
  };

  const roles = {
    pm: { label: "Project Manager", sub: "PuroClean Wichita East", color: "#C50A1D", device: "tablet" },
    cj: { label: "CJ Bailey", sub: "VP, Software Management", color: "#00346D", device: "laptop" },
    rd: { label: "Regional Director", sub: "West Region \u00b7 CA, OR, WA, NV", color: "#00346D", device: "laptop" },
    rdPhone: { label: "Regional Director", sub: "West Region \u00b7 CA, OR, WA, NV", color: "#00346D", device: "phone" },
    oncall: { label: "Integration owner", sub: "On call", color: "#373536", device: "phone" },
    cjPhone: { label: "CJ Bailey", sub: "VP, Software Management", color: "#00346D", device: "phone" },
    corp: { label: "PuroClean corporate", sub: "Platform administration", color: "#373536", device: "laptop" },
    platform: { label: "Platform review", sub: "PuroClean IT + Salesforce", color: "#373536", device: "laptop" },
    sync: { label: "Dash sync queue", sub: "PuroClean Wichita East \u00b7 multi-location account", color: "#C50A1D", device: "tablet" },
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

  /* PuroLogic Dates tab (confirmed: Corey screenshot, Slack Oct 6). Values illustrative. */
  const milestones = [
    { label: "Date of Loss", field: "date_of_loss", value: "6:12 AM" },
    { label: "Dispatch", field: "dispatch", value: "6:20 AM", sla: true },
    { label: "Received/Accepted", field: "received_accepted", value: "6:24 AM", sla: true },
    { label: "Contacted", field: "contacted", value: "6:41 AM", sla: true },
    { label: "Inspected", field: "inspected", value: "8:05 AM", sla: true },
    { label: "Work Authorization", field: "work_authorization", value: "8:22 AM" },
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
      labels: { started: "First On Site", inspected: "Inspection Date", contacted: "Customer Contacted" },
      fields: {
        date_of_loss: "loss_date", dispatch: "dispatched_at", received_accepted: "accepted_at",
        contacted: "customer_contacted", inspected: "inspection_date", started: "first_on_site",
        target_completion: "est_complete", loss_type: 'loss_type: "H2O"',
      },
      payload: {
        job_no: "D-889214", account: "DASH-M-0412/02", loss_type: "H2O", loss_cat: "2",
        loss_date: "2027-02-16T06:12:00-06:00", dispatched_at: "2027-02-16T06:20:00-06:00",
        accepted_at: "2027-02-16T06:24:00-06:00", first_on_site: "2027-02-16T08:05:00-06:00",
        est_complete: "2027-02-19", addr1: "2417 N Rock Rd", zip: "67226", ins_claim: "CLM-7781-2027",
      },
    },
    psa: {
      name: "PSA",
      endpoint: "GET /api/Jobs/Changes?since={watermark}",
      labels: { started: "Job Start DT", inspected: "Inspected DT", contacted: "Contact DT" },
      fields: {
        date_of_loss: "DateOfLoss", dispatch: "DispatchDT", received_accepted: "ReceivedDT",
        contacted: "ContactDT", inspected: "InspectedDT", started: "JobStartDT",
        target_completion: "TargetCompDT", loss_type: 'LossCategory: "Water"',
      },
      payload: {
        JobNumber: "P-24-55102", LossCategory: "Water", DateOfLoss: "02/16/2027 06:12",
        DispatchDT: "02/16/2027 06:20", ReceivedDT: "02/16/2027 06:24", JobStartDT: "02/16/2027 08:05",
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

  /* Open jobs by state (illustrative). State outlines live in usmap.js. */
  const openJobs = {
    AK:4,ME:6,WI:22,VT:3,NH:5,WA:28,ID:11,MT:7,ND:5,MN:24,IL:58,MI:41,NY:52,MA:26,OR:19,NV:16,WY:4,SD:6,IA:18,
    IN:33,OH:61,PA:49,NJ:31,CT:14,RI:5,CA:74,UT:21,CO:35,NE:15,MO:37,KY:23,WV:9,VA:39,MD:27,DE:6,AZ:38,NM:12,
    KS:47,AR:17,TN:36,NC:44,SC:25,DC:4,OK:29,LA:31,MS:14,AL:26,GA:48,HI:5,TX:96,FL:88,
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
    { k: "Open jobs", v: "1,712", d: "+4.1% wk" },
    { k: "Jobs / month / franchise", v: "11.6", d: "network avg" },
    { k: "Cycle time", v: "9.4 days", d: "\u22120.6 vs Jan" },
    { k: "On-time completion", v: "82%", d: "+3 pts", lineage: true },
    { k: "Backlog", v: "214", d: "jobs > target" },
  ];

  const kpisWest = [
    { k: "Open jobs", v: "137", d: "CA, OR, WA, NV" },
    { k: "Jobs / month / franchise", v: "12.1", d: "region avg" },
    { k: "Cycle time", v: "9.1 days", d: "\u22120.4 vs Jan" },
    { k: "On-time completion", v: "84%", d: "+2 pts" },
    { k: "Backlog", v: "17", d: "jobs > target" },
  ];

  const benchmark = [
    { k: "Jobs / month", fr: 14.2, net: 11.6, fmt: (v) => v.toFixed(1), better: "high" },
    { k: "Cycle time (days)", fr: 8.1, net: 9.4, fmt: (v) => v.toFixed(1), better: "low" },
    { k: "On-time completion", fr: 88, net: 82, fmt: (v) => v + "%", better: "high" },
    { k: "Backlog (jobs)", fr: 3, net: 5, fmt: (v) => String(v), better: "low" },
    { k: "Rework rate", fr: 2.1, net: 3.4, fmt: (v) => v + "%", better: "low" },
    { k: "Cancellation rate", fr: 4.0, net: 4.6, fmt: (v) => v + "%", better: "low" },
  ];

  const scale = [
    { loc: 50, label: "50 \u00b7 today", jobs: 150, events: 2700, peak: 10800, workers: 1, latency: "1m 48s" },
    { loc: 430, label: "430 \u00b7 Jan 1", jobs: 1290, events: 23200, peak: 92900, workers: 2, latency: "2m 05s" },
    { loc: 900, label: "900 \u00b7 growth", jobs: 2700, events: 48600, peak: 194400, workers: 4, latency: "2m 31s" },
  ];

  const outage = { start: "2:14 PM", end: "2:31 PM", franchises: 37, queued: 1284 };

  const security = {
    certs: ["ISO 27001", "SOC 1", "SOC 2", "PCI DSS", "HIPAA", "GDPR"],
    controls: [
      "Independent third-party audits",
      "Encryption in transit and at rest",
      "Regular penetration testing",
      "Detailed audit logs",
      "Hosted on AWS",
      "Public status page and uptime history",
    ],
    policies: ["Client ID Enforcement", "OAuth 2.0 Token Enforcement", "JSON/XML Threat Protection", "Rate Limiting", "Tokenization"],
    mulesoft: ["Platform security", "Patching and updates", "Core infrastructure", "Compliance controls and audits"],
    puroclean: ["Security policies", "User access", "11:11 credentials (Nick)", "Canonical definitions (Nick)"],
  };

  const scope = {
    in: ["Dash", "PSA", "Albi", "JobSite", "FranConnect (franchise master)", "11:11 SQL Server lake", "Tableau dashboards"],
    out: [
      ["Xactimate", "Verisk charges for connections"],
      ["Photos", "Stored for reference only"],
      ["QuickBooks Online", "Stage 3, financials"],
      ["Data Cloud and AI agents", "Phase 2"],
    ],
  };

  return { meta, roles, franchise, job, milestones, vendors, canonical, openJobs, west, kansas, kpis, kpisWest, benchmark, scale, outage, security, scope };
})();
