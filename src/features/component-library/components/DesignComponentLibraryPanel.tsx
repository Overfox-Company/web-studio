"use client";

import { useMemo, useState } from "react";

import { ArrowRight01Icon, CodeSquareIcon, Search01Icon } from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { Box, Button, InputBase, Stack, Typography } from "@mui/material";

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
            <Stack spacing={0.6} sx={designEditorStyles.layers.subsectionHeader}>
                <Typography sx={designEditorStyles.layers.subsectionTitle}>Components</Typography>
                <Typography sx={designEditorStyles.layers.itemMeta}>{components.length}</Typography>
            </Stack>

            <Stack spacing={0.8} sx={designEditorStyles.layers.list}>
                <Box sx={designEditorStyles.layers.searchShell}>
                    <Box sx={designEditorStyles.layers.searchIcon}>
                        <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.6} />
                    </Box>
                    <InputBase
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar componentes guardados"
                        sx={designEditorStyles.layers.searchInput}
                    />
                </Box>

                {components.map(({ component, library }) => (
                    <Stack key={component.id} spacing={0.85} sx={designEditorStyles.layers.libraryItem}>
                        <Stack direction="row" spacing={0.85} alignItems="center">
                            <Box sx={designEditorStyles.layers.itemIcon(false)}>
                                <HugeiconsIcon icon={CodeSquareIcon} size={16} strokeWidth={1.7} />
                            </Box>

                            <Stack sx={{ minWidth: 0, flex: 1 }}>
                                <Typography sx={designEditorStyles.layers.name(false)}>{component.name}</Typography>
                                <Typography sx={designEditorStyles.layers.typeLabel}>
                                    {(library?.name ?? "Library")} • {component.baseType}
                                </Typography>
                            </Stack>

                            <Typography sx={designEditorStyles.layers.itemMeta}>
                                {component.baseType}
                            </Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                            <Typography sx={designEditorStyles.layers.headerBody}>
                                Edita este bloque en el builder y vuelve a insertarlo desde la librería.
                            </Typography>

                            <Button variant="text" size="small" onClick={() => handleOpen(component.id)} sx={designEditorStyles.layers.libraryAction}>
                                <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.9} />
                                <Typography sx={designEditorStyles.layers.libraryActionLabel}>Open</Typography>
                            </Button>
                        </Stack>
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
}
