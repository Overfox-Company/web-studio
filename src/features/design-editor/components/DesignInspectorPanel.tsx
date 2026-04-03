"use client";

import { Box, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";

import { designEditorDefaults, designEditorStyles } from "@/src/customization/design-editor";
import { useDesignDocumentStore } from "@/src/features/design-editor/store/design-document.store";
import { useDesignInteractionStore } from "@/src/features/design-editor/store/design-interaction.store";
import { isFrameNode } from "@/src/features/design-editor/utils/design-tree";
import type { DesignNode } from "@/src/features/design-editor/types/design.types";

function InspectorSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Stack spacing={1.2} sx={designEditorStyles.inspector.section}>
            <Typography sx={designEditorStyles.inspector.sectionTitle}>
                {title}
            </Typography>
            {children}
        </Stack>
    );
}

function GridField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Stack spacing={0.55}>
            <Typography sx={designEditorStyles.inspector.gridFieldLabel}>{label}</Typography>
            {children}
        </Stack>
    );
}

function NumberInput({ value, onChange }: { value: number; onChange: (nextValue: number) => void }) {
    return (
        <TextField
            type="number"
            value={value}
            onChange={(event) => {
                const nextValue = Number(event.target.value);

                if (Number.isNaN(nextValue) || nextValue === value) {
                    return;
                }

                onChange(nextValue);
            }}
            sx={designEditorStyles.inspector.field}
        />
    );
}

function TextInput({ value, onChange, multiline = false }: { value: string; onChange: (nextValue: string) => void; multiline?: boolean }) {
    return (
        <TextField
            value={value}
            multiline={multiline}
            minRows={multiline ? 3 : undefined}
            onChange={(event) => {
                const nextValue = event.target.value;

                if (nextValue === value) {
                    return;
                }

                onChange(nextValue);
            }}
            sx={designEditorStyles.inspector.field}
        />
    );
}

