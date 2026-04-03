import { sharedCustomization } from "@/src/customization/shared";
import type { DesignFrame, DesignResizeHandle } from "@/src/features/design-editor/types/interaction.types";

type SaveState = "saved" | "saving" | "error";
type FeedbackTone = "info" | "error";

export const designEditorDefaults = {
    typography: {
        fontFamily: "var(--font-ibm-plex-sans)",
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.5,
        textAlign: "left" as const,
        color: "#0f172a",
    },
    imageSource: "placeholder://image",
    fills: {
        root: "#f8fafc",
        frame: "#ffffff",
        rectangle: "var(--ws-project-node-view-accent-muted)",
        image: "linear-gradient(135deg, rgba(240, 244, 249, 0.98) 0%, rgba(228, 234, 242, 0.98) 100%)",
        fallback: "#ffffff",
        transparent: "transparent",
    },
    strokes: {
        root: "rgba(148, 163, 184, 0.35)",
        frame: "rgba(148, 163, 184, 0.32)",
        rectangle: "rgba(79, 124, 255, 0.22)",
        image: "rgba(148, 163, 184, 0.24)",
    },
    shadows: {
        mergeFallback: {
            x: 0,
            y: 12,
            blur: 24,
            spread: -12,
            color: "rgba(15, 23, 42, 0.18)",
        },
        frame: {
            x: 0,
            y: 18,
            blur: 40,
            spread: -18,
            color: "rgba(15, 23, 42, 0.16)",
        },
        image: {
            x: 0,
            y: 18,
            blur: 36,
            spread: -18,
            color: "rgba(15, 23, 42, 0.12)",
        },
        root: {
            x: 0,
            y: 24,
            blur: 72,
            spread: -24,
            color: "rgba(15, 23, 42, 0.22)",
        },
    },
    figmaFallback: {
        background: "#f8fafc",
        surface: "rgba(255,255,255,0.96)",
        accent: "var(--ws-project-node-view-accent)",
        title: "#111827",
        subtitle: "#667085",
        rootRadius: 18,
        surfaceRadius: 14,
    },
};

function escapeSvgText(value: string) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

