import type { CSSProperties } from "react";

import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { sharedCustomization } from "@/src/customization/shared";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";
import type { SocketType } from "@/src/features/project-editor/utils/socket-types";

type Sx = SxProps<Theme>;
const CARD = "#242326";
const CANVAS = "#161618";
const SHELL = "#09090c";
const NODE_PANEL = "#1c1b1f";
const LINE_CONNECTIONS = "#b1b3b4";
const TEXT = "#ffffff";
const TEXT_NODE = "#e4e4e4";
const NODE_TITLE_IO = "#7d7f85";

const NODE_VIEW_ACCENT = "#575aff";
const NODE_API_ACCENT = "#cbdd6c";
const NODE_DATABASE_ACCENT = "#25c657";
const NODE_ACTION_ACCENT = "#d64178";
const LAYOUT_PRIMARY_ACCENT = "#92DA70";
export const projectEditorTokens = {
    layoutPrimaryAccent: LAYOUT_PRIMARY_ACCENT,
    layoutPrimaryAccentStrong: "#79c655",
    layoutPrimaryAccentSoft: "rgba(146, 218, 112, 0.16)",
    layoutPrimaryAccentBorder: "rgba(146, 218, 112, 0.4)",
    layoutPrimaryAccentText: "#0d1408",
    shellBackground: SHELL,
    topbarBackground: SHELL,
    topbarText: TEXT,
    topbarBorder: "rgba(255, 255, 255, 0.08)",
    panelBackground: CANVAS,
    panelToggleBackground: CARD,
    statusBackground: CARD,
    statusText: LAYOUT_PRIMARY_ACCENT,
    statusBorder: "transparent",
    panelBorder: "rgba(148, 163, 184, 0.24)",
    dragPreviewShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
    canvasSurfaceBorder: "rgba(59, 59, 59, 0.85)",
    canvasSurfaceBorderActive: "rgba(79, 124, 255, 0.4)",
    canvasSurfaceBackground: "transparent",
    canvasSurfaceBackgroundActive: "rgba(157, 170, 198, 0.1)",
    canvasGrid: CARD,
    canvasLabGrid: "rgba(148, 163, 184, 0.18)",
    canvasLabBackground: "radial-gradient(circle at top left, rgba(79, 124, 255, 0.06), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
    connectionStroke: LINE_CONNECTIONS,
    emptyBorder: "rgba(255, 0, 221, 0)",
    emptyBackground: CARD,
    nodeCardBackground: NODE_PANEL,
    nodeCardPreviewBackground: NODE_PANEL,
    nodeCardSurface: CARD,
    nodeCardSurfaceMuted: CARD,
    nodeCardSurfaceBorder: "rgba(0, 255, 0, 0)",
    nodeCardBorder: SHELL,
    nodeCardTitle: TEXT,
    nodeCardText: TEXT_NODE,
    nodeCardMuted: TEXT_NODE,
    nodeCardOverline: NODE_TITLE_IO,
    nodeCardShadow: "0 14px 30px rgba(15, 23, 42, 0.07)",
    nodeCardShadowDragging: "0 18px 36px rgba(15, 23, 42, 0.08)",
    nodeCardShadowPreview: "0 14px 30px rgba(15, 23, 42, 0.08)",
    nodeViewAccent: NODE_VIEW_ACCENT,
    nodeViewAccentSoft: "rgba(79, 124, 255, 0.14)",
    nodeViewAccentMuted: "#dce7ff",
    nodeApiAccent: NODE_API_ACCENT,
    nodeApiAccentSoft: "rgba(121, 102, 255, 0.14)",
    nodeApiAccentMuted: "#e4deff",
    nodeDatabaseAccent: NODE_DATABASE_ACCENT,
    nodeDatabaseAccentSoft: "rgba(39, 146, 107, 0.14)",
    nodeDatabaseAccentMuted: "#15ff00",
    nodeActionAccent: NODE_ACTION_ACCENT,
    nodeActionAccentSoft: "rgba(196, 123, 42, 0.14)",
    nodeActionAccentMuted: "#f8e7d3",
    socketBackground: CARD,
    socketBackgroundHighlight: "rgba(79, 79, 79, 0.94)",
    socketText: NODE_TITLE_IO,
    socketTextDimmed: "rgb(58, 58, 58)",
    socketTrigger: "#f59e0b",
    socketPayload: "#3b82f6",
    socketQuery: "#06b6d4",
    socketEntity: "#10b981",
    socketResult: "#8b5cf6",
    handleBorder: SHELL,
    handleFallback: "#94a3b8",
    handleHalo: "rgba(255, 255, 255, 0.22)",
    handleDimBorder: "rgba(255, 255, 255, 0.72)",
    edgeHoverShadow: "rgba(15, 23, 42, 0.14)",
    edgeSelectedShadow: "rgba(15, 23, 42, 0.2)",
} as const;

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
        accent: projectEditorTokens.nodeViewAccent,
        accentSoft: projectEditorTokens.nodeViewAccentSoft,
        accentMuted: projectEditorTokens.nodeViewAccentMuted,
    },
    api: {
        kind: "api",
        label: "API",
        shortLabel: "HTTP",
        description: "Server endpoints and contract boundaries.",
        accent: projectEditorTokens.nodeApiAccent,
        accentSoft: projectEditorTokens.nodeApiAccentSoft,
        accentMuted: projectEditorTokens.nodeApiAccentMuted,
    },
    database: {
        kind: "database",
        label: "Database",
        shortLabel: "DB",
        description: "Persistent models and storage providers.",
        accent: projectEditorTokens.nodeDatabaseAccent,
        accentSoft: projectEditorTokens.nodeDatabaseAccentSoft,
        accentMuted: projectEditorTokens.nodeDatabaseAccentMuted,
    },
    action: {
        kind: "action",
        label: "Action",
        shortLabel: "FX",
        description: "Business logic, triggers and execution targets.",
        accent: projectEditorTokens.nodeActionAccent,
        accentSoft: projectEditorTokens.nodeActionAccentSoft,
        accentMuted: projectEditorTokens.nodeActionAccentMuted,
    },
};

