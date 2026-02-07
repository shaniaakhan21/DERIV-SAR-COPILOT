import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Button, Chip, Slider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, Stack, LinearProgress, TextField,
  ToggleButtonGroup, ToggleButton, Tabs, Tab, Snackbar, List, ListItem,
  ListItemText, Divider, Badge,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FilterListIcon from "@mui/icons-material/FilterList";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import GroupsIcon from "@mui/icons-material/Groups";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import GppBadIcon from "@mui/icons-material/GppBad";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { uploadFile, getCases } from "../api";
import Metrics from "./Metrics";
import UnsupervisedDiscovery from "./UnsupervisedDiscovery";

function ScoreBadge({ score }) {
  const color = score >= 70 ? "error" : score >= 40 ? "warning" : "success";
  return (
    <Chip
      label={score}
      color={color}
      size="small"
      sx={{ fontWeight: 700, minWidth: 44 }}
    />
  );
}

function KpiCard({ icon, label, value, color = "primary.main" }) {
  return (
    <Card 
      sx={{ 
        flex: 1, 
        minWidth: 180,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.12)"
        }
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2.5, px: 2.5 }}>
        <Box 
          sx={{ 
            color, 
            fontSize: 42, 
            display: "flex",
            bgcolor: `${color}15`,
            borderRadius: 2,
            p: 1.5
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard({ batchId, setBatchId, stats, setStats, cases, setCases }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [minScore, setMinScore] = useState(0);
  const [maxK, setMaxK] = useState(50);
  const [sortBy, setSortBy] = useState("score");
  const [activeTab, setActiveTab] = useState(0);
  const fetchedBatchIdRef = useRef(null); // Track which batchId we've fetched
  
  // Real-time simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notification, setNotification] = useState(null);

  // Auto-fetch cases when mounting with an existing batchId (e.g. navigating back from CaseDetail)
  useEffect(() => {
    if (!batchId) {
      // No batchId - clear everything to show upload screen
      setCases([]);
      setStats(null);
      fetchedBatchIdRef.current = null;
      return;
    }
    
    // Skip if we've already fetched this batchId AND we have cases
    if (fetchedBatchIdRef.current === batchId && cases.length > 0) {
      return;
    }
    
    // Mark this batchId as being fetched
    fetchedBatchIdRef.current = batchId;
    
    // Try to fetch cases with the batchId
    getCases(batchId, { k: 50 })
      .then((result) => {
        setCases(result.topCases || []);
        setError(null); // Clear any previous errors on success
      })
      .catch((err) => {
        // If fetch fails and we have no cases, clear the batchId
        if (cases.length === 0) {
          setBatchId(null);
          setStats(null);
          localStorage.removeItem("batchId");
        }
        setError(err.message);
        fetchedBatchIdRef.current = null; // Allow retry
      });
  }, [batchId, setBatchId, setStats, cases.length]);

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null); // Clear errors before upload
    try {
      const result = await uploadFile(file);
      setBatchId(result.batchId);
      setStats(result.stats);
      const casesResult = await getCases(result.batchId, { k: 50 });
      setCases(casesResult.topCases || []);
      setError(null); // Clear any errors on success
      fetchedBatchIdRef.current = result.batchId; // Mark as fetched
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setBatchId, setStats]);

  const handleFilter = useCallback(async () => {
    if (!batchId) return;
    setLoading(true);
    setError(null); // Clear errors before filtering
    try {
      const result = await getCases(batchId, { k: maxK, minScore, sortBy });
      setCases(result.topCases || []);
      setError(null); // Clear any errors on success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [batchId, maxK, minScore, sortBy]);

  // Real-time simulation handler
  const handleSimulation = useCallback(async () => {
    if (isSimulating) {
      // Stop simulation
      setIsSimulating(false);
      setSimulationProgress(0);
      return;
    }

    // Start simulation
    setIsSimulating(true);
    setSimulationProgress(0);
    setRecentActivity([]);
    
    // Simulate processing transactions over 45 seconds
    const totalSteps = 45;
    const highRiskCases = cases.filter(c => c.score >= 70);
    
    for (let i = 0; i <= totalSteps; i++) {
      if (!isSimulating && i > 0) break; // Allow stopping
      
      setSimulationProgress((i / totalSteps) * 100);
      
      // Show notifications for high-risk cases at intervals
      if (i % 10 === 0 && i > 0 && highRiskCases.length > 0) {
        const caseIndex = Math.floor((i / 10) - 1) % highRiskCases.length;
        const highRiskCase = highRiskCases[caseIndex];
        
        setNotification({
          message: `🚨 High-Risk Alert: ${highRiskCase.case_id.replace("case_cluster_", "C-")} (Score: ${highRiskCase.score})`,
          severity: "error"
        });
        
        // Add to recent activity
        setRecentActivity(prev => [{
          time: new Date().toLocaleTimeString(),
          caseId: highRiskCase.case_id,
          score: highRiskCase.score,
          action: "Flagged for review"
        }, ...prev.slice(0, 4)]);
        
        // Auto-dismiss notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      }
      
      // Add regular activity updates
      if (i % 5 === 0 && i > 0) {
        const randomCase = cases[Math.floor(Math.random() * cases.length)];
        setRecentActivity(prev => [{
          time: new Date().toLocaleTimeString(),
          caseId: randomCase.case_id,
          score: randomCase.score,
          action: randomCase.score >= 70 ? "Blocked withdrawal" : "Processed"
        }, ...prev.slice(0, 4)]);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsSimulating(false);
    setNotification({
      message: "✅ Simulation complete! All transactions processed.",
      severity: "success"
    });
    setTimeout(() => setNotification(null), 3000);
  }, [isSimulating, cases]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsSimulating(false);
    };
  }, []);

  return (
    <Box>
      {/* Tabs */}
      {batchId && (
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderColor: "divider",
            mb: 3,
            bgcolor: "white",
            borderRadius: 2,
            p: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: "0.95rem",
                textTransform: "none",
                minHeight: 48,
                "&.Mui-selected": {
                  color: "primary.main"
                }
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0"
              }
            }}
          >
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
          {/* Upload area */}
      {!batchId && (
        <Card 
          sx={{ 
            mb: 4, 
            textAlign: "center", 
            py: 8,
            background: "linear-gradient(135deg, #3B5FCC15 0%, #7C3AED15 100%)",
            border: "2px dashed",
            borderColor: "primary.main",
            boxShadow: "0 8px 24px rgba(59,95,204,0.12)"
          }}
        >
          <CardContent>
            <Box 
              sx={{ 
                bgcolor: "primary.main",
                color: "white",
                borderRadius: "50%",
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                boxShadow: "0 8px 16px rgba(59,95,204,0.3)"
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
              Upload Transaction Data
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: "auto" }}>
              Upload a CSV file to run AI-powered triage analysis. The system will automatically cluster, score, and rank suspicious cases.
            </Typography>
            <Button 
              component="label" 
              variant="contained" 
              size="large"
              startIcon={<CloudUploadIcon />} 
              disabled={loading}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(59,95,204,0.3)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(59,95,204,0.4)"
                }
              }}
            >
              {loading ? "Processing..." : "Choose File"}
              <input type="file" accept=".csv" hidden onChange={handleUpload} />
            </Button>
            {loading && <LinearProgress sx={{ mt: 3, mx: "auto", maxWidth: 400, height: 6, borderRadius: 3 }} />}
          </CardContent>
        </Card>
      )}

      {error && cases.length === 0 && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPIs */}
      {stats && (
        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
          <KpiCard 
            icon={<ReceiptLongIcon fontSize="inherit" />} 
            label="Avg Events/Case" 
            value={stats.avgEventsPerCase ? `${Math.round(stats.avgEventsPerCase)}` : "—"} 
            color="info.main"
          />
          <KpiCard 
            icon={<GroupsIcon fontSize="inherit" />} 
            label="Largest Cluster" 
            value={stats.largestClusterOverall || "—"} 
            color="warning.main" 
          />
          <KpiCard 
            icon={<GppBadIcon fontSize="inherit" />} 
            label="High Risk (60+)" 
            value={stats.highRiskCount ?? "—"} 
            color="error.main" 
          />
          <KpiCard 
            icon={<WarningAmberIcon fontSize="inherit" />} 
            label="Total Cases" 
            value={cases.length} 
            color="secondary.main" 
          />
        </Stack>
      )}

      {/* Filters + Re-upload */}
      {batchId && (
        <Card 
          sx={{ 
            mb: 3, 
            p: 3,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider"
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            {/* Real-Time Simulation Button */}
            <Button
              variant={isSimulating ? "outlined" : "contained"}
              color={isSimulating ? "error" : "secondary"}
              size="large"
              startIcon={isSimulating ? <StopIcon /> : <PlayArrowIcon />}
              onClick={handleSimulation}
              sx={{
                fontWeight: 700,
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                boxShadow: isSimulating ? "none" : "0 4px 12px rgba(124,58,237,0.3)",
                animation: isSimulating ? "pulse 2s infinite" : "none",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.7 }
                }
              }}
            >
              {isSimulating ? "Stop Demo" : "▶️ Start Live Demo"}
            </Button>

            <Divider orientation="vertical" flexItem />

            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography 
                variant="body2" 
                color="text.primary" 
                gutterBottom
                sx={{ fontWeight: 600, mb: 1 }}
              >
                Min Risk Score: {minScore}
              </Typography>
              <Slider
                value={minScore}
                onChange={(_, v) => setMinScore(v)}
                min={0} max={100} step={5}
                valueLabelDisplay="auto"
                sx={{
                  "& .MuiSlider-thumb": {
                    width: 20,
                    height: 20
                  },
                  "& .MuiSlider-track": {
                    height: 6
                  },
                  "& .MuiSlider-rail": {
                    height: 6
                  }
                }}
              />
            </Box>
            <TextField
              label="Max cases"
              type="number"
              size="small"
              value={maxK}
              onChange={(e) => setMaxK(Number(e.target.value) || 50)}
              sx={{ 
                width: 120,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "white"
                }
              }}
            />
            <Box>
              <Typography 
                variant="body2" 
                color="text.primary" 
                gutterBottom
                sx={{ fontWeight: 600, mb: 1 }}
              >
                Sort by
              </Typography>
              <ToggleButtonGroup
                value={sortBy}
                exclusive
                onChange={(_, v) => v && setSortBy(v)}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    bgcolor: "white",
                    fontWeight: 600,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark"
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="score">
                  Score
                </ToggleButton>
                <ToggleButton value="priority">
                  Priority
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<FilterListIcon />} 
              onClick={handleFilter}
              sx={{ 
                fontWeight: 600,
                px: 3,
                boxShadow: "0 2px 8px rgba(59,95,204,0.25)"
              }}
            >
              Apply Filters
            </Button>
            <Button 
              component="label" 
              variant="outlined" 
              startIcon={<CloudUploadIcon />}
              sx={{ fontWeight: 600 }}
            >
              New Upload
              <input type="file" accept=".csv" hidden onChange={handleUpload} />
            </Button>
          </Stack>

          {/* Simulation Progress */}
          {isSimulating && (
            <Box sx={{ mt: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Processing transactions in real-time...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(simulationProgress)}%
                </Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={simulationProgress}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background: "linear-gradient(90deg, #7C3AED 0%, #3B5FCC 100%)"
                  }
                }}
              />
            </Box>
          )}
        </Card>
      )}

      {/* Cases table */}
      {cases.length > 0 && (
        <Stack direction="row" spacing={3}>
          {/* Main table */}
          <Box sx={{ flex: 1 }}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                bgcolor: "background.paper",
                maxHeight: 650,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>Case ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }} align="center">Score</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }} align="center">Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }} align="center">Cluster</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }} align="center">Links</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>Typologies</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }}>Top Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "grey.50" }} align="center">Label</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cases.map((c) => (
                    <TableRow
                      key={c.case_id}
                      hover
                      sx={{ 
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": { 
                          bgcolor: "primary.50",
                          transform: "scale(1.002)",
                          boxShadow: "0 2px 8px rgba(59,95,204,0.15)"
                        }
                      }}
                      onClick={() => navigate(`/case/${c.case_id}?batchId=${batchId}`)}
                    >
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: "monospace",
                            fontWeight: 600,
                            color: "primary.main"
                          }}
                        >
                          {c.case_id.replace("case_cluster_", "C-")}
                        </Typography>
                      </TableCell>
                      <TableCell align="center"><ScoreBadge score={c.score} /></TableCell>
                      <TableCell align="center">
                        {c.fraudClassification ? (
                          <Chip
                            label={c.fraudClassification.severity.toUpperCase()}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              letterSpacing: "0.03em"
                            }}
                            color={
                              c.fraudClassification.severity === "critical" ? "error" :
                              c.fraudClassification.severity === "high" ? "warning" :
                              c.fraudClassification.severity === "medium" ? "info" : "default"
                            }
                          />
                        ) : (
                          <Chip label="—" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={c.cluster_size} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontWeight: 600, minWidth: 40 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={c.linkStrength || 0} 
                          size="small" 
                          color={c.linkStrength > 0 ? "primary" : "default"}
                          variant={c.linkStrength > 0 ? "filled" : "outlined"}
                          sx={{ fontWeight: 600, minWidth: 40 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {(c.typologyTags || []).slice(0, 3).map((t) => (
                            <Chip 
                              key={t} 
                              label={t.replace(/_/g, " ")} 
                              size="small" 
                              variant="outlined"
                              color="warning"
                              sx={{ fontSize: "0.7rem", fontWeight: 500 }} 
                            />
                          ))}
                          {(c.typologyTags || []).length > 3 && (
                            <Chip 
                              label={`+${c.typologyTags.length - 3}`} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          noWrap 
                          sx={{ 
                            maxWidth: 280,
                            color: "text.secondary",
                            fontSize: "0.85rem"
                          }}
                        >
                          {c.reasons?.[0] || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {c.feedback ? (
                          <Chip
                            label={c.feedback}
                            color={c.feedback === "TP" ? "error" : "success"}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        ) : (
                          <Chip 
                            label="Pending" 
                            size="small" 
                            variant="outlined"
                            sx={{ color: "text.disabled" }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Recent Activity Sidebar */}
          {recentActivity.length > 0 && (
            <Card 
              sx={{ 
                width: 320,
                maxHeight: 650,
                overflow: "auto",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Badge badgeContent={recentActivity.length} color="error">
                    <NotificationsActiveIcon color="primary" />
                  </Badge>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Live Activity
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  {recentActivity.map((activity, idx) => (
                    <Box key={idx}>
                      <ListItem 
                        sx={{ 
                          px: 0,
                          py: 1.5,
                          animation: idx === 0 ? "slideIn 0.3s ease-out" : "none",
                          "@keyframes slideIn": {
                            from: { opacity: 0, transform: "translateX(-20px)" },
                            to: { opacity: 1, transform: "translateX(0)" }
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: "monospace",
                                  fontWeight: 600,
                                  color: "primary.main"
                                }}
                              >
                                {activity.caseId.replace("case_cluster_", "C-")}
                              </Typography>
                              <ScoreBadge score={activity.score} />
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {activity.action}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: "text.disabled",
                                  fontFamily: "monospace"
                                }}
                              >
                                {activity.time}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                      {idx < recentActivity.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {loading && batchId && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Real-time Notification Snackbar */}
      <Snackbar
        open={!!notification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 8 }}
      >
        <Alert 
          severity={notification?.severity || "info"}
          variant="filled"
          sx={{ 
            minWidth: 350,
            fontWeight: 600,
            fontSize: "0.95rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
          }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
        </>
      )}
    </Box>
  );
}
