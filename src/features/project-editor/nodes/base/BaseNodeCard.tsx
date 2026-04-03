"use client";

import { Handle, Position } from "@xyflow/react";
import { Box, Stack, Typography } from "@mui/material";

import { NodeHeader } from "@/src/features/project-editor/nodes/base/NodeHeader";
import { NodeMetaRow } from "@/src/features/project-editor/nodes/base/NodeMetaRow";
import { NODE_VISUALS } from "@/src/features/project-editor/utils/node-colors";
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

    return (
        <Box
            sx={{
                width: 292,
                borderRadius: "16px",
                border: preview
                    ? `1px dashed ${token.accent}`
                    : `1px solid ${selected ? token.accent : "rgba(255, 113, 12, 0)"}`,
                background: preview ? "rgba(255,255,255,0.8)" : "rgb(219, 222, 230)",
                boxShadow: preview
                    ? "0 14px 30px rgba(15, 23, 42, 0.08)"
                    : dragging
                        ? "0 18px 36px rgba(15, 23, 42, 0.08)"
                        : "0 8px 24px rgba(15, 23, 42, 0.05)",
                opacity: preview ? 0.78 : dragging ? 0.96 : 1,
                overflow: "hidden",
                transition: dragging
                    ? "box-shadow 80ms linear, border-color 80ms linear, opacity 80ms linear"
                    : "box-shadow 160ms ease, border-color 160ms ease, opacity 120ms ease",
                willChange: dragging ? "box-shadow, opacity" : "auto",
            }}
        >
            {!preview ? (
                <>
                    <Handle type="target" position={Position.Left} id="target-left" className="project-node-handle" />
                    <Handle type="source" position={Position.Right} id="source-right" className="project-node-handle" />
                </>
            ) : null}

            <Stack spacing={1} sx={{ p: 1, backgroundColor: 'rgb(219,222,230,1)' }}>
                <NodeHeader kind={node.kind} name={node.name} token={token} />
                <Box style={{
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '12px'
                }}>
                    <Typography sx={{ fontSize: "0.88rem", lineHeight: 1.55, color: "#5b6472", minHeight: 44 }}>
                        {node.description}
                    </Typography>
                    <Stack spacing={1.1}>
                        {meta.map((item) => (
                            <NodeMetaRow key={item.label} label={item.label} value={item.value} />
                        ))}
                    </Stack>
                </Box>
                <Box style={{
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '12px'
                }}>
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
        </Box>
    );
}
