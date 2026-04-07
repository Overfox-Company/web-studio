"use client";

import { useMemo, useState } from "react";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
    DropletIcon,
    Image01Icon,
    InputTextIcon,
    Layout01Icon,
    Layers01Icon,
    PackageIcon,
    PaintBrush02Icon,
    SquareIcon,
    TextAlignCenterIcon,
    TextAlignLeftIcon,
    TextAlignRightIcon,
} from "@hugeicons-pro/core-solid-standard";
import { Box, ButtonBase, Collapse, Stack, Typography } from "@mui/material";

import { designEditorDefaults, designEditorStyles } from "@/src/customization/design-editor";
import { DesignColorControl } from "@/src/features/design-editor/components/DesignColorControl";
import {
    AlignmentMatrixControl,
    FillRowControl,
    IconValueField,
    InspectorSection,
    LinkedSpacingControl,
    PropertySelectInput,
    PropertyChipInput,
    PropertyNumberInput,
    SegmentedIconControl,
    SizeConstraintControl,
    StrokeRowControl,
    ToggleSwitchRow,
} from "@/src/features/design-editor/components/inspector/InspectorControls";
import { uniquePalette } from "@/src/features/design-editor/components/color-picker/ColorConversionUtils";
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document.store";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
import type { DesignNode } from "@/src/features/design-editor/types/design.types";
import { isFrameNode } from "@/src/features/design-editor/utils/design-tree";

const TEXT_FONT_WEIGHT_OPTIONS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const TEXT_FONT_FAMILY_OPTIONS = [
    { value: designEditorDefaults.typography.fontFamily, label: "IBM Plex Sans", previewFontFamily: designEditorDefaults.typography.fontFamily },
    { value: '"IBM Plex Mono", monospace', label: "IBM Plex Mono", previewFontFamily: '"IBM Plex Mono", monospace' },
] as const;

function DisclosureRow({ label, summary, open, onToggle }: { label: string; summary: string; open: boolean; onToggle: () => void }) {
    return (
        <ButtonBase onClick={onToggle} sx={designEditorStyles.inspector.sectionDisclosure}>
            <Typography sx={designEditorStyles.inspector.sectionDisclosureLabel}>{label}</Typography>
            <Typography sx={designEditorStyles.inspector.sectionDisclosureValue}>{open ? `Hide ${summary}` : summary}</Typography>
        </ButtonBase>
    );
}

function NodeHeader({ node, label, icon, onRename }: { node: DesignNode; label: string; icon: IconSvgElement; onRename: (nextValue: string) => void }) {
    return (
        <Box sx={designEditorStyles.inspector.nodeHeader}>
            <Box sx={designEditorStyles.inspector.nodeHeaderRow}>
                <Box sx={designEditorStyles.inspector.nodeHeaderIcon}>
                    <HugeiconsIcon icon={icon} size={15} strokeWidth={0} />
                </Box>

                <PropertyChipInput value={node.name} onChange={onRename} placeholder="Layer name" />

                <Box sx={designEditorStyles.inspector.nodeHeaderBadge}>{label}</Box>
            </Box>
        </Box>
    );
}

function InspectorContent({ node }: { node: DesignNode }) {
    const patchNode = useDesignDocumentStore((state) => state.patchNode);
    const documentNodes = useDesignDocumentStore((state) => state.document?.nodes);
    const [effectsOpen, setEffectsOpen] = useState(Boolean(node.style.shadow));
    const [advancedOpen, setAdvancedOpen] = useState(false);

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
    const canUseHugSizing = node.type === "frame" && node.layoutMode === "auto";
    const showContentSection = node.type === "text" || node.type === "image" || node.type === "component-instance";

    return (
        <Stack spacing={0}>
            <NodeHeader node={node} label={nodeMeta.label} icon={nodeMeta.icon} onRename={(nextValue) => patchNode(node.id, { name: nextValue })} />

            <InspectorSection title="Layout" icon={Layout01Icon}>
                {node.type === "frame" ? (
                    <SegmentedIconControl
                        dense
                        value={node.layoutMode}
                        onChange={(nextValue) => patchNode(node.id, { layoutMode: nextValue })}
                        options={[
                            { value: "absolute", label: "Free" },
                            { value: "auto", label: "Auto" },
                        ]}
                    />
                ) : null}

                <Box sx={designEditorStyles.inspector.metricGrid2}>
                    <PropertyNumberInput label="X" value={node.x} onChange={(nextValue) => patchNode(node.id, { x: nextValue })} />
                    <PropertyNumberInput label="Y" value={node.y} onChange={(nextValue) => patchNode(node.id, { y: nextValue })} />
                </Box>

                <Stack spacing={0.55}>
                    <SizeConstraintControl
                        label="W"
                        mode={node.sizing.width.mode}
                        value={node.width}
                        minValue={node.sizing.width.min}
                        maxValue={node.sizing.width.max}
                        allowFill={Boolean(node.parentId)}
                        allowHug={canUseHugSizing}
                        onModeChange={(nextValue) => patchNode(node.id, { sizing: { width: { mode: nextValue } } })}
                        onValueChange={(nextValue) => patchNode(node.id, { width: Math.max(1, nextValue) })}
                        onMinChange={(nextValue) => patchNode(node.id, { sizing: { width: { min: nextValue } } })}
                        onMaxChange={(nextValue) => patchNode(node.id, { sizing: { width: { max: nextValue } } })}
                    />

                    <SizeConstraintControl
                        label="H"
                        mode={node.sizing.height.mode}
                        value={node.height}
                        minValue={node.sizing.height.min}
                        maxValue={node.sizing.height.max}
                        allowFill={Boolean(node.parentId)}
                        allowHug={canUseHugSizing}
                        onModeChange={(nextValue) => patchNode(node.id, { sizing: { height: { mode: nextValue } } })}
                        onValueChange={(nextValue) => patchNode(node.id, { height: Math.max(1, nextValue) })}
                        onMinChange={(nextValue) => patchNode(node.id, { sizing: { height: { min: nextValue } } })}
                        onMaxChange={(nextValue) => patchNode(node.id, { sizing: { height: { max: nextValue } } })}
                    />
                </Stack>

                <Box sx={designEditorStyles.inspector.metricGrid2}>
                    <PropertyNumberInput label="Rotation" value={node.rotation} onChange={(nextValue) => patchNode(node.id, { rotation: nextValue })} unit="deg" />
                    <PropertyNumberInput
                        label="Opacity"
                        value={Math.round(node.style.opacity * 100)}
                        onChange={(nextValue) => patchNode(node.id, { style: { opacity: Math.min(1, Math.max(0, nextValue / 100)) } })}
                        unit="%"
                        min={0}
                    />
                </Box>

                {isFrameNode(node) ? (
                    <LinkedSpacingControl
                        label="Padding"
                        value={node.layoutMode === "auto" ? node.autoLayout.padding : node.padding}
                        onChange={(nextValue) => patchNode(node.id, node.layoutMode === "auto"
                            ? { autoLayout: { padding: nextValue } }
                            : { padding: nextValue })}
                    />
                ) : null}

                {isFrameNode(node) && node.layoutMode === "auto" ? (
                    <>
                        <SegmentedIconControl
                            dense
                            value={node.autoLayout.direction}
                            onChange={(nextValue) => patchNode(node.id, { autoLayout: { direction: nextValue } })}
                            options={[
                                { value: "horizontal", label: "Row" },
                                { value: "vertical", label: "Column" },
                            ]}
                        />

                        <AlignmentMatrixControl
                            direction={node.autoLayout.direction}
                            justifyContent={node.autoLayout.justifyContent === "space-between" ? "center" : node.autoLayout.justifyContent}
                            alignItems={node.autoLayout.alignItems === "stretch" ? "center" : node.autoLayout.alignItems}
                            onChange={(nextValue) => patchNode(node.id, { autoLayout: nextValue })}
                        />

                        <PropertyNumberInput label="Gap" value={node.autoLayout.gap} onChange={(nextValue) => patchNode(node.id, { autoLayout: { gap: Math.max(0, nextValue) } })} min={0} />

                        <ToggleSwitchRow label="Clip content" checked={node.clipContent} onChange={(checked) => patchNode(node.id, { clipContent: checked })} />
                    </>
                ) : null}
            </InspectorSection>

            <InspectorSection title="Appearance" icon={DropletIcon}>
                <FillRowControl title="Fill" value={node.style.fill} paletteColors={pagePaletteColors} onChange={(nextValue) => patchNode(node.id, { style: { fill: nextValue } })} />

                <StrokeRowControl
                    value={node.style.stroke ?? ""}
                    width={node.style.strokeWidth}
                    paletteColors={pagePaletteColors}
                    onColorChange={(nextValue) => patchNode(node.id, { style: { stroke: nextValue || null } })}
                    onWidthChange={(nextValue) => patchNode(node.id, { style: { strokeWidth: Math.max(0, nextValue) } })}
                />

                <PropertyNumberInput label="Radius" value={node.style.borderRadius} onChange={(nextValue) => patchNode(node.id, { style: { borderRadius: Math.max(0, nextValue) } })} min={0} />

                <DisclosureRow label="Effects" summary={hasShadow ? "1 shadow" : "None"} open={effectsOpen} onToggle={() => setEffectsOpen((current) => !current)} />

                <Collapse in={effectsOpen}>
                    <Stack spacing={0.7} sx={{ pt: 0.7 }}>
                        <ToggleSwitchRow label="Shadow" checked={hasShadow} onChange={(checked) => patchNode(node.id, { style: { shadow: checked ? shadow : null } })} />

                        {hasShadow ? (
                            <>
                                <Box sx={designEditorStyles.inspector.metricGrid2}>
                                    <PropertyNumberInput label="X" value={shadow.x} onChange={(nextValue) => patchNode(node.id, { style: { shadow: { ...shadow, x: nextValue } } })} />
                                    <PropertyNumberInput label="Y" value={shadow.y} onChange={(nextValue) => patchNode(node.id, { style: { shadow: { ...shadow, y: nextValue } } })} />
                                </Box>

                                <Box sx={designEditorStyles.inspector.metricGrid2}>
                                    <PropertyNumberInput label="Blur" value={shadow.blur} onChange={(nextValue) => patchNode(node.id, { style: { shadow: { ...shadow, blur: Math.max(0, nextValue) } } })} min={0} />
                                    <PropertyNumberInput label="Spread" value={shadow.spread} onChange={(nextValue) => patchNode(node.id, { style: { shadow: { ...shadow, spread: nextValue } } })} />
                                </Box>

                                <DesignColorControl
                                    title="Shadow"
                                    value={shadow.color}
                                    paletteColors={pagePaletteColors}
                                    onChange={(nextValue) => patchNode(node.id, { style: { shadow: { ...shadow, color: nextValue } } })}
                                />
                            </>
                        ) : null}
                    </Stack>
                </Collapse>
            </InspectorSection>

            {showContentSection ? (
                <InspectorSection title="Content" icon={node.type === "text" ? InputTextIcon : node.type === "image" ? Image01Icon : PackageIcon}>
                    {node.type === "text" ? (
                        <>
                            <PropertyChipInput value={node.text} multiline onChange={(nextValue) => patchNode(node.id, { text: nextValue })} placeholder="Text content" />

                            <Box sx={designEditorStyles.inspector.metricGrid3}>
                                <PropertyNumberInput label="Size" value={node.style.typography?.fontSize ?? 16} onChange={(nextValue) => patchNode(node.id, { style: { typography: { fontSize: nextValue } } })} min={1} />
                                <PropertySelectInput
                                    label="Weight"
                                    value={node.style.typography?.fontWeight ?? 400}
                                    onChange={(nextValue) => patchNode(node.id, { style: { typography: { fontWeight: nextValue } } })}
                                    options={TEXT_FONT_WEIGHT_OPTIONS.map((value) => ({ value, label: String(value) }))}
                                />
                                <PropertyNumberInput label="Line" value={node.style.typography?.lineHeight ?? 1.5} onChange={(nextValue) => patchNode(node.id, { style: { typography: { lineHeight: nextValue } } })} min={0} />
                            </Box>

                            <PropertySelectInput
                                label="Typography"
                                value={node.style.typography?.fontFamily ?? designEditorDefaults.typography.fontFamily}
                                onChange={(nextValue) => patchNode(node.id, { style: { typography: { fontFamily: nextValue } } })}
                                options={[...TEXT_FONT_FAMILY_OPTIONS]}
                            />

                            <SegmentedIconControl
                                dense
                                value={node.style.typography?.textAlign ?? "left"}
                                onChange={(nextValue) => patchNode(node.id, { style: { typography: { textAlign: nextValue } } })}
                                options={[
                                    { value: "left", label: "Left", icon: <HugeiconsIcon icon={TextAlignLeftIcon} size={15} strokeWidth={0} /> },
                                    { value: "center", label: "Center", icon: <HugeiconsIcon icon={TextAlignCenterIcon} size={15} strokeWidth={0} /> },
                                    { value: "right", label: "Right", icon: <HugeiconsIcon icon={TextAlignRightIcon} size={15} strokeWidth={0} /> },
                                ]}
                            />

                            <DesignColorControl
                                title="Background"
                                value={node.style.fill}
                                paletteColors={pagePaletteColors}
                                onChange={(nextValue) => patchNode(node.id, { style: { fill: nextValue } })}
                            />

                            <DesignColorControl
                                title="Text Color"
                                value={node.style.typography?.color ?? designEditorDefaults.typography.color}
                                paletteColors={pagePaletteColors}
                                onChange={(nextValue) => patchNode(node.id, { style: { typography: { color: nextValue } } })}
                            />
                        </>
                    ) : null}

                    {node.type === "image" ? (
                        <>
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
                        </>
                    ) : null}

                    {node.type === "component-instance" ? (
                        <>
                            <IconValueField label="Component set" value={node.componentSetId.slice(0, 8)} icon={PackageIcon} />
                            <IconValueField label="Variant" value={node.variantId.slice(0, 8)} icon={Layers01Icon} />
                        </>
                    ) : null}
                </InspectorSection>
            ) : null}

            <InspectorSection title="Advanced" icon={Layers01Icon}>
                <DisclosureRow label="Metadata" summary={advancedOpen ? "Visible" : "Hidden"} open={advancedOpen} onToggle={() => setAdvancedOpen((current) => !current)} />

                <Collapse in={advancedOpen}>
                    <Stack spacing={0.7} sx={{ pt: 0.7 }}>
                        <IconValueField label="Node ID" value={node.id} icon={Layers01Icon} />
                        <IconValueField label="Type" value={nodeMeta.label} icon={nodeMeta.icon} />
                        {node.parentId ? <IconValueField label="Parent" value={node.parentId} icon={Layout01Icon} /> : null}

                        {node.type === "component-instance" ? (
                            <>
                                <IconValueField label="Component set" value={node.componentSetId} icon={PackageIcon} />
                                <IconValueField label="Variant" value={node.variantId} icon={Layers01Icon} />
                            </>
                        ) : null}

                        {node.type === "svg-asset" ? (
                            <Typography sx={designEditorStyles.inspector.noteText}>SVG assets keep their raw markup and diagnostics in the document model.</Typography>
                        ) : null}
                    </Stack>
                </Collapse>
            </InspectorSection>
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
                <Stack spacing={0.35} sx={designEditorStyles.inspector.panelHeader}>
                    <Typography sx={designEditorStyles.inspector.panelEyebrow}>Inspector</Typography>
                    <Typography sx={designEditorStyles.inspector.panelBodyText}>Selección múltiple activa.</Typography>
                </Stack>

                <Box sx={designEditorStyles.inspector.panelBody}>
                    <Stack spacing={0.7} sx={designEditorStyles.inspector.multiSelectionCard}>
                        <Typography sx={designEditorStyles.inspector.multiSelectionEyebrow}>Multi Selection</Typography>
                        <Typography sx={designEditorStyles.inspector.multiSelectionCount}>{selectedNodeIds.length} elementos seleccionados</Typography>
                        <Typography sx={designEditorStyles.inspector.multiSelectionBody}>Usa Cmd+G o Ctrl+G para agrupar cuando todos pertenezcan al mismo contenedor.</Typography>
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
            <Stack spacing={0.35} sx={designEditorStyles.inspector.panelHeader}>
                <Typography sx={designEditorStyles.inspector.panelEyebrow}>Inspector</Typography>
                <Typography sx={designEditorStyles.inspector.panelBodyText}>{selectedNodeId ? "Edición contextual del elemento seleccionado." : "Edición del frame raíz del documento."}</Typography>
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
            return { label: "Group", icon: Layers01Icon };
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
