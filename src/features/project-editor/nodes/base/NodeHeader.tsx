"use client";

import { Stack, Typography } from "@mui/material";

import { NodeBadge } from "@/src/features/project-editor/nodes/base/NodeBadge";
import { NodeIcon } from "@/src/features/project-editor/nodes/base/NodeIcon";
import type { ProjectNodeKind } from "@/src/features/project-editor/types/editor.types";

export function NodeHeader({ kind, name, token }: { kind: ProjectNodeKind; name: string; token: any }) {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1.25} minWidth={0}>
                <NodeIcon kind={kind} />
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                }}>
                    <Typography
                        sx={{
                            fontSize: "0.98rem",
                            lineHeight: 1.15,
                            fontWeight: 700,
                            color: "#111827",
                            letterSpacing: "-0.03em",
                            minWidth: 0,
                        }}
                    >
                        {name}
                    </Typography>
                    <div
                        style={{ backgroundColor: token.accentSoft, width: "fit-content", padding: "2px 4px", borderRadius: "4px", marginTop: 2 }}>
                        <Typography
                            sx={{

                                fontSize: "0.70rem",
                                lineHeight: 1.15,
                                fontWeight: 700,
                                color: token.accent,
                                letterSpacing: "-0.03em",
                                minWidth: 0,
                            }}
                        >
                            {kind.toUpperCase()}
                        </Typography>
                    </div>

                </div>

            </Stack>
            <NodeBadge kind={kind} />
        </Stack>
    );
}
