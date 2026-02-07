import { useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const nodeColor = (type) => {
  switch (type) {
    case "user": return "#3B5FCC";
    case "device": return "#D97706";
    case "ip": return "#16A34A";
    case "affiliate": return "#DC2626";
    default: return "#94A3B8";
  }
};

export default function ClusterGraph({ pack }) {
  const { nodes, edges } = useMemo(() => {
    if (!pack) return { nodes: [], edges: [] };

    const members = pack.members || [];
    const linkEvidence = pack.link_evidence || [];
    const nodesMap = new Map();
    const edgesList = [];

    // Place user nodes in a circle
    const cx = 300, cy = 200, radius = Math.min(160, Math.max(80, members.length * 20));
    members.forEach((m, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, members.length);
      nodesMap.set(m, {
        id: m,
        position: { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) },
        data: { label: m },
        style: {
          background: nodeColor("user"),
          color: "#fff",
          border: "2px solid rgba(0,0,0,0.15)",
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: 11,
          fontFamily: "monospace",
        },
      });
    });

    // Extract shared attributes from link_evidence for edge labels + attribute nodes
    const seenEdges = new Set();
    for (const ev of linkEvidence) {
      if (!ev || !ev.by || !ev.key) continue;
      const attrId = `${ev.by}_${ev.key}`;

      if (!nodesMap.has(attrId)) {
        // Place attribute nodes slightly offset from center
        const jitter = () => (Math.random() - 0.5) * 80;
        nodesMap.set(attrId, {
          id: attrId,
          position: { x: cx + jitter(), y: cy + jitter() },
          data: { label: `${ev.by}: ${ev.key.length > 12 ? ev.key.slice(0, 12) + "..." : ev.key}` },
          style: {
            background: nodeColor(ev.by),
            color: "#fff",
            border: "2px solid rgba(0,0,0,0.15)",
            borderRadius: 20,
            padding: "4px 10px",
            fontSize: 10,
            fontWeight: 600,
          },
        });
      }

      // Connect all members to shared attribute
      for (const m of members) {
        const edgeKey = `${m}-${attrId}`;
        if (!seenEdges.has(edgeKey)) {
          seenEdges.add(edgeKey);
          edgesList.push({
            id: edgeKey,
            source: m,
            target: attrId,
            style: { stroke: nodeColor(ev.by), strokeWidth: 1.5, opacity: 0.6 },
            animated: true,
          });
        }
      }
    }

    // If no link evidence, connect members to each other directly
    if (linkEvidence.length === 0 && members.length > 1) {
      for (let i = 1; i < members.length; i++) {
        edgesList.push({
          id: `direct_${members[0]}_${members[i]}`,
          source: members[0],
          target: members[i],
          style: { stroke: "#CBD5E1", strokeWidth: 1, opacity: 0.5 },
        });
      }
    }

    return { nodes: [...nodesMap.values()], edges: edgesList };
  }, [pack]);

  if (!nodes.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94A3B8" }}>
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
      style={{ background: "#F8FAFC" }}
    >
      <Background color="#E2E8F0" gap={20} />
      <Controls position="bottom-right" />
      <MiniMap
        nodeColor={(n) => n.style?.background || "#94A3B8"}
        style={{ background: "#F1F5F9" }}
      />
    </ReactFlow>
  );
}
