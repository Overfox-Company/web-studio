"use client";

import { memo } from "react";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import { UiBox, UiStack, UiTag, UiTypography } from "@/src/components/ui-kit";
import { NODE_DEFINITIONS } from "@/src/features/nodes/config/node-definitions";
import type { ArchitectureNode } from "@/src/types/editor";

function getDetails(node: ArchitectureNode["data"]) {
    switch (node.kind) {
        case "page":
            return [node.renderMode.toUpperCase(), node.route, node.layout];
        case "component":
            return [node.componentType, `${Object.keys(node.propsSchema).length} props`, `${node.stateDependencies.length} deps`];
        case "database":
            return [node.modelName, `${node.fields.length} fields`, `${node.relations.length} relations`];
        case "api":
            return [node.method, node.route, "typed I/O"];
        case "serverAction":
            return [node.actionName, `${node.databaseDependencies.length} db deps`, "mutation"];
        case "externalApi":
            return [node.serviceName, node.authStrategy, "integration"];
        case "stateStore":
            return [node.storeName, `${Object.keys(node.stateShape).length} keys`, node.persistence ? "persisted" : "volatile"];
        case "group":
            return ["group", node.purpose, "domain boundary"];
    }
}

export const ArchitectureNodeCard = memo(function ArchitectureNodeCard({ data, selected }: NodeProps<ArchitectureNode>) {
    const definition = NODE_DEFINITIONS[data.kind];
    const details = getDetails(data);
    const isGroup = data.kind === "group";

    return (
        <UiBox
            sx={{
                minWidth: isGroup ? "100%" : 260,
                minHeight: isGroup ? "100%" : undefined,
                borderRadius: 1,
                border: `1px solid ${selected ? definition.accent : "rgba(255,255,255,0.12)"}`,
                background: isGroup
                    ? "#10141b"
                    : "#131821",
                boxShadow: selected
                    ? `0 0 0 1px ${definition.accent}, 0 10px 24px rgba(0,0,0,0.2)`
                    : "0 6px 14px rgba(0,0,0,0.14)",
                padding: isGroup ? 2 : 2.25,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {!isGroup ? <Handle type="target" position={Position.Left} style={{ zIndex: 100, background: definition.accent, width: 12, height: 12 }} /> : null}
            {!isGroup ? <Handle type="source" position={Position.Right} style={{ zIndex: 100, background: definition.accent, width: 12, height: 12 }} /> : null}

            <UiStack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
                <UiTag
                    label={definition.title}
                    sx={{
                        backgroundColor: `${definition.accent}18`,
                        color: definition.accent,
                        fontWeight: 700,
                        borderRadius: 1,
                        border: "1px solid rgba(255,255,255,0.06)",
                    }}
                />
                <UiTypography variant="caption" sx={{ color: "rgba(255,255,255,0.48)", textTransform: "uppercase", letterSpacing: "0.18em" }}>
                    {data.kind}
                </UiTypography>
            </UiStack>

            <UiTypography variant="h6" sx={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.03em", mb: 0.75 }}>
                {data.label}
            </UiTypography>

            <UiTypography variant="body2" sx={{ color: "rgba(234,239,255,0.7)", lineHeight: 1.55, minHeight: 44 }}>
                {data.description}
            </UiTypography>

            <UiStack direction="row" flexWrap="wrap" useFlexGap gap={0.75} sx={{ mt: 1.75 }}>
                {details.map((detail) => (
                    <UiBox
                        key={detail}
                        sx={{
                            borderRadius: 1.5,
                            border: "1px solid rgba(255,255,255,0.1)",
                            backgroundColor: "#10141b",
                            px: 1,
                            py: 0.45,
                            fontSize: 11,
                            color: "rgba(255,255,255,0.76)",
                        }}
                    >
                        {detail}
                    </UiBox>
                ))}
            </UiStack>
        </UiBox>
    );
});