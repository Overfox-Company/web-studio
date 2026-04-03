"use client";

import { Box } from "@mui/material";
import {
    ApiIcon,
    CodeIcon,
    DatabaseIcon,
    File02Icon,
} from "@hugeicons-pro/core-solid-standard";

import { projectEditorStyles } from "@/src/customization/project-editor";
import { ProjectIcon } from "@/src/features/project-editor/components/ui/ProjectIcon";
import { NODE_VISUALS } from "@/src/features/project-editor/utils/node-colors";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";

const ICONS = {
    page: File02Icon,
    api: ApiIcon,
    database: DatabaseIcon,
    action: CodeIcon,
} as const;

export function NodeIcon({ kind }: { kind: ProjectNodeKind }) {
    const Icon = ICONS[kind];
    const token = NODE_VISUALS[kind];

    return (
        <Box sx={projectEditorStyles.nodeIcon.wrapper(token.accent)}>
            <ProjectIcon icon={Icon} size={18} strokeWidth={0} />
        </Box>
    );
}
