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

import { projectEditorStyles } from "@/src/customization/project-editor";

export const Shell = styled(Box)(projectEditorStyles.primitives.shell);

export const EditorPanel = styled(Paper)<PaperProps>(projectEditorStyles.primitives.panel);

export const EditorSection = styled(Stack)({
    gap: 14,
});

export const EditorSectionTitle = styled(Typography)(projectEditorStyles.primitives.sectionTitle);

export const EditorSectionHint = styled(Typography)(projectEditorStyles.primitives.sectionHint);

export const ToolbarButton = styled(Button)<ButtonProps>(projectEditorStyles.primitives.toolbarButton);

export const StatusBadge = styled(Chip)<ChipProps>(projectEditorStyles.primitives.statusBadge);

export const FieldLabel = styled(Typography)(projectEditorStyles.primitives.fieldLabel);

export const TextField = styled(MuiTextField)<TextFieldProps>(projectEditorStyles.primitives.textField);

export const SelectField = styled(MuiTextField)<TextFieldProps>(projectEditorStyles.primitives.selectField);

export function SwitchField({ sx, control, ...props }: FormControlLabelProps) {
    return (
        <FormControlLabel
            sx={projectEditorStyles.primitives.switchField(sx)}
            control={control ?? <Switch />}
            {...props}
        />
    );
}

export const PanelHeader = styled(Stack)(projectEditorStyles.primitives.panelHeader);

export const PanelEyebrow = styled(Typography)(projectEditorStyles.primitives.panelEyebrow);

export const PanelTitle = styled(Typography)(projectEditorStyles.primitives.panelTitle);
