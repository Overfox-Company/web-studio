"use client";

import { useMemo, useState } from "react";

import {
    CodeSquareIcon,
    Cursor01Icon,
    ImageAdd02Icon,
    LayoutTwoRowIcon,
    PaintBoardIcon,
    Search01Icon,
    TextCreationIcon,
} from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon } from "@hugeicons/react";
import { Box, InputBase, Stack, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { DesignLayerRow } from "@/src/features/design-editor/components/layers/DesignLayerRow";
import { getDraggedLayerNodeIds, type LayerDropTarget, resolveLayerDrop } from "@/src/features/design-editor/components/layers/design-layer-dnd";
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
import { buildLayerItems } from "@/src/features/design-editor/utils/design-tree";

function getLayerIcon(type: string) {
    switch (type) {
        case "frame":
            return LayoutTwoRowIcon;
        case "text":
            return TextCreationIcon;
        case "image":
            return ImageAdd02Icon;
        case "component-instance":
            return CodeSquareIcon;
        case "rectangle":
        case "group":
            return PaintBoardIcon;
        default:
            return Cursor01Icon;
    }
}

export function DesignLayersPanel() {
    const document = useDesignDocumentStore((state) => state.document);
    const reparentNodes = useDesignDocumentStore((state) => state.reparentNodes);
    const [query, setQuery] = useState("");
    const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<LayerDropTarget | null>(null);

    const selectedNodeIds = useDesignInteractionStore((state) => state.selectedNodeIds);
    const hoveredNodeId = useDesignInteractionStore((state) => state.hoveredNodeId);
    const collapsedLayerIds = useDesignInteractionStore((state) => state.collapsedLayerIds);
    const selectNode = useDesignInteractionStore((state) => state.selectNode);
    const hoverNode = useDesignInteractionStore((state) => state.hoverNode);
    const toggleLayerCollapsed = useDesignInteractionStore((state) => state.toggleLayerCollapsed);

    const layers = useMemo(() => {
        if (!document) {
            return [];
        }

        const allLayers = buildLayerItems(document, document.rootNodeId, collapsedLayerIds);
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return allLayers;
        }

        return allLayers.filter((item) => item.node.name.toLowerCase().includes(normalizedQuery) || item.node.type.toLowerCase().includes(normalizedQuery));
    }, [collapsedLayerIds, document, query]);

    return (
        <Box sx={designEditorStyles.layers.root}>
            <Stack spacing={0.6} sx={designEditorStyles.layers.header}>
                <Typography sx={designEditorStyles.layers.headerEyebrow}>
                    Layers
                </Typography>
                <Typography sx={designEditorStyles.layers.headerBody}>
                    Jerarquía real del documento visual.
                </Typography>

                <Box sx={designEditorStyles.layers.searchShell}>
                    <Box sx={designEditorStyles.layers.searchIcon}>
                        <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.6} />
                    </Box>
                    <InputBase
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar capas, frames o texto"
                        sx={designEditorStyles.layers.searchInput}
                    />
                </Box>

                <Typography sx={designEditorStyles.layers.sectionCaption}>
                    {layers.length} visibles
                </Typography>
            </Stack>

            <Stack spacing={0.45} sx={designEditorStyles.layers.list}>
                {layers.map((item) => {
                    const isSelected = selectedNodeIds.includes(item.id);
                    const isHovered = hoveredNodeId === item.id;
                    const isCollapsed = collapsedLayerIds.includes(item.id);
                    const itemIcon = getLayerIcon(item.node.type);

                    return (
                        <DesignLayerRow
                            key={item.id}
                            item={item}
                            itemIcon={itemIcon}
                            isSelected={isSelected}
                            isHovered={isHovered}
                            isCollapsed={isCollapsed}
                            isDragging={draggedNodeId === item.id}
                            dropTarget={dropTarget}
                            onSelect={(event) => {
                                if (event.shiftKey) {
                                    if (!isSelected) {
                                        selectNode(item.id, { additive: true });
                                    }

                                    return;
                                }

                                selectNode(item.id, { additive: event.metaKey || event.ctrlKey });
                            }}
                            onHover={hoverNode}
                            onToggleCollapse={() => {
                                if (item.hasChildren) {
                                    toggleLayerCollapsed(item.id);
                                }
                            }}
                            onDragStart={(event) => {
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData("text/plain", item.id);
                                setDraggedNodeId(item.id);
                                setDropTarget(null);
                            }}
                            onDragEnd={() => {
                                setDraggedNodeId(null);
                                setDropTarget(null);
                            }}
                            onDragOver={(event, mode) => {
                                event.preventDefault();

                                if (!document || !draggedNodeId) {
                                    return;
                                }

                                const draggedNodeIds = getDraggedLayerNodeIds(draggedNodeId, selectedNodeIds);
                                const resolvedDrop = resolveLayerDrop(document, draggedNodeIds, { targetNodeId: item.id, mode });

                                event.dataTransfer.dropEffect = resolvedDrop ? "move" : "none";
                                setDropTarget(resolvedDrop ? { targetNodeId: item.id, mode } : null);
                            }}
                            onDrop={(event, mode) => {
                                event.preventDefault();

                                if (!document || !draggedNodeId) {
                                    setDraggedNodeId(null);
                                    setDropTarget(null);
                                    return;
                                }

                                const draggedNodeIds = getDraggedLayerNodeIds(draggedNodeId, selectedNodeIds);
                                const resolvedDrop = resolveLayerDrop(document, draggedNodeIds, { targetNodeId: item.id, mode });

                                if (resolvedDrop) {
                                    reparentNodes(resolvedDrop);
                                }

                                setDraggedNodeId(null);
                                setDropTarget(null);
                            }}
                        />
                    );
                })}
            </Stack>
        </Box>
    );
}