export function createDesignImportFallbackSvg(title: string, subtitle: string, width: number, height: number) {
    const clampedWidth = Math.max(220, Math.round(width));
    const clampedHeight = Math.max(120, Math.round(height));

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${clampedWidth} ${clampedHeight}">
  <rect width="${clampedWidth}" height="${clampedHeight}" rx="${designEditorDefaults.figmaFallback.rootRadius}" fill="${designEditorDefaults.figmaFallback.background}" />
  <rect x="12" y="12" width="${clampedWidth - 24}" height="${clampedHeight - 24}" rx="${designEditorDefaults.figmaFallback.surfaceRadius}" fill="${designEditorDefaults.figmaFallback.surface}" stroke="${designEditorDefaults.figmaFallback.accent}" stroke-width="1.5" stroke-dasharray="8 6" />
  <text x="22" y="36" fill="${designEditorDefaults.figmaFallback.title}" font-size="16" font-family="IBM Plex Sans, sans-serif" font-weight="600">${escapeSvgText(title)}</text>
  <text x="22" y="62" fill="${designEditorDefaults.figmaFallback.subtitle}" font-size="12" font-family="IBM Plex Sans, sans-serif">${escapeSvgText(subtitle)}</text>
</svg>`;
}

export function mapDesignAutoLayoutJustify(justifyContent: "start" | "center" | "end" | "space-between") {
    switch (justifyContent) {
        case "center":
            return "center";
        case "end":
            return "flex-end";
        case "space-between":
            return "space-between";
        default:
            return "flex-start";
    }
}

export function mapDesignAutoLayoutAlign(alignItems: "start" | "center" | "end" | "stretch") {
    switch (alignItems) {
        case "center":
            return "center";
        case "end":
            return "flex-end";
        case "stretch":
            return "stretch";
        default:
            return "flex-start";
    }
}

export function getDesignResizeHandleStyle(handle: DesignResizeHandle) {
    const base = { transform: "translate(-50%, -50%)" };

    switch (handle) {
        case "nw":
            return { ...base, left: 0, top: 0, cursor: "nwse-resize" };
        case "n":
            return { ...base, left: "50%", top: 0, cursor: "ns-resize" };
        case "ne":
            return { ...base, left: "100%", top: 0, cursor: "nesw-resize" };
        case "e":
            return { ...base, left: "100%", top: "50%", cursor: "ew-resize" };
        case "se":
            return { ...base, left: "100%", top: "100%", cursor: "nwse-resize" };
        case "s":
            return { ...base, left: "50%", top: "100%", cursor: "ns-resize" };
        case "sw":
            return { ...base, left: 0, top: "100%", cursor: "nesw-resize" };
        case "w":
            return { ...base, left: 0, top: "50%", cursor: "ew-resize" };
    }
}

export const designEditorStyles = {
    layout: {
        loadingShell: {
            minHeight: sharedCustomization.screenHeight,
            display: "grid",
            placeItems: "center",
            px: 3,
            background: "var(--ws-design-loading-background)",
        },
        loadingCard: {
            width: "min(100%, 460px)",
            p: 3,
            borderRadius: sharedCustomization.radius.huge,
            border: "1px solid var(--ws-design-panel-border-strong)",
            background: "var(--ws-design-loading-surface)",
            color: sharedCustomization.text.onDark,
        },
        loadingEyebrow: {
            fontSize: "0.78rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: sharedCustomization.text.subtleOnDark,
        },
        loadingTitle: {
            fontSize: "1.1rem",
            fontWeight: 600,
        },
        loadingBody: {
            fontSize: "0.92rem",
            color: sharedCustomization.text.mutedOnDark,
            lineHeight: 1.7,
        },
        shell: {
            minHeight: sharedCustomization.screenHeight,
            display: "grid",
            gridTemplateRows: "auto minmax(0, 1fr)",
            background: "var(--ws-design-shell-background)",
        },
        workspace: {
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr) 340px" },
            gridTemplateRows: { xs: "minmax(0, 56vh) auto auto", lg: "1fr" },
            gridTemplateAreas: {
                xs: '"canvas" "layers" "inspector"',
                lg: '"layers canvas inspector"',
            },
        },
        layersSlot: {
            gridArea: "layers",
            minHeight: { lg: 0 },
            borderTop: { xs: "1px solid var(--ws-design-panel-border)", lg: "none" },
        },
        canvasSlot: {
            gridArea: "canvas",
            minHeight: 0,
            borderInline: { lg: "1px solid var(--ws-design-canvas-divider)" },
        },
        inspectorSlot: {
            gridArea: "inspector",
            minHeight: { lg: 0 },
            borderTop: { xs: "1px solid var(--ws-design-panel-border)", lg: "none" },
        },
    },
    topbar: {
        root: {
            position: "sticky",
            top: 0,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            px: { xs: 2, lg: 3 },
            py: 1.5,
            borderBottom: "1px solid var(--ws-design-topbar-border)",
            background: "var(--ws-design-topbar-background)",
            backdropFilter: "blur(24px)",
        },
        leftGroup: {
            minWidth: 0,
            flexWrap: "wrap",
        },
        chromeButton: {
            minWidth: 0,
            px: 1.4,
            color: sharedCustomization.text.onDark,
            borderColor: "var(--ws-design-topbar-button-border)",
            background: "var(--ws-design-topbar-button-background)",
        },
        meta: {
            minWidth: 0,
        },
        eyebrow: {
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: sharedCustomization.text.subtleOnDark,
        },
        title: {
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--ws-design-title-text)",
            letterSpacing: "-0.03em",
        },
        status: (saveState: SaveState) => ({
            px: 1.1,
            py: 0.55,
            borderRadius: sharedCustomization.radius.pill,
            border: "1px solid var(--ws-design-status-border)",
            background: "var(--ws-design-status-background)",
            color: saveState === "error" ? "var(--ws-design-status-error)" : "var(--ws-design-status-text)",
            fontSize: "0.76rem",
            fontWeight: 600,
        }),
        rightGroup: {
            flexWrap: "wrap",
        },
        toolGroup: {
            p: 0.5,
            borderRadius: sharedCustomization.radius.pill,
            border: "1px solid var(--ws-design-toolbar-group-border)",
            background: "var(--ws-design-toolbar-group-background)",
        },
        viewportGroup: {
            p: 0.45,
            borderRadius: sharedCustomization.radius.pill,
            border: "1px solid var(--ws-design-toolbar-group-border)",
            background: "var(--ws-design-toolbar-group-background)",
        },
        viewportButton: (isActive: boolean) => ({
            minWidth: 0,
            gap: 0.75,
            px: 1.15,
            py: 0.65,
            color: isActive ? "var(--ws-design-toolbar-button-active-text)" : "var(--ws-design-toolbar-button-text)",
            background: isActive ? "var(--ws-design-toolbar-button-active-background)" : "transparent",
            borderRadius: sharedCustomization.radius.pill,
            "&:hover": {
                background: isActive ? "var(--ws-surface-soft)" : "var(--ws-design-toolbar-button-hover)",
            },
        }),
        viewportButtonLabel: {
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.01em",
        },
        toolButton: (isActive: boolean) => ({
            minWidth: 0,
            gap: 0.8,
            px: 1.25,
            color: isActive ? "var(--ws-design-toolbar-button-active-text)" : "var(--ws-design-toolbar-button-text)",
            background: isActive ? "var(--ws-design-toolbar-button-active-background)" : "transparent",
            "&:hover": {
                background: isActive ? "var(--ws-surface-soft)" : "var(--ws-design-toolbar-button-hover)",
            },
        }),
        toolLabel: {
            fontSize: "0.8rem",
            fontWeight: 600,
        },
        toolShortcut: (isActive: boolean) => ({
            fontSize: "0.7rem",
            color: isActive ? "var(--ws-design-toolbar-button-active-shortcut)" : "var(--ws-design-toolbar-button-shortcut)",
        }),
        divider: {
            borderColor: "var(--ws-design-toolbar-divider)",
            display: { xs: "none", sm: "block" },
        },
        zoomStepButton: {
            minWidth: 36,
            px: 0,
            color: "var(--ws-design-toolbar-button-text)",
        },
        zoomDisplayButton: {
            minWidth: 84,
            color: sharedCustomization.text.onDark,
            borderColor: "var(--ws-design-topbar-zoom-border)",
            background: "var(--ws-design-topbar-button-background-strong)",
        },
    },
    layers: {
        root: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRight: { lg: "1px solid var(--ws-design-panel-border)" },
            background: "var(--ws-design-panel-background)",
        },
        header: {
            px: 2,
            py: 1.8,
            borderBottom: "1px solid var(--ws-design-panel-header-border)",
        },
        headerEyebrow: {
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: sharedCustomization.text.subtleOnDark,
        },
        headerBody: {
            fontSize: "0.92rem",
            color: "var(--ws-design-body-text)",
            lineHeight: 1.6,
        },
        list: {
            px: 1.1,
            py: 1.1,
            overflowY: "auto",
            minHeight: 0,
        },
        item: (isSelected: boolean, isHovered: boolean) => ({
            minHeight: 34,
            px: 1,
            borderRadius: sharedCustomization.radius.md,
            cursor: "pointer",
            transform: isHovered ? "translateX(1px)" : "none",
            transition: `background ${sharedCustomization.transition.fast}, transform ${sharedCustomization.transition.fast}, color ${sharedCustomization.transition.fast}`,
            background: isSelected
                ? "var(--ws-design-layer-selected-background)"
                : isHovered
                    ? "var(--ws-design-layer-hover-background)"
                    : "transparent",
            border: isSelected ? "1px solid var(--ws-design-layer-selected-border)" : "1px solid transparent",
        }),
        collapseToggle: (hasChildren: boolean) => ({
            width: 16,
            textAlign: "center",
            color: hasChildren ? sharedCustomization.text.mutedOnDark : "transparent",
            fontSize: "0.72rem",
            userSelect: "none",
        }),
        indent: (depth: number) => ({
            width: depth * 12,
            flexShrink: 0,
        }),
        textStack: {
            minWidth: 0,
        },
        nameRow: {
            minWidth: 0,
        },
        name: (isSelected: boolean) => ({
            fontSize: "0.84rem",
            fontWeight: 600,
            color: isSelected ? "var(--ws-design-title-text)" : "#dbe4f0",
        }),
        autoBadge: {
            px: 0.7,
            py: 0.2,
            borderRadius: sharedCustomization.radius.pill,
            background: "var(--ws-design-auto-badge-background)",
            color: "var(--ws-design-accent-text)",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
        },
        typeLabel: {
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: sharedCustomization.text.subtleOnDark,
        },
    },
    inspector: {
        section: {
            p: 1.5,
            borderRadius: sharedCustomization.radius.xxl,
            border: "1px solid var(--ws-design-panel-border)",
            background: "var(--ws-design-panel-surface)",
        },
        sectionTitle: {
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: sharedCustomization.text.mutedOnDark,
        },
        gridFieldLabel: {
            fontSize: "0.74rem",
            fontWeight: 600,
            color: sharedCustomization.text.mutedOnDark,
        },
        field: {
            "& .MuiOutlinedInput-root": {
                borderRadius: sharedCustomization.radius.lg,
                background: "var(--ws-design-field-background)",
                color: "var(--ws-design-field-text)",
                ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--ws-design-field-border)",
                },
            },
        },
        staticValue: {
            minHeight: 40,
            px: 1.4,
            display: "flex",
            alignItems: "center",
            borderRadius: sharedCustomization.radius.lg,
            background: "var(--ws-design-field-background)",
            border: "1px solid var(--ws-design-field-border)",
            color: "var(--ws-design-body-text)",
            fontSize: "0.9rem",
            textTransform: "capitalize",
        },
        twoColumnGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1.1,
        },
        clipRow: {
            color: "var(--ws-design-body-text)",
        },
        clipLabel: {
            fontSize: "0.84rem",
            fontWeight: 600,
        },
        panelRoot: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderLeft: { lg: "1px solid var(--ws-design-panel-border)" },
            background: "var(--ws-design-panel-background)",
        },
        panelHeader: {
            px: 2,
            py: 1.8,
            borderBottom: "1px solid var(--ws-design-panel-header-border)",
        },
        panelEyebrow: {
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: sharedCustomization.text.subtleOnDark,
        },
        panelBodyText: {
            fontSize: "0.92rem",
            color: "var(--ws-design-body-text)",
            lineHeight: 1.6,
        },
        panelBody: {
            minHeight: 0,
            overflowY: "auto",
            px: 1.4,
            py: 1.4,
        },
        multiSelectionCard: {
            p: 1.5,
            borderRadius: sharedCustomization.radius.xxl,
            border: "1px solid var(--ws-design-panel-border)",
            background: "var(--ws-design-panel-surface)",
        },
        multiSelectionEyebrow: {
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: sharedCustomization.text.mutedOnDark,
        },
        multiSelectionCount: {
            fontSize: "1rem",
            fontWeight: 600,
            color: sharedCustomization.text.onDark,
        },
        multiSelectionBody: {
            fontSize: "0.9rem",
            color: sharedCustomization.text.mutedOnDark,
            lineHeight: 1.65,
        },
    },
    renderer: {
        node: (options: {
            isRoot: boolean;
            rootPositioning: "document-root" | "absolute";
            parentUsesAutoLayout: boolean;
            frame: DesignFrame;
            borderRadius: number;
            opacity: number;
            clipContent: boolean;
            boxShadow: string;
            background: string;
            border: string;
            pointerEvents: "none" | "auto";
            autoLayout?: {
                direction: "row" | "column";
                justifyContent: string;
                alignItems: string;
                gap: number;
                padding: string;
            };
        }) => ({
            ...(options.isRoot && options.rootPositioning === "document-root"
                ? {
                    position: "relative" as const,
                }
                : options.parentUsesAutoLayout
                    ? {
                        position: "relative" as const,
                        flexShrink: 0,
                    }
                    : {
                        position: "absolute" as const,
                        left: options.frame.x,
                        top: options.frame.y,
                    }),
            width: options.frame.width,
            height: options.frame.height,
            transform: `rotate(${options.frame.rotation}deg)`,
            transformOrigin: "center center",
            borderRadius: `${options.borderRadius}px`,
            opacity: options.opacity,
            overflow: options.clipContent ? "hidden" : "visible",
            boxShadow: options.boxShadow,
            background: options.background,
            border: options.border,
            pointerEvents: options.pointerEvents,
            ...(options.autoLayout
                ? {
                    display: "flex",
                    flexDirection: options.autoLayout.direction,
                    justifyContent: options.autoLayout.justifyContent,
                    alignItems: options.autoLayout.alignItems,
                    gap: `${options.autoLayout.gap}px`,
                    padding: options.autoLayout.padding,
                }
                : {}),
        }),
        text: (options: {
            color?: string;
            fontFamily?: string;
            fontSize?: string | number;
            fontWeight?: string | number;
            lineHeight?: string | number;
            textAlign?: string;
        }) => ({
            width: "100%",
            height: "100%",
            color: options.color ?? "#0f172a",
            ...(options.fontFamily ? { fontFamily: options.fontFamily } : {}),
            ...(options.fontSize !== undefined ? { fontSize: options.fontSize } : {}),
            ...(options.fontWeight !== undefined ? { fontWeight: options.fontWeight } : {}),
            ...(options.lineHeight !== undefined ? { lineHeight: options.lineHeight } : {}),
            ...(options.textAlign ? { textAlign: options.textAlign } : {}),
            whiteSpace: "pre-wrap",
        }),
        placeholderImage: (borderRadius: number) => ({
            width: "100%",
            height: "100%",
            borderRadius: `${borderRadius}px`,
            background: "var(--ws-design-image-placeholder-background)",
            color: sharedCustomization.text.onDark,
        }),
        placeholderEyebrow: {
            fontSize: "0.78rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: sharedCustomization.text.mutedOnDark,
        },
        placeholderTitle: {
            fontSize: "0.94rem",
            fontWeight: 600,
        },
        image: (objectFit: "cover" | "contain" | "fill") => ({
            width: "100%",
            height: "100%",
            display: "block",
            objectFit,
            userSelect: "none",
        }),
        svg: {
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "fill",
            userSelect: "none",
        },
    },
    canvas: {
        overlayNode: (options: {
            isRoot: boolean;
            parentUsesAutoLayout: boolean;
            frame: DesignFrame;
            borderRadius: number;
            locked: boolean;
            isCandidateParent: boolean;
            isSelected: boolean;
            isHovered: boolean;
            isActiveContainer: boolean;
            isEditingText: boolean;
            hasActiveSession: boolean;
        }) => ({
            ...(options.isRoot
                ? {
                    position: "absolute" as const,
                    left: 0,
                    top: 0,
                }
                : options.parentUsesAutoLayout
                    ? {
                        position: "relative" as const,
                        flexShrink: 0,
                    }
                    : {
                        position: "absolute" as const,
                        left: options.frame.x,
                        top: options.frame.y,
                    }),
            width: options.frame.width,
            height: options.frame.height,
            transform: `rotate(${options.frame.rotation}deg)`,
            transformOrigin: "center center",
            borderRadius: `${options.borderRadius}px`,
            pointerEvents: options.locked ? "none" : "auto",
            outline: options.isCandidateParent
                ? "2px solid var(--ws-design-selection-outline)"
                : options.isSelected
                    ? "1px solid var(--ws-design-selection-outline)"
                    : options.isHovered
                        ? "1px solid var(--ws-design-selection-outline-hover)"
                        : options.isActiveContainer
                            ? "1px solid var(--ws-design-selection-outline-soft)"
                            : "none",
            outlineOffset: options.isSelected || options.isHovered ? "2px" : 0,
            background: options.isEditingText ? "var(--ws-design-editing-overlay-background)" : "transparent",
            transition: options.hasActiveSession ? "none" : "outline-color 120ms ease",
        }),
        textEditor: (options: {
            color?: string;
            fontFamily?: string;
            fontSize?: string | number;
            fontWeight?: string | number;
            lineHeight?: string | number;
            textAlign?: string;
        }) => ({
            width: "100%",
            height: "100%",
            px: 0,
            py: 0,
            border: "none",
            outline: "none",
            resize: "none",
            background: "var(--ws-design-text-editor-background)",
            color: options.color ?? "#0f172a",
            ...(options.fontFamily ? { fontFamily: options.fontFamily } : {}),
            ...(options.fontSize !== undefined ? { fontSize: options.fontSize } : {}),
            ...(options.fontWeight !== undefined ? { fontWeight: options.fontWeight } : {}),
            ...(options.lineHeight !== undefined ? { lineHeight: options.lineHeight } : {}),
            ...(options.textAlign ? { textAlign: options.textAlign } : {}),
        }),
        rootBadge: {
            position: "absolute",
            top: 18,
            left: 18,
            px: 1,
            py: 0.55,
            borderRadius: sharedCustomization.radius.pill,
            background: "var(--ws-design-overlay-chip-background)",
            color: "var(--ws-design-overlay-chip-text)",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            zIndex: 2,
            pointerEvents: "none",
        },
        autoLayoutBadge: {
            position: "absolute",
            right: 14,
            top: 14,
            px: 0.9,
            py: 0.45,
            borderRadius: sharedCustomization.radius.pill,
            background: "var(--ws-design-overlay-chip-background-strong)",
            color: "var(--ws-design-accent-text)",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            zIndex: 3,
            pointerEvents: "none",
        },
        previewChild: (options: { frame: DesignFrame; nodeType: "frame" | "rectangle" | "text" | "image" }) => ({
            position: "absolute",
            left: options.frame.x,
            top: options.frame.y,
            width: options.frame.width,
            height: options.frame.height,
            borderRadius: options.nodeType === "text" ? "8px" : "18px",
            border: "1px dashed var(--ws-design-overlay-preview-border)",
            background: options.nodeType === "text"
                ? "var(--ws-design-overlay-preview-text-fill)"
                : options.nodeType === "image"
                    ? "var(--ws-design-overlay-preview-image)"
                    : "var(--ws-design-overlay-preview-fill)",
        }),
        resizeHandle: (position: ReturnType<typeof getDesignResizeHandleStyle>) => ({
            position: "absolute",
            width: 10,
            height: 10,
            borderRadius: sharedCustomization.radius.pill,
            background: "var(--ws-design-overlay-handle-fill)",
            border: "2px solid var(--ws-design-overlay-handle-border)",
            ...position,
        }),
        root: (effectiveTool: "select" | "frame" | "rectangle" | "text" | "image" | "hand", activeSessionKind: string | null, canvasMode: "page" | "workspace") => ({
            position: "relative",
            minHeight: 0,
            height: "100%",
            overflow: "hidden",
            background: canvasMode === "workspace"
                ? "radial-gradient(circle at top, rgba(59, 130, 246, 0.08), transparent 28%), linear-gradient(180deg, rgba(2, 6, 23, 0.98) 0%, rgba(15, 23, 42, 0.96) 100%)"
                : "var(--ws-design-canvas-background)",
            backgroundSize: "cover",
            cursor: effectiveTool === "hand"
                ? activeSessionKind === "pan"
                    ? "grabbing"
                    : "grab"
                : activeSessionKind === "move"
                    ? "grabbing"
                    : "default",
        }),
        pasteFeedback: (tone: FeedbackTone) => ({
            position: "absolute",
            right: 18,
            top: 18,
            zIndex: 5,
            px: 1.4,
            py: 0.9,
            maxWidth: 360,
            borderRadius: sharedCustomization.radius.xl,
            border: tone === "error"
                ? "1px solid var(--ws-design-paste-feedback-border-error)"
                : "1px solid var(--ws-design-paste-feedback-border)",
            background: tone === "error"
                ? "var(--ws-design-paste-feedback-background-error)"
                : "var(--ws-design-paste-feedback-background)",
            color: sharedCustomization.text.onDark,
            backdropFilter: "blur(18px)",
            boxShadow: "var(--ws-design-paste-feedback-shadow)",
        }),
        pasteFeedbackText: {
            fontSize: "0.82rem",
            lineHeight: 1.5,
        },
        grid: (viewport: { x: number; y: number; zoom: number }) => ({
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(var(--ws-design-canvas-grid) 1px, transparent 1px), linear-gradient(90deg, var(--ws-design-canvas-grid) 1px, transparent 1px)",
            backgroundSize: `${24 * viewport.zoom}px ${24 * viewport.zoom}px`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }),
        stage: (viewport: { x: number; y: number; zoom: number }, width: number, height: number) => ({
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: "top left",
            width,
            height,
        }),
        alignmentGuide: (guide: { axis: "vertical" | "horizontal"; position: number; start: number; end: number; source: "container" | "sibling" }) => ({
            position: "absolute",
            left: guide.axis === "vertical" ? guide.position : guide.start,
            top: guide.axis === "vertical" ? guide.start : guide.position,
            width: guide.axis === "vertical" ? 1.5 : Math.max(1.5, guide.end - guide.start),
            height: guide.axis === "vertical" ? Math.max(1.5, guide.end - guide.start) : 1.5,
            background: guide.source === "container" ? "var(--ws-design-guide-container)" : "var(--ws-design-guide-node)",
            boxShadow: "0 0 0 1px var(--ws-design-guide-outline)",
            pointerEvents: "none",
        }),
        insertionIndicator: (indicator: { left: number; top: number; width: number; height: number }) => ({
            position: "absolute",
            left: indicator.left,
            top: indicator.top,
            width: indicator.width,
            height: indicator.height,
            borderRadius: sharedCustomization.radius.pill,
            background: "var(--ws-design-insertion-indicator)",
            boxShadow: "0 0 0 1px var(--ws-design-guide-outline)",
            pointerEvents: "none",
        }),
    },
    preview: {
        emptyShell: {
            minHeight: sharedCustomization.screenHeight,
            display: "grid",
            placeItems: "center",
            px: 3,
            background: "var(--ws-preview-empty-background)",
        },
        emptyCard: {
            width: "min(100%, 460px)",
            p: 3,
            borderRadius: sharedCustomization.radius.huge,
            border: "1px solid var(--ws-preview-empty-border)",
            background: "var(--ws-preview-empty-surface)",
            color: "#0f172a",
            boxShadow: "var(--ws-preview-empty-shadow)",
        },
        emptyEyebrow: {
            fontSize: "0.78rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: sharedCustomization.text.subtleOnDark,
        },
        emptyTitle: {
            fontSize: "1.1rem",
            fontWeight: 600,
        },
        emptyBody: {
            fontSize: "0.92rem",
            color: "#475569",
            lineHeight: 1.7,
        },
        root: {
            minHeight: sharedCustomization.screenHeight,
            overflow: "auto",
            background: "var(--ws-preview-background)",
        },
        canvasArea: {
            minHeight: sharedCustomization.screenHeight,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            px: 4,
            py: 4,
        },
        scene: (width: number, height: number) => ({
            position: "relative",
            width,
            minHeight: height,
        }),
    },
};