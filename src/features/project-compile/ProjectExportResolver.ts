import { createDefaultDesignDocument } from "@/src/features/design-editor/utils/create-design-document";
import type { ProjectEditorState } from "@/src/features/project-editor/types/editor.types";
import {
    getPageNodeDesignDocument,
    getPageNodeName,
    slugifyProjectPageName,
} from "@/src/features/project-editor/utils/page-nodes";
import { validateCompileProject } from "@/src/features/project-compile/CompileValidator";
import type { CompileIssue, ResolvedExportPage } from "@/src/features/project-compile/types/compile.types";

export interface ProjectExportResolution {
    pages: ResolvedExportPage[];
    warnings: CompileIssue[];
    errors: CompileIssue[];
}

export function resolveProjectExport(project: ProjectEditorState): ProjectExportResolution {
    const validation = validateCompileProject(project);

    if (validation.errors.length > 0 || !validation.entryPageId) {
        return {
            pages: [],
            warnings: validation.warnings,
            errors: validation.errors,
        };
    }

    const usedFileNames = new Set<string>(["index.html"]);
    const warnings = [...validation.warnings];
    const pages: ResolvedExportPage[] = [];

    for (const page of validation.pages) {
        const isEntry = page.id === validation.entryPageId;
        const normalizedSlug = slugifyProjectPageName(page.data.slug || page.name);
        const baseName = normalizedSlug === "index" && !isEntry ? "index-page" : normalizedSlug;
        let fileName = isEntry ? "index.html" : `${baseName}.html`;
        let collisionCounter = 2;

        while (!isEntry && usedFileNames.has(fileName)) {
            fileName = `${baseName}-${collisionCounter}.html`;
            collisionCounter += 1;
        }

        if (!isEntry && fileName !== `${baseName}.html`) {
            warnings.push({
                severity: "warning",
                code: "page-file-collision",
                pageId: page.id,
                message: `Page "${page.name}" generated a colliding file name. It will be exported as "${fileName}".`,
            });
        }

        usedFileNames.add(fileName);

        pages.push({
            page,
            document: getPageNodeDesignDocument(page) ?? createDefaultDesignDocument({
                viewNodeId: page.id,
                viewName: page.name,
            }),
            fileName,
            normalizedSlug,
            title: getPageNodeName(page),
            isEntry,
        });
    }

    return {
        pages,
        warnings,
        errors: [],
    };
}