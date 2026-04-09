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
import {
    BorderBottom02Icon,
    BorderLeft02Icon,
    BorderRight02Icon,
    BorderTop02Icon,
} from "@hugeicons-pro/core-twotone-rounded";
import { Box, ButtonBase, Stack } from "@mui/material";

import { designEditorStyles } from "@/src/customization/design-editor";
import { PropertyNumberInput } from "@/src/features/design-editor/components/inspector/components/InspectorInputControls";
import { TogglePill } from "@/src/features/design-editor/components/inspector/components/InspectorChoiceControls";
import { FieldLabel } from "@/src/features/design-editor/components/inspector/components/InspectorSectionControls";
import type { DesignAutoLayoutAlign, DesignAutoLayoutDirection, DesignAutoLayoutJustify, DesignPadding } from "@/src/features/design-editor/types/design.types";

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
    const [manualMode, setManualMode] = useState<"linked" | "free" | null>(null);
    const isLinkedByValue = value.top === value.right && value.top === value.bottom && value.top === value.left;
    const isLinked = manualMode == null ? isLinkedByValue : manualMode === "linked";

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
                <TogglePill
                    label={isLinked ? "Link" : "Free"}
                    active={isLinked}
                    onClick={() => setManualMode((current) => {
                        if (current == null) {
                            return isLinkedByValue ? "free" : "linked";
                        }

                        return current === "linked" ? "free" : "linked";
                    })}
                />
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