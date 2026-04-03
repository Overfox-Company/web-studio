import { z } from "zod";

import { designDocumentSchema } from "@/src/features/design-editor/schema/design.schema";
import { BASE_COMPONENT_TYPES } from "@/src/features/component-library/types/component.types";

export const componentLibrarySchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    componentIds: z.array(z.string().min(1)),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
});

export const libraryComponentSchema = z.object({
    id: z.string().min(1),
    libraryId: z.string().min(1),
    name: z.string().min(1),
    baseType: z.enum(BASE_COMPONENT_TYPES),
    previewImage: z.string().nullable().optional(),
    document: designDocumentSchema,
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
});

export const componentLibrarySnapshotSchema = z.object({
    projectId: z.string().min(1),
    librariesById: z.record(z.string().min(1), componentLibrarySchema),
    componentsById: z.record(z.string().min(1), libraryComponentSchema),
    version: z.number().int().positive(),
    updatedAt: z.string().min(1),
});
