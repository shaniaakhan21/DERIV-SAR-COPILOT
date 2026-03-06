import { useState, useEffect } from "react";
import {
  Box, Typography, Alert, Stack, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, LinearProgress, Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon  from "@mui/icons-material/ExpandMore";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ScienceIcon     from "@mui/icons-material/Science";
import TrendingUpIcon  from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { SectionLabel } from "../components/ui";

export default function UnsupervisedDiscovery({ batchId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!batchId) { setLoading(false); return; }
    const BASE = import.meta.env.VITE_API_BASE_URL || "https://deriv-sar-copilot.onrender.com";
    fetch(`${BASE}/unsupervised/${batchId}`)
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch unsupervised discovery data"); return res.json(); })
      .then((data) => { setSummary(data); setError(null); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (!batchId)  return <Alert severity="info" sx={{ mt: 2 }}>Upload a CSV file to see unsupervised discovery results</Alert>;
  if (loading)   return <Box sx={{ mt: 2 }}><LinearProgress /></Box>;
  if (error)     return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  if (!summary || !summary.clusters || summary.clusters.length === 0)
    return <Alert severity="info" sx={{ mt: 2 }}>No unsupervised discovery data available for this batch</Alert>;

  const totalClusters = summary.clusters.length;
  const totalNoise    = summary.noise_count || 0;
  const rareClusters  = summary.clusters.filter((c) => c.size <= 2).length;

  return (
    <Box sx={{ mt: 3, animation: "fadeSlideUp 0.22s ease-out" }}>

      {/* Page header */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <ScienceIcon sx={{ color: "#7C3AED", fontSize: 22 }} />
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
          Unsupervised Discovery
        </Typography>
      </Stack>

      {/* ── Stat cards ── */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
        <StatCard icon={<AutoAwesomeIcon />} value={totalClusters} label="Discovered Clusters" color="#7C3AED" />
        <StatCard icon={<TrendingUpIcon />}  value={rareClusters}  label="Rare Patterns"       color="#FFB300" />
        <StatCard icon={<ScienceIcon />}     value={totalNoise}    label="Outliers (Noise)"    color="#F97316" />
      </Stack>

      {/* ── DBSCAN params — code block ── */}
      <Box sx={{ mb: 3 }}>
        <SectionLabel sx={{ mb: 1 }}>DBSCAN Parameters</SectionLabel>
        <Box className="code-block">
          <Box component="span" className="key">eps</Box>
          {" = "}
          <Box component="span" className="value">{summary.eps}</Box>
          {"   "}
          <Box component="span" className="comment">{"// cluster radius — higher = larger clusters"}</Box>
          {"\n"}
          <Box component="span" className="key">minPts</Box>
          {" = "}
          <Box component="span" className="value">{summary.minPts}</Box>
          {"  "}
          <Box component="span" className="comment">{"// min density threshold"}</Box>
        </Box>
      </Box>

      {/* ── What this means — callout ── */}
      <Box className="callout-purple" sx={{ mb: 3, borderRadius: "0 6px 6px 0" }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <AutoAwesomeIcon sx={{ color: "#7C3AED", fontSize: 18, mt: 0.25, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#F1F5F9", mb: 0.75 }}>
              What This Means
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8", lineHeight: 1.65, mb: 0.75 }}>
              The system used <Box component="span" sx={{ color: "#A78BFA", fontWeight: 600 }}>unsupervised learning (DBSCAN)</Box> to automatically discover fraud patterns without being told what to look for. It analyzed 10 behavioral features per case and grouped similar cases into clusters.
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8", lineHeight: 1.65 }}>
              <Box component="span" sx={{ color: "#A78BFA", fontWeight: 600 }}>Novel patterns</Box> (rare clusters + outliers) represent emerging fraud types that traditional rule-based systems would miss. These require enhanced investigation.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ── Discovered clusters ── */}
      <SectionLabel sx={{ mb: 1.5 }}>Discovered Clusters</SectionLabel>

      {summary.clusters.map((cluster, idx) => (
        <Accordion key={idx} defaultExpanded={idx === 0} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 16, color: "#475569" }} />}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
              {/* Cluster label */}
              <Box
                sx={{
                  px: "10px", py: "3px",
                  bgcolor: cluster.size <= 2 ? "rgba(255,179,0,0.1)" : "rgba(249,115,22,0.1)",
                  border:  `1px solid ${cluster.size <= 2 ? "rgba(255,179,0,0.3)" : "rgba(249,115,22,0.3)"}`,
                  borderRadius: "4px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: cluster.size <= 2 ? "#FFD54F" : "#FB923C",
                }}
              >
                {cluster.discovered_cluster}
              </Box>
              <Typography sx={{ fontSize: "0.76rem", color: "#64748b" }}>{cluster.size} cases</Typography>
              {cluster.size <= 2 && (
                <Box sx={{ px: "8px", py: "2px", bgcolor: "rgba(229,57,53,0.1)", border: "1px solid rgba(229,57,53,0.25)", borderRadius: "4px" }}>
                  <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#EF5350", textTransform: "uppercase", letterSpacing: "0.07em" }}>RARE / NOVEL</Typography>
                </Box>
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <Stack spacing={2}>
              {/* Z-score table */}
              <Box>
                <SectionLabel sx={{ mb: 1 }}>Top Distinguishing Features (Z-scores)</SectionLabel>
                <TableContainer sx={{ bgcolor: "#0d1220", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "5px" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Feature</TableCell>
                        <TableCell align="right">Z-Score</TableCell>
                        <TableCell>Interpretation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cluster.top_features.map((feat, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Box sx={{ display: "inline-flex", px: "7px", py: "2px", bgcolor: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)", borderRadius: "3px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", color: "#FB923C" }}>
                              {feat.feature.replace(/_/g, " ")}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", fontWeight: 700, color: feat.z > 0 ? "#FB923C" : "#EF5350" }}>
                              {feat.z > 0 ? "+" : ""}{feat.z}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>
                              {getFeatureInterpretation(feat.feature, feat.z)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Sample cases */}
              <Box>
                <SectionLabel sx={{ mb: 1 }}>Sample Cases</SectionLabel>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {cluster.sample_cases.map((caseId) => (
                    <Box key={caseId} sx={{ px: "8px", py: "3px", bgcolor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", color: "#94A3B8" }}>
                      {caseId.replace("case_cluster_", "C-")}
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Rare pattern warning */}
              {cluster.size <= 2 && (
                <Box className="callout-amber" sx={{ borderRadius: "0 5px 5px 0" }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <WarningAmberIcon sx={{ fontSize: 16, color: "#FFB300", flexShrink: 0, mt: 0.1 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#FFD54F", mb: 0.5 }}>Rare Pattern Alert</Typography>
                      <Typography sx={{ fontSize: "0.74rem", color: "#94A3B8", lineHeight: 1.55 }}>
                        This cluster contains only {cluster.size} case(s). Cases exhibit unique behavioral signatures not commonly seen in the dataset. Recommend enhanced investigation to determine if this represents a new fraud technique.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* ── Outliers section ── */}
      {totalNoise > 0 && (
        <Box className="callout-red" sx={{ mt: 3, borderRadius: "0 6px 6px 0" }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <ScienceIcon sx={{ color: "#E53935", fontSize: 18, flexShrink: 0, mt: 0.25 }} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#EF5350", mb: 0.75 }}>
                Outliers — {totalNoise} Noise Points
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8", lineHeight: 1.6, mb: 1 }}>
                These cases don't fit into any dense cluster. They often represent the most interesting patterns:
              </Typography>
              <Stack spacing={0.5}>
                {["Completely unique fraud patterns (highest priority)", "Data anomalies or errors", "Legitimate edge cases"].map((t, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#E53935", flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.76rem", color: "#94A3B8" }}>{t}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

/* ── Stat card ── */
function StatCard({ icon, value, label, color }) {
  return (
    <Box sx={{ flex: 1, minWidth: 180, bgcolor: "#111827", border: `1px solid ${color}25`, borderLeft: `3px solid ${color}`, borderRadius: "6px", p: "18px 20px", display: "flex", alignItems: "center", gap: 2, transition: "transform 0.18s", "&:hover": { transform: "translateY(-2px)" } }}>
      <Box sx={{ color, display: "flex", opacity: 0.8, fontSize: 28 }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.6rem", fontWeight: 800, color, lineHeight: 1, mb: 0.5 }}>{value}</Typography>
        <Typography sx={{ fontSize: "0.66rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#475569" }}>{label}</Typography>
      </Box>
    </Box>
  );
}

/* ── Feature interpretation ── */
function getFeatureInterpretation(feature, zScore) {
  const absZ      = Math.abs(zScore);
  const direction = zScore > 0 ? "Higher" : "Lower";
  const map = {
    log_deposit:       `${direction} deposit amounts than avg`,
    log_withdraw:      `${direction} withdrawal amounts than avg`,
    withdraw_ratio:    `${direction} withdrawal-to-deposit ratio`,
    events_per_min:    `${direction} transaction velocity`,
    rapid_cycle_min:   `${direction === "Higher" ? "Slower" : "Faster"} deposit-withdraw cycles`,
    tiny_profit_cycle: `${direction === "Higher" ? "More" : "Less"} tiny-profit cycling`,
    in_out_close:      `${direction === "Higher" ? "More" : "Less"} pass-through behavior`,
    link_strength:     `${direction} network connectivity`,
    cluster_size:      `${direction} account cluster sizes`,
    behavior_anom:     `${direction} behavioral anomaly scores`,
  };
  const base = map[feature] || feature;
  if (absZ > 2) return `${base} (very distinctive)`;
  if (absZ > 1) return `${base} (distinctive)`;
  return `${base} (moderate)`;
}
