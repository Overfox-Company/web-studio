"use client";

import { Box, Stack, Typography } from "@mui/material";

import { NodeHeader } from "@/src/features/project-editor/nodes/base/NodeHeader";
import { NodeMetaRow } from "@/src/features/project-editor/nodes/base/NodeMetaRow";
import { SocketHandle } from "@/src/features/project-editor/nodes/base/SocketHandle";
import { NODE_VISUALS } from "@/src/features/project-editor/utils/node-colors";
import { getNodeSocketsBySide } from "@/src/features/project-editor/utils/node-sockets";
import type { ProjectNode } from "@/src/features/project-editor/types/editor.types";

interface BaseNodeCardProps {
    node: ProjectNode;
    selected?: boolean;
    dragging?: boolean;
    preview?: boolean;
    meta: Array<{ label: string; value: string }>;
}

export function BaseNodeCard({ node, selected = false, dragging = false, preview = false, meta }: BaseNodeCardProps) {
    const token = NODE_VISUALS[node.kind];
    const inputSockets = getNodeSocketsBySide(node.kind, "input");
    const outputSockets = getNodeSocketsBySide(node.kind, "output");

    return (
        <Box
            sx={{
                width: 372,
                borderRadius: "20px",
                border: preview
                    ? `1px dashed ${token.accent}`
                    : `1px solid ${selected ? token.accent : "rgba(255, 255, 255, 0.72)"}`,
                background: preview
                    ? "rgba(248, 250, 252, 0.84)"
                    : "linear-gradient(180deg, rgba(240, 244, 249, 0.98) 0%, rgba(228, 234, 242, 0.98) 100%)",
                boxShadow: preview
                    ? "0 14px 30px rgba(15, 23, 42, 0.08)"
                    : dragging
                        ? "0 18px 36px rgba(15, 23, 42, 0.08)"
                        : "0 14px 30px rgba(15, 23, 42, 0.07)",
                opacity: preview ? 0.78 : dragging ? 0.96 : 1,
                overflow: "visible",
                transition: dragging
                    ? "box-shadow 80ms linear, border-color 80ms linear, opacity 80ms linear"
                    : "box-shadow 160ms ease, border-color 160ms ease, opacity 120ms ease",
                willChange: dragging ? "box-shadow, opacity" : "auto",
                backdropFilter: "blur(14px)",
            }}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "98px minmax(0, 1fr) 98px",
                    gap: 1.1,
                    alignItems: "start",
                    p: 1.15,
                }}
            >
                <Stack spacing={0.7} sx={{ pt: 0.95 }}>
                    <Typography
                        sx={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "rgba(71, 85, 105, 0.72)",
                        }}
                    >
                        Inputs
                    </Typography>
                    {inputSockets.map((socket) => (
                        <SocketHandle key={socket.id} node={node} socket={socket} preview={preview} />
                    ))}
                </Stack>

                <Stack spacing={1} sx={{ minWidth: 0 }}>
                    <NodeHeader kind={node.kind} name={node.name} token={token} />
                    <Box
                        sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.94)",
                            p: 1,
                            borderRadius: "14px",
                            border: "1px solid rgba(226, 232, 240, 0.92)",
                        }}
                    >
                        <Typography sx={{ fontSize: "0.88rem", lineHeight: 1.55, color: "#5b6472", minHeight: 44 }}>
                            {node.description}
                        </Typography>
                        <Stack spacing={1.1}>
                            {meta.map((item) => (
                                <NodeMetaRow key={item.label} label={item.label} value={item.value} />
                            ))}
                        </Stack>
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.88)",
                            p: 1,
                            borderRadius: "14px",
                            border: "1px solid rgba(226, 232, 240, 0.92)",
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography sx={{ fontSize: "0.74rem", color: "#98a2b3", fontFamily: "var(--font-ibm-plex-mono)" }}>
                                {node.id.slice(0, 8)}
                            </Typography>
                            <Typography sx={{ fontSize: "0.74rem", color: "#98a2b3" }}>
                                {new Date(node.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>

                <Stack spacing={0.7} sx={{ pt: 0.95 }}>
                    <Typography
                        sx={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "rgba(71, 85, 105, 0.72)",
                            textAlign: "right",
                        }}
                    >
                        Outputs
                    </Typography>
                    {outputSockets.map((socket) => (
                        <SocketHandle key={socket.id} node={node} socket={socket} preview={preview} />
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}
