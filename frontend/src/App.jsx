import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Box, IconButton, Tooltip, Container, Chip,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import Dashboard from "./pages/Dashboard";
import CaseDetail from "./pages/CaseDetail";

export default function App() {
  const [batchId, setBatchId] = useState(() => localStorage.getItem("batchId"));
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]); // Lift cases state to App level
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const qBatchId = new URLSearchParams(location.search).get("batchId");
    if (qBatchId && qBatchId !== batchId) {
      setBatchId(qBatchId);
    }
  }, [location.search, batchId]);

  useEffect(() => {
    if (batchId) localStorage.setItem("batchId", batchId);
    else localStorage.removeItem("batchId");
  }, [batchId]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Enhanced AppBar */}
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          bgcolor: "primary.main",
          borderBottom: "1px solid",
          borderColor: "primary.dark",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            <Tooltip title="Home">
              <IconButton 
                edge="start" 
                onClick={() => navigate("/")} 
                sx={{ 
                  mr: 2,
                  color: "white",
                  bgcolor: "primary.dark",
                  "&:hover": { bgcolor: "primary.light" }
                }}
              >
                <SecurityIcon />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: "white",
                  fontWeight: 700,
                  letterSpacing: "-0.02em"
                }}
              >
                SAR Copilot
              </Typography>
              <Chip 
                label="AI-Powered" 
                size="small" 
                sx={{ 
                  bgcolor: "secondary.main",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.7rem"
                }} 
              />
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {batchId && (
              <Chip
                label={`Session: ${batchId.slice(6, 14)}`}
                size="small"
                sx={{ 
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  fontWeight: 600
                }}
              />
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
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

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: "auto",
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider"
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            SAR Copilot © 2024 | AI-Powered Financial Crime Detection
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
