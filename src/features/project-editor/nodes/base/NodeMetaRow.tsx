"use client";

import { Stack, Typography } from "@mui/material";

export function NodeMetaRow({ label, value }: { label: string; value: string }) {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography sx={{ fontSize: "0.74rem", color: "#667085", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {label}
            </Typography>
            <Typography
                sx={{
                    fontSize: "0.8rem",
                    color: "#111827",
                    fontWeight: 600,
                    textAlign: "right",
                    letterSpacing: "-0.01em",
                }}
            >
                {value}
            </Typography>
        </Stack>
    );
}
