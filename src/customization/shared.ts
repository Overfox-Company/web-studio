import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";

type Sx = SxProps<Theme>;

export const sharedCustomization = {
    fonts: {
        mono: "var(--font-ibm-plex-mono)",
    },
    text: {
        primary: "var(--ws-text-primary)",
        secondary: "var(--ws-text-secondary)",
        muted: "var(--ws-text-muted)",
        strong: "var(--ws-text-strong)",
        onDark: "var(--ws-text-on-dark)",
        mutedOnDark: "var(--ws-text-muted-on-dark)",
        subtleOnDark: "var(--ws-text-subtle-on-dark)",
    },
    border: {
        subtle: "var(--ws-border-subtle)",
        muted: "var(--ws-border-muted)",
        strong: "var(--ws-border-strong)",
        light: "var(--ws-border-light)",
    },
    radius: {
        xs: "var(--ws-radius-xs)",
        sm: "var(--ws-radius-sm)",
        md: "var(--ws-radius-md)",
        lg: "var(--ws-radius-lg)",
        xl: "var(--ws-radius-xl)",
        xxl: "var(--ws-radius-2xl)",
        xxxl: "var(--ws-radius-3xl)",
        huge: "var(--ws-radius-4xl)",
        pill: "var(--ws-radius-pill)",
    },
    shadow: {
        sm: "var(--ws-shadow-sm)",
        md: "var(--ws-shadow-md)",
        lg: "var(--ws-shadow-lg)",
        xl: "var(--ws-shadow-xl)",
    },
    transition: {
        fast: "var(--ws-transition-fast)",
        standard: "var(--ws-transition-standard)",
        emphasis: "var(--ws-transition-emphasis)",
    },
    fullHeight: {
        minHeight: 0,
        height: "100%",
    } as Sx,
    screenHeight: "100vh",
};