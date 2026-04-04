import { projectEditorTokens } from "@/src/customization/project-editor";
import { sharedCustomization } from "@/src/customization/shared";
import type { DesignFrame, DesignResizeHandle } from "@/src/features/design-editor/types/interaction.types";

type SaveState = "saved" | "saving" | "error";
type FeedbackTone = "info" | "error";

const designEditorTokens = {
    shellBackground: projectEditorTokens.shellBackground,
    loadingBackground: projectEditorTokens.shellBackground,
    loadingSurface: "rgba(255, 255, 255, 0.9)",
    panelBackground: "rgba(255, 255, 255, 0.78)",
    panelSurface: "rgba(255, 255, 255, 0.9)",
    panelBorder: projectEditorTokens.panelBorder,
    panelBorderStrong: sharedCustomization.border.strong,
    panelHeaderBorder: "rgba(148, 163, 184, 0.14)",
    canvasDivider: "rgba(148, 163, 184, 0.16)",
    topbarBorder: projectEditorTokens.topbarBorder,
    toolbarDivider: "rgba(148, 163, 184, 0.16)",
    topbarButtonBorder: projectEditorTokens.statusBorder,
    topbarZoomBorder: projectEditorTokens.statusBorder,
    topbarBackground: projectEditorTokens.topbarBackground,
    topbarButtonBackground: "rgba(255, 255, 255, 0.94)",
    topbarButtonBackgroundStrong: "rgba(255, 255, 255, 0.96)",
    statusBackground: projectEditorTokens.statusBackground,
    statusBorder: projectEditorTokens.statusBorder,
    statusText: projectEditorTokens.statusText,
    statusError: "#c2410c",
    toolbarGroupBackground: "rgba(248, 250, 252, 0.82)",
    toolbarGroupBorder: "rgba(148, 163, 184, 0.18)",
    toolbarButtonText: "#475467",
    toolbarButtonActiveBackground: "#e2e8f0",
    toolbarButtonActiveText: "#0f172a",
    toolbarButtonActiveShortcut: "#334155",
    toolbarButtonShortcut: "#64748b",
    toolbarButtonHover: "rgba(148, 163, 184, 0.12)",
    titleText: sharedCustomization.text.primary,
    bodyText: "#475467",
    accentText: projectEditorTokens.nodeViewAccent,
    canvasBackground: "radial-gradient(circle at top left, rgba(79, 124, 255, 0.08), transparent 26%), linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)",
    canvasGrid: "rgba(148, 163, 184, 0.14)",
    overlayChipBackground: "rgba(255, 255, 255, 0.92)",
    overlayChipBackgroundStrong: "rgba(255, 255, 255, 0.96)",
    overlayChipText: sharedCustomization.text.strong,
    autoBadgeBackground: projectEditorTokens.nodeViewAccentSoft,
    overlayHandleFill: projectEditorTokens.nodeViewAccent,
    overlayHandleBorder: "rgba(255, 255, 255, 0.96)",
    selectionOutline: "rgba(79, 124, 255, 0.92)",
    selectionOutlineHover: "rgba(79, 124, 255, 0.36)",
    selectionOutlineSoft: "rgba(79, 124, 255, 0.22)",
    editingOverlayBackground: "rgba(79, 124, 255, 0.06)",
    textEditorBackground: "rgba(255, 255, 255, 0.96)",
    overlayPreviewFill: "rgba(79, 124, 255, 0.14)",
    overlayPreviewTextFill: "rgba(79, 124, 255, 0.1)",
    overlayPreviewBorder: "rgba(79, 124, 255, 0.78)",
    overlayPreviewImage: "linear-gradient(135deg, rgba(79, 124, 255, 0.18), rgba(79, 124, 255, 0.04))",
    pasteFeedbackBackground: "rgba(255, 255, 255, 0.96)",
    pasteFeedbackBackgroundError: "rgba(254, 242, 242, 0.96)",
    pasteFeedbackBorder: "rgba(79, 124, 255, 0.24)",
    pasteFeedbackBorderError: "rgba(239, 68, 68, 0.22)",
    pasteFeedbackShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
    guideNode: "rgba(79, 124, 255, 0.92)",
    guideContainer: "rgba(255, 255, 255, 0.94)",
    guideOutline: "rgba(15, 23, 42, 0.16)",
    insertionIndicator: "rgba(79, 124, 255, 0.92)",
    fieldBackground: "rgba(255, 255, 255, 0.96)",
    fieldBorder: "rgba(148, 163, 184, 0.2)",
    fieldText: sharedCustomization.text.primary,
    layerSelectedBackground: "rgba(79, 124, 255, 0.12)",
    layerSelectedBorder: "rgba(79, 124, 255, 0.28)",
    layerHoverBackground: "rgba(148, 163, 184, 0.08)",
    imagePlaceholderBackground: "linear-gradient(135deg, rgba(240, 244, 249, 0.98) 0%, rgba(228, 234, 242, 0.98) 100%), radial-gradient(circle at top left, rgba(79, 124, 255, 0.12), transparent 48%)",
    previewBackground: projectEditorTokens.shellBackground,
    previewEmptyBackground: projectEditorTokens.shellBackground,
    previewEmptySurface: "rgba(255, 255, 255, 0.94)",
    previewEmptyBorder: "rgba(148, 163, 184, 0.2)",
    previewEmptyShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
} as const;

export const designEditorDefaults = {
    typography: {
        fontFamily: '"IBM Plex Sans", sans-serif',
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
        rectangle: projectEditorTokens.nodeViewAccentMuted,
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
        accent: projectEditorTokens.nodeViewAccent,
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
            background: designEditorTokens.loadingBackground,
        },
        loadingCard: {
            width: "min(100%, 460px)",
            p: 3,
            borderRadius: sharedCustomization.radius.huge,
            border: `1px solid ${designEditorTokens.panelBorderStrong}`,
            background: designEditorTokens.loadingSurface,
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
            background: designEditorTokens.shellBackground,
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
            borderTop: { xs: `1px solid ${designEditorTokens.panelBorder}`, lg: "none" },
        },
        canvasSlot: {
            gridArea: "canvas",
            minHeight: 0,
            borderInline: { lg: `1px solid ${designEditorTokens.canvasDivider}` },
        },
        inspectorSlot: {
            gridArea: "inspector",
            minHeight: { lg: 0 },
            borderTop: { xs: `1px solid ${designEditorTokens.panelBorder}`, lg: "none" },
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
            borderBottom: `1px solid ${designEditorTokens.topbarBorder}`,
            background: designEditorTokens.topbarBackground,
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
            borderColor: designEditorTokens.topbarButtonBorder,
            background: designEditorTokens.topbarButtonBackground,
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
            color: designEditorTokens.titleText,
            letterSpacing: "-0.03em",
        },
        status: (saveState: SaveState) => ({
            px: 1.1,
            py: 0.55,
            borderRadius: sharedCustomization.radius.pill,
            border: `1px solid ${designEditorTokens.statusBorder}`,
            background: designEditorTokens.statusBackground,
            color: saveState === "error" ? designEditorTokens.statusError : designEditorTokens.statusText,
            fontSize: "0.76rem",
            fontWeight: 600,
        }),
        rightGroup: {
            flexWrap: "wrap",
        },
        toolGroup: {
            p: 0.5,
            borderRadius: sharedCustomization.radius.pill,
            border: `1px solid ${designEditorTokens.toolbarGroupBorder}`,
            background: designEditorTokens.toolbarGroupBackground,
        },
        viewportGroup: {
            p: 0.45,
            borderRadius: sharedCustomization.radius.pill,
            border: `1px solid ${designEditorTokens.toolbarGroupBorder}`,
            background: designEditorTokens.toolbarGroupBackground,
        },
        viewportButton: (isActive: boolean) => ({
            minWidth: 0,
            gap: 0.75,
            px: 1.15,
            py: 0.65,
            color: isActive ? designEditorTokens.toolbarButtonActiveText : designEditorTokens.toolbarButtonText,
            background: isActive ? designEditorTokens.toolbarButtonActiveBackground : "transparent",
            borderRadius: sharedCustomization.radius.pill,
            "&:hover": {
                background: isActive ? "#f8fafc" : designEditorTokens.toolbarButtonHover,
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
            color: isActive ? designEditorTokens.toolbarButtonActiveText : designEditorTokens.toolbarButtonText,
            background: isActive ? designEditorTokens.toolbarButtonActiveBackground : "transparent",
            "&:hover": {
                background: isActive ? "#f8fafc" : designEditorTokens.toolbarButtonHover,
            },
        }),
        toolLabel: {
            fontSize: "0.8rem",
            fontWeight: 600,
        },
        toolShortcut: (isActive: boolean) => ({
            fontSize: "0.7rem",
            color: isActive ? designEditorTokens.toolbarButtonActiveShortcut : designEditorTokens.toolbarButtonShortcut,
        }),
        divider: {
            borderColor: designEditorTokens.toolbarDivider,
            display: { xs: "none", sm: "block" },
        },
        zoomStepButton: {
            minWidth: 36,
            px: 0,
            color: designEditorTokens.toolbarButtonText,
        },
        zoomDisplayButton: {
            minWidth: 84,
            color: sharedCustomization.text.onDark,
            borderColor: designEditorTokens.topbarZoomBorder,
            background: designEditorTokens.topbarButtonBackgroundStrong,
        },
    },
    layers: {
        root: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRight: { lg: `1px solid ${designEditorTokens.panelBorder}` },
            background: designEditorTokens.panelBackground,
        },
        header: {
            px: 2,
            py: 1.8,
            borderBottom: `1px solid ${designEditorTokens.panelHeaderBorder}`,
        },
        headerEyebrow: {
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: sharedCustomization.text.subtleOnDark,
        },
        headerBody: {
            fontSize: "0.92rem",
            color: designEditorTokens.bodyText,
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
                ? designEditorTokens.layerSelectedBackground
                : isHovered
                    ? designEditorTokens.layerHoverBackground
                    : "transparent",
            border: isSelected ? `1px solid ${designEditorTokens.layerSelectedBorder}` : "1px solid transparent",
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
            color: isSelected ? designEditorTokens.titleText : "#dbe4f0",
        }),
        autoBadge: {
            px: 0.7,
            py: 0.2,
            borderRadius: sharedCustomization.radius.pill,
            background: designEditorTokens.autoBadgeBackground,
            color: designEditorTokens.accentText,
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
            border: `1px solid ${designEditorTokens.panelBorder}`,
            background: designEditorTokens.panelSurface,
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
                background: designEditorTokens.fieldBackground,
                color: designEditorTokens.fieldText,
                ".MuiOutlinedInput-notchedOutline": {
                    borderColor: designEditorTokens.fieldBorder,
                },
            },
        },
        staticValue: {
            minHeight: 40,
            px: 1.4,
            display: "flex",
            alignItems: "center",
            borderRadius: sharedCustomization.radius.lg,
            background: designEditorTokens.fieldBackground,
            border: `1px solid ${designEditorTokens.fieldBorder}`,
            color: designEditorTokens.bodyText,
            fontSize: "0.9rem",
            textTransform: "capitalize",
        },
        twoColumnGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1.1,
        },
        clipRow: {
            color: designEditorTokens.bodyText,
        },
        clipLabel: {
            fontSize: "0.84rem",
            fontWeight: 600,
        },
        panelRoot: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderLeft: { lg: `1px solid ${designEditorTokens.panelBorder}` },
            background: designEditorTokens.panelBackground,
        },
        panelHeader: {
            px: 2,
            py: 1.8,
            borderBottom: `1px solid ${designEditorTokens.panelHeaderBorder}`,
        },
        panelEyebrow: {
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: sharedCustomization.text.subtleOnDark,
        },
        panelBodyText: {
            fontSize: "0.92rem",
            color: designEditorTokens.bodyText,
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
            border: `1px solid ${designEditorTokens.panelBorder}`,
            background: designEditorTokens.panelSurface,
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
            background: designEditorTokens.imagePlaceholderBackground,
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
                ? `2px solid ${designEditorTokens.selectionOutline}`
                : options.isSelected
                    ? `1px solid ${designEditorTokens.selectionOutline}`
                    : options.isHovered
                        ? `1px solid ${designEditorTokens.selectionOutlineHover}`
                        : options.isActiveContainer
                            ? `1px solid ${designEditorTokens.selectionOutlineSoft}`
                            : "none",
            outlineOffset: options.isSelected || options.isHovered ? "2px" : 0,
            background: options.isEditingText ? designEditorTokens.editingOverlayBackground : "transparent",
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
            background: designEditorTokens.textEditorBackground,
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
            background: designEditorTokens.overlayChipBackground,
            color: designEditorTokens.overlayChipText,
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
            background: designEditorTokens.overlayChipBackgroundStrong,
            color: designEditorTokens.accentText,
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
            border: `1px dashed ${designEditorTokens.overlayPreviewBorder}`,
            background: options.nodeType === "text"
                ? designEditorTokens.overlayPreviewTextFill
                : options.nodeType === "image"
                    ? designEditorTokens.overlayPreviewImage
                    : designEditorTokens.overlayPreviewFill,
        }),
        resizeHandle: (position: ReturnType<typeof getDesignResizeHandleStyle>) => ({
            position: "absolute",
            width: 10,
            height: 10,
            borderRadius: sharedCustomization.radius.pill,
            background: designEditorTokens.overlayHandleFill,
            border: `2px solid ${designEditorTokens.overlayHandleBorder}`,
            ...position,
        }),
        root: (effectiveTool: "select" | "frame" | "rectangle" | "text" | "image" | "hand", activeSessionKind: string | null, canvasMode: "page" | "workspace") => ({
            position: "relative",
            minHeight: 0,
            height: "100%",
            overflow: "hidden",
            background: canvasMode === "workspace"
                ? "radial-gradient(circle at top, rgba(59, 130, 246, 0.08), transparent 28%), linear-gradient(180deg, rgba(2, 6, 23, 0.98) 0%, rgba(15, 23, 42, 0.96) 100%)"
                : designEditorTokens.canvasBackground,
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
                ? `1px solid ${designEditorTokens.pasteFeedbackBorderError}`
                : `1px solid ${designEditorTokens.pasteFeedbackBorder}`,
            background: tone === "error"
                ? designEditorTokens.pasteFeedbackBackgroundError
                : designEditorTokens.pasteFeedbackBackground,
            color: sharedCustomization.text.onDark,
            backdropFilter: "blur(18px)",
            boxShadow: designEditorTokens.pasteFeedbackShadow,
        }),
        pasteFeedbackText: {
            fontSize: "0.82rem",
            lineHeight: 1.5,
        },
        grid: (viewport: { x: number; y: number; zoom: number }) => ({
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${designEditorTokens.canvasGrid} 1px, transparent 1px), linear-gradient(90deg, ${designEditorTokens.canvasGrid} 1px, transparent 1px)`,
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
            background: guide.source === "container" ? designEditorTokens.guideContainer : designEditorTokens.guideNode,
            boxShadow: `0 0 0 1px ${designEditorTokens.guideOutline}`,
            pointerEvents: "none",
        }),
        insertionIndicator: (indicator: { left: number; top: number; width: number; height: number }) => ({
            position: "absolute",
            left: indicator.left,
            top: indicator.top,
            width: indicator.width,
            height: indicator.height,
            borderRadius: sharedCustomization.radius.pill,
            background: designEditorTokens.insertionIndicator,
            boxShadow: `0 0 0 1px ${designEditorTokens.guideOutline}`,
            pointerEvents: "none",
        }),
    },
    preview: {
        emptyShell: {
            minHeight: sharedCustomization.screenHeight,
            display: "grid",
            placeItems: "center",
            px: 3,
            background: designEditorTokens.previewEmptyBackground,
        },
        emptyCard: {
            width: "min(100%, 460px)",
            p: 3,
            borderRadius: sharedCustomization.radius.huge,
            border: `1px solid ${designEditorTokens.previewEmptyBorder}`,
            background: designEditorTokens.previewEmptySurface,
            color: "#0f172a",
            boxShadow: designEditorTokens.previewEmptyShadow,
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
            background: designEditorTokens.previewBackground,
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