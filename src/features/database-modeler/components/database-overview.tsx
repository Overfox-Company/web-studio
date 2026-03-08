"use client";

import { useMemo } from "react";

import { UiBox, UiColumn, UiSectionDescription, UiSectionTitle, UiTypography } from "@/src/components/ui-kit";
import { useEditorStore } from "@/src/store/editor-store";
import type { ArchitectureNode, DatabaseNodeData } from "@/src/types/editor";

function isDatabaseNode(node: ArchitectureNode): node is ArchitectureNode & { data: DatabaseNodeData } {
    return node.data.kind === "database";
}

export function DatabaseOverview() {
    const nodes = useEditorStore((state) => state.nodes);
    const models = useMemo(() => nodes.filter(isDatabaseNode), [nodes]);

    return (
        <UiColumn spacing={1.5} sx={{ borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#11141b", p: 2.25 }}>
            <UiBox>
                <UiSectionTitle sx={{ fontSize: 16 }}>
                    Database Modeler
                </UiSectionTitle>
                <UiSectionDescription>
                    Schema overview extracted from database nodes in the graph.
                </UiSectionDescription>
            </UiBox>

            <UiColumn spacing={1}>
                {models.map((model) => (
                    <UiBox key={model.id} sx={{ borderRadius: 2.5, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#151922", p: 1.25 }}>
                        <UiTypography variant="body2" sx={{ fontWeight: 700 }}>
                            {model.data.modelName}
                        </UiTypography>
                        <UiTypography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                            {model.data.fields.map((field) => `${field.name}: ${field.type}`).join(" · ")}
                        </UiTypography>
                    </UiBox>
                ))}
            </UiColumn>
        </UiColumn>
    );
}