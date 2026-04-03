"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Box, Button, Stack, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { BASE_COMPONENT_LIBRARY_ITEMS } from "@/src/features/component-library/utils/create-component-defaults";
import { useComponentEditorStore } from "@/src/features/component-library/store/component-editor.store";
import { useComponentLibraryStore } from "@/src/features/component-library/store/component-library.store";

function BasePaletteItem({ type, label, description, accent }: { type: string; label: string; description: string; accent: string }) {
    const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
        id: `base-component-${type}`,
        data: { source: "base-component-palette", baseType: type },
    });

    return (
        <Box
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            sx={{
                px: 1.2,
                py: 1.1,
                borderRadius: 2,
                border: `1px solid ${isDragging ? accent : "rgba(148, 163, 184, 0.18)"}`,
                background: isDragging ? "rgba(15, 23, 42, 0.88)" : "rgba(15, 23, 42, 0.58)",
                cursor: "grab",
                transform: CSS.Translate.toString(transform),
                boxShadow: isDragging ? `0 12px 30px -18px ${accent}` : "none",
            }}
        >
            <Stack spacing={0.35}>
                <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, color: "#f8fafc" }}>{label}</Typography>
                <Typography sx={{ fontSize: "0.74rem", color: "rgba(226, 232, 240, 0.68)", lineHeight: 1.45 }}>{description}</Typography>
            </Stack>
        </Box>
    );
}

export function ComponentLibrarySidebar() {
    const snapshot = useComponentLibraryStore((state) => state.snapshot);
    const libraryId = useComponentEditorStore((state) => state.libraryId);
    const componentId = useComponentEditorStore((state) => state.componentId);
    const setSelection = useComponentEditorStore((state) => state.setSelection);

    const libraries = Object.values(snapshot.librariesById);
    const activeLibrary = libraryId ? snapshot.librariesById[libraryId] : null;
    const activeComponents = activeLibrary
        ? activeLibrary.componentIds.map((id) => snapshot.componentsById[id]).filter(Boolean)
        : [];

    return (
        <Box sx={designEditorStyles.layers.root}>
            <Stack spacing={0.6} sx={designEditorStyles.layers.header}>
                <Typography sx={designEditorStyles.layers.headerEyebrow}>Library Builder</Typography>
                <Typography sx={designEditorStyles.layers.headerBody}>Base components are default templates. Saved components belong to the active library.</Typography>
            </Stack>

            <Stack spacing={1} sx={designEditorStyles.layers.list}>
                <Stack spacing={0.45}>
                    <Typography sx={designEditorStyles.layers.typeLabel}>Libraries</Typography>
                    {libraries.map((library) => (
                        <Button
                            key={library.id}
                            variant={library.id === libraryId ? "contained" : "text"}
                            onClick={() => setSelection({ libraryId: library.id, componentId: library.componentIds[0] ?? null })}
                            sx={designEditorStyles.topbar.toolButton(library.id === libraryId)}
                        >
                            {library.name}
                        </Button>
                    ))}
                </Stack>

                <Stack spacing={0.45}>
                    <Typography sx={designEditorStyles.layers.typeLabel}>Saved Components</Typography>
                    {activeComponents.map((component) => (
                        <Button
                            key={component.id}
                            variant={component.id === componentId ? "contained" : "text"}
                            onClick={() => setSelection({ componentId: component.id })}
                            sx={designEditorStyles.topbar.toolButton(component.id === componentId)}
                        >
                            {component.name}
                        </Button>
                    ))}
                </Stack>

                <Stack spacing={0.45}>
                    <Typography sx={designEditorStyles.layers.typeLabel}>Base Components</Typography>
                    <Stack spacing={0.8}>
                        {BASE_COMPONENT_LIBRARY_ITEMS.map((item) => (
                            <BasePaletteItem key={item.type} {...item} />
                        ))}
                    </Stack>
                </Stack>
            </Stack>
        </Box>
    );
}
