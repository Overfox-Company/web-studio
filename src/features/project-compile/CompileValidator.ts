import type { PageNode, ProjectEditorState } from "@/src/features/project-editor/types/editor.types";
import { isPageNode, slugifyProjectPageName } from "@/src/features/project-editor/utils/page-nodes";
import type { CompileIssue } from "@/src/features/project-compile/types/compile.types";

export interface CompileValidationResult {
    pages: PageNode[];
    entryPageId: string | null;
    errors: CompileIssue[];
    warnings: CompileIssue[];
}

export function validateCompileProject(project: ProjectEditorState): CompileValidationResult {
    const pages = project.nodes.filter(isPageNode);
    const errors: CompileIssue[] = [];
    const warnings: CompileIssue[] = [];

    if (pages.length === 0) {
        errors.push({
            severity: "error",
            code: "no-pages",
            message: "The project has no exportable pages. Add at least one Page node before compiling.",
        });

        return {
            pages,
            entryPageId: null,
            errors,
            warnings,
        };
    }

    const indexPages = pages.filter((page) => page.data.index);

    if (indexPages.length > 1) {
        errors.push({
            severity: "error",
            code: "multiple-entry-pages",
            message: `Only one page can be marked as entry. Found ${indexPages.length} pages with index=true.`,
        });
    }

    for (const page of pages) {
        const normalizedSlug = slugifyProjectPageName(page.data.slug || page.name);

        if (!page.data.slug.trim()) {
            warnings.push({
                severity: "warning",
                code: "empty-page-slug",
                pageId: page.id,
                message: `Page "${page.name}" has an empty slug. The compiler will use "${normalizedSlug}".`,
            });
        }

        if (normalizedSlug !== page.data.slug) {
            warnings.push({
                severity: "warning",
                code: "normalized-page-slug",
                pageId: page.id,
                message: `Page "${page.name}" slug was normalized from "${page.data.slug}" to "${normalizedSlug}" for export.`,
            });
        }
    }

    if (errors.length > 0) {
        return {
            pages,
            entryPageId: null,
            errors,
            warnings,
        };
    }

    const entryPageId = indexPages[0]?.id ?? pages[0]?.id ?? null;

    if (!indexPages[0] && pages[0]) {
        warnings.push({
            severity: "warning",
            code: "missing-entry-page",
            pageId: pages[0].id,
            message: `No page was marked as entry. "${pages[0].name}" will be exported as index.html.`,
        });
    }

    return {
        pages,
        entryPageId,
        errors,
        warnings,
    };
}