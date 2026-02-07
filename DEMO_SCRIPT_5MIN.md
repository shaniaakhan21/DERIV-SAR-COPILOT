# SAR Copilot — 5-Minute Demo Script

> Screen recording walkthrough. Times are approximate guides — speak naturally.

---

## [0:00–0:30] Opening — The Problem

**Screen:** Start on the upload page (empty dashboard).

**Say:**

> "Financial crime teams at Deriv process millions of transactions monthly. The current rule-based systems generate around 2,000 alerts per week — and 95% of them are false positives. Analysts burn out clicking through accounts, and real fraud hides in the noise."
>
> "A client deposits $500, trades for 10 minutes with a penny of profit, then withdraws everything. That's not trading — that's laundering. But rule-based systems don't catch it because the amounts look 'normal.'"
>
> "SAR Copilot fixes this. It uses AI to turn 2,000 alerts into around 50 high-confidence cases — each with a full investigation pack and an auto-generated SAR narrative. Let me show you."

---

## [0:30–1:15] Upload & Processing

**Action:** Click **"Choose File"** → select the demo CSV → upload starts.

**Say:**

> "I'm uploading a real transaction dataset. The system processes every row through multiple AI layers — behavioral anomaly detection, network graph analysis, unsupervised pattern discovery, and multi-signal risk scoring."

**Screen:** Upload completes. KPI cards appear.

**Hover over each KPI card as you mention it:**

> "In seconds, the engine clustered all transactions into cases. Here we can see the key stats —"
>
> *(hover on Avg Events/Case)* "Average events per case tells us cluster density."
>
> *(hover on Largest Cluster)* "The largest cluster found 47 linked accounts — that's a fraud ring we'll investigate in a moment."
>
> *(hover on High Risk 60+)* "These are the cases scoring 60 or above — the ones that genuinely need analyst attention."
>
> *(hover on Total Cases)* "And the total number of cases generated. Instead of thousands of raw alerts, analysts see this."

---

## [1:15–1:45] Dashboard — Cases Tab

**Screen:** Cases table is showing.

**Say:**

> "The Cases tab shows every flagged case ranked by risk score. Each row shows the case ID, risk score, priority classification, cluster size, number of network link types, detected typologies, and the top reason it was flagged."

**Hover over a high-score case (score 100 or 70+):**

> "This case scored 100 out of 100 — maximum risk. You can see it's tagged with typologies like rapid_in_out and high_withdraw_ratio. The Priority column shows it's classified as a Coordinated Fraud Ring, which means it gets the highest investigation SLA."

**Hover over a low-score case:**

> "Compare that to this case at the bottom — low score, no typologies, labeled as routine. The system is telling analysts: skip this, focus on the ones that matter."

**Point at the Sort by toggle:**

> "Analysts can sort by raw score or by priority — priority factors in fraud type and urgency, not just the number."

---

## [1:45–3:15] Case Detail — Deep Investigation

**Action:** Click into the highest-risk case (score 100 or highest available).

**Say:**

> "Let's drill into the top case and see what the AI found."

### Score & Classification [1:45–2:00]

**Screen:** Case detail loads with the score gauge, classification banner, and fraud ring alert.

**Say:**

> "Right away we see the risk score gauge at 100 — maximum. The system classified this as a Coordinated Fraud Ring with 47 linked accounts. That red banner at the top says withdrawals would be held for review — this is real-time intervention, blocking money from leaving before an analyst even looks at it."

### Risk Signals [2:00–2:15]

**Hover over the Risk Signals section:**

> "These are the evidence signals that built up the score. Each one shows the signal type, how many points it contributed, and the severity level. Large linked network — 17 points. Rapid deposit-withdrawal cycle — 18 points. High withdrawal ratio — 15 points. The AI isn't a black box — every point is explained and traceable."

### Financial Summary [2:15–2:25]

**Hover over the Financial Summary card:**

> "The financial summary shows total deposits versus withdrawals. Notice the withdrawal amount is significantly higher than deposits with tiny profit — classic pass-through laundering pattern."

### Cluster Graph [2:25–2:40]

**Action:** Expand the Cluster Graph accordion.

**Say:**

> "The cluster graph is the network analysis visualization. Each node is an account, and the edges show how they're connected — shared devices, shared IP addresses, shared affiliates. This is how the system found all 47 accounts in this ring. Graph algorithms identified connections that no human could manually piece together across thousands of transactions."

### Transaction Timeline [2:40–2:55]

**Action:** Expand the Transaction Timeline accordion.

**Say:**

> "The timeline shows every transaction in chronological order — deposits, trades, withdrawals — with device IDs and IP addresses. You can see the pattern: deposit, tiny trade, immediate withdrawal. And look at the devices — multiple users sharing the same device ID. That's a fraud ring operating from shared infrastructure."

### Investigation Pack [2:55–3:15]

**Action:** Expand the Investigation Pack accordion. Scroll through sections.

**Say:**

