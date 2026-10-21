export type Category =
  | "Resiliency"
  | "Data"
  | "Messaging"
  | "Traffic & edge"
  | "Structure & migration";

export type NodeKind = "client" | "service" | "store" | "queue" | "gateway" | "faulty";

export interface DiagramNode {
  id: string;
  label: string;
  /** Centre position inside a 640 × 300 canvas */
  x: number;
  y: number;
  kind: NodeKind;
  /** Optional second line under the label */
  note?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  /** Draw as a dashed line (async, optional or failed path) */
  dashed?: boolean;
  /** Animate a request packet travelling along this edge */
  flow?: boolean;
  /** Packet colour: normal traffic or a failure */
  tone?: "normal" | "fault";
}

export interface Pattern {
  slug: string;
  name: string;
  category: Category;
  summary: string;
  problem: string;
  solution: string[];
  steps: string[];
  useWhen: string[];
  avoidWhen: string[];
  services: {
    aws: string;
    azure: string;
    gcp: string;
    openSource: string;
  };
  related: string[];
  diagram: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
}
