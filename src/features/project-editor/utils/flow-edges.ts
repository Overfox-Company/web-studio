import { MarkerType } from "@xyflow/react";

import type { ProjectEdge, ProjectFlowEdge } from "@/src/features/project-editor/types/editor.types";
import { getSocketColor } from "@/src/features/project-editor/utils/socket-colors";

const FALLBACK_EDGE_COLOR = "#94a3b8";

export function createProjectFlowEdge(edge: ProjectEdge): ProjectFlowEdge {
    const strokeColor = edge.sourceSocketType ? getSocketColor(edge.sourceSocketType) : FALLBACK_EDGE_COLOR;

    return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: "smoothstep",
        animated: false,
        className: "project-flow-edge",
        interactionWidth: 28,
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: strokeColor,
        },
        style: {
            stroke: strokeColor,
            strokeWidth: 1.8,
        },
        data: {
            sourceSocketType: edge.sourceSocketType,
            targetSocketType: edge.targetSocketType,
        },
    };
}

export function buildProjectFlowEdges(edges: ProjectEdge[]) {
    return edges.map((edge) => createProjectFlowEdge(edge));
}