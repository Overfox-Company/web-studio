"use client";

import styled from "@emotion/styled";
import {
    Box,
    Button,
    Chip,
    FormControlLabel,
    Paper,
    Stack,
    Switch,
    TextField as MuiTextField,
    Typography,
    type ButtonProps,
    type ChipProps,
    type FormControlLabelProps,
    type PaperProps,
    type TextFieldProps,
} from "@mui/material";

export const Shell = styled(Box)({
    minHeight: "100vh",
    background:
        "radial-gradient(circle at top left, rgba(79, 124, 255, 0.08), transparent 28%), linear-gradient(180deg, #f6f8fb 0%, #eef2f6 100%)",
    color: "#111827",
});

export const EditorPanel = styled(Paper)<PaperProps>({
    borderRadius: 12,
    border: "1px solid rgba(219, 222, 230, 1)",
    backgroundColor: "rgba(255, 255, 255, 1)",
    //   boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
    //  backdropFilter: "blur(14px)",
});

export const EditorSection = styled(Stack)({
    gap: 14,
});

export const EditorSectionTitle = styled(Typography)({
    fontSize: "0.94rem",
    fontWeight: 600,
    color: "#111827",
    letterSpacing: "-0.02em",
});

export const EditorSectionHint = styled(Typography)({
    fontSize: "0.86rem",
    lineHeight: 1.55,
    color: "#667085",
});

export const ToolbarButton = styled(Button)<ButtonProps>({
    minHeight: 38,
    borderRadius: 6,
});

export const StatusBadge = styled(Chip)<ChipProps>({
    height: 30,
    borderRadius: 4,
    fontSize: "0.76rem",
    background: "#f8fafc",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    color: "#475467",
});

export const FieldLabel = styled(Typography)({
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#475467",
    letterSpacing: "0.01em",
});

export const TextField = styled(MuiTextField)<TextFieldProps>({
    ".MuiInputBase-input, .MuiInputBase-inputMultiline": {
        fontSize: "0.92rem",
    },
});

export const SelectField = styled(MuiTextField)<TextFieldProps>({
    ".MuiInputBase-input": {
        fontSize: "0.92rem",
    },
});

export function SwitchField({ sx, control, ...props }: FormControlLabelProps) {
    return (
        <FormControlLabel
            sx={{
                marginInline: 0,
                justifyContent: "space-between",
                width: "100%",
                gap: 12,
                color: "#334155",
                ...sx,
            }}
            control={control ?? <Switch />}
            {...props}
        />
    );
}

export const PanelHeader = styled(Stack)({
    gap: 6,
});

export const PanelEyebrow = styled(Typography)({
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#98a2b3",
});

export const PanelTitle = styled(Typography)({
    fontSize: "1.05rem",
    fontWeight: 600,
    letterSpacing: "-0.03em",
    color: "#111827",
});
