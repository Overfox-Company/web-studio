"use client";

import { useMemo } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { DropperIcon } from "@hugeicons-pro/core-solid-standard";
import { IconButton, Tooltip } from "@mui/material";

import { projectEditorTokens } from "@/src/customization/project-editor";

import { parseCssColor, type HSVAColor } from "./ColorConversionUtils";

interface EyeDropperAPI {
    open(): Promise<{ sRGBHex: string }>;
}

interface EyedropperButtonProps {
    onPick: (nextColor: HSVAColor) => void;
}

export function EyedropperButton({ onPick }: EyedropperButtonProps) {
    const eyeDropper = useMemo(() => {
        const scope = globalThis as typeof globalThis & { EyeDropper?: new () => EyeDropperAPI };
        return scope.EyeDropper ? new scope.EyeDropper() : null;
    }, []);

    return (
        <Tooltip title={eyeDropper ? "Pick from screen" : "EyeDropper API is not supported"}>
            <span>
                <IconButton
                    aria-label="Pick color from screen"
                    size="small"
                    disabled={!eyeDropper}
                    onClick={async () => {
                        if (!eyeDropper) {
                            return;
                        }

                        try {
                            const result = await eyeDropper.open();
                            onPick(parseCssColor(result.sRGBHex));
                        } catch {
                            return;
                        }
                    }}
                    sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 1.5,
                        background: "rgba(255,255,255,0.05)",
                        color: projectEditorTokens.layoutPrimaryAccent,
                    }}
                >
                    <HugeiconsIcon icon={DropperIcon} size={18} strokeWidth={0} />
                </IconButton>
            </span>
        </Tooltip>
    );
}