import { projectEdgeSchema } from "@/src/features/project-editor/schema/node.schema";
import type { ProjectEditorState, ProjectEdge } from "@/src/features/project-editor/types/editor.types";
import { canConnect } from "@/src/features/project-editor/utils/can-connect";
import { getPreferredSocketsForConnection } from "@/src/features/project-editor/utils/node-sockets";
import { createSocketHandleId } from "@/src/features/project-editor/utils/socket-types";

function normalizeEdge(edge: ProjectEdge, project: ProjectEditorState, acceptedEdges: ProjectEdge[]) {
    const directResolution = canConnect({
        nodes: project.nodes,
        edges: acceptedEdges,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        sourceHandleId: edge.sourceHandle,
        targetHandleId: edge.targetHandle,
    });

    if (directResolution.allowed && directResolution.sourceSocket && directResolution.targetSocket) {
        return projectEdgeSchema.parse({
            ...edge,
            sourceHandle: createSocketHandleId(directResolution.sourceSocket),
            targetHandle: createSocketHandleId(directResolution.targetSocket),
            sourceSocketType: directResolution.sourceSocket.socketType,
            targetSocketType: directResolution.targetSocket.socketType,
        });
    }

    const sourceNode = project.nodes.find((node) => node.id === edge.source);
    const targetNode = project.nodes.find((node) => node.id === edge.target);

    if (!sourceNode || !targetNode) {
        return null;
    }

    const fallbackSockets = getPreferredSocketsForConnection(sourceNode.kind, targetNode.kind);

    if (!fallbackSockets) {
        return null;
    }

    const fallbackResolution = canConnect({
        nodes: project.nodes,
        edges: acceptedEdges,
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        sourceHandleId: createSocketHandleId(fallbackSockets.sourceSocket),
        targetHandleId: createSocketHandleId(fallbackSockets.targetSocket),
    });

    if (!fallbackResolution.allowed || !fallbackResolution.sourceSocket || !fallbackResolution.targetSocket) {
        return null;
    }

    return projectEdgeSchema.parse({
        ...edge,
        sourceHandle: createSocketHandleId(fallbackResolution.sourceSocket),
        targetHandle: createSocketHandleId(fallbackResolution.targetSocket),
        sourceSocketType: fallbackResolution.sourceSocket.socketType,
        targetSocketType: fallbackResolution.targetSocket.socketType,
    });
}

export function normalizeProjectState(project: ProjectEditorState): ProjectEditorState {
    const normalizedEdges: ProjectEdge[] = [];

    for (const edge of project.edges) {
        const normalizedEdge = normalizeEdge(edge, project, normalizedEdges);

        if (normalizedEdge) {
            normalizedEdges.push(normalizedEdge);
        }
    }

    return {
        ...project,
        version: Math.max(project.version, 2),
        edges: normalizedEdges,
    };
}