"use client";

import { Box, Stack, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { sharedCustomization } from "@/src/customization/shared";
import { DesignComponentLibraryPanel } from "@/src/features/component-library/components/DesignComponentLibraryPanel";
import { useComponentLibraryPersistence } from "@/src/features/component-library/hooks/use-component-library-persistence";
import { DesignCanvas } from "@/src/features/design-editor/components/DesignCanvas";
import { DesignEditorFloatingToolbar, DesignEditorTopbar } from "@/src/features/design-editor/components/DesignEditorTopbar";
import { DesignInspectorPanel } from "@/src/features/design-editor/components/DesignInspectorPanel";
import { DesignLayersPanel } from "@/src/features/design-editor/components/DesignLayersPanel";
import { useDesignEditorPersistence } from "@/src/features/design-editor/hooks/use-design-editor-persistence";
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document";
import { defaultDesignPersistenceAdapter, loadProjectSnapshot } from "@/src/features/design-editor/utils/design-document-persistence";
import { useProjectCompile } from "@/src/features/project-compile/use-project-compile";
import { useLockBodyScroll } from "@/src/lib/hooks/use-lock-body-scroll";
interface DesignEditorLayoutProps {
    projectId: string;
    viewId: string;
}

export function DesignEditorLayout({ projectId, viewId }: DesignEditorLayoutProps) {
    useLockBodyScroll();

    useComponentLibraryPersistence({ projectId });
    const { loadState, saveState, viewNode, viewportMode, setViewportMode } = useDesignEditorPersistence({ projectId, viewId });
    const document = useDesignDocumentStore((state) => state.document);
    const { compileState, compileMessage, runCompile } = useProjectCompile({
        getProjectSnapshot: () => loadProjectSnapshot(projectId, defaultDesignPersistenceAdapter),
        getDocumentOverride: () => document
            ? {
                pageId: viewId,
                document,
            }
            : null,
    });

    if (loadState !== "ready" || !viewNode) {
        return (
            <Box sx={designEditorStyles.layout.loadingShell}>
                <Stack spacing={1} sx={designEditorStyles.layout.loadingCard}>
                    <Typography sx={designEditorStyles.layout.loadingEyebrow}>
                        Design Editor
                    </Typography>
                    <Typography sx={designEditorStyles.layout.loadingTitle}>
                        {loadState === "loading" ? "Cargando documento visual..." : "No se pudo abrir esta vista."}
                    </Typography>
                    <Typography sx={designEditorStyles.layout.loadingBody}>
                        {loadState === "loading"
                            ? "Preparando la vista y su documento de diseño asociado."
                            : "Verifica que el nodo exista dentro del Project Editor y vuelve a intentarlo."}
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box sx={designEditorStyles.layout.shell}>
            <DesignEditorTopbar
                projectId={projectId}
                viewId={viewId}
                viewName={viewNode.name}
                saveState={saveState}
                compileState={compileState}
                compileMessage={compileMessage}
                onCompile={runCompile}
                viewportMode={viewportMode}
                onViewportModeChange={setViewportMode}
            />

            <Box sx={designEditorStyles.layout.workspace}>
                <Box sx={designEditorStyles.layout.layersSlot}>
                    <Stack sx={{ height: "100%" }}>
                        <Box sx={{ minHeight: 0, flex: 1.1 }}>
                            <DesignLayersPanel />
                        </Box>
                        <Box sx={{ minHeight: 0, flex: 0.9, borderTop: `1px solid ${sharedCustomization.border.muted}` }}>
                            <DesignComponentLibraryPanel projectId={projectId} />
                        </Box>
                    </Stack>
                </Box>

                <Box sx={designEditorStyles.layout.canvasSlot}>
                    <DesignCanvas viewportMode={viewportMode} />
                </Box>

                <Box sx={designEditorStyles.layout.inspectorSlot}>
                    <DesignInspectorPanel />
                </Box>

                <DesignEditorFloatingToolbar />
            </Box>
        </Box>
    );
}