# SAR Copilot — 5-Minute Demo Script

> Screen recording walkthrough. Speak naturally — times are rough guides.

---

## [0:00–0:35] Intro & The Problem

**Screen:** Start on the upload page (empty dashboard).

**Say:**

> "Hey, I'm Shaniya Khan and I worked on this hackathon solving the AI-powered transaction monitoring challenge."
>
> "So the problem is pretty straightforward — financial crime teams at Deriv are drowning in alerts. The rule-based systems flag around 2,000 transactions a week, and 95% of them turn out to be false positives. Analysts spend their entire day clicking through accounts, checking if that $5,000 deposit is suspicious — most aren't. Meanwhile, real fraud slips through the noise."
>
> "Here's the thing that really got me — a client deposits $500, trades for 10 minutes with literally one cent of profit, then withdraws everything. That's not trading, that's laundering. But rules don't catch it because the amounts look normal."
>
> "So I built SAR Copilot — it uses AI to turn those 2,000 alerts into about 50 high-confidence cases, each with a full investigation pack and an auto-generated SAR narrative. Let me walk you through it."

---

## [0:35–1:15] Upload & KPI Overview

**Action:** Click **"Choose File"** → select the demo CSV → upload.

**Say:**

> "So first I upload a transaction dataset — this has real-world-style data with deposits, trades, withdrawals, device IDs, IP addresses, affiliate codes, all of it."
>
> "Behind the scenes, the system is running multiple AI layers — behavioral anomaly detection using Welford's algorithm, network graph analysis with Disjoint Set Union clustering, unsupervised pattern discovery via DBSCAN, and multi-signal risk scoring. All in seconds."

**Screen:** Upload completes. KPI cards appear.

**Hover over each KPI card:**

> *(hover Avg Events/Case)* "So here's our dashboard. Average events per case shows how dense each cluster is."
>
> *(hover Largest Cluster)* "Largest cluster — 47 linked accounts. That's a full fraud ring the system found automatically."
>
> *(hover High Risk 60+)* "High risk cases scoring 60 or above — these are the ones that actually need analyst attention."
>
> *(hover Total Cases)* "And total cases. Instead of 2,000 raw alerts, analysts see this manageable list."

---

## [1:15–1:45] Cases Table

**Screen:** Cases table visible.

**Say:**

> "The Cases tab ranks everything by risk score. Each row has the case ID, score, priority classification, cluster size, network link types, detected typologies, and the top reason it was flagged."

**Hover over a high-score case (100 or 70+):**

> "This one scored 100 out of 100 — maximum risk. You can see the typologies: rapid_in_out, high_withdraw_ratio. Priority column says Coordinated Fraud Ring — that gets the highest investigation SLA."

**Hover over a low-score case:**

> "Compare it to this case down here — low score, no typologies, routine activity. The system is telling the analyst: skip this, focus on what matters."

**Point at Sort by toggle:**

> "They can also sort by priority instead of raw score — priority factors in fraud type and urgency, not just the number."

---

## [1:45–3:10] Case Detail — The Investigation Pack

**Action:** Click into the highest-risk case.

**Say:**

> "Let me click into the top case and show you what the AI actually found."

### Score & Classification [1:45–2:00]

**Screen:** Case detail loads.

**Say:**

> "Right away — score gauge at 100, classified as a Coordinated Fraud Ring with 47 linked accounts. See that red banner at the top? It says withdrawals would be held for review. That's real-time intervention — the system blocks money from leaving before an analyst even looks at it. That's not reactive detection three days later, that's catching it as it happens."

### Risk Signals [2:00–2:15]

**Hover over Risk Signals:**

> "These are all the evidence signals that built up the score. Each one shows what it detected, how many points it contributed, and the severity. Large linked network — 17 points. Rapid deposit-withdrawal cycle — 18 points. High withdrawal ratio — 15 points. Every single point is explainable and traceable — this isn't a black box."

### Financial Summary [2:15–2:25]

**Hover over Financial Summary:**

> "Financial summary — total deposits versus withdrawals. Notice the withdrawals are way higher than deposits with basically zero profit. That's a classic pass-through laundering pattern — money in, money out, nothing in between."

### Cluster Graph [2:25–2:40]

**Action:** Expand the Cluster Graph accordion.

**Say:**

> "This is the network visualization. Each node is an account, edges show connections — shared devices, shared IPs, shared affiliates. This is how the system found all 47 accounts in this ring. No human could manually piece these connections together across thousands of transactions — the graph algorithms do it instantly."

### Timeline [2:40–2:50]

**Action:** Expand Transaction Timeline.

**Say:**

> "The timeline lays out every transaction chronologically — deposits, trades, withdrawals with device IDs and IP addresses. You can see the pattern: deposit, tiny trade, immediate withdrawal. And look — multiple users sharing the same device ID. That's a fraud ring operating from shared infrastructure."

### Investigation Pack [2:50–3:10]

**Action:** Expand Investigation Pack, scroll through sections.

**Say:**

