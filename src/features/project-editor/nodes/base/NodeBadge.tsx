"use client";

import { Box, Typography } from "@mui/material";

import { NODE_VISUALS } from "@/src/features/project-editor/utils/node-colors";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";

export function NodeBadge({ kind }: { kind: ProjectNodeKind }) {
    const token = NODE_VISUALS[kind];

    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                paddingRight: "4px",
                borderRadius: "4px",
            }}
        >
            <Box
                sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "20px",
                    background: token.accent,
                }}
            />

        </Box>
    );
}
