import type { CSSProperties } from "react";

import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { sharedCustomization } from "@/src/customization/shared";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";
import type { SocketType } from "@/src/features/project-editor/utils/socket-types";

type Sx = SxProps<Theme>;

export interface NodeVisualToken {
    kind: ProjectNodeKind;
    label: string;
    shortLabel: string;
    description: string;
    accent: string;
    accentSoft: string;
    accentMuted: string;
}

export const PROJECT_NODE_VISUALS: Record<ProjectNodeKind, NodeVisualToken> = {
    page: {
        kind: "page",
        label: "Page",
        shortLabel: "PG",
        description: "Exportable pages and visual entry points.",
        accent: "var(--ws-project-node-view-accent)",
        accentSoft: "var(--ws-project-node-view-accent-soft)",
        accentMuted: "var(--ws-project-node-view-accent-muted)",
    },
    api: {
        kind: "api",
        label: "API",
        shortLabel: "HTTP",
        description: "Server endpoints and contract boundaries.",
        accent: "var(--ws-project-node-api-accent)",
        accentSoft: "var(--ws-project-node-api-accent-soft)",
        accentMuted: "var(--ws-project-node-api-accent-muted)",
    },
    database: {
        kind: "database",
        label: "Database",
        shortLabel: "DB",
        description: "Persistent models and storage providers.",
        accent: "var(--ws-project-node-database-accent)",
        accentSoft: "var(--ws-project-node-database-accent-soft)",
        accentMuted: "var(--ws-project-node-database-accent-muted)",
    },
    action: {
        kind: "action",
        label: "Action",
        shortLabel: "FX",
        description: "Business logic, triggers and execution targets.",
        accent: "var(--ws-project-node-action-accent)",
        accentSoft: "var(--ws-project-node-action-accent-soft)",
        accentMuted: "var(--ws-project-node-action-accent-muted)",
    },
};

export const PROJECT_NODE_PALETTE = Object.values(PROJECT_NODE_VISUALS);

export const PROJECT_SOCKET_COLOR_MAP: Record<SocketType, string> = {
    trigger: "var(--ws-project-socket-trigger)",
    payload: "var(--ws-project-socket-payload)",
    query: "var(--ws-project-socket-query)",
    entity: "var(--ws-project-socket-entity)",
    result: "var(--ws-project-socket-result)",
};

export const projectEditorDefaults = {
    fallbackEdgeColor: "var(--ws-project-handle-fallback)",
};

const LEFT_PANEL_WIDTH = {
    xs: "min(88vw, 304px)",
    lg: "250px",
} as const;

const RIGHT_PANEL_WIDTH = {
    xs: "min(90vw, 360px)",
    lg: "360px",
} as const;

function resolveSocketAlignment(side: "input" | "output") {
    return side === "input" ? "flex-start" : "flex-end";
}

