import { z } from "zod";

import {
    actionNodeSchema,
    apiNodeSchema,
    databaseNodeSchema,
    projectEdgeArraySchema,
    projectEdgeSchema,
    projectNodeArraySchema,
    projectNodeSchema,
    viewNodeSchema,
} from "@/src/features/project-editor/schema/node.schema";

export const projectEditorStateSchema = z.object({
    projectId: z.string().min(1),
    name: z.string().min(1),
    nodes: projectNodeArraySchema,
    edges: projectEdgeArraySchema,
    version: z.number().int().positive(),
    updatedAt: z.string().min(1),
});

export const exportedProjectSpecSchema = z.object({
    project: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        version: z.number().int().positive(),
        updatedAt: z.string().min(1),
    }),
    architecture: z.object({
        nodes: z.array(projectNodeSchema),
        relations: z.array(projectEdgeSchema),
    }),
    design: z.object({
        colors: z.array(z.string()),
        fonts: z.array(z.string()),
        components: z.array(z.string()),
    }),
    data: z.object({
        databases: z.array(databaseNodeSchema),
        apis: z.array(apiNodeSchema),
        actions: z.array(actionNodeSchema),
        views: z.array(viewNodeSchema),
    }),
});
