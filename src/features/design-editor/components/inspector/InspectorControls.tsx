"use client";

import { useState } from "react";

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
} from "@hugeicons-pro/core-solid-standard";
import { Box, ButtonBase, Stack, Switch, TextField, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { DesignColorControl } from "@/src/features/design-editor/components/DesignColorControl";
import type { DesignAutoLayoutAlign, DesignAutoLayoutDirection, DesignAutoLayoutJustify, DesignPadding } from "@/src/features/design-editor/types/design.types";

export function InspectorSectionHeader({ title, icon, meta }: { title: string; icon: IconSvgElement; meta?: React.ReactNode }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={designEditorStyles.inspector.sectionHeader}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <Box sx={designEditorStyles.inspector.sectionIconBadge}>
                    <HugeiconsIcon icon={icon} size={15} strokeWidth={0} />
                </Box>
                <Typography sx={designEditorStyles.inspector.sectionTitle}>{title}</Typography>
            </Stack>
            {meta}
        </Stack>
    );
}

export function InspectorSection({ title, icon, meta, children }: { title: string; icon: IconSvgElement; meta?: React.ReactNode; children: React.ReactNode }) {
    return (
        <Stack spacing={1.2} sx={designEditorStyles.inspector.section}>
            <InspectorSectionHeader title={title} icon={icon} meta={meta} />
            <Stack spacing={1.05}>{children}</Stack>
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
            minRows={multiline ? 3 : undefined}
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
    icon,
    unit,
    min,
}: {
    value: number;
    onChange: (nextValue: number) => void;
    label?: string;
    icon?: IconSvgElement;
    unit?: string;
    min?: number;
}) {
    return (
        <Stack spacing={0.45}>
            {label ? <FieldLabel label={label} /> : null}
            <Box sx={designEditorStyles.inspector.metricField}>
                {icon ? (
                    <Box sx={designEditorStyles.inspector.metricIcon}>
                        <HugeiconsIcon icon={icon} size={14} strokeWidth={0} />
                    </Box>
                ) : null}
                <TextField
                    type="number"
                    value={value}
                    onChange={(event) => {
                        const nextValue = Number(event.target.value);

                        if (Number.isNaN(nextValue) || nextValue === value) {
                            return;
                        }

                        onChange(min == null ? nextValue : Math.max(min, nextValue));
                    }}
                    sx={designEditorStyles.inspector.metricInput}
                />
                {unit ? <Typography sx={designEditorStyles.inspector.metricUnit}>{unit}</Typography> : null}
            </Box>
        </Stack>
    );
}

export function IconValueField({ label, value, icon }: { label: string; value: string; icon?: IconSvgElement }) {
    return (
        <Stack spacing={0.45}>
            <FieldLabel label={label} />
            <Box sx={designEditorStyles.inspector.metricFieldStatic}>
                {icon ? (
                    <Box sx={designEditorStyles.inspector.metricIcon}>
                        <HugeiconsIcon icon={icon} size={14} strokeWidth={0} />
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
        <Stack spacing={0.55}>
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
                            <HugeiconsIcon icon={item.icon} size={16} strokeWidth={0} />
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

    function updateSide(side: keyof DesignPadding, nextValue: number) {
        if (isLinked) {
            onChange({ top: nextValue, right: nextValue, bottom: nextValue, left: nextValue });
            return;
        }

        onChange({ [side]: nextValue });
    }

    return (
        <Stack spacing={0.55}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FieldLabel label={label} />
                <TogglePill label={isLinked ? "Linked" : "Free"} active={isLinked} onClick={() => setIsLinked((current) => !current)} />
            </Stack>

            <Box sx={designEditorStyles.inspector.fourUpGrid}>
                <PropertyNumberInput label="T" value={value.top} onChange={(nextValue) => updateSide("top", nextValue)} min={0} />
                <PropertyNumberInput label="R" value={value.right} onChange={(nextValue) => updateSide("right", nextValue)} min={0} />
                <PropertyNumberInput label="B" value={value.bottom} onChange={(nextValue) => updateSide("bottom", nextValue)} min={0} />
                <PropertyNumberInput label="L" value={value.left} onChange={(nextValue) => updateSide("left", nextValue)} min={0} />
            </Box>
        </Stack>
    );
}

export function FillRowControl({ title, value, onChange, paletteColors }: { title: string; value: string; onChange: (nextValue: string) => void; paletteColors: string[] }) {
    return (
        <Stack spacing={0.55}>
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
            <Stack spacing={0.55}>
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
            <Switch checked={checked} onChange={(event) => onChange(event.target.checked)} />
        </Stack>
    );
}