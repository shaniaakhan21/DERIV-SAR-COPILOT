import { useState, useEffect } from "react";
import { Box, Typography, Grid, LinearProgress, Chip, Stack, Alert, Paper, Divider } from "@mui/material";
import TrendingDownIcon  from "@mui/icons-material/TrendingDown";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";
import InsightsIcon      from "@mui/icons-material/Insights";
import NetworkCheckIcon  from "@mui/icons-material/NetworkCheck";
import BlockIcon         from "@mui/icons-material/Block";
import ScienceIcon       from "@mui/icons-material/Science";
import SchoolIcon        from "@mui/icons-material/School";
import ArrowForwardIcon  from "@mui/icons-material/ArrowForward";

import { SectionLabel } from "../components/ui";

export default function Metrics({ batchId }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!batchId) return;
    const BASE = import.meta.env.VITE_API_BASE_URL || "https://deriv-sar-copilot.onrender.com";
    fetch(`${BASE}/metrics?batchId=${batchId}`)
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch metrics"); return res.json(); })
      .then((data) => { setMetrics(data); setError(null); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [batchId]);

  if (!batchId)  return <Alert severity="info" sx={{ mt: 2 }}>Upload a CSV file to see performance metrics</Alert>;
  if (loading)   return <Box sx={{ mt: 2 }}><LinearProgress /></Box>;
  if (error)     return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  if (!metrics)  return null;

  const ar = metrics.alert_reduction    || {};
  const fl = metrics.feedback_learning  || {};
  const td = metrics.typology_detection || {};
  const na = metrics.network_analysis   || {};
  const iv = metrics.intervention       || {};
  const ud = metrics.unsupervised_discovery || {};

  /* Pipeline numbers */
  const pipelineSteps = [
    { label: ar.total_events?.toLocaleString() || "0", sub: "Events",    color: "#94A3B8" },
    { label: ar.total_cases?.toLocaleString()  || "0", sub: "Cases",     color: "#F97316" },
    { label: ar.high_confidence || 0,                   sub: "High Risk", color: "#E53935" },
    { label: ar.reduction_rate || "N/A",                sub: "Reduction", color: "#00C853" },
  ];

  return (
    <Box sx={{ mt: 2, animation: "fadeSlideUp 0.22s ease-out" }}>

      {/* ── Pipeline hero ── */}
      <Box sx={{ bgcolor: "#0d1220", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", p: "20px 28px", mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
          <TrendingDownIcon sx={{ fontSize: 15, color: "#64748b" }} />
          <SectionLabel>Alert Reduction Pipeline</SectionLabel>
          {ar.target_achieved && (
            <Box sx={{ ml: "auto !important", px: "10px", py: "3px", bgcolor: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.3)", borderRadius: "4px", display: "flex", alignItems: "center", gap: 0.75 }}>
              <CheckCircleIcon sx={{ fontSize: 11, color: "#00C853" }} />
              <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: "#69F0AE", letterSpacing: "0.06em", textTransform: "uppercase" }}>Target Met</Typography>
            </Box>
          )}
        </Stack>

        {/* Pipeline steps */}
        <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
          {pipelineSteps.map((step, i) => (
            <Stack key={i} direction="row" alignItems="center" spacing={1}>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: { xs: "1.4rem", md: "2rem" }, fontWeight: 800, color: step.color, lineHeight: 1, animation: "countUp 0.4s ease-out both", animationDelay: `${i * 80}ms` }}>
                  {step.label}
                </Typography>
                <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#475569", mt: 0.25 }}>{step.sub}</Typography>
              </Box>
              {i < pipelineSteps.length - 1 && (
                <ArrowForwardIcon sx={{ fontSize: 16, color: "#2d3f60", flexShrink: 0 }} />
              )}
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* ── Metric cards grid ── */}
      <Grid container spacing={2}>

        {/* AI Learning */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard icon={<SchoolIcon sx={{ fontSize: 14 }} />} title="AI Learning" accentColor="#7C3AED">
            <Stack spacing={1.5}>
              <MetricRow label="Labeled" value={fl.labeled_cases || 0} mono />
              <MetricRow label="Precision" value={fl.precision || "N/A"} valueColor="#69F0AE" />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Status</Typography>
                <Box sx={{ px: "8px", py: "2px", borderRadius: "4px", bgcolor: fl.learning_active ? "rgba(0,200,83,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${fl.learning_active ? "rgba(0,200,83,0.3)" : "rgba(255,255,255,0.08)"}` }}>
                  <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: fl.learning_active ? "#69F0AE" : "#64748b" }}>
                    {fl.learning_active ? "Active" : `Need ${Math.max(0, 10 - (fl.labeled_cases || 0))} more`}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </MetricCard>
        </Grid>

        {/* Fraud Patterns */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard icon={<InsightsIcon sx={{ fontSize: 14 }} />} title="Fraud Patterns" accentColor="#FFB300" badge={td.unique_typologies || 0}>
            {td.distribution && Object.keys(td.distribution).length > 0 ? (
              <Stack spacing={0.75}>
                {Object.entries(td.distribution).sort((a,b) => b[1]-a[1]).slice(0,5).map(([tag, count]) => {
                  const maxCount = Math.max(...Object.values(td.distribution));
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <Box key={tag}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{tag.replace(/_/g, " ")}</Typography>
                        <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700, color: "#FFB300" }}>{count}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={pct} sx={{ height: 3, borderRadius: 2, "& .MuiLinearProgress-bar": { bgcolor: "#FFB300" } }} />
                    </Box>
                  );
                })}
              </Stack>
            ) : <Typography sx={{ fontSize: "0.75rem", color: "#475569" }}>No patterns detected</Typography>}
          </MetricCard>
        </Grid>

        {/* Intervention */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard icon={<BlockIcon sx={{ fontSize: 14 }} />} title="Intervention" accentColor="#E53935">
            <Stack spacing={1.5}>
              <Box sx={{ textAlign: "center", py: 1 }}>
                <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "2rem", fontWeight: 800, color: "#E53935", lineHeight: 1 }}>{iv.would_block_count || 0}</Typography>
                <Typography sx={{ fontSize: "0.62rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", mt: 0.5 }}>Withdrawals Blocked</Typography>
              </Box>
              <MetricRow label="Rate" value={iv.intervention_rate || "0%"} valueColor="#EF5350" />
              <Typography sx={{ fontSize: "0.7rem", color: "#475569", lineHeight: 1.4 }}>Suspicious withdrawals auto-flagged before funds leave</Typography>
            </Stack>
          </MetricCard>
        </Grid>

        {/* Network */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard icon={<NetworkCheckIcon sx={{ fontSize: 14 }} />} title="Network Analysis" accentColor="#F97316">
            <Stack spacing={0.75}>
              <MetricRow label="Clustered Cases" value={na.clustered_cases || 0} mono />
              <MetricRow label="Avg Cluster Size" value={na.avg_cluster_size || "1.0"} mono />
              <MetricRow label="Largest Ring"     value={na.largest_cluster || 1} highlight={na.largest_cluster > 5} mono />
              <MetricRow label="Max Link Types"   value={na.max_link_strength || 0} mono />
            </Stack>
          </MetricCard>
        </Grid>

        {/* Unsupervised */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard icon={<ScienceIcon sx={{ fontSize: 14 }} />} title="Unsupervised Discovery" accentColor="#7C3AED">
            <Stack spacing={1.5}>
              <Box sx={{ textAlign: "center", py: 1 }}>
                <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.9rem", fontWeight: 800, color: "#A78BFA", lineHeight: 1 }}>{ud.novelty_rate || "0%"}</Typography>
                <Typography sx={{ fontSize: "0.62rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", mt: 0.5 }}>Novelty Rate</Typography>
              </Box>
              <MetricRow label="Novel Cases"       value={ud.novel_patterns || 0} valueColor="#A78BFA" />
              <MetricRow label="Clusters Found"    value={ud.discovered_clusters || 0} mono />
            </Stack>
          </MetricCard>
        </Grid>

        {/* Confidence split */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} title="Confidence Split" accentColor="#F97316">
            <Stack spacing={1.25}>
              <ConfidenceBar label="High (≥60)"    count={ar.high_confidence || 0}  total={ar.total_cases || 1} color="#E53935" />
              <ConfidenceBar label="Medium (40-59)" count={ar.medium_confidence || 0} total={ar.total_cases || 1} color="#FFB300" />
              <ConfidenceBar label="Low (<40)"      count={ar.low_confidence || 0}   total={ar.total_cases || 1} color="#00C853" />
            </Stack>
          </MetricCard>
        </Grid>

      </Grid>
    </Box>
  );
}

/* ── Sub-components ── */

function MetricCard({ icon, title, accentColor, badge, children }) {
  return (
    <Box sx={{ height: "100%", bgcolor: "#111827", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${accentColor}`, borderRadius: "6px", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Box sx={{ color: accentColor, display: "flex", opacity: 0.85 }}>{icon}</Box>
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#64748b", flex: 1 }}>{title}</Typography>
        {badge != null && (
          <Box sx={{ px: "6px", py: "1px", bgcolor: `${accentColor}15`, border: `1px solid ${accentColor}30`, borderRadius: "3px" }}>
            <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", fontWeight: 700, color: accentColor }}>{badge}</Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
  );
}

function MetricRow({ label, value, highlight, valueColor, mono }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "6px", px: "8px", bgcolor: highlight ? "rgba(255,179,0,0.06)" : "rgba(255,255,255,0.02)", borderRadius: "4px", border: highlight ? "1px solid rgba(255,179,0,0.18)" : "1px solid transparent" }}>
      <Typography sx={{ fontSize: "0.73rem", color: "#64748b" }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: valueColor || (highlight ? "#FFD54F" : "#F1F5F9"), ...(mono && { fontFamily: "'JetBrains Mono', monospace" }) }}>
        {value}
      </Typography>
    </Box>
  );
}

function ConfidenceBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{label}</Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", fontWeight: 700, color }}>{count}</Typography>
          <Typography sx={{ fontSize: "0.62rem", color: "#475569" }}>{pct}%</Typography>
        </Stack>
      </Box>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 4, borderRadius: 2, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 2 } }} />
    </Box>
  );
}
