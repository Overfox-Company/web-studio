"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MenuItem, Stack, Switch, Typography } from "@mui/material";
import { Delete02Icon } from "@hugeicons-pro/core-solid-standard";

import { ProjectIcon } from "@/src/features/project-editor/components/ui/ProjectIcon";
import {
    EditorPanel,
    EditorSection,
    EditorSectionHint,
    EditorSectionTitle,
    FieldLabel,
    PanelHeader,
    SelectField,
    SwitchField,
    TextField,
    ToolbarButton,
} from "@/src/features/project-editor/components/ui/primitives";
import { projectEditorStyles } from "@/src/customization/project-editor";
import { useProjectEditorStore } from "@/src/features/project-editor/store/editor.store";
import { API_METHODS, type ProjectNode } from "@/src/features/project-editor/types/editor.types";

function MetadataRow({ label, value }: { label: string; value: string }) {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography sx={projectEditorStyles.inspector.metadataLabel}>{label}</Typography>
            <Typography sx={projectEditorStyles.inspector.metadataValue}>
                {value}
            </Typography>
        </Stack>
    );
}

function TypeConfigFields({ node }: { node: ProjectNode }) {
    const updateNode = useProjectEditorStore((state) => state.updateNode);

    if (node.kind === "page") {
        return (
            <EditorSection>
                <FieldLabel>Slug</FieldLabel>
                <TextField value={node.data.slug} onChange={(event) => updateNode(node.id, { data: { slug: event.target.value } })} />

                <SwitchField
                    label="Entry page"
                    control={
                        <Switch
                            checked={node.data.index}
                            onChange={(event) => updateNode(node.id, { data: { index: event.target.checked } })}
                        />
                    }
                />
            </EditorSection>
        );
    }

    if (node.kind === "api") {
        return (
            <EditorSection>
                <FieldLabel>Endpoint</FieldLabel>
                <TextField value={node.data.endpoint} onChange={(event) => updateNode(node.id, { data: { endpoint: event.target.value || "/" } })} />

                <FieldLabel>Method</FieldLabel>
                <SelectField select value={node.data.method} onChange={(event) => updateNode(node.id, { data: { method: event.target.value as (typeof API_METHODS)[number] } })}>
                    {API_METHODS.map((method) => (
                        <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                </SelectField>

                <SwitchField
                    label="Auth required"
                    control={
                        <Switch
                            checked={node.data.authRequired}
                            onChange={(event) => updateNode(node.id, { data: { authRequired: event.target.checked } })}
                        />
                    }
                />
            </EditorSection>
        );
    }

    if (node.kind === "database") {
        return (
            <EditorSection>
                <FieldLabel>Provider</FieldLabel>
                <SelectField select value={node.data.provider} onChange={(event) => updateNode(node.id, { data: { provider: event.target.value as "postgres" | "mysql" | "mongodb" | "sqlite" } })}>
                    <MenuItem value="postgres">Postgres</MenuItem>
                    <MenuItem value="mysql">MySQL</MenuItem>
                    <MenuItem value="mongodb">MongoDB</MenuItem>
                    <MenuItem value="sqlite">SQLite</MenuItem>
                </SelectField>

                <FieldLabel>Entity name</FieldLabel>
                <TextField value={node.data.entityName} onChange={(event) => updateNode(node.id, { data: { entityName: event.target.value } })} />

                <FieldLabel>Table / model ref</FieldLabel>
                <TextField value={node.data.modelRef} onChange={(event) => updateNode(node.id, { data: { modelRef: event.target.value } })} />
            </EditorSection>
        );
    }

    if (node.kind === "action") {
        return (
            <EditorSection>
                <FieldLabel>Trigger</FieldLabel>
                <SelectField select value={node.data.trigger} onChange={(event) => updateNode(node.id, { data: { trigger: event.target.value as "user" | "system" | "cron" } })}>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="cron">Cron</MenuItem>
                </SelectField>

                <FieldLabel>Target</FieldLabel>
                <TextField value={node.data.target} onChange={(event) => updateNode(node.id, { data: { target: event.target.value } })} />
            </EditorSection>
        );
    }

    return null;
}




export function InspectorPanel() {
    const selectedNode = useProjectEditorStore((state) => state.project.nodes.find((node) => node.id === state.ui.selectedNodeId) ?? null);
    const updateNode = useProjectEditorStore((state) => state.updateNode);
    const deleteNode = useProjectEditorStore((state) => state.deleteNode);

    return (
        <AnimatePresence initial={false}>
            {selectedNode ? (
                <motion.div
                    key={selectedNode.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={projectEditorStyles.inspector.motionWrapper}
                >
                    <EditorPanel elevation={0} sx={projectEditorStyles.inspector.panel}>
                        <Stack spacing={2.25}>
                            <PanelHeader>
                                <br />
                                <EditorSectionTitle>{selectedNode.name}</EditorSectionTitle>
                                <EditorSectionHint>Edit the basic properties of the selected block. Changes persist locally in real time.</EditorSectionHint>
                            </PanelHeader>

                            <EditorSection>
                                <EditorSectionTitle>Basic info</EditorSectionTitle>
                                <FieldLabel>Name</FieldLabel>
                                <TextField value={selectedNode.name} onChange={(event) => updateNode(selectedNode.id, { name: event.target.value })} />
                                <FieldLabel>Description</FieldLabel>
                                <TextField multiline minRows={3} value={selectedNode.description} onChange={(event) => updateNode(selectedNode.id, { description: event.target.value })} />
                            </EditorSection>

                            <EditorSection>
                                <EditorSectionTitle>Type config</EditorSectionTitle>
                                <TypeConfigFields node={selectedNode} />
                            </EditorSection>

                            <EditorSection>
                                <EditorSectionTitle>Metadata</EditorSectionTitle>
                                <MetadataRow label="Kind" value={selectedNode.kind} />
                                <MetadataRow label="ID" value={selectedNode.id.slice(0, 10)} />
                                <MetadataRow label="Updated" value={new Date(selectedNode.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} />
                            </EditorSection>

                            <ToolbarButton variant="outlined" color="error" onClick={() => deleteNode(selectedNode.id)} startIcon={<ProjectIcon icon={Delete02Icon} size={18} />}>
                                Delete node
                            </ToolbarButton>
                        </Stack>
                    </EditorPanel>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
