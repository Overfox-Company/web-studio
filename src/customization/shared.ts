import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";

type Sx = SxProps<Theme>;

export const sharedCustomization = {
    fonts: {
        mono: '"IBM Plex Mono", monospace',
    },
    text: {
        primary: "#ffffff",
        secondary: "#adbbd7",
        muted: "#98a2b3",
        strong: "#334155",
        onDark: "#e2e8f0",
        mutedOnDark: "#94a3b8",
        subtleOnDark: "#64748b",
    },
    border: {
        subtle: "rgba(148, 163, 184, 0.12)",
        muted: "rgba(148, 163, 184, 0.18)",
        strong: "rgba(148, 163, 184, 0.24)",
        light: "rgba(255, 255, 255, 0.72)",
    },
    radius: {
        xs: "4px",
        sm: "6px",
        md: "10px",
        lg: "12px",
        xl: "14px",
        xxl: "16px",
        xxxl: "20px",
        huge: "24px",
        pill: "999px",
    },
    shadow: {
        sm: "0 10px 24px rgba(15, 23, 42, 0.08)",
        md: "0 14px 30px rgba(15, 23, 42, 0.07)",
        lg: "0 18px 36px rgba(15, 23, 42, 0.08)",
        xl: "0 20px 40px rgba(15, 23, 42, 0.12)",
    },
    transition: {
        fast: "140ms ease",
        standard: "180ms ease",
        emphasis: "240ms cubic-bezier(0.22, 1, 0.36, 1)",
    },
    fullHeight: {
        minHeight: 0,
        height: "100%",
    } as Sx,
    screenHeight: "100vh",
};