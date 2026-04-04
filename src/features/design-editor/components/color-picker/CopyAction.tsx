"use client";

import { useState } from "react";

import { Box, ButtonBase, Typography } from "@mui/material";

import { projectEditorTokens } from "@/src/customization/project-editor";
import { sharedCustomization } from "@/src/customization/shared";

interface CopyActionProps {
    value: string;
}

export function CopyAction({ value }: CopyActionProps) {
    const [copied, setCopied] = useState(false);

    return (
        <ButtonBase
            aria-label="Copy color"
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(value);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1200);
                } catch {
                    setCopied(false);
                }
            }}
            sx={{
                width: "100%",
                minHeight: 44,
                borderRadius: sharedCustomization.radius.xl,
                background: projectEditorTokens.layoutPrimaryAccentSoft,
                color: projectEditorTokens.layoutPrimaryAccent,
                justifyContent: "space-between",
                px: 1.4,
                "&:focus-visible": {
                    outline: `2px solid ${projectEditorTokens.layoutPrimaryAccent}`,
                    outlineOffset: 2,
                },
            }}
        >
            <Typography sx={{ fontSize: "0.86rem", fontWeight: 700 }}>Copy</Typography>
            <Box sx={{ fontSize: "0.74rem", fontWeight: 700, color: copied ? projectEditorTokens.layoutPrimaryAccent : sharedCustomization.text.secondary }}>
                {copied ? "Copied" : value}
            </Box>
        </ButtonBase>
    );
}