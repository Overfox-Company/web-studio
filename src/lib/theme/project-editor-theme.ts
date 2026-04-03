import { alpha, createTheme } from "@mui/material/styles";

export const projectEditorTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#1f2937",
        },
        secondary: {
            main: "#4f7cff",
        },
        background: {
            default: "#eef2f6",
            paper: "#ffffff",
        },
        text: {
            primary: "#111827",
            secondary: "#5b6472",
        },
        divider: "rgba(148, 163, 184, 0.28)",
        success: {
            main: "#2f7d62",
        },
        warning: {
            main: "#b7791f",
        },
        error: {
            main: "#c34a36",
        },
    },
    shape: {
        borderRadius: 6,
    },
    typography: {
        fontFamily: "var(--font-ibm-plex-sans)",
        h1: {
            fontWeight: 700,
            letterSpacing: "-0.06em",
        },
        h2: {
            fontWeight: 700,
            letterSpacing: "-0.05em",
        },
        h3: {
            fontWeight: 700,
            letterSpacing: "-0.04em",
        },
        h4: {
            fontWeight: 700,
            letterSpacing: "-0.03em",
        },
        h5: {
            fontWeight: 600,
            letterSpacing: "-0.03em",
        },
        button: {
            fontWeight: 600,
            textTransform: "none",
            letterSpacing: "-0.01em",
        },
        subtitle2: {
            fontWeight: 600,
        },
        caption: {
            lineHeight: 1.5,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                ":root": {
                    colorScheme: "light",
                },
                body: {
                    backgroundColor: "#eef2f6",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    minHeight: 40,
                    borderRadius: 6,
                    paddingInline: 16,
                },
                contained: {
                    background: "#111827",
                    color: "#f8fafc",
                    "&:hover": {
                        background: "#0f172a",
                    },
                },
                outlined: {
                    borderColor: "rgba(148, 163, 184, 0.3)",
                    color: "#334155",
                    "&:hover": {
                        borderColor: "rgba(100, 116, 139, 0.4)",
                        background: "rgba(255, 255, 255, 0.7)",
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    fontWeight: 600,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: "small",
                fullWidth: true,
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    backgroundColor: "rgba(255,255,255,0.8)",
                    transition: "box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease",
                    ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(148, 163, 184, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(100, 116, 139, 0.45)",
                    },
                    "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        boxShadow: `0 0 0 4px ${alpha("#4f7cff", 0.1)}`,
                    },
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                track: {
                    borderRadius: 8,
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    margin: 4,
                },
            },
        },
    },
});
