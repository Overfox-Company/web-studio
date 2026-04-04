export type ColorMode = "solid" | "linear-gradient" | "radial-gradient" | "conic-gradient" | "image-fill";

export type ColorFormat = "hex" | "rgb";

export interface HSVAColor {
    h: number;
    s: number;
    v: number;
    a: number;
}

export interface RGBAColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

const DEFAULT_COLOR: HSVAColor = {
    h: 98,
    s: 48,
    v: 85,
    a: 1,
};

function splitCssArguments(value: string) {
    const segments: string[] = [];
    let current = "";
    let depth = 0;

    for (const character of value) {
        if (character === "(") {
            depth += 1;
        } else if (character === ")") {
            depth = Math.max(0, depth - 1);
        }

        if (character === "," && depth === 0) {
            if (current.trim()) {
                segments.push(current.trim());
            }
            current = "";
            continue;
        }

        current += character;
    }

    if (current.trim()) {
        segments.push(current.trim());
    }

    return segments;
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export function round(value: number, precision = 2) {
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
}

export function detectColorMode(value: string, allowGradient: boolean) {
    const normalized = value.trim().toLowerCase();

    if (allowGradient && normalized.startsWith("linear-gradient(")) {
        return "linear-gradient" satisfies ColorMode;
    }

    if (allowGradient && normalized.startsWith("radial-gradient(")) {
        return "radial-gradient" satisfies ColorMode;
    }

    if (allowGradient && normalized.startsWith("conic-gradient(")) {
        return "conic-gradient" satisfies ColorMode;
    }

    if (normalized.startsWith("url(")) {
        return "image-fill" satisfies ColorMode;
    }

    return "solid" satisfies ColorMode;
}

export function rgbaToHsva(color: RGBAColor): HSVAColor {
    const red = color.r / 255;
    const green = color.g / 255;
    const blue = color.b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    let hue = 0;

    if (delta !== 0) {
        switch (max) {
            case red:
                hue = ((green - blue) / delta) % 6;
                break;
            case green:
                hue = (blue - red) / delta + 2;
                break;
            default:
                hue = (red - green) / delta + 4;
                break;
        }
    }

    hue = Math.round(hue * 60);

    if (hue < 0) {
        hue += 360;
    }

    const saturation = max === 0 ? 0 : delta / max;

    return {
        h: hue,
        s: Math.round(saturation * 100),
        v: Math.round(max * 100),
        a: clamp(color.a, 0, 1),
    };
}

export function hsvaToRgba(color: HSVAColor): RGBAColor {
    const hue = ((color.h % 360) + 360) % 360;
    const saturation = clamp(color.s, 0, 100) / 100;
    const value = clamp(color.v, 0, 100) / 100;
    const chroma = value * saturation;
    const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
    const match = value - chroma;

    let red = 0;
    let green = 0;
    let blue = 0;

    if (hue < 60) {
        red = chroma;
        green = x;
    } else if (hue < 120) {
        red = x;
        green = chroma;
    } else if (hue < 180) {
        green = chroma;
        blue = x;
    } else if (hue < 240) {
        green = x;
        blue = chroma;
    } else if (hue < 300) {
        red = x;
        blue = chroma;
    } else {
        red = chroma;
        blue = x;
    }

    return {
        r: Math.round((red + match) * 255),
        g: Math.round((green + match) * 255),
        b: Math.round((blue + match) * 255),
        a: clamp(color.a, 0, 1),
    };
}

export function rgbaToHex(color: RGBAColor, includeAlpha = false) {
    const channels = [color.r, color.g, color.b].map((channel) => clamp(channel, 0, 255).toString(16).padStart(2, "0").toUpperCase());

    if (includeAlpha) {
        channels.push(Math.round(clamp(color.a, 0, 1) * 255).toString(16).padStart(2, "0").toUpperCase());
    }

    return `#${channels.join("")}`;
}

export function rgbaToCss(color: RGBAColor) {
    if (color.a >= 0.999) {
        return rgbaToHex(color);
    }

    return `rgba(${color.r}, ${color.g}, ${color.b}, ${round(color.a, 2)})`;
}

export function hsvaToCss(color: HSVAColor) {
    return rgbaToCss(hsvaToRgba(color));
}

export function hsvaToRgbFields(color: HSVAColor) {
    const rgba = hsvaToRgba(color);

    return {
        r: String(rgba.r),
        g: String(rgba.g),
        b: String(rgba.b),
    };
}

export function hsvaToHex(color: HSVAColor, includeAlpha = false) {
    return rgbaToHex(hsvaToRgba(color), includeAlpha);
}

function parseHex(value: string): RGBAColor | null {
    const normalized = value.trim().replace(/^#/, "");

    if (![3, 4, 6, 8].includes(normalized.length)) {
        return null;
    }

    const expanded = normalized.length <= 4
        ? normalized.split("").map((character) => `${character}${character}`).join("")
        : normalized;

    const red = Number.parseInt(expanded.slice(0, 2), 16);
    const green = Number.parseInt(expanded.slice(2, 4), 16);
    const blue = Number.parseInt(expanded.slice(4, 6), 16);
    const alpha = expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1;

    if ([red, green, blue].some((channel) => Number.isNaN(channel)) || Number.isNaN(alpha)) {
        return null;
    }

    return { r: red, g: green, b: blue, a: alpha };
}

function parseRgbLike(value: string): RGBAColor | null {
    const normalized = value.trim();
    const match = normalized.match(/^rgba?\((.+)\)$/i);

    if (!match) {
        return null;
    }

    const parts = splitCssArguments(match[1]);

    if (parts.length < 3) {
        return null;
    }

    const red = clamp(Number(parts[0]), 0, 255);
    const green = clamp(Number(parts[1]), 0, 255);
    const blue = clamp(Number(parts[2]), 0, 255);
    const alpha = parts[3] == null ? 1 : clamp(Number(parts[3]), 0, 1);

    if ([red, green, blue, alpha].some((channel) => Number.isNaN(channel))) {
        return null;
    }

    return { r: red, g: green, b: blue, a: alpha };
}

function parseHslLike(value: string): RGBAColor | null {
    const normalized = value.trim();
    const match = normalized.match(/^hsla?\((.+)\)$/i);

    if (!match) {
        return null;
    }

    const parts = splitCssArguments(match[1]);

    if (parts.length < 3) {
        return null;
    }

    const hue = clamp(Number(parts[0].replace("deg", "")), 0, 360);
    const saturation = clamp(Number(parts[1].replace("%", "")), 0, 100);
    const lightness = clamp(Number(parts[2].replace("%", "")), 0, 100);
    const alpha = parts[3] == null ? 1 : clamp(Number(parts[3]), 0, 1);

    if ([hue, saturation, lightness, alpha].some((channel) => Number.isNaN(channel))) {
        return null;
    }

    const sat = saturation / 100;
    const lig = lightness / 100;
    const chroma = (1 - Math.abs(2 * lig - 1)) * sat;
    const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
    const matchValue = lig - chroma / 2;

    let red = 0;
    let green = 0;
    let blue = 0;

    if (hue < 60) {
        red = chroma;
        green = x;
    } else if (hue < 120) {
        red = x;
        green = chroma;
    } else if (hue < 180) {
        green = chroma;
        blue = x;
    } else if (hue < 240) {
        green = x;
        blue = chroma;
    } else if (hue < 300) {
        red = x;
        blue = chroma;
    } else {
        red = chroma;
        blue = x;
    }

    return {
        r: Math.round((red + matchValue) * 255),
        g: Math.round((green + matchValue) * 255),
        b: Math.round((blue + matchValue) * 255),
        a: alpha,
    };
}

export function parseCssColor(value: string, fallback = DEFAULT_COLOR): HSVAColor {
    const normalized = value.trim();

    if (!normalized) {
        return fallback;
    }

    if (normalized.toLowerCase() === "transparent") {
        return { ...fallback, a: 0 };
    }

    const rgba = parseHex(normalized) ?? parseRgbLike(normalized) ?? parseHslLike(normalized);

    return rgba ? rgbaToHsva(rgba) : fallback;
}

export function parseValueInput(value: string, format: ColorFormat, current: HSVAColor) {
    if (format === "hex") {
        const rgba = parseHex(value);
        return rgba ? rgbaToHsva({ ...rgba, a: current.a }) : null;
    }

    const parts = value.split(/[\s,]+/).filter(Boolean);

    if (parts.length !== 3) {
        return null;
    }

    const red = clamp(Number(parts[0]), 0, 255);
    const green = clamp(Number(parts[1]), 0, 255);
    const blue = clamp(Number(parts[2]), 0, 255);

    if ([red, green, blue].some((channel) => Number.isNaN(channel))) {
        return null;
    }

    return rgbaToHsva({ r: red, g: green, b: blue, a: current.a });
}

export function formatValueForInput(color: HSVAColor, format: ColorFormat) {
    if (format === "hex") {
        return hsvaToHex(color);
    }

    const rgb = hsvaToRgbFields(color);
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

export function formatAlphaPercent(alpha: number) {
    return String(Math.round(clamp(alpha, 0, 1) * 100));
}

export function copyValueForColor(color: HSVAColor) {
    const rgba = hsvaToRgba(color);
    return rgba.a >= 0.999 ? rgbaToHex(rgba) : rgbaToCss(rgba);
}

export function normalizePaletteColor(value: string) {
    const mode = detectColorMode(value, true);

    if (mode !== "solid") {
        return null;
    }

    return hsvaToCss(parseCssColor(value));
}

export function uniquePalette(values: string[]) {
    const result: string[] = [];
    const seen = new Set<string>();

    for (const value of values) {
        const normalized = normalizePaletteColor(value);

        if (!normalized) {
            continue;
        }

        const key = normalized.toLowerCase();

        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        result.push(normalized);
    }

    return result;
}