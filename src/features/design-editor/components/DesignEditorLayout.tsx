"use client";

import { Box, Stack, Typography } from "@mui/material";

import { DesignCanvas } from "@/src/features/design-editor/components/DesignCanvas";
import { DesignEditorTopbar } from "@/src/features/design-editor/components/DesignEditorTopbar";
import { DesignInspectorPanel } from "@/src/features/design-editor/components/DesignInspectorPanel";
import { DesignLayersPanel } from "@/src/features/design-editor/components/DesignLayersPanel";
import { useDesignEditorPersistence } from "@/src/features/design-editor/hooks/use-design-editor-persistence";

interface DesignEditorLayoutProps {
    projectId: string;
    viewId: string;
}

export function DesignEditorLayout({ projectId, viewId }: DesignEditorLayoutProps) {
    const { loadState, saveState, viewNode } = useDesignEditorPersistence({ projectId, viewId });

    if (loadState !== "ready" || !viewNode) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    px: 3,
                    background:
                        "radial-gradient(circle at top left, rgba(56, 189, 248, 0.08), transparent 28%), linear-gradient(180deg, #06080f 0%, #0f172a 100%)",
                }}
            >
                <Stack
                    spacing={1}
                    sx={{
                        width: "min(100%, 460px)",
                        p: 3,
                        borderRadius: "24px",
                        border: "1px solid rgba(148, 163, 184, 0.16)",
                        background: "rgba(8, 12, 19, 0.72)",
                        color: "#e2e8f0",
                    }}
                >
                    <Typography sx={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
                        Design Editor
                    </Typography>
                    <Typography sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
                        {loadState === "loading" ? "Cargando documento visual..." : "No se pudo abrir esta vista."}
                    </Typography>
                    <Typography sx={{ fontSize: "0.92rem", color: "#94a3b8", lineHeight: 1.7 }}>
                        {loadState === "loading"
                            ? "Preparando la vista y su documento de diseño asociado."
                            : "Verifica que el nodo exista dentro del Project Editor y vuelve a intentarlo."}
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "grid",
                gridTemplateRows: "auto minmax(0, 1fr)",
                background:
                    "radial-gradient(circle at top left, rgba(56, 189, 248, 0.08), transparent 26%), linear-gradient(180deg, #06080f 0%, #0f172a 100%)",
            }}
        >
            <DesignEditorTopbar projectId={projectId} viewName={viewNode.name} saveState={saveState} />

            <Box
                sx={{
                    minHeight: 0,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr) 340px" },
                    gridTemplateRows: { xs: "minmax(0, 56vh) auto auto", lg: "1fr" },
                    gridTemplateAreas: {
                        xs: '"canvas" "layers" "inspector"',
                        lg: '"layers canvas inspector"',
                    },
                }}
            >
                <Box sx={{ gridArea: "layers", minHeight: { lg: 0 }, borderTop: { xs: "1px solid rgba(148, 163, 184, 0.12)", lg: "none" } }}>
                    <DesignLayersPanel />
                </Box>

                <Box sx={{ gridArea: "canvas", minHeight: 0, borderInline: { lg: "1px solid rgba(148, 163, 184, 0.08)" } }}>
                    <DesignCanvas />
                </Box>

                <Box sx={{ gridArea: "inspector", minHeight: { lg: 0 }, borderTop: { xs: "1px solid rgba(148, 163, 184, 0.12)", lg: "none" } }}>
                    <DesignInspectorPanel />
                </Box>
            </Box>
        </Box>
    );
}