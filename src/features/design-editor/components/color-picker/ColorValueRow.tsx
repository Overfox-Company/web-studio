"use client";

import { useEffect, useState } from "react";

import { Box, MenuItem, Stack, TextField } from "@mui/material";

import { projectEditorTokens } from "@/src/customization/project-editor";
import { sharedCustomization } from "@/src/customization/shared";

import {
    clamp,
    formatAlphaPercent,
    formatValueForInput,
    hsvaToCss,
    parseValueInput,
    type ColorFormat,
    type HSVAColor,
} from "./ColorConversionUtils";

interface ColorValueRowProps {
    color: HSVAColor;
    format: ColorFormat;
    onFormatChange: (nextFormat: ColorFormat) => void;
    onCommit: (nextColor: HSVAColor) => void;
}

export function ColorValueRow({ color, format, onFormatChange, onCommit }: ColorValueRowProps) {
    const [valueInput, setValueInput] = useState(() => formatValueForInput(color, format));
    const [alphaInput, setAlphaInput] = useState(() => formatAlphaPercent(color.a));

    useEffect(() => {
        setValueInput(formatValueForInput(color, format));
    }, [color, format]);

    useEffect(() => {
        setAlphaInput(formatAlphaPercent(color.a));
    }, [color.a]);

    function commitValue() {
        const parsed = parseValueInput(valueInput, format, color);

        if (!parsed) {
            setValueInput(formatValueForInput(color, format));
            return;
        }

        onCommit({ ...parsed, a: color.a });
    }

    function commitOpacity() {
        const nextOpacity = clamp(Number(alphaInput), 0, 100);

        if (Number.isNaN(nextOpacity)) {
            setAlphaInput(formatAlphaPercent(color.a));
            return;
        }

        onCommit({
            ...color,
            a: nextOpacity / 100,
        });
    }

    return (
        <Stack direction="row" spacing={0.8} alignItems="stretch">
            <TextField
                select
                size="small"
                aria-label="Color format"
                value={format}
                onChange={(event) => onFormatChange(event.target.value as ColorFormat)}
                sx={{ width: 84, ...fieldStyles }}
            >
                <MenuItem value="hex">HEX</MenuItem>
                <MenuItem value="rgb">RGB</MenuItem>
            </TextField>

            <Box
                aria-hidden="true"
                sx={{
                    width: 42,
                    flexShrink: 0,
                    borderRadius: sharedCustomization.radius.lg,
                    background: hsvaToCss(color),
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                }}
            />

            <TextField
                size="small"
                aria-label="Color value"
                value={valueInput}
                onChange={(event) => setValueInput(event.target.value)}
                onBlur={commitValue}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        commitValue();
                    }
                }}
                sx={{ flex: 1, ...fieldStyles }}
            />

            <TextField
                size="small"
                aria-label="Opacity percentage"
                value={alphaInput}
                onChange={(event) => setAlphaInput(event.target.value)}
                onBlur={commitOpacity}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        commitOpacity();
                    }
                }}
                sx={{ width: 76, ...fieldStyles }}
            />
        </Stack>
    );
}

const fieldStyles = {
    "& .MuiOutlinedInput-root": {
        borderRadius: sharedCustomization.radius.lg,
        background: "rgba(255,255,255,0.04)",
        color: sharedCustomization.text.primary,
        "& fieldset": {
            borderColor: "rgba(255,255,255,0.06)",
        },
        "&:hover fieldset": {
            borderColor: "rgba(255,255,255,0.14)",
        },
        "&.Mui-focused fieldset": {
            borderColor: projectEditorTokens.layoutPrimaryAccent,
        },
    },
};