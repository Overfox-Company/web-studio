"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo } from "react";

import { Handle, Position, useConnection, type Connection } from "@xyflow/react";
import { Box, Stack, Typography } from "@mui/material";

import { projectEditorStyles } from "@/src/customization/project-editor";
import { useProjectEditorRuntimeStore, useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";
import type { ProjectNode } from "@/src/features/project-editor/types/editor.types";
import { canConnect } from "@/src/features/project-editor/utils/can-connect";
import { createSocketHandleId, type NodeSocket } from "@/src/features/project-editor/utils/socket-types";

interface SocketHandleProps {
    node: ProjectNode;
    socket: NodeSocket;
    preview?: boolean;
}

type SocketCompatibilityState = "neutral" | "source" | "compatible" | "dimmed";

export function SocketHandle({ node, socket, preview = false }: SocketHandleProps) {
    const handleId = createSocketHandleId(socket);
    const nodes = useProjectEditorStore((state) => state.project.nodes);
    const edges = useProjectEditorStore((state) => state.project.edges);
    const hoveredSocket = useProjectEditorRuntimeStore((state) => state.hoveredSocket);
    const setHoveredSocket = useProjectEditorRuntimeStore((state) => state.setHoveredSocket);
    const clearHoveredSocket = useProjectEditorRuntimeStore((state) => state.clearHoveredSocket);

    const connectionState = useConnection((state) => ({
        inProgress: state.inProgress,
        fromNodeId: state.fromNode?.id ?? null,
        fromHandleId: state.fromHandle?.id ?? null,
    }));

    const activeSource = useMemo(() => {
        if (connectionState.inProgress && connectionState.fromNodeId && connectionState.fromHandleId) {
            return {
                nodeId: connectionState.fromNodeId,
                handleId: connectionState.fromHandleId,
            };
        }

        return hoveredSocket;
    }, [connectionState.fromHandleId, connectionState.fromNodeId, connectionState.inProgress, hoveredSocket]);

    const compatibilityState = useMemo<SocketCompatibilityState>(() => {
        if (!activeSource) {
            return "neutral";
        }

        if (activeSource.nodeId === node.id && activeSource.handleId === handleId) {
            return "source";
        }

        if (socket.side !== "input") {
            return "dimmed";
        }

        const validation = canConnect({
            nodes,
            edges,
            sourceNodeId: activeSource.nodeId,
            targetNodeId: node.id,
            sourceHandleId: activeSource.handleId,
            targetHandleId: handleId,
        });

        return validation.allowed ? "compatible" : "dimmed";
    }, [activeSource, edges, handleId, node.id, nodes, socket.side]);

    const handleStyle = projectEditorStyles.socket.flowHandle(socket.color, socket.side) as CSSProperties;

    const isValidConnection = useCallback(
        (connection: Connection | { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }) => {
            return canConnect({
                nodes,
                edges,
                sourceNodeId: connection.source,
                targetNodeId: connection.target,
                sourceHandleId: connection.sourceHandle ?? null,
                targetHandleId: connection.targetHandle ?? null,
            }).allowed;
        },
        [edges, nodes],
    );

    const handleMouseEnter = useCallback(() => {
        if (preview || socket.side !== "output" || connectionState.inProgress) {
            return;
        }

        setHoveredSocket(node.id, handleId);
    }, [connectionState.inProgress, handleId, node.id, preview, setHoveredSocket, socket.side]);

    const handleMouseLeave = useCallback(() => {
        if (preview || socket.side !== "output" || connectionState.inProgress) {
            return;
        }

        clearHoveredSocket();
    }, [clearHoveredSocket, connectionState.inProgress, preview, socket.side]);

    return (
        <Box
            title={socket.description ? `${socket.label}: ${socket.description}` : socket.label}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={projectEditorStyles.socket.container(socket.color, compatibilityState, socket.side)}
        >
            {socket.side === "input" ? (
                preview ? (
                    <Box component="span" sx={projectEditorStyles.socket.staticHandle(socket.color)} />
                ) : (
                    <Handle
                        id={handleId}
                        type="target"
                        position={Position.Left}
                        className={`project-node-handle${compatibilityState === "compatible" ? " is-compatible" : ""}${compatibilityState === "source" ? " is-source" : ""}${compatibilityState === "dimmed" ? " is-dimmed" : ""}`}
                        isConnectable={!preview}
                        isConnectableStart={false}
                        isConnectableEnd
                        isValidConnection={isValidConnection}
                        style={handleStyle}
                        data-socket-type={socket.socketType}
                    />
                )
            ) : null}

            <Stack spacing={0.15} sx={projectEditorStyles.socket.labelStack(socket.side)}>
                <Typography sx={projectEditorStyles.socket.label(compatibilityState, socket.side)}>
                    {socket.label}
                    {socket.required ? " *" : ""}
                </Typography>
                <Typography sx={projectEditorStyles.socket.type(socket.color, socket.side)}>
                    {socket.socketType}
                </Typography>
            </Stack>

            {socket.side === "output" ? (
                preview ? (
                    <Box component="span" sx={projectEditorStyles.socket.staticHandle(socket.color)} />
                ) : (
                    <Handle
                        id={handleId}
                        type="source"
                        position={Position.Right}
                        className={`project-node-handle${compatibilityState === "compatible" ? " is-compatible" : ""}${compatibilityState === "source" ? " is-source" : ""}${compatibilityState === "dimmed" ? " is-dimmed" : ""}`}
                        isConnectable={!preview}
                        isConnectableStart
                        isConnectableEnd={false}
                        isValidConnection={isValidConnection}
                        style={handleStyle}
                        data-socket-type={socket.socketType}
                    />
                )
            ) : null}
        </Box>
    );
}