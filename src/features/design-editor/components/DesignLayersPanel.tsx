"use client";

import { useMemo } from "react";

import { Box, Stack, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document.store";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
import { buildLayerItems } from "@/src/features/design-editor/utils/design-tree";

export function DesignLayersPanel() {
    const document = useDesignDocumentStore((state) => state.document);

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

        return buildLayerItems(document, document.rootNodeId, collapsedLayerIds);
    }, [collapsedLayerIds, document]);

    return (
        <Box sx={designEditorStyles.layers.root}>
            <Stack spacing={0.6} sx={designEditorStyles.layers.header}>
                <Typography sx={designEditorStyles.layers.headerEyebrow}>
                    Layers
                </Typography>
                <Typography sx={designEditorStyles.layers.headerBody}>
                    Jerarquía real del documento visual.
                </Typography>
            </Stack>

            <Stack spacing={0.45} sx={designEditorStyles.layers.list}>
                {layers.map((item) => {
                    const isSelected = selectedNodeIds.includes(item.id);
                    const isHovered = hoveredNodeId === item.id;
                    const isCollapsed = collapsedLayerIds.includes(item.id);

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
                                {item.hasChildren ? (isCollapsed ? ">" : "v") : "."}
                            </Box>

                            <Box sx={designEditorStyles.layers.indent(item.depth)} />

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
                        </Stack>
                    );
                })}
            </Stack>
        </Box>
    );
}