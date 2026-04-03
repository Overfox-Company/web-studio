import { PROJECT_SOCKET_COLOR_MAP } from "@/src/customization/project-editor";
import type { SocketType } from "@/src/features/project-editor/utils/socket-types";

export const SOCKET_COLOR_MAP = PROJECT_SOCKET_COLOR_MAP;

export function getSocketColor(socketType: SocketType) {
    return SOCKET_COLOR_MAP[socketType];
}