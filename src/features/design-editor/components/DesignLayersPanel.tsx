"use client";

import { useMemo, useState } from "react";

import {
    ArrowDown01Icon,
    ArrowRight01Icon,
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
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document.store";
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
    const [query, setQuery] = useState("");

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
                        <Stack
                            key={item.id}
                            direction="row"
                            alignItems="center"
                            spacing={0.6}
                            onClick={(event) => selectNode(item.id, { additive: event.metaKey || event.ctrlKey })}
                            onMouseEnter={() => hoverNode(item.id)}
                            onMouseLeave={() => hoverNode(null)}
                            sx={designEditorStyles.layers.item(isSelected, isHovered)}
                        >
                            <Box
                                onClick={(event) => {
                                    event.stopPropagation();

                                    if (item.hasChildren) {
                                        toggleLayerCollapsed(item.id);
                                    }
                                }}
                                sx={designEditorStyles.layers.collapseToggle(item.hasChildren)}
                            >
                                {item.hasChildren ? (
                                    <HugeiconsIcon
                                        icon={isCollapsed ? ArrowRight01Icon : ArrowDown01Icon}
                                        size={14}
                                        strokeWidth={1.9}
                                    />
                                ) : null}
                            </Box>

                            <Box sx={designEditorStyles.layers.indent(item.depth)} />

                            <Box sx={designEditorStyles.layers.itemIcon(isSelected)}>
                                <HugeiconsIcon icon={itemIcon} size={16} strokeWidth={1.7} />
                            </Box>

                            <Stack sx={designEditorStyles.layers.textStack}>
                                <Stack direction="row" spacing={0.8} alignItems="center" sx={designEditorStyles.layers.nameRow}>
                                    <Typography sx={designEditorStyles.layers.name(isSelected)}>
                                        {item.node.name}
                                    </Typography>
                                    {item.node.type === "frame" && item.node.layoutMode === "auto" ? (
                                        <Typography sx={designEditorStyles.layers.autoBadge}>
                                            Auto
                                        </Typography>
                                    ) : null}
                                </Stack>
                                <Typography sx={designEditorStyles.layers.typeLabel}>
                                    {item.node.type}
                                </Typography>
                            </Stack>

                            <Typography sx={designEditorStyles.layers.itemMeta}>
                                {item.depth}
                            </Typography>
                        </Stack>
                    );
                })}
            </Stack>
        </Box>
    );
}