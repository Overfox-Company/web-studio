"use client";

import { useSyncExternalStore } from "react";

import { AppBuilder } from "@/src/components/workspace/app-builder";

function subscribe() {
    return () => undefined;
}

export function AppBuilderRoot() {
    const isMounted = useSyncExternalStore(subscribe, () => true, () => false);

    if (!isMounted) {
        return null;
    }

    return <AppBuilder />;
}