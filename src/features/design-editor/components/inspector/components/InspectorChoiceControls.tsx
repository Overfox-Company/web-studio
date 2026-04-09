"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Box, ButtonBase, Stack, Switch, Typography } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { FieldLabel } from "@/src/features/design-editor/components/inspector/components/InspectorSectionControls";

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

export function ToggleSwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={designEditorStyles.inspector.toggleRow}>
            <Typography sx={designEditorStyles.inspector.toggleRowLabel}>{label}</Typography>
            <Switch size="small" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        </Stack>
    );
}