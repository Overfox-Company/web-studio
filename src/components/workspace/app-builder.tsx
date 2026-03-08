"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { ReactFlowProvider } from "@xyflow/react";

import { UiBox, UiGhostButton, UiMetric, UiStack, UiTypography } from "@/src/components/ui-kit";
import { FlowCanvas } from "@/src/features/canvas/components/flow-canvas";
import { DataFlowSummary } from "@/src/features/data-flow/components/data-flow-summary";
import { DatabaseOverview } from "@/src/features/database-modeler/components/database-overview";
import { ExportPanel } from "@/src/features/exporter/components/export-panel";
import { NodeConfigPanel } from "@/src/features/inspector/components/node-config-panel";
import { NODE_DEFINITIONS } from "@/src/features/nodes/config/node-definitions";
import { NodeLibrary } from "@/src/features/sidebar/components/node-library";
import { PageBuilder, PageStudio } from "@/src/features/ui-builder/components/page-builder";
import { useEditorStore } from "@/src/store/editor-store";
import type { ArchitectureNodeKind, CanvasApi } from "@/src/types/editor";

export function AppBuilder() {
    const addNode = useEditorStore((state) => state.addNode);
    const nodes = useEditorStore((state) => state.nodes);
    const edges = useEditorStore((state) => state.edges);
    const activePageEditorId = useEditorStore((state) => state.activePageEditorId);

    const [activeKind, setActiveKind] = useState<ArchitectureNodeKind | null>(null);
    const canvasApiRef = useRef<CanvasApi | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    const metrics = useMemo(
        () => [
            { label: "Nodes", value: nodes.length },
            { label: "Flows", value: edges.length },
            { label: "Pages", value: nodes.filter((node) => node.data.kind === "page").length },
        ],
        [edges.length, nodes],
    );

    const registerCanvasApi = useCallback((api: CanvasApi) => {
        canvasApiRef.current = api;
    }, []);

    function handleDragStart(event: DragStartEvent) {
        const nextKind = event.active.data.current?.kind as ArchitectureNodeKind | undefined;
        setActiveKind(nextKind ?? null);
    }

    function handleDragEnd(event: DragEndEvent) {
        const canvasApi = canvasApiRef.current;

        if (event.over?.id !== "canvas-dropzone" || !activeKind || !canvasApi || !event.active.rect.current.translated) {
            setActiveKind(null);
            return;
        }

        const rect = event.active.rect.current.translated;
        const position = canvasApi.screenToFlowPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });

        addNode(activeKind, position);
        setActiveKind(null);
        requestAnimationFrame(() => canvasApi.fitView());
    }

    return (
        <ReactFlowProvider>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                {activePageEditorId ? (
                    <PageStudio />
                ) : (
                    <UiBox
                        sx={{
                            height: "100vh",
                            background: "#0a0c12",
                            display: "grid",
                            gridTemplateRows: { xs: "56px minmax(0, 1fr) auto", xl: "56px minmax(0, 1fr)" },
                            gridTemplateColumns: { xs: "1fr", xl: "280px minmax(0, 1fr) 420px" },
                            overflow: "hidden",
                        }}
                    >
                        <UiStack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={2}
                            sx={{
                                gridColumn: { xs: "1", xl: "1 / -1" },
                                minWidth: 0,
                                px: 2,
                                borderBottom: "1px solid rgba(255,255,255,0.08)",
                                background: "#0f1218",
                            }}
                        >
                            <UiStack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                                <UiTypography variant="overline" sx={{ color: "rgba(255,255,255,0.52)", letterSpacing: "0.22em", whiteSpace: "nowrap" }}>
                                    Web Studio
                                </UiTypography>
                                <UiTypography variant="body2" sx={{ color: "rgba(255,255,255,0.48)", display: { xs: "none", md: "block" } }}>
                                    Visual architecture editor
                                </UiTypography>
                            </UiStack>

                            <UiStack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, overflowX: "auto", py: 1 }}>
                                {metrics.map((metric) => (
                                    <UiMetric key={metric.label} label={`${metric.label}: ${metric.value}`} sx={{ borderRadius: 2, backgroundColor: "#161b24", color: "#f5f7fb", flexShrink: 0 }} />
                                ))}
                                <UiGhostButton sx={{ minHeight: 32, flexShrink: 0 }} onClick={() => canvasApiRef.current?.fitView()}>
                                    Fit Graph
                                </UiGhostButton>
                            </UiStack>
                        </UiStack>

                        <UiBox sx={{ minHeight: 0, minWidth: 0, borderRight: { xl: "1px solid rgba(255,255,255,0.08)" } }}>
                            <NodeLibrary activeKind={activeKind} />
                        </UiBox>

                        <UiBox sx={{ minHeight: 0, minWidth: 0 }}>
                            <FlowCanvas registerCanvasApi={registerCanvasApi} />
                        </UiBox>

                        <UiStack
                            spacing={1.5}
                            sx={{
                                minWidth: 0,
                                minHeight: 0,
                                overflow: "auto",
                                p: 1.5,
                                borderLeft: { xl: "1px solid rgba(255,255,255,0.08)" },
                                borderTop: { xs: "1px solid rgba(255,255,255,0.08)", xl: 0 },
                                background: "#0d1016",
                            }}
                        >
                            <NodeConfigPanel />
                            <PageBuilder />
                            <DatabaseOverview />
                            <DataFlowSummary />
                            <ExportPanel />
                        </UiStack>
                    </UiBox>
                )}

                <DragOverlay>
                    {activeKind ? (
                        <UiBox sx={{ borderRadius: 2.5, border: `1px solid ${NODE_DEFINITIONS[activeKind].accent}`, background: "#121720", px: 2, py: 1.25, boxShadow: "0 8px 20px rgba(0,0,0,0.18)" }}>
                            <UiTypography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {NODE_DEFINITIONS[activeKind].title}
                            </UiTypography>
                        </UiBox>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </ReactFlowProvider>
    );
}