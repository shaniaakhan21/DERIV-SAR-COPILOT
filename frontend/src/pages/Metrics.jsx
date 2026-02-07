import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Stack,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InsightsIcon from "@mui/icons-material/Insights";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import BlockIcon from "@mui/icons-material/Block";
import ScienceIcon from "@mui/icons-material/Science";
import SchoolIcon from "@mui/icons-material/School";

export default function Metrics({ batchId }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!batchId) {
      return;
    }

    const BASE = import.meta.env.VITE_API_BASE_URL || "https://deriv-sar-copilot.onrender.com";
    fetch(`${BASE}/metrics?batchId=${batchId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch metrics");
        return res.json();
      })
      .then((data) => {
        setMetrics(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [batchId]);

  if (!batchId) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Upload a CSV file to see performance metrics
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!metrics) return null;

  const ar = metrics.alert_reduction || {};
  const fl = metrics.feedback_learning || {};
  const td = metrics.typology_detection || {};
  const na = metrics.network_analysis || {};
  const iv = metrics.intervention || {};
  const ud = metrics.unsupervised_discovery || {};

  return (
    <Box sx={{ mt: 2 }}>
      {/* ── Top KPI Strip ── */}
      <Paper
        elevation={0}
        sx={{
          px: 2.5,
          py: 2,
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <TrendingDownIcon
            sx={{ fontSize: 18, color: "text.secondary" }}
          />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", fontSize: "0.7rem", color: "text.secondary" }}
          >
            Alert Reduction
          </Typography>
          {ar.target_achieved && (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
              label="Target Met"
              color="success"
              size="small"
              sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22, ml: "auto !important" }}
            />
          )}
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 3 }}>
            <KpiValue value={ar.total_events?.toLocaleString() || "0"} label="Events" color="text.primary" />
          </Grid>
          <Grid size={{ xs: 3 }}>
            <KpiValue value={ar.total_cases?.toLocaleString() || "0"} label="Cases" color="primary.main" />
          </Grid>
          <Grid size={{ xs: 3 }}>
            <KpiValue value={ar.high_confidence || 0} label="High Risk" color="error.main" />
          </Grid>
          <Grid size={{ xs: 3 }}>
            <KpiValue value={ar.reduction_rate || "N/A"} label="Reduction" color="success.main" />
          </Grid>
        </Grid>
      </Paper>

      {/* ── Main Grid: 2 rows x 3 cols ── */}
      <Grid container spacing={2}>

        {/* AI Learning */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            icon={<SchoolIcon sx={{ fontSize: 16 }} />}
            title="AI Learning"
            iconBg="secondary.main"
          >
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Typography variant="body2" color="text.secondary">Labeled</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                  {fl.labeled_cases || 0}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Precision</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "success.main" }}>
                  {fl.precision || "N/A"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={fl.learning_active ? "Active" : `Need ${Math.max(0, 10 - (fl.labeled_cases || 0))} more`}
                  size="small"
                  color={fl.learning_active ? "success" : "default"}
                  sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22 }}
                />
              </Box>
            </Stack>
          </MetricCard>
        </Grid>

        {/* Fraud Patterns / Typologies */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            icon={<InsightsIcon sx={{ fontSize: 16 }} />}
            title="Fraud Patterns"
            iconBg="warning.main"
            badge={td.unique_typologies || 0}
          >
            {td.distribution && Object.keys(td.distribution).length > 0 ? (
              <Stack spacing={0.75}>
                {Object.entries(td.distribution)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([tag, count]) => (
                    <Box
                      key={tag}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 0.5,
                        px: 1,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        fontSize: "0.75rem",
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {tag.replace(/_/g, " ")}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "warning.dark" }}>
                        {count}
                      </Typography>
                    </Box>
                  ))}
              </Stack>
            ) : (
              <Typography variant="caption" color="text.disabled">
                No patterns detected
              </Typography>
            )}
          </MetricCard>
        </Grid>

        {/* Real-Time Intervention */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            icon={<BlockIcon sx={{ fontSize: 16 }} />}
            title="Intervention"
            iconBg="error.main"
          >
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Typography variant="body2" color="text.secondary">Blocked</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "error.main", lineHeight: 1 }}>
                  {iv.would_block_count || 0}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Rate</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "error.main" }}>
                  {iv.intervention_rate || "0%"}
                </Typography>
              </Box>
              <Divider />
              <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.3 }}>
                Suspicious withdrawals auto-flagged before funds leave
              </Typography>
            </Stack>
          </MetricCard>
        </Grid>

        {/* Network Analysis */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            icon={<NetworkCheckIcon sx={{ fontSize: 16 }} />}
            title="Network"
            iconBg="primary.main"
          >
            <Stack spacing={1}>
              <MetricRow label="Clustered" value={na.clustered_cases || 0} />
              <MetricRow label="Avg Size" value={na.avg_cluster_size || "1.0"} />
              <MetricRow
                label="Largest"
                value={na.largest_cluster || 1}
                highlight={na.largest_cluster > 5}
              />
              <MetricRow label="Max Links" value={na.max_link_strength || 0} />
            </Stack>
          </MetricCard>
        </Grid>

        {/* Novel Patterns */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            icon={<ScienceIcon sx={{ fontSize: 16 }} />}
            title="Unsupervised Discovery"
            iconBg="secondary.main"
          >
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Typography variant="body2" color="text.secondary">Novel Cases</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "secondary.main", lineHeight: 1 }}>
                  {ud.novel_patterns || 0}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Clusters Found</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {ud.discovered_clusters || 0}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">Novelty Rate</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "secondary.main" }}>
                  {ud.novelty_rate || "0%"}
                </Typography>
              </Box>
            </Stack>
          </MetricCard>
        </Grid>

        {/* Confidence Breakdown */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            title="Confidence Split"
            iconBg="info.main"
          >
            <Stack spacing={1}>
              <ConfidenceBar label="High (≥60)" count={ar.high_confidence || 0} total={ar.total_cases || 1} color="error.main" />
              <ConfidenceBar label="Medium (40-59)" count={ar.medium_confidence || 0} total={ar.total_cases || 1} color="warning.main" />
              <ConfidenceBar label="Low (<40)" count={ar.low_confidence || 0} total={ar.total_cases || 1} color="success.main" />
            </Stack>
          </MetricCard>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ── Reusable Components ── */

function KpiValue({ value, label, color }) {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color, lineHeight: 1, mb: 0.25 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
}

function MetricCard({ icon, title, iconBg, badge, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Box
          sx={{
            bgcolor: iconBg,
            color: "white",
            borderRadius: 1,
            p: 0.5,
            display: "flex",
            lineHeight: 0,
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.8rem" }}>
          {title}
        </Typography>
        {badge != null && (
          <Chip
            label={badge}
            size="small"
            sx={{ fontWeight: 700, fontSize: "0.7rem", height: 20, minWidth: 28, ml: "auto !important" }}
          />
        )}
      </Stack>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Paper>
  );
}

function MetricRow({ label, value, highlight }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.5,
        px: 1,
        bgcolor: highlight ? "warning.50" : "grey.50",
        borderRadius: 1,
        ...(highlight && { border: "1px solid", borderColor: "warning.200" }),
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, color: highlight ? "warning.dark" : "text.primary" }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function ConfidenceBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: "0.7rem" }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.7rem" }}>
          {count}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: "grey.100",
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
        }}
      />
    </Box>
  );
}
