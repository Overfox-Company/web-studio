"use client";

import {
    UiBox,
    UiColumn,
    UiDividerLine,
    UiField,
    UiJsonFieldEditor,
    UiMenuItem,
    UiSectionDescription,
    UiSectionTitle,
    UiSwitchRow,
    UiToggle,
    UiTypography,
} from "@/src/components/ui-kit";
import { useEditorStore } from "@/src/store/editor-store";

export function NodeConfigPanel() {
    const selectedNode = useEditorStore((state) => state.nodes.find((node) => node.id === state.selectedNodeId) ?? null);
    const updateNodeData = useEditorStore((state) => state.updateNodeData);

    if (!selectedNode) {
        return (
            <UiBox sx={{ borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#11141b", p: 2.5 }}>
                <UiSectionTitle>Configuration</UiSectionTitle>
                <UiSectionDescription sx={{ mt: 0.8 }}>
                    Select a node to edit its schema, rendering strategy, routes, data contracts or backend dependencies.
                </UiSectionDescription>
            </UiBox>
        );
    }

    return (
        <UiColumn sx={{ borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", background: "#11141b", p: 2.4 }}>
            <UiBox>
                <UiTypography variant="overline" sx={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em" }}>
                    Inspector
                </UiTypography>
                <UiSectionTitle>{selectedNode.data.label}</UiSectionTitle>
            </UiBox>

            <UiField
                label="Label"
                value={selectedNode.data.label}
                onChange={(event) => updateNodeData(selectedNode.id, { label: event.target.value })}
            />

            <UiField
                label="Description"
                multiline
                minRows={3}
                value={selectedNode.data.description}
                onChange={(event) => updateNodeData(selectedNode.id, { description: event.target.value })}
            />

            <UiDividerLine sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

            {selectedNode.data.kind === "page" ? (
                <UiColumn>
                    <UiField label="Route path" value={selectedNode.data.route} onChange={(event) => updateNodeData(selectedNode.id, { route: event.target.value })} />
                    <UiField
                        select
                        label="Render mode"
                        value={selectedNode.data.renderMode}
                        onChange={(event) => updateNodeData(selectedNode.id, { renderMode: event.target.value as "ssr" | "csr" })}
                    >
                        <UiMenuItem value="ssr">SSR</UiMenuItem>
                        <UiMenuItem value="csr">CSR</UiMenuItem>
                    </UiField>
                    <UiField label="Layout" value={selectedNode.data.layout} onChange={(event) => updateNodeData(selectedNode.id, { layout: event.target.value })} />
                </UiColumn>
            ) : null}

            {selectedNode.data.kind === "component" ? (
                <UiColumn>
                    <UiField label="Component type" value={selectedNode.data.componentType} onChange={(event) => updateNodeData(selectedNode.id, { componentType: event.target.value })} />
                    <UiJsonFieldEditor key={`${selectedNode.id}-props`} label="Props schema" value={selectedNode.data.propsSchema} onApply={(value) => updateNodeData(selectedNode.id, { propsSchema: value as Record<string, string> })} />
                    <UiField
                        label="State dependencies"
                        value={selectedNode.data.stateDependencies.join(", ")}
                        onChange={(event) => updateNodeData(selectedNode.id, { stateDependencies: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
                    />
                </UiColumn>
            ) : null}

            {selectedNode.data.kind === "database" ? (
                <UiColumn>
                    <UiField label="Model name" value={selectedNode.data.modelName} onChange={(event) => updateNodeData(selectedNode.id, { modelName: event.target.value })} />
                    <UiJsonFieldEditor key={`${selectedNode.id}-fields`} label="Fields" value={selectedNode.data.fields} rows={8} onApply={(value) => updateNodeData(selectedNode.id, { fields: value as typeof selectedNode.data.fields })} />
                    <UiJsonFieldEditor key={`${selectedNode.id}-relations`} label="Relations" value={selectedNode.data.relations} rows={5} onApply={(value) => updateNodeData(selectedNode.id, { relations: value as typeof selectedNode.data.relations })} />
                    <UiField label="Indexes" value={selectedNode.data.indexes.join(", ")} onChange={(event) => updateNodeData(selectedNode.id, { indexes: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
                </UiColumn>
            ) : null}

            {selectedNode.data.kind === "api" ? (
                <UiColumn>
                    <UiField label="Method" value={selectedNode.data.method} onChange={(event) => updateNodeData(selectedNode.id, { method: event.target.value.toUpperCase() })} />
                    <UiField label="Route" value={selectedNode.data.route} onChange={(event) => updateNodeData(selectedNode.id, { route: event.target.value })} />
                    <UiField label="Input schema" multiline minRows={3} value={selectedNode.data.inputSchema} onChange={(event) => updateNodeData(selectedNode.id, { inputSchema: event.target.value })} />
                    <UiField label="Output schema" multiline minRows={3} value={selectedNode.data.outputSchema} onChange={(event) => updateNodeData(selectedNode.id, { outputSchema: event.target.value })} />
                </UiColumn>
            ) : null}

            {selectedNode.data.kind === "serverAction" ? (
                <UiColumn>
                    <UiField label="Action name" value={selectedNode.data.actionName} onChange={(event) => updateNodeData(selectedNode.id, { actionName: event.target.value })} />
                    <UiField label="Input data" multiline minRows={3} value={selectedNode.data.inputData} onChange={(event) => updateNodeData(selectedNode.id, { inputData: event.target.value })} />
                    <UiField label="Mutation logic" multiline minRows={4} value={selectedNode.data.mutationLogic} onChange={(event) => updateNodeData(selectedNode.id, { mutationLogic: event.target.value })} />
                    <UiField label="Database dependencies" value={selectedNode.data.databaseDependencies.join(", ")} onChange={(event) => updateNodeData(selectedNode.id, { databaseDependencies: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
                </UiColumn>
            ) : null}

            {selectedNode.data.kind === "externalApi" ? (
                <UiColumn>
                    <UiField label="Service name" value={selectedNode.data.serviceName} onChange={(event) => updateNodeData(selectedNode.id, { serviceName: event.target.value })} />
                    <UiField label="Base URL" value={selectedNode.data.baseUrl} onChange={(event) => updateNodeData(selectedNode.id, { baseUrl: event.target.value })} />
                    <UiField label="Auth strategy" value={selectedNode.data.authStrategy} onChange={(event) => updateNodeData(selectedNode.id, { authStrategy: event.target.value })} />
                </UiColumn>
            ) : null}

            {selectedNode.data.kind === "stateStore" ? (
                <UiColumn>
                    <UiField label="Store name" value={selectedNode.data.storeName} onChange={(event) => updateNodeData(selectedNode.id, { storeName: event.target.value })} />
                    <UiJsonFieldEditor key={`${selectedNode.id}-state`} label="State shape" value={selectedNode.data.stateShape} rows={6} onApply={(value) => updateNodeData(selectedNode.id, { stateShape: value as Record<string, string> })} />
                    <UiSwitchRow control={<UiToggle checked={selectedNode.data.persistence} onChange={(event) => updateNodeData(selectedNode.id, { persistence: event.target.checked })} />} label="Persist store" />
                </UiColumn>
            ) : null}

            {selectedNode.data.kind === "group" ? (
                <UiField label="Purpose" multiline minRows={3} value={selectedNode.data.purpose} onChange={(event) => updateNodeData(selectedNode.id, { purpose: event.target.value })} />
            ) : null}
        </UiColumn>
    );
}