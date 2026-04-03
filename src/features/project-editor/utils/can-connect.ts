import type { Connection } from "@xyflow/react";

import type { ProjectEdge, ProjectNode } from "@/src/features/project-editor/types/editor.types";
import { validateConnection } from "@/src/features/project-editor/utils/connection-policy";
import { getNodeSocket } from "@/src/features/project-editor/utils/node-sockets";
import { createSocketHandleId, type ConnectionValidationResult, type NodeSocket } from "@/src/features/project-editor/utils/socket-types";

type ConnectionLike = Pick<Connection, "source" | "target" | "sourceHandle" | "targetHandle">;

export interface ResolvedConnectionValidationResult extends ConnectionValidationResult {
    existingEdgeId?: string;
    sourceNode?: ProjectNode;
    targetNode?: ProjectNode;
    sourceSocket?: NodeSocket;
    targetSocket?: NodeSocket;
}

function hasDirectedPath(startNodeId: string, targetNodeId: string, edges: ProjectEdge[]) {
    const stack = [startNodeId];
    const visited = new Set<string>();

    while (stack.length > 0) {
        const currentNodeId = stack.pop();

        if (!currentNodeId || visited.has(currentNodeId)) {
            continue;
        }

        if (currentNodeId === targetNodeId) {
            return true;
        }

        visited.add(currentNodeId);

        for (const edge of edges) {
            if (edge.source === currentNodeId && !visited.has(edge.target)) {
                stack.push(edge.target);
            }
        }
    }

    return false;
}

function createsCycle(sourceNodeId: string, targetNodeId: string, edges: ProjectEdge[]) {
    return hasDirectedPath(targetNodeId, sourceNodeId, edges);
}

export function canConnect(params: {
    nodes: ProjectNode[];
    edges: ProjectEdge[];
    sourceNodeId?: string | null;
    targetNodeId?: string | null;
    sourceHandleId?: string | null;
    targetHandleId?: string | null;
    ignoreEdgeId?: string;
}): ResolvedConnectionValidationResult {
    const {
        nodes,
        edges,
        sourceNodeId,
        targetNodeId,
        sourceHandleId,
        targetHandleId,
        ignoreEdgeId,
    } = params;

    if (!sourceNodeId || !targetNodeId) {
        return {
            allowed: false,
            reason: "Connections need both a source node and a target node.",
        };
    }

    const sourceNode = nodes.find((node) => node.id === sourceNodeId);
    const targetNode = nodes.find((node) => node.id === targetNodeId);

    if (!sourceNode || !targetNode) {
        return {
            allowed: false,
            reason: "Connections can only target existing nodes.",
        };
    }

    const sourceSocket = getNodeSocket(sourceNode.kind, sourceHandleId);
    const targetSocket = getNodeSocket(targetNode.kind, targetHandleId);

    if (!sourceSocket || !targetSocket) {
        return {
            allowed: false,
            reason: "Connections must use explicit typed sockets.",
            sourceNode,
            targetNode,
        };
    }

    if (sourceSocket.side !== "output" || targetSocket.side !== "input") {
        return {
            allowed: false,
            reason: "Connections must go from an output socket to an input socket.",
            sourceNode,
            targetNode,
            sourceSocket,
            targetSocket,
        };
    }

    if (sourceNodeId === targetNodeId) {
        return {
            allowed: false,
            reason: "A node cannot connect to itself in this phase.",
            sourceNode,
            targetNode,
            sourceSocket,
            targetSocket,
        };
    }

    const canonicalSourceHandleId = createSocketHandleId(sourceSocket);
    const canonicalTargetHandleId = createSocketHandleId(targetSocket);
    const comparableEdges = ignoreEdgeId ? edges.filter((edge) => edge.id !== ignoreEdgeId) : edges;
    const duplicateEdge = comparableEdges.find((edge) => {
        return (
            edge.source === sourceNodeId &&
            edge.target === targetNodeId &&
            edge.sourceHandle === canonicalSourceHandleId &&
            edge.targetHandle === canonicalTargetHandleId
        );
    });

    if (duplicateEdge) {
        return {
            allowed: false,
            reason: "That socket connection already exists.",
            existingEdgeId: duplicateEdge.id,
            sourceNode,
            targetNode,
            sourceSocket,
            targetSocket,
        };
    }

    const structuralValidation = validateConnection({
        sourceNodeKind: sourceNode.kind,
        targetNodeKind: targetNode.kind,
        sourceSocketType: sourceSocket.socketType,
        targetSocketType: targetSocket.socketType,
        sourceSocketSide: sourceSocket.side,
        targetSocketSide: targetSocket.side,
    });

    if (!structuralValidation.allowed) {
        return {
            ...structuralValidation,
            sourceNode,
            targetNode,
            sourceSocket,
            targetSocket,
        };
    }

    if (
        !targetSocket.multiple &&
        comparableEdges.some((edge) => edge.target === targetNodeId && edge.targetHandle === canonicalTargetHandleId)
    ) {
        return {
            allowed: false,
            reason: "This input socket only accepts a single connection.",
            sourceNode,
            targetNode,
            sourceSocket,
            targetSocket,
        };
    }

    if (createsCycle(sourceNodeId, targetNodeId, comparableEdges)) {
        return {
            allowed: false,
            reason: "Cycles are disabled in this MVP.",
            sourceNode,
            targetNode,
            sourceSocket,
            targetSocket,
        };
    }

    return {
        allowed: true,
        sourceNode,
        targetNode,
        sourceSocket,
        targetSocket,
    };
}

export function canConnectFlow(connection: ConnectionLike, nodes: ProjectNode[], edges: ProjectEdge[]) {
    return canConnect({
        nodes,
        edges,
        sourceNodeId: connection.source,
        targetNodeId: connection.target,
        sourceHandleId: connection.sourceHandle,
        targetHandleId: connection.targetHandle,
    });
}