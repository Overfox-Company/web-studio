"use client";

import { Box } from "@mui/material";

import { projectEditorStyles } from "@/src/customization/project-editor";
import { NODE_VISUALS } from "@/src/features/project-editor/utils/node-colors";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";

export function NodeBadge({ kind }: { kind: ProjectNodeKind }) {
    const token = NODE_VISUALS[kind];

    return (
        <Box sx={projectEditorStyles.nodeBadge.wrapper}>
            <Box sx={projectEditorStyles.nodeBadge.dot(token.accent)} />

        </Box>
    );
}
