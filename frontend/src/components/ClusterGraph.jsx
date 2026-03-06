import { useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/* Node colors — dark-theme palette */
const nodeColor = (type) => {
  switch (type) {
    case "user":      return "#F97316";  // orange
    case "device":    return "#FFB300";  // amber
    case "ip":        return "#00C853";  // green
    case "affiliate": return "#E53935";  // red
    default:          return "#475569";  // muted
  }
};

const nodeGlow = (type) => {
  switch (type) {
    case "user":      return "0 0 10px rgba(249,115,22,0.45)";
    case "device":    return "0 0 10px rgba(255,179,0,0.45)";
    case "ip":        return "0 0 10px rgba(0,200,83,0.45)";
    case "affiliate": return "0 0 10px rgba(229,57,53,0.45)";
    default:          return "none";
  }
};

export default function ClusterGraph({ pack }) {
  const { nodes, edges } = useMemo(() => {
    if (!pack) return { nodes: [], edges: [] };

    const members      = pack.members      || [];
    const linkEvidence = pack.link_evidence || [];
    const nodesMap     = new Map();
    const edgesList    = [];

    /* User nodes in a circle */
    const cx = 300, cy = 200, radius = Math.min(160, Math.max(80, members.length * 20));
    members.forEach((m, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, members.length);
      nodesMap.set(m, {
        id:       m,
        position: { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) },
        data:     { label: m },
        style: {
          background:  "#111827",
          color:       "#FB923C",
          border:      "1px solid rgba(249,115,22,0.4)",
          borderRadius:"5px",
          padding:     "6px 12px",
          fontSize:    10,
          fontFamily:  "'JetBrains Mono', monospace",
          fontWeight:  600,
          boxShadow:   "0 0 10px rgba(249,115,22,0.35)",
        },
      });
    });

    /* Attribute nodes + edges */
    const seenEdges = new Set();
    for (const ev of linkEvidence) {
      if (!ev || !ev.by || !ev.key) continue;
      const attrId = `${ev.by}_${ev.key}`;
      const color  = nodeColor(ev.by);

      if (!nodesMap.has(attrId)) {
        const jitter = () => (Math.random() - 0.5) * 80;
        nodesMap.set(attrId, {
          id:       attrId,
          position: { x: cx + jitter(), y: cy + jitter() },
          data:     { label: `${ev.by}: ${ev.key.length > 12 ? ev.key.slice(0, 12) + "…" : ev.key}` },
          style: {
            background:   "#0d1220",
            color,
            border:       `1px solid ${color}50`,
            borderRadius: "14px",
            padding:      "4px 10px",
            fontSize:     9,
            fontFamily:   "'JetBrains Mono', monospace",
            fontWeight:   600,
            boxShadow:    nodeGlow(ev.by),
          },
        });
      }

      for (const m of members) {
        const edgeKey = `${m}-${attrId}`;
        if (!seenEdges.has(edgeKey)) {
          seenEdges.add(edgeKey);
          edgesList.push({
            id:       edgeKey,
            source:   m,
            target:   attrId,
            animated: true,
            style: {
              stroke:      nodeColor(ev.by),
              strokeWidth: 1.5,
              opacity:     0.55,
              filter:      `drop-shadow(0 0 3px ${nodeColor(ev.by)}66)`,
            },
          });
        }
      }
    }

    /* Direct edges if no link evidence */
    if (linkEvidence.length === 0 && members.length > 1) {
      for (let i = 1; i < members.length; i++) {
        edgesList.push({
          id:     `direct_${members[0]}_${members[i]}`,
          source: members[0],
          target: members[i],
          style:  { stroke: "rgba(249,115,22,0.3)", strokeWidth: 1, opacity: 0.5 },
        });
      }
    }

    return { nodes: [...nodesMap.values()], edges: edgesList };
  }, [pack]);

  if (!nodes.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#475569", fontSize: "0.82rem", fontFamily: "'Inter', sans-serif" }}>
        No graph data available
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      proOptions={{ hideAttribution: true }}
      style={{ background: "#070b14" }}
    >
      <Background color="rgba(255,255,255,0.03)" gap={24} />
      <Controls position="bottom-right" />
      <MiniMap
        nodeColor={(n) => n.style?.color || "#94A3B8"}
        style={{ background: "#111827" }}
      />
    </ReactFlow>
  );
}
