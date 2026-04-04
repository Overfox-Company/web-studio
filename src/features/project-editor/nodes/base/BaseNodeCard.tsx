"use client";

import { Box, Stack, Typography } from "@mui/material";

import { projectEditorStyles } from "@/src/customization/project-editor";
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
    onDoubleClick?: () => void;
}

export function BaseNodeCard({ node, selected = false, dragging = false, preview = false, meta, onDoubleClick }: BaseNodeCardProps) {
    const resolvedKind = node.kind === "view" ? "page" : node.kind;
    const token = NODE_VISUALS[resolvedKind];
    const inputSockets = getNodeSocketsBySide(resolvedKind, "input");
    const outputSockets = getNodeSocketsBySide(resolvedKind, "output");

    return (
        <Box
            sx={projectEditorStyles.baseNodeCard.root(token.accent, {
                selected,
                dragging,
                preview,
                clickable: Boolean(onDoubleClick),
            })}
            onDoubleClick={(event) => {
                event.stopPropagation();
                onDoubleClick?.();
            }}
        >
            <Box sx={projectEditorStyles.baseNodeCard.grid}>


                <Stack spacing={1} sx={projectEditorStyles.baseNodeCard.contentColumn}>
                    <NodeHeader kind={resolvedKind} name={node.name} token={token} />
                    <Box sx={projectEditorStyles.baseNodeCard.contentCard}>
                        <Typography sx={projectEditorStyles.baseNodeCard.description}>
                            {node.description}
                        </Typography>
                        <Stack spacing={1.1}>
                            {meta.map((item) => (
                                <NodeMetaRow key={item.label} label={item.label} value={item.value} />
                            ))}
                        </Stack>
                    </Box>
                    <Box sx={projectEditorStyles.baseNodeCard.footerCard}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography sx={projectEditorStyles.baseNodeCard.footerMono}>
                                {node.id.slice(0, 8)}
                            </Typography>
                            <Typography sx={projectEditorStyles.baseNodeCard.footerText}>
                                {new Date(node.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </Typography>
                        </Stack>
                    </Box>

                    <Stack spacing={0.7} sx={projectEditorStyles.baseNodeCard.sideColumn}>
                        <Typography sx={projectEditorStyles.baseNodeCard.sideLabel("left")}>
                            Inputs
                        </Typography>
                        {inputSockets.map((socket) => (
                            <SocketHandle key={socket.id} node={node} socket={socket} preview={preview} />
                        ))}
                    </Stack>
                    <Stack spacing={0.7} sx={projectEditorStyles.baseNodeCard.sideColumn}>
                        <Typography sx={projectEditorStyles.baseNodeCard.sideLabel("right")}>
                            Outputs
                        </Typography>
                        {outputSockets.map((socket) => (
                            <SocketHandle key={socket.id} node={node} socket={socket} preview={preview} />
                        ))}
                    </Stack>
                </Stack>


            </Box>
        </Box>
    );
}
