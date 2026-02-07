import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ScienceIcon from "@mui/icons-material/Science";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function UnsupervisedDiscovery({ batchId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!batchId) {
      setLoading(false);
      return;
    }

    const BASE = import.meta.env.VITE_API_BASE_URL || "https://deriv-sar-copilot.onrender.com/";
    fetch(`${BASE}/unsupervised/${batchId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch unsupervised discovery data");
        return res.json();
      })
      .then((data) => {
        setSummary(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (!batchId) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Upload a CSV file to see unsupervised discovery results
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

  if (!summary || !summary.clusters || summary.clusters.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No unsupervised discovery data available for this batch
      </Alert>
    );
  }

  const totalClusters = summary.clusters.length;
  const totalNoise = summary.noise_count || 0;
  const rareClusters = summary.clusters.filter(c => c.size <= 2).length;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 700, 
          mb: 4, 
          display: "flex", 
          alignItems: "center", 
          gap: 1.5 
        }}
      >
        <ScienceIcon sx={{ color: "secondary.main", fontSize: 36 }} />
        Unsupervised Discovery Results
      </Typography>

      {/* Overview Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Card 
          sx={{ 
            flex: 1, 
            minWidth: 220,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.12)"
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Box
                sx={{
                  bgcolor: "secondary.50",
                  borderRadius: 2,
                  p: 2,
                  display: "flex"
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 48, color: "secondary.main" }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {totalClusters}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Discovered Clusters
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            flex: 1, 
            minWidth: 220,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.12)"
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Box
                sx={{
                  bgcolor: "warning.50",
                  borderRadius: 2,
                  p: 2,
                  display: "flex"
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 48, color: "warning.main" }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {rareClusters}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Rare Patterns (Novel)
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            flex: 1, 
            minWidth: 220,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.12)"
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Box
                sx={{
                  bgcolor: "info.50",
                  borderRadius: 2,
                  p: 2,
                  display: "flex"
                }}
              >
                <ScienceIcon sx={{ fontSize: 48, color: "info.main" }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {totalNoise}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Outliers (Noise)
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Algorithm Parameters */}
      <Alert 
        severity="info" 
        sx={{ 
          mb: 4,
          fontSize: "0.95rem",
          boxShadow: "0 2px 8px rgba(59,95,204,0.1)"
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          DBSCAN Clustering Parameters
        </Typography>
        <Typography variant="body2">
          Epsilon (eps): <strong>{summary.eps}</strong> | Min Points: <strong>{summary.minPts}</strong> | 
          These parameters control cluster density and sensitivity to outliers.
        </Typography>
      </Alert>

      {/* What This Means */}
      <Card 
        sx={{ 
          mb: 4, 
          bgcolor: "secondary.50",
          border: "2px solid",
          borderColor: "secondary.main",
          boxShadow: "0 4px 12px rgba(124,58,237,0.15)"
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1.5,
              fontWeight: 700,
              mb: 2
            }}
          >
            <AutoAwesomeIcon sx={{ color: "secondary.main", fontSize: 28 }} />
            What This Means
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
            The system used <strong>unsupervised learning (DBSCAN clustering)</strong> to automatically 
            discover fraud patterns in your data <strong>without being told what to look for</strong>.
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
            It analyzed 10 behavioral features per case (deposit amounts, withdrawal ratios, network links, 
            timing patterns, etc.) and grouped similar cases into clusters. Cases that don't fit any 
            cluster are marked as "outliers" — these are often the most interesting!
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
            <strong>Novel patterns</strong> (rare clusters + outliers) represent emerging fraud types 
            that traditional rule-based systems would miss. These require enhanced investigation.
          </Typography>
        </CardContent>
      </Card>

      {/* Discovered Clusters */}
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          mt: 4, 
          mb: 3,
          fontWeight: 700
        }}
      >
        Discovered Clusters
      </Typography>

      {summary.clusters.map((cluster, idx) => (
        <Accordion key={idx} defaultExpanded={idx === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
              <Chip 
                label={cluster.discovered_cluster} 
                color={cluster.size <= 2 ? "warning" : "primary"}
                sx={{ fontWeight: 600 }}
              />
              <Typography variant="body2" color="text.secondary">
                {cluster.size} cases
              </Typography>
              {cluster.size <= 2 && (
                <Chip label="RARE/NOVEL" size="small" color="error" />
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {/* Top Features */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Top Distinguishing Features (Z-scores)
                </Typography>
                <Typography variant="caption" color="text.secondary" paragraph>
                  These features most strongly characterize this cluster. Higher absolute values = more distinctive.
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Feature</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Z-Score</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Interpretation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cluster.top_features.map((feat, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Chip 
                              label={feat.feature.replace(/_/g, " ")} 
                              size="small" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: "monospace",
                                color: Math.abs(feat.z) > 1 ? "error.main" : "text.primary",
                                fontWeight: Math.abs(feat.z) > 1 ? 600 : 400
                              }}
                            >
                              {feat.z > 0 ? "+" : ""}{feat.z}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {getFeatureInterpretation(feat.feature, feat.z)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Sample Cases */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Sample Cases in This Cluster
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {cluster.sample_cases.map((caseId) => (
                    <Chip
                      key={caseId}
                      label={caseId.replace("case_cluster_", "C-")}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Cluster Interpretation */}
              {cluster.size <= 2 && (
                <Alert severity="warning">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ⚠️ Rare Pattern Alert
                  </Typography>
                  <Typography variant="caption">
                    This cluster contains only {cluster.size} case(s), making it a rare/novel pattern. 
                    These cases exhibit unique behavioral signatures not commonly seen in the dataset. 
                    Recommend enhanced investigation to determine if this represents a new fraud technique.
                  </Typography>
                </Alert>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Outliers Section */}
      {totalNoise > 0 && (
        <Card sx={{ mt: 3, bgcolor: "warning.50" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ScienceIcon color="warning" />
              Outliers (Noise Points)
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>{totalNoise} cases</strong> were classified as outliers — they don't fit into any 
              dense cluster. These are marked as <Chip label="NOISE" size="small" color="warning" /> in 
              the case details.
            </Typography>
            <Typography variant="body2">
              Outliers often represent:
            </Typography>
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li><Typography variant="body2">Completely unique fraud patterns (highest priority)</Typography></li>
              <li><Typography variant="body2">Data anomalies or errors</Typography></li>
              <li><Typography variant="body2">Legitimate edge cases</Typography></li>
            </ul>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

function getFeatureInterpretation(feature, zScore) {
  const absZ = Math.abs(zScore);
  const direction = zScore > 0 ? "Higher" : "Lower";
  
  const interpretations = {
    log_deposit: `${direction} deposit amounts than average`,
    log_withdraw: `${direction} withdrawal amounts than average`,
    withdraw_ratio: `${direction} withdrawal-to-deposit ratio`,
    events_per_min: `${direction} transaction velocity`,
    rapid_cycle_min: `${direction === "Higher" ? "Slower" : "Faster"} deposit-withdraw cycles`,
    tiny_profit_cycle: `${direction === "Higher" ? "More" : "Less"} tiny-profit cycling`,
    in_out_close: `${direction === "Higher" ? "More" : "Less"} pass-through behavior`,
    link_strength: `${direction} network connectivity`,
    cluster_size: `${direction} account cluster sizes`,
    behavior_anom: `${direction} behavioral anomaly scores`
  };
  
  const base = interpretations[feature] || feature;
  
  if (absZ > 2) return `${base} (very distinctive)`;
  if (absZ > 1) return `${base} (distinctive)`;
  return `${base} (moderate)`;
}
