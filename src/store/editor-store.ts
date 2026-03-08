import { MarkerType, addEdge, applyEdgeChanges, applyNodeChanges, type Connection, type EdgeChange, type NodeChange } from "@xyflow/react";
import { nanoid } from "nanoid";
import { create } from "zustand";

import { exportApplicationSpec } from "@/src/features/exporter/lib/export-app-spec";
import { getDefaultTrigger, validateConnection } from "@/src/features/nodes/config/connection-rules";
import { architectureNodeSchema, createDefaultNodeData, edgeDataSchema } from "@/src/features/nodes/config/node-definitions";
import type { ApplicationSpecification } from "@/src/types/app-spec";
import type { ArchitectureEdge, ArchitectureNode, ArchitectureNodeData, ArchitectureNodeKind, PageNodeData } from "@/src/types/editor";

interface EditorState {
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
    pageRoutes: string[];
    selectedNodeId: string | null;
    activePageEditorId: string | null;
    lastValidationError: string | null;
    addNode: (kind: ArchitectureNodeKind, position: { x: number; y: number }) => void;
    onNodesChange: (changes: NodeChange<ArchitectureNode>[]) => void;
    onEdgesChange: (changes: EdgeChange<ArchitectureEdge>[]) => void;
    onConnect: (connection: Connection) => void;
    updateNodeData: (nodeId: string, updates: Partial<ArchitectureNodeData>) => void;
    setSelectedNodeId: (nodeId: string | null) => void;
    openPageEditor: (pageId: string) => void;
    closePageEditor: () => void;
    clearValidationError: () => void;
    exportSpec: () => ApplicationSpecification;
}

function isPageNode(node: ArchitectureNode): node is ArchitectureNode & { data: PageNodeData } {
    return node.data.kind === "page";
}

function slugifySegment(value: string) {
    const slug = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return slug || "page";
}

function normalizeRoute(route: string) {
    const segments = route.split("/").filter(Boolean).map(slugifySegment);

    if (segments.length === 0) {
        return "/";
    }

    return `/${segments.join("/")}`;
}

function joinRoute(parentRoute: string, childSegment: string) {
    const normalizedSegment = slugifySegment(childSegment);

    if (parentRoute === "/") {
        return `/${normalizedSegment}`;
    }

    return `${parentRoute}/${normalizedSegment}`;
}

function getRouteLeafSegment(node: ArchitectureNode & { data: PageNodeData }) {
    const segments = node.data.route.split("/").filter(Boolean);
    const lastSegment = segments.at(-1);

    return slugifySegment(lastSegment ?? node.data.label);
}

function ensureUniqueLabel(baseLabel: string, nodes: ArchitectureNode[], excludeNodeId?: string) {
    const usedLabels = new Set(
        nodes
            .filter(isPageNode)
            .filter((node) => node.id !== excludeNodeId)
            .map((node) => node.data.label.toLowerCase()),
    );

    if (!usedLabels.has(baseLabel.toLowerCase())) {
        return baseLabel;
    }

    let index = 1;
    while (usedLabels.has(`${baseLabel} ${index}`.toLowerCase())) {
        index += 1;
    }

    return `${baseLabel} ${index}`;
}

function ensureUniqueRoute(candidateRoute: string, usedRoutes: Set<string>) {
    const normalizedRoute = normalizeRoute(candidateRoute);

    if (!usedRoutes.has(normalizedRoute)) {
        return normalizedRoute;
    }

    const segments = normalizedRoute.split("/").filter(Boolean);
    const baseSegment = segments.pop() ?? "page";
    const prefix = segments.length > 0 ? `/${segments.join("/")}` : "";

    let index = 1;
    let nextRoute = `${prefix}/${baseSegment}-${index}`;

    while (usedRoutes.has(nextRoute)) {
        index += 1;
        nextRoute = `${prefix}/${baseSegment}-${index}`;
    }

    return nextRoute;
}

function syncPageRoutes(nodes: ArchitectureNode[], edges: ArchitectureEdge[]) {
    const pageNodes = nodes.filter(isPageNode);
    const pageNodeMap = new Map(pageNodes.map((node) => [node.id, node]));
    const navigationEdges = edges.filter(
        (edge) =>
            edge.data?.trigger === "navigation" &&
            pageNodeMap.has(edge.source) &&
            pageNodeMap.has(edge.target),
    );

    const childrenByParent = new Map<string, string[]>();
    const parentByChild = new Map<string, string>();

    navigationEdges.forEach((edge) => {
        childrenByParent.set(edge.source, [...(childrenByParent.get(edge.source) ?? []), edge.target]);

        if (!parentByChild.has(edge.target)) {
            parentByChild.set(edge.target, edge.source);
        }
    });

    const usedRoutes = new Set<string>();
    const resolvedRoutes = new Map<string, string>();

    function assignRoute(nodeId: string, parentRoute?: string) {
        if (resolvedRoutes.has(nodeId)) {
            return;
        }

        const node = pageNodeMap.get(nodeId);

        if (!node) {
            return;
        }

        const candidateRoute = parentRoute
            ? joinRoute(parentRoute, getRouteLeafSegment(node))
            : normalizeRoute(node.data.route);
        const uniqueRoute = ensureUniqueRoute(candidateRoute, usedRoutes);

        usedRoutes.add(uniqueRoute);
        resolvedRoutes.set(nodeId, uniqueRoute);

        (childrenByParent.get(nodeId) ?? []).forEach((childId) => assignRoute(childId, uniqueRoute));
    }

    pageNodes
        .filter((node) => !parentByChild.has(node.id))
        .forEach((node) => assignRoute(node.id));

    pageNodes.forEach((node) => assignRoute(node.id));

    const nextNodes = nodes.map((node) => {
        if (!isPageNode(node)) {
            return node;
        }

        const resolvedRoute = resolvedRoutes.get(node.id) ?? normalizeRoute(node.data.route);

        if (resolvedRoute === node.data.route) {
            return node;
        }

        return {
            ...node,
            data: architectureNodeSchema.parse({
                ...node.data,
                route: resolvedRoute,
            }),
        };
    });

    return {
        nodes: nextNodes,
        pageRoutes: nextNodes.filter(isPageNode).map((node) => node.data.route),
    };
}

