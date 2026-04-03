import type { SocketType } from "@/src/features/project-editor/utils/socket-types";

export const SOCKET_COLOR_MAP: Record<SocketType, string> = {
    trigger: "#F59E0B",
    payload: "#3B82F6",
    query: "#06B6D4",
    entity: "#10B981",
    result: "#8B5CF6",
};

export function getSocketColor(socketType: SocketType) {
    return SOCKET_COLOR_MAP[socketType];
}