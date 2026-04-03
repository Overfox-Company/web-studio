"use client";

import { useRouter } from "next/navigation";
import { Stack } from "@mui/material";
import { Download01Icon } from "@hugeicons-pro/core-solid-standard";

import { projectEditorStyles } from "@/src/customization/project-editor";
import { ProjectIcon } from "@/src/features/project-editor/components/ui/ProjectIcon";
import { StatusBadge, TextField, ToolbarButton } from "@/src/features/project-editor/components/ui/primitives";
import { useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";

interface EditorTopbarProps {
    onCompile: () => void;
    onFitView: () => void;
    compileState: "idle" | "compiling" | "success" | "error";
    compileMessage: string | null;
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

function getCompileLabel(compileState: EditorTopbarProps["compileState"]) {
    switch (compileState) {
        case "compiling":
            return "Compiling...";
        case "success":
            return "Compile ready";
        case "error":
            return "Retry compile";
        default:
            return "Compile";
    }
}

export function EditorTopbar({ onCompile, onFitView, compileState, compileMessage }: EditorTopbarProps) {
    const router = useRouter();
    const projectName = useProjectEditorStore((state) => state.project.name);
    const saveState = useProjectEditorStore((state) => state.ui.saveState);
    const projectId = useProjectEditorStore((state) => state.project.projectId);
    const setProjectName = useProjectEditorStore((state) => state.setProjectName);

    return (
        <Stack
            direction={{ xs: "column", lg: "row" }}
            alignItems={{ xs: "stretch", lg: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={projectEditorStyles.topbar.root}
        >
            <Stack spacing={1} minWidth={0}>

                <TextField
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="Project name"
                    sx={projectEditorStyles.topbar.projectNameField}
                />
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap>
                <StatusBadge label={getSaveLabel(saveState)} />
                {compileMessage ? <StatusBadge label={compileMessage} /> : null}
                <ToolbarButton variant="outlined" onClick={onFitView}>
                    Fit canvas
                </ToolbarButton>
                <ToolbarButton variant="outlined" onClick={() => router.push(`/projects/${projectId}/components`)}>
                    Components
                </ToolbarButton>
                <ToolbarButton variant="contained" onClick={onCompile} disabled={compileState === "compiling"} startIcon={<ProjectIcon icon={Download01Icon} size={18} />}>
                    {getCompileLabel(compileState)}
                </ToolbarButton>
            </Stack>
        </Stack>
    );
}
