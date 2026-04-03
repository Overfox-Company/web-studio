export const SOCKET_SIDES = ["input", "output"] as const;

export type SocketSide = (typeof SOCKET_SIDES)[number];

export const SOCKET_TYPES = ["trigger", "payload", "query", "entity", "result"] as const;

export type SocketType = (typeof SOCKET_TYPES)[number];

export interface NodeSocket {
    id: string;
    label: string;
    side: SocketSide;
    socketType: SocketType;
    color: string;
    multiple: boolean;
    required?: boolean;
    description?: string;
}

export interface ConnectionValidationResult {
    allowed: boolean;
    reason?: string;
}

export function createSocketHandleId(socket: Pick<NodeSocket, "id" | "side">) {
    return `${socket.side}:${socket.id}`;
}