import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";
import { getAllowedSocketTypesForNodes } from "@/src/features/project-editor/utils/connection-policy";
import { getSocketColor } from "@/src/features/project-editor/utils/socket-colors";
import { createSocketHandleId, type NodeSocket } from "@/src/features/project-editor/utils/socket-types";

type NodeSocketConfig = Omit<NodeSocket, "color">;

const NODE_SOCKET_CONFIGS: Record<ProjectNodeKind, NodeSocketConfig[]> = {
    view: [
        {
            id: "data",
            label: "Data",
            side: "input",
            socketType: "result",
            multiple: false,
            description: "Result data to render.",
        },
        {
            id: "submit",
            label: "Submit",
            side: "output",
            socketType: "trigger",
            multiple: true,
            description: "Form submission event.",
        },
        {
            id: "input",
            label: "Input",
            side: "output",
            socketType: "payload",
            multiple: true,
            description: "Form or UI payload.",
        },
    ],
    api: [
        {
            id: "request",
            label: "Request",
            side: "input",
            socketType: "trigger",
            multiple: false,
            required: true,
            description: "Execution trigger for the endpoint.",
        },
        {
            id: "input",
            label: "Input",
            side: "input",
            socketType: "payload",
            multiple: false,
            description: "Raw request input or UI payload.",
        },
        {
            id: "response",
            label: "Response",
            side: "output",
            socketType: "result",
            multiple: true,
            description: "Endpoint response.",
        },
        {
            id: "run",
            label: "Run",
            side: "output",
            socketType: "trigger",
            multiple: true,
            description: "Forward execution into an action layer.",
        },
    ],
    action: [
        {
            id: "run",
            label: "Run",
            side: "input",
            socketType: "trigger",
            multiple: false,
            required: true,
            description: "Starts the action execution.",
        },
        {
            id: "input",
            label: "Input",
            side: "input",
            socketType: "payload",
            multiple: false,
            description: "Primary operational input.",
        },
        {
            id: "entity",
            label: "Entity",
            side: "input",
            socketType: "entity",
            multiple: false,
            description: "Structured data loaded from persistence.",
        },
        {
            id: "query",
            label: "Query",
            side: "output",
            socketType: "query",
            multiple: true,
            description: "Persistence query or command.",
        },
        {
            id: "result",
            label: "Result",
            side: "output",
            socketType: "result",
            multiple: true,
            description: "Processed result ready for consumers.",
        },
    ],
    database: [
        {
            id: "query",
            label: "Query",
            side: "input",
            socketType: "query",
            multiple: false,
            required: true,
            description: "Read or write request reaching persistence.",
        },
        {
            id: "entity",
            label: "Entity",
            side: "output",
            socketType: "entity",
            multiple: true,
            description: "Persisted entity payload from storage.",
        },
    ],
};

function materializeSocket(socket: NodeSocketConfig): NodeSocket {
    return {
        ...socket,
        color: getSocketColor(socket.socketType),
    };
}

export function getNodeSockets(kind: ProjectNodeKind) {
    return NODE_SOCKET_CONFIGS[kind].map(materializeSocket);
}

export function getNodeSocketsBySide(kind: ProjectNodeKind, side: NodeSocket["side"]) {
    return getNodeSockets(kind).filter((socket) => socket.side === side);
}

export function getNodeSocket(kind: ProjectNodeKind, handleId?: string | null) {
    if (!handleId) {
        return null;
    }

    return getNodeSockets(kind).find((socket) => {
        return createSocketHandleId(socket) === handleId || socket.id === handleId;
    }) ?? null;
}

export function getPreferredSocketsForConnection(sourceKind: ProjectNodeKind, targetKind: ProjectNodeKind) {
    const allowedSocketTypes = getAllowedSocketTypesForNodes(sourceKind, targetKind);

    for (const socketType of allowedSocketTypes) {
        const sourceSocket = getNodeSocketsBySide(sourceKind, "output").find((socket) => socket.socketType === socketType);
        const targetSocket = getNodeSocketsBySide(targetKind, "input").find((socket) => socket.socketType === socketType);

        if (sourceSocket && targetSocket) {
            return { sourceSocket, targetSocket };
        }
    }

    return null;
}