"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { useComponentEditorStore } from "@/src/features/component-library/store/component-editor.store";
import { useComponentLibraryStore } from "@/src/features/component-library/store/component-library.store";

interface DesignComponentLibraryPanelProps {
    projectId: string;
}

export function DesignComponentLibraryPanel({ projectId }: DesignComponentLibraryPanelProps) {
    const router = useRouter();
    const snapshot = useComponentLibraryStore((state) => state.snapshot);
    const setSelection = useComponentEditorStore((state) => state.setSelection);
    const [query, setQuery] = useState("");

    const components = useMemo(() => {
        const allComponents = Object.values(snapshot.componentsById).map((component) => {
            const library = snapshot.librariesById[component.libraryId] ?? null;

            return {
                component,
                library,
            };
        });

        if (!query.trim()) {
            return allComponents;
        }

        const normalizedQuery = query.toLowerCase();

        return allComponents.filter((item) => {
            return item.component.name.toLowerCase().includes(normalizedQuery)
                || item.component.baseType.toLowerCase().includes(normalizedQuery)
                || item.library?.name.toLowerCase().includes(normalizedQuery);
        });
    }, [query, snapshot.componentsById, snapshot.librariesById]);

    function handleOpen(componentId: string) {
        const component = snapshot.componentsById[componentId];
        setSelection({
            libraryId: component.libraryId,
            componentId: component.id,
        });
        router.push(`/projects/${projectId}/components`);
    }

    return (
        <Box sx={designEditorStyles.layers.root}>
            <Stack spacing={0.6} sx={designEditorStyles.layers.header}>
                <Typography sx={designEditorStyles.layers.headerEyebrow}>Components</Typography>
                <Typography sx={designEditorStyles.layers.headerBody}>The page editor can browse saved library components and jump into the library builder.</Typography>
            </Stack>

            <Stack spacing={0.8} sx={designEditorStyles.layers.list}>
                <TextField value={query} onChange={(event) => setQuery(event.target.value)} size="small" placeholder="Search components" />

                {components.map(({ component, library }) => (
                    <Stack key={component.id} spacing={0.45} sx={designEditorStyles.inspector.section}>
                        <Typography sx={designEditorStyles.layers.name(false)}>{component.name}</Typography>
                        <Typography sx={designEditorStyles.layers.typeLabel}>{library?.name ?? "Library"}</Typography>
                        <Stack direction="row" spacing={0.8}>
                            <Button variant="text" size="small" onClick={() => handleOpen(component.id)}>Open Builder</Button>
                        </Stack>
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
}
