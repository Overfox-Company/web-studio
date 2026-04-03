import type { LibraryComponent } from "@/src/features/component-library/types/component.types";
import { normalizeProjectState } from "@/src/features/project-editor/utils/normalize-project-state";
import { slugifyProjectPageName } from "@/src/features/project-editor/utils/page-nodes";
import { exportProjectAssets } from "@/src/features/project-compile/AssetExporter";
import { compileProjectCss } from "@/src/features/project-compile/CssCompiler";
import { compileProjectHtml } from "@/src/features/project-compile/HtmlCompiler";
import { resolveProjectExport } from "@/src/features/project-compile/ProjectExportResolver";
import type { CompileIssue, StaticProjectCompileOutput } from "@/src/features/project-compile/types/compile.types";
import type { ProjectEditorState } from "@/src/features/project-editor/types/editor.types";

export class StaticCompileError extends Error {
    issues: CompileIssue[];

    constructor(message: string, issues: CompileIssue[]) {
        super(message);
        this.name = "StaticCompileError";
        this.issues = issues;
    }
}

export function compileProjectToStaticExport(
    projectSnapshot: ProjectEditorState,
    options?: { libraryComponentsById?: Record<string, LibraryComponent> },
): StaticProjectCompileOutput {
    const project = normalizeProjectState(projectSnapshot);
    const resolution = resolveProjectExport(project);

    if (resolution.errors.length > 0) {
        throw new StaticCompileError("The project could not be compiled.", resolution.errors);
    }

    const assets = exportProjectAssets(resolution.pages);
    const libraryComponentsById = options?.libraryComponentsById ?? {};
    const css = compileProjectCss(resolution.pages, libraryComponentsById);
    const htmlFiles = compileProjectHtml(resolution.pages, assets.imageSrcByNodeId, libraryComponentsById);
    const projectSlug = slugifyProjectPageName(project.name || "project");

    return {
        project,
        rootFolderName: projectSlug,
        downloadFileName: `${projectSlug}-static-export.zip`,
        files: [
            ...htmlFiles,
            {
                path: "assets/styles.css",
                content: css,
            },
            ...assets.assets.map((asset) => ({
                path: asset.path,
                content: asset.content,
            })),
        ],
        warnings: [...resolution.warnings, ...assets.warnings],
    };
}