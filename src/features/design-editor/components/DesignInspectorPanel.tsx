"use client";

import { useMemo } from "react";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
    AlphaSquareIcon,
    DropletIcon,
    HierarchySquare01Icon,
    Image01Icon,
    InputTextIcon,
    Layout01Icon,
    Layers01Icon,
    MenuTwoLineIcon,
    MoveIcon,
    PackageIcon,
    PaintBrush02Icon,
    SquareIcon,
    TextAlignCenterIcon,
    TextAlignLeftIcon,
    TextAlignRightIcon,
    ViewIcon,
} from "@hugeicons-pro/core-solid-standard";
import { Box, Stack, Typography } from "@mui/material";

import { designEditorDefaults, designEditorStyles } from "@/src/customization/design-editor";
import { DesignColorControl } from "@/src/features/design-editor/components/DesignColorControl";
import {
    AlignmentMatrixControl,
    FillRowControl,
    IconValueField,
    InspectorSection,
    LinkedSpacingControl,
    PropertyChipInput,
    PropertyNumberInput,
    SegmentedIconControl,
    StrokeRowControl,
    TogglePill,
    ToggleSwitchRow,
} from "@/src/features/design-editor/components/inspector/InspectorControls";
import { uniquePalette } from "@/src/features/design-editor/components/color-picker/ColorConversionUtils";
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document.store";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
import type { DesignNode } from "@/src/features/design-editor/types/design.types";
import { isFrameNode } from "@/src/features/design-editor/utils/design-tree";

