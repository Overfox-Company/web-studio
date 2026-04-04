"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons-pro/core-solid-standard";
import { Box, ButtonBase, MenuItem, Stack, TextField, Typography } from "@mui/material";

import { projectEditorTokens } from "@/src/customization/project-editor";
import { sharedCustomization } from "@/src/customization/shared";

interface PaletteSectionProps {
    colors: string[];
    onApply: (value: string) => void;
    onAddCurrent: () => void;
}

export function PaletteSection({ colors, onApply, onAddCurrent }: PaletteSectionProps) {
    return (
        <Stack spacing={0.8}>
            <Stack direction="row" spacing={0.8} alignItems="center">
                <TextField
                    select
                    size="small"
                    aria-label="Palette source"
                    value="page"
                    sx={{
                        minWidth: 142,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: sharedCustomization.radius.lg,
                            background: "rgba(255,255,255,0.04)",
                        },
                    }}
                >
                    <MenuItem value="page">On this page</MenuItem>
                </TextField>

                <ButtonBase
                    aria-label="Add current color to palette"
                    onClick={onAddCurrent}
                    sx={{
                        width: 38,
                        height: 38,
                        borderRadius: sharedCustomization.radius.lg,
                        background: projectEditorTokens.layoutPrimaryAccentSoft,
                        color: projectEditorTokens.layoutPrimaryAccent,
                        "&:focus-visible": {
                            outline: `2px solid ${projectEditorTokens.layoutPrimaryAccent}`,
                            outlineOffset: 2,
                        },
                    }}
                >
                    <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={0} />
                </ButtonBase>
            </Stack>

            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: sharedCustomization.text.mutedOnDark, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Swatches
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
                    gap: 0.6,
                }}
            >
                {colors.map((color) => (
                    <ButtonBase
                        key={color}
                        aria-label={`Apply ${color}`}
                        onClick={() => onApply(color)}
                        sx={{
                            width: "100%",
                            aspectRatio: "1 / 1",
                            borderRadius: sharedCustomization.radius.md,
                            background: color,
                            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                            "&:focus-visible": {
                                outline: `2px solid ${projectEditorTokens.layoutPrimaryAccent}`,
                                outlineOffset: 2,
                            },
                        }}
                    />
                ))}
            </Box>
        </Stack>
    );
}