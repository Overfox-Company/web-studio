"use client";

import { UiBox, UiColumn, UiPrimaryButton, UiRow, UiTypography } from "@/src/components/ui-kit";
import { exportApplicationSpec } from "@/src/features/exporter/lib/export-app-spec";
import { useEditorStore } from "@/src/store/editor-store";

export function ExportPanel() {
    const nodes = useEditorStore((state) => state.nodes);
    const edges = useEditorStore((state) => state.edges);

    return (
        <UiColumn sx={{ borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", background: "#11141b", p: 2.4 }}>
            <UiBox>
                <UiTypography variant="overline" sx={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em" }}>
                    Exporter
                </UiTypography>
                <UiTypography variant="h6" sx={{ fontSize: 17, fontWeight: 700 }}>
                    Machine-readable application spec
                </UiTypography>
            </UiBox>

            <UiRow>
                <UiPrimaryButton
                    onClick={() => {
                        const downloadSpec = exportApplicationSpec(nodes, edges);
                        const blob = new Blob([JSON.stringify(downloadSpec, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "web-studio-spec.json";
                        link.click();
                        URL.revokeObjectURL(url);
                    }}
                >
                    Download JSON
                </UiPrimaryButton>
            </UiRow>

            <UiBox sx={{ borderRadius: 2.5, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#0f131a", p: 1.5 }}>
                <UiTypography variant="body2" sx={{ color: "rgba(255,255,255,0.64)", lineHeight: 1.6 }}>
                    The export preview is hidden for now. Use the download action to generate the current application spec as JSON.
                </UiTypography>
            </UiBox>
        </UiColumn>
    );
}