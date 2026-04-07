"use client";

import { useEffect, useState } from "react";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
    AlignBoxBottomCenterIcon,
    AlignBoxBottomLeftIcon,
    AlignBoxBottomRightIcon,
    AlignBoxMiddleCenterIcon,
    AlignBoxMiddleLeftIcon,
    AlignBoxMiddleRightIcon,
    AlignBoxTopCenterIcon,
    AlignBoxTopLeftIcon,
    AlignBoxTopRightIcon,
    HorizonalScrollPointIcon,
} from "@hugeicons-pro/core-solid-standard";
import {
    BorderBottom02Icon,
    BorderLeft02Icon,
    BorderRight02Icon,
    BorderTop02Icon,
} from "@hugeicons-pro/core-twotone-rounded";
import { Box, ButtonBase, Collapse, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { DesignColorControl } from "@/src/features/design-editor/components/DesignColorControl";
import type { DesignAutoLayoutAlign, DesignAutoLayoutDirection, DesignAutoLayoutJustify, DesignPadding, DesignSizeMode } from "@/src/features/design-editor/types/design.types";

const DRAG_SENSITIVITY_PX = 4;

function clampNumericValue(nextValue: number, min?: number) {
    return min == null ? nextValue : Math.max(min, nextValue);
}

function DraggableNumberField({
    value,
    onChange,
    disabled = false,
    min,
    unit,
    dragIcon = HorizonalScrollPointIcon,
    placeholder,
}: {
    value: number | null;
    onChange: (nextValue: number | null) => void;
    disabled?: boolean;
    min?: number;
    unit?: string;
    dragIcon?: IconSvgElement;
    placeholder?: string;
}) {
    const [dragState, setDragState] = useState<{
        startClientX: number;
        initialValue: number;
    } | null>(null);

    useEffect(() => {
        if (!dragState) {
            return;
        }

        const currentDragState = dragState;

        function handlePointerMove(event: PointerEvent) {
            const deltaSteps = Math.trunc((event.clientX - currentDragState.startClientX) / DRAG_SENSITIVITY_PX);
            const nextValue = clampNumericValue(currentDragState.initialValue + deltaSteps, min);

            if (nextValue !== value) {
                onChange(nextValue);
            }
        }

        function handlePointerUp() {
            setDragState(null);
        }

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp, { once: true });

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [dragState, min, onChange, value]);

    function beginDrag(event: React.PointerEvent<HTMLButtonElement>) {
        if (disabled) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        setDragState({
            startClientX: event.clientX,
            initialValue: value ?? 0,
        });
    }

    return (
        <Box sx={designEditorStyles.inspector.metricField}>
            <ButtonBase
                onPointerDown={beginDrag}
                disabled={disabled}
                sx={{
                    ...designEditorStyles.inspector.metricIcon,
                    cursor: disabled ? "default" : "ew-resize",
                    touchAction: "none",
                    pointerEvents: disabled ? "none" : "auto",
                    userSelect: "none",
                }}
            >
                <HugeiconsIcon icon={dragIcon} size={12} strokeWidth={0} />
            </ButtonBase>

            <TextField
                type="number"
                value={value ?? ""}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(event) => {
                    if (event.target.value === "") {
                        onChange(null);
                        return;
                    }

                    const nextValue = Number(event.target.value);

                    if (Number.isNaN(nextValue) || nextValue === value) {
                        return;
                    }

                    onChange(clampNumericValue(nextValue, min));
                }}
                sx={designEditorStyles.inspector.metricInput}
            />

            {unit ? <Typography sx={designEditorStyles.inspector.metricUnit}>{unit}</Typography> : null}
        </Box>
    );
}

export function InspectorSectionHeader({ title, icon, meta }: { title: string; icon: IconSvgElement; meta?: React.ReactNode }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={designEditorStyles.inspector.sectionHeader}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <Box sx={designEditorStyles.inspector.sectionIconBadge}>
                        <HugeiconsIcon icon={icon} size={14} strokeWidth={0} />
                </Box>
                <Typography sx={designEditorStyles.inspector.sectionTitle}>{title}</Typography>
            </Stack>
            {meta}
        </Stack>
    );
}

