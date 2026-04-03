import { exportedProjectSpecSchema } from "@/src/features/project-editor/schema/project.schema";
import { NODE_VISUALS } from "@/src/features/project-editor/utils/node-colors";
import type {
    ActionNode,
    ApiNode,
    DatabaseNode,
    ExportedProjectSpec,
    LegacyViewNode,
    PageNode,
    ProjectEditorState,
} from "@/src/features/project-editor/types/editor.types";

export function exportProjectJson(state: ProjectEditorState): ExportedProjectSpec {
    const pages = state.nodes.filter((node): node is PageNode => node.kind === "page");
    const legacyViews = state.nodes.filter((node): node is LegacyViewNode => node.kind === "view");
    const apis = state.nodes.filter((node): node is ApiNode => node.kind === "api");
    const databases = state.nodes.filter((node): node is DatabaseNode => node.kind === "database");
    const actions = state.nodes.filter((node): node is ActionNode => node.kind === "action");

    return exportedProjectSpecSchema.parse({
        project: {
            id: state.projectId,
            name: state.name,
            version: state.version,
            updatedAt: state.updatedAt,
        },
        architecture: {
            nodes: state.nodes,
            relations: state.edges,
        },
        design: {
            colors: Object.values(NODE_VISUALS).map((token) => token.accent),
            fonts: ["IBM Plex Sans", "IBM Plex Mono"],
            components: [],
        },
        data: {
            databases,
            apis,
            actions,
            pages,
            legacyViews,
        },
    });
}
