import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip, Container, Stack } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Dashboard from "./pages/Dashboard";
import CaseDetail from "./pages/CaseDetail";

function Breadcrumb({ batchId }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const isCaseDetail = location.pathname.startsWith("/case/");
  const rawId = location.pathname.split("/case/")[1] || "";

  if (!isCaseDetail) return null;

  const crumbSx = {
    fontSize:   "0.68rem",
    color:      "rgba(255,255,255,0.28)",
    lineHeight: 1,
  };
  const sepSx = { ...crumbSx, mx: 0.75 };

  return (
    <Stack direction="row" alignItems="center" sx={{ ml: 2 }}>
      <Typography sx={sepSx}>/</Typography>
      <Typography
        sx={{ ...crumbSx, cursor: "pointer", "&:hover": { color: "#F97316" }, transition: "color 0.15s" }}
        onClick={() => navigate(`/?batchId=${batchId}`)}
      >
        Cases
      </Typography>
      <Typography sx={sepSx}>/</Typography>
      <Typography
        sx={{
          fontSize:   "0.68rem",
          color:      "#94A3B8",
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1,
        }}
      >
        {rawId.replace("case_cluster_", "C-")}
      </Typography>
    </Stack>
  );
}

export default function App() {
  const [batchId, setBatchId] = useState(() => localStorage.getItem("batchId"));
  const [stats,   setStats]   = useState(null);
  const [cases,   setCases]   = useState([]);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const qBatchId = new URLSearchParams(location.search).get("batchId");
    if (qBatchId && qBatchId !== batchId) setBatchId(qBatchId);
  }, [location.search, batchId]);

  useEffect(() => {
    if (batchId) localStorage.setItem("batchId", batchId);
    else         localStorage.removeItem("batchId");
  }, [batchId]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>

      {/* ── Navigation ── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor:      "#0D0E14",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          zIndex:       1200,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: "52px !important", height: 52 }}>

            {/* Logo button */}
            <Tooltip title="Home" arrow>
              <IconButton
                edge="start"
                onClick={() => navigate("/")}
                sx={{
                  mr:          1.5,
                  color:       "#F97316",
                  bgcolor:     "rgba(249,115,22,0.1)",
                  borderRadius:"6px",
                  p:           "7px",
                  border:      "1px solid rgba(249,115,22,0.2)",
                  transition:  "all 0.18s ease",
                  "&:hover": {
                    bgcolor:   "rgba(249,115,22,0.2)",
                    boxShadow: "0 0 14px rgba(249,115,22,0.35)",
                  },
                }}
              >
                <SecurityIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {/* Brand + badge */}
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Typography
                sx={{
                  color:         "#F1F5F9",
                  fontWeight:    700,
                  fontSize:      "0.9rem",
                  letterSpacing: "-0.02em",
                  lineHeight:    1,
                }}
              >
                SAR Copilot
              </Typography>

              <Box
                sx={{
                  px:          "7px",
                  py:          "3px",
                  bgcolor:     "rgba(249,115,22,0.12)",
                  border:      "1px solid rgba(249,115,22,0.28)",
                  borderRadius:"4px",
                }}
              >
                <Typography
                  sx={{
                    fontSize:      "0.57rem",
                    fontWeight:    700,
                    letterSpacing: "0.1em",
                    color:         "#F97316",
                    textTransform: "uppercase",
                    lineHeight:    1,
                  }}
                >
                  AI-Powered
                </Typography>
              </Box>
            </Stack>

            {/* Breadcrumb */}
            <Breadcrumb batchId={batchId} />

            <Box sx={{ flexGrow: 1 }} />

            {/* Right side */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {batchId && (
                <Box
                  sx={{
                    px:          "10px",
                    py:          "5px",
                    bgcolor:     "rgba(255,255,255,0.03)",
                    border:      "1px solid rgba(255,255,255,0.06)",
                    borderRadius:"4px",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily:    "'JetBrains Mono', monospace",
                      fontSize:      "0.65rem",
                      color:         "#475569",
                      letterSpacing: "0.04em",
                      lineHeight:    1,
                    }}
                  >
                    SID:{" "}
                    <Box component="span" sx={{ color: "#64748b" }}>
                      {batchId.slice(6, 14)}
                    </Box>
                  </Typography>
                </Box>
              )}

              <Tooltip title="Notifications" arrow>
                <IconButton
                  size="small"
                  sx={{
                    color:    "#475569",
                    p:        "6px",
                    borderRadius: "6px",
                    "&:hover": { color: "#94A3B8", bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  <NotificationsNoneIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </Stack>

          </Toolbar>
        </Container>
      </AppBar>

      {/* ── Page content ── */}
      <Container maxWidth="xl" sx={{ py: 3, animation: "fadeSlideUp 0.22s ease-out" }}>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                batchId={batchId}
                setBatchId={setBatchId}
                stats={stats}
                setStats={setStats}
                cases={cases}
                setCases={setCases}
              />
            }
          />
          <Route
            path="/case/:caseId"
            element={<CaseDetail batchId={batchId} cases={cases} setCases={setCases} />}
          />
        </Routes>
      </Container>

    </Box>
  );
}
