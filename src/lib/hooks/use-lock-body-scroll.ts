"use client";

import { useEffect } from "react";

export function useLockBodyScroll() {
    useEffect(() => {
        const { body, documentElement } = document;
        const previousBodyOverflow = body.style.overflow;
        const previousBodyOverscrollBehavior = body.style.overscrollBehavior;
        const previousHtmlOverflow = documentElement.style.overflow;
        const previousHtmlOverscrollBehavior = documentElement.style.overscrollBehavior;

        body.style.overflow = "hidden";
        body.style.overscrollBehavior = "none";
        documentElement.style.overflow = "hidden";
        documentElement.style.overscrollBehavior = "none";

        return () => {
            body.style.overflow = previousBodyOverflow;
            body.style.overscrollBehavior = previousBodyOverscrollBehavior;
            documentElement.style.overflow = previousHtmlOverflow;
            documentElement.style.overscrollBehavior = previousHtmlOverscrollBehavior;
        };
    }, []);
}