import { nanoid } from "nanoid";

import { projectNodeSchema } from "@/src/features/project-editor/schema/node.schema";
import type { ProjectNode, ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";

function createBaseNode(kind: ProjectNodeKind, name: string, description: string, position: { x: number; y: number }) {
    const timestamp = new Date().toISOString();

    return {
        id: nanoid(),
        kind,
        name,
        description,
        position,
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}

export function createNodeDefaults(kind: ProjectNodeKind, position: { x: number; y: number }): ProjectNode {
    switch (kind) {
        case "view":
            return projectNodeSchema.parse({
                ...createBaseNode(kind, "Dashboard View", "Main surface for a user-facing route.", position),
                data: {
                    route: "/dashboard",
                    renderMode: "SSR",
                    layout: "main-shell",
                },
            });
        case "api":
            return projectNodeSchema.parse({
                ...createBaseNode(kind, "Users API", "Backend endpoint for a bounded capability.", position),
                data: {
                    endpoint: "/api/users",
                    method: "GET",
                    authRequired: true,
                },
            });
        case "database":
            return projectNodeSchema.parse({
                ...createBaseNode(kind, "User Store", "Primary persistence model for the feature.", position),
                data: {
                    provider: "postgres",
                    entityName: "User",
                    modelRef: "public.users",
                },
            });
        case "action":
            return projectNodeSchema.parse({
                ...createBaseNode(kind, "Sync Profile", "Executable domain action triggered by the app.", position),
                data: {
                    trigger: "user",
                    target: "users.update-profile",
                },
            });
    }
}

export function touchNode<TNode extends { updatedAt: string }>(node: TNode): TNode {
    return {
        ...node,
        updatedAt: new Date().toISOString(),
    };
}
