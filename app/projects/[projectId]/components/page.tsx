import { ComponentEditorLayout } from "@/src/features/component-library/components/ComponentEditorLayout";

interface ComponentEditorPageProps {
    params: Promise<{
        projectId: string;
    }>;
}

export default async function ComponentEditorPage({ params }: ComponentEditorPageProps) {
    const { projectId } = await params;

    return <ComponentEditorLayout projectId={projectId} />;
}