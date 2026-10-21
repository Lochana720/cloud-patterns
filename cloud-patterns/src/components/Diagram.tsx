import type { DiagramEdge, DiagramNode, Pattern } from "@/data/types";

const W = 640;
const H = 300;
const NODE_W = 132;
const NODE_H = 54;

/** Point where the line from a node's centre towards (tx, ty) leaves its box */
function exitPoint(n: DiagramNode, tx: number, ty: number, pad = 6) {
  const dx = tx - n.x;
  const dy = ty - n.y;
  if (dx === 0 && dy === 0) return { x: n.x, y: n.y };
  const hw = NODE_W / 2 + pad;
  const hh = NODE_H / 2 + pad;
  const scale = Math.min(
    dx !== 0 ? hw / Math.abs(dx) : Infinity,
    dy !== 0 ? hh / Math.abs(dy) : Infinity,
  );
  return { x: n.x + dx * scale, y: n.y + dy * scale };
}

function NodeShape({ n }: { n: DiagramNode }) {
  const x = n.x - NODE_W / 2;
  const y = n.y - NODE_H / 2;
  const faulty = n.kind === "faulty";
  const stroke = faulty ? "var(--fault)" : "var(--blue)";
  const common = {
    fill: "var(--surface)",
    stroke,
    strokeWidth: 1.5,
    strokeDasharray: faulty ? "5 4" : undefined,
  };

  switch (n.kind) {
    case "client":
      return <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={NODE_H / 2} {...common} />;
    case "store": {
      const ry = 7;
      return (
        <g>
          <path
            d={`M${x} ${y + ry} v${NODE_H - ry * 2} a${NODE_W / 2} ${ry} 0 0 0 ${NODE_W} 0 v-${NODE_H - ry * 2}`}
            {...common}
          />
          <ellipse cx={n.x} cy={y + ry} rx={NODE_W / 2} ry={ry} {...common} />
        </g>
      );
    }
    case "queue":
      return (
        <g>
          <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={3} {...common} />
          {[0, 1, 2].map((i) => (
            <line
              key={i}
              x1={x + NODE_W - 12 - i * 9}
              x2={x + NODE_W - 12 - i * 9}
              y1={y + 8}
              y2={y + NODE_H - 8}
              stroke={stroke}
              strokeOpacity={0.45}
            />
          ))}
        </g>
      );
    case "gateway": {
      const c = 10;
      const pts = [
        [x + c, y],
        [x + NODE_W - c, y],
        [x + NODE_W, y + NODE_H / 2],
        [x + NODE_W - c, y + NODE_H],
        [x + c, y + NODE_H],
        [x, y + NODE_H / 2],
      ]
        .map((p) => p.join(","))
        .join(" ");
      return <polygon points={pts} {...common} />;
    }
    default:
      return <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={4} {...common} />;
  }
}

function Edge({
  e,
  nodes,
  index,
  animate,
}: {
  e: DiagramEdge;
  nodes: Map<string, DiagramNode>;
  index: number;
  animate: boolean;
}) {
  const a = nodes.get(e.from);
  const b = nodes.get(e.to);
  if (!a || !b) return null;
  const p1 = exitPoint(a, b.x, b.y);
  const p2 = exitPoint(b, a.x, a.y, 10);
  const path = `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  const fault = e.tone === "fault";
  const color = fault ? "var(--fault)" : "var(--ink-soft)";
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const labelW = e.label ? e.label.length * 6.4 + 12 : 0;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeDasharray={e.dashed ? "5 5" : undefined}
        markerEnd={fault ? "url(#arrow-fault)" : "url(#arrow)"}
      />
      {animate && e.flow && (
        <circle className="packet" r={4.5} fill={fault ? "var(--fault)" : "var(--signal)"}>
          <animateMotion
            dur="2.2s"
            repeatCount="indefinite"
            begin={`${(index * 0.45).toFixed(2)}s`}
            path={path}
          />
        </circle>
      )}
      {e.label && (
        <g>
          <rect
            x={mx - labelW / 2}
            y={my - 10}
            width={labelW}
            height={20}
            rx={10}
            fill="var(--paper)"
            stroke={color}
            strokeOpacity={0.35}
          />
          <text
            x={mx}
            y={my + 4}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill={fault ? "var(--fault)" : "var(--ink-soft)"}
          >
            {e.label}
          </text>
        </g>
      )}
    </g>
  );
}

export default function Diagram({
  pattern,
  animate = true,
  className = "",
}: {
  pattern: Pattern;
  animate?: boolean;
  className?: string;
}) {
  const { nodes, edges } = pattern.diagram;
  const map = new Map(nodes.map((n) => [n.id, n]));
  const description = edges
    .map((e) => `${map.get(e.from)?.label} to ${map.get(e.to)?.label}${e.label ? ` (${e.label})` : ""}`)
    .join("; ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${pattern.name} diagram: ${description}`}
      className={`h-auto w-full font-sans ${className}`}
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--ink-soft)" />
        </marker>
        <marker id="arrow-fault" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fault)" />
        </marker>
      </defs>

      {edges.map((e, i) => (
        <Edge key={`${e.from}-${e.to}`} e={e} nodes={map} index={i} animate={animate} />
      ))}

      {nodes.map((n) => (
        <g key={n.id}>
          <NodeShape n={n} />
          <text
            x={n.x}
            y={n.note ? n.y - 1 : n.y + 5}
            textAnchor="middle"
            fontSize={13.5}
            fontWeight={700}
            fill="var(--ink)"
          >
            {n.label}
          </text>
          {n.note && (
            <text
              x={n.x}
              y={n.y + 15}
              textAnchor="middle"
              fontSize={10.5}
              fill={n.kind === "faulty" ? "var(--fault)" : "var(--ink-soft)"}
            >
              {n.note}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
