"use client";

import { forwardRef, useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactElement, type ReactNode } from "react";

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
const surfaceBackground = "#131313";
const raisedBackground = "#181818";
const codeBackground = "#101010";
const builderSelectionColor = "#52d9c8";

type BuilderResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface BuilderResizableOptions {
    enabled: boolean;
    minWidth?: number;
    minHeight?: number;
    onResize: (size: { width: number; height: number }) => void;
}

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
    backgroundColor: "#161616",
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
    backgroundColor: "#191919",
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
        backgroundColor: "#141414",
        transition: "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
        ".MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.1)",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.18)",
        },
        "&.Mui-focused": {
            backgroundColor: "#1a1a1a",
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

function getBuilderSelectionStyles(isSelected: boolean) {
    return {
        transition: "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
        '&::after': {
            content: '""',
            position: "absolute",
            inset: -6,
            borderRadius: "inherit",
            border: `2px solid ${builderSelectionColor}`,
            boxShadow: `0 0 0 4px ${alpha(builderSelectionColor, 0.18)}`,
            opacity: isSelected ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 160ms ease",
        },
    };
}

function getResizeCursor(direction: BuilderResizeDirection) {
    switch (direction) {
        case "n":
        case "s":
            return "ns-resize";
        case "e":
        case "w":
            return "ew-resize";
        case "ne":
        case "sw":
            return "nesw-resize";
        case "nw":
        case "se":
            return "nwse-resize";
        default:
            return "default";
    }
}

function useBuilderResizable({ enabled, minWidth = 72, minHeight = 40, onResize }: BuilderResizableOptions) {
    const elementRef = useRef<HTMLElement | null>(null);
    const resizeSessionRef = useRef<{
        direction: BuilderResizeDirection;
        startX: number;
        startY: number;
        startWidth: number;
        startHeight: number;
    } | null>(null);
    const onResizeRef = useRef(onResize);

    useEffect(() => {
        onResizeRef.current = onResize;
    }, [onResize]);

    const stopResize = useCallback(() => {
        resizeSessionRef.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    }, []);

    useEffect(() => stopResize, [stopResize]);

    useEffect(() => {
        function handleMouseMove(event: MouseEvent) {
            const session = resizeSessionRef.current;

            if (!session) {
                return;
            }

            const deltaX = event.clientX - session.startX;
            const deltaY = event.clientY - session.startY;
            const widthDelta = session.direction.includes("w") ? -deltaX : session.direction.includes("e") ? deltaX : 0;
            const heightDelta = session.direction.includes("n") ? -deltaY : session.direction.includes("s") ? deltaY : 0;

            onResizeRef.current({
                width: Math.max(minWidth, Math.round(session.startWidth + widthDelta)),
                height: Math.max(minHeight, Math.round(session.startHeight + heightDelta)),
            });
        }

        function handleMouseUp() {
            stopResize();
        }

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [minHeight, minWidth, stopResize]);

    const setElementRef = useCallback((element: HTMLElement | null) => {
        elementRef.current = element;
    }, []);

    const startResize = useCallback((direction: BuilderResizeDirection, event: ReactMouseEvent<HTMLElement>) => {
        if (!enabled || !elementRef.current) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const rect = elementRef.current.getBoundingClientRect();

        resizeSessionRef.current = {
            direction,
            startX: event.clientX,
            startY: event.clientY,
            startWidth: rect.width,
            startHeight: rect.height,
        };

        document.body.style.cursor = getResizeCursor(direction);
        document.body.style.userSelect = "none";
    }, [enabled]);

    const resizeOverlay = enabled ? (
        <>
            <UiBox
                onMouseDown={(event) => startResize("n", event)}
                data-builder-resize-handle="true"
                sx={{ position: "absolute", top: 0, left: 12, right: 12, height: 8, cursor: "ns-resize", zIndex: 4 }}
            />
            <UiBox
                onMouseDown={(event) => startResize("s", event)}
                data-builder-resize-handle="true"
                sx={{ position: "absolute", bottom: 0, left: 12, right: 12, height: 8, cursor: "ns-resize", zIndex: 4 }}
            />
            <UiBox
                onMouseDown={(event) => startResize("w", event)}
                data-builder-resize-handle="true"
                sx={{ position: "absolute", top: 12, bottom: 12, left: 0, width: 8, cursor: "ew-resize", zIndex: 4 }}
            />
            <UiBox
                onMouseDown={(event) => startResize("e", event)}
                data-builder-resize-handle="true"
                sx={{ position: "absolute", top: 12, bottom: 12, right: 0, width: 8, cursor: "ew-resize", zIndex: 4 }}
            />
            {([
                ["nw", { top: 2, left: 2 }],
                ["ne", { top: 2, right: 2 }],
                ["sw", { bottom: 2, left: 2 }],
                ["se", { bottom: 2, right: 2 }],
            ] as const).map(([direction, position]) => (
                <UiBox
                    key={direction}
                    onMouseDown={(event) => startResize(direction, event)}
                    data-builder-resize-handle="true"
                    sx={{
                        position: "absolute",
                        width: 10,
                        height: 10,
                        borderRadius: 0.75,
                        border: `1px solid ${builderSelectionColor}`,
                        background: "#0f1115",
                        boxShadow: `0 0 0 2px ${alpha(builderSelectionColor, 0.22)}`,
                        cursor: getResizeCursor(direction),
                        zIndex: 5,
                        ...position,
                    }}
                />
            ))}
        </>
    ) : null;

    return {
        resizeOverlay,
        setElementRef,
    };
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

export function UiBuilderContainer({ title, accent, width, height, children }: { title: string; accent: string; width?: number; height?: number; children?: ReactNode }) {
    const {
        connectors: { connect, drag },
        actions: { setProp },
        isSelected,
    } = useNode((node) => ({
        isSelected: node.events.selected,
    }));
    const { resizeOverlay, setElementRef } = useBuilderResizable({
        enabled: isSelected,
        minWidth: 180,
        minHeight: 120,
        onResize: ({ width: nextWidth, height: nextHeight }) => {
            setProp((props: { width?: number; height?: number }) => {
                props.width = nextWidth;
                props.height = nextHeight;
            }, 16);
        },
    });

    return (
        <UiPanelShell
            data-builder-node-root="true"
            ref={(ref) => {
                setElementRef(ref as HTMLElement | null);
                if (ref) {
                    connect(drag(ref as HTMLElement));
                }
            }}
            sx={{
                position: "relative",
                width,
                height,
                p: 2.25,
                borderRadius: 2.5,
                minHeight: height ?? 180,
                border: `1px solid ${accent}44`,
                background: "#131821",
                ...getBuilderSelectionStyles(isSelected),
            }}
        >
            <UiTypography variant="subtitle2" sx={{ color: accent, fontWeight: 700, mb: 1.25 }}>
                {title}
            </UiTypography>
            <UiStack spacing={1.2}>{children}</UiStack>
            {resizeOverlay}
        </UiPanelShell>
    );
}

UiBuilderContainer.craft = {
    displayName: "BuilderContainer",
    props: {
        title: "Section",
        accent: "#80ED99",
        width: undefined,
        height: undefined,
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
    height,
    children,
}: {
    title: string;
    width: number;
    minHeight: number;
    height?: number;
    children?: ReactNode;
}) {
    const {
        connectors: { connect, drag },
        actions: { setProp },
        isSelected,
    } = useNode((node) => ({
        isSelected: node.events.selected,
    }));
    const resolvedHeight = height ?? minHeight;
    const { resizeOverlay, setElementRef } = useBuilderResizable({
        enabled: isSelected,
        minWidth: 320,
        minHeight: 240,
        onResize: ({ width: nextWidth, height: nextHeight }) => {
            setProp((props: { width?: number; height?: number }) => {
                props.width = nextWidth;
                props.height = nextHeight;
            }, 16);
        },
    });

    return (
        <UiBox
            data-builder-node-root="true"
            ref={(ref) => {
                setElementRef(ref as HTMLElement | null);
                if (ref) {
                    connect(drag(ref as HTMLElement));
                }
            }}
            sx={{
                width,
                maxWidth: "100%",
                minHeight: resolvedHeight,
                height: resolvedHeight,
                borderRadius: 3,
                border: `1px solid ${isSelected ? builderSelectionColor : "rgba(255,255,255,0.08)"}`,
                background: "#f7f8fb",
                boxShadow: isSelected
                    ? `0 30px 80px rgba(0,0,0,0.28), 0 0 0 3px ${alpha(builderSelectionColor, 0.9)}, 0 0 0 8px ${alpha(builderSelectionColor, 0.18)}`
                    : "0 30px 80px rgba(0,0,0,0.28)",
                overflow: "hidden",
                position: "relative",
                ...getBuilderSelectionStyles(isSelected),
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
                    minHeight: Math.max(resolvedHeight - 42, 0),
                    height: Math.max(resolvedHeight - 42, 0),
                    background: "#ffffff",
                    color: "#0f172a",
                    p: 3,
                }}
            >
                {children}
            </UiBox>
            {resizeOverlay}
        </UiBox>
    );
}

UiBuilderScreen.craft = {
    displayName: "BuilderScreen",
    props: {
        title: "Desktop Screen",
        width: 1440,
        minHeight: 900,
        height: undefined,
    },
};

export function UiBuilderText({ text, variant, width, height }: { text: string; variant: "heading" | "body"; width?: number; height?: number }) {
    const {
        connectors: { connect, drag },
        actions: { setProp },
        isSelected,
    } = useNode((node) => ({
        isSelected: node.events.selected,
    }));
    const { resizeOverlay, setElementRef } = useBuilderResizable({
        enabled: isSelected,
        minWidth: 80,
        minHeight: variant === "heading" ? 42 : 24,
        onResize: ({ width: nextWidth, height: nextHeight }) => {
            setProp((props: { width?: number; height?: number }) => {
                props.width = nextWidth;
                props.height = nextHeight;
            }, 16);
        },
    });

    return (
        <UiBox
            data-builder-node-root="true"
            ref={(ref) => {
                setElementRef(ref as HTMLElement | null);
                if (ref) {
                    connect(drag(ref as HTMLElement));
                }
            }}
            sx={{
                position: "relative",
                display: "inline-block",
                width,
                minHeight: height,
                height,
                borderRadius: 1.5,
                fontSize: variant === "heading" ? 28 : 14,
                fontWeight: variant === "heading" ? 700 : 500,
                lineHeight: variant === "heading" ? 1.1 : 1.65,
                color: variant === "heading" ? "#f8fafc" : "rgba(230,236,255,0.74)",
                overflow: height ? "hidden" : undefined,
                ...getBuilderSelectionStyles(isSelected),
            }}
        >
            {text}
            {resizeOverlay}
        </UiBox>
    );
}

UiBuilderText.craft = {
    displayName: "BuilderText",
    props: {
        text: "Text block",
        variant: "body",
        width: undefined,
        height: undefined,
    },
};

export function UiBuilderButton({ text, tone, width, height }: { text: string; tone: "primary" | "secondary"; width?: number; height?: number }) {
    const {
        connectors: { connect, drag },
        actions: { setProp },
        isSelected,
    } = useNode((node) => ({
        isSelected: node.events.selected,
    }));
    const { resizeOverlay, setElementRef } = useBuilderResizable({
        enabled: isSelected,
        minWidth: 72,
        minHeight: 36,
        onResize: ({ width: nextWidth, height: nextHeight }) => {
            setProp((props: { width?: number; height?: number }) => {
                props.width = nextWidth;
                props.height = nextHeight;
            }, 16);
        },
    });

    return (
        <UiBox
            data-builder-node-root="true"
            ref={(ref) => {
                setElementRef(ref as HTMLElement | null);
                if (ref) {
                    connect(drag(ref as HTMLElement));
                }
            }}
            sx={{
                position: "relative",
                alignSelf: "flex-start",
                width,
                minHeight: height,
                height,
                borderRadius: 2,
                px: 2,
                py: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
                color: tone === "primary" ? "#080a0f" : "#e2e8f0",
                background: tone === "primary" ? "#f5f7fb" : "#161b24",
                ...getBuilderSelectionStyles(isSelected),
            }}
        >
            {text}
            {resizeOverlay}
        </UiBox>
    );
}

UiBuilderButton.craft = {
    displayName: "BuilderButton",
    props: {
        text: "Action",
        tone: "primary",
        width: undefined,
        height: undefined,
    },
};

export function UiBuilderCard({ title, body, width, height, children }: { title: string; body: string; width?: number; height?: number; children?: ReactNode }) {
    const {
        connectors: { connect, drag },
        actions: { setProp },
        isSelected,
    } = useNode((node) => ({
        isSelected: node.events.selected,
    }));
    const { resizeOverlay, setElementRef } = useBuilderResizable({
        enabled: isSelected,
        minWidth: 160,
        minHeight: 96,
        onResize: ({ width: nextWidth, height: nextHeight }) => {
            setProp((props: { width?: number; height?: number }) => {
                props.width = nextWidth;
                props.height = nextHeight;
            }, 16);
        },
    });

    return (
        <UiSubtlePanelShell
            data-builder-node-root="true"
            ref={(ref) => {
                setElementRef(ref as HTMLElement | null);
                if (ref) {
                    connect(drag(ref as HTMLElement));
                }
            }}
            sx={{
                position: "relative",
                width,
                minHeight: height,
                height,
                p: 1.5,
                borderRadius: 2.5,
                backgroundColor: raisedBackground,
                overflow: height ? "hidden" : undefined,
                ...getBuilderSelectionStyles(isSelected),
            }}
        >
            <UiTypography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.6 }}>
                {title}
            </UiTypography>
            <UiTypography variant="body2" sx={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.55 }}>
                {body}
            </UiTypography>
            {children ? <UiStack spacing={1} sx={{ mt: 1.2 }}>{children}</UiStack> : null}
            {resizeOverlay}
        </UiSubtlePanelShell>
    );
}

UiBuilderCard.craft = {
    displayName: "BuilderCard",
    props: {
        title: "Card title",
        body: "Short explanatory copy.",
        width: undefined,
        height: undefined,
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