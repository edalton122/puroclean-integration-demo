/* Presenter notes. Loaded ONLY by internal.html — never by index.html.
   Keyed by step ID. Chapter question appears automatically in the talk bar.
   Handoff lines help you segue into the next beat. */
window.NOTES = {
  hero: "Welcome. This is a 13-stop short path or a full 30-minute run. Pick Short path to start — you can switch any time. Four people in the story: Alex the PM, Jordan the RD, CJ Bailey and Nick's IT team.",
  today: "The framing slide: why five connections don't mean five projects. Great to run before Chapter 1 if you have time.",

  "1.1": "The franchise's day doesn't change. Alex logs the job in Dash exactly as today. MuleSoft will pick it up on its own on the next five-minute cycle. Nothing to install, nothing to change.",
  "1.2": "The Dash System API did two things: translated the field names and normalized the timezone. DataWeave ran in about 30 milliseconds. The franchise never sees any of this.",
  "1.3": "The job is in 11:11 within the same five-minute cycle — 41 seconds after MuleSoft picked it up, 1 minute 41 seconds after the franchise accepted. The SLA clock is running.",
  "1.4": "Only the four SLA milestones ride the fast lane — contacted, inspected, dispatch, received. Everything else syncs at 2 AM. Fast where it matters, cheap everywhere else.",
  "1.5": "Same job, four platforms. PSA calls it 'First On Site', Albi calls it 'Arrive On Site'. All four map to 'Started' in the PuroLogic Dates. One mapping per platform, built once, reused forever. Meanwhile, it's now 8:05 AM.",

  "2.1": "The RD is on Pacific time — it's 8:02 AM in California. The alert arrived in under half a second. Jordan taps it and lands on the exact job in Tableau Mobile with row-level security already filtering to West Region only.",

  "3.1": "Duplicates from multi-location accounts are a real problem today. MuleSoft catches them automatically with a dedupe key on address, date of loss and claim number. Bad records are held with a reason code — never silently thrown away.",
  "3.2": "CJ's data health dashboard. Usable data started below 20 percent in November — it's at 64 percent now. The 'Integrations working' KPI is CJ's own addition to the Data Collection sheet. Pause here if Nick wants to see the held-record drill-down.",

  "4.1": "Network to one job in three clicks. Every click is a live query to 11:11 through Tableau Bridge — the SLA milestones are minutes old. This is the view that doesn't exist today.",
  "4.2": "Same dashboard. Jordan signs in as the West RD and only sees West Region rows. One dashboard, zero copies. The RD can also subscribe for a weekly digest and set a data-driven alert if on-time completion drops below 80 percent.",
  "4.3": "Wichita East versus the network on CJ's six KPIs from the Data Collection sheet. The network average only counts franchises with usable data.",
  "4.4": "CJ asks where the on-time completion number comes from. The Catalog lineage traces it back through Tableau, through MuleSoft, to the exact field name in PSA. When someone asks 'is this number right?' there's a precise answer.",
  "4.5": "CJ asks Tableau Agent a question in plain English. No IT ticket, no new pipeline, no extract. The certified data source means her view is already filtered to West Region via RLS. This is a Tableau+ feature — worth flagging if they ask about licensing.",

  "5.1": "The slider shows how the design scales. At 50 locations: two replicas. At 900: same two replicas. Storm surge: Anypoint MQ absorbs the burst while CloudHub 2.0 autoscales to four replicas. Nothing is dropped.",
  "5.2": "Connecting a franchise is adding one row to a config table. No deployment, no code change. Dayton North's first 23 jobs started flowing on the next five-minute cycle. This is how you go from 50 to 900 without a bigger team.",
  "5.3": "Adding a fifth SPAR platform is one new System API from an Exchange template. The canonical model, the Process API, the quality rules, 11:11 and Tableau are all reused as-is. Downstream: zero changes. Retimed to 2:10 PM.",

  "6.1": "PSA went down at 2:14 PM. MuleSoft retried three times, then paused PSA polling and held the watermark. The jobs wait safely in PSA. CJ's 'Integrations working' tile goes amber — she knows before anyone reports it.",
  "6.2": "The on-call owner gets an email with the franchise count, the watermark and a runbook link. The trace shows every hop. At 2:31 PM PSA recovers, and MuleSoft catches up all 21 changes in order. Zero lost, zero duplicated.",

  "7.1": "Every inbound call passes four API Manager policies: Client ID, OAuth 2.0, JSON Threat Protection and Rate Limiting. The malformed payload example shows how it's blocked at the gateway — PSA-sapi never sees it. No code changes required.",
  "7.2": "Nine assets in Exchange, all documented with spec, owner and runbook. Five functional monitors, one per connection. The knowledge stays with PuroClean, not with any one person.",

  "8.1": "The dashboard came to CJ. She didn't log in. Pulse watched the metrics she follows, detected an unexpected value in Ohio, and sent her a digest at 7:30 AM. She follows the insight to the metric detail page.",
  "8.2": "CJ goes from Pulse into the dashboard and right-clicks Ohio. Explain Data traces the spike back: Columbus is seasonal, but Dayton is the Dayton North franchise that connected on Tuesday. Data working as designed.",
  "8.3": "Stage roadmap. This is where the trusted foundation takes you — weather overlays, AI agents, unified customer view. None of this is Stage 1. But it's what Stage 1 makes possible.",

  arch: "The full architecture on one page. Everything that appeared in the demo is here.",
  close: "Eight questions, eight answers. The next steps are the same five we've discussed: confirm the SLA milestones, agree the canonical model owner, design the 11:11 connection with Nick, introduce the partners, and agree the mutual plan.",
};
