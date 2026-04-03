import { DesignEditorLayout } from "@/src/features/design-editor/components/DesignEditorLayout";

interface DesignViewEditorPageProps {
    params: Promise<{
        projectId: string;
        viewId: string;
    }>;
}

export default async function DesignViewEditorPage({ params }: DesignViewEditorPageProps) {
    const { projectId, viewId } = await params;

    return <DesignEditorLayout projectId={projectId} viewId={viewId} />;
}