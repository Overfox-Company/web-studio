"use client";

import { useEffect } from "react";

import { DndContext, PointerSensor, pointerWithin, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { Box, Stack, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { ComponentEditorTopbar } from "@/src/features/component-library/components/ComponentEditorTopbar";
import { ComponentLibrarySidebar } from "@/src/features/component-library/components/ComponentLibrarySidebar";
import { useComponentLibraryComponentPersistence } from "@/src/features/component-library/hooks/use-component-library-component-persistence";
import { useComponentLibraryPersistence } from "@/src/features/component-library/hooks/use-component-library-persistence";
import { useComponentEditorStore } from "@/src/features/component-library/store/component-editor.store";
import { useComponentLibraryStore } from "@/src/features/component-library/store/component-library.store";
import type { BaseComponentType } from "@/src/features/component-library/types/component.types";
import { DesignCanvas } from "@/src/features/design-editor/components/DesignCanvas";
import { DesignInspectorPanel } from "@/src/features/design-editor/components/DesignInspectorPanel";
import { useLockBodyScroll } from "@/src/lib/hooks/use-lock-body-scroll";

interface ComponentEditorLayoutProps {
    projectId: string;
}

function ComponentWorkspaceCanvas({ hasLibrary, activeComponentName }: { hasLibrary: boolean; activeComponentName: string | null }) {
    const { setNodeRef, isOver } = useDroppable({ id: "component-library-canvas" });

    return (
        <Box
            ref={setNodeRef}
            sx={{
                height: "100%",
                p: 2,
                background: "linear-gradient(180deg, rgba(2, 6, 23, 0.86) 0%, rgba(15, 23, 42, 0.98) 100%)",
            }}
        >
            <Box
                sx={{
                    height: "100%",
                    overflow: "hidden",
                    borderRadius: 4,
                    border: `1px solid ${isOver ? "rgba(96, 165, 250, 0.7)" : "rgba(148, 163, 184, 0.14)"}`,
                    background: "rgba(2, 6, 23, 0.42)",
                    boxShadow: isOver ? "0 0 0 1px rgba(96, 165, 250, 0.2)" : "inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
            >
                {activeComponentName ? (
                    <DesignCanvas viewportMode="desktop" canvasMode="workspace" />
                ) : (
                    <Stack alignItems="center" justifyContent="center" spacing={1.1} sx={{ height: "100%", px: 4, textAlign: "center" }}>
                        <Typography sx={{ color: "rgba(226, 232, 240, 0.82)", fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                            {hasLibrary ? "Workspace Ready" : "Create A Library"}
                        </Typography>
                        <Typography sx={{ color: "#f8fafc", fontSize: "1.08rem", fontWeight: 700 }}>
                            {hasLibrary ? "Drag a base component into the workspace" : "Create a library, then drag a base component here"}
                        </Typography>
                        <Typography sx={{ color: "rgba(226, 232, 240, 0.64)", maxWidth: 420, lineHeight: 1.7 }}>
                            Default templates live in the left sidebar. Dropping one here creates a saved user component inside the active library.
                        </Typography>
                    </Stack>
                )}
            </Box>
        </Box>
    );
}

export function ComponentEditorLayout({ projectId }: ComponentEditorLayoutProps) {
    useLockBodyScroll();

    const { saveState } = useComponentLibraryPersistence({ projectId });
    const snapshot = useComponentLibraryStore((state) => state.snapshot);
    const createLibrary = useComponentLibraryStore((state) => state.createLibrary);
    const createComponent = useComponentLibraryStore((state) => state.createComponent);
    const libraryId = useComponentEditorStore((state) => state.libraryId);
    const componentId = useComponentEditorStore((state) => state.componentId);
    const setSelection = useComponentEditorStore((state) => state.setSelection);
    const ensureValidSelection = useComponentEditorStore((state) => state.ensureValidSelection);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    const activeLibrary = libraryId ? snapshot.librariesById[libraryId] : null;
    const activeComponent = componentId ? snapshot.componentsById[componentId] : null;

    useEffect(() => {
        ensureValidSelection(snapshot);
    }, [ensureValidSelection, snapshot]);

    useComponentLibraryComponentPersistence({ componentId });

    function handleCreateLibrary() {
        const nextLibraryId = createLibrary();
        setSelection({ libraryId: nextLibraryId, componentId: null });
    }

    function handleCreateComponent(baseType: BaseComponentType) {
        const targetLibraryId = libraryId ?? createLibrary();
        const nextComponentId = createComponent(targetLibraryId, baseType);

        if (!nextComponentId) {
            return;
        }

        setSelection({ libraryId: targetLibraryId, componentId: nextComponentId });
    }

    function handleDragEnd(event: DragEndEvent) {
        if (event.active.data.current?.source !== "base-component-palette") {
            return;
        }

        if (event.over?.id !== "component-library-canvas") {
            return;
        }

        const baseType = event.active.data.current?.baseType as BaseComponentType | undefined;

        if (!baseType) {
            return;
        }

        handleCreateComponent(baseType);
    }

    return (
        <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
            <Box sx={designEditorStyles.layout.shell}>
                <ComponentEditorTopbar
                    projectId={projectId}
                    saveState={saveState}
                    onCreateLibrary={handleCreateLibrary}
                />

                <Box sx={designEditorStyles.layout.workspace}>
                    <Box sx={designEditorStyles.layout.layersSlot}>
                        <ComponentLibrarySidebar />
                    </Box>

                    <Box sx={designEditorStyles.layout.canvasSlot}>
                        <ComponentWorkspaceCanvas hasLibrary={Boolean(activeLibrary)} activeComponentName={activeComponent?.name ?? null} />
                    </Box>

                    <Box sx={designEditorStyles.layout.inspectorSlot}>
                        {activeComponent ? (
                            <DesignInspectorPanel />
                        ) : (
                            <Stack spacing={1} sx={{ height: "100%", justifyContent: "center", px: 3, background: "rgba(22, 22, 24, 0.96)", color: "#f5f7fb" }}>
                                <Typography sx={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(173, 187, 215, 0.58)" }}>
                                    Properties
                                </Typography>
                                <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
                                    Select or create a component
                                </Typography>
                                <Typography sx={{ color: "rgba(173, 187, 215, 0.82)", lineHeight: 1.7 }}>
                                    The inspector edits the visual properties of the selected node inside the active library component.
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Box>
        </DndContext>
    );
}
