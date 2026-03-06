/**
 * ui.jsx — Shared design-system components
 * ScoreBadge | StatCard | SectionLabel | TimelineEvent | RiskSignalRow | TypologyTag
 */
import { Box, Typography, Stack, Chip } from "@mui/material";

/* ────────────────────────────────────────────────────────────
   ScoreBadge
   Sharp rectangular badge; color + glow keyed to risk level.
   ──────────────────────────────────────────────────────────── */
export function ScoreBadge({ score, size = "sm" }) {
  const s = Number(score) || 0;

  const [bg, border, color, glow] =
    s >= 60
      ? ["rgba(229,57,53,0.12)",  "#E53935", "#EF5350", "0 0 8px rgba(229,57,53,0.35)"]
      : s >= 40
      ? ["rgba(255,179,0,0.12)",  "#FFB300", "#FFD54F", "0 0 8px rgba(255,179,0,0.35)"]
      : ["rgba(0,200,83,0.12)",   "#00C853", "#69F0AE", "0 0 8px rgba(0,200,83,0.30)"];

  const px = size === "lg" ? 2   : 1;
  const py = size === "lg" ? 0.6 : 0.25;
  const fs = size === "lg" ? "1rem" : "0.72rem";

  return (
    <Box
      sx={{
        display:       "inline-flex",
        alignItems:    "center",
        justifyContent:"center",
        px, py,
        minWidth:      size === "lg" ? 56 : 40,
        background:    bg,
        border:        `1px solid ${border}`,
        borderRadius:  "4px",
        boxShadow:     glow,
        fontFamily:    "'JetBrains Mono', monospace",
        fontWeight:    700,
        fontSize:      fs,
        color,
        letterSpacing: "0.02em",
        userSelect:    "none",
        flexShrink:    0,
      }}
    >
      {s}
    </Box>
  );
}

/* ────────────────────────────────────────────────────────────
   StatCard
   Dark glass card: icon + large number + label + accent border.
   accentClass: "stat-accent-blue" | "stat-accent-red" | etc.
   ──────────────────────────────────────────────────────────── */