export function InspectorSection({ title, icon, meta, children }: { title: string; icon: IconSvgElement; meta?: React.ReactNode; children: React.ReactNode }) {
    return (
            <Stack spacing={0.8} sx={designEditorStyles.inspector.section}>
            <InspectorSectionHeader title={title} icon={icon} meta={meta} />
                <Stack spacing={0.75}>{children}</Stack>
        </Stack>
    );
}

export function FieldLabel({ label }: { label: string }) {
    return <Typography sx={designEditorStyles.inspector.gridFieldLabel}>{label}</Typography>;
}

export function PropertyChipInput({ value, onChange, placeholder, multiline = false }: { value: string; onChange: (nextValue: string) => void; placeholder?: string; multiline?: boolean }) {
    return (
        <TextField
            value={value}
            placeholder={placeholder}
            multiline={multiline}
            minRows={multiline ? 2 : undefined}
            onChange={(event) => {
                const nextValue = event.target.value;

                if (nextValue === value) {
                    return;
                }

                onChange(nextValue);
            }}
            sx={designEditorStyles.inspector.textField}
        />
    );
}

export function PropertyNumberInput({
    value,
    onChange,
    label,
    unit,
    min,
    disabled = false,
    dragIcon,
}: {
    value: number;
    onChange: (nextValue: number) => void;
    label?: string;
    unit?: string;
    min?: number;
    disabled?: boolean;
    dragIcon?: IconSvgElement;
}) {
    return (
        <Stack spacing={0.32}>
            {label ? <FieldLabel label={label} /> : null}
            <DraggableNumberField
                value={value}
                disabled={disabled}
                min={min}
                unit={unit}
                dragIcon={dragIcon}
                onChange={(nextValue) => {
                    if (nextValue == null || nextValue === value) {
                        return;
                    }

                    onChange(nextValue);
                }}
            />
        </Stack>
    );
}

