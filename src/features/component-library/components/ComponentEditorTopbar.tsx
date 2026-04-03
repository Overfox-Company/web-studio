"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { useComponentEditorStore } from "@/src/features/component-library/store/component-editor.store";
import { useComponentLibraryStore } from "@/src/features/component-library/store/component-library.store";

interface ComponentEditorTopbarProps {
    projectId: string;
    saveState: "saved" | "saving" | "error";
    onCreateLibrary: () => void;
}

function getSaveLabel(saveState: ComponentEditorTopbarProps["saveState"]) {
    switch (saveState) {
        case "saving":
            return "Saving";
        case "error":
            return "Save error";
        default:
            return "Saved";
    }
}

export function ComponentEditorTopbar({ projectId, saveState, onCreateLibrary }: ComponentEditorTopbarProps) {
    const router = useRouter();
    const snapshot = useComponentLibraryStore((state) => state.snapshot);
    const updateLibrary = useComponentLibraryStore((state) => state.updateLibrary);
    const updateComponentMeta = useComponentLibraryStore((state) => state.updateComponentMeta);
    const libraryId = useComponentEditorStore((state) => state.libraryId);
    const componentId = useComponentEditorStore((state) => state.componentId);

    const activeLibrary = libraryId ? snapshot.librariesById[libraryId] : null;
    const activeComponent = componentId ? snapshot.componentsById[componentId] : null;

    return (
        <Box sx={designEditorStyles.topbar.root}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={designEditorStyles.topbar.leftGroup}>
                <Button variant="outlined" onClick={() => router.push(`/projects/${projectId}/editor`)} sx={designEditorStyles.topbar.chromeButton}>
                    Back
                </Button>

                <Stack spacing={0.25} sx={designEditorStyles.topbar.meta}>
                    <Typography sx={designEditorStyles.topbar.eyebrow}>Library Builder</Typography>
                    <Typography sx={designEditorStyles.topbar.title}>Base templates become saved user components inside the active library</Typography>
                </Stack>

                <Box sx={designEditorStyles.topbar.status(saveState)}>{getSaveLabel(saveState)}</Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={designEditorStyles.topbar.rightGroup}>
                {activeLibrary ? (
                    <TextField
                        value={activeLibrary.name}
                        onChange={(event) => updateLibrary(activeLibrary.id, { name: event.target.value })}
                        size="small"
                        placeholder="Library name"
                    />
                ) : null}
                {activeComponent ? (
                    <TextField
                        value={activeComponent.name}
                        onChange={(event) => updateComponentMeta(activeComponent.id, { name: event.target.value })}
                        size="small"
                        placeholder="Component name"
                    />
                ) : null}

                <Button variant="outlined" onClick={onCreateLibrary} sx={designEditorStyles.topbar.chromeButton}>New Library</Button>
            </Stack>
        </Box>
    );
}
