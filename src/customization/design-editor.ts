import { projectEditorTokens } from "@/src/customization/project-editor";
import { sharedCustomization } from "@/src/customization/shared";
import type { DesignFrame, DesignResizeHandle } from "@/src/features/design-editor/types/interaction.types";

type SaveState = "saved" | "saving" | "error";
type FeedbackTone = "info" | "error";

const designEditorTokens = {
    shellBackground: projectEditorTokens.shellBackground,
    loadingBackground: projectEditorTokens.shellBackground,
    loadingSurface: projectEditorTokens.panelBackground,
    panelBackground: projectEditorTokens.panelBackground,
    panelSurface: projectEditorTokens.panelToggleBackground,
    panelBorder: projectEditorTokens.panelBorder,
    panelBorderStrong: sharedCustomization.border.strong,
    panelHeaderBorder: "rgba(255, 255, 255, 0.08)",
    canvasDivider: "rgba(255, 255, 255, 0.08)",
    topbarBorder: projectEditorTokens.topbarBorder,
    toolbarDivider: "rgba(255, 255, 255, 0.08)",
    topbarButtonBorder: projectEditorTokens.statusBorder,
    topbarZoomBorder: projectEditorTokens.statusBorder,
    topbarBackground: projectEditorTokens.topbarBackground,
    topbarButtonBackground: projectEditorTokens.panelToggleBackground,
    topbarButtonBackgroundStrong: projectEditorTokens.panelToggleBackground,
    statusBackground: projectEditorTokens.panelToggleBackground,
    statusBorder: "transparent",
    statusText: sharedCustomization.text.primary,
    statusError: "#ff8db3",
    toolbarGroupBackground: projectEditorTokens.panelToggleBackground,
    toolbarGroupBorder: "transparent",
    toolbarButtonText: sharedCustomization.text.secondary,
    toolbarButtonActiveBackground: projectEditorTokens.layoutPrimaryAccentSoft,
    toolbarButtonActiveText: projectEditorTokens.layoutPrimaryAccent,
    toolbarButtonActiveShortcut: projectEditorTokens.layoutPrimaryAccent,
    toolbarButtonShortcut: "#7d7f85",
    toolbarButtonHover: "rgba(146, 218, 112, 0.08)",
    titleText: sharedCustomization.text.primary,
    bodyText: sharedCustomization.text.secondary,
    accentText: projectEditorTokens.layoutPrimaryAccent,
    canvasBackground: "radial-gradient(circle at top left, rgba(87, 90, 255, 0), transparent 28%), linear-gradient(180deg, #12121700 0%, #17181d 100%)",
    canvasGrid: "rgba(255, 255, 255, 0.06)",
    overlayChipBackground: "rgba(28, 27, 31, 0.92)",
    overlayChipBackgroundStrong: "rgba(36, 35, 38, 0.98)",
    overlayChipText: sharedCustomization.text.strong,
    autoBadgeBackground: projectEditorTokens.nodeViewAccentSoft,
    overlayHandleFill: projectEditorTokens.nodeViewAccent,
    overlayHandleBorder: "rgba(17, 17, 22, 0.96)",
    selectionOutline: "rgba(79, 124, 255, 0.92)",
    selectionOutlineHover: "rgba(79, 124, 255, 0.36)",
    selectionOutlineSoft: "rgba(79, 124, 255, 0.22)",
    editingOverlayBackground: "rgba(79, 124, 255, 0.06)",
    textEditorBackground: "rgba(36, 35, 38, 0.96)",
    overlayPreviewFill: "rgba(79, 124, 255, 0.14)",
    overlayPreviewTextFill: "rgba(79, 124, 255, 0.1)",
    overlayPreviewBorder: "rgba(79, 124, 255, 0.78)",
    overlayPreviewImage: "linear-gradient(135deg, rgba(79, 124, 255, 0.18), rgba(79, 124, 255, 0.04))",
    pasteFeedbackBackground: "rgba(28, 27, 31, 0.96)",
    pasteFeedbackBackgroundError: "rgba(64, 24, 38, 0.96)",
    pasteFeedbackBorder: "rgba(79, 124, 255, 0.24)",
    pasteFeedbackBorderError: "rgba(239, 68, 68, 0.22)",
    pasteFeedbackShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
    guideNode: "rgba(79, 124, 255, 0.92)",
    guideContainer: "rgba(36, 35, 38, 0.94)",
    guideOutline: "rgba(255, 255, 255, 0.12)",
    insertionIndicator: "rgba(79, 124, 255, 0.92)",
    fieldBackground: projectEditorTokens.panelToggleBackground,
    fieldBorder: "transparent",
    fieldText: sharedCustomization.text.primary,
    layerSelectedBackground: "rgba(79, 124, 255, 0.12)",
    layerSelectedBorder: "rgba(87, 90, 255, 0.34)",
    layerHoverBackground: "rgba(255, 255, 255, 0.04)",
    imagePlaceholderBackground: "linear-gradient(135deg, rgba(36, 35, 38, 0.98) 0%, rgba(24, 24, 29, 0.98) 100%), radial-gradient(circle at top left, rgba(87, 90, 255, 0.14), transparent 48%)",
    previewBackground: projectEditorTokens.shellBackground,
    previewEmptyBackground: projectEditorTokens.shellBackground,
    previewEmptySurface: projectEditorTokens.panelBackground,
    previewEmptyBorder: "rgba(255, 255, 255, 0.1)",
    previewEmptyShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
} as const;

export const designEditorDefaults = {
    typography: {
        fontFamily: '"IBM Plex Sans", sans-serif',
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.5,
        textAlign: "left" as const,
        color: sharedCustomization.text.primary,
    },
    imageSource: "placeholder://image",
    fills: {
        root: "#161618",
        frame: "#242326",
        rectangle: projectEditorTokens.nodeViewAccentMuted,
        image: designEditorTokens.imagePlaceholderBackground,
        fallback: "#242326",
        transparent: "transparent",
    },
    strokes: {
        root: "rgba(255, 255, 255, 0.12)",
        frame: "rgba(255, 255, 255, 0.1)",
        rectangle: "rgba(79, 124, 255, 0.22)",
        image: "rgba(255, 255, 255, 0.08)",
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
        background: "#161618",
        surface: "rgba(36,35,38,0.96)",
        accent: projectEditorTokens.nodeViewAccent,
        title: sharedCustomization.text.primary,
        subtitle: sharedCustomization.text.secondary,
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
            height: "100dvh",
            display: "grid",
            gridTemplateRows: "auto minmax(0, 1fr)",
            background: designEditorTokens.shellBackground,
            overflow: "hidden",
        },
        workspace: {
            minHeight: 0,
            display: "grid",
            position: "relative",
            gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr) 296px" },
            gridTemplateRows: { xs: "minmax(0, 56vh) auto auto", lg: "1fr" },
            gridTemplateAreas: {
                xs: '"canvas" "layers" "inspector"',
                lg: '"layers canvas inspector"',
            },
            overflow: "hidden",
        },
        layersSlot: {
            gridArea: "layers",
            minHeight: 0,
            borderTop: { xs: `1px solid ${designEditorTokens.panelBorder}`, lg: "none" },
            background: "linear-gradient(180deg, rgba(20,20,24,0.98) 0%, rgba(17,17,22,0.98) 100%)",
            overflow: "hidden",
        },
        canvasSlot: {
            gridArea: "canvas",
            minHeight: 0,
            borderInline: { lg: `1px solid ${designEditorTokens.canvasDivider}` },
            overflow: "hidden",
        },
        inspectorSlot: {
            gridArea: "inspector",
            minHeight: 0,
            borderTop: { xs: `1px solid ${designEditorTokens.panelBorder}`, lg: "none" },
            overflow: "hidden",
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
            py: 1.15,
            background: "linear-gradient(180deg, rgba(17,17,22,0.96) 0%, rgba(17,17,22,0.88) 100%)",
            backdropFilter: "blur(24px)",
            borderBottom: `1px solid ${designEditorTokens.panelHeaderBorder}`,
        },
        leftGroup: {
            minWidth: 0,
            flexWrap: "wrap",
            alignItems: "center",
        },
        chromeButton: {
            minWidth: 0,
            px: 1.3,
            py: 0.85,
            gap: 0.85,
            color: sharedCustomization.text.onDark,
            borderColor: "transparent",
            background: designEditorTokens.topbarButtonBackground,
            borderRadius: 14,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            "&:hover": {
                background: "rgba(255,255,255,0.08)",
                borderColor: "transparent",
            },
        },
        chromeButtonPrimary: {
            minWidth: 0,
            px: 1.35,
            py: 0.85,
            gap: 0.85,
            color: "#081006",
            borderColor: "transparent",
            background: projectEditorTokens.layoutPrimaryAccent,
            borderRadius: 14,
            boxShadow: "0 10px 24px rgba(146, 218, 112, 0.22)",
            "&:hover": {
                background: "#9fe27e",
                borderColor: "transparent",
            },
            "&.Mui-disabled": {
                color: "rgba(8, 16, 6, 0.6)",
                background: "rgba(146, 218, 112, 0.48)",
            },
        },
        chromeButtonLabel: {
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
        },
        chromeButtonIcon: {
            display: "inline-flex",
            color: "inherit",
        },
        meta: {
            minWidth: 0,
            px: 1.2,
            py: 0.85,
            borderRadius: 16,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.04)",
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
            background: designEditorTokens.statusBackground,
            color: saveState === "error" ? designEditorTokens.statusError : designEditorTokens.statusText,
            fontSize: "0.76rem",
            fontWeight: 600,
        }),
        rightGroup: {
            flexWrap: "wrap",
            alignItems: "center",
        },
        toolGroup: {
            p: 0.5,
            borderRadius: sharedCustomization.radius.pill,
            background: designEditorTokens.toolbarGroupBackground,
        },
        viewportGroup: {
            p: 0.4,
            borderRadius: 16,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.04)",
        },
        viewportButton: (isActive: boolean) => ({
            minWidth: 0,
            gap: 0.75,
            px: 1,
            py: 0.7,
            color: isActive ? designEditorTokens.toolbarButtonActiveText : designEditorTokens.toolbarButtonText,
            background: isActive ? designEditorTokens.toolbarButtonActiveBackground : "transparent",
            borderRadius: 12,
            "&:hover": {
                background: isActive ? projectEditorTokens.layoutPrimaryAccentSoft : designEditorTokens.toolbarButtonHover,
            },
        }),
        viewportButtonLabel: {
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.01em",
        },
        toolButton: (isActive: boolean) => ({
            minWidth: 0,
            gap: 0.7,
            px: 1.05,
            py: 0.85,
            color: isActive ? designEditorTokens.toolbarButtonActiveText : designEditorTokens.toolbarButtonText,
            background: isActive ? designEditorTokens.toolbarButtonActiveBackground : "transparent",
            borderRadius: 14,
            "&:hover": {
                background: isActive ? projectEditorTokens.layoutPrimaryAccentSoft : designEditorTokens.toolbarButtonHover,
            },
        }),
        toolIcon: (isActive: boolean) => ({
            display: "inline-flex",
            color: isActive ? projectEditorTokens.layoutPrimaryAccent : sharedCustomization.text.secondary,
        }),
        toolLabel: {
            fontSize: "0.78rem",
            fontWeight: 700,
        },
        toolShortcut: (isActive: boolean) => ({
            fontSize: "0.66rem",
            color: isActive ? designEditorTokens.toolbarButtonActiveShortcut : designEditorTokens.toolbarButtonShortcut,
        }),
        floatingToolDock: {
            position: "absolute",
            left: "50%",
            bottom: { xs: 18, lg: 24 },
            transform: "translateX(-50%)",
            zIndex: 15,
            pointerEvents: "none",
            width: "max-content",
            maxWidth: "calc(100% - 32px)",
        },
        floatingToolGroup: {
            p: 0.55,
            borderRadius: 18,
            background: "linear-gradient(180deg, rgba(28, 27, 31, 0.94) 0%, rgba(17, 17, 22, 0.94) 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 18px 40px rgba(0, 0, 0, 0.32)",
            pointerEvents: "auto",
            flexWrap: "wrap",
            justifyContent: "center",
        },
        divider: {
            borderColor: designEditorTokens.toolbarDivider,
            display: { xs: "none", sm: "block" },
        },
        zoomStepButton: {
            minWidth: 34,
            width: 34,
            height: 34,
            px: 0,
            color: designEditorTokens.toolbarButtonText,
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
        },
        zoomDisplayButton: {
            minWidth: 84,
            color: sharedCustomization.text.onDark,
            borderColor: "transparent",
            background: designEditorTokens.topbarButtonBackgroundStrong,
            borderRadius: 12,
            fontWeight: 700,
            letterSpacing: "-0.02em",
        },
    },
    layers: {
        root: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(180deg, rgba(20,20,24,0.98) 0%, rgba(17,17,22,0.98) 100%)",
        },
        header: {
            px: 1.7,
            py: 1.45,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
        },
        headerEyebrow: {
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: sharedCustomization.text.subtleOnDark,
        },
        headerBody: {
            fontSize: "0.84rem",
            color: designEditorTokens.bodyText,
            lineHeight: 1.5,
        },
        searchShell: {
            display: "grid",
            gridTemplateColumns: "auto minmax(0, 1fr)",
            alignItems: "center",
            gap: 0.9,
            mt: 1.1,
            px: 1.1,
            py: 0.85,
            borderRadius: 14,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.04)",
        },
        searchIcon: {
            display: "inline-flex",
            color: sharedCustomization.text.subtleOnDark,
        },
        searchInput: {
            width: "100%",
            color: sharedCustomization.text.onDark,
            fontSize: "0.84rem",
            "& input::placeholder": {
                color: sharedCustomization.text.subtleOnDark,
                opacity: 1,
            },
        },
        sectionCaption: {
            fontSize: "0.68rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: sharedCustomization.text.subtleOnDark,
        },
        list: {
            px: 0.9,
            py: 1,
            overflowY: "auto",
            minHeight: 0,
        },
        item: (isSelected: boolean, isHovered: boolean) => ({
            minHeight: 42,
            px: 0.95,
            borderRadius: 14,
            cursor: "pointer",
            transform: isHovered ? "translateX(1px)" : "none",
            transition: `background ${sharedCustomization.transition.fast}, transform ${sharedCustomization.transition.fast}, color ${sharedCustomization.transition.fast}, border-color ${sharedCustomization.transition.fast}`,
            background: isSelected
                ? designEditorTokens.layerSelectedBackground
                : isHovered
                    ? designEditorTokens.layerHoverBackground
                    : "transparent",
            border: `1px solid ${isSelected ? designEditorTokens.layerSelectedBorder : "transparent"}`,
        }),
        collapseToggle: (hasChildren: boolean) => ({
            width: 18,
            height: 18,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            color: hasChildren ? sharedCustomization.text.mutedOnDark : "transparent",
            fontSize: "0.72rem",
            userSelect: "none",
            flexShrink: 0,
        }),
        indent: (depth: number) => ({
            width: depth * 12,
            flexShrink: 0,
        }),
        itemIcon: (isSelected: boolean) => ({
            width: 24,
            height: 24,
            display: "grid",
            placeItems: "center",
            borderRadius: 9,
            background: isSelected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
            color: isSelected ? sharedCustomization.text.onDark : sharedCustomization.text.secondary,
            flexShrink: 0,
        }),
        textStack: {
            minWidth: 0,
            flex: 1,
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
        itemMeta: {
            px: 0.65,
            py: 0.25,
            borderRadius: sharedCustomization.radius.pill,
            background: "rgba(255,255,255,0.04)",
            color: sharedCustomization.text.secondary,
            fontSize: "0.64rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
        },
        subsectionHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: 1.7,
            py: 1,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
        },
        subsectionTitle: {
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: sharedCustomization.text.subtleOnDark,
        },
        libraryItem: {
            p: 1.05,
            borderRadius: 16,
            background: "linear-gradient(180deg, rgba(36, 35, 38, 0.92) 0%, rgba(24, 24, 29, 0.92) 100%)",
            border: "1px solid rgba(255,255,255,0.04)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
        },
        libraryAction: {
            minWidth: 0,
            px: 1,
            py: 0.65,
            gap: 0.55,
            borderRadius: 12,
            color: sharedCustomization.text.onDark,
            background: "rgba(255,255,255,0.04)",
            borderColor: "transparent",
            "&:hover": {
                background: "rgba(255,255,255,0.08)",
                borderColor: "transparent",
            },
        },
        libraryActionLabel: {
            fontSize: "0.74rem",
            fontWeight: 700,
        },
    },
    inspector: {
        section: {
            py: 1.05,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "transparent",
        },
        sectionHeader: {
            minWidth: 0,
            minHeight: 20,
        },
        sectionIconBadge: {
            width: 18,
            height: 18,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            color: sharedCustomization.text.secondary,
            flexShrink: 0,
        },
        sectionTitle: {
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: sharedCustomization.text.secondary,
        },
        metaPill: {
            px: 0.65,
            py: 0.18,
            borderRadius: sharedCustomization.radius.pill,
            background: "rgba(255,255,255,0.05)",
            color: sharedCustomization.text.secondary,
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
        },
        metaPillStrong: {
            px: 0.65,
            py: 0.18,
            borderRadius: sharedCustomization.radius.pill,
            background: projectEditorTokens.layoutPrimaryAccentSoft,
            color: projectEditorTokens.layoutPrimaryAccent,
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
        },
        identityRow: {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 0.5,
        },
        gridFieldLabel: {
            fontSize: "0.62rem",
            fontWeight: 600,
            color: sharedCustomization.text.mutedOnDark,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
        },
        textField: {
            "& .MuiOutlinedInput-root": {
                minHeight: 32,
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                color: designEditorTokens.fieldText,
                fontSize: "0.8rem",
                "& textarea, & input": {
                    px: 0.1,
                    py: 0.05,
                },
                ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.06)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.1)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: projectEditorTokens.layoutPrimaryAccentBorder,
                },
            },
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
        controlRail: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
            gap: 0.25,
            p: 0.25,
            borderRadius: 1.25,
            background: "rgba(255,255,255,0.04)",
        },
        controlButton: (isActive: boolean, dense = false) => ({
            minHeight: dense ? 28 : 30,
            px: dense ? 0.65 : 0.8,
            borderRadius: 1,
            background: isActive ? "rgba(146,218,112,0.12)" : "transparent",
            color: isActive ? projectEditorTokens.layoutPrimaryAccent : designEditorTokens.bodyText,
            boxShadow: "none",
            transition: `background ${sharedCustomization.transition.standard}, color ${sharedCustomization.transition.standard}, box-shadow ${sharedCustomization.transition.standard}`,
        }),
        controlButtonIcon: (isActive: boolean) => ({
            display: "inline-flex",
            color: isActive ? projectEditorTokens.layoutPrimaryAccent : sharedCustomization.text.secondary,
        }),
        controlButtonLabel: (isActive: boolean, dense = false) => ({
            fontSize: dense ? "0.64rem" : "0.7rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: isActive ? projectEditorTokens.layoutPrimaryAccent : sharedCustomization.text.secondary,
        }),
        metricGrid2: {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 0.6,
        },
        metricGrid3: {

            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 0.6,
        },
        fourUpGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 0.45,
        },
        twoColumnGridCompact: {
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 82px",
            gap: 0.55,
        },
        metricField: {
            minHeight: 30,
            display: "grid",
            gridTemplateColumns: "auto minmax(0, 1fr) auto",
            alignItems: "center",
            gap: 0.35,
            px: 0.55,
            borderRadius: 1.1,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
        },
        metricFieldStatic: {
            minHeight: 30,
            display: "grid",
            gridTemplateColumns: "auto minmax(0, 1fr)",
            alignItems: "center",
            gap: 0.35,
            px: 0.55,
            borderRadius: 1.1,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
        },
        metricIcon: {
            width: 14,
            height: 14,
            display: "grid",
            placeItems: "center",
            color: sharedCustomization.text.secondary,
        },
        metricInput: {
            "& .MuiOutlinedInput-root": {
                px: 0,
                py: 0,
                background: "transparent",
                fontSize: "0.8rem",
                color: sharedCustomization.text.onDark,
                ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                },
                "& input": {
                    p: 0,
                },
            },
        },
        metricStaticValue: {
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "0.76rem",
            fontWeight: 500,
            color: sharedCustomization.text.onDark,
        },
        metricUnit: {
            fontSize: "0.62rem",
            fontWeight: 600,
            color: sharedCustomization.text.subtleOnDark,
            textTransform: "uppercase",
        },
        togglePill: (active: boolean) => ({
            minHeight: 24,
            px: 0.7,
            borderRadius: 1,
            background: active ? "rgba(146,218,112,0.1)" : "rgba(255,255,255,0.035)",
            border: `1px solid ${active ? "rgba(146,218,112,0.14)" : "rgba(255,255,255,0.05)"}`,
        }),
        togglePillLabel: (active: boolean) => ({
            fontSize: "0.62rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: active ? projectEditorTokens.layoutPrimaryAccent : sharedCustomization.text.secondary,
        }),
        matrixGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 0.25,
            p: 0.25,
            borderRadius: 1.1,
            background: "rgba(255,255,255,0.04)",
        },
        matrixCell: (isActive: boolean) => ({
            minHeight: 28,
            borderRadius: 1,
            background: isActive ? "rgba(146,218,112,0.1)" : "transparent",
            color: isActive ? projectEditorTokens.layoutPrimaryAccent : sharedCustomization.text.secondary,
        }),
        autoLayoutPanel: {
            p: 1,
            borderRadius: 2,
            background: "rgba(17,17,22,0.82)",
            border: "1px solid rgba(255,255,255,0.04)",
            display: "grid",
            gap: 1,
        },
        autoLayoutHero: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
        },
        autoLayoutTitle: {
            fontSize: "0.82rem",
            fontWeight: 700,
            color: sharedCustomization.text.onDark,
        },
        autoLayoutBody: {
            fontSize: "0.76rem",
            color: sharedCustomization.text.mutedOnDark,
            lineHeight: 1.45,
        },
        autoLayoutGrid: {
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            alignItems: "start",
        },
        staticValue: {
            minHeight: 30,
            px: 0.75,
            display: "flex",
            alignItems: "center",
            borderRadius: 1,
            background: designEditorTokens.fieldBackground,
            color: designEditorTokens.bodyText,
            fontSize: "0.76rem",
            textTransform: "capitalize",
        },
        twoColumnGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 0.6,
        },
        clipRow: {
            color: designEditorTokens.bodyText,
        },
        clipLabel: {
            fontSize: "0.84rem",
            fontWeight: 600,
        },
        toggleRowGroup: {
            p: 0,
            borderRadius: 0,
            background: "transparent",
            border: "none",
        },
        toggleRow: {
            minHeight: 30,
            px: 0,
        },
        toggleRowLabel: {
            fontSize: "0.72rem",
            fontWeight: 500,
            color: sharedCustomization.text.onDark,
        },
        noteText: {
            fontSize: "0.72rem",
            lineHeight: 1.5,
            color: sharedCustomization.text.mutedOnDark,
        },
        panelRoot: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "rgba(17,17,22,1)",
        },
        panelHeader: {
            px: 1.15,
            py: 0.95,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
        },
        panelEyebrow: {
            fontSize: "0.62rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: sharedCustomization.text.subtleOnDark,
        },
        panelBodyText: {
            fontSize: "0.74rem",
            color: designEditorTokens.bodyText,
            lineHeight: 1.45,
        },
        panelBody: {
            minHeight: 0,
            overflowY: "auto",
            px: 0.9,
            py: 0.35,
        },
        multiSelectionCard: {
            p: 1.05,
            borderRadius: 1.5,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
        },
        multiSelectionEyebrow: {
            fontSize: "0.64rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: sharedCustomization.text.mutedOnDark,
        },
        multiSelectionCount: {
            fontSize: "0.86rem",
            fontWeight: 600,
            color: sharedCustomization.text.onDark,
        },
        multiSelectionBody: {
            fontSize: "0.74rem",
            color: sharedCustomization.text.mutedOnDark,
            lineHeight: 1.5,
        },
        nodeHeader: {
            py: 1.05,
        },
        nodeHeaderRow: {
            display: "grid",
            gridTemplateColumns: "18px minmax(0, 1fr) auto",
            gap: 0.55,
            alignItems: "center",
        },
        nodeHeaderIcon: {
            width: 18,
            height: 18,
            display: "grid",
            placeItems: "center",
            color: sharedCustomization.text.secondary,
        },
        nodeHeaderBadge: {
            px: 0.55,
            py: 0.18,
            borderRadius: sharedCustomization.radius.pill,
            background: "rgba(255,255,255,0.05)",
            color: sharedCustomization.text.secondary,
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
        },
        sectionDisclosure: {
            width: "100%",
            minHeight: 28,
            justifyContent: "space-between",
            gap: 0.8,
            px: 0.55,
            py: 0.45,
            borderRadius: 1,
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.05)",
        },
        sectionDisclosureLabel: {
            fontSize: "0.72rem",
            fontWeight: 500,
            color: sharedCustomization.text.onDark,
        },
        sectionDisclosureValue: {
            fontSize: "0.68rem",
            color: sharedCustomization.text.mutedOnDark,
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
            ...(options.isRoot
                ? options.rootPositioning === "document-root"
                    ? {
                        position: "relative" as const,
                    }
                    : {
                        position: "absolute" as const,
                        left: options.frame.x,
                        top: options.frame.y,
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
                : {
                    position: "absolute" as const,
                    left: options.frame.x,
                    top: options.frame.y,
                }),
            width: options.frame.width,
            height: options.frame.height,
            boxSizing: "border-box",
            transform: `rotate(${options.frame.rotation}deg)`,
            transformOrigin: "center center",
            borderRadius: `${options.borderRadius}px`,
            pointerEvents: options.locked ? "none" : "auto",
            border: options.isCandidateParent
                ? `2px solid ${designEditorTokens.selectionOutline}`
                : options.isSelected
                    ? `1px solid ${designEditorTokens.selectionOutline}`
                    : options.isHovered
                        ? `1px solid ${designEditorTokens.selectionOutlineHover}`
                        : options.isActiveContainer
                            ? `1px solid ${designEditorTokens.selectionOutlineSoft}`
                            : "1px solid transparent",
            background: options.isEditingText ? designEditorTokens.editingOverlayBackground : "transparent",
            transition: options.hasActiveSession ? "none" : "border-color 120ms ease",
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