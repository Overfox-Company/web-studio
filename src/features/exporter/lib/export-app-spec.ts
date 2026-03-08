import type { ApplicationSpecification, ProjectFileSpecification } from "@/src/types/app-spec";
import type {
    ApiNodeData,
    ArchitectureEdge,
    ArchitectureNode,
    ComponentNodeData,
    DatabaseNodeData,
    ExternalApiNodeData,
    PageNodeData,
    ServerActionNodeData,
    StateStoreNodeData,
} from "@/src/types/editor";

function isPageNode(node: ArchitectureNode): node is ArchitectureNode & { data: PageNodeData } {
    return node.data.kind === "page";
}

function isComponentNode(node: ArchitectureNode): node is ArchitectureNode & { data: ComponentNodeData } {
    return node.data.kind === "component";
}

function isDatabaseNode(node: ArchitectureNode): node is ArchitectureNode & { data: DatabaseNodeData } {
    return node.data.kind === "database";
}

function isApiNode(node: ArchitectureNode): node is ArchitectureNode & { data: ApiNodeData } {
    return node.data.kind === "api";
}

function isServerActionNode(node: ArchitectureNode): node is ArchitectureNode & { data: ServerActionNodeData } {
    return node.data.kind === "serverAction";
}

function isExternalApiNode(node: ArchitectureNode): node is ArchitectureNode & { data: ExternalApiNodeData } {
    return node.data.kind === "externalApi";
}

function isStateStoreNode(node: ArchitectureNode): node is ArchitectureNode & { data: StateStoreNodeData } {
    return node.data.kind === "stateStore";
}

function buildProjectStructure(nodes: ArchitectureNode[]): ProjectFileSpecification[] {
    const files: ProjectFileSpecification[] = [
        {
            path: "/app/layout.tsx",
            purpose: "Global layout shell and providers.",
        },
        {
            path: "/src/store/editor-store.ts",
            purpose: "Editor state and graph mutations.",
        },
    ];

    nodes.forEach((node) => {
        switch (node.data.kind) {
            case "page":
                files.push({
                    path: `/app${node.data.route === "/" ? "" : node.data.route}/page.tsx`,
                    purpose: `Generated page for ${node.data.label}.`,
                });
                break;
            case "component":
                files.push({
                    path: `/components/${node.data.label.replace(/\s+/g, "")}.tsx`,
                    purpose: `Reusable component for ${node.data.label}.`,
                });
                break;
            case "database":
                files.push({
                    path: `/models/${node.data.modelName}.ts`,
                    purpose: `Data model definition for ${node.data.modelName}.`,
                });
                break;
            case "api":
                files.push({
                    path: `/app${node.data.route}/route.ts`,
                    purpose: `${node.data.method} endpoint for ${node.data.label}.`,
                });
                break;
            case "serverAction":
                files.push({
                    path: `/app/actions/${node.data.actionName}.ts`,
                    purpose: `Server action for ${node.data.actionName}.`,
                });
                break;
            case "stateStore":
                files.push({
                    path: `/store/${node.data.storeName}.ts`,
                    purpose: `Client state store for ${node.data.storeName}.`,
                });
                break;
            default:
                break;
        }
    });

    return files;
}

interface ExportApplicationSpecOptions {
    generatedAt?: string;
}

export function exportApplicationSpec(
    nodes: ArchitectureNode[],
    edges: ArchitectureEdge[],
    options?: ExportApplicationSpecOptions,
): ApplicationSpecification {
    const pageNodes = nodes.filter(isPageNode);

    return {
        meta: {
            name: "Web Studio Visual Spec",
            generatedAt: options?.generatedAt ?? new Date().toISOString(),
            version: "0.1.0",
        },
        pages: pageNodes
            .map((node) => ({
                id: node.id,
                name: node.data.label,
                route: node.data.route,
                render: node.data.renderMode,
                layout: node.data.layout,
                components: node.data.connectedComponentIds,
                navigationTargets: edges
                    .filter((edge) => edge.source === node.id && edge.data?.trigger === "navigation")
                    .map((edge) => pageNodes.find((targetNode) => targetNode.id === edge.target))
                    .filter((targetNode): targetNode is (typeof pageNodes)[number] => Boolean(targetNode))
                    .map((targetNode) => ({
                        pageId: targetNode.id,
                        name: targetNode.data.label,
                        route: targetNode.data.route,
                    })),
                builderTree: node.data.builderTree,
            })),
        components: nodes
            .filter(isComponentNode)
            .map((node) => ({
                id: node.id,
                name: node.data.label,
                componentType: node.data.componentType,
                props: node.data.propsSchema,
                stateDependencies: node.data.stateDependencies,
            })),
        database: nodes
            .filter(isDatabaseNode)
            .map((node) => ({
                id: node.id,
                model: node.data.modelName,
                fields: node.data.fields,
                indexes: node.data.indexes,
                relations: node.data.relations,
            })),
        apis: nodes
            .filter(isApiNode)
            .map((node) => ({
                id: node.id,
                method: node.data.method,
                route: node.data.route,
                inputSchema: node.data.inputSchema,
                outputSchema: node.data.outputSchema,
            })),
        actions: nodes
            .filter(isServerActionNode)
            .map((node) => ({
                id: node.id,
                name: node.data.actionName,
                inputData: node.data.inputData,
                mutationLogic: node.data.mutationLogic,
                databaseDependencies: node.data.databaseDependencies,
            })),
        externalApis: nodes
            .filter(isExternalApiNode)
            .map((node) => ({
                id: node.id,
                serviceName: node.data.serviceName,
                baseUrl: node.data.baseUrl,
                authStrategy: node.data.authStrategy,
            })),
        stateStores: nodes
            .filter(isStateStoreNode)
            .map((node) => ({
                id: node.id,
                name: node.data.storeName,
                stateShape: node.data.stateShape,
                persistence: node.data.persistence,
            })),
        dataFlow: edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            schema: edge.data?.schema ?? "unknown",
            trigger: edge.data?.trigger ?? "sync",
            notes: edge.data?.notes,
        })),
        projectStructure: buildProjectStructure(nodes),
    };
}