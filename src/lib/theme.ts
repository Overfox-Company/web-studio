import { alpha, createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#8ea6ff",
            light: "#b9c7ff",
        },
        secondary: {
            main: "#4cc9f0",
        },
        background: {
            default: "#0a0c12",
            paper: "#11141b",
        },
        text: {
            primary: "#f5f7fb",
            secondary: "rgba(220, 226, 238, 0.66)",
        },
        divider: "rgba(255,255,255,0.08)",
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: "var(--font-space-grotesk)",
        h3: {
            fontWeight: 700,
            letterSpacing: "-0.05em",
        },
        button: {
            textTransform: "none",
            fontWeight: 700,
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    backgroundColor: "#11141b",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    paddingInline: 16,
                    minHeight: 38,
                    boxShadow: "none",
                },
                contained: {
                    backgroundColor: "#f5f7fb",
                    color: "#080a0f",
                    "&:hover": {
                        backgroundColor: "#ffffff",
                        boxShadow: "none",
                    },
                },
                outlined: {
                    borderColor: "rgba(255,255,255,0.12)",
                    color: "#f5f7fb",
                    "&:hover": {
                        borderColor: "rgba(255,255,255,0.2)",
                        backgroundColor: "rgba(255,255,255,0.03)",
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "#141922",
                    color: "#dbe2ef",
                    fontWeight: 600,
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    backgroundColor: "#0f131a",
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.1)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.16)",
                    },
                    "&.Mui-focused": {
                        boxShadow: `0 0 0 2px ${alpha("#8ea6ff", 0.14)}`,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: alpha("#8ea6ff", 0.72),
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "rgba(220, 226, 238, 0.6)",
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: "small",
                fullWidth: true,
            },
        },
        MuiFormControlLabel: {
            styleOverrides: {
                label: {
                    color: "rgba(220, 226, 238, 0.82)",
                    fontSize: 14,
                },
            },
        },
    },
});