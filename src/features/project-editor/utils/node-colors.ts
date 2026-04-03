import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";

export interface NodeVisualToken {
    kind: ProjectNodeKind;
    label: string;
    shortLabel: string;
    description: string;
    accent: string;
    accentSoft: string;
    accentMuted: string;
}

export const NODE_VISUALS: Record<ProjectNodeKind, NodeVisualToken> = {
    view: {
        kind: "view",
        label: "View",
        shortLabel: "UI",
        description: "Screens, routes and rendering surfaces.",
        accent: "#4f7cff",
        accentSoft: "rgba(79, 124, 255, 0.14)",
        accentMuted: "#dce7ff",
    },
    api: {
        kind: "api",
        label: "API",
        shortLabel: "HTTP",
        description: "Server endpoints and contract boundaries.",
        accent: "#7966ff",
        accentSoft: "rgba(121, 102, 255, 0.14)",
        accentMuted: "#e4deff",
    },
    database: {
        kind: "database",
        label: "Database",
        shortLabel: "DB",
        description: "Persistent models and storage providers.",
        accent: "#27926b",
        accentSoft: "rgba(39, 146, 107, 0.14)",
        accentMuted: "#d8f2e8",
    },
    action: {
        kind: "action",
        label: "Action",
        shortLabel: "FX",
        description: "Business logic, triggers and execution targets.",
        accent: "#c47b2a",
        accentSoft: "rgba(196, 123, 42, 0.14)",
        accentMuted: "#f8e7d3",
    },
};

export const NODE_PALETTE = Object.values(NODE_VISUALS);
