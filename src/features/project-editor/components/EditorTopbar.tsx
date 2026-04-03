"use client";

import { Stack, Typography } from "@mui/material";
import { Download01Icon } from "@hugeicons-pro/core-solid-standard";

import { ProjectIcon } from "@/src/features/project-editor/components/ui/ProjectIcon";
import { StatusBadge, TextField, ToolbarButton } from "@/src/features/project-editor/components/ui/primitives";
import { useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";

interface EditorTopbarProps {
    projectId: string;
    onBuild: () => void;
    onFitView: () => void;
}

function getSaveLabel(saveState: string) {
    switch (saveState) {
        case "saving":
            return "Saving";
        case "unsaved":
            return "Unsaved";
        case "error":
            return "Save error";
        default:
            return "Saved";
    }
}

export function EditorTopbar({ projectId, onBuild, onFitView }: EditorTopbarProps) {
    const projectName = useProjectEditorStore((state) => state.project.name);
    const saveState = useProjectEditorStore((state) => state.ui.saveState);
    const setProjectName = useProjectEditorStore((state) => state.setProjectName);

    return (
        <Stack
            direction={{ xs: "column", lg: "row" }}
            alignItems={{ xs: "stretch", lg: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{
                px: { xs: 2, lg: 3 },
                py: 2,
                borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(18px)",
            }}
        >
            <Stack spacing={1} minWidth={0}>
                <Typography sx={{ fontSize: "0.76rem", color: "#98a2b3", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    Projects / {projectId} / Editor
                </Typography>
                <TextField
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="Project name"
                    sx={{ maxWidth: 360 }}
                />
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap>
                <StatusBadge label={getSaveLabel(saveState)} />
                <ToolbarButton variant="outlined" onClick={onFitView}>
                    Fit canvas
                </ToolbarButton>
                <ToolbarButton variant="contained" onClick={onBuild} startIcon={<ProjectIcon icon={Download01Icon} size={18} />}>
                    Build
                </ToolbarButton>
            </Stack>
        </Stack>
    );
}
