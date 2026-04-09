"use client";

import { DragDropVerticalIcon } from "@hugeicons-pro/core-solid-standard";
import {
    ArrowDown01Icon,
    ArrowRight01Icon,
} from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Box, Stack, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import type { DesignLayerItem } from "@/src/features/design-editor/utils/design-tree";
import type { LayerDropMode, LayerDropTarget } from "@/src/features/design-editor/components/layers/design-layer-dnd";

export function DesignLayerRow({
    item,
    itemIcon,
    isSelected,
    isHovered,
    isCollapsed,
    isDragging,
    dropTarget,
    onSelect,
    onHover,
    onToggleCollapse,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
}: {
    item: DesignLayerItem;
    itemIcon: IconSvgElement;
    isSelected: boolean;
    isHovered: boolean;
    isCollapsed: boolean;
    isDragging: boolean;
    dropTarget: LayerDropTarget | null;
    onSelect: (event: React.MouseEvent<HTMLDivElement>) => void;
    onHover: (nodeId: string | null) => void;
    onToggleCollapse: () => void;
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>, mode: LayerDropMode) => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>, mode: LayerDropMode) => void;
}) {
    const isDropBefore = dropTarget?.targetNodeId === item.id && dropTarget.mode === "before";
    const isDropInside = dropTarget?.targetNodeId === item.id && dropTarget.mode === "inside";
    const isDropAfter = dropTarget?.targetNodeId === item.id && dropTarget.mode === "after";

    function resolveDropMode(offsetY: number, height: number): LayerDropMode {
        if (!item.hasChildren) {
            return offsetY < height * 0.5 ? "before" : "after";
        }

        const insideZoneStart = height * 0.32;
        const insideZoneEnd = height * 0.68;

        return offsetY < insideZoneStart ? "before" : offsetY > insideZoneEnd ? "after" : "inside";
    }

    return (
        <Box sx={{ position: "relative" }}>
            {isDropBefore ? <Box sx={{ position: "absolute", left: 12, right: 12, top: -2, height: 2, borderRadius: 999, background: "rgba(79, 124, 255, 0.92)", zIndex: 2 }} /> : null}

            <Stack
                direction="row"
                alignItems="center"
                spacing={0.6}
                onClick={onSelect}
                onMouseEnter={() => onHover(item.id)}
                onMouseLeave={() => onHover(null)}
                onDragOver={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const offsetY = event.clientY - bounds.top;
                    const mode = resolveDropMode(offsetY, bounds.height);

                    onDragOver(event, mode);
                }}
                onDrop={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const offsetY = event.clientY - bounds.top;
                    const mode = resolveDropMode(offsetY, bounds.height);

                    onDrop(event, mode);
                }}
                sx={{
                    ...designEditorStyles.layers.item(isSelected, isHovered),
                    opacity: isDragging ? 0.42 : 1,
                    background: isDropInside ? "rgba(79, 124, 255, 0.12)" : undefined,
                    borderColor: isDropInside ? "rgba(79, 124, 255, 0.5)" : undefined,
                }}
            >
                <Box
                    draggable
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onClick={(event) => event.stopPropagation()}
                    sx={{
                        width: 18,
                        height: 18,
                        display: "grid",
                        placeItems: "center",
                        color: "rgba(160, 170, 192, 0.88)",
                        cursor: "grab",
                        flexShrink: 0,
                        "&:active": { cursor: "grabbing" },
                    }}
                >
                    <HugeiconsIcon icon={DragDropVerticalIcon} size={14} strokeWidth={0} />
                </Box>

                <Box
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleCollapse();
                    }}
                    sx={designEditorStyles.layers.collapseToggle(item.hasChildren)}
                >
                    {item.hasChildren ? <HugeiconsIcon icon={isCollapsed ? ArrowRight01Icon : ArrowDown01Icon} size={14} strokeWidth={1.9} /> : null}
                </Box>

                <Box sx={designEditorStyles.layers.indent(item.depth)} />

                <Box sx={designEditorStyles.layers.itemIcon(isSelected)}>
                    <HugeiconsIcon icon={itemIcon} size={16} strokeWidth={1.7} />
                </Box>

                <Stack sx={designEditorStyles.layers.textStack}>
                    <Stack direction="row" spacing={0.8} alignItems="center" sx={designEditorStyles.layers.nameRow}>
                        <Typography sx={designEditorStyles.layers.name(isSelected)}>{item.node.name}</Typography>
                        {item.node.type === "frame" && item.node.layoutMode === "auto" ? <Typography sx={designEditorStyles.layers.autoBadge}>Auto</Typography> : null}
                    </Stack>
                    <Typography sx={designEditorStyles.layers.typeLabel}>{item.node.type}</Typography>
                </Stack>

                <Typography sx={designEditorStyles.layers.itemMeta}>{item.depth}</Typography>
            </Stack>

            {isDropAfter ? <Box sx={{ position: "absolute", left: 12, right: 12, bottom: -2, height: 2, borderRadius: 999, background: "rgba(79, 124, 255, 0.92)", zIndex: 2 }} /> : null}
        </Box>
    );
}