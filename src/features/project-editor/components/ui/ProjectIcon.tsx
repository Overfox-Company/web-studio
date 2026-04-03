"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

interface ProjectIconProps {
    icon: IconSvgElement;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export function ProjectIcon({
    icon,
    size = 20,
    strokeWidth = 0,
    color = "currentColor",
}: ProjectIconProps) {
    return <HugeiconsIcon icon={icon} size={size} strokeWidth={strokeWidth} color={color} />;
}
