export const DESIGN_NODE_TYPES = ["frame", "group", "rectangle", "text", "image", "svg-asset", "component-instance"] as const;
export type DesignNodeType = (typeof DESIGN_NODE_TYPES)[number];

export const DESIGN_LAYOUT_MODES = ["absolute", "auto"] as const;
export type DesignLayoutMode = (typeof DESIGN_LAYOUT_MODES)[number];

export const DESIGN_AUTO_LAYOUT_DIRECTIONS = ["horizontal", "vertical"] as const;
export type DesignAutoLayoutDirection = (typeof DESIGN_AUTO_LAYOUT_DIRECTIONS)[number];

export const DESIGN_AUTO_LAYOUT_JUSTIFY = ["start", "center", "end", "space-between"] as const;
export type DesignAutoLayoutJustify = (typeof DESIGN_AUTO_LAYOUT_JUSTIFY)[number];

export const DESIGN_AUTO_LAYOUT_ALIGN = ["start", "center", "end", "stretch"] as const;
export type DesignAutoLayoutAlign = (typeof DESIGN_AUTO_LAYOUT_ALIGN)[number];

export const DESIGN_TEXT_ALIGNS = ["left", "center", "right"] as const;
export type DesignTextAlign = (typeof DESIGN_TEXT_ALIGNS)[number];

export const DESIGN_IMAGE_OBJECT_FITS = ["cover", "contain", "fill"] as const;
export type DesignImageObjectFit = (typeof DESIGN_IMAGE_OBJECT_FITS)[number];

export interface DesignPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface DesignShadow {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
}

export interface DesignTypography {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    textAlign: DesignTextAlign;
    color: string;
}

export interface DesignImageStyle {
    src: string;
    objectFit: DesignImageObjectFit;
}

export interface DesignImportDiagnostics {
    source: string;
    warnings: string[];
    metaJson: string | null;
    rawHtml: string | null;
    figmetaBase64: string | null;
    figmaBase64: string | null;
    decoder: string | null;
}

export interface DesignAutoLayout {
    direction: DesignAutoLayoutDirection;
    justifyContent: DesignAutoLayoutJustify;
    alignItems: DesignAutoLayoutAlign;
    gap: number;
    padding: DesignPadding;
}

export interface DesignNodeStyle {
    fill: string;
    stroke: string | null;
    strokeWidth: number;
    borderRadius: number;
    opacity: number;
    shadow: DesignShadow | null;
    typography?: DesignTypography;
    image?: DesignImageStyle;
}

interface DesignNodeBase<TType extends DesignNodeType> {
    id: string;
    type: TType;
    name: string;
    parentId: string | null;
    children: string[];
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    visible: boolean;
    locked: boolean;
    style: DesignNodeStyle;
}

export interface DesignFrameNode extends DesignNodeBase<"frame"> {
    clipContent: boolean;
    padding: DesignPadding;
    layoutMode: DesignLayoutMode;
    autoLayout: DesignAutoLayout;
}

export type DesignGroupNode = DesignNodeBase<"group">;

export type DesignRectangleNode = DesignNodeBase<"rectangle">;

export interface DesignTextNode extends DesignNodeBase<"text"> {
    text: string;
}

export interface DesignImageNode extends DesignNodeBase<"image"> {
    src: string;
}

export interface DesignSvgAssetNode extends DesignNodeBase<"svg-asset"> {
    svgMarkup: string;
    viewBox: string | null;
    diagnostics?: DesignImportDiagnostics | null;
}

// Architecture note:
// - A Page document contains Component Instance nodes.
// - A Component Variant document defines reusable visual content.
// - A Component Instance node references a variant; it is not the variant itself.
export interface DesignComponentInstanceNode extends DesignNodeBase<"component-instance"> {
    componentSetId: string;
    variantId: string;
}

export type DesignNode = DesignFrameNode | DesignGroupNode | DesignRectangleNode | DesignTextNode | DesignImageNode | DesignSvgAssetNode | DesignComponentInstanceNode;

export type DesignContainerNode = DesignFrameNode | DesignGroupNode;

export interface DesignDocumentSnapshot {
    id: string;
    viewNodeId: string;
    name: string;
    rootNodeId: string;
    nodes: Record<string, DesignNode>;
    version: number;
    updatedAt: string;
}