export const projectEditorStyles = {
    primitives: {
        shell: {
            minHeight: sharedCustomization.screenHeight,
            background: "var(--ws-project-shell-background)",
            color: "var(--ws-project-topbar-text)",
        },
        panel: {
            borderRadius: sharedCustomization.radius.lg,
            border: "1px solid var(--ws-project-panel-border)",
            backgroundColor: "var(--ws-project-panel-background)",
        },
        sectionTitle: {
            fontSize: "0.94rem",
            fontWeight: 600,
            color: sharedCustomization.text.primary,
            letterSpacing: "-0.02em",
        },
        sectionHint: {
            fontSize: "0.86rem",
            lineHeight: 1.55,
            color: sharedCustomization.text.secondary,
        },
        toolbarButton: {
            minHeight: 38,
            borderRadius: sharedCustomization.radius.sm,
        },
        statusBadge: {
            height: 30,
            borderRadius: sharedCustomization.radius.xs,
            fontSize: "0.76rem",
            background: "var(--ws-project-status-background)",
            border: "1px solid var(--ws-project-status-border)",
            color: "var(--ws-project-status-text)",
        },
        fieldLabel: {
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#475467",
            letterSpacing: "0.01em",
        },
        switchField: (sx?: Sx): Sx => {
            const base = {
                marginInline: 0,
                justifyContent: "space-between",
                width: "100%",
                gap: 12,
                color: sharedCustomization.text.strong,
            } satisfies Sx;

            return sx ? ([base, sx] as Sx) : base;
        },
        panelHeader: {
            gap: 0.75,
        },
        panelEyebrow: {
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: sharedCustomization.text.muted,
        },
        panelTitle: {
            fontSize: "1.05rem",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: sharedCustomization.text.primary,
        },
        textField: {
            ".MuiInputBase-input, .MuiInputBase-inputMultiline": {
                fontSize: "0.92rem",
            },
        },
        selectField: {
            ".MuiInputBase-input": {
                fontSize: "0.92rem",
            },
        },
    },
    dragPreview: {
        wrapper: {
            pointerEvents: "none",
        } satisfies CSSProperties,
        panel: {
            p: 1.4,
            borderRadius: sharedCustomization.radius.sm,
            minWidth: 240,
            boxShadow: "var(--ws-project-drag-preview-shadow)",
            pointerEvents: "none",
        },
        title: {
            fontSize: "0.88rem",
            fontWeight: 700,
            color: sharedCustomization.text.primary,
        },
        description: {
            fontSize: "0.78rem",
            color: sharedCustomization.text.secondary,
        },
    },
    layout: {
        root: {
            minHeight: sharedCustomization.screenHeight,
            display: "grid",
            gridTemplateRows: "auto minmax(0, 1fr)",
        },
        stage: {
            position: "relative",
            minHeight: 0,
            overflow: "hidden",
        },
        canvasFill: sharedCustomization.fullHeight,
        dock: (side: "left" | "right"): Sx => ({
            position: "absolute",
            top: { xs: 16, lg: 24 },
            bottom: { xs: 16, lg: 24 },
            width: side === "left" ? LEFT_PANEL_WIDTH : RIGHT_PANEL_WIDTH,
            zIndex: 5,
            pointerEvents: "none",
            ...(side === "left"
                ? { left: { xs: 16, lg: 24 } }
                : { right: { xs: 16, lg: 24 } }),
        }),
        dockPanel: (open: boolean, side: "left" | "right"): Sx => ({
            height: "100%",
            transform: open
                ? "translateX(0)"
                : side === "left"
                    ? "translateX(calc(-100% - 18px))"
                    : "translateX(calc(100% + 18px))",
            opacity: open ? 1 : 0,
            transition: `transform ${sharedCustomization.transition.emphasis}, opacity ${sharedCustomization.transition.standard}`,
            pointerEvents: open ? "auto" : "none",
        }),
        paletteToggle: (open: boolean): Sx => ({
            position: "absolute",
            top: { xs: 28, lg: 36 },
            left: {
                xs: open ? "calc(16px + min(88vw, 304px) - 18px)" : "16px",
                lg: open ? "calc(24px + 296px - 106px)" : "24px",
            },
            minWidth: 40,
            width: 40,
            px: 0,
            zIndex: 6,
            borderRadius: sharedCustomization.radius.sm,
            background: "var(--ws-project-panel-toggle-background)",
            transition: `left ${sharedCustomization.transition.emphasis}`,
        }),
        inspectorToggle: (open: boolean): Sx => ({
            position: "absolute",
            top: { xs: 28, lg: 36 },
            right: {
                xs: open ? "calc(16px + min(90vw, 360px) - 18px)" : "16px",
                lg: open ? "calc(24px + 360px - 54px)" : "24px",
            },
            minWidth: 40,
            width: 40,
            px: 0,
            zIndex: 6,
            borderRadius: sharedCustomization.radius.sm,
            background: "var(--ws-project-panel-toggle-background)",
            transition: `right ${sharedCustomization.transition.emphasis}`,
        }),
    },
    topbar: {
        root: {
            px: 2,
            py: 1,
            borderBottom: "1px solid var(--ws-project-topbar-border)",
            background: "var(--ws-project-topbar-background)",
            backdropFilter: "blur(18px)",
        },
        projectNameField: {
            maxWidth: 360,
        },
    },
    canvas: {
        panel: {
            height: "100%",
        },
        surface: (isActive: boolean): Sx => ({
            position: "relative",
            height: "100%",
            overflow: "hidden",
            border: `1px solid ${isActive ? "var(--ws-project-canvas-surface-border-active)" : "var(--ws-project-canvas-surface-border)"}`,
            backgroundColor: isActive
                ? "var(--ws-project-canvas-surface-background-active)"
                : "var(--ws-project-canvas-surface-background)",
            transition: `border-color ${sharedCustomization.transition.standard}, box-shadow ${sharedCustomization.transition.standard}, background ${sharedCustomization.transition.standard}`,
        }),
        previewNode: {
            pointerEvents: "none",
            opacity: 0.82,
            filter: "saturate(0.98)",
        } satisfies CSSProperties,
        connectionLine: {
            stroke: "var(--ws-project-connection-stroke)",
            strokeWidth: 1.8,
        } satisfies CSSProperties,
        backgroundColor: "var(--ws-project-canvas-grid)",
        backgroundGap: 18,
        backgroundSize: 2.5,
        labBackgroundColor: "var(--ws-project-canvas-lab-grid)",
        labBackgroundGap: 18,
        labBackgroundSize: 1.1,
    },
    nodePalette: {
        panel: {
            height: "100%",
            p: 2.25,
        },
        section: {
            height: "100%",
        },
        list: {
            overflowY: "auto",
            pr: 0.5,
        },
        item: (accent: string, isActive: boolean, isDragging: boolean, transform: string | undefined): Sx => ({
            borderRadius: sharedCustomization.radius.lg,
            border: `1px solid ${isActive ? accent : "var(--ws-project-panel-border)"}`,
            background: isDragging ? "rgba(255,255,255,0.96)" : "rgba(235, 239, 246, 0)",
            p: 1,
            overflow: "hidden",
            cursor: "grab",
            opacity: isDragging ? 0.72 : 1,
            transform,
            boxShadow: isActive ? `0 12px 24px ${accent}12` : "none",
            transition: `border-color ${sharedCustomization.transition.standard}, transform ${sharedCustomization.transition.standard}, background-color ${sharedCustomization.transition.standard}, box-shadow ${sharedCustomization.transition.standard}, opacity ${sharedCustomization.transition.standard}`,
            willChange: "transform",
        }),
        itemTitle: {
            fontSize: "0.92rem",
            fontWeight: 700,
            color: sharedCustomization.text.primary,
            letterSpacing: "-0.02em",
        },
    },
    inspector: {
        motionWrapper: {
            height: "100%",
        } satisfies CSSProperties,
        panel: {
            height: "100%",
            p: 2.25,
            overflowY: "auto",
        },
        metadataLabel: {
            fontSize: "0.8rem",
            color: sharedCustomization.text.secondary,
        },
        metadataValue: {
            fontSize: "0.8rem",
            fontWeight: 600,
            color: sharedCustomization.text.primary,
            fontFamily: sharedCustomization.fonts.mono,
        },
    },
    baseNodeCard: {
        root: (accent: string, options: { selected: boolean; dragging: boolean; preview: boolean; clickable: boolean }): Sx => ({
            width: 372,
            borderRadius: sharedCustomization.radius.xxxl,
            border: options.preview
                ? `1px dashed ${accent}`
                : `1px solid ${options.selected ? accent : "var(--ws-project-node-card-border)"}`,
            background: options.preview
                ? "var(--ws-project-node-card-preview-background)"
                : "var(--ws-project-node-card-background)",
            boxShadow: options.preview
                ? "var(--ws-project-node-card-shadow-preview)"
                : options.dragging
                    ? "var(--ws-project-node-card-shadow-dragging)"
                    : "var(--ws-project-node-card-shadow)",
            opacity: options.preview ? 0.78 : options.dragging ? 0.96 : 1,
            overflow: "visible",
            transition: options.dragging
                ? "box-shadow 80ms linear, border-color 80ms linear, opacity 80ms linear"
                : `box-shadow 160ms ease, border-color 160ms ease, opacity 120ms ease`,
            willChange: options.dragging ? "box-shadow, opacity" : "auto",
            backdropFilter: "blur(14px)",
            cursor: options.clickable ? "pointer" : "default",
        }),
        grid: {
            display: "grid",
            gridTemplateColumns: "98px minmax(0, 1fr) 98px",
            gap: 1.1,
            alignItems: "start",
            p: 1.15,
        },
        sideColumn: {
            pt: 0.95,
        },
        sideLabel: (side: "left" | "right"): Sx => ({
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ws-project-node-card-overline)",
            textAlign: side === "right" ? "right" : "left",
        }),
        contentColumn: {
            minWidth: 0,
        },
        contentCard: {
            backgroundColor: "var(--ws-project-node-card-surface)",
            p: 1,
            borderRadius: sharedCustomization.radius.xl,
            border: "1px solid var(--ws-project-node-card-surface-border)",
        },
        description: {
            fontSize: "0.88rem",
            lineHeight: 1.55,
            color: "var(--ws-project-node-card-text)",
            minHeight: 44,
        },
        footerCard: {
            backgroundColor: "var(--ws-project-node-card-surface-muted)",
            p: 1,
            borderRadius: sharedCustomization.radius.xl,
            border: "1px solid var(--ws-project-node-card-surface-border)",
        },
        footerMono: {
            fontSize: "0.74rem",
            color: "var(--ws-project-node-card-muted)",
            fontFamily: sharedCustomization.fonts.mono,
        },
        footerText: {
            fontSize: "0.74rem",
            color: "var(--ws-project-node-card-muted)",
        },
    },
    nodeHeader: {
        title: {
            fontSize: "0.98rem",
            lineHeight: 1.15,
            fontWeight: 700,
            color: "var(--ws-project-node-card-title)",
            letterSpacing: "-0.03em",
            minWidth: 0,
        },
        column: {
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
        } satisfies CSSProperties,
        kindChip: (accentSoft: string): Sx => ({
            backgroundColor: accentSoft,
            width: "fit-content",
            px: 0.5,
            py: 0.25,
            borderRadius: sharedCustomization.radius.xs,
            mt: 0.25,
        }),
        kindChipText: (accent: string): Sx => ({
            fontSize: "0.70rem",
            lineHeight: 1.15,
            fontWeight: 700,
            color: accent,
            letterSpacing: "-0.03em",
            minWidth: 0,
        }),
    },
    socket: {
        flowHandle: (color: string, side: "input" | "output"): CSSProperties => {
            const handleStyle = {
                top: "50%",
                left: side === "input" ? 0 : undefined,
                right: side === "output" ? 0 : undefined,
                transform: side === "input" ? "translate(-55%, -50%)" : "translate(55%, -50%)",
                background: color,
                borderColor: "var(--ws-project-handle-border)",
                boxShadow: `0 0 0 1px ${color}26`,
                "--socket-color": color,
            } as CSSProperties & Record<"--socket-color", string>;

            return handleStyle;
        },
        staticHandle: (color: string): Sx => ({
            width: 12,
            height: 12,
            borderRadius: sharedCustomization.radius.pill,
            background: color,
            border: "2px solid var(--ws-project-handle-border)",
            boxShadow: `0 0 0 1px ${color}26`,
            flexShrink: 0,
        }),
        container: (color: string, compatibilityState: "neutral" | "source" | "compatible" | "dimmed", side: "input" | "output"): Sx => {
            const isHighlighted = compatibilityState === "source" || compatibilityState === "compatible";

            return {
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: resolveSocketAlignment(side),
                gap: 0.75,
                minHeight: 34,
                px: 1,
                py: 0.45,
                borderRadius: sharedCustomization.radius.lg,
                backgroundColor: isHighlighted
                    ? "var(--ws-project-socket-background-highlight)"
                    : "var(--ws-project-socket-background)",
                boxShadow: isHighlighted ? `0 0 0 1px ${color}22` : "none",
                opacity: compatibilityState === "dimmed" ? 0.42 : 1,
                transition: `opacity ${sharedCustomization.transition.fast}, box-shadow ${sharedCustomization.transition.fast}, background-color ${sharedCustomization.transition.fast}`,
            };
        },
        labelStack: (side: "input" | "output"): Sx => ({
            alignItems: resolveSocketAlignment(side),
            minWidth: 0,
        }),
        label: (compatibilityState: "neutral" | "source" | "compatible" | "dimmed", side: "input" | "output"): Sx => ({
            fontSize: "0.74rem",
            fontWeight: 700,
            lineHeight: 1.1,
            color: compatibilityState === "dimmed"
                ? "var(--ws-project-socket-text-dimmed)"
                : "var(--ws-project-socket-text)",
            textAlign: side === "input" ? "left" : "right",
        }),
        type: (color: string, side: "input" | "output"): Sx => ({
            fontSize: "0.62rem",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color,
            textAlign: side === "input" ? "left" : "right",
        }),
    },
    nodeMetaRow: {
        label: {
            fontSize: "0.74rem",
            color: sharedCustomization.text.secondary,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
        },
        value: {
            fontSize: "0.8rem",
            color: sharedCustomization.text.primary,
            fontWeight: 600,
            textAlign: "right",
            letterSpacing: "-0.01em",
        },
    },
    nodeBadge: {
        wrapper: {
            display: "inline-flex",
            alignItems: "center",
            paddingRight: "4px",
            borderRadius: sharedCustomization.radius.xs,
        },
        dot: (accent: string): Sx => ({
            width: 10,
            height: 10,
            borderRadius: "20px",
            background: accent,
        }),
    },
    nodeIcon: {
        wrapper: (accent: string): Sx => ({
            width: 42,
            height: 42,
            borderRadius: sharedCustomization.radius.xs,
            display: "grid",
            placeItems: "center",
            color: accent,
            flexShrink: 0,
        }),
    },
    emptyState: {
        wrapper: {
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            zIndex: 3,
            justifyContent: "center",
        },
        card: {
            px: 3,
            py: 2.5,
            borderRadius: sharedCustomization.radius.xs,
            border: "1px solid var(--ws-project-empty-border)",
            background: "var(--ws-project-empty-background)",
            backdropFilter: "blur(12px)",
        },
        iconColor: "var(--ws-project-node-view-accent)",
        title: {
            fontSize: "0.94rem",
            fontWeight: 600,
            color: sharedCustomization.text.primary,
            letterSpacing: "-0.02em",
        },
    },
    standalone: {
        shellPadding: {
            minHeight: sharedCustomization.screenHeight,
            p: { xs: 2, lg: 3 },
        },
        shellFrame: {
            height: "calc(100vh - 48px)",
        },
        scenePanel: {
            height: "100%",
            p: 1.25,
        },
        sceneSurface: {
            position: "relative",
            height: "100%",
            borderRadius: sharedCustomization.radius.sm,
            overflow: "hidden",
            border: "1px solid var(--ws-project-canvas-surface-border)",
            background: "var(--ws-project-canvas-lab-background)",
        },
    },
};