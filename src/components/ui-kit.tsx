"use client";

import { forwardRef, useState, type ReactElement, type ReactNode } from "react";

import { useEditor, useNode } from "@craftjs/core";
import {
    Alert,
    Box,
    Button,
    Chip,
    CssBaseline,
    Divider,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Switch,
    TextField,
    ThemeProvider,
    Tooltip,
    Typography,
    type AlertProps,
    type BoxProps,
    type ButtonProps,
    type ChipProps,
    type DividerProps,
    type FormControlLabelProps,
    type MenuItemProps,
    type PaperProps,
    type SelectChangeEvent,
    type SelectProps,
    type StackProps,
    type SwitchProps,
    type TextFieldProps,
    type ThemeProviderProps,
    type TypographyProps,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

const surfaceBorder = "1px solid rgba(255,255,255,0.08)";
const surfaceBackground = "#11141b";
const raisedBackground = "#151922";
const codeBackground = "#0d1016";

export const UiBox = Box;
export const UiStack = Stack;
export const UiTypography = Typography;
export const UiAlert = Alert;
export const UiCssBaseline = CssBaseline;
export const UiThemeProvider = ThemeProvider;
export const UiSwitch = Switch;
export const UiFormControlLabel = FormControlLabel;
export const UiMenuItem = MenuItem;
export const UiNativeDivider = Divider;

export const UiPanel = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.4),
    borderRadius: 12,
    border: surfaceBorder,
    background: surfaceBackground,
    boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
}));

export const UiSubtlePanel = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.25),
    borderRadius: 12,
    border: surfaceBorder,
    backgroundColor: "#10141c",
    boxShadow: "none",
}));

export const UiCard = styled(Box)(() => ({
    borderRadius: 10,
    border: surfaceBorder,
    backgroundColor: raisedBackground,
    padding: 16,
}));

export const UiSectionStack = styled(Stack)(() => ({
    gap: 16,
}));

export const UiEyebrow = styled(Typography)(() => ({
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontSize: 12,
    lineHeight: 1.2,
}));

export const UiSectionTitle = styled(Typography)(() => ({
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: "-0.03em",
}));

export const UiSectionDescription = styled(Typography)(() => ({
    color: "rgba(220, 226, 238, 0.66)",
    lineHeight: 1.6,
    fontSize: 14,
}));

export const UiButton = styled(Button)(({ theme }) => ({
    borderRadius: 10,
    paddingInline: theme.spacing(2),
    minHeight: 38,
    fontWeight: 700,
    boxShadow: "none",
}));

export const UiChip = styled(Chip)(() => ({
    borderRadius: 8,
    backgroundColor: "#141922",
    color: "#f5f7fb",
    fontWeight: 700,
    border: surfaceBorder,
    ".MuiChip-label": {
        paddingInline: 12,
    },
}));

export const UiMetricChip = styled(Chip)(({ theme }) => ({
    borderRadius: 8,
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.light,
    fontWeight: 700,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
    ".MuiChip-label": {
        paddingInline: 12,
    },
}));

