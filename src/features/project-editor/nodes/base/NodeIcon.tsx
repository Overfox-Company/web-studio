"use client";

import { Box } from "@mui/material";
import {
    ApiIcon,
    CodeIcon,
    DatabaseIcon,
    File02Icon,
} from "@hugeicons-pro/core-solid-standard";

import { ProjectIcon } from "@/src/features/project-editor/components/ui/ProjectIcon";
import { NODE_VISUALS } from "@/src/features/project-editor/utils/node-colors";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";

const ICONS = {
    view: File02Icon,
    api: ApiIcon,
    database: DatabaseIcon,
    action: CodeIcon,
} as const;

export function NodeIcon({ kind }: { kind: ProjectNodeKind }) {
    const Icon = ICONS[kind];
    const token = NODE_VISUALS[kind];

    return (
        <Box
            sx={{
                width: 42,
                height: 42,
                borderRadius: "4px",
                display: "grid",
                placeItems: "center",
                //  background: token.accentSoft,
                color: token.accent,
                flexShrink: 0,
            }}
        >
            <ProjectIcon icon={Icon} size={18} strokeWidth={0} />
        </Box>
    );
}
