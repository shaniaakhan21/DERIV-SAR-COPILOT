import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Typography, Chip, Stack, Button, Divider, Alert,
  CircularProgress, Grid, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, Paper, Accordion, AccordionSummary,
  AccordionDetails, ButtonGroup, LinearProgress, Tooltip,
} from "@mui/material";

import ArrowBackIcon    from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon   from "@mui/icons-material/ExpandMore";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import ThumbUpIcon      from "@mui/icons-material/ThumbUp";
import ThumbDownIcon    from "@mui/icons-material/ThumbDown";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BoltIcon         from "@mui/icons-material/Bolt";
import TrendingUpIcon   from "@mui/icons-material/TrendingUp";
import HubIcon          from "@mui/icons-material/Hub";
import BlockIcon        from "@mui/icons-material/Block";
import SecurityIcon     from "@mui/icons-material/Security";
import InsightsIcon     from "@mui/icons-material/Insights";
import LinkIcon         from "@mui/icons-material/Link";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeIcon   from "@mui/icons-material/AccessTime";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import ContentCopyIcon  from "@mui/icons-material/ContentCopy";

import { getCaseDetail, generateSar, submitFeedback } from "../api";
import ClusterGraph from "../components/ClusterGraph";
import { ScoreBadge, SectionLabel, RiskSignalRow, TimelineEvent, TypologyTag } from "../components/ui";

