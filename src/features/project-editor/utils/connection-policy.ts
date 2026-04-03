import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";
import type {
    ConnectionValidationResult,
    SocketSide,
    SocketType,
} from "@/src/features/project-editor/utils/socket-types";

const NODE_CONNECTION_POLICY: Record<ProjectNodeKind, Partial<Record<ProjectNodeKind, SocketType[]>>> = {
    view: {
        action: ["trigger", "payload"],
        api: ["trigger", "payload"],
    },
    api: {
        action: ["trigger", "payload"],
        view: ["result"],
    },
    database: {
        action: ["entity"],
    },
    action: {
        database: ["query"],
        view: ["result"],
        action: ["trigger", "result"],
    },
};

export function getAllowedSocketTypesForNodes(sourceNodeKind: ProjectNodeKind, targetNodeKind: ProjectNodeKind) {
    return NODE_CONNECTION_POLICY[sourceNodeKind][targetNodeKind] ?? [];
}

export function validateConnection(params: {
    sourceNodeKind: ProjectNodeKind;
    targetNodeKind: ProjectNodeKind;
    sourceSocketType: SocketType;
    targetSocketType: SocketType;
    sourceSocketSide: SocketSide;
    targetSocketSide: SocketSide;
}): ConnectionValidationResult {
    const {
        sourceNodeKind,
        targetNodeKind,
        sourceSocketType,
        targetSocketType,
        sourceSocketSide,
        targetSocketSide,
    } = params;

    if (sourceSocketSide !== "output" || targetSocketSide !== "input") {
        return {
            allowed: false,
            reason: "Connections must go from an output socket to an input socket.",
        };
    }

    if (sourceSocketType !== targetSocketType) {
        return {
            allowed: false,
            reason: `${sourceSocketType} sockets cannot connect to ${targetSocketType} sockets.`,
        };
    }

    const allowedSocketTypes = getAllowedSocketTypesForNodes(sourceNodeKind, targetNodeKind);

    if (!allowedSocketTypes.includes(sourceSocketType)) {
        return {
            allowed: false,
            reason: `${sourceNodeKind} nodes cannot send ${sourceSocketType} sockets to ${targetNodeKind} nodes.`,
        };
    }

    return { allowed: true };
}