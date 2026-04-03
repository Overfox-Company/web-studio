import { z } from "zod";

import { designDocumentSchema } from "@/src/features/design-editor/schema/design.schema";
import {
    ACTION_TRIGGERS,
    API_METHODS,
    DATABASE_PROVIDERS,
    PAGE_VIEWPORT_MODES,
    VIEW_RENDER_MODES,
} from "@/src/features/project-editor/types/editor.types";
import { SOCKET_TYPES } from "@/src/features/project-editor/utils/socket-types";

export const nodePositionSchema = z.object({
    x: z.number(),
    y: z.number(),
});

export const pageNodeDataSchema = z.object({
    slug: z.string().min(1),
    index: z.boolean(),
    viewportMode: z.enum(PAGE_VIEWPORT_MODES),
    designDocument: designDocumentSchema.optional(),
});

export const viewNodeDataSchema = z.object({
    route: z.string().startsWith("/"),
    renderMode: z.enum(VIEW_RENDER_MODES),
    layout: z.string().min(1),
    designDocument: designDocumentSchema.optional(),
});

export const apiNodeDataSchema = z.object({
    endpoint: z.string().startsWith("/"),
    method: z.enum(API_METHODS),
    authRequired: z.boolean(),
});

export const databaseNodeDataSchema = z.object({
    provider: z.enum(DATABASE_PROVIDERS),
    entityName: z.string().min(1),
    modelRef: z.string().min(1),
});

export const actionNodeDataSchema = z.object({
    trigger: z.enum(ACTION_TRIGGERS),
    target: z.string().min(1),
});

const projectNodeBaseSchema = {
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().default(""),
    position: nodePositionSchema,
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
};

export const pageNodeSchema = z.object({
    ...projectNodeBaseSchema,
    kind: z.literal("page"),
    data: pageNodeDataSchema,
});

export const viewNodeSchema = z.object({
    ...projectNodeBaseSchema,
    kind: z.literal("view"),
    data: viewNodeDataSchema,
});

export const apiNodeSchema = z.object({
    ...projectNodeBaseSchema,
    kind: z.literal("api"),
    data: apiNodeDataSchema,
});

export const databaseNodeSchema = z.object({
    ...projectNodeBaseSchema,
    kind: z.literal("database"),
    data: databaseNodeDataSchema,
});

export const actionNodeSchema = z.object({
    ...projectNodeBaseSchema,
    kind: z.literal("action"),
    data: actionNodeDataSchema,
});

export const projectNodeSchema = z.discriminatedUnion("kind", [
    pageNodeSchema,
    viewNodeSchema,
    apiNodeSchema,
    databaseNodeSchema,
    actionNodeSchema,
]);

export const projectNodeArraySchema = z.array(projectNodeSchema);

export const projectEdgeSchema = z.object({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    sourceHandle: z.string().min(1).optional(),
    targetHandle: z.string().min(1).optional(),
    sourceSocketType: z.enum(SOCKET_TYPES).optional(),
    targetSocketType: z.enum(SOCKET_TYPES).optional(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
});

export const projectEdgeArraySchema = z.array(projectEdgeSchema);
