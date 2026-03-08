import type { Connection } from "@xyflow/react";

import type { ArchitectureEdge, ArchitectureNode, ArchitectureNodeKind, DataTrigger } from "@/src/types/editor";

const allowedConnections: Record<ArchitectureNodeKind, ArchitectureNodeKind[]> = {
    page: ["page", "component", "stateStore", "api"],
    component: ["component", "serverAction", "api", "stateStore", "externalApi"],
    database: ["api", "serverAction"],
    api: ["component", "serverAction", "stateStore"],
    serverAction: ["database", "component", "stateStore", "api"],
    externalApi: ["api", "serverAction", "component"],
    stateStore: ["component", "page"],
    group: [],
};

export function canConnectKinds(sourceKind: ArchitectureNodeKind, targetKind: ArchitectureNodeKind) {
    return allowedConnections[sourceKind].includes(targetKind);
}

export function validateConnection(sourceNode?: ArchitectureNode, targetNode?: ArchitectureNode, edges: ArchitectureEdge[] = []) {
    if (!sourceNode || !targetNode) {
        return {
            ok: false,
            reason: "Source and target nodes are required.",
        };
    }

    if (sourceNode.id === targetNode.id) {
        return {
            ok: false,
            reason: "Nodes cannot connect to themselves.",
        };
    }

    const ok = canConnectKinds(sourceNode.data.kind, targetNode.data.kind);

    if (ok && sourceNode.data.kind === "page" && targetNode.data.kind === "page") {
        const hasExistingParent = edges.some(
            (edge) =>
                edge.target === targetNode.id &&
                edge.source !== sourceNode.id &&
                edge.data?.trigger === "navigation",
        );

        if (hasExistingParent) {
            return {
                ok: false,
                reason: `${targetNode.data.label} already has a parent page in the route tree.`,
            };
        }
    }

    return ok
        ? { ok: true }
        : {
            ok: false,
            reason: `${sourceNode.data.kind} cannot connect to ${targetNode.data.kind}.`,
        };
}

export function getDefaultTrigger(connection: Connection, nodes: ArchitectureNode[]): DataTrigger {
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    if (!sourceNode || !targetNode) {
        return "sync";
    }

    if (sourceNode.data.kind === "page" && targetNode.data.kind === "page") {
        return "navigation";
    }

    if (sourceNode.data.kind === "component" && targetNode.data.kind === "serverAction") {
        return "event";
    }

    if (sourceNode.data.kind === "serverAction" && targetNode.data.kind === "database") {
        return "mutation";
    }

    if (sourceNode.data.kind === "database" || sourceNode.data.kind === "api") {
        return "fetch";
    }

    return "sync";
}