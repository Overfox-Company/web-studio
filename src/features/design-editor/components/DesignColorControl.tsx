"use client";

import { useMemo, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { DropperIcon } from "@hugeicons-pro/core-solid-standard";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";

import { projectEditorTokens } from "@/src/customization/project-editor";
import { sharedCustomization } from "@/src/customization/shared";

import { ColorPickerPopover } from "@/src/features/design-editor/components/color-picker/ColorPickerPopover";
import { detectColorMode, uniquePalette } from "@/src/features/design-editor/components/color-picker/ColorConversionUtils";

interface DesignColorControlProps {
    title: string;
    value: string;
    onChange: (nextValue: string) => void;
    paletteColors?: string[];
    allowGradient?: boolean;
    allowEmpty?: boolean;
}

function summarizeValue(value: string) {
    if (!value) {
        return "None";
    }

    if (detectColorMode(value, true) !== "solid") {
        return "Fill Mode";
    }

    return value.toUpperCase();
}

export function DesignColorControl({
    title,
    value,
    onChange,
    paletteColors = [],
    allowGradient = false,
    allowEmpty = false,
}: DesignColorControlProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [manualPalette, setManualPalette] = useState<string[]>([]);
    const popoverOpen = Boolean(anchorEl);
    const mergedPalette = useMemo(
        () => uniquePalette([
            projectEditorTokens.layoutPrimaryAccent,
            projectEditorTokens.layoutPrimaryAccentStrong,
            "#FFFFFF",
            "#ADBBD7",
            "#7D7F85",
            "#242326",
            "#161618",
            ...paletteColors,
        ]),
        [paletteColors],
    );

    return (
        <>
            <ButtonBase
                aria-label={`Open ${title} picker`}
                onClick={(event) => setAnchorEl(event.currentTarget)}
                sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    gap: 1,
                    px: 1.2,
                    py: 1,
                    borderRadius: sharedCustomization.radius.lg,
                    background: "rgba(36, 35, 38, 0.98)",
                    border: "1px solid transparent",
                    color: sharedCustomization.text.primary,
                    transition: `background ${sharedCustomization.transition.standard}, border-color ${sharedCustomization.transition.standard}`,
                    "&:hover": {
                        background: "rgba(46, 45, 49, 0.98)",
                        borderColor: projectEditorTokens.layoutPrimaryAccentBorder,
                    },
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box
                        sx={{
                            width: 18,
                            height: 18,
                            borderRadius: 0.9,
                            background: value || "transparent",
                            boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 0 1px ${projectEditorTokens.shellBackground}`,
                            flexShrink: 0,
                        }}
                    />
                    <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {summarizeValue(value)}
                    </Typography>
                </Stack>

                <HugeiconsIcon icon={DropperIcon} size={18} color={projectEditorTokens.layoutPrimaryAccent} strokeWidth={0} />
            </ButtonBase>

            <ColorPickerPopover
                anchorEl={anchorEl}
                open={popoverOpen}
                title={title}
                value={value}
                paletteColors={mergedPalette}
                allowGradient={allowGradient}
                allowEmpty={allowEmpty}
                manualPalette={manualPalette}
                onManualPaletteChange={setManualPalette}
                onChange={onChange}
                onClose={() => setAnchorEl(null)}
            />
        </>
    );
}