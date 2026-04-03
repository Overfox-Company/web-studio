"use client";

import { useMemo } from "react";

import { Box, Stack, Typography } from "@mui/material";

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
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRight: { lg: "1px solid rgba(148, 163, 184, 0.12)" },
                background: "rgba(9, 14, 22, 0.9)",
            }}
        >
            <Stack spacing={0.6} sx={{ px: 2, py: 1.8, borderBottom: "1px solid rgba(148, 163, 184, 0.1)" }}>
                <Typography sx={{ fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#64748b" }}>
                    Layers
                </Typography>
                <Typography sx={{ fontSize: "0.92rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                    Jerarquía real del documento visual.
                </Typography>
            </Stack>

            <Stack spacing={0.45} sx={{ px: 1.1, py: 1.1, overflowY: "auto", minHeight: 0 }}>
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
                            sx={{
                                minHeight: 34,
                                px: 1,
                                borderRadius: "10px",
                                cursor: "pointer",
                                transform: isHovered ? "translateX(1px)" : "none",
                                transition: "background 140ms ease, transform 140ms ease, color 140ms ease",
                                background: isSelected
                                    ? "rgba(56, 189, 248, 0.18)"
                                    : isHovered
                                        ? "rgba(148, 163, 184, 0.1)"
                                        : "transparent",
                                border: isSelected ? "1px solid rgba(125, 211, 252, 0.35)" : "1px solid transparent",
                            }}
                        >
                            <Box
                                onClick={(event) => {
                                    event.stopPropagation();

                                    if (item.hasChildren) {
                                        toggleLayerCollapsed(item.id);
                                    }
                                }}
                                sx={{
                                    width: 16,
                                    textAlign: "center",
                                    color: item.hasChildren ? "#94a3b8" : "transparent",
                                    fontSize: "0.72rem",
                                    userSelect: "none",
                                }}
                            >
                                {item.hasChildren ? (isCollapsed ? ">" : "v") : "."}
                            </Box>

                            <Box sx={{ width: item.depth * 12, flexShrink: 0 }} />

                            <Stack sx={{ minWidth: 0 }}>
                                <Stack direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: isSelected ? "#f8fafc" : "#dbe4f0" }}>
                                        {item.node.name}
                                    </Typography>
                                    {item.node.type === "frame" && item.node.layoutMode === "auto" ? (
                                        <Typography
                                            sx={{
                                                px: 0.7,
                                                py: 0.2,
                                                borderRadius: "999px",
                                                background: "rgba(56, 189, 248, 0.14)",
                                                color: "#7dd3fc",
                                                fontSize: "0.62rem",
                                                fontWeight: 700,
                                                letterSpacing: "0.12em",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Auto
                                        </Typography>
                                    ) : null}
                                </Stack>
                                <Typography sx={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b" }}>
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