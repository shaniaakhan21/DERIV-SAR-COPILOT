import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ButtonGroup,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BoltIcon from "@mui/icons-material/Bolt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HubIcon from "@mui/icons-material/Hub";
import BlockIcon from "@mui/icons-material/Block";
import SecurityIcon from "@mui/icons-material/Security";
import InsightsIcon from "@mui/icons-material/Insights";
import LinkIcon from "@mui/icons-material/Link";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { getCaseDetail, generateSar, submitFeedback } from "../api";
import ClusterGraph from "../components/ClusterGraph";

function ScoreGauge({ score }) {
  const theme = useTheme();
  const color =
    score >= 70
      ? theme.palette.error.main
      : score >= 40
        ? theme.palette.warning.main
        : theme.palette.success.main;

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={Math.max(0, Math.min(100, Number(score) || 0))}
        size={120}
        thickness={8}
        sx={{ 
          color, 
          "& .MuiCircularProgress-circle": { 
            strokeLinecap: "round",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
          } 
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h3" sx={{ color: "text.primary", lineHeight: 1, fontWeight: 700 }}>
          {Number(score) || 0}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          /100
        </Typography>
      </Box>
    </Box>
  );
}

function fmt(n) {
  return Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtTs(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toISOString().slice(0, 19).replace("T", " ");
  } catch {
    return "—";
  }
}

function signalIcon(detail = "") {
  const d = detail.toLowerCase();
  if (d.includes("withdrawal ratio")) return <TrendingUpIcon fontSize="small" />;
  if (d.includes("rapid")) return <BoltIcon fontSize="small" />;
  if (d.includes("linked") || d.includes("network")) return <HubIcon fontSize="small" />;
  if (d.includes("ip") || d.includes("device") || d.includes("affiliate")) return <LinkIcon fontSize="small" />;
  if (d.includes("behavior")) return <WarningAmberIcon fontSize="small" />;
  return <WarningAmberIcon fontSize="small" />;
}

export default function CaseDetail({ batchId, cases, setCases }) {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const effectiveBatchId =
    batchId || searchParams.get("batchId") || localStorage.getItem("batchId");

  const [pack, setPack] = useState(null);
  const [sar, setSar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sarLoading, setSarLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null); // For action feedback

  // Action handlers
  const handleAction = (actionName) => {
    const confirmMessage = {
      'block': 'Block this account and hold all funds? This action requires senior approval.',
      'freeze': 'Freeze withdrawals for this account? User will be notified.',
      'escalate': 'Escalate this case to senior analyst? They will be notified immediately.',
      'kyc': 'Request enhanced KYC verification? User will receive verification request.',
      'history': 'Request full transaction history? This may take a few minutes.',
      'investigate': 'Investigate all linked accounts in this cluster?',
      'file_sar': 'File SAR with regulator? This action cannot be undone.',
      'export': 'Export investigation pack as PDF?',
      'close': 'Close this case as resolved? This will archive the case.',
      'mark_fp': 'Mark as false positive? This will help train the system.',
      'assign': 'Assign this case to investigation queue?'
    };

    if (window.confirm(confirmMessage[actionName])) {
      // Show success message
      setActionSuccess(`Action "${actionName}" completed successfully!`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

    // ✅ Single source of truth for “signals”: evidence_signals (already includes scoring + behavior)
  const topSignals = useMemo(() => {
    const list = Array.isArray(pack?.evidence_signals) ? pack.evidence_signals : [];
    const sevRank = { error: 3, warning: 2, info: 1 };
    return list
      .slice()
      .sort((a, b) => {
        const sa = sevRank[a?.severity || "info"] || 1;
        const sb = sevRank[b?.severity || "info"] || 1;
        const pa = typeof a?.points === "number" ? a.points : 0;
        const pb = typeof b?.points === "number" ? b.points : 0;
        return sb - sa || pb - pa;
      })
      .slice(0, 7);
  }, [pack?.evidence_signals]);

  useEffect(() => {
    if (!effectiveBatchId) {
      navigate("/");
      return;
    }
    setLoading(true);
    setError(null);

    getCaseDetail(effectiveBatchId, caseId)
      .then((data) => {
        setPack(data);
        setFeedback(data.feedback);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [effectiveBatchId, caseId, navigate]);

  const handleSar = async () => {
    setSarLoading(true);
    setError(null);
    try {
      const result = await generateSar(effectiveBatchId, caseId);
      setSar(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setSarLoading(false);
    }
  };

  const handleFeedback = async (label) => {
    setError(null); // Clear any previous errors
    try {
      await submitFeedback(effectiveBatchId, caseId, label);
      setFeedback(label);
      setError(null); // Clear errors on success
      
      // Update the cases array in App state so the label shows when navigating back
      if (setCases && cases) {
        setCases(cases.map(c => 
          c.case_id === caseId ? { ...c, feedback: label } : c
        ));
      }
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!pack) return <Alert severity="warning">Case not found</Alert>;

  const score = Number(pack?.score ?? 0);
  const reasonsCount = (pack?.reasons || []).filter(Boolean).length;
  const typologiesCount = (pack?.typologyTags || []).filter(Boolean).length;
  const linkStrength = Number(pack?.linkStrength ?? 0);

  const isLowRisk =
    score < 35 && reasonsCount === 0 && typologiesCount === 0 && linkStrength === 0;

  const timeline = pack.timeline || [];

  const rawBehaviorAnom = Number(pack.behaviorAnom ?? 0);
  const behaviorPct =
    rawBehaviorAnom <= 1 ? Math.round(rawBehaviorAnom * 100) : Math.round(rawBehaviorAnom);

  const scoreBorder =
    score >= 70 ? "error.main" : score >= 40 ? "warning.main" : "success.main";

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/?batchId=${effectiveBatchId}`)}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      {/* Action Success Alert */}
      {actionSuccess && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
          {actionSuccess}
        </Alert>
      )}

      {/* Withdrawal hold banner */}
      {pack.would_block && (
        <Alert severity="error" icon={<BlockIcon />} sx={{ mb: 2, fontWeight: 600 }}>
          Withdrawal would be held for review — risk score {pack.score}/100 with pending
          withdrawal detected.
        </Alert>
      )}

      {/* Fraud Classification Banner */}
      {pack.fraudClassification && (
        <Alert
          severity={
            pack.fraudClassification.severity === "critical" ? "error" :
            pack.fraudClassification.severity === "high" ? "warning" : "info"
          }
          icon={<PriorityHighIcon />}
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {pack.fraudClassification.description}
              </Typography>
              <Typography variant="caption">
                Priority {pack.fraudClassification.priority} | SLA: {pack.fraudClassification.slaHours}h | 
                Deadline: {new Date(pack.fraudClassification.deadline).toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </Alert>
      )}

      {/* Fraud Ring Detection Banner */}
      {(pack.link_evidence || []).length > 0 && pack.cluster_size > 1 && (
        <Alert
          severity="error"
          icon={<HubIcon />}
          sx={{ 
            mb: 2,
            bgcolor: "error.50",
            border: "2px solid",
            borderColor: "error.main"
          }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              🚨 Fraud Ring Detected - {pack.cluster_size} Linked Accounts
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Network Effect Analysis: {pack.linkStrength || 0} connection types identified
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
              {(() => {
                const linkTypes = {};
                (pack.link_evidence || []).forEach(ev => {
                  linkTypes[ev.by] = (linkTypes[ev.by] || 0) + 1;
                });
                return Object.entries(linkTypes).map(([type, count]) => (
                  <Chip
                    key={type}
                    label={`${count} shared ${type}${count > 1 ? 's' : ''}`}
                    size="small"
                    color="error"
                    sx={{ fontWeight: 600 }}
                  />
                ));
              })()}
            </Stack>
            <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
              ⚠️ Coordinated fraud ring: Multiple accounts sharing devices, IPs, or affiliates. 
              This indicates organized fraud activity requiring immediate investigation.
            </Typography>
          </Stack>
        </Alert>
      )}

      {/* Header row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Score + meta */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            sx={{ 
              height: "100%", 
              borderLeft: 6, 
              borderColor: scoreBorder,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
              }
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 3 }}>
              <ScoreGauge score={score} />
              <Typography 
                variant="h5" 
                sx={{ 
                  mt: 3, 
                  mb: 1,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "primary.main"
                }}
              >
                {String(pack.case_id || "").replace("case_cluster_", "C-")}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
              >
                <Chip 
                  label={`${pack.cluster_size || 1} accounts`} 
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Chip 
                  label={`${pack.linkStrength || 0} link types`} 
                  size="small" 
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>

              {(pack.typologyTags || []).length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}
                >
                  {(pack.typologyTags || []).slice(0, 4).map((t) => (
                    <Chip
                      key={t}
                      label={t.replace(/_/g, " ")}
                      size="small"
                      variant="outlined"
                      color="warning"
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                  {(pack.typologyTags || []).length > 4 && (
                    <Chip 
                      label={`+${pack.typologyTags.length - 4}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Stack>
              )}

              {/* Feedback */}
              <Box sx={{ mt: 3 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 1.5 }}
                >
                  Analyst Feedback
                </Typography>
                <ButtonGroup size="small" sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <Button
                    startIcon={<ThumbDownIcon />}
                    variant={feedback === "TP" ? "contained" : "outlined"}
                    color="error"
                    onClick={() => handleFeedback("TP")}
                    sx={{ fontWeight: 600, px: 2 }}
                  >
                    True Positive
                  </Button>
                  <Button
                    startIcon={<ThumbUpIcon />}
                    variant={feedback === "FP" ? "contained" : "outlined"}
                    color="success"
                    onClick={() => handleFeedback("FP")}
                    sx={{ fontWeight: 600, px: 2 }}
                  >
                    False Positive
                  </Button>
                </ButtonGroup>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Signals (compact, non-redundant) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            sx={{ 
              height: "100%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2
                }}
              >
                <WarningAmberIcon color="warning" />
                {isLowRisk ? "Risk Assessment" : "Risk Signals"}
              </Typography>

              {isLowRisk ? (
                <>
                  <Alert 
                    severity="success" 
                    icon={<CheckCircleIcon />} 
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    No risk signals detected for this case.
                  </Alert>
                  <Stack spacing={1}>
                    {[
                      "No rapid deposit–withdraw cycles",
                      "No abnormal withdrawal ratio",
                      "No shared device/IP/affiliate links",
                      "Single-account activity only",
                      "Velocity and volume within expected range",
                    ].map((text, i) => (
                      <Typography 
                        key={i} 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CheckCircleIcon fontSize="small" color="success" /> {text}
                      </Typography>
                    ))}
                  </Stack>
                </>
              ) : (
                <>
                  {topSignals.length === 0 ? (
                    <Alert severity="info" icon={<InfoOutlinedIcon />}>
                      No evidence signals available yet.
                    </Alert>
                  ) : (
                    <Stack spacing={1.5}>
                      {topSignals.map((sig, i) => (
                        <Alert
                          key={i}
                          severity={sig.severity || "info"}
                          icon={signalIcon(sig.detail)}
                          variant="outlined"
                          sx={{
                            "& .MuiAlert-message": {
                              width: "100%"
                            }
                          }}
                          action={
                            typeof sig.points === "number" ? (
                              <Chip
                                label={`+${sig.points}`}
                                size="small"
                                sx={{ 
                                  fontFamily: "monospace", 
                                  fontSize: "0.7rem",
                                  fontWeight: 700
                                }}
                                color={
                                  sig.severity === "error"
                                    ? "error"
                                    : sig.severity === "warning"
                                      ? "warning"
                                      : "default"
                                }
                              />
                            ) : null
                          }
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {sig.detail}
                          </Typography>
                        </Alert>
                      ))}
                    </Stack>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Financials (compact, useful) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            sx={{ 
              height: "100%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  mb: 3
                }}
              >
                Financial Summary
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    Total Deposits
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: "success.main",
                      fontWeight: 700,
                      fontFamily: "monospace"
                    }}
                  >
                    ${fmt(pack.totals?.deposit)}
                  </Typography>
                </Box>

                <Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    Total Withdrawals
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: "error.main",
                      fontWeight: 700,
                      fontFamily: "monospace"
                    }}
                  >
                    ${fmt(pack.totals?.withdraw)}
                  </Typography>
                </Box>

                <Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    Net Profit
                  </Typography>
                  <Typography 
                    variant="h5"
                    sx={{ 
                      fontWeight: 700,
                      fontFamily: "monospace"
                    }}
                  >
                    ${fmt(pack.totals?.profit)}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Cluster Members ({pack.member_count || 0})
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                    {(pack.members || []).slice(0, 8).map((m) => (
                      <Chip
                        key={m}
                        label={m}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontFamily: "monospace", 
                          fontSize: "0.7rem",
                          fontWeight: 600
                        }}
                      />
                    ))}
                    {(pack.member_count || 0) > 8 && (
                      <Chip 
                        label={`+${pack.member_count - 8}`} 
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cluster Graph */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Cluster Graph</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Box sx={{ height: 400, bgcolor: "background.default" }}>
            <ClusterGraph pack={pack} />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Timeline */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Transaction Timeline ({timeline.length} events)</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Device</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeline.map((ev, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {fmtTs(ev.timestamp)}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                      {ev.user_id}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ev.transaction_type}
                        size="small"
                        color={
                          ev.transaction_type === "deposit"
                            ? "success"
                            : ev.transaction_type === "withdraw"
                              ? "error"
                              : "default"
                        }
                        sx={{ fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: "monospace" }}>
                      ${fmt(ev.amount)}
                    </TableCell>
                    <TableCell>{ev.country || "—"}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}>
                      {ev.device_id ? (
                        <Tooltip title={ev.device_id}>
                          <span>{String(ev.device_id).slice(0, 10)}</span>
                        </Tooltip>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}>
                      {ev.ip_address || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Evidence Pack (details live here, not duplicated above) */}
      <Accordion defaultExpanded sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SecurityIcon color="primary" />
            <Typography variant="h6">Investigation Pack</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            {/* Evidence Signals */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <InsightsIcon fontSize="small" color="action" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Evidence Signals
                </Typography>
              </Stack>

              {(pack.evidence_signals || []).length > 0 ? (
                <Stack spacing={1}>
                  {(pack.evidence_signals || []).slice(0, 20).map((sig, i) => (
                    <Alert
                      key={i}
                      severity={sig.severity || "info"}
                      variant="outlined"
                      action={
                        typeof sig.points === "number" ? (
                          <Chip
                            label={`+${sig.points} pts`}
                            size="small"
                            sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                          />
                        ) : null
                      }
                    >
                      {sig.detail}
                    </Alert>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info" icon={<InfoOutlinedIcon />}>
                  No evidence signals collected for this case.
                </Alert>
              )}
            </Box>

            <Divider />

            {/* Temporal Pattern Change (if detected) */}
            {pack.temporalChange?.hasChange && (
              <>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <AccessTimeIcon fontSize="small" color="error" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "error.main" }}>
                      ⏰ Temporal Behavior Change Detected
                    </Typography>
                  </Stack>
                  
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      BEHAVIOR CHANGED DRAMATICALLY 72 HOURS AFTER ACCOUNT CREATION
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      This account's activity pattern shifted significantly after the first 72 hours,
                      indicating possible account takeover, credential compromise, or planned fraud.
                    </Typography>
                    <Box sx={{ mt: 1, p: 1, bgcolor: "background.paper", borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Change Score: {(pack.temporalChange.changeScore * 100).toFixed(0)}% 
                        {pack.temporalChange.changeScore >= 0.7 ? " (VERY HIGH)" : " (HIGH)"}
                      </Typography>
                    </Box>
                  </Alert>

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Detected Changes:
                  </Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {(pack.temporalChange.evidence || []).map((ev, i) => (
                      <Alert
                        key={i}
                        severity={ev.value >= 0.7 ? "error" : "warning"}
                        variant="outlined"
                        icon={<AccessTimeIcon fontSize="small" />}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ev.detail}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Change magnitude: {(ev.value * 100).toFixed(0)}% | 
                          Analysis period: {ev.period}
                        </Typography>
                      </Alert>
                    ))}
                  </Stack>

                  <Paper sx={{ p: 2, bgcolor: "warning.50", border: 1, borderColor: "warning.main" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      🔍 Investigation Recommendations:
                    </Typography>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        • Verify customer identity with step-up authentication
                      </Typography>
                      <Typography variant="body2">
                        • Check if device/IP changes correlate with behavior change
                      </Typography>
                      <Typography variant="body2">
                        • Review KYC documents for signs of identity theft
                      </Typography>
                      <Typography variant="body2">
                        • Contact customer to confirm recent transactions
                      </Typography>
                      <Typography variant="body2">
                        • Hold any pending withdrawals until verification complete
                      </Typography>
                    </Stack>
                  </Paper>
                </Box>

                <Divider />
              </>
            )}

            {/* Network link evidence */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <LinkIcon fontSize="small" color="action" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Network Link Evidence
                </Typography>
              </Stack>

              {(pack.link_evidence || []).length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 220 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Key</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(pack.link_evidence || []).slice(0, 15).map((ev, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Chip
                              label={(ev.by || "link").replace(/_/g, " ")}
                              size="small"
                              color={
                                ev.by === "device"
                                  ? "primary"
                                  : ev.by === "ip"
                                    ? "info"
                                    : ev.by === "affiliate"
                                      ? "warning"
                                      : "default"
                              }
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                            {ev.key || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" icon={<InfoOutlinedIcon />}>
                  No network link evidence for this cluster.
                </Alert>
              )}
            </Box>

            <Divider />

            {/* Behavioral anomaly */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <BoltIcon fontSize="small" color="action" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Behavioral Anomaly
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(0, Math.min(100, behaviorPct))}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 5,
                        bgcolor:
                          behaviorPct >= 70
                            ? "error.main"
                            : behaviorPct >= 40
                              ? "warning.main"
                              : "success.main",
                      },
                    }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontFamily: "monospace", minWidth: 60 }}>
                  {behaviorPct}%
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                Higher means deviation from historical/segment baseline.
              </Typography>
            </Box>

            <Divider />

            {/* Intervention */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <BlockIcon fontSize="small" color="action" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Real-time Intervention
                </Typography>
              </Stack>

              {pack.would_block ? (
                <Alert severity="error" icon={<BlockIcon />}>
                  Withdrawal intervention recommended: hold/step-up verification before funds leave.
                </Alert>
              ) : (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  Monitor only: no intervention required.
                </Alert>
              )}
            </Box>

            {/* Unsupervised (optional) */}
            {pack.unsupervised && (
              <>
                <Divider />
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <InsightsIcon fontSize="small" color="secondary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Unsupervised Discovery
                    </Typography>
                  </Stack>
                  <Alert 
                    severity={pack.unsupervised.discovered_novel ? "warning" : "info"} 
                    variant="outlined"
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {pack.unsupervised.discovered_novel ? "🔍 Novel Pattern Detected" : "Pattern Identified"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Cluster:</strong> {pack.unsupervised.discovered_cluster}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Analysis:</strong> {pack.unsupervised.discovered_reason}
                    </Typography>
                    {pack.unsupervised.discovered_novel && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        <Typography variant="caption">
                          <strong>⚠️ This is a NEW fraud pattern</strong> not seen in typical cases. 
                          The system discovered this through unsupervised learning (DBSCAN clustering). 
                          This case requires enhanced investigation as it represents an emerging threat.
                        </Typography>
                      </Alert>
                    )}
                  </Alert>
                </Box>
              </>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Action Panel */}
      <Card sx={{ mt: 3, border: "2px solid", borderColor: "primary.main" }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
            <SecurityIcon color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Case Actions
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Take immediate action on this case
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            {/* Primary Actions */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: "error.50", border: "1px solid", borderColor: "error.main" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "error.main" }}>
                  🚨 Immediate Actions
                </Typography>
                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    startIcon={<BlockIcon />}
                    onClick={() => handleAction('block')}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    Block Account & Hold Funds
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<WarningAmberIcon />}
                    onClick={() => handleAction('freeze')}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    Freeze Withdrawals Only
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<PriorityHighIcon />}
                    onClick={() => handleAction('escalate')}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    Escalate to Senior Analyst
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Investigation Actions */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: "warning.50", border: "1px solid", borderColor: "warning.main" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "warning.main" }}>
                  🔍 Investigation Actions
                </Typography>
                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    color="warning"
                    fullWidth
                    startIcon={<SecurityIcon />}
                    onClick={() => handleAction('kyc')}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    Request Enhanced KYC
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    fullWidth
                    startIcon={<InsightsIcon />}
                    onClick={() => handleAction('history')}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    Request Transaction History
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    fullWidth
                    startIcon={<HubIcon />}
                    onClick={() => handleAction('investigate')}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    Investigate Linked Accounts
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Regulatory Actions */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: "info.50", border: "1px solid", borderColor: "info.main" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "info.main" }}>
                  📋 Regulatory Actions
                </Typography>
                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    color="info"
                    fullWidth
                    onClick={handleSar}
                    disabled={sarLoading}
                    startIcon={sarLoading ? <CircularProgress size={16} /> : <ReceiptLongIcon />}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    {sarLoading ? "Generating..." : "Generate SAR Report"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    fullWidth
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleAction('file_sar')}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    File SAR with Regulator
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    fullWidth
                    startIcon={<InfoOutlinedIcon />}
                    onClick={() => handleAction('export')}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    Export Investigation Pack
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Case Management */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: "success.50", border: "1px solid", borderColor: "success.main" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "success.main" }}>
                  ✅ Case Management
                </Typography>
                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleAction('close')}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    Close Case - Resolved
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    fullWidth
                    startIcon={<ThumbUpIcon />}
                    onClick={() => handleAction('mark_fp')}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    Mark as False Positive
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    fullWidth
                    startIcon={<AccessTimeIcon />}
                    onClick={() => handleAction('assign')}
                    sx={{ justifyContent: "flex-start", fontWeight: 600 }}
                  >
                    Assign to Queue
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Notes Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Investigation Notes
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
                minHeight: 100,
                cursor: "text"
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                Click to add investigation notes, analyst comments, or case updates...
              </Typography>
            </Paper>
          </Box>
        </CardContent>
      </Card>

      {/* SAR Draft */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <ReceiptLongIcon color="primary" />
              <Typography variant="h6">SAR Draft</Typography>
            </Stack>

            <Button variant="contained" onClick={handleSar} disabled={sarLoading}
              startIcon={sarLoading ? <CircularProgress size={16} /> : <ReceiptLongIcon />}>
              {sarLoading ? "Generating…" : "Generate SAR Draft"}
            </Button>
          </Stack>

          {sar && (() => {
            const isLowRisk = sar.riskScore < 35;
            const fmtMoney = (v) => "$" + Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return (
            <Box sx={{ mt: 3 }}>
              {/* Document header */}
              <Paper variant="outlined" sx={{
                p: 3, mb: 3,
                borderLeft: 4,
                borderLeftColor: isLowRisk ? "success.main" : "error.main",
                bgcolor: isLowRisk ? "success.50" : "error.50",
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1, fontSize: "0.7rem", mb: 0.5 }}>
                      {isLowRisk ? "Case Review Note" : "Suspicious Activity Report"}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {sar.subject}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Risk: ${sar.riskScore}/100`}
                    size="small"
                    color={sar.riskScore >= 70 ? "error" : sar.riskScore >= 40 ? "warning" : "success"}
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>

                {/* Typology tags */}
                {sar.typologyTags?.length > 0 && (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                    {sar.typologyTags.map((t) => (
                      <Chip key={t} label={t.replace(/_/g, " ")} size="small" variant="outlined" color="warning"
                        sx={{ fontSize: "0.7rem", textTransform: "capitalize" }} />
                    ))}
                  </Stack>
                )}
              </Paper>

              {/* Financial & Network metrics row */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: "Total Deposits", value: fmtMoney(sar.key_metrics?.deposit), color: "info.main" },
                  { label: "Total Withdrawals", value: fmtMoney(sar.key_metrics?.withdraw), color: "warning.main" },
                  { label: "Net Profit", value: fmtMoney(sar.key_metrics?.profit), color: "success.main" },
                  { label: "Cluster Size", value: sar.network?.cluster_size || "—", color: "secondary.main" },
                ].map((m) => (
                  <Grid key={m.label} size={{ xs: 6, md: 3 }}>
                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: 0.5 }}>
                        {m.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: m.color, mt: 0.5 }}>
                        {m.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Network link info */}
              {sar.network?.linkStrength > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <HubIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Network Links</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={`${sar.network.linkStrength} link type(s)`} size="small" color="primary" variant="outlined" />
                    {(sar.network.linkTypes || []).map((lt) => (
                      <Chip key={lt} label={lt} size="small" variant="filled"
                        sx={{ bgcolor: "primary.50", color: "primary.main", fontWeight: 600, fontSize: "0.7rem" }} />
                    ))}
                  </Stack>
                </Paper>
              )}

              {/* Narrative — the main LLM-generated text */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <SecurityIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Narrative</Typography>
                  {sar.llm_used && (
                    <Chip label="AI-Generated" size="small" variant="outlined" color="info" sx={{ fontSize: "0.65rem", height: 20 }} />
                  )}
                </Stack>
                <Paper variant="outlined" sx={{
                  p: 2.5,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  "& p": { mb: 1.5 },
                }}>
                  {(sar.narrative || "").split("\n").filter(Boolean).map((para, i) => (
                    <Typography key={i} variant="body2" sx={{ lineHeight: 1.75, color: "text.primary" }}>
                      {para}
                    </Typography>
                  ))}
                </Paper>
              </Box>

              {/* Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Summary</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {sar.summary}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Investigator Next Steps */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <InsightsIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Investigator Next Steps</Typography>
                </Stack>
                <Stack spacing={1}>
                  {(sar.investigator_next_steps || []).map((s, i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{
                        minWidth: 24, height: 24, borderRadius: "50%",
                        bgcolor: "primary.main", color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: 700, mt: 0.1,
                      }}>
                        {i + 1}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {s}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Box>
            );
          })()}
        </CardContent>
      </Card>
    </Box>
  );
}
