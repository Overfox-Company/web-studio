"use client";

import { UiBox, UiColumn, UiSectionDescription, UiSectionTitle, UiTypography } from "@/src/components/ui-kit";

import { useEditorStore } from "@/src/store/editor-store";

export function DataFlowSummary() {
    const edges = useEditorStore((state) => state.edges);
    const nodes = useEditorStore((state) => state.nodes);

    function getEdgeSummary(edge: (typeof edges)[number]) {
        if (edge.data?.trigger === "navigation") {
            return `navigation to ${edge.data?.schema?.replace("navigate:", "") ?? "target route"}`;
        }

        return `${edge.data?.trigger ?? "sync"} · ${edge.data?.schema ?? "schema not defined"}`;
    }

    return (
        <UiColumn spacing={1.5} sx={{ borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#11141b", p: 2.25 }}>
            <UiBox>
                <UiSectionTitle sx={{ fontSize: 16 }}>
                    Data Flow
                </UiSectionTitle>
                <UiSectionDescription>
                    {edges.length} modeled flows across {nodes.length} architecture nodes.
                </UiSectionDescription>
            </UiBox>

            <UiColumn spacing={1}>
                {edges.slice(0, 5).map((edge) => {
                    const source = nodes.find((node) => node.id === edge.source)?.data.label ?? edge.source;
                    const target = nodes.find((node) => node.id === edge.target)?.data.label ?? edge.target;

                    return (
                        <UiBox key={edge.id} sx={{ borderRadius: 2.5, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#151922", p: 1.25 }}>
                            <UiTypography variant="body2" sx={{ fontWeight: 700 }}>
                                {source} to {target}
                            </UiTypography>
                            <UiTypography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                                {getEdgeSummary(edge)}
                            </UiTypography>
                        </UiBox>
                    );
                })}
            </UiColumn>
        </UiColumn>
    );
}