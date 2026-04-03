import { EditorLayout } from "@/src/features/project-editor/components/EditorLayout";

interface ProjectEditorPageProps {
    params: Promise<{
        projectId: string;
    }>;
}

function formatProjectName(projectId: string) {
    return projectId
        .split(/[-_]/g)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ") || "Project Atlas";
}

export default async function ProjectEditorPage({ params }: ProjectEditorPageProps) {
    const { projectId } = await params;

    return <EditorLayout projectId={projectId} initialName={formatProjectName(projectId)} />;
}
