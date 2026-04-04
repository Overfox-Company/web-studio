import { alpha, createTheme } from "@mui/material/styles";

export const projectEditorTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#92DA70",
        },
        secondary: {
            main: "#cbdd6c",
        },
        background: {
            default: "#111116",
            paper: "#161618",
        },
        text: {
            primary: "#ffffff",
            secondary: "#adbbd7",
        },
        divider: "rgba(255, 255, 255, 0.1)",
        success: {
            main: "#25c657",
        },
        warning: {
            main: "#cbdd6c",
        },
        error: {
            main: "#d64178",
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
                    colorScheme: "dark",
                },
                body: {
                    backgroundColor: "#111116",
                    color: "#ffffff",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    backgroundColor: "#161618",
                    color: "#ffffff",
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
                    background: "linear-gradient(180deg, #92DA70 0%, #79C655 100%)",
                    color: "#0d1408",
                    "&:hover": {
                        background: "linear-gradient(180deg, #A2E481 0%, #86CF61 100%)",
                    },
                },
                outlined: {
                    borderColor: "transparent",
                    color: "#ffffff",
                    "&:hover": {
                        borderColor: "transparent",
                        background: "rgba(146, 218, 112, 0.08)",
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
                    backgroundColor: "rgba(36, 35, 38, 0.94)",
                    transition: "box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease",
                    ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "transparent",
                    },
                    "&.Mui-focused": {
                        backgroundColor: "rgba(44, 43, 47, 0.98)",
                        boxShadow: `0 0 0 4px ${alpha("#92DA70", 0.18)}`,
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
                    "&:hover": {
                        backgroundColor: "rgba(146, 218, 112, 0.1)",
                    },
                },
            },
        },
    },
});
