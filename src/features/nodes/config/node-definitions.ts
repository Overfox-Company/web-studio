import { z } from "zod";

import type {
    ArchitectureNodeData,
    ArchitectureNodeKind,
    PaletteItem,
} from "@/src/types/editor";

export const DEFAULT_PAGE_BUILDER_TREE = JSON.stringify(
    {
        ROOT: {
            type: { resolvedName: "BuilderStage" },
            isCanvas: true,
            props: {},
            displayName: "BuilderStage",
            custom: {},
            hidden: false,
            nodes: [],
            linkedNodes: {},
        },
    },
    null,
    2,
);

const fieldSchema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    required: z.boolean(),
    unique: z.boolean().optional(),
});

const relationSchema = z.object({
    target: z.string().min(1),
    type: z.enum(["hasOne", "hasMany", "belongsTo"]),
});

const commonSchema = {
    label: z.string().min(1),
    description: z.string().default(""),
};

export const architectureNodeSchema = z.discriminatedUnion("kind", [
    z.object({
        kind: z.literal("page"),
        ...commonSchema,
        route: z.string().startsWith("/"),
        renderMode: z.enum(["ssr", "csr"]),
        layout: z.string().min(1),
        connectedComponentIds: z.array(z.string()),
        builderTree: z.string().min(2),
    }),
    z.object({
        kind: z.literal("component"),
        ...commonSchema,
        componentType: z.string().min(1),
        propsSchema: z.record(z.string(), z.string()),
        stateDependencies: z.array(z.string()),
    }),
    z.object({
        kind: z.literal("database"),
        ...commonSchema,
        modelName: z.string().min(1),
        fields: z.array(fieldSchema),
        indexes: z.array(z.string()),
        relations: z.array(relationSchema),
    }),
    z.object({
        kind: z.literal("api"),
        ...commonSchema,
        method: z.string().min(2),
        route: z.string().startsWith("/"),
        inputSchema: z.string().min(1),
        outputSchema: z.string().min(1),
    }),
    z.object({
        kind: z.literal("serverAction"),
        ...commonSchema,
        actionName: z.string().min(1),
        inputData: z.string().min(1),
        mutationLogic: z.string().min(1),
        databaseDependencies: z.array(z.string()),
    }),
    z.object({
        kind: z.literal("externalApi"),
        ...commonSchema,
        serviceName: z.string().min(1),
        baseUrl: z.string().url(),
        authStrategy: z.string().min(1),
    }),
    z.object({
        kind: z.literal("stateStore"),
        ...commonSchema,
        storeName: z.string().min(1),
        stateShape: z.record(z.string(), z.string()),
        persistence: z.boolean(),
    }),
    z.object({
        kind: z.literal("group"),
        ...commonSchema,
        purpose: z.string().min(1),
    }),
]);

export const edgeDataSchema = z.object({
    schema: z.string().min(1),
    trigger: z.enum(["event", "fetch", "mutation", "navigation", "sync"]),
    notes: z.string().optional(),
});

export const NODE_DEFINITIONS: Record<ArchitectureNodeKind, PaletteItem> = {
    page: {
        kind: "page",
        title: "Page",
        summary: "Route entrypoint with render mode, layout and visual composition.",
        accent: "#80ed99",
    },
    component: {
        kind: "component",
        title: "UI Component",
        summary: "Reusable UI block with props and client-side dependencies.",
        accent: "#f4d35e",
    },
    database: {
        kind: "database",
        title: "Database Model",
        summary: "Persistent data schema with fields, indexes and relations.",
        accent: "#4cc9f0",
    },
    api: {
        kind: "api",
        title: "API Route",
        summary: "Backend endpoint exposing typed input and output contracts.",
        accent: "#ff9f1c",
    },
    serverAction: {
        kind: "serverAction",
        title: "Server Action",
        summary: "Next.js mutation or secure server-side interaction.",
        accent: "#ff6b6b",
    },
    externalApi: {
        kind: "externalApi",
        title: "External API",
        summary: "Third-party dependency such as payments, auth or messaging.",
        accent: "#c77dff",
    },
    stateStore: {
        kind: "stateStore",
        title: "State Store",
        summary: "Client state container modeled as a first-class architecture node.",
        accent: "#64dfdf",
    },
    group: {
        kind: "group",
        title: "Group",
        summary: "Logical boundary for domains, flows or bounded contexts.",
        accent: "#94a3b8",
    },
};

export function createDefaultNodeData(kind: ArchitectureNodeKind): ArchitectureNodeData {
    switch (kind) {
        case "page":
            return architectureNodeSchema.parse({
                kind,
                label: "New Page",
                description: "Route entrypoint and UI composition root.",
                route: "/new-page",
                renderMode: "csr",
                layout: "stack",
                connectedComponentIds: [],
                builderTree: DEFAULT_PAGE_BUILDER_TREE,
            });
        case "component":
            return architectureNodeSchema.parse({
                kind,
                label: "New Component",
                description: "Reusable presentation or interaction unit.",
                componentType: "Card",
                propsSchema: {
                    title: "string",
                    description: "string",
                },
                stateDependencies: [],
            });
        case "database":
            return architectureNodeSchema.parse({
                kind,
                label: "New Model",
                description: "Persistent model definition.",
                modelName: "Entity",
                fields: [
                    { name: "id", type: "string", required: true, unique: true },
                    { name: "createdAt", type: "Date", required: true },
                ],
                indexes: ["id"],
                relations: [],
            });
        case "api":
            return architectureNodeSchema.parse({
                kind,
                label: "New API",
                description: "Backend endpoint for data access.",
                method: "GET",
                route: "/api/resource",
                inputSchema: "{ query?: string }",
                outputSchema: "{ items: Resource[] }",
            });
        case "serverAction":
            return architectureNodeSchema.parse({
                kind,
                label: "New Action",
                description: "Server-side mutation handler.",
                actionName: "submitAction",
                inputData: "{ formData: FormData }",
                mutationLogic: "Validate payload, persist changes, revalidate path.",
                databaseDependencies: [],
            });
        case "externalApi":
            return architectureNodeSchema.parse({
                kind,
                label: "External Service",
                description: "Third-party dependency.",
                serviceName: "Stripe",
                baseUrl: "https://api.example.com",
                authStrategy: "Bearer token",
            });
        case "stateStore":
            return architectureNodeSchema.parse({
                kind,
                label: "App Store",
                description: "Client state slice.",
                storeName: "appStore",
                stateShape: {
                    status: "idle | loading | success | error",
                },
                persistence: false,
            });
        case "group":
            return architectureNodeSchema.parse({
                kind,
                label: "Domain Group",
                description: "Visual grouping for related capabilities.",
                purpose: "Group related nodes by bounded context or workflow.",
            });
    }
}