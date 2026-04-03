"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo } from "react";

import { Handle, Position, useConnection, type Connection } from "@xyflow/react";
import { Box, Stack, Typography } from "@mui/material";

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

    const isHighlighted = compatibilityState === "source" || compatibilityState === "compatible";
    const alignment = socket.side === "input" ? "flex-start" : "flex-end";

    const handleStyle = {
        top: "50%",
        left: socket.side === "input" ? 0 : undefined,
        right: socket.side === "output" ? 0 : undefined,
        transform: socket.side === "input" ? "translate(-55%, -50%)" : "translate(55%, -50%)",
        background: socket.color,
        borderColor: "rgba(255, 255, 255, 0.96)",
        boxShadow: `0 0 0 1px ${socket.color}26`,
        "--socket-color": socket.color,
    } as CSSProperties;

    const staticHandleStyle = {
        width: 12,
        height: 12,
        borderRadius: 999,
        background: socket.color,
        border: "2px solid rgba(255, 255, 255, 0.96)",
        boxShadow: `0 0 0 1px ${socket.color}26`,
        flexShrink: 0,
    } as const;

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
            sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: alignment,
                gap: 0.75,
                minHeight: 34,
                px: 1,
                py: 0.45,
                borderRadius: "12px",
                backgroundColor: isHighlighted ? "rgba(255, 255, 255, 0.94)" : "rgba(255, 255, 255, 0.7)",
                boxShadow: isHighlighted ? `0 0 0 1px ${socket.color}22` : "none",
                opacity: compatibilityState === "dimmed" ? 0.42 : 1,
                transition: "opacity 140ms ease, box-shadow 140ms ease, background-color 140ms ease",
            }}
        >
            {socket.side === "input" ? (
                preview ? (
                    <Box component="span" sx={staticHandleStyle} />
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

            <Stack spacing={0.15} sx={{ alignItems: alignment, minWidth: 0 }}>
                <Typography
                    sx={{
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: compatibilityState === "dimmed" ? "rgba(51, 65, 85, 0.55)" : "#334155",
                        textAlign: socket.side === "input" ? "left" : "right",
                    }}
                >
                    {socket.label}
                    {socket.required ? " *" : ""}
                </Typography>
                <Typography
                    sx={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: socket.color,
                        textAlign: socket.side === "input" ? "left" : "right",
                    }}
                >
                    {socket.socketType}
                </Typography>
            </Stack>

            {socket.side === "output" ? (
                preview ? (
                    <Box component="span" sx={staticHandleStyle} />
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