function InspectorContent({ node }: { node: DesignNode }) {
    const patchNode = useDesignDocumentStore((state) => state.patchNode);

    return (
        <Stack spacing={1.2}>
            <InspectorSection title="Identity">
                <GridField label="Name">
                    <TextInput value={node.name} onChange={(nextValue) => patchNode(node.id, { name: nextValue })} />
                </GridField>
                <GridField label="Type">
                    <Box sx={designEditorStyles.inspector.staticValue}>
                        {node.type}
                    </Box>
                </GridField>
            </InspectorSection>

            <InspectorSection title="Layout">
                <Box sx={designEditorStyles.inspector.twoColumnGrid}>
                    {node.type === "frame" ? (
                        <GridField label="Layout Mode">
                            <TextField
                                select
                                value={node.layoutMode}
                                onChange={(event) => patchNode(node.id, { layoutMode: event.target.value as "absolute" | "auto" })}
                                sx={designEditorStyles.inspector.field}
                            >
                                <MenuItem value="absolute">Absolute</MenuItem>
                                <MenuItem value="auto">Auto Layout</MenuItem>
                            </TextField>
                        </GridField>
                    ) : null}
                    <GridField label="X">
                        <NumberInput value={node.x} onChange={(nextValue) => patchNode(node.id, { x: nextValue })} />
                    </GridField>
                    <GridField label="Y">
                        <NumberInput value={node.y} onChange={(nextValue) => patchNode(node.id, { y: nextValue })} />
                    </GridField>
                    <GridField label="Width">
                        <NumberInput value={node.width} onChange={(nextValue) => patchNode(node.id, { width: Math.max(1, nextValue) })} />
                    </GridField>
                    <GridField label="Height">
                        <NumberInput value={node.height} onChange={(nextValue) => patchNode(node.id, { height: Math.max(1, nextValue) })} />
                    </GridField>
                    <GridField label="Rotation">
                        <NumberInput value={node.rotation} onChange={(nextValue) => patchNode(node.id, { rotation: nextValue })} />
                    </GridField>
                    <GridField label="Opacity">
                        <NumberInput value={Math.round(node.style.opacity * 100)} onChange={(nextValue) => patchNode(node.id, { style: { opacity: Math.min(1, Math.max(0, nextValue / 100)) } })} />
                    </GridField>
                </Box>
            </InspectorSection>

            <InspectorSection title="Appearance">
                <GridField label="Fill">
                    <TextInput value={node.style.fill} onChange={(nextValue) => patchNode(node.id, { style: { fill: nextValue } })} />
                </GridField>
                <Box sx={designEditorStyles.inspector.twoColumnGrid}>
                    <GridField label="Stroke">
                        <TextInput value={node.style.stroke ?? ""} onChange={(nextValue) => patchNode(node.id, { style: { stroke: nextValue || null } })} />
                    </GridField>
                    <GridField label="Stroke Width">
                        <NumberInput value={node.style.strokeWidth} onChange={(nextValue) => patchNode(node.id, { style: { strokeWidth: Math.max(0, nextValue) } })} />
                    </GridField>
                    <GridField label="Radius">
                        <NumberInput value={node.style.borderRadius} onChange={(nextValue) => patchNode(node.id, { style: { borderRadius: Math.max(0, nextValue) } })} />
                    </GridField>
                </Box>
            </InspectorSection>

            {node.type === "text" ? (
                <InspectorSection title="Text">
                    <GridField label="Content">
                        <TextInput value={node.text} multiline onChange={(nextValue) => patchNode(node.id, { text: nextValue })} />
                    </GridField>
                    <Box sx={designEditorStyles.inspector.twoColumnGrid}>
                        <GridField label="Font Size">
                            <NumberInput value={node.style.typography?.fontSize ?? 16} onChange={(nextValue) => patchNode(node.id, { style: { typography: { fontSize: nextValue } } })} />
                        </GridField>
                        <GridField label="Weight">
                            <NumberInput value={node.style.typography?.fontWeight ?? 400} onChange={(nextValue) => patchNode(node.id, { style: { typography: { fontWeight: nextValue } } })} />
                        </GridField>
                        <GridField label="Line Height">
                            <NumberInput value={node.style.typography?.lineHeight ?? 1.5} onChange={(nextValue) => patchNode(node.id, { style: { typography: { lineHeight: nextValue } } })} />
                        </GridField>
                        <GridField label="Align">
                            <TextField
                                select
                                value={node.style.typography?.textAlign ?? "left"}
                                onChange={(event) => patchNode(node.id, { style: { typography: { textAlign: event.target.value as "left" | "center" | "right" } } })}
                                sx={designEditorStyles.inspector.field}
                            >
                                <MenuItem value="left">Left</MenuItem>
                                <MenuItem value="center">Center</MenuItem>
                                <MenuItem value="right">Right</MenuItem>
                            </TextField>
                        </GridField>
                    </Box>
                    <GridField label="Color">
                        <TextInput value={node.style.typography?.color ?? designEditorDefaults.typography.color} onChange={(nextValue) => patchNode(node.id, { style: { typography: { color: nextValue } } })} />
                    </GridField>
                </InspectorSection>
            ) : null}

            {node.type === "image" ? (
                <InspectorSection title="Image">
                    <GridField label="Source">
                        <TextInput value={node.src} onChange={(nextValue) => patchNode(node.id, { src: nextValue, style: { image: { src: nextValue } } })} />
                    </GridField>
                    <GridField label="Object Fit">
                        <TextField
                            select
                            value={node.style.image?.objectFit ?? "cover"}
                            onChange={(event) => patchNode(node.id, { style: { image: { objectFit: event.target.value as "cover" | "contain" | "fill" } } })}
                            sx={designEditorStyles.inspector.field}
                        >
                            <MenuItem value="cover">Cover</MenuItem>
                            <MenuItem value="contain">Contain</MenuItem>
                            <MenuItem value="fill">Fill</MenuItem>
                        </TextField>
                    </GridField>
                </InspectorSection>
            ) : null}

            {isFrameNode(node) ? (
                <InspectorSection title="Frame">
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={designEditorStyles.inspector.clipRow}>
                        <Typography sx={designEditorStyles.inspector.clipLabel}>Clip Content</Typography>
                        <Switch checked={node.clipContent} onChange={(event) => patchNode(node.id, { clipContent: event.target.checked })} />
                    </Stack>
                    {node.layoutMode === "absolute" ? (
                        <Box sx={designEditorStyles.inspector.twoColumnGrid}>
                            <GridField label="Padding Top">
                                <NumberInput value={node.padding.top} onChange={(nextValue) => patchNode(node.id, { padding: { top: nextValue } })} />
                            </GridField>
                            <GridField label="Padding Right">
                                <NumberInput value={node.padding.right} onChange={(nextValue) => patchNode(node.id, { padding: { right: nextValue } })} />
                            </GridField>
                            <GridField label="Padding Bottom">
                                <NumberInput value={node.padding.bottom} onChange={(nextValue) => patchNode(node.id, { padding: { bottom: nextValue } })} />
                            </GridField>
                            <GridField label="Padding Left">
                                <NumberInput value={node.padding.left} onChange={(nextValue) => patchNode(node.id, { padding: { left: nextValue } })} />
                            </GridField>
                        </Box>
                    ) : null}
                </InspectorSection>
            ) : null}

            {isFrameNode(node) && node.layoutMode === "auto" ? (
                <InspectorSection title="Auto Layout">
                    <Box sx={designEditorStyles.inspector.twoColumnGrid}>
                        <GridField label="Direction">
                            <TextField
                                select
                                value={node.autoLayout.direction}
                                onChange={(event) => patchNode(node.id, { autoLayout: { direction: event.target.value as "horizontal" | "vertical" } })}
                                sx={designEditorStyles.inspector.field}
                            >
                                <MenuItem value="horizontal">Horizontal</MenuItem>
                                <MenuItem value="vertical">Vertical</MenuItem>
                            </TextField>
                        </GridField>
                        <GridField label="Justify">
                            <TextField
                                select
                                value={node.autoLayout.justifyContent}
                                onChange={(event) => patchNode(node.id, { autoLayout: { justifyContent: event.target.value as "start" | "center" | "end" | "space-between" } })}
                                sx={designEditorStyles.inspector.field}
                            >
                                <MenuItem value="start">Start</MenuItem>
                                <MenuItem value="center">Center</MenuItem>
                                <MenuItem value="end">End</MenuItem>
                                <MenuItem value="space-between">Space Between</MenuItem>
                            </TextField>
                        </GridField>
                        <GridField label="Align">
                            <TextField
                                select
                                value={node.autoLayout.alignItems}
                                onChange={(event) => patchNode(node.id, { autoLayout: { alignItems: event.target.value as "start" | "center" | "end" | "stretch" } })}
                                sx={designEditorStyles.inspector.field}
                            >
                                <MenuItem value="start">Start</MenuItem>
                                <MenuItem value="center">Center</MenuItem>
                                <MenuItem value="end">End</MenuItem>
                                <MenuItem value="stretch">Stretch</MenuItem>
                            </TextField>
                        </GridField>
                        <GridField label="Gap">
                            <NumberInput value={node.autoLayout.gap} onChange={(nextValue) => patchNode(node.id, { autoLayout: { gap: Math.max(0, nextValue) } })} />
                        </GridField>
                        <GridField label="Padding Top">
                            <NumberInput value={node.autoLayout.padding.top} onChange={(nextValue) => patchNode(node.id, { autoLayout: { padding: { top: nextValue } } })} />
                        </GridField>
                        <GridField label="Padding Right">
                            <NumberInput value={node.autoLayout.padding.right} onChange={(nextValue) => patchNode(node.id, { autoLayout: { padding: { right: nextValue } } })} />
                        </GridField>
                        <GridField label="Padding Bottom">
                            <NumberInput value={node.autoLayout.padding.bottom} onChange={(nextValue) => patchNode(node.id, { autoLayout: { padding: { bottom: nextValue } } })} />
                        </GridField>
                        <GridField label="Padding Left">
                            <NumberInput value={node.autoLayout.padding.left} onChange={(nextValue) => patchNode(node.id, { autoLayout: { padding: { left: nextValue } } })} />
                        </GridField>
                    </Box>
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
                    <Typography sx={designEditorStyles.inspector.panelEyebrow}>
                        Inspector
                    </Typography>
                    <Typography sx={designEditorStyles.inspector.panelBodyText}>
                        Selección múltiple activa.
                    </Typography>
                </Stack>

                <Box sx={designEditorStyles.inspector.panelBody}>
                    <Stack spacing={1.2} sx={designEditorStyles.inspector.multiSelectionCard}>
                        <Typography sx={designEditorStyles.inspector.multiSelectionEyebrow}>
                            Multi Selection
                        </Typography>
                        <Typography sx={designEditorStyles.inspector.multiSelectionCount}>
                            {selectedNodeIds.length} elementos seleccionados
                        </Typography>
                        <Typography sx={designEditorStyles.inspector.multiSelectionBody}>
                            Usa Cmd+G o Ctrl+G para crear un group cuando todos pertenezcan al mismo contenedor.
                        </Typography>
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
                <Typography sx={designEditorStyles.inspector.panelEyebrow}>
                    Inspector
                </Typography>
                <Typography sx={designEditorStyles.inspector.panelBodyText}>
                    {selectedNodeId ? "Propiedades del elemento seleccionado." : "Propiedades del documento y frame raíz."}
                </Typography>
            </Stack>

            <Box sx={designEditorStyles.inspector.panelBody}>
                <InspectorContent node={activeNode} />
            </Box>
        </Box>
    );
}