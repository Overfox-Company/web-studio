"use client";

import { Box, Stack, Typography } from "@mui/material";

import {
    designEditorStyles,
    mapDesignAutoLayoutAlign,
    mapDesignAutoLayoutJustify,
} from "@/src/customization/design-editor";
import { useComponentLibraryStore } from "@/src/features/component-library/store/component-library.store";
import type { DesignPreviewSnapshot } from "@/src/features/design-editor/preview/preview.types";
import type { DesignDocumentSnapshot } from "@/src/features/design-editor/types/design.types";
import type { DesignFrame } from "@/src/features/design-editor/types/interaction.types";
import {
    getNodeSiblingZIndex,
    getNodeLocalFrame,
    isAutoLayoutFrame,
    isContainerNode,
    isFrameNode,
} from "@/src/features/design-editor/utils/design-tree";

type NodePresentation = "normal" | "ghost" | "hidden";

interface DesignDocumentRendererProps {
    document: DesignDocumentSnapshot | DesignPreviewSnapshot;
    mode: "editor" | "preview";
    rootNodeId?: string;
    rootPositioning?: "document-root" | "absolute";
    frameOverrides?: Record<string, DesignFrame>;
    nodePresentationById?: Record<string, NodePresentation>;
}

function svgMarkupToDataUri(markup: string) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

function getNodePresentation(nodeId: string, nodePresentationById?: Record<string, NodePresentation>) {
    return nodePresentationById?.[nodeId] ?? "normal";
}

export function DesignDocumentRenderer({
    document,
    mode,
    rootNodeId,
    rootPositioning = "document-root",
    frameOverrides,
    nodePresentationById,
}: DesignDocumentRendererProps) {
    const targetRootNodeId = rootNodeId ?? document.rootNodeId;
    const componentsById = useComponentLibraryStore((state) => state.snapshot.componentsById);

    function renderNode(nodeId: string, options?: { isRoot?: boolean }): React.ReactNode {
        const node = document.nodes[nodeId];

        if (!node) {
            return null;
        }

        const isRoot = options?.isRoot ?? false;
        const presentation = getNodePresentation(node.id, nodePresentationById);

        if (presentation === "hidden") {
            return null;
        }

        const overrideFrame = frameOverrides?.[node.id];
        const frame = overrideFrame ?? getNodeLocalFrame(document, node.id);
        const parentNode = node.parentId ? document.nodes[node.parentId] : null;
        const parentUsesAutoLayout = Boolean(parentNode && isAutoLayoutFrame(parentNode) && !isRoot);
        const opacity = presentation === "ghost" ? 0 : node.visible ? node.style.opacity : 0.2;
        const boxShadow = node.style.shadow
            ? `${node.style.shadow.x}px ${node.style.shadow.y}px ${node.style.shadow.blur}px ${node.style.shadow.spread}px ${node.style.shadow.color}`
            : "none";
        const border = node.style.stroke ? `${node.style.strokeWidth}px solid ${node.style.stroke}` : "none";
        const zIndex = getNodeSiblingZIndex(document, node.id);
        const autoLayout: {
            direction: "row" | "column";
            justifyContent: string;
            alignItems: string;
            gap: number;
            padding: string;
        } | undefined = mode === "preview" && node.type === "frame" && node.layoutMode === "auto"
                ? {
                    direction: node.autoLayout.direction === "horizontal" ? "row" : "column",
                    justifyContent: mapDesignAutoLayoutJustify(node.autoLayout.justifyContent),
                    alignItems: mapDesignAutoLayoutAlign(node.autoLayout.alignItems),
                    gap: node.autoLayout.gap,
                    padding: `${node.autoLayout.padding.top}px ${node.autoLayout.padding.right}px ${node.autoLayout.padding.bottom}px ${node.autoLayout.padding.left}px`,
                }
                : undefined;
        const nodeSx = designEditorStyles.renderer.node({
            isRoot,
            rootPositioning,
            parentUsesAutoLayout,
            frame,
            borderRadius: node.style.borderRadius,
            opacity,
            clipContent: isFrameNode(node) && node.clipContent,
            boxShadow,
            background: node.style.fill,
            border,
            pointerEvents: mode === "editor" ? "none" : "auto",
            zIndex,
            autoLayout,
        });

        return (
            <Box key={node.id} data-design-node-id={node.id} sx={nodeSx}>
                {node.type === "text" ? (
                    <Box sx={designEditorStyles.renderer.text({
                        color: node.style.typography?.color,
                        fontFamily: node.style.typography?.fontFamily,
                        fontSize: node.style.typography?.fontSize,
                        fontWeight: node.style.typography?.fontWeight,
                        lineHeight: node.style.typography?.lineHeight,
                        textAlign: node.style.typography?.textAlign,
                    })}>
                        {node.text}
                    </Box>
                ) : null}

                {node.type === "image" ? (
                    node.src.startsWith("placeholder://") ? (
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            spacing={1}
                            sx={designEditorStyles.renderer.placeholderImage(node.style.borderRadius)}
                        >
                            <Typography sx={designEditorStyles.renderer.placeholderEyebrow}>
                                Image
                            </Typography>
                            <Typography sx={designEditorStyles.renderer.placeholderTitle}>{node.name}</Typography>
                        </Stack>
                    ) : (
                        <Box
                            component="img"
                            src={node.src}
                            alt={node.name}
                            draggable={false}
                            sx={designEditorStyles.renderer.image(node.style.image?.objectFit ?? "contain")}
                        />
                    )
                ) : null}

                {node.type === "svg-asset" ? (
                    <Box
                        component="img"
                        src={svgMarkupToDataUri(node.svgMarkup)}
                        alt={node.name}
                        draggable={false}
                        sx={designEditorStyles.renderer.svg}
                    />
                ) : null}

                {node.type === "component-instance" ? (() => {
                    const component = componentsById[node.variantId];

                    if (!component) {
                        return (
                            <Stack alignItems="center" justifyContent="center" sx={designEditorStyles.renderer.placeholderImage(node.style.borderRadius)}>
                                <Typography sx={designEditorStyles.renderer.placeholderTitle}>Missing component</Typography>
                            </Stack>
                        );
                    }

                    return (
                        <DesignDocumentRenderer
                            document={component.document}
                            mode={mode}
                        />
                    );
                })() : null}

                {isContainerNode(node) ? node.children.map((childId) => renderNode(childId)) : null}
            </Box>
        );
    }

    return renderNode(targetRootNodeId, { isRoot: true });
}