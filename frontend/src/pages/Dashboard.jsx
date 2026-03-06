import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Chip, Slider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, Stack, LinearProgress, TextField,
  ToggleButtonGroup, ToggleButton, Tabs, Tab, Snackbar, List, ListItem,
  ListItemText, Divider, Badge,
} from "@mui/material";
import CloudUploadIcon         from "@mui/icons-material/CloudUpload";
import FilterListIcon          from "@mui/icons-material/FilterList";
import WarningAmberIcon        from "@mui/icons-material/WarningAmber";
import GroupsIcon              from "@mui/icons-material/Groups";
import ReceiptLongIcon         from "@mui/icons-material/ReceiptLong";
import GppBadIcon              from "@mui/icons-material/GppBad";
import PlayArrowIcon           from "@mui/icons-material/PlayArrow";
import StopIcon                from "@mui/icons-material/Stop";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TrendingDownIcon        from "@mui/icons-material/TrendingDown";
import AddIcon                 from "@mui/icons-material/Add";
import HubIcon                 from "@mui/icons-material/Hub";
import AutoAwesomeIcon         from "@mui/icons-material/AutoAwesome";
import TrackChangesIcon        from "@mui/icons-material/TrackChanges";
import LinkIcon                from "@mui/icons-material/Link";

import { uploadFile, getCases } from "../api";
import { ScoreBadge, StatCard, SectionLabel, TypologyTag } from "../components/ui";
import Metrics               from "./Metrics";
import UnsupervisedDiscovery from "./UnsupervisedDiscovery";

/* ── Priority styling helpers ── */
function priorityStyle(severity) {
  if (!severity) return { color: "#475569", border: "transparent" };
  const s = severity.toLowerCase();
  if (s === "critical") return { color: "#EF5350", border: "#E53935" };
  if (s === "high")     return { color: "#FFD54F", border: "#FFB300" };
  if (s === "medium")   return { color: "#FB923C", border: "#F97316" };
  return { color: "#64748b", border: "transparent" };
}

function rowAccentClass(score) {
  if (score >= 70) return "risk-row-critical";
  if (score >= 50) return "risk-row-high";
  if (score >= 30) return "risk-row-medium";
  return "risk-row-low";
}

/* ══════════════════════════════════════════════════════════════ */
export default function Dashboard({ batchId, setBatchId, stats, setStats, cases, setCases }) {
  const navigate = useNavigate();
  const [loading,            setLoading]            = useState(false);
  const [error,              setError]              = useState(null);
  const [minScore,           setMinScore]           = useState(0);
  const [maxK,               setMaxK]               = useState(50);
  const [sortBy,             setSortBy]             = useState("score");
  const [activeTab,          setActiveTab]          = useState(0);
  const fetchedBatchIdRef = useRef(null);

  const [isSimulating,       setIsSimulating]       = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [recentActivity,     setRecentActivity]     = useState([]);
  const [notification,       setNotification]       = useState(null);

  /* Auto-fetch */
  useEffect(() => {
    if (!batchId) {
      setCases([]);
      setStats(null);
      fetchedBatchIdRef.current = null;
      return;
    }
    if (fetchedBatchIdRef.current === batchId && cases.length > 0) return;
    fetchedBatchIdRef.current = batchId;
    getCases(batchId, { k: 50 })
      .then((result) => { setCases(result.topCases || []); setError(null); })
      .catch((err) => {
        if (cases.length === 0) { setBatchId(null); setStats(null); localStorage.removeItem("batchId"); }
        setError(err.message);
        fetchedBatchIdRef.current = null;
      });
  }, [batchId, setBatchId, setStats, cases.length]);

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const result      = await uploadFile(file);
      setBatchId(result.batchId);
      setStats(result.stats);
      const casesResult = await getCases(result.batchId, { k: 50 });
      setCases(casesResult.topCases || []);
      setError(null);
      fetchedBatchIdRef.current = result.batchId;
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [setBatchId, setStats]);

  const handleFilter = useCallback(async () => {
    if (!batchId) return;
    setLoading(true); setError(null);
    try {
      const result = await getCases(batchId, { k: maxK, minScore, sortBy });
      setCases(result.topCases || []); setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [batchId, maxK, minScore, sortBy]);

  const handleSimulation = useCallback(async () => {
    if (isSimulating) { setIsSimulating(false); setSimulationProgress(0); return; }
    setIsSimulating(true); setSimulationProgress(0); setRecentActivity([]);
    const totalSteps    = 45;
    const highRiskCases = cases.filter((c) => c.score >= 70);
    for (let i = 0; i <= totalSteps; i++) {
      if (!isSimulating && i > 0) break;
      setSimulationProgress((i / totalSteps) * 100);
      if (i % 10 === 0 && i > 0 && highRiskCases.length > 0) {
        const idx2        = Math.floor((i / 10) - 1) % highRiskCases.length;
        const hrc         = highRiskCases[idx2];
        setNotification({ message: `High-Risk Alert: ${hrc.case_id.replace("case_cluster_", "C-")} (Score: ${hrc.score})`, severity: "error" });
        setRecentActivity((prev) => [{ time: new Date().toLocaleTimeString(), caseId: hrc.case_id, score: hrc.score, action: "Flagged for review" }, ...prev.slice(0, 4)]);
        setTimeout(() => setNotification(null), 3000);
      }
      if (i % 5 === 0 && i > 0) {
        const rc = cases[Math.floor(Math.random() * cases.length)];
        setRecentActivity((prev) => [{ time: new Date().toLocaleTimeString(), caseId: rc.case_id, score: rc.score, action: rc.score >= 70 ? "Blocked withdrawal" : "Processed" }, ...prev.slice(0, 4)]);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    setIsSimulating(false);
    setNotification({ message: "Simulation complete — all transactions processed.", severity: "success" });
    setTimeout(() => setNotification(null), 3000);
  }, [isSimulating, cases]);

  useEffect(() => () => setIsSimulating(false), []);

  /* ── JSX ── */
  return (
    <Box>

      {/* Tab bar */}
      {batchId && (
        <Box sx={{
          bgcolor: "#0D0E14",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "10px",
          mb: 3, px: 1,
        }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="Cases" />
            <Tab label="Metrics" />
            <Tab label="Unsupervised Discovery" />
          </Tabs>
        </Box>
      )}

      {activeTab === 1 && batchId ? (
        <Metrics batchId={batchId} />
      ) : activeTab === 2 && batchId ? (
        <UnsupervisedDiscovery batchId={batchId} />
      ) : (
        <>
          {/* ── Hero / Upload ── */}
          {!batchId && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 10, pb: 16, position: "relative" }}>

              {/* Ambient glow */}
              <Box sx={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: "90vw", maxWidth: 1000, height: 560,
                background: "radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.11) 0%, transparent 65%)",
                pointerEvents: "none", zIndex: 0,
              }} />

              <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

                {/* Eyebrow */}
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 1,
                  px: "16px", py: "8px",
                  bgcolor: "rgba(249,115,22,0.08)",
                  border: "1px solid rgba(249,115,22,0.22)",
                  borderRadius: 999, mb: 4,
                }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#F97316", boxShadow: "0 0 8px rgba(249,115,22,0.9)" }} />
                  <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#FB923C", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    SAR Intelligence Platform
                  </Typography>
                </Box>

                {/* Headline */}
                <Typography sx={{
                  fontSize: { xs: "2.6rem", md: "3.8rem" },
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.08,
                  textAlign: "center",
                  mb: 2.5,
                  maxWidth: 720,
                }}>
                  <Box component="span" sx={{ color: "#F1F5F9" }}>Detect Financial Crime</Box>
                  <br />
                  <Box component="span" sx={{
                    background: "linear-gradient(135deg, #F97316 0%, #FDBA74 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    Before It Escalates.
                  </Box>
                </Typography>

                {/* Subtext */}
                <Typography sx={{
                  fontSize: "1.05rem", color: "#64748b",
                  mb: 5, textAlign: "center",
                  maxWidth: 500, lineHeight: 1.75,
                }}>
                  Upload transaction data → AI clusters, scores, and surfaces suspicious
                  activity across your portfolio in seconds.
                </Typography>

                {/* Feature pills */}
                <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ mb: 7, gap: 1 }}>
                  {[
                    { icon: <HubIcon sx={{ fontSize: 14 }} />,           label: "AI Clustering" },
                    { icon: <LinkIcon sx={{ fontSize: 14 }} />,          label: "Network Analysis" },
                    { icon: <AutoAwesomeIcon sx={{ fontSize: 14 }} />,   label: "Auto SAR Drafts" },
                    { icon: <TrackChangesIcon sx={{ fontSize: 14 }} />,  label: "Risk Scoring" },
                  ].map(item => (
                    <Box key={item.label} sx={{
                      display: "inline-flex", alignItems: "center", gap: 0.75,
                      px: "14px", py: "7px",
                      bgcolor: "#17171F",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 999,
                    }}>
                      <Box sx={{ color: "#475569", display: "flex" }}>{item.icon}</Box>
                      <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 500 }}>{item.label}</Typography>
                    </Box>
                  ))}
                </Stack>

                {/* Upload card */}
                <Box sx={{
                  width: "100%", maxWidth: 480,
                  bgcolor: "#111118",
                  border: "1px solid rgba(249,115,22,0.2)",
                  borderRadius: "18px",
                  p: "48px 44px 40px",
                  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(249,115,22,0.04) inset",
                  position: "relative", overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0, left: "50%", transform: "translateX(-50%)",
                    width: "55%", height: "1px",
                    background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.7), transparent)",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "radial-gradient(ellipse at 50% -20%, rgba(249,115,22,0.05) 0%, transparent 60%)",
                    pointerEvents: "none",
                  },
                }}>

                  {/* Icon */}
                  <Box sx={{
                    width: 80, height: 80, borderRadius: "20px",
                    background: "linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.06) 100%)",
                    border: "1px solid rgba(249,115,22,0.28)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    mb: 3.5,
                    boxShadow: "0 0 32px rgba(249,115,22,0.15), 0 8px 24px rgba(0,0,0,0.3)",
                    position: "relative", zIndex: 1,
                  }}>
                    <CloudUploadIcon sx={{ fontSize: 38, color: "#F97316" }} />
                  </Box>

                  <Typography sx={{
                    fontSize: "1.3rem", fontWeight: 700,
                    color: "#F1F5F9", mb: 1,
                    letterSpacing: "-0.02em",
                    position: "relative", zIndex: 1,
                  }}>
                    Drop your CSV here
                  </Typography>
                  <Typography sx={{
                    fontSize: "0.85rem", color: "#475569",
                    mb: 4.5, lineHeight: 1.75,
                    position: "relative", zIndex: 1,
                  }}>
                    Supports transaction exports with device,<br />IP, and affiliate metadata
                  </Typography>

                  <Button
                    component="label"
                    variant="contained"
                    size="large"
                    startIcon={loading ? null : <CloudUploadIcon sx={{ fontSize: 18 }} />}
                    disabled={loading}
                    className={!loading ? "pulse-btn" : ""}
                    sx={{
                      px: 5, py: 1.6, fontSize: "0.92rem", fontWeight: 700,
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                      boxShadow: "0 8px 28px rgba(249,115,22,0.4)",
                      position: "relative", zIndex: 1,
                      "&:hover": {
                        background: "linear-gradient(135deg, #FB923C 0%, #F97316 100%)",
                        boxShadow: "0 12px 36px rgba(249,115,22,0.5)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {loading ? "Processing…" : "Choose File"}
                    <input type="file" accept=".csv" hidden onChange={handleUpload} />
                  </Button>

                  {loading && (
                    <Box sx={{ mt: 3, width: "100%", position: "relative", zIndex: 1 }}>
                      <LinearProgress sx={{ height: 3, borderRadius: 2, "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #F97316, #FB923C)" } }} />
                    </Box>
                  )}

                  <Typography sx={{ mt: 3, fontSize: "0.7rem", color: "#2d3f60", position: "relative", zIndex: 1 }}>
                    CSV · Max 50,000 rows · Secure processing
                  </Typography>
                </Box>

                {/* Stats strip */}
                <Box sx={{
                  display: "flex",
                  width: "100%", maxWidth: 480,
                  mt: 3,
                  bgcolor: "#111118",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}>
                  {[
                    { value: "97.5%",    label: "Alert Reduction",    color: "#00C853" },
                    { value: "7+ types", label: "Fraud Patterns",      color: "#E53935" },
                    { value: "47 accts", label: "Max Ring Detected",   color: "#F97316" },
                  ].map((stat, i) => (
                    <Box key={stat.label} sx={{
                      flex: 1, textAlign: "center", py: "20px",
                      ...(i < 2 && { borderRight: "1px solid rgba(255,255,255,0.06)" }),
                    }}>
                      <Typography sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "1.25rem", fontWeight: 800,
                        color: stat.color, lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}>
                        {stat.value}
                      </Typography>
                      <Typography sx={{ fontSize: "0.6rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", mt: 0.75 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>

              </Box>
            </Box>
          )}

          {error && cases.length === 0 && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* KPI stat cards */}
          {stats && (
            <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
              <StatCard icon={<ReceiptLongIcon fontSize="inherit" />} label="Avg Events / Case" value={stats.avgEventsPerCase ? Math.round(stats.avgEventsPerCase) : "—"} accentClass="stat-accent-blue"  iconColor="#F97316" />
              <StatCard icon={<GroupsIcon fontSize="inherit" />}       label="Largest Cluster"   value={stats.largestClusterOverall || "—"}                                  accentClass="stat-accent-amber" iconColor="#FFB300" />
              <StatCard icon={<GppBadIcon fontSize="inherit" />}       label="High Risk (60+)"   value={stats.highRiskCount ?? "—"}                                          accentClass="stat-accent-red"   iconColor="#E53935" />
              <StatCard icon={<WarningAmberIcon fontSize="inherit" />} label="Total Cases"        value={cases.length}                                                        accentClass="stat-accent-blue"  iconColor="#FB923C" />
            </Stack>
          )}

          {/* Filter bar */}
          {batchId && (
            <Box sx={{
              bgcolor: "#0D0E14",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px",
              p: "16px 20px", mb: 2,
            }}>
              <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
                <Button
                  variant={isSimulating ? "outlined" : "contained"}
                  color={isSimulating ? "error" : "primary"}
                  size="medium"
                  startIcon={isSimulating ? <StopIcon /> : <PlayArrowIcon />}
                  onClick={handleSimulation}
                  className={isSimulating ? "pulse-red" : ""}
                  sx={{ fontWeight: 700, px: 2.5, fontSize: "0.82rem" }}
                >
                  {isSimulating ? "Stop Demo" : "Start Live Demo"}
                </Button>

                <Box sx={{ width: "1px", height: 32, bgcolor: "rgba(255,255,255,0.06)" }} />

                <Box sx={{ flex: "1 1 200px", minWidth: 180 }}>
                  <SectionLabel sx={{ mb: 0.75 }}>
                    Min Score:{" "}
                    <Box component="span" sx={{ fontFamily: "'JetBrains Mono', monospace", color: "#F97316" }}>
                      {minScore}
                    </Box>
                  </SectionLabel>
                  <Slider value={minScore} onChange={(_, v) => setMinScore(v)} min={0} max={100} step={5} valueLabelDisplay="auto" sx={{ py: 0.5 }} />
                </Box>

                <TextField label="Max cases" type="number" size="small" value={maxK} onChange={(e) => setMaxK(Number(e.target.value) || 50)} sx={{ width: 110, "& .MuiInputLabel-root": { fontSize: "0.75rem" } }} />

                <Box>
                  <SectionLabel sx={{ mb: 0.75 }}>Sort by</SectionLabel>
                  <ToggleButtonGroup value={sortBy} exclusive onChange={(_, v) => v && setSortBy(v)} size="small">
                    <ToggleButton value="score">Score</ToggleButton>
                    <ToggleButton value="priority">Priority</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Button variant="contained" startIcon={<FilterListIcon />} onClick={handleFilter} sx={{ fontWeight: 600, px: 2.5, fontSize: "0.8rem" }}>Apply</Button>
                <Button component="label" variant="outlined" startIcon={<AddIcon />} sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                  New Upload
                  <input type="file" accept=".csv" hidden onChange={handleUpload} />
                </Button>
              </Stack>

              {isSimulating && (
                <Box sx={{ mt: 2.5 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600 }}>Processing in real-time…</Typography>
                    <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#F97316" }}>{Math.round(simulationProgress)}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={simulationProgress} sx={{ height: 3, "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #F97316, #FB923C)" } }} />
                </Box>
              )}
            </Box>
          )}

          {/* Cases table */}
          {cases.length > 0 && (
            <Stack direction="row" spacing={2.5}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TableContainer component={Paper} sx={{ bgcolor: "#0D0E14", maxHeight: 640, border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px" }}>
                  <Table size="small" stickyHeader className="cases-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Case ID</TableCell>
                        <TableCell align="center">Score</TableCell>
                        <TableCell align="center">Priority</TableCell>
                        <TableCell align="center">Cluster</TableCell>
                        <TableCell align="center">Links</TableCell>
                        <TableCell>Typologies</TableCell>
                        <TableCell>Top Reason</TableCell>
                        <TableCell align="center">Label</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cases.map((c, idx) => {
                        const sev = c.fraudClassification?.severity;
                        const ps  = priorityStyle(sev);
                        return (
                          <TableRow
                            key={c.case_id}
                            className={rowAccentClass(c.score)}
                            onClick={() => navigate(`/case/${c.case_id}?batchId=${batchId}`)}
                            sx={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                          >
                            <TableCell>
                              <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 600, color: "#FB923C" }}>
                                {c.case_id.replace("case_cluster_", "C-")}
                              </Typography>
                            </TableCell>

                            <TableCell align="center"><ScoreBadge score={c.score} /></TableCell>

                            <TableCell align="center">
                              {sev ? (
                                <Box sx={{ display: "inline-flex", alignItems: "center", px: "8px", py: "2px", borderLeft: `3px solid ${ps.border}`, bgcolor: `${ps.border}12`, borderRadius: "0 4px 4px 0" }}>
                                  <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: ps.color }}>{sev}</Typography>
                                </Box>
                              ) : <Typography sx={{ color: "#2d3f60", fontSize: "0.7rem" }}>—</Typography>}
                            </TableCell>

                            <TableCell align="center">
                              <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", color: "#94A3B8" }}>{c.cluster_size}</Typography>
                            </TableCell>

                            <TableCell align="center">
                              <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 22, bgcolor: c.linkStrength > 0 ? "rgba(249,115,22,0.12)" : "transparent", border: `1px solid ${c.linkStrength > 0 ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: "4px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700, color: c.linkStrength > 0 ? "#FB923C" : "#2d3f60" }}>
                                {c.linkStrength || 0}
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                                {(c.typologyTags || []).slice(0, 2).map((t) => <TypologyTag key={t} label={t} />)}
                                {(c.typologyTags || []).length > 2 && (
                                  <Box sx={{ display: "inline-flex", alignItems: "center", px: "6px", py: "2px", bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", fontSize: "0.62rem", fontWeight: 600, color: "#64748b" }}>
                                    +{c.typologyTags.length - 2}
                                  </Box>
                                )}
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <Typography noWrap sx={{ maxWidth: 260, fontSize: "0.76rem", color: "#64748b" }}>{c.reasons?.[0] || "—"}</Typography>
                            </TableCell>

                            <TableCell align="center">
                              {c.feedback ? (
                                <Box sx={{ display: "inline-flex", px: "8px", py: "2px", borderRadius: "4px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.64rem", fontWeight: 700, bgcolor: c.feedback === "TP" ? "rgba(229,57,53,0.12)" : "rgba(0,200,83,0.12)", border: `1px solid ${c.feedback === "TP" ? "rgba(229,57,53,0.3)" : "rgba(0,200,83,0.3)"}`, color: c.feedback === "TP" ? "#EF5350" : "#69F0AE" }}>
                                  {c.feedback}
                                </Box>
                              ) : <Typography sx={{ color: "#2d3f60", fontSize: "0.68rem" }}>—</Typography>}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Live activity sidebar */}
              {recentActivity.length > 0 && (
                <Box sx={{ width: 300, flexShrink: 0, bgcolor: "#0D0E14", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", maxHeight: 640, overflow: "auto" }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ p: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <Badge badgeContent={recentActivity.length} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem" } }}>
                      <NotificationsActiveIcon sx={{ fontSize: 16, color: "#E53935" }} />
                    </Badge>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#F1F5F9" }}>Live Activity</Typography>
                  </Stack>
                  <List dense disablePadding>
                    {recentActivity.map((activity, idx) => (
                      <Box key={idx}>
                        <ListItem sx={{ px: 2, py: 1.5, animation: idx === 0 ? "rowFadeIn 0.25s ease-out" : "none" }}>
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: 600, color: "#FB923C" }}>
                                  {activity.caseId.replace("case_cluster_", "C-")}
                                </Typography>
                                <ScoreBadge score={activity.score} />
                              </Stack>
                            }
                            secondary={
                              <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                                <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>{activity.action}</Typography>
                                <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", color: "#2d3f60" }}>{activity.time}</Typography>
                              </Stack>
                            }
                          />
                        </ListItem>
                        {idx < recentActivity.length - 1 && <Divider sx={{ mx: 2 }} />}
                      </Box>
                    ))}
                  </List>
                </Box>
              )}
            </Stack>
          )}

          {loading && batchId && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={32} sx={{ color: "#F97316" }} />
            </Box>
          )}

          <Snackbar open={!!notification} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
            <Alert severity={notification?.severity || "info"} variant="filled" sx={{ minWidth: 340, fontWeight: 600, fontSize: "0.85rem", borderRadius: "6px" }}>
              {notification?.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
}
