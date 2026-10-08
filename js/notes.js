/* Presenter notes. Loaded ONLY by internal.html — never by index.html.
   Keyed by step ID. Chapter question appears automatically in the talk bar.
   Handoff lines help you segue into the next beat. */
window.NOTES = {
  hero: "Welcome. This is a 13-stop short path or a full 30-minute run. Pick Short path to start — you can switch any time. Four people in the story: Alex the PM, Jordan the RD, CJ Bailey and Nick's IT team.",
  today: "The framing slide: why five connections don't mean five projects. Great to run before Chapter 1 if you have time.",

  "1.1": "Clicks: Water, Save, Accept job. The franchise's day doesn't change. Alex logs the job in Dash exactly as today; Dash stores Water as its own code. MuleSoft will pick it up on its own on the next five-minute cycle. Nothing to install, nothing to change.",
  "1.2": "Clicks: Loss type, Received/Accepted, Franchise. Each click shows one translation: Dash's H2O becomes Water, three local times become UTC PuroLogic Dates, and the Dash account number becomes PuroClean Wichita East with its region from FranConnect. The franchise never sees any of this.",
  "1.3": "Clicks: Address, Received/Accepted, Contacted. Address is part of the dedupe key, so the quality check runs; the dates land in 11:11 with a MERGE; Contacted is the next step, and its 30-minute clock is now running on the corporate side. 41 seconds after MuleSoft picked it up.",
  "1.4": "Clicks: Email, Initial contact template, Send. The PM never types a time: logging the email sets Contacted, and that's the change MuleSoft picks up. Only the four SLA milestones ride the fast lane — contacted, inspected, dispatch, received. Everything else syncs at 2 AM. Fast where it matters, cheap everywhere else.",
  "1.5": "Clicks: PSA, Albi, JobSite. Same job, four platforms. PSA calls it 'First On Site', Albi calls it 'Arrive On Site'. All four map to 'Started' in the PuroLogic Dates. One mapping per platform, built once, reused forever. Meanwhile, it's now 8:05 AM.",

  "2.1": "Clicks: the alert, Acknowledge, Call franchise. The RD is on Pacific time — it's 8:02 AM in California. The alert arrived in under half a second. Acknowledging stops the escalation; after the call the franchise contacts the customer, and the next PSA poll closes the SLA and resolves the alert on its own.",

  "3.1": "Clicks: Save, Save, Save. Three saves in Dash from a multi-location account: a duplicate, a job with no loss type, and a clean inspection update. The 10:15 poll merges the duplicate, holds the incomplete one with a reason code, and loads the clean one. Nothing is silently thrown away.",
  "3.2": "Clicks: Missing loss type, Wichita East, Share. Usable data started below 20 percent in November — it's at 64 percent now. CJ drills to Wichita East's held records, including the job from 3.1, and shares the filtered view with the Central RD.",

  "4.1": "Clicks: Kansas, Water + Fire, the job. Network to one job in three clicks. Every click is a live query to 11:11 through Tableau Bridge — the SLA milestones are minutes old. This is the view that doesn't exist today.",
  "4.2": "Clicks: Subscribe, Subscribe & create alert, Preview alert email. Jordan signs in as the West RD and only sees West Region rows. One dashboard, zero copies. Two automations: a weekly digest and a data-driven alert if on-time completion drops below 80 percent.",
  "4.3": "Clicks: Cycle time, Who's in the average?, Compare to Central. Wichita East ranks 38th of 412 on cycle time. The average only counts franchises with usable data — 18 are left out until they pass the quality rules.",
  "4.4": "Clicks: the On-time completion tile, Upstream table, Downstream. The lineage traces the number back through Tableau and MuleSoft to the exact PSA field, then forward to every workbook and Pulse metric that uses it.",
  "4.5": "Clicks: ask, drag Loss type, Save. CJ asks Tableau Agent a question in plain English. No IT ticket, no new pipeline, no extract. The certified data source means his view is already filtered to West Region via RLS. Tableau Agent is part of Tableau+.",

  "5.1": "Clicks: 430, 900, Storm surge. At 50 locations: two replicas. At 900: same two replicas. Storm surge: Anypoint MQ absorbs the burst while CloudHub 2.0 autoscales to four replicas. Nothing is dropped.",
  "5.2": "Clicks: Connect franchise, Dayton North, Connect. FranConnect already knows the franchise; MuleSoft checks the PSA account; Connect adds one row to a config table. No deployment, no code. Dayton North's first 23 jobs flow on the next five-minute cycle.",
  "5.3": "Clicks: the template, Create from template, Deploy to sandbox. A fifth SPAR platform is one new System API from an Exchange template. The canonical model, Process API, quality rules, 11:11 and Tableau are reused as-is. Downstream: zero changes.",

  "6.1": "Clicks: the amber tile, PSA, View franchises. PSA went down at 2:14 PM. MuleSoft retried three times, paused PSA polling and held the watermark. CJ sees the status MuleSoft writes, the probe running every minute, and exactly which franchises are affected.",
  "6.2": "Clicks: the alert, Acknowledge, View trace. The on-call owner gets an email with the franchise count, the watermark and a runbook link. The trace shows every hop. At 2:31 PM PSA recovers, and MuleSoft catches up all 21 changes in order. Zero lost, zero duplicated.",

  "7.1": "Clicks: Send valid request, JSON Threat Protection, Send malformed payload. Every inbound call passes four API Manager policies. The limits are configuration, not code, and the malformed payload is blocked at the gateway — psa-sapi never sees it.",
  "7.2": "Clicks: psa-sapi, the runbook, the PSA monitor. Every asset has an owner, a spec and a runbook — the same runbook the 2:15 PM alert linked to. Five functional monitors, one per connection. The knowledge stays with PuroClean, not with any one person.",

  "8.1": "Clicks: the Ohio card, Dayton, Open in Tableau. The dashboard came to CJ. Pulse detected an unexpected value in Ohio and sent a digest at 7:30 AM. Dayton's jump is mostly the franchise connected on Tuesday.",
  "8.2": "Clicks: Ohio, Dayton, Dayton North. Explain Data traces the spike: Columbus is seasonal, Dayton is the franchise that connected Tuesday, and its data shows jobs from before Tuesday that corporate couldn't see until then. Data working as designed.",
  "8.3": "Clicks: Stage 1, Stage 2, Stage 3. Stage 1 builds the foundation, Stage 2 reuses it for compliance, Stage 3 adds one QuickBooks Online connector. Weather overlays, AI agents and a unified customer view come after. None of this is Stage 1, but Stage 1 makes it possible.",

  arch: "The full architecture on one page. Everything that appeared in the demo is here.",
  close: "Eight questions, eight answers. The next steps are the same five we've discussed: confirm the SLA milestones, agree the canonical model owner, design the 11:11 connection with Nick, introduce the partners, and agree the mutual plan.",
};