> "The Investigation Pack brings it all together."
>
> *(hover Evidence Signals)* "Evidence signals with severity levels and point values."
>
> *(hover Network Link Evidence)* "The actual device IDs and IPs that connected these accounts."
>
> *(hover Behavioral Anomaly)* "Behavioral anomaly score — how far this activity deviates from the user's baseline, calculated using Welford's online algorithm for streaming statistics."
>
> *(hover Real-time Intervention)* "Intervention recommendation — hold withdrawals."
>
> *(hover Unsupervised Discovery)* "And this — unsupervised discovery. DBSCAN clustering found this is a novel pattern. The system discovered this fraud typology on its own. I didn't program it, I didn't train for it — the AI found it."

---

## [3:10–3:50] SAR Generation

**Action:** Scroll to Case Actions, then click **"Generate SAR Draft"**.

**Say:**

> "Down here are Case Actions — one-click workflows to block accounts, freeze withdrawals, escalate, request enhanced KYC, investigate linked accounts, generate regulatory filings. Everything an analyst needs without switching between five different systems."
>
> "Now let me generate the SAR. This calls OpenAI's GPT-4o-mini with all the case evidence as context."

**Screen:** SAR draft loads.

**Say:**

> "So the AI generated a full Suspicious Activity Report. At the top — document header with risk score and typology tags. Then financial metrics cards — deposits, withdrawals, profit, cluster size at a glance."
>
> *(hover Narrative)* "The narrative is in regulator-ready language — timeframe, amounts, typologies, network links. That AI-Generated badge means the LLM wrote this, not a template. A compliance officer can review and file this directly."
>
> *(hover Next Steps)* "And it gives investigator next steps — verify source of funds, check shared infrastructure, review withdrawal destinations. What normally takes an analyst 45 minutes to draft, the system does in seconds."

---

## [3:50–4:20] Feedback Learning & Metrics

**Action:** Scroll up, click **"True Positive"** button.

**Say:**

> "When the analyst confirms this is a true positive, the system learns from it. I implemented Bayesian precision weighting — signals that led to correct detections get stronger, signals that caused false positives get weaker. So over time, the system gets smarter and false positive rates drop."

**Action:** Go back to Dashboard, switch to **"Metrics"** tab.

**Say:**

> "The Metrics tab tracks system performance — alert reduction ratio, AI learning progress from analyst feedback, fraud pattern distribution showing which typologies appear most, and intervention stats for real-time holds."

---

## [4:20–4:50] Unsupervised Discovery

**Action:** Switch to **"Unsupervised Discovery"** tab.

**Say:**

> "This is the part I'm most proud of. The Unsupervised Discovery tab uses DBSCAN clustering to find entirely new fraud typologies — patterns I didn't program or train for."
>
> *(hover KPI cards)* "It discovered multiple clusters and flagged rare novel patterns plus outliers."
>
> *(expand a cluster)* "Each cluster shows its distinguishing features as z-scores — high z-scores mean this group is statistically different from everything else. The system explains what makes each cluster unique."
>
> *(hover Rare Pattern Alert)* "This rare pattern alert means the system found a fraud typology with very few cases — it's new, it's unusual, and it needs human investigation. This is unsupervised learning discovering fraud that no rule-based system would ever catch."

---

## [4:50–5:00] Closing

**Screen:** Dashboard overview.

**Say:**

> "So to wrap up — SAR Copilot takes raw transaction data and turns 2,000 weekly alerts into 50 high-confidence cases. Each one comes with a full investigation pack — network graph, timeline, evidence signals, behavioral anomaly scores. It catches sophisticated patterns like $0.01 profit laundering that rules miss. It discovers new fraud typologies through unsupervised learning. It blocks suspicious withdrawals in real-time. And it auto-generates regulator-ready SAR narratives in seconds."
>
> "From upload to SAR — all AI-powered, all explainable, all in one system. Thanks for watching."

---

## Quick Reference — Challenge Requirements Covered

| Challenge Requirement | Where I Show It |
|---|---|
| Behavioral anomaly detection | Investigation Pack → Behavioral Anomaly (Welford's algorithm) |
| Network analysis / graph algorithms | Cluster Graph + Network Link Evidence (DSU clustering) |
| Contextual risk scoring | Risk Signals with point breakdown |
| Automated evidence collection | Investigation Pack (all evidence, one click) |
| False positive reduction | Feedback buttons + Metrics tab (Bayesian learning) |
| Real-time intervention | Red banner + would_block flag |
| SAR generation | Generate SAR Draft → LLM narrative |
| Unsupervised learning / new typologies | Unsupervised Discovery tab (DBSCAN) |
| Temporal pattern recognition | Temporal Behavior Change alert |
| Predictive flagging | Priority classification + fraud type SLA |
| Catches $0.01 profit laundering | Typology tags: tiny_profit_cycle, pass_through |
| 2,000 alerts → 50 cases | KPI cards + Metrics alert reduction |
| Explainable decisions | Every signal shows points, severity, plain-language reason |