/* ── Score ring (SVG, animated) ── */
function ScoreRing({ score }) {
  const s      = Math.max(0, Math.min(100, Number(score) || 0));
  const r      = 52;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (s / 100) * circ;
  const color  = s >= 60 ? "#E53935" : s >= 40 ? "#FFB300" : "#00C853";
  const glow   = s >= 60 ? "score-glow-red" : s >= 40 ? "score-glow-amber" : "score-glow-green";

  return (
    <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="128" height="128" className={glow}>
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 64 64)"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <Box sx={{ position: "absolute", textAlign: "center" }}>
        <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.7rem", fontWeight: 800, color, lineHeight: 1 }}>{s}</Typography>
        <Typography sx={{ fontSize: "0.58rem", color: "#475569", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>/100</Typography>
      </Box>
    </Box>
  );
}

/* ── Helpers ── */
function fmt(n)   { return Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtTs(ts){ if (!ts) return "—"; try { return new Date(ts).toISOString().slice(0,19).replace("T"," "); } catch { return "—"; } }
function signalIcon(detail = "") {
  const d = detail.toLowerCase();
  if (d.includes("withdrawal ratio"))                                          return <TrendingUpIcon fontSize="small" />;
  if (d.includes("rapid"))                                                     return <BoltIcon fontSize="small" />;
  if (d.includes("linked") || d.includes("network"))                          return <HubIcon fontSize="small" />;
  if (d.includes("ip") || d.includes("device") || d.includes("affiliate"))    return <LinkIcon fontSize="small" />;
  return <WarningAmberIcon fontSize="small" />;
}

/* ── Dark card wrapper ── */
function DarkCard({ children, sx = {}, accentColor }) {
  return (
    <Box sx={{ bgcolor: "#111118", border: `1px solid ${accentColor ? accentColor + "30" : "rgba(255,255,255,0.06)"}`, borderRadius: "6px", overflow: "hidden", ...(accentColor && { borderLeft: `3px solid ${accentColor}` }), ...sx }}>
      {children}
    </Box>
  );
}

function CardHeader({ icon, title, right }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      {icon && <Box sx={{ color: "#475569", display: "flex" }}>{icon}</Box>}
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#64748b", flex: 1 }}>{title}</Typography>
      {right}
    </Box>
  );
}

function FinRow({ label, value, valueColor }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", py: "8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>{label}</Typography>
      <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.88rem", fontWeight: 700, color: valueColor || "#F1F5F9" }}>{value}</Typography>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function CaseDetail({ batchId, cases, setCases }) {
  const { caseId }       = useParams();
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const effectiveBatchId  = batchId || searchParams.get("batchId") || localStorage.getItem("batchId");

  const [pack,          setPack]          = useState(null);
  const [sar,           setSar]           = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [sarLoading,    setSarLoading]    = useState(false);
  const [error,         setError]         = useState(null);
  const [feedback,      setFeedback]      = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [sarCopied,     setSarCopied]     = useState(false);

  const handleAction = (actionName) => {
    const msgs = {
      block: "Block this account and hold all funds? Requires senior approval.",
      freeze: "Freeze withdrawals for this account?",
      escalate: "Escalate to senior analyst?",
      kyc: "Request enhanced KYC verification?",
      history: "Request full transaction history?",
      investigate: "Investigate all linked accounts in this cluster?",
      file_sar: "File SAR with regulator? Cannot be undone.",
      export: "Export investigation pack as PDF?",
      close: "Close this case as resolved?",
      mark_fp: "Mark as false positive?",
      assign: "Assign to investigation queue?",
    };
    if (window.confirm(msgs[actionName])) {
      setActionSuccess(`Action "${actionName}" completed successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const topSignals = useMemo(() => {
    const list    = Array.isArray(pack?.evidence_signals) ? pack.evidence_signals : [];
    const sevRank = { error: 3, warning: 2, info: 1 };
    return list.slice().sort((a, b) => {
      const sa = sevRank[a?.severity || "info"] || 1;
      const sb = sevRank[b?.severity || "info"] || 1;
      const pa = typeof a?.points === "number" ? a.points : 0;
      const pb = typeof b?.points === "number" ? b.points : 0;
      return sb - sa || pb - pa;
    }).slice(0, 7);
  }, [pack?.evidence_signals]);

  useEffect(() => {
    if (!effectiveBatchId) { navigate("/"); return; }
    setLoading(true); setError(null);
    getCaseDetail(effectiveBatchId, caseId)
      .then((data) => { setPack(data); setFeedback(data.feedback); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [effectiveBatchId, caseId, navigate]);

  const handleSar = async () => {
    setSarLoading(true); setError(null);
    try { setSar(await generateSar(effectiveBatchId, caseId)); }
    catch (e) { setError(e.message); }
    finally { setSarLoading(false); }
  };

  const handleFeedback = async (label) => {
    setError(null);
    try {
      await submitFeedback(effectiveBatchId, caseId, label);
      setFeedback(label);
      if (setCases && cases) setCases(cases.map((c) => c.case_id === caseId ? { ...c, feedback: label } : c));
    } catch (e) { setError(e.message); }
  };

  const copySar = () => {
    const text = sar?.narrative || sar?.report || JSON.stringify(sar, null, 2);
    navigator.clipboard.writeText(text).then(() => { setSarCopied(true); setTimeout(() => setSarCopied(false), 2000); });
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}><CircularProgress size={32} sx={{ color: "#F97316" }} /></Box>;
  if (error)   return <Alert severity="error">{error}</Alert>;
  if (!pack)   return <Alert severity="warning">Case not found</Alert>;

  const score          = Number(pack?.score ?? 0);
  const reasonsCount   = (pack?.reasons || []).filter(Boolean).length;
  const typologiesCount= (pack?.typologyTags || []).filter(Boolean).length;
  const linkStrength   = Number(pack?.linkStrength ?? 0);
  const isLowRisk      = score < 35 && reasonsCount === 0 && typologiesCount === 0 && linkStrength === 0;
  const timeline       = pack.timeline || [];
  const scoreColor     = score >= 60 ? "#E53935" : score >= 40 ? "#FFB300" : "#00C853";

  const actionGroups = [
    { label: "Immediate Actions", color: "#E53935", actions: [{ key: "block", label: "Block Account" }, { key: "freeze", label: "Freeze Withdrawals" }, { key: "escalate", label: "Escalate" }] },
    { label: "Investigation",     color: "#F97316", actions: [{ key: "history", label: "Full History" }, { key: "investigate", label: "Linked Accounts" }, { key: "kyc", label: "Enhanced KYC" }] },
    { label: "Regulatory",        color: "#FFB300", actions: [{ key: "file_sar", label: "File SAR" }, { key: "export", label: "Export PDF" }] },
    { label: "Case Management",   color: "#64748b", actions: [{ key: "close", label: "Close Case" }, { key: "assign", label: "Assign" }, { key: "mark_fp", label: "Mark FP" }] },
  ];

  return (
    <Box sx={{ animation: "fadeSlideUp 0.2s ease-out" }}>

      {/* ── Sticky top bar ── */}
      <Box sx={{ position: "sticky", top: 52, zIndex: 100, bgcolor: "#0A0B0F", borderBottom: "1px solid rgba(255,255,255,0.06)", py: 1, mb: 2.5, mx: -3, px: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
          <Button startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />} onClick={() => navigate(`/?batchId=${effectiveBatchId}`)} size="small" sx={{ color: "#64748b", fontSize: "0.78rem", "&:hover": { color: "#94A3B8" } }}>
            Cases
          </Button>
          <Box sx={{ width: 1, height: 20, bgcolor: "rgba(255,255,255,0.06)" }} />
          <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", fontWeight: 700, color: "#FB923C" }}>
            {String(pack.case_id || "").replace("case_cluster_", "C-")}
          </Typography>
          <ScoreBadge score={score} />
          {pack.fraudClassification?.severity && (
            <Box sx={{ px: "8px", py: "2px", borderLeft: `3px solid ${scoreColor}`, bgcolor: `${scoreColor}15`, borderRadius: "0 4px 4px 0" }}>
              <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: scoreColor }}>{pack.fraudClassification.severity}</Typography>
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <ButtonGroup size="small">
            <Button startIcon={<ThumbDownIcon sx={{ fontSize: 13 }} />} variant={feedback === "TP" ? "contained" : "outlined"} color="error"    onClick={() => handleFeedback("TP")} sx={{ fontSize: "0.72rem", fontWeight: 600 }}>True Positive</Button>
            <Button startIcon={<ThumbUpIcon   sx={{ fontSize: 13 }} />} variant={feedback === "FP" ? "contained" : "outlined"} color="success"  onClick={() => handleFeedback("FP")} sx={{ fontSize: "0.72rem", fontWeight: 600 }}>False Positive</Button>
          </ButtonGroup>
          <Button variant="contained" size="small" onClick={handleSar} disabled={sarLoading}
            startIcon={sarLoading ? <CircularProgress size={12} color="inherit" /> : <SecurityIcon sx={{ fontSize: 14 }} />}
            sx={{ fontSize: "0.72rem", fontWeight: 600 }}
          >
            {sarLoading ? "Generating…" : "Generate SAR"}
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {actionSuccess && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>{actionSuccess}</Alert>}
      {error         && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {pack.would_block && <Alert severity="error" icon={<BlockIcon />} sx={{ mb: 2, fontWeight: 600 }}>Withdrawal would be held — risk score {pack.score}/100 with pending withdrawal detected.</Alert>}
      {pack.fraudClassification && (
        <Alert severity={pack.fraudClassification.severity === "critical" ? "error" : pack.fraudClassification.severity === "high" ? "warning" : "info"} icon={<PriorityHighIcon />} sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{pack.fraudClassification.description}</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", mt: 0.5 }}>Priority {pack.fraudClassification.priority} · SLA: {pack.fraudClassification.slaHours}h · Deadline: {new Date(pack.fraudClassification.deadline).toLocaleString()}</Typography>
        </Alert>
      )}
      {(pack.link_evidence || []).length > 0 && pack.cluster_size > 1 && (
        <Alert severity="error" icon={<HubIcon />} sx={{ mb: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>Fraud Ring Detected — {pack.cluster_size} Linked Accounts</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, gap: 0.5 }}>
            {(() => { const types = {}; (pack.link_evidence||[]).forEach(ev => { types[ev.by] = (types[ev.by]||0)+1; }); return Object.entries(types).map(([type,count]) => <Chip key={type} label={`${count} shared ${type}${count>1?"s":""}`} size="small" color="error" sx={{ fontWeight:600, fontSize:"0.68rem" }} />); })()}
          </Stack>
        </Alert>
      )}

      {/* ── 3-column layout ── */}
      <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>

        {/* LEFT 30% */}
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <Stack spacing={2}>

            {/* Score card */}
            <DarkCard accentColor={scoreColor}>
              <Box sx={{ p: 2.5, textAlign: "center" }}>
                <ScoreRing score={score} />
                <Typography sx={{ mt: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", fontWeight: 700, color: "#FB923C" }}>
                  {String(pack.case_id || "").replace("case_cluster_", "C-")}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.5, flexWrap: "wrap", gap: 0.75 }}>
                  <Chip label={`${pack.cluster_size || 1} accounts`} size="small" sx={{ fontSize: "0.66rem", bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  <Chip label={`${pack.linkStrength || 0} link types`} size="small" sx={{ fontSize: "0.66rem", bgcolor: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#FB923C" }} />
                </Stack>
                {(pack.typologyTags || []).length > 0 && (
                  <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 1.5, flexWrap: "wrap", gap: 0.5 }}>
                    {(pack.typologyTags || []).slice(0, 4).map(t => <TypologyTag key={t} label={t} />)}
                    {(pack.typologyTags || []).length > 4 && (
                      <Box sx={{ display: "inline-flex", alignItems: "center", px: "6px", py: "2px", bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", fontSize: "0.62rem", color: "#64748b" }}>+{pack.typologyTags.length - 4}</Box>
                    )}
                  </Stack>
                )}
              </Box>
            </DarkCard>

            {/* Financial summary */}
            <DarkCard>
              <CardHeader icon={<TrendingUpIcon fontSize="small" />} title="Financial Summary" />
              <Box sx={{ px: 2, pb: 2 }}>
                <FinRow label="Total Deposits"    value={`$${fmt(pack.totals?.deposit)}`}  valueColor="#69F0AE" />
                <FinRow label="Total Withdrawals" value={`$${fmt(pack.totals?.withdraw)}`} valueColor="#EF5350" />
                <FinRow label="Net Profit"        value={`$${fmt(pack.totals?.profit)}`} />
                <Box sx={{ mt: 1.5 }}>
                  <SectionLabel sx={{ mb: 1 }}>Members ({pack.member_count || 0})</SectionLabel>
                  <Stack direction="row" flexWrap="wrap" sx={{ gap: 0.5 }}>
                    {(pack.members || []).slice(0, 6).map(m => (
                      <Box key={m} sx={{ px: "6px", py: "2px", bgcolor: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "4px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "#FB923C" }}>{m}</Box>
                    ))}
                    {(pack.member_count || 0) > 6 && <Box sx={{ px: "6px", py: "2px", bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", fontSize: "0.6rem", color: "#64748b" }}>+{pack.member_count - 6}</Box>}
                  </Stack>
                </Box>
              </Box>
            </DarkCard>

          </Stack>
        </Grid>

        {/* CENTER 45% */}
        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <Stack spacing={2}>

            {/* Timeline */}
            <DarkCard>
              <CardHeader icon={<AccessTimeIcon fontSize="small" />} title={`Timeline — ${timeline.length} events`} />
              <Box sx={{ maxHeight: 380, overflowY: "auto" }}>
                {timeline.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: "center" }}><Typography sx={{ fontSize: "0.8rem", color: "#475569" }}>No timeline events</Typography></Box>
                ) : (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: "14px", py: "6px", borderBottom: "1px solid rgba(255,255,255,0.04)", bgcolor: "#0D0E14" }}>
                      {[["Type",36],["Timestamp",130],["User",100],["Amount",90],["Country",60],["Device",null],["IP",100]].map(([h,w]) => (
                        <Typography key={h} sx={{ fontSize: "0.56rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2d3f60", width: w, flexShrink: h==="Device"?1:0, flex: h==="Device"?1:"none" }}>{h}</Typography>
                      ))}
                    </Box>
                    {timeline.map((ev, i) => (
                      <TimelineEvent key={i} index={i} type={ev.transaction_type} ts={fmtTs(ev.timestamp)} amount={ev.amount} userId={ev.user_id} country={ev.country} deviceId={ev.device_id} ip={ev.ip_address} />
                    ))}
                  </>
                )}
              </Box>
            </DarkCard>

            {/* Cluster graph */}
            <DarkCard>
              <CardHeader icon={<HubIcon fontSize="small" />} title="Cluster Graph" />
              <Box sx={{ height: 340, bgcolor: "#070710" }}>
                <ClusterGraph pack={pack} />
              </Box>
            </DarkCard>

          </Stack>
        </Grid>

        {/* RIGHT 25% */}
        <Grid size={{ xs: 12, md: 12, lg: 3 }}>
          <Stack spacing={2}>

            {/* Risk signals */}
            <DarkCard accentColor={isLowRisk ? "#00C853" : "#E53935"}>
              <CardHeader icon={<WarningAmberIcon fontSize="small" />} title={isLowRisk ? "Risk Assessment" : "Risk Signals"} />
              <Box sx={{ p: 1.5 }}>
                {isLowRisk ? (
                  <Stack spacing={1}>
                    <Alert severity="success" icon={<CheckCircleIcon />} sx={{ py: 0.5 }}>No risk signals detected.</Alert>
                    {["No rapid deposit–withdraw cycles","No abnormal withdrawal ratio","No shared device/IP/affiliate links","Single-account activity","Velocity within expected range"].map((t,i) => (
                      <Stack key={i} direction="row" spacing={1} alignItems="center">
                        <CheckCircleIcon sx={{ fontSize: 13, color: "#00C853" }} />
                        <Typography sx={{ fontSize: "0.74rem", color: "#64748b" }}>{t}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : topSignals.length === 0 ? (
                  <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ py: 0.5 }}>No evidence signals yet.</Alert>
                ) : (
                  <Stack spacing={1}>
                    {topSignals.map((sig, i) => <RiskSignalRow key={i} icon={signalIcon(sig.detail)} detail={sig.detail} points={sig.points} severity={sig.severity} />)}
                  </Stack>
                )}
              </Box>
            </DarkCard>

            {/* Investigation pack */}
            <Accordion defaultExpanded sx={{ bgcolor: "#111118 !important", border: "1px solid rgba(255,255,255,0.06) !important", "&.Mui-expanded": { mt: "0 !important" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 16, color: "#475569" }} />} sx={{ minHeight: "40px !important", "&.Mui-expanded": { minHeight: "40px !important" }, py: 0, px: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SecurityIcon sx={{ fontSize: 14, color: "#F97316" }} />
                  <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#64748b" }}>Investigation Pack</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: "12px", bgcolor: "#111118" }}>
                <Stack spacing={1.5}>
                  {(pack.evidence_signals || []).length > 0 && (
                    <Box>
                      <SectionLabel sx={{ mb: 0.75 }}>All Evidence Signals</SectionLabel>
                      <Stack spacing={0.75}>
                        {(pack.evidence_signals || []).slice(0, 12).map((sig, i) => <RiskSignalRow key={i} icon={signalIcon(sig.detail)} detail={sig.detail} points={sig.points} severity={sig.severity} />)}
                      </Stack>
                    </Box>
                  )}

                  {pack.temporalChange?.hasChange && (
                    <Box>
                      <SectionLabel sx={{ mb: 0.75, color: "#EF5350" }}>Temporal Behavior Change</SectionLabel>
                      <Alert severity="error" sx={{ py: 0.5, mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.74rem" }}>Behavior shifted 72h after account creation</Typography>
                        <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8", mt: 0.25 }}>Change score: {(pack.temporalChange.changeScore * 100).toFixed(0)}%</Typography>
                      </Alert>
                      <Stack spacing={0.75}>
                        {(pack.temporalChange.evidence || []).map((ev, i) => <RiskSignalRow key={i} icon={<AccessTimeIcon fontSize="small" />} detail={ev.detail} severity={ev.value >= 0.7 ? "error" : "warning"} />)}
                      </Stack>
                    </Box>
                  )}

                  {(pack.link_evidence || []).length > 0 && (
                    <Box>
                      <SectionLabel sx={{ mb: 0.75 }}>Network Link Evidence</SectionLabel>
                      <Stack spacing={0.5}>
                        {(pack.link_evidence || []).slice(0, 8).map((ev, i) => (
                          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, p: "7px 10px", bgcolor: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: "4px" }}>
                            <LinkIcon sx={{ fontSize: 12, color: "#F97316", flexShrink: 0 }} />
                            <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.63rem", color: "#FB923C", flexShrink: 0 }}>{ev.by}</Typography>
                            <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.key}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

          </Stack>
        </Grid>
      </Grid>

      {/* ── Action buttons ── */}
      <Box sx={{ mt: 3, bgcolor: "#0D0E14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", p: "16px 20px" }}>
        <SectionLabel sx={{ mb: 2 }}>Case Actions</SectionLabel>
        <Stack spacing={2}>
          {actionGroups.map((group) => (
            <Box key={group.label}>
              <Typography sx={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: group.color, mb: 0.75, opacity: 0.8 }}>{group.label}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                {group.actions.map((a) => (
                  <Button key={a.key} variant="outlined" size="small" onClick={() => handleAction(a.key)}
                    sx={{ fontSize: "0.72rem", fontWeight: 600, color: group.color, borderColor: `${group.color}35`, bgcolor: `${group.color}08`, "&:hover": { bgcolor: `${group.color}18`, borderColor: `${group.color}60` } }}>
                    {a.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* ── SAR draft ── */}
      {sar && (
        <Box sx={{ mt: 3, bgcolor: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", overflow: "hidden" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5, bgcolor: "#0D0E14", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#E53935" }} />
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#FFB300" }} />
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#00C853" }} />
            <Typography sx={{ ml: 1, fontSize: "0.7rem", fontWeight: 600, color: "#475569", flex: 1 }}>
              SAR Draft — {String(pack.case_id || "").replace("case_cluster_", "C-")}
            </Typography>
            <Button size="small" startIcon={<ContentCopyIcon sx={{ fontSize: 13 }} />} onClick={copySar} sx={{ fontSize: "0.68rem", color: sarCopied ? "#69F0AE" : "#64748b", "&:hover": { color: "#94A3B8" } }}>
              {sarCopied ? "Copied!" : "Copy"}
            </Button>
          </Box>
          <Box className="sar-terminal">{sar.narrative || sar.report || JSON.stringify(sar, null, 2)}</Box>
          {(sar.indicators || sar.next_steps) && (
            <Box sx={{ p: 2.5, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <Grid container spacing={2}>
                {sar.indicators && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SectionLabel sx={{ mb: 1 }}>Key Indicators</SectionLabel>
                    <Stack spacing={0.75}>
                      {(Array.isArray(sar.indicators) ? sar.indicators : [sar.indicators]).map((ind, i) => (
                        <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                          <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#E53935", mt: "6px", flexShrink: 0 }} />
                          <Typography sx={{ fontSize: "0.76rem", color: "#94A3B8" }}>{ind}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                )}
                {sar.next_steps && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SectionLabel sx={{ mb: 1 }}>Next Steps</SectionLabel>
                    <Stack spacing={0.75}>
                      {(Array.isArray(sar.next_steps) ? sar.next_steps : [sar.next_steps]).map((s, i) => (
                        <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                          <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#F97316", mt: "6px", flexShrink: 0 }} />
                          <Typography sx={{ fontSize: "0.76rem", color: "#94A3B8" }}>{s}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </Box>
      )}

    </Box>
  );
}