export function StatCard({ icon, label, value, accentClass = "stat-accent-blue", iconColor = "#F97316" }) {
  return (
    <Box
      className={accentClass}
      sx={{
        flex: 1,
        minWidth: 160,
        bgcolor: "#111827",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "6px",
        p: "18px 20px 16px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        },
      }}
    >
      <Box
        sx={{
          color: iconColor,
          display: "flex",
          alignItems: "center",
          opacity: 0.85,
          fontSize: 28,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily:  "'JetBrains Mono', monospace",
            fontSize:    "1.65rem",
            fontWeight:  700,
            color:       "#F1F5F9",
            lineHeight:  1,
            mb:          0.5,
            animation:   "countUp 0.4s ease-out both",
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontSize:      "0.68rem",
            fontWeight:    600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color:         "#475569",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

/* ────────────────────────────────────────────────────────────
   SectionLabel — uppercase muted section header
   ──────────────────────────────────────────────────────────── */
export function SectionLabel({ children, sx = {} }) {
  return (
    <Typography
      sx={{
        fontSize:      "0.62rem",
        fontWeight:    600,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color:         "#475569",
        mb:            1,
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

/* ────────────────────────────────────────────────────────────
   TypologyTag — dark chip with colored left dot
   ──────────────────────────────────────────────────────────── */
export function TypologyTag({ label, dotColor = "#FFB300" }) {
  return (
    <Box
      sx={{
        display:     "inline-flex",
        alignItems:  "center",
        gap:         "5px",
        px:          "8px",
        py:          "2px",
        bgcolor:     "rgba(255,179,0,0.07)",
        border:      "1px solid rgba(255,179,0,0.18)",
        borderRadius:"4px",
        whiteSpace:  "nowrap",
      }}
    >
      <Box
        sx={{
          width:       5,
          height:      5,
          borderRadius:"50%",
          bgcolor:     dotColor,
          flexShrink:  0,
        }}
      />
      <Typography
        sx={{
          fontSize:   "0.66rem",
          fontWeight: 600,
          color:      "#FFD54F",
          lineHeight: 1,
        }}
      >
        {label.replace(/_/g, " ")}
      </Typography>
    </Box>
  );
}

/* ────────────────────────────────────────────────────────────
   RiskSignalRow — single evidence signal in the risk panel
   ──────────────────────────────────────────────────────────── */
export function RiskSignalRow({ icon, detail, points, severity = "info" }) {
  const colorMap = {
    error:   { bg: "rgba(229,57,53,0.08)",  border: "rgba(229,57,53,0.2)",  text: "#EF5350", pts: "#E53935" },
    warning: { bg: "rgba(255,179,0,0.08)",  border: "rgba(255,179,0,0.2)",  text: "#FFD54F", pts: "#FFB300" },
    info:    { bg: "rgba(249,115,22,0.06)", border: "rgba(249,115,22,0.18)",text: "#94A3B8", pts: "#F97316" },
  };
  const c = colorMap[severity] || colorMap.info;

  return (
    <Box
      sx={{
        display:      "flex",
        alignItems:   "flex-start",
        gap:          1.25,
        p:            "10px 12px",
        bgcolor:      c.bg,
        border:       `1px solid ${c.border}`,
        borderRadius: "5px",
      }}
    >
      <Box sx={{ color: c.text, mt: "1px", flexShrink: 0, display: "flex" }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8", flex: 1, lineHeight: 1.4 }}>
        {detail}
      </Typography>
      {typeof points === "number" && (
        <Box
          sx={{
            fontFamily:  "'JetBrains Mono', monospace",
            fontSize:    "0.68rem",
            fontWeight:  700,
            color:       c.pts,
            flexShrink:  0,
            whiteSpace:  "nowrap",
          }}
        >
          +{points}
        </Box>
      )}
    </Box>
  );
}

/* ────────────────────────────────────────────────────────────
   TimelineEvent — single row in the transaction timeline
   ──────────────────────────────────────────────────────────── */
export function TimelineEvent({ type, ts, amount, userId, country, deviceId, ip, index }) {
  const typeConfig = {
    deposit:  { color: "#00C853", bg: "rgba(0,200,83,0.1)",   label: "DEP" },
    withdraw: { color: "#E53935", bg: "rgba(229,57,53,0.1)",  label: "WTH" },
    trade:    { color: "#F97316", bg: "rgba(249,115,22,0.1)", label: "TRD" },
  };
  const cfg = typeConfig[type] || { color: "#94A3B8", bg: "rgba(148,163,184,0.1)", label: type?.slice(0,3).toUpperCase() || "---" };

  return (
    <Box
      sx={{
        display:        "flex",
        alignItems:     "center",
        gap:            1.5,
        py:             "9px",
        px:             "14px",
        borderBottom:   "1px solid rgba(255,255,255,0.04)",
        animation:      "rowFadeIn 0.2s ease-out both",
        animationDelay: `${Math.min(index * 30, 300)}ms`,
        "&:hover": { bgcolor: "rgba(249,115,22,0.04)" },
        "&:last-child": { borderBottom: "none" },
      }}
    >
      {/* Type badge */}
      <Box
        sx={{
          width:       36,
          textAlign:   "center",
          fontFamily:  "'JetBrains Mono', monospace",
          fontSize:    "0.58rem",
          fontWeight:  700,
          color:       cfg.color,
          bgcolor:     cfg.bg,
          border:      `1px solid ${cfg.color}40`,
          borderRadius:"3px",
          py:          "2px",
          flexShrink:  0,
        }}
      >
        {cfg.label}
      </Box>

      {/* Timestamp */}
      <Typography
        sx={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize:   "0.68rem",
          color:      "#475569",
          width:      130,
          flexShrink: 0,
        }}
      >
        {ts}
      </Typography>

      {/* User */}
      <Typography
        sx={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize:   "0.72rem",
          color:      "#FB923C",
          width:      100,
          flexShrink: 0,
          overflow:   "hidden",
          textOverflow:"ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {userId || "—"}
      </Typography>

      {/* Amount */}
      <Typography
        sx={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize:   "0.78rem",
          fontWeight: 600,
          color:      cfg.color,
          width:      90,
          textAlign:  "right",
          flexShrink: 0,
        }}
      >
        ${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Typography>

      {/* Country */}
      <Typography sx={{ fontSize: "0.72rem", color: "#64748b", width: 60, flexShrink: 0 }}>
        {country || "—"}
      </Typography>

      {/* Device */}
      <Typography
        sx={{
          fontFamily:  "'JetBrains Mono', monospace",
          fontSize:    "0.65rem",
          color:       "#475569",
          flex:        1,
          overflow:    "hidden",
          textOverflow:"ellipsis",
          whiteSpace:  "nowrap",
        }}
      >
        {deviceId ? String(deviceId).slice(0, 14) : "—"}
      </Typography>

      {/* IP */}
      <Typography
        sx={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize:   "0.65rem",
          color:      "#475569",
          width:      100,
          flexShrink: 0,
        }}
      >
        {ip || "—"}
      </Typography>
    </Box>
  );
}