export const PROJECT_NODE_PALETTE = Object.values(PROJECT_NODE_VISUALS);

export const PROJECT_SOCKET_COLOR_MAP: Record<SocketType, string> = {
    trigger: projectEditorTokens.socketTrigger,
    payload: projectEditorTokens.socketPayload,
    query: projectEditorTokens.socketQuery,
    entity: projectEditorTokens.socketEntity,
    result: projectEditorTokens.socketResult,
};

export const projectEditorDefaults = {
    fallbackEdgeColor: projectEditorTokens.handleFallback,
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
            height: "100dvh",
            overflow: "hidden",
            background: projectEditorTokens.shellBackground,
            color: projectEditorTokens.topbarText,
        },
        panel: {
            borderRadius: sharedCustomization.radius.lg,
            border: `1px solid ${projectEditorTokens.panelBorder}`,
            backgroundColor: projectEditorTokens.panelBackground,
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
            color: sharedCustomization.text.primary,
            minHeight: 38,
            borderRadius: sharedCustomization.radius.sm,
        },
        statusBadge: {
            height: 30,
            borderRadius: sharedCustomization.radius.xs,
            fontSize: "0.76rem",
            background: projectEditorTokens.statusBackground,
            color: projectEditorTokens.statusText,
        },
        fieldLabel: {
            fontSize: "0.8rem",
            fontWeight: 600,
            color: sharedCustomization.text.strong,
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
            boxShadow: projectEditorTokens.dragPreviewShadow,
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
            height: "100dvh",
            display: "grid",
            gridTemplateRows: "auto minmax(0, 1fr)",
            overflow: "hidden",
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
            background: projectEditorTokens.panelToggleBackground,
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
            background: projectEditorTokens.panelToggleBackground,
            transition: `right ${sharedCustomization.transition.emphasis}`,
        }),
    },
    topbar: {
        root: {
            px: 2,
            py: 1,
            background: projectEditorTokens.topbarBackground,
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
            border: `1px solid ${isActive ? projectEditorTokens.canvasSurfaceBorderActive : projectEditorTokens.canvasSurfaceBorder}`,
            backgroundColor: isActive
                ? projectEditorTokens.canvasSurfaceBackgroundActive
                : projectEditorTokens.canvasSurfaceBackground,
            transition: `border-color ${sharedCustomization.transition.standard}, box-shadow ${sharedCustomization.transition.standard}, background ${sharedCustomization.transition.standard}`,
        }),
        previewNode: {
            pointerEvents: "none",
            opacity: 0.82,
            filter: "saturate(0.98)",
        } satisfies CSSProperties,
        connectionLine: {
            stroke: projectEditorTokens.connectionStroke,
            strokeWidth: 1.8,
        } satisfies CSSProperties,
        backgroundColor: projectEditorTokens.canvasGrid,
        backgroundGap: 18,
        backgroundSize: 4,
        labBackgroundColor: projectEditorTokens.canvasLabGrid,
        labBackgroundGap: 18,
        labBackgroundSize: 1.1,
    },
    nodePalette: {
        searchField: {
            color: sharedCustomization.text.primary,
            ".MuiOutlinedInput-root": {
                backgroundColor: projectEditorTokens.panelToggleBackground,
            },
        },
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
            border: "none",
            background: isDragging
                ? projectEditorTokens.panelToggleBackground
                : isActive
                    ? projectEditorTokens.panelToggleBackground
                    : projectEditorTokens.panelBackground,
            p: 1,
            overflow: "hidden",
            cursor: "grab",
            opacity: isDragging ? 0.72 : 1,
            transform,
            boxShadow: isActive ? `0 12px 24px ${accent}12` : "none",
            transition: `transform ${sharedCustomization.transition.standard}, background-color ${sharedCustomization.transition.standard}, box-shadow ${sharedCustomization.transition.standard}, opacity ${sharedCustomization.transition.standard}`,
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
                : `1px solid ${options.selected ? accent : projectEditorTokens.nodeCardBorder}`,
            background: options.preview
                ? projectEditorTokens.nodeCardPreviewBackground
                : projectEditorTokens.nodeCardBackground,
            boxShadow: options.preview
                ? projectEditorTokens.nodeCardShadowPreview
                : options.dragging
                    ? projectEditorTokens.nodeCardShadowDragging
                    : projectEditorTokens.nodeCardShadow,
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
            gridTemplateColumns: "100% minmax(0, 1fr) 98px",
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
            color: projectEditorTokens.nodeCardOverline,
            textAlign: side === "right" ? "right" : "left",
        }),
        contentColumn: {
            minWidth: 0,
        },
        contentCard: {
            backgroundColor: projectEditorTokens.nodeCardSurface,
            p: 1,
            borderRadius: sharedCustomization.radius.xl,
            border: `1px solid ${projectEditorTokens.nodeCardSurfaceBorder}`,
        },
        description: {
            fontSize: "0.88rem",
            lineHeight: 1.55,
            color: projectEditorTokens.nodeCardText,
            minHeight: 44,
        },
        footerCard: {
            backgroundColor: projectEditorTokens.nodeCardSurfaceMuted,
            p: 1,
            borderRadius: sharedCustomization.radius.xl,
            border: `1px solid ${projectEditorTokens.nodeCardSurfaceBorder}`,
        },
        footerMono: {
            fontSize: "0.74rem",
            color: projectEditorTokens.nodeCardMuted,
            fontFamily: sharedCustomization.fonts.mono,
        },
        footerText: {
            fontSize: "0.74rem",
            color: projectEditorTokens.nodeCardMuted,
        },
    },
    nodeHeader: {
        title: {
            fontSize: "0.98rem",
            lineHeight: 1.15,
            fontWeight: 700,
            color: projectEditorTokens.nodeCardTitle,
            letterSpacing: "-0.03em",
            minWidth: 0,
        },
        row: {
            display: "flex",
            flexDirection: "row",
            gap: 2,
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
                transform: side === "input" ? "translate(-120%, -50%)" : "translate(120%, -50%)",
                background: color,
                border: `1px solid ${projectEditorTokens.handleBorder}`,
                borderColor: projectEditorTokens.handleBorder,
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
            border: `0px solid ${projectEditorTokens.handleBorder}`,
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
                py: 0.5,
                borderRadius: sharedCustomization.radius.lg,
                backgroundColor: isHighlighted
                    ? projectEditorTokens.socketBackgroundHighlight
                    : projectEditorTokens.socketBackground,
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
            fontWeight: 500,
            lineHeight: 1.1,
            color: compatibilityState === "dimmed"
                ? projectEditorTokens.socketTextDimmed
                : projectEditorTokens.socketText,
            textAlign: side === "input" ? "left" : "right",
        }),
        type: (color: string, side: "input" | "output"): Sx => ({
            fontSize: "0.62rem",
            fontWeight: 400,
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
            border: `1px solid ${projectEditorTokens.emptyBorder}`,
            background: projectEditorTokens.emptyBackground,
            backdropFilter: "blur(12px)",
        },
        iconColor: projectEditorTokens.nodeViewAccent,
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
            border: `1px solid ${projectEditorTokens.canvasSurfaceBorder}`,
            background: projectEditorTokens.canvasLabBackground,
        },
    },
};