export function PropertySelectInput<T extends string | number>({
    value,
    onChange,
    label,
    options,
}: {
    value: T;
    onChange: (nextValue: T) => void;
    label?: string;
    options: Array<{ value: T; label: string; previewFontFamily?: string }>;
}) {
    return (
        <Stack spacing={0.32}>
            {label ? <FieldLabel label={label} /> : null}
            <Box sx={designEditorStyles.inspector.metricField}>
                <TextField
                    select
                    value={value}
                    onChange={(event) => {
                        const nextValue = options.find((option) => String(option.value) === event.target.value)?.value;

                        if (nextValue == null || nextValue === value) {
                            return;
                        }

                        onChange(nextValue);
                    }}
                    sx={designEditorStyles.inspector.metricInput}
                >
                    {options.map((option) => (
                        <MenuItem key={String(option.value)} value={String(option.value)} sx={option.previewFontFamily ? { fontFamily: option.previewFontFamily } : undefined}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>
        </Stack>
    );
}

export function NullablePropertyNumberInput({
    value,
    onChange,
    label,
    min,
    placeholder,
}: {
    value: number | null;
    onChange: (nextValue: number | null) => void;
    label?: string;
    min?: number;
    placeholder?: string;
}) {
    return (
        <Stack spacing={0.32}>
            {label ? <FieldLabel label={label} /> : null}
            <DraggableNumberField value={value} onChange={onChange} min={min} placeholder={placeholder} />
        </Stack>
    );
}

export function IconValueField({ label, value, icon }: { label: string; value: string; icon?: IconSvgElement }) {
    return (
        <Stack spacing={0.32}>
            <FieldLabel label={label} />
            <Box sx={designEditorStyles.inspector.metricFieldStatic}>
                {icon ? (
                    <Box sx={designEditorStyles.inspector.metricIcon}>
                        <HugeiconsIcon icon={icon} size={12} strokeWidth={0} />
                    </Box>
                ) : null}
                <Typography sx={designEditorStyles.inspector.metricStaticValue}>{value}</Typography>
            </Box>
        </Stack>
    );
}

export function TogglePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <ButtonBase onClick={onClick} sx={designEditorStyles.inspector.togglePill(active)}>
            <Typography sx={designEditorStyles.inspector.togglePillLabel(active)}>{label}</Typography>
        </ButtonBase>
    );
}

export function SegmentedIconControl<T extends string>({
    value,
    onChange,
    options,
    dense = false,
}: {
    value: T;
    onChange: (nextValue: T) => void;
    options: Array<{ value: T; label: string; icon?: React.ReactNode }>;
    dense?: boolean;
}) {
    return (
        <Box sx={designEditorStyles.inspector.controlRail}>
            {options.map((option) => {
                const isActive = option.value === value;

                return (
                    <ButtonBase key={option.value} onClick={() => onChange(option.value)} sx={designEditorStyles.inspector.controlButton(isActive, dense)}>
                        <Stack direction="row" spacing={0.55} alignItems="center" justifyContent="center">
                            {option.icon ? <Box sx={designEditorStyles.inspector.controlButtonIcon(isActive)}>{option.icon}</Box> : null}
                            <Typography sx={designEditorStyles.inspector.controlButtonLabel(isActive, dense)}>{option.label}</Typography>
                        </Stack>
                    </ButtonBase>
                );
            })}
        </Box>
    );
}

const MATRIX_ITEMS: Array<{
    justify: DesignAutoLayoutJustify;
    align: Exclude<DesignAutoLayoutAlign, "stretch">;
    icon: IconSvgElement;
}> = [
        { justify: "start", align: "start", icon: AlignBoxTopLeftIcon },
        { justify: "center", align: "start", icon: AlignBoxTopCenterIcon },
        { justify: "end", align: "start", icon: AlignBoxTopRightIcon },
        { justify: "start", align: "center", icon: AlignBoxMiddleLeftIcon },
        { justify: "center", align: "center", icon: AlignBoxMiddleCenterIcon },
        { justify: "end", align: "center", icon: AlignBoxMiddleRightIcon },
        { justify: "start", align: "end", icon: AlignBoxBottomLeftIcon },
        { justify: "center", align: "end", icon: AlignBoxBottomCenterIcon },
        { justify: "end", align: "end", icon: AlignBoxBottomRightIcon },
    ];

export function AlignmentMatrixControl({
    direction,
    justifyContent,
    alignItems,
    onChange,
}: {
    direction: DesignAutoLayoutDirection;
    justifyContent: DesignAutoLayoutJustify;
    alignItems: DesignAutoLayoutAlign;
    onChange: (nextValue: { justifyContent: DesignAutoLayoutJustify; alignItems: DesignAutoLayoutAlign }) => void;
}) {
    return (
        <Stack spacing={0.4}>
            <FieldLabel label={direction === "horizontal" ? "Content map" : "Stack map"} />
            <Box sx={designEditorStyles.inspector.matrixGrid}>
                {MATRIX_ITEMS.map((item) => {
                    const isActive = justifyContent === item.justify && alignItems === item.align;

                    return (
                        <ButtonBase
                            key={`${item.justify}-${item.align}`}
                            onClick={() => onChange({ justifyContent: item.justify, alignItems: item.align })}
                            sx={designEditorStyles.inspector.matrixCell(isActive)}
                        >
                            <HugeiconsIcon icon={item.icon} size={14} strokeWidth={0} />
                        </ButtonBase>
                    );
                })}
            </Box>
        </Stack>
    );
}

export function LinkedSpacingControl({
    label,
    value,
    onChange,
}: {
    label: string;
    value: DesignPadding;
    onChange: (nextValue: Partial<DesignPadding>) => void;
}) {
    const [isLinked, setIsLinked] = useState(value.top === value.right && value.top === value.bottom && value.top === value.left);

    useEffect(() => {
        setIsLinked(value.top === value.right && value.top === value.bottom && value.top === value.left);
    }, [value.bottom, value.left, value.right, value.top]);

    function updateSide(side: keyof DesignPadding, nextValue: number) {
        if (isLinked) {
            onChange({ top: nextValue, right: nextValue, bottom: nextValue, left: nextValue });
            return;
        }

        onChange({ [side]: nextValue });
    }

    return (
        <Stack spacing={0.45}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FieldLabel label={label} />
                <TogglePill label={isLinked ? "Link" : "Free"} active={isLinked} onClick={() => setIsLinked((current) => !current)} />
            </Stack>

            {isLinked ? (
                <PropertyNumberInput value={value.top} onChange={(nextValue) => updateSide("top", nextValue)} min={0} />
            ) : (
                <Box sx={designEditorStyles.inspector.fourUpGrid}>
                    <PropertyNumberInput value={value.top} onChange={(nextValue) => updateSide("top", nextValue)} min={0} dragIcon={BorderTop02Icon} />
                    <PropertyNumberInput value={value.right} onChange={(nextValue) => updateSide("right", nextValue)} min={0} dragIcon={BorderRight02Icon} />
                    <PropertyNumberInput value={value.bottom} onChange={(nextValue) => updateSide("bottom", nextValue)} min={0} dragIcon={BorderBottom02Icon} />
                    <PropertyNumberInput value={value.left} onChange={(nextValue) => updateSide("left", nextValue)} min={0} dragIcon={BorderLeft02Icon} />
                </Box>
            )}
        </Stack>
    );
}

export function SizeConstraintControl({
    label,
    mode,
    value,
    minValue,
    maxValue,
    allowFill = true,
    allowHug = false,
    onModeChange,
    onValueChange,
    onMinChange,
    onMaxChange,
}: {
    label: string;
    mode: DesignSizeMode;
    value: number;
    minValue: number | null;
    maxValue: number | null;
    allowFill?: boolean;
    allowHug?: boolean;
    onModeChange: (nextValue: DesignSizeMode) => void;
    onValueChange: (nextValue: number) => void;
    onMinChange: (nextValue: number | null) => void;
    onMaxChange: (nextValue: number | null) => void;
}) {
    const [showAdvanced, setShowAdvanced] = useState(Boolean(minValue != null || maxValue != null));
    const options: Array<{ value: DesignSizeMode; label: string }> = [{ value: "fixed", label: "Fixed" }];

    if (allowFill) {
        options.push({ value: "fill", label: "Fill" });
    }

    if (allowHug) {
        options.push({ value: "hug", label: "Hug" });
    }

    return (
        <Stack spacing={0.45}>
            <Box sx={{ display: "grid", gridTemplateColumns: "20px minmax(0, 1fr) minmax(88px, auto)", gap: 0.5, alignItems: "center" }}>
                <Typography sx={designEditorStyles.inspector.gridFieldLabel}>{label}</Typography>

                <DraggableNumberField
                    value={value}
                    disabled={mode !== "fixed"}
                    min={1}
                    onChange={(nextValue) => {
                        if (nextValue == null || nextValue === value) {
                            return;
                        }

                        onValueChange(nextValue);
                    }}
                />

                <SegmentedIconControl dense value={mode} onChange={onModeChange} options={options} />
            </Box>

            <ButtonBase onClick={() => setShowAdvanced((current) => !current)} sx={designEditorStyles.inspector.sectionDisclosure}>
                <Typography sx={designEditorStyles.inspector.sectionDisclosureLabel}>Advanced sizing</Typography>
                <Typography sx={designEditorStyles.inspector.sectionDisclosureValue}>{showAdvanced ? "Hide" : "Show"}</Typography>
            </ButtonBase>

            <Collapse in={showAdvanced}>
                <Box sx={designEditorStyles.inspector.metricGrid2}>
                    <NullablePropertyNumberInput label="Min" value={minValue} onChange={onMinChange} min={0} placeholder="-" />
                    <NullablePropertyNumberInput label="Max" value={maxValue} onChange={onMaxChange} min={0} placeholder="-" />
                </Box>
            </Collapse>
        </Stack>
    );
}

export function FillRowControl({ title, value, onChange, paletteColors }: { title: string; value: string; onChange: (nextValue: string) => void; paletteColors: string[] }) {
    return (
        <Stack spacing={0.4}>
            <FieldLabel label={title} />
            <DesignColorControl title={title} value={value} paletteColors={paletteColors} allowGradient onChange={onChange} />
        </Stack>
    );
}

export function StrokeRowControl({
    value,
    width,
    onColorChange,
    onWidthChange,
    paletteColors,
}: {
    value: string;
    width: number;
    onColorChange: (nextValue: string) => void;
    onWidthChange: (nextValue: number) => void;
    paletteColors: string[];
}) {
    return (
        <Box sx={designEditorStyles.inspector.twoColumnGridCompact}>
            <Stack spacing={0.4}>
                <FieldLabel label="Stroke" />
                <DesignColorControl title="Stroke" value={value} paletteColors={paletteColors} allowEmpty onChange={onColorChange} />
            </Stack>
            <PropertyNumberInput label="Weight" value={width} onChange={onWidthChange} min={0} />
        </Box>
    );
}

export function ToggleSwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={designEditorStyles.inspector.toggleRow}>
            <Typography sx={designEditorStyles.inspector.toggleRowLabel}>{label}</Typography>
            <Switch size="small" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        </Stack>
    );
}