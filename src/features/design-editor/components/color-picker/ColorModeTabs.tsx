"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { DropletIcon, Image01Icon, PaintBrush02Icon } from "@hugeicons-pro/core-solid-standard";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";

import { projectEditorTokens } from "@/src/customization/project-editor";
import { sharedCustomization } from "@/src/customization/shared";

import type { ColorMode } from "./ColorConversionUtils";

interface ColorModeTabsProps {
    mode: ColorMode;
    onChange: (nextMode: ColorMode) => void;
}

const MODE_ITEMS: Array<{
    value: ColorMode;
    label: string;
    icon: React.ReactNode;
    enabled: boolean;
}> = [
    {
        value: "solid",
        label: "Solid",
        icon: <HugeiconsIcon icon={DropletIcon} size={16} strokeWidth={0} />,
        enabled: true,
    },
    {
        value: "linear-gradient",
        label: "Linear",
        icon: <HugeiconsIcon icon={PaintBrush02Icon} size={16} strokeWidth={0} />,
        enabled: false,
    },
    {
        value: "radial-gradient",
        label: "Radial",
        icon: <HugeiconsIcon icon={PaintBrush02Icon} size={16} strokeWidth={0} />,
        enabled: false,
    },
    {
        value: "conic-gradient",
        label: "Conic",
        icon: <HugeiconsIcon icon={PaintBrush02Icon} size={16} strokeWidth={0} />,
        enabled: false,
    },
    {
        value: "image-fill",
        label: "Image",
        icon: <HugeiconsIcon icon={Image01Icon} size={16} strokeWidth={0} />,
        enabled: false,
    },
];

export function ColorModeTabs({ mode, onChange }: ColorModeTabsProps) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: 0.5,
                p: 0.5,
                borderRadius: sharedCustomization.radius.xl,
                background: "rgba(255,255,255,0.04)",
            }}
        >
            {MODE_ITEMS.map((item) => {
                const isActive = item.value === mode;

                return (
                    <ButtonBase
                        key={item.value}
                        disableRipple={!item.enabled}
                        disabled={!item.enabled}
                        onClick={() => item.enabled && onChange(item.value)}
                        aria-label={item.label}
                        sx={{
                            minHeight: 44,
                            borderRadius: sharedCustomization.radius.lg,
                            px: 0.5,
                            background: isActive ? projectEditorTokens.layoutPrimaryAccentSoft : "transparent",
                            color: isActive ? projectEditorTokens.layoutPrimaryAccent : item.enabled ? sharedCustomization.text.secondary : sharedCustomization.text.subtleOnDark,
                            opacity: item.enabled ? 1 : 0.46,
                            transition: `background ${sharedCustomization.transition.standard}, color ${sharedCustomization.transition.standard}`,
                            "&:focus-visible": {
                                outline: `2px solid ${projectEditorTokens.layoutPrimaryAccent}`,
                                outlineOffset: 2,
                            },
                        }}
                    >
                        <Stack spacing={0.35} alignItems="center">
                            <Box sx={{ display: "inline-flex" }}>{item.icon}</Box>
                            <Typography sx={{ fontSize: "0.69rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                                {item.label}
                            </Typography>
                            {!item.enabled ? (
                                <Typography sx={{ fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.08em", color: sharedCustomization.text.subtleOnDark }}>
                                    Soon
                                </Typography>
                            ) : null}
                        </Stack>
                    </ButtonBase>
                );
            })}
        </Box>
    );
}