function InspectorContent({ node }: { node: DesignNode }) {
    const patchNode = useDesignDocumentStore((state) => state.patchNode);
    const documentNodes = useDesignDocumentStore((state) => state.document?.nodes);
    const pagePaletteColors = useMemo(() => uniquePalette(
        Object.values(documentNodes ?? {}).flatMap((documentNode) => {
            const values = [documentNode.style.fill, documentNode.style.stroke ?? ""];

            if (documentNode.style.typography?.color) {
                values.push(documentNode.style.typography.color);
            }

            return values;
        }),
    ), [documentNodes]);

    const nodeMeta = getNodeMeta(node.type);
    const hasShadow = Boolean(node.style.shadow);
    const shadow = node.style.shadow ?? designEditorDefaults.shadows.mergeFallback;

    return (
        <Stack spacing={0.95}>
            <InspectorSection
                title="Identity"
                icon={nodeMeta.icon}
                meta={<Box sx={designEditorStyles.inspector.metaPill}>{nodeMeta.label}</Box>}
            >
                <PropertyChipInput value={node.name} onChange={(nextValue) => patchNode(node.id, { name: nextValue })} placeholder="Layer name" />
                <Box sx={designEditorStyles.inspector.identityRow}>
                    <IconValueField label="Type" value={nodeMeta.label} icon={nodeMeta.icon} />
                    <IconValueField label="Node ID" value={node.id.slice(0, 8)} icon={Layers01Icon} />
                </Box>
            </InspectorSection>

            <InspectorSection title="Position / Layout" icon={Layout01Icon}>
                {node.type === "frame" ? (
                    <SegmentedIconControl
                        value={node.layoutMode}
                        onChange={(nextValue) => patchNode(node.id, { layoutMode: nextValue })}
                        options={[
                            { value: "absolute", label: "Free" },
                            { value: "auto", label: "Auto" },
                        ]}
                    />
                ) : null}

                <Box sx={designEditorStyles.inspector.metricGrid3}>
                    <PropertyNumberInput label="X" value={node.x} onChange={(nextValue) => patchNode(node.id, { x: nextValue })} icon={MoveIcon} />
                    <PropertyNumberInput label="Y" value={node.y} onChange={(nextValue) => patchNode(node.id, { y: nextValue })} icon={MoveIcon} />
                    <PropertyNumberInput label="Rotation" value={node.rotation} onChange={(nextValue) => patchNode(node.id, { rotation: nextValue })} unit="deg" />
                </Box>

                <Box sx={designEditorStyles.inspector.metricGrid3}>
                    <PropertyNumberInput label="Width" value={node.width} onChange={(nextValue) => patchNode(node.id, { width: Math.max(1, nextValue) })} icon={SquareIcon} min={1} />
                    <PropertyNumberInput label="Height" value={node.height} onChange={(nextValue) => patchNode(node.id, { height: Math.max(1, nextValue) })} icon={SquareIcon} min={1} />
                    <PropertyNumberInput label="Opacity" value={Math.round(node.style.opacity * 100)} onChange={(nextValue) => patchNode(node.id, { style: { opacity: Math.min(1, Math.max(0, nextValue / 100)) } })} icon={AlphaSquareIcon} unit="%" min={0} />
                </Box>
            </InspectorSection>

            {isFrameNode(node) && node.layoutMode === "auto" ? (
                <InspectorSection title="Auto Layout" icon={MenuTwoLineIcon} meta={<Box sx={designEditorStyles.inspector.metaPillStrong}>Primary</Box>}>
                    <Box >
                        <Box sx={designEditorStyles.inspector.autoLayoutHero}>
                            <Stack spacing={0.8} sx={{ minWidth: 0 }}>
                                <Typography sx={designEditorStyles.inspector.autoLayoutTitle}>Stack behavior</Typography>
                                <Typography sx={designEditorStyles.inspector.autoLayoutBody}>Control direction, packing and internal padding from one dense surface.</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.55} alignItems="center">
                                <TogglePill label={node.clipContent ? "Clip" : "Visible"} active={node.clipContent} onClick={() => patchNode(node.id, { clipContent: !node.clipContent })} />
                                <TogglePill label={node.autoLayout.alignItems === "stretch" ? "Stretch" : "Auto"} active={node.autoLayout.alignItems === "stretch"} onClick={() => patchNode(node.id, { autoLayout: { alignItems: node.autoLayout.alignItems === "stretch" ? "center" : "stretch" } })} />
                            </Stack>
                        </Box>

                        <SegmentedIconControl
                            value={node.autoLayout.direction}
                            onChange={(nextValue) => patchNode(node.id, { autoLayout: { direction: nextValue } })}
                            options={[
                                { value: "horizontal", label: "Row" },
                                { value: "vertical", label: "Column" },
                            ]}
                        />

                        <Box  >
                       

                            <AlignmentMatrixControl
                                direction={node.autoLayout.direction}
                                justifyContent={node.autoLayout.justifyContent === "space-between" ? "center" : node.autoLayout.justifyContent}
                                alignItems={node.autoLayout.alignItems === "stretch" ? "center" : node.autoLayout.alignItems}
                                onChange={(nextValue) => patchNode(node.id, { autoLayout: nextValue })}
                            />

                            <Box sx={designEditorStyles.inspector.metricGrid2}>
                                <PropertyNumberInput label="Gap" value={node.autoLayout.gap} onChange={(nextValue) => patchNode(node.id, { autoLayout: { gap: Math.max(0, nextValue) } })} icon={MenuTwoLineIcon} min={0} />
                                <IconValueField label="Overflow" value={node.clipContent ? "Clipped" : "Visible"} icon={ViewIcon} />
                            </Box>
                        </Box>

                        <LinkedSpacingControl label="Padding" value={node.autoLayout.padding} onChange={(nextValue) => patchNode(node.id, { autoLayout: { padding: nextValue } })} />
                    </Box>
                </InspectorSection>
            ) : null}

            <InspectorSection title="Appearance" icon={DropletIcon}>
                <FillRowControl title="Fill" value={node.style.fill} paletteColors={pagePaletteColors} onChange={(nextValue) => patchNode(node.id, { style: { fill: nextValue } })} />
                <StrokeRowControl
                    value={node.style.stroke ?? ""}
                    width={node.style.strokeWidth}
                    paletteColors={pagePaletteColors}
                    onColorChange={(nextValue) => patchNode(node.id, { style: { stroke: nextValue || null } })}
                    onWidthChange={(nextValue) => patchNode(node.id, { style: { strokeWidth: Math.max(0, nextValue) } })}
                />

                <Box sx={designEditorStyles.inspector.metricGrid3}>
                    <PropertyNumberInput label="Radius" value={node.style.borderRadius} onChange={(nextValue) => patchNode(node.id, { style: { borderRadius: Math.max(0, nextValue) } })} icon={SquareIcon} min={0} />
                    <PropertyNumberInput label="Shadow X" value={shadow.x} onChange={(nextValue) => patchNode(node.id, { style: { shadow: { ...shadow, x: nextValue } } })} icon={PaintBrush02Icon} />
                    <PropertyNumberInput label="Blur" value={shadow.blur} onChange={(nextValue) => patchNode(node.id, { style: { shadow: { ...shadow, blur: Math.max(0, nextValue) } } })} icon={PaintBrush02Icon} min={0} />
                </Box>

                <Stack direction="row" spacing={0.55}>
                    <TogglePill label={hasShadow ? "Shadow on" : "Shadow off"} active={hasShadow} onClick={() => patchNode(node.id, { style: { shadow: hasShadow ? null : designEditorDefaults.shadows.mergeFallback } })} />
                    <TogglePill
                        label={node.style.stroke ? "Stroke on" : "Stroke off"}
                        active={Boolean(node.style.stroke)}
                        onClick={() => patchNode(node.id, {
                            style: {
                                stroke: node.style.stroke ? null : "rgba(255,255,255,0.14)",
                                strokeWidth: node.style.stroke ? node.style.strokeWidth : Math.max(1, node.style.strokeWidth),
                            },
                        })}
                    />
                </Stack>
            </InspectorSection>

            {node.type === "text" ? (
                <InspectorSection title="Text" icon={InputTextIcon}>
                    <PropertyChipInput value={node.text} multiline onChange={(nextValue) => patchNode(node.id, { text: nextValue })} placeholder="Text content" />
                    <Box sx={designEditorStyles.inspector.metricGrid3}>
                        <PropertyNumberInput label="Size" value={node.style.typography?.fontSize ?? 16} onChange={(nextValue) => patchNode(node.id, { style: { typography: { fontSize: nextValue } } })} min={1} />
                        <PropertyNumberInput label="Weight" value={node.style.typography?.fontWeight ?? 400} onChange={(nextValue) => patchNode(node.id, { style: { typography: { fontWeight: nextValue } } })} min={100} />
                        <PropertyNumberInput label="Line" value={node.style.typography?.lineHeight ?? 1.5} onChange={(nextValue) => patchNode(node.id, { style: { typography: { lineHeight: nextValue } } })} min={0} />
                    </Box>

                    <SegmentedIconControl
                        value={node.style.typography?.textAlign ?? "left"}
                        onChange={(nextValue) => patchNode(node.id, { style: { typography: { textAlign: nextValue } } })}
                        options={[
                            { value: "left", label: "Left", icon: <HugeiconsIcon icon={TextAlignLeftIcon} size={16} strokeWidth={0} /> },
                            { value: "center", label: "Center", icon: <HugeiconsIcon icon={TextAlignCenterIcon} size={16} strokeWidth={0} /> },
                            { value: "right", label: "Right", icon: <HugeiconsIcon icon={TextAlignRightIcon} size={16} strokeWidth={0} /> },
                        ]}
                        dense
                    />

                    <DesignColorControl
                        title="Text Color"
                        value={node.style.typography?.color ?? designEditorDefaults.typography.color}
                        paletteColors={pagePaletteColors}
                        onChange={(nextValue) => patchNode(node.id, { style: { typography: { color: nextValue } } })}
                    />
                </InspectorSection>
            ) : null}

            {node.type === "image" ? (
                <InspectorSection title="Image" icon={Image01Icon}>
                    <PropertyChipInput value={node.src} onChange={(nextValue) => patchNode(node.id, { src: nextValue, style: { image: { src: nextValue } } })} placeholder="Image source" />
                    <SegmentedIconControl
                        dense
                        value={node.style.image?.objectFit ?? "cover"}
                        onChange={(nextValue) => patchNode(node.id, { style: { image: { objectFit: nextValue } } })}
                        options={[
                            { value: "cover", label: "Cover" },
                            { value: "contain", label: "Contain" },
                            { value: "fill", label: "Fill" },
                        ]}
                    />
                </InspectorSection>
            ) : null}

            {isFrameNode(node) ? (
                <InspectorSection title="Frame extras" icon={ViewIcon}>
                    <Box sx={designEditorStyles.inspector.toggleRowGroup}>
                        <ToggleSwitchRow label="Clip content" checked={node.clipContent} onChange={(checked) => patchNode(node.id, { clipContent: checked })} />
                        <ToggleSwitchRow label="Auto layout" checked={node.layoutMode === "auto"} onChange={(checked) => patchNode(node.id, { layoutMode: checked ? "auto" : "absolute" })} />
                    </Box>

                    {node.layoutMode === "absolute" ? (
                        <LinkedSpacingControl label="Frame padding" value={node.padding} onChange={(nextValue) => patchNode(node.id, { padding: nextValue })} />
                    ) : null}
                </InspectorSection>
            ) : null}

            {node.type === "group" ? (
                <InspectorSection title="Group" icon={HierarchySquare01Icon}>
                    <Typography sx={designEditorStyles.inspector.noteText}>Groups keep visual items together but do not add auto layout behavior.</Typography>
                </InspectorSection>
            ) : null}

            {node.type === "component-instance" ? (
                <InspectorSection title="Component instance" icon={PackageIcon}>
                    <IconValueField label="Component set" value={node.componentSetId.slice(0, 8)} icon={PackageIcon} />
                    <IconValueField label="Variant" value={node.variantId.slice(0, 8)} icon={Layers01Icon} />
                </InspectorSection>
            ) : null}

            {(node.type === "rectangle" || node.type === "svg-asset") ? (
                <InspectorSection title="Shape" icon={node.type === "rectangle" ? SquareIcon : PaintBrush02Icon}>
                    <Typography sx={designEditorStyles.inspector.noteText}>This node uses the shared appearance controls above, optimized for direct visual tweaking.</Typography>
                </InspectorSection>
            ) : null}
        </Stack>
    );
}

export function DesignInspectorPanel() {
    const document = useDesignDocumentStore((state) => state.document);
    const selectedNodeId = useDesignInteractionStore((state) => state.selectedNodeId);
    const selectedNodeIds = useDesignInteractionStore((state) => state.selectedNodeIds);

    if (!document) {
        return null;
    }

    if (selectedNodeIds.length > 1) {
        return (
            <Box sx={designEditorStyles.inspector.panelRoot}>
                <Stack spacing={0.6} sx={designEditorStyles.inspector.panelHeader}>
                    <Typography sx={designEditorStyles.inspector.panelEyebrow}>Inspector</Typography>
                    <Typography sx={designEditorStyles.inspector.panelBodyText}>Selección múltiple activa.</Typography>
                </Stack>

                <Box sx={designEditorStyles.inspector.panelBody}>
                    <Stack spacing={1.2} sx={designEditorStyles.inspector.multiSelectionCard}>
                        <Typography sx={designEditorStyles.inspector.multiSelectionEyebrow}>Multi Selection</Typography>
                        <Typography sx={designEditorStyles.inspector.multiSelectionCount}>{selectedNodeIds.length} elementos seleccionados</Typography>
                        <Typography sx={designEditorStyles.inspector.multiSelectionBody}>Usa Cmd+G o Ctrl+G para crear un group cuando todos pertenezcan al mismo contenedor.</Typography>
                    </Stack>
                </Box>
            </Box>
        );
    }

    const activeNode = document.nodes[selectedNodeId ?? document.rootNodeId];

    if (!activeNode) {
        return null;
    }

    return (
        <Box sx={designEditorStyles.inspector.panelRoot}>
            <Stack spacing={0.6} sx={designEditorStyles.inspector.panelHeader}>
                <Typography sx={designEditorStyles.inspector.panelEyebrow}>Inspector</Typography>
                <Typography sx={designEditorStyles.inspector.panelBodyText}>{selectedNodeId ? "Propiedades del elemento seleccionado." : "Propiedades del documento y frame raíz."}</Typography>
            </Stack>

            <Box sx={designEditorStyles.inspector.panelBody}>
                <InspectorContent node={activeNode} />
            </Box>
        </Box>
    );
}

function getNodeMeta(nodeType: DesignNode["type"]): { label: string; icon: IconSvgElement } {
    switch (nodeType) {
        case "frame":
            return { label: "Frame", icon: Layout01Icon };
        case "group":
            return { label: "Group", icon: HierarchySquare01Icon };
        case "rectangle":
            return { label: "Rectangle", icon: SquareIcon };
        case "text":
            return { label: "Text", icon: InputTextIcon };
        case "image":
            return { label: "Image", icon: Image01Icon };
        case "svg-asset":
            return { label: "SVG", icon: PaintBrush02Icon };
        case "component-instance":
            return { label: "Component", icon: PackageIcon };
        default:
            return { label: nodeType, icon: Layers01Icon };
    }
}
