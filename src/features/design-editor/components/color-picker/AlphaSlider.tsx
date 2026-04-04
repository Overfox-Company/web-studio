"use client";

import { Box, Slider, Stack, Typography } from "@mui/material";

import { projectEditorTokens } from "@/src/customization/project-editor";
import { sharedCustomization } from "@/src/customization/shared";

import { hsvaToRgba, type HSVAColor } from "./ColorConversionUtils";

interface AlphaSliderProps {
    color: HSVAColor;
    onPreviewChange: (nextAlpha: number) => void;
    onCommit: (nextAlpha: number) => void;
}

export function AlphaSlider({ color, onPreviewChange, onCommit }: AlphaSliderProps) {
    const rgba = hsvaToRgba({ ...color, a: 1 });
    const transparent = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0)`;
    const opaque = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 1)`;

    return (
        <Stack spacing={0.55}>
            <Typography sx={labelStyles}>Opacity</Typography>
            <Box sx={sliderShellStyles}>
                <Box
                    sx={{
                        borderRadius: sharedCustomization.radius.md,
                        overflow: "hidden",
                        backgroundImage: `${checkerboard}, linear-gradient(90deg, ${transparent} 0%, ${opaque} 100%)`,
                    }}
                >
                    <Slider
                        aria-label="Opacity"
                        min={0}
                        max={100}
                        value={Math.round(color.a * 100)}
                        onChange={(_, nextValue) => onPreviewChange(Number(nextValue) / 100)}
                        onChangeCommitted={(_, nextValue) => onCommit(Number(nextValue) / 100)}
                        sx={{
                            color: projectEditorTokens.layoutPrimaryAccent,
                            height: 10,
                            p: 0,
                            "& .MuiSlider-rail": {
                                opacity: 0,
                            },
                            "& .MuiSlider-track": {
                                border: "none",
                                background: "transparent",
                            },
                            "& .MuiSlider-thumb": {
                                width: 16,
                                height: 16,
                                background: "#FFFFFF",
                                boxShadow: `0 0 0 1px ${projectEditorTokens.shellBackground}, 0 6px 18px rgba(0,0,0,0.34)`,
                            },
                        }}
                    />
                </Box>
            </Box>
        </Stack>
    );
}

const labelStyles = {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: sharedCustomization.text.mutedOnDark,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
};

const sliderShellStyles = {
    px: 0.9,
    py: 0.8,
    borderRadius: sharedCustomization.radius.lg,
    background: "rgba(255,255,255,0.04)",
};

const checkerboard = "linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.08) 75%)";