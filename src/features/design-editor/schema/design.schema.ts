import { z } from "zod";

import {
    DESIGN_AUTO_LAYOUT_ALIGN,
    DESIGN_AUTO_LAYOUT_DIRECTIONS,
    DESIGN_AUTO_LAYOUT_JUSTIFY,
    DESIGN_IMAGE_OBJECT_FITS,
    DESIGN_LAYOUT_MODES,
    DESIGN_NODE_TYPES,
    DESIGN_SIZE_MODES,
    DESIGN_TEXT_ALIGNS,
} from "@/src/features/design-editor/types/design.types";

export const designPaddingSchema = z.object({
    top: z.number(),
    right: z.number(),
    bottom: z.number(),
    left: z.number(),
});

export const designShadowSchema = z.object({
    x: z.number(),
    y: z.number(),
    blur: z.number(),
    spread: z.number(),
    color: z.string().min(1),
});

export const designTypographySchema = z.object({
    fontFamily: z.string().min(1),
    fontSize: z.number().positive(),
    fontWeight: z.number().positive(),
    lineHeight: z.number().positive(),
    textAlign: z.enum(DESIGN_TEXT_ALIGNS),
    color: z.string().min(1),
});

export const designImageStyleSchema = z.object({
    src: z.string().min(1),
    objectFit: z.enum(DESIGN_IMAGE_OBJECT_FITS),
});

export const designImportDiagnosticsSchema = z.object({
    source: z.string().min(1),
    warnings: z.array(z.string()),
    metaJson: z.string().nullable(),
    rawHtml: z.string().nullable(),
    figmetaBase64: z.string().nullable(),
    figmaBase64: z.string().nullable(),
    decoder: z.string().nullable(),
});

export const designAutoLayoutSchema = z.object({
    direction: z.enum(DESIGN_AUTO_LAYOUT_DIRECTIONS).default("vertical"),
    justifyContent: z.enum(DESIGN_AUTO_LAYOUT_JUSTIFY).default("start"),
    alignItems: z.enum(DESIGN_AUTO_LAYOUT_ALIGN).default("start"),
    gap: z.number().min(0).default(16),
    padding: designPaddingSchema.default({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    }),
});

export const designNodeAxisSizingSchema = z.object({
    mode: z.enum(DESIGN_SIZE_MODES).default("fixed"),
    min: z.number().min(0).nullable().default(null),
    max: z.number().min(0).nullable().default(null),
});

export const designNodeSizingSchema = z.object({
    width: designNodeAxisSizingSchema.default({
        mode: "fixed",
        min: null,
        max: null,
    }),
    height: designNodeAxisSizingSchema.default({
        mode: "fixed",
        min: null,
        max: null,
    }),
});

export const designNodeStyleSchema = z.object({
    fill: z.string().min(1),
    stroke: z.string().min(1).nullable(),
    strokeWidth: z.number().min(0),
    borderRadius: z.number().min(0),
    opacity: z.number().min(0).max(1),
    shadow: designShadowSchema.nullable(),
    typography: designTypographySchema.optional(),
    image: designImageStyleSchema.optional(),
});

const designNodeBaseSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    parentId: z.string().min(1).nullable(),
    children: z.array(z.string().min(1)),
    x: z.number(),
    y: z.number(),
    width: z.number().positive(),
    height: z.number().positive(),
    sizing: designNodeSizingSchema.default({
        width: {
            mode: "fixed",
            min: null,
            max: null,
        },
        height: {
            mode: "fixed",
            min: null,
            max: null,
        },
    }),
    rotation: z.number(),
    visible: z.boolean(),
    locked: z.boolean(),
    style: designNodeStyleSchema,
});

export const designFrameNodeSchema = designNodeBaseSchema.extend({
    type: z.literal(DESIGN_NODE_TYPES[0]),
    clipContent: z.boolean(),
    padding: designPaddingSchema,
    layoutMode: z.enum(DESIGN_LAYOUT_MODES).default("absolute"),
    autoLayout: designAutoLayoutSchema.default({
        direction: "vertical",
        justifyContent: "start",
        alignItems: "start",
        gap: 16,
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
    }),
});

export const designGroupNodeSchema = designNodeBaseSchema.extend({
    type: z.literal(DESIGN_NODE_TYPES[1]),
});

export const designRectangleNodeSchema = designNodeBaseSchema.extend({
    type: z.literal(DESIGN_NODE_TYPES[2]),
});

export const designTextNodeSchema = designNodeBaseSchema.extend({
    type: z.literal(DESIGN_NODE_TYPES[3]),
    text: z.string(),
});

export const designImageNodeSchema = designNodeBaseSchema.extend({
    type: z.literal(DESIGN_NODE_TYPES[4]),
    src: z.string().min(1),
});

export const designSvgAssetNodeSchema = designNodeBaseSchema.extend({
    type: z.literal(DESIGN_NODE_TYPES[5]),
    svgMarkup: z.string().min(1),
    viewBox: z.string().nullable(),
    diagnostics: designImportDiagnosticsSchema.nullable().optional(),
});

export const designComponentInstanceNodeSchema = designNodeBaseSchema.extend({
    type: z.literal(DESIGN_NODE_TYPES[6]),
    componentSetId: z.string().min(1),
    variantId: z.string().min(1),
});

export const designNodeSchema = z.discriminatedUnion("type", [
    designFrameNodeSchema,
    designGroupNodeSchema,
    designRectangleNodeSchema,
    designTextNodeSchema,
    designImageNodeSchema,
    designSvgAssetNodeSchema,
    designComponentInstanceNodeSchema,
]);

export const designDocumentSchema = z.object({
    id: z.string().min(1),
    viewNodeId: z.string().min(1),
    name: z.string().min(1),
    rootNodeId: z.string().min(1),
    nodes: z.record(z.string().min(1), designNodeSchema),
    version: z.number().int().positive(),
    updatedAt: z.string().min(1),
});