export const UiTextField = styled(TextField)(({ theme }) => ({
    ".MuiOutlinedInput-root": {
        borderRadius: 10,
        backgroundColor: "#0f131a",
        transition: "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
        ".MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.1)",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.18)",
        },
        "&.Mui-focused": {
            backgroundColor: "#111722",
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.14)}`,
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(theme.palette.primary.main, 0.9),
        },
    },
    ".MuiInputLabel-root": {
        color: "rgba(226,232,240,0.72)",
    },
    ".MuiInputBase-input": {
        fontSize: 14,
    },
}));

export const UiScrollablePanel = styled(Box)(() => ({
    minWidth: 0,
    maxHeight: "calc(100vh - 156px)",
    overflow: "auto",
    paddingRight: 2,
}));

export const UiDivider = styled(Box)(() => ({
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
}));

export interface UiSectionHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
}

export function UiSectionHeader({ eyebrow, title, description }: UiSectionHeaderProps) {
    return (
        <UiStack spacing={0.75}>
            {eyebrow ? <UiEyebrow>{eyebrow}</UiEyebrow> : null}
            <UiSectionTitle>{title}</UiSectionTitle>
            {description ? <UiSectionDescription>{description}</UiSectionDescription> : null}
        </UiStack>
    );
}

export interface UiSelectOption {
    value: string;
    label: string;
    menuItemProps?: Partial<MenuItemProps>;
}

export interface UiSelectFieldProps {
    label: string;
    value: string;
    onChange: (event: SelectChangeEvent<string>) => void;
    options: UiSelectOption[];
    fullWidth?: boolean;
    size?: SelectProps<string>["size"];
}

export function UiSelectField({
    label,
    value,
    onChange,
    options,
    fullWidth = true,
    size = "small",
}: UiSelectFieldProps) {
    return (
        <FormControl fullWidth={fullWidth} size={size}>
            <InputLabel>{label}</InputLabel>
            <Select label={label} value={value} onChange={onChange}>
                {options.map((option) => (
                    <UiMenuItem key={option.value} value={option.value} {...option.menuItemProps}>
                        {option.label}
                    </UiMenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export function UiPanelShell({ children, ...props }: PaperProps) {
    return <UiPanel elevation={0} {...props}>{children}</UiPanel>;
}

export function UiSubtlePanelShell({ children, ...props }: PaperProps) {
    return <UiSubtlePanel elevation={0} {...props}>{children}</UiSubtlePanel>;
}

export function UiCardShell({ children, ...props }: BoxProps) {
    return <UiCard {...props}>{children}</UiCard>;
}

export function UiPrimaryButton(props: ButtonProps) {
    return <UiButton variant="contained" {...props} />;
}

export function UiGhostButton(props: ButtonProps) {
    return <UiButton variant="outlined" {...props} />;
}

export function UiTag(props: ChipProps) {
    return <UiChip size="small" {...props} />;
}

export function UiMetric(props: ChipProps) {
    return <UiMetricChip size="small" {...props} />;
}

export function UiField(props: TextFieldProps) {
    return <UiTextField size="small" fullWidth {...props} />;
}

export function UiColumn({ children, ...props }: StackProps) {
    return <UiStack spacing={2} {...props}>{children}</UiStack>;
}

export function UiRow({ children, ...props }: StackProps) {
    return <UiStack direction="row" spacing={1.2} alignItems="center" {...props}>{children}</UiStack>;
}

export function UiCodeBlock({ children, ...props }: TypographyProps) {
    return (
        <UiTypography
            component="pre"
            sx={{
                margin: 0,
                borderRadius: 10,
                border: surfaceBorder,
                backgroundColor: codeBackground,
                padding: 1.5,
                fontFamily: "var(--font-ibm-plex-mono)",
                fontSize: 12,
                color: "rgba(230,236,255,0.82)",
                whiteSpace: "pre-wrap",
            }}
            {...props}
        >
            {children}
        </UiTypography>
    );
}

export interface UiJsonFieldEditorProps {
    label: string;
    value: unknown;
    onApply: (value: unknown) => void;
    rows?: number;
}

export function UiJsonFieldEditor({ label, value, onApply, rows = 6 }: UiJsonFieldEditorProps) {
    const [draft, setDraft] = useState(JSON.stringify(value, null, 2));
    const [error, setError] = useState<string | null>(null);

    return (
        <UiColumn spacing={1}>
            <UiField label={label} multiline minRows={rows} value={draft} onChange={(event) => setDraft(event.target.value)} />
            {error ? <UiAlert severity="error">{error}</UiAlert> : null}
            <UiGhostButton
                onClick={() => {
                    try {
                        const parsed = JSON.parse(draft);
                        onApply(parsed);
                        setError(null);
                    } catch {
                        setError(`Invalid JSON in ${label}.`);
                    }
                }}
            >
                Apply {label}
            </UiGhostButton>
        </UiColumn>
    );
}

export interface UiPaletteCardProps extends Omit<BoxProps, "title"> {
    title: string;
    summary: string;
    accent: string;
    active?: boolean;
    dragging?: boolean;
}

export const UiPaletteCard = forwardRef<HTMLDivElement, UiPaletteCardProps>(function UiPaletteCard(
    { title, summary, accent, active = false, dragging = false, sx, ...props },
    ref,
) {
    return (
        <Tooltip title={summary} placement="right" arrow>
            <UiBox
                ref={ref}
                sx={{
                    borderRadius: 0.5,
                    border: `1px solid ${active ? accent : "rgba(255,255,255,0.08)"}`,
                    background: "#131821",
                    p: 1.5,
                    cursor: "grab",
                    opacity: dragging ? 0.48 : 1,
                    transition: "border-color 160ms ease, transform 160ms ease, opacity 160ms ease",
                    ...sx,
                }}
                {...props}
            >
                <UiRow justifyContent="space-between" alignItems="center" spacing={1.25}>
                    <UiTypography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 0 }}>
                        {title}
                    </UiTypography>
                    <UiBox sx={{ width: 8, height: 8, borderRadius: 999, backgroundColor: accent, flexShrink: 0 }} />
                </UiRow>
            </UiBox>
        </Tooltip>
    );
});

export function UiBuilderContainer({ title, accent, children }: { title: string; accent: string; children?: ReactNode }) {
    const {
        connectors: { connect, drag },
    } = useNode();

    return (
        <UiPanelShell
            ref={(ref) => {
                if (ref) {
                    connect(drag(ref as HTMLElement));
                }
            }}
            sx={{
                p: 2.25,
                borderRadius: 2.5,
                minHeight: 180,
                border: `1px solid ${accent}44`,
                background: "#131821",
            }}
        >
            <UiTypography variant="subtitle2" sx={{ color: accent, fontWeight: 700, mb: 1.25 }}>
                {title}
            </UiTypography>
            <UiStack spacing={1.2}>{children}</UiStack>
        </UiPanelShell>
    );
}

UiBuilderContainer.craft = {
    props: {
        title: "Section",
        accent: "#80ED99",
    },
};

export function UiBuilderStage({ children }: { children?: ReactNode }) {
    const {
        connectors: { connect },
    } = useNode();

    return (
        <UiBox
            ref={(ref) => {
                if (ref) {
                    connect(ref as HTMLElement);
                }
            }}
            sx={{
                minHeight: 12000,
                minWidth: 12000,
                position: "relative",
                display: "block",
                p: 6,
                backgroundImage: `linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0",
            }}
        >
            {children}
        </UiBox>
    );
}

