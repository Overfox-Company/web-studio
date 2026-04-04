"use client";

import { Box, Slider, Stack, Typography } from "@mui/material";

import { projectEditorTokens } from "@/src/customization/project-editor";
import { sharedCustomization } from "@/src/customization/shared";

interface HueSliderProps {
    value: number;
    onPreviewChange: (nextHue: number) => void;
    onCommit: (nextHue: number) => void;
}

export function HueSlider({ value, onPreviewChange, onCommit }: HueSliderProps) {
    return (
        <Stack spacing={0.55}>
            <Typography sx={labelStyles}>Hue</Typography>
            <Box sx={sliderShellStyles}>
                <Slider
                    aria-label="Hue"
                    min={0}
                    max={360}
                    value={value}
                    onChange={(_, nextValue) => onPreviewChange(Number(nextValue))}
                    onChangeCommitted={(_, nextValue) => onCommit(Number(nextValue))}
                    sx={{
                        color: projectEditorTokens.layoutPrimaryAccent,
                        height: 10,
                        p: 0,
                        "& .MuiSlider-rail": {
                            opacity: 1,
                            background: "linear-gradient(90deg, #FF3B30 0%, #FF9500 16%, #FFD60A 32%, #34C759 48%, #32ADE6 64%, #5856D6 82%, #FF2D55 100%)",
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