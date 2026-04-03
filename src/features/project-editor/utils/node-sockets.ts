import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";
import { getAllowedSocketTypesForNodes } from "@/src/features/project-editor/utils/connection-policy";
import { getSocketColor } from "@/src/features/project-editor/utils/socket-colors";
import { createSocketHandleId, type NodeSocket } from "@/src/features/project-editor/utils/socket-types";

type NodeSocketConfig = Omit<NodeSocket, "color">;

const NODE_SOCKET_CONFIGS: Record<ProjectNodeKind, NodeSocketConfig[]> = {
    view: [
        {
            id: "viewModel",
            label: "View Model",
            side: "input",
            socketType: "result",
            multiple: false,
            description: "Processed UI state ready to render.",
        },
        {
            id: "responseData",
            label: "Response Data",
            side: "input",
            socketType: "result",
            multiple: false,
            description: "Simple API or action response for direct rendering.",
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
            id: "click",
            label: "Click",
            side: "output",
            socketType: "trigger",
            multiple: true,
            description: "Generic interaction event.",
        },
        {
            id: "load",
            label: "Load",
            side: "output",
            socketType: "trigger",
            multiple: true,
            description: "Initial route load event.",
        },
        {
            id: "refresh",
            label: "Refresh",
            side: "output",
            socketType: "trigger",
            multiple: true,
            description: "Explicit refresh request.",
        },
        {
            id: "formData",
            label: "Form Data",
            side: "output",
            socketType: "payload",
            multiple: true,
            description: "Structured form values or body payload.",
        },
        {
            id: "filters",
            label: "Filters",
            side: "output",
            socketType: "payload",
            multiple: true,
            description: "Filter state from a listing view.",
        },
        {
            id: "routeParams",
            label: "Route Params",
            side: "output",
            socketType: "payload",
            multiple: true,
            description: "URL parameters or route context.",
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
            id: "requestInput",
            label: "Request Input",
            side: "input",
            socketType: "payload",
            multiple: false,
            description: "Raw request input or UI payload.",
        },
        {
            id: "run",
            label: "Run",
            side: "output",
            socketType: "trigger",
            multiple: true,
            description: "Forward execution into an action layer.",
        },
        {
            id: "validatedInput",
            label: "Validated Input",
            side: "output",
            socketType: "payload",
            multiple: true,
            description: "Sanitized data ready for business logic.",
        },
        {
            id: "response",
            label: "Response",
            side: "output",
            socketType: "result",
            multiple: true,
            description: "Endpoint response for simple direct flows.",
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
            id: "sourceEntity",
            label: "Source Entity",
            side: "input",
            socketType: "entity",
            multiple: false,
            description: "Structured data loaded from persistence.",
        },
        {
            id: "previousResult",
            label: "Previous Result",
            side: "input",
            socketType: "result",
            multiple: false,
            required: false,
            description: "Chained result from a prior action.",
        },
        {
            id: "dataRequest",
            label: "Data Request",
            side: "output",
            socketType: "query",
            multiple: true,
            description: "Persistence query or command.",
        },
        {
            id: "output",
            label: "Output",
            side: "output",
            socketType: "result",
            multiple: true,
            description: "Processed result ready for consumers.",
        },
        {
            id: "next",
            label: "Next",
            side: "output",
            socketType: "trigger",
            multiple: true,
            description: "Continues execution into another action.",
        },
    ],
    database: [
        {
            id: "request",
            label: "Request",
            side: "input",
            socketType: "query",
            multiple: false,
            required: true,
            description: "Read or write request reaching persistence.",
        },
        {
            id: "entityData",
            label: "Entity Data",
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