UiBuilderStage.craft = {
    displayName: "BuilderStage",
    props: {},
};

export function UiBuilderScreen({
    title,
    width,
    minHeight,
    children,
}: {
    title: string;
    width: number;
    minHeight: number;
    children?: ReactNode;
}) {
    const {
        connectors: { connect, drag },
    } = useNode();

    return (
        <UiBox
            ref={(ref) => {
                if (ref) {
                    connect(drag(ref as HTMLElement));
                }
            }}
            sx={{
                width,
                maxWidth: "100%",
                minHeight,
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#f7f8fb",
                boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
                overflow: "hidden",
                position: "relative",
            }}
        >
            <UiBox
                sx={{
                    height: 42,
                    px: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(15,23,42,0.08)",
                    background: "linear-gradient(180deg, #ffffff 0%, #f3f4f7 100%)",
                }}
            >
                <UiStack direction="row" spacing={0.75} alignItems="center">
                    <UiBox sx={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#ff5f57" }} />
                    <UiBox sx={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#febc2e" }} />
                    <UiBox sx={{ width: 10, height: 10, borderRadius: 999, backgroundColor: "#28c840" }} />
                </UiStack>
                <UiTypography variant="caption" sx={{ color: "rgba(15,23,42,0.6)", fontWeight: 700 }}>
                    {title}
                </UiTypography>
                <UiBox sx={{ width: 40 }} />
            </UiBox>

            <UiBox
                sx={{
                    minHeight: minHeight - 42,
                    background: "#ffffff",
                    color: "#0f172a",
                    p: 3,
                }}
            >
                {children}
            </UiBox>
        </UiBox>
    );
}

UiBuilderScreen.craft = {
    displayName: "BuilderScreen",
    props: {
        title: "Desktop Screen",
        width: 1440,
        minHeight: 900,
    },
};

export function UiBuilderText({ text, variant }: { text: string; variant: "heading" | "body" }) {
    const {
        connectors: { connect, drag },
    } = useNode();

    return (
        <UiBox
            ref={(ref) => {
                if (ref) {
                    connect(drag(ref as HTMLElement));
                }
            }}
            sx={{
                fontSize: variant === "heading" ? 28 : 14,
                fontWeight: variant === "heading" ? 700 : 500,
                lineHeight: variant === "heading" ? 1.1 : 1.65,
                color: variant === "heading" ? "#f8fafc" : "rgba(230,236,255,0.74)",
            }}
        >
            {text}
        </UiBox>
    );
}

UiBuilderText.craft = {
    props: {
        text: "Text block",
        variant: "body",
    },
};

export function UiBuilderButton({ text, tone }: { text: string; tone: "primary" | "secondary" }) {
    const {
        connectors: { connect, drag },
    } = useNode();

    return (
        <UiBox
            ref={(ref) => {
                if (ref) {
                    connect(drag(ref as HTMLElement));
                }
            }}
            sx={{
                alignSelf: "flex-start",
                borderRadius: 2,
                px: 2,
                py: 1,
                fontWeight: 700,
                fontSize: 13,
                color: tone === "primary" ? "#080a0f" : "#e2e8f0",
                background: tone === "primary" ? "#f5f7fb" : "#161b24",
            }}
        >
            {text}
        </UiBox>
    );
}

UiBuilderButton.craft = {
    props: {
        text: "Action",
        tone: "primary",
    },
};

export function UiBuilderCard({ title, body }: { title: string; body: string }) {
    const {
        connectors: { connect, drag },
    } = useNode();

    return (
        <UiSubtlePanelShell
            ref={(ref) => {
                if (ref) {
                    connect(drag(ref as HTMLElement));
                }
            }}
            sx={{
                p: 1.5,
                borderRadius: 2.5,
                backgroundColor: raisedBackground,
            }}
        >
            <UiTypography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.6 }}>
                {title}
            </UiTypography>
            <UiTypography variant="body2" sx={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.55 }}>
                {body}
            </UiTypography>
        </UiSubtlePanelShell>
    );
}

UiBuilderCard.craft = {
    props: {
        title: "Card title",
        body: "Short explanatory copy.",
    },
};

export function UiBuilderToolChip({ label, element }: { label: string; element: ReactElement }) {
    const { connectors } = useEditor();

    return (
        <UiBox
            ref={(ref) => {
                if (ref) {
                    connectors.create(ref as HTMLElement, element);
                }
            }}
            sx={{
                borderRadius: 2,
                border: surfaceBorder,
                backgroundColor: raisedBackground,
                px: 1.25,
                py: 0.85,
                fontSize: 12,
                cursor: "grab",
            }}
        >
            {label}
        </UiBox>
    );
}

export function UiAppThemeRoot({ children, ...props }: ThemeProviderProps) {
    return <UiThemeProvider {...props}>{children}</UiThemeProvider>;
}

export function UiInlineAlert(props: AlertProps) {
    return <UiAlert {...props} />;
}

export function UiSwitchRow(props: FormControlLabelProps) {
    return <UiFormControlLabel {...props} />;
}

export function UiToggle(props: SwitchProps) {
    return <UiSwitch {...props} />;
}

export function UiDividerLine(props: DividerProps) {
    return <UiNativeDivider {...props} />;
}