function createNode(kind: ArchitectureNodeKind, position: { x: number; y: number }, overrides?: Partial<ArchitectureNodeData>): ArchitectureNode {
    const data = architectureNodeSchema.parse({
        ...createDefaultNodeData(kind),
        ...overrides,
    });

    return {
        id: nanoid(),
        type: "architectureNode",
        position,
        data,
        style:
            kind === "group"
                ? {
                    width: 440,
                    height: 280,
                }
                : undefined,
    };
}

export const useEditorStore = create<EditorState>((set, get) => ({
    nodes: [],
    edges: [],
    pageRoutes: [],
    selectedNodeId: null,
    activePageEditorId: null,
    lastValidationError: null,
    addNode: (kind, position) => {
        const existingNodes = get().nodes;
        const node =
            kind === "page"
                ? createNode(kind, position, {
                    label: ensureUniqueLabel("New Page", existingNodes),
                    route: ensureUniqueRoute("/new-page", new Set(get().pageRoutes)),
                })
                : createNode(kind, position);

        set((state) => ({
            ...syncPageRoutes([...state.nodes, node], state.edges),
            selectedNodeId: node.id,
            lastValidationError: null,
        }));
    },
    onNodesChange: (changes) => {
        set((state) => ({
            ...syncPageRoutes(applyNodeChanges(changes, state.nodes), state.edges),
        }));
    },
    onEdgesChange: (changes) => {
        set((state) => {
            const nextEdges = applyEdgeChanges(changes, state.edges);

            return {
                edges: nextEdges,
                ...syncPageRoutes(state.nodes, nextEdges),
            };
        });
    },
    onConnect: (connection) => {
        const { nodes, edges } = get();
        const sourceNode = nodes.find((node) => node.id === connection.source);
        const targetNode = nodes.find((node) => node.id === connection.target);
        const validation = validateConnection(sourceNode, targetNode, edges);

        if (!validation.ok) {
            set({ lastValidationError: validation.reason });
            return;
        }

        const trigger = getDefaultTrigger(connection, nodes);
        const isPageNavigation = sourceNode?.data.kind === "page" && targetNode?.data.kind === "page";

        const edge: ArchitectureEdge = {
            id: nanoid(),
            source: connection.source ?? "",
            target: connection.target ?? "",
            type: "smoothstep",
            animated: !isPageNavigation,
            markerEnd: isPageNavigation
                ? {
                    type: MarkerType.ArrowClosed,
                    width: 18,
                    height: 18,
                    color: "#80ed99",
                }
                : undefined,
            style: isPageNavigation
                ? {
                    stroke: "#80ed99",
                    strokeWidth: 2.25,
                }
                : undefined,
            data: edgeDataSchema.parse({
                schema: isPageNavigation
                    ? `navigate:${targetNode?.data.kind === "page" ? targetNode.data.route : targetNode?.data.label ?? "target"}`
                    : `${sourceNode?.data.label ?? "Source"} -> ${targetNode?.data.label ?? "Target"}`,
                trigger,
                notes: isPageNavigation
                    ? `Navigate from ${sourceNode?.data.label ?? "source page"} to ${targetNode?.data.label ?? "target page"}.`
                    : undefined,
            }),
        };

        const nextEdges = addEdge(edge, edges);

        set({
            edges: nextEdges,
            ...syncPageRoutes(nodes, nextEdges),
            lastValidationError: null,
        });
    },
    updateNodeData: (nodeId, updates) => {
        set((state) => {
            const nextNodes = state.nodes.map((node) => {
                if (node.id !== nodeId) {
                    return node;
                }

                const nextData = { ...node.data, ...updates };

                if (node.data.kind === "page") {
                    if (typeof nextData.label === "string") {
                        nextData.label = ensureUniqueLabel(nextData.label, state.nodes, nodeId);
                    }

                    if (typeof nextData.route === "string") {
                        nextData.route = normalizeRoute(nextData.route);
                    }
                }

                const hasChanges = Object.entries(nextData).some(([key, value]) => node.data[key] !== value);

                if (!hasChanges) {
                    return node;
                }

                return {
                    ...node,
                    data: architectureNodeSchema.parse(nextData),
                };
            });

            return {
                ...syncPageRoutes(nextNodes, state.edges),
                lastValidationError: null,
            };
        });
    },
    setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
    openPageEditor: (pageId) => set({ activePageEditorId: pageId, selectedNodeId: pageId }),
    closePageEditor: () => set({ activePageEditorId: null }),
    clearValidationError: () => set({ lastValidationError: null }),
    exportSpec: () => exportApplicationSpec(get().nodes, get().edges),
}));