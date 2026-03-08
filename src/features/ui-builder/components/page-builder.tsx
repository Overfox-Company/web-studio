"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Editor, Element, Frame, useEditor } from "@craftjs/core";

import {
    UiBox,
    UiBuilderButton,
    UiBuilderCard,
    UiBuilderContainer,
    UiBuilderScreen,
    UiBuilderStage,
    UiBuilderText,
    UiBuilderToolChip,
    UiColumn,
    UiField,
    UiGhostButton,
    UiSectionDescription,
    UiSectionTitle,
    UiStack,
    UiTag,
    UiTypography,
} from "@/src/components/ui-kit";
import { DEFAULT_PAGE_BUILDER_TREE } from "@/src/features/nodes/config/node-definitions";
import { useEditorStore } from "@/src/store/editor-store";
import type { ArchitectureNode, PageNodeData } from "@/src/types/editor";

function isPageNode(node: ArchitectureNode): node is ArchitectureNode & { data: PageNodeData } {
    return node.data.kind === "page";
}

function BuilderStateSync({ onChange }: { onChange: (json: string) => void }) {
    const { serialized } = useEditor((_, query) => ({
        serialized: query.serialize(),
    }));
    const lastSerializedRef = useRef<string | null>(null);

    useEffect(() => {
        if (lastSerializedRef.current === serialized) {
            return;
        }

        lastSerializedRef.current = serialized;
        onChange(serialized);
    }, [onChange, serialized]);

    return null;
}

function BuilderStructurePanel() {
    const { nodes } = useEditor((state) => ({
        nodes: state.nodes,
    }));

    const rootChildren = useMemo(() => nodes.ROOT?.data.nodes ?? [], [nodes]);

    function renderNode(nodeId: string, depth = 0) {
        const node = nodes[nodeId];

        if (!node) {
            return null;
        }

        const label =
            (typeof node.data.props?.title === "string" && node.data.props.title) ||
            (typeof node.data.props?.text === "string" && node.data.props.text) ||
            node.data.displayName ||
            "Node";

        return (
            <UiBox key={nodeId} sx={{ ml: depth * 1.25 }}>
                <UiBox sx={{ borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.06)", background: depth === 0 ? "#171a21" : "#12161d", px: 1, py: 0.85 }}>
                    <UiTypography variant="caption" sx={{ color: "rgba(255,255,255,0.46)", display: "block", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                        {node.data.displayName ?? "Node"}
                    </UiTypography>
                    <UiTypography variant="body2" sx={{ fontWeight: 700, color: "#f5f7fb", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {String(label)}
                    </UiTypography>
                </UiBox>
                {(node.data.nodes ?? []).length > 0 ? (
                    <UiStack spacing={0.75} sx={{ mt: 0.75 }}>
                        {(node.data.nodes ?? []).map((childId) => renderNode(childId, depth + 1))}
                    </UiStack>
                ) : null}
            </UiBox>
        );
    }

    return (
        <UiColumn sx={{ minHeight: 0, overflow: "auto", p: 1, borderRight: "1px solid rgba(255,255,255,0.08)", background: "#0d1016" }}>
            <UiStack direction="row" spacing={0.75} sx={{ mb: 1 }}>
                <UiTag label="Pages" sx={{ backgroundColor: "#12161d", color: "rgba(255,255,255,0.62)" }} />
                <UiTag label="Layers" sx={{ backgroundColor: "#20242d", color: "#f5f7fb" }} />
                <UiTag label="Assets" sx={{ backgroundColor: "#12161d", color: "rgba(255,255,255,0.62)" }} />
            </UiStack>
            <UiField label="Search" placeholder="Search layers..." />
            <UiColumn spacing={1} sx={{ mt: 1.5 }}>
                <UiTypography variant="overline" sx={{ color: "rgba(255,255,255,0.42)", letterSpacing: "0.16em" }}>
                    Structure
                </UiTypography>
                {rootChildren.length > 0 ? rootChildren.map((nodeId) => renderNode(nodeId)) : (
                    <UiBox sx={{ borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.06)", background: "#12161d", px: 1.1, py: 1.1 }}>
                        <UiTypography variant="body2" sx={{ color: "rgba(255,255,255,0.62)", lineHeight: 1.55 }}>
                            Drag items into the stage to build the layer tree.
                        </UiTypography>
                    </UiBox>
                )}
            </UiColumn>
        </UiColumn>
    );
}

function PageBuilderEditor({
    selectedPage,
    variant,
}: {
    selectedPage: ArchitectureNode & { data: PageNodeData };
    variant: "panel" | "studio";
}) {
    const updateNodeData = useEditorStore((state) => state.updateNodeData);
    const stageViewportRef = useRef<HTMLDivElement | null>(null);
    const isPanningRef = useRef(false);
    const panPointerRef = useRef<{ x: number; y: number } | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [studioZoom, setStudioZoom] = useState(1);
    const [studioOffset, setStudioOffset] = useState({ x: 0, y: 0 });
    const [spacePressed, setSpacePressed] = useState(false);
    const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);

    const baseStageWidth = 12000;
    const baseStageHeight = 12000;

    const setClampedZoom = useCallback((value: number) => {
        const nextZoom = Math.max(0.25, Math.min(2, Number(value.toFixed(2))));
        setStudioZoom(nextZoom);
    }, []);

    const centerStage = useCallback((zoom: number) => {
        const viewport = stageViewportRef.current;

        if (!viewport) {
            return;
        }

        setStudioOffset({
            x: viewport.clientWidth / 2 - 1800 * zoom / 2,
            y: viewport.clientHeight / 2 - 1200 * zoom / 2,
        });
    }, []);

    const handleFitStudio = useCallback(() => {
        const viewport = stageViewportRef.current;

        if (!viewport) {
            setClampedZoom(1);
            return;
        }

        const horizontalPadding = 160;
        const verticalPadding = 160;
        const focusWidth = 1800;
        const focusHeight = 1200;

        const widthZoom = (viewport.clientWidth - horizontalPadding) / focusWidth;
        const heightZoom = (viewport.clientHeight - verticalPadding) / focusHeight;
        const nextZoom = Math.min(widthZoom, heightZoom, 1);

        setClampedZoom(nextZoom);
        requestAnimationFrame(() => centerStage(nextZoom));
    }, [centerStage, setClampedZoom]);

    const handleViewportWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
        event.preventDefault();

        const viewport = stageViewportRef.current;

        if (!viewport) {
            return;
        }

        const rect = viewport.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;
        const delta = event.deltaY > 0 ? -0.08 : 0.08;
        const nextZoom = Math.max(0.25, Math.min(2, Number((studioZoom + delta).toFixed(2))));

        if (nextZoom === studioZoom) {
            return;
        }

        const worldX = (pointerX - studioOffset.x) / studioZoom;
        const worldY = (pointerY - studioOffset.y) / studioZoom;

        setStudioZoom(nextZoom);
        setStudioOffset({
            x: pointerX - worldX * nextZoom,
            y: pointerY - worldY * nextZoom,
        });
    }, [studioOffset.x, studioOffset.y, studioZoom]);

    const stopPanning = useCallback(() => {
        isPanningRef.current = false;
        panPointerRef.current = null;
        setIsPanning(false);
    }, []);

    const handleViewportMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        const shouldPan = event.button === 1 || (event.button === 0 && spacePressed);

        if (!shouldPan) {
            return;
        }

        event.preventDefault();
        isPanningRef.current = true;
        panPointerRef.current = { x: event.clientX, y: event.clientY };
        setIsPanning(true);
    }, [spacePressed]);

    const handleViewportMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (!isPanningRef.current || !panPointerRef.current) {
            return;
        }

        const deltaX = event.clientX - panPointerRef.current.x;
        const deltaY = event.clientY - panPointerRef.current.y;

        panPointerRef.current = { x: event.clientX, y: event.clientY };
        setStudioOffset((current) => ({ x: current.x + deltaX, y: current.y + deltaY }));
    }, []);

    useEffect(() => {
        if (variant !== "studio") {
            return;
        }

        requestAnimationFrame(() => handleFitStudio());
    }, [handleFitStudio, selectedPage.id, variant]);

    useEffect(() => {
        if (variant !== "studio") {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.code === "Space") {
                setSpacePressed(true);
            }
        }

        function handleKeyUp(event: KeyboardEvent) {
            if (event.code === "Space") {
                setSpacePressed(false);
            }
        }

        function handleWindowMouseUp() {
            stopPanning();
        }

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("mouseup", handleWindowMouseUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("mouseup", handleWindowMouseUp);
        };
    }, [stopPanning, variant]);

    const handleBuilderTreeChange = useCallback(
        (json: string) => {
            if (selectedPage.data.builderTree === json) {
                return;
            }

            updateNodeData(selectedPage.id, { builderTree: json });
        },
        [selectedPage, updateNodeData],
    );

    const toolbox = (
        <UiColumn spacing={1.25}>
            <UiTypography variant="overline" sx={{ color: "rgba(255,255,255,0.46)", letterSpacing: "0.18em" }}>
                Insert
            </UiTypography>
            <UiStack direction={variant === "studio" ? "column" : "row"} flexWrap="wrap" useFlexGap gap={1}>
                <UiBuilderToolChip label="Screen 1440" element={<Element is={UiBuilderScreen} canvas title="Desktop 1440" width={1440} minHeight={900} />} />
                <UiBuilderToolChip label="Text" element={<UiBuilderText text="New copy block" variant="body" />} />
                <UiBuilderToolChip label="Heading" element={<UiBuilderText text="Section heading" variant="heading" />} />
                <UiBuilderToolChip label="Button" element={<UiBuilderButton text="Primary action" tone="primary" />} />
                <UiBuilderToolChip label="Card" element={<UiBuilderCard title="Feature card" body="Describe the capability exposed by this page." />} />
                <UiBuilderToolChip label="Section" element={<Element is={UiBuilderContainer} canvas title="New section" accent="#F4D35E" />} />
            </UiStack>
        </UiColumn>
    );

    const frame = (
        <UiBox
            sx={{
                borderRadius: variant === "studio" ? 3 : 2.5,
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "#0d1016",
                p: 0,
                minHeight: variant === "studio" ? "100%" : 320,
                overflow: "auto",
            }}
        >
            <Frame data={selectedPage.data.builderTree || DEFAULT_PAGE_BUILDER_TREE} />
            <BuilderStateSync onChange={handleBuilderTreeChange} />
        </UiBox>
    );

    const studioViewportControls = (
        <UiStack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
                position: "absolute",
                left: "50%",
                bottom: 18,
                transform: "translateX(-50%)",
                zIndex: 20,
                px: 1,
                py: 1,
                borderRadius: 2.5,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(16,20,28,0.92)",
            }}
        >
            <UiGhostButton sx={{ minHeight: 32, minWidth: 32, px: 1.2 }} onClick={() => setClampedZoom(studioZoom - 0.1)}>
                -
            </UiGhostButton>
            <UiTag label={`${Math.round(studioZoom * 100)}%`} sx={{ backgroundColor: "#161b24", color: "#f5f7fb", minWidth: 64 }} />
            <UiGhostButton sx={{ minHeight: 32, minWidth: 32, px: 1.2 }} onClick={() => setClampedZoom(studioZoom + 0.1)}>
                +
            </UiGhostButton>
            <UiGhostButton sx={{ minHeight: 32 }} onClick={() => setClampedZoom(1)}>
                Reset
            </UiGhostButton>
            <UiGhostButton sx={{ minHeight: 32 }} onClick={handleFitStudio}>
                Fit
            </UiGhostButton>
        </UiStack>
    );

    const studioToolbar = (
        <UiStack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{
                gridColumn: "1 / -1",
                px: 1.5,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                background: "#090b10",
            }}
        >
            <UiStack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0, overflowX: "auto", py: 1 }}>
                <UiGhostButton sx={{ minHeight: 30, px: 1.5 }} onClick={() => useEditorStore.getState().closePageEditor()}>
                    Back
                </UiGhostButton>
                <UiTag label="Insert" sx={{ backgroundColor: "#171a21", color: "#f5f7fb" }} />
                <UiTag label="Layout" sx={{ backgroundColor: "#171a21", color: "#f5f7fb" }} />
                <UiTag label="Text" sx={{ backgroundColor: "#171a21", color: "#f5f7fb" }} />
                <UiTag label="Vector" sx={{ backgroundColor: "#171a21", color: "#f5f7fb" }} />
                <UiTag label="CMS" sx={{ backgroundColor: "#171a21", color: "#f5f7fb" }} />
            </UiStack>

            <UiTypography variant="body2" sx={{ color: "rgba(255,255,255,0.64)", whiteSpace: "nowrap", display: { xs: "none", md: "block" } }}>
                {selectedPage.data.label}
            </UiTypography>

            <UiStack direction="row" spacing={0.75} alignItems="center" sx={{ py: 1 }}>
                <UiTag label={`${Math.round(studioZoom * 100)}%`} sx={{ backgroundColor: "#171a21", color: "#f5f7fb" }} />
                <UiGhostButton sx={{ minHeight: 30, px: 1.5 }} onClick={() => useEditorStore.getState().closePageEditor()}>
                    Done
                </UiGhostButton>
            </UiStack>
        </UiStack>
    );

    if (variant === "panel") {
        return (
            <UiColumn sx={{ borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", background: "#11141b", p: 2.4 }}>
                <UiBox>
                    <UiTypography variant="overline" sx={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em" }}>
                        Page Builder
                    </UiTypography>
                    <UiSectionTitle>{selectedPage.data.label}</UiSectionTitle>
                </UiBox>

                <Editor
                    key={selectedPage.id}
                    resolver={{
                        BuilderStage: UiBuilderStage,
                        BuilderScreen: UiBuilderScreen,
                        BuilderContainer: UiBuilderContainer,
                        BuilderText: UiBuilderText,
                        BuilderButton: UiBuilderButton,
                        BuilderCard: UiBuilderCard,
                        UiBuilderStage,
                        UiBuilderScreen,
                        UiBuilderContainer,
                        UiBuilderText,
                        UiBuilderButton,
                        UiBuilderCard,
                    }}
                >
                    <UiColumn spacing={1.5}>
                        {toolbox}
                        {frame}
                    </UiColumn>
                </Editor>
            </UiColumn>
        );
    }

    return (
        <Editor
            key={selectedPage.id}
            resolver={{
                BuilderStage: UiBuilderStage,
                BuilderScreen: UiBuilderScreen,
                BuilderContainer: UiBuilderContainer,
                BuilderText: UiBuilderText,
                BuilderButton: UiBuilderButton,
                BuilderCard: UiBuilderCard,
                UiBuilderStage,
                UiBuilderScreen,
                UiBuilderContainer,
                UiBuilderText,
                UiBuilderButton,
                UiBuilderCard,
            }}
        >
            <UiBox
                sx={{
                    height: "100vh",
                    background: "#0a0c12",
                    display: "grid",
                    gridTemplateRows: "48px minmax(0, 1fr)",
                    gridTemplateColumns: { xs: "1fr", lg: "148px minmax(0, 1fr)" },
                    overflow: "hidden",
                }}
            >
                {studioToolbar}

                <UiBox sx={{ display: { xs: "none", lg: "block" }, minHeight: 0 }}>
                    <BuilderStructurePanel />
                </UiBox>

                <UiBox
                    ref={stageViewportRef}
                    sx={{
                        gridColumn: { xs: "1", lg: "2" },
                        minHeight: 0,
                        overflow: "hidden",
                        p: 0,
                        position: "relative",
                        cursor: isPanning || spacePressed ? "grab" : "default",
                        background: "#151515",
                    }}
                    onWheel={handleViewportWheel}
                    onMouseDown={handleViewportMouseDown}
                    onMouseMove={handleViewportMouseMove}
                    onMouseUp={stopPanning}
                    onMouseLeave={stopPanning}
                >
                    <UiBox
                        sx={{
                            position: "absolute",
                            inset: 0,
                            overflow: "hidden",
                        }}
                    >
                        <UiBox
                            sx={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: baseStageWidth,
                                height: baseStageHeight,
                                transform: `translate(${studioOffset.x}px, ${studioOffset.y}px) scale(${studioZoom})`,
                                transformOrigin: "top left",
                                transition: isPanning ? "none" : "transform 120ms ease",
                            }}
                        >
                            <UiBox sx={{ height: "100%", borderRadius: 0, background: "#1a1a1a" }}>
                                {frame}
                            </UiBox>
                        </UiBox>
                    </UiBox>
                    <UiBox
                        sx={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            right: 0,
                            height: 32,
                            display: { xs: "flex", lg: "none" },
                            alignItems: "center",
                            px: 1,
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(9,11,16,0.82)",
                        }}
                    >
                        <UiTypography variant="caption" sx={{ color: "rgba(255,255,255,0.58)" }}>
                            Drag a 1440px screen into the stage
                        </UiTypography>
                    </UiBox>
                    <UiBox
                        sx={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
                            backgroundSize: `${24 * studioZoom}px ${24 * studioZoom}px`,
                            backgroundPosition: `${studioOffset.x}px ${studioOffset.y}px`,
                            opacity: 0.5,
                        }}
                    />
                    {studioViewportControls}
                    <UiBox
                        sx={{
                            position: "absolute",
                            left: "50%",
                            bottom: 72,
                            transform: "translateX(-50%)",
                            zIndex: 21,
                            width: { xs: "calc(100% - 24px)", sm: 520 },
                            maxWidth: "calc(100% - 24px)",
                            borderRadius: 2.5,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(10,12,18,0.95)",
                            overflow: "hidden",
                        }}
                    >
                        {isInsertMenuOpen ? (
                            <UiBox sx={{ p: 1.25, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                {toolbox}
                            </UiBox>
                        ) : null}
                        <UiStack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ p: 1 }}>
                            <UiGhostButton sx={{ minHeight: 34 }} onClick={() => setIsInsertMenuOpen((current) => !current)}>
                                {isInsertMenuOpen ? "Hide Items" : "Insert Items"}
                            </UiGhostButton>
                            <UiTypography variant="caption" sx={{ color: "rgba(255,255,255,0.56)" }}>
                                Drag components from this tray into the canvas
                            </UiTypography>
                        </UiStack>
                    </UiBox>
                </UiBox>
            </UiBox>
        </Editor>
    );
}

export function PageBuilder() {
    const selectedPage = useEditorStore((state) => state.nodes.find((node): node is ArchitectureNode & { data: PageNodeData } => node.id === state.selectedNodeId && isPageNode(node)) ?? null);

    if (!selectedPage || selectedPage.data.kind !== "page") {
        return (
            <UiBox sx={{ borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#11141b", p: 2.5 }}>
                <UiSectionTitle>Visual Page Builder</UiSectionTitle>
                <UiSectionDescription sx={{ mt: 0.75 }}>
                    Select a Page node to design its internal layout with nested containers and reusable UI blocks.
                </UiSectionDescription>
            </UiBox>
        );
    }

    return <PageBuilderEditor selectedPage={selectedPage} variant="panel" />;
}

export function PageStudio() {
    const activePageEditorId = useEditorStore((state) => state.activePageEditorId);
    const pageNode = useEditorStore((state) => state.nodes.find((node): node is ArchitectureNode & { data: PageNodeData } => node.id === activePageEditorId && isPageNode(node)) ?? null);

    if (!pageNode) {
        return null;
    }

    return <PageBuilderEditor selectedPage={pageNode} variant="studio" />;
}