> "The Investigation Pack is where it all comes together for the analyst."
>
> *(hover on Evidence Signals)* "Evidence signals — every reason the case was flagged, with severity and point values."
>
> *(hover on Network Link Evidence)* "Network link evidence — the actual device IDs and IP addresses that connected these accounts."
>
> *(hover on Behavioral Anomaly)* "Behavioral anomaly score — this measures how far the activity deviates from the user's historical baseline using Welford's online algorithm."
>
> *(hover on Real-time Intervention)* "Real-time intervention recommendation — the system says hold withdrawals for this case."
>
> *(hover on Unsupervised Discovery)* "And unsupervised discovery — DBSCAN clustering found this is a novel pattern. The system discovered this fraud typology on its own — we didn't program it."

---

## [3:15–3:45] Case Actions & SAR Generation

**Screen:** Scroll down to Case Actions panel.

**Say:**

> "The Case Actions panel gives analysts one-click workflows — block accounts, freeze withdrawals, escalate, request enhanced KYC, investigate linked accounts, or generate regulatory filings. Everything an analyst needs without switching between five different systems."

**Action:** Click **"Generate SAR Draft"** button.

**Say:**

> "Now let me generate the SAR. This calls GPT-4o-mini through OpenAI's API with all the case evidence as context."

**Screen:** SAR draft loads with the redesigned layout.

**Say:**

> "The AI generated a full Suspicious Activity Report. At the top — the document header showing this is a SAR, not just a review note, with the risk score and typology tags. Below that — financial metrics cards showing deposits, withdrawals, profit, and cluster size at a glance."
>
> *(hover on Narrative section)* "The narrative is written in regulator-ready language. It mentions the timeframe, the amounts, the typologies detected, and the network links — everything a compliance officer needs. And that 'AI-Generated' badge means the LLM wrote this, not a template."
>
> *(hover on Investigator Next Steps)* "The system also provides next steps — verify source of funds, check shared infrastructure, review withdrawal destinations, cross-reference typologies. This turns a 45-minute manual SAR draft into seconds."

---

## [3:45–4:15] Feedback Learning & Metrics

**Action:** Scroll back up. Click **"True Positive"** feedback button.

**Say:**

> "When the analyst confirms this is a true positive, the system learns. It uses Bayesian precision weighting — the signals that led to this correct detection get stronger, and signals that led to false positives in the past get weaker. Over time, the system gets smarter and false positives drop."

**Action:** Click back to Dashboard. Switch to the **"Metrics"** tab.

**Say:**

> "The Metrics tab shows system performance. Alert reduction — how many raw events were consolidated into cases. AI learning status — feedback precision from analyst labels. Fraud pattern distribution — which typologies are most common. And intervention stats — how many cases triggered real-time holds."

---

## [4:15–4:45] Unsupervised Discovery

**Action:** Switch to the **"Unsupervised Discovery"** tab.

**Say:**

> "This is what would blow your mind. The unsupervised discovery tab uses DBSCAN clustering to find entirely new fraud typologies — patterns we didn't program or train for."
>
> *(hover on KPI cards)* "It discovered multiple clusters and identified rare novel patterns plus outliers."
>
> *(expand a cluster accordion)* "Each cluster shows its distinguishing features as z-scores. High z-scores mean this group is statistically different from the rest. The system explains what makes each cluster unique — maybe it's unusually high withdrawal ratios combined with shared devices."
>
> *(hover on the Rare Pattern Alert)* "This rare pattern alert means the system found a fraud typology with very few cases — it's new, it's unusual, and it needs human attention. This is unsupervised learning discovering fraud that no rule-based system would ever catch."

---

## [4:45–5:00] Closing — Impact

**Screen:** Dashboard overview or Case Detail with full investigation visible.

**Say:**

> "To recap what SAR Copilot does: it takes raw transaction data and turns 2,000 weekly alerts into 50 high-confidence cases. Each case comes with a full investigation pack — network graph, timeline, evidence signals, behavioral anomaly scores. The system catches sophisticated patterns like $0.01 profit laundering that rules miss. It discovers new fraud typologies through unsupervised learning. It blocks suspicious withdrawals in real-time before money leaves. And it auto-generates regulator-ready SAR narratives in seconds instead of hours."
>
> "From upload to SAR — all AI-powered, all explainable, all in one system. Thank you."

---

## Quick Reference — Key Points to Hit

| Challenge Requirement | Where You Show It |
|---|---|
| Behavioral anomaly detection | Investigation Pack → Behavioral Anomaly section |
| Network analysis / graph algorithms | Cluster Graph + Network Link Evidence |
| Contextual risk scoring | Risk Signals with point breakdown |
| Automated evidence collection | Investigation Pack (one-click, all evidence) |
| False positive reduction | Feedback buttons + Metrics tab learning stats |
| Real-time intervention | Red banner + Intervention section (would_block) |
| SAR generation | Generate SAR Draft button → full narrative |
| Unsupervised learning / new typologies | Unsupervised Discovery tab |
| Temporal pattern recognition | Temporal Behavior Change alert (if visible) |
| Predictive flagging | Priority classification + fraud type SLA |
| Catches $0.01 profit laundering | Typology tags: tiny_profit_cycle, pass_through |
| 2,000 alerts → 50 cases | KPI cards + Metrics tab alert reduction |
| Explainable decisions | Every signal has points, severity, plain-language reason |
