"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import { UiAppThemeRoot, UiCssBaseline } from "@/src/components/ui-kit";
import { appTheme } from "@/src/lib/theme";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider>
            <UiAppThemeRoot theme={appTheme}>
                <UiCssBaseline />
                {children}
            </UiAppThemeRoot>
        </AppRouterCacheProvider>
    );
}