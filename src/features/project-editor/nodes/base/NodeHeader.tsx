"use client";

import { Box, Stack, Typography } from "@mui/material";

import { projectEditorStyles } from "@/src/customization/project-editor";
import { NodeBadge } from "@/src/features/project-editor/nodes/base/NodeBadge";
import { NodeIcon } from "@/src/features/project-editor/nodes/base/NodeIcon";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";
import type { NodeVisualToken } from "@/src/features/project-editor/utils/node-colors";

export function NodeHeader({ kind, name, token }: { kind: ProjectNodeKind; name: string; token: NodeVisualToken }) {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1.25} minWidth={0}>
                <NodeIcon kind={kind} />
                <Box sx={projectEditorStyles.nodeHeader.column}>
                    <Typography sx={projectEditorStyles.nodeHeader.title}>
                        {name}
                    </Typography>
                    <Box sx={projectEditorStyles.nodeHeader.kindChip(token.accentSoft)}>
                        <Typography sx={projectEditorStyles.nodeHeader.kindChipText(token.accent)}>
                            {kind.toUpperCase()}
                        </Typography>
                    </Box>
                </Box>
            </Stack>
            <NodeBadge kind={kind} />
        </Stack>
    );
}
