name: frontend-design
description: Design-system-first workflow for UI design with deep rules, patterns, anti-patterns, and implementation guidance.
--------------
# Frontend Design Skill

## Goal

Provide a design-system-first workflow for UI design with clear decision rules, patterns, anti-patterns, and implementation guidance. Always use the project's existing visual system before introducing fallback defaults.

## Version

2.0

## Core Principle

Always prioritize the project's design system before using defaults.

## When To Use

Use this skill when:

1. Designing a new screen, flow, or component.
2. Updating an existing interface.
3. Creating design tokens or implementation guidance.
4. Translating product requirements into practical UI rules.
5. Reviewing a layout for consistency, hierarchy, and clarity.

## Workflow

Follow this sequence before proposing styles, tokens, or component behaviors:

1. Detect whether a design system exists.
2. Detect the project palette.
3. Detect the project typography.
4. Detect the spacing system.
5. If anything is missing, ask the user.
6. If there is no answer, use fallback tokens.
7. Never override project decisions.

## Required AI Behavior

- Prefer the project's design system, palette, typography, spacing, and component patterns over generic defaults.
- Ask for missing palette, typography, or spacing information before inventing new tokens.
- If the user does not respond, fall back to the default tokens in this file.
- Never overwrite explicit project decisions with personal taste or generic trends.
- If an element does not communicate something useful, remove it or simplify it.

## Design Analysis

### Global Pattern

Modular, card-based UI oriented around data, with clear visual hierarchy and minimal but intentional use of color.

### Mental Model

Decision-oriented interfaces: every element should help the user understand, compare, or act.

## Color System

### Principles

- Color communicates state, not decoration.
- Fewer colors create more clarity.
- Contrast defines hierarchy.
- Background establishes layers.

### Layer Model

#### Background

Purpose: base layer of the application.

Rules:

- It must contrast with cards and surfaces.
- It must never compete with content.

#### Surface

Purpose: cards and containers.

Rules:

- It should be lighter or darker than the background.
- It should visually separate content blocks.

#### Elevated

Purpose: modals, dropdowns, popovers, and floating UI.

Rules:

- Use stronger contrast or shadow.
- It should feel visually above the rest of the interface.

### Correct Use Cases

- Use the primary color only for important actions.
- Use green only for success states.
- Use red only for error states.

### Incorrect Use Cases

- Using multiple primary colors.
- Using colors without semantic meaning.
- Using red or green as decoration.

### Example

Correct:

```jsx
<div className="bg-gray-50">
  <div className="bg-white text-gray-900">
    <button className="bg-blue-600 text-white">Action</button>
  </div>
</div>
```

Incorrect:

```jsx
<div className="bg-red-200 text-green-400">Bad contrast</div>
```

## Typography

### Principles

- Use one font family.
- Weight defines importance.
- Size defines hierarchy.

### Rules

- Use a maximum of 3 weights: 400, 600, and 700.
- Keep line height consistent.
- Avoid unnecessary font changes.
- Body line height should stay between 1.5 and 1.6.
- Heading line height should stay between 1.1 and 1.3.

### Priority

Choose typography in this order:

1. Project typography.
2. Design system typography.
3. Fallback system stack.

### Correct Use Cases

- Large, bold KPI values.
- Small, lighter metadata.
- Medium-weight titles.

### Incorrect Use Cases

- Using multiple font families.
- Making everything bold.
- Using the same size for everything.

### Example

Correct:

```jsx
<h1 className="text-3xl font-bold">$12,400</h1>
<p className="text-sm text-gray-500">Revenue</p>
```

Incorrect:

```jsx
<h1 className="text-lg font-normal">$12,400</h1>
```

### Type Scale

| Token | Size | Line Height | Purpose |
| --- | ---: | ---: | --- |
| `title-xxxl` | 80px | 88px | Hero headings |
| `title-xxl` | 64px | 72px | Page titles |
| `title-xl` | 48px | 56px | Section headings |
| `title-l` | 40px | 48px | Large section headings |
| `title-m` | 32px | 40px | Subsections |
| `title-s` | 24px | 32px | Component headings |
| `headline` | 20px | 28px | Short descriptive text |
| `body` | 16px | 24px | Main readable content |
| `caption` | 14px | 20px | Metadata and labels |
| `caption-small` | 12px | 20px | Secondary metadata |

## Spacing

### Principles

- Space creates hierarchy.
- More space implies more importance.
- Spacing separates better than color.

### Scale

```text
4, 8, 12, 16, 24, 32, 48, 64
```

### Rules

- Keep internal padding small.
- Use medium gaps between related components.
- Use large gaps between sections.

### Correct Use Cases

- Cards with 16px padding.
- Sections separated by 32px or more.

### Incorrect Use Cases

- Elements placed too close together.
- Inconsistent spacing between similar structures.

### Example

Correct:

```jsx
<div className="p-4 space-y-6">
  <div className="p-4 bg-white"></div>
</div>
```

Incorrect:

```jsx
<div className="p-1">
  <div></div>
</div>
```

## Radius

### Principles

- Maintain visual consistency.
- Use modern softness deliberately.

### Scale

```text
0, 4, 8, 16, 24, 48
```

### Rules

- Cards: 16px.
- Buttons: 8px.
- Inputs: 8px to 12px.
- Avatars: 50%.

### Critical Rule

If a container is rounded, its content must respect that radius.

### Correct Use Cases

- Images inside cards using the same radius.
- Using `overflow-hidden` when needed.

### Incorrect Use Cases

- Rectangular images inside rounded cards.
- Inconsistent radius values across similar elements.

### Example

Correct:

```jsx
<div className="rounded-2xl overflow-hidden">
  <img className="rounded-t-2xl" src="/img.jpg" />
</div>
```

Incorrect:

```jsx
<div className="rounded-2xl">
  <img src="/img.jpg" />
</div>
```

## Shadows

### Principles

- Shadow indicates hierarchy.
- It should stay subtle.

### Levels

- Base: `none`
- Card: `shadow-sm`
- Hover: `shadow-md`
- Modal: `shadow-lg`

### Correct Use Cases

- Cards with light shadow.
- Hover states with subtle transitions.

### Incorrect Use Cases

- Heavy shadows.
- Multiple stacked shadows.
- Harsh black shadows.

### Example

Correct:

```jsx
<div className="shadow-sm hover:shadow-md transition"></div>
```

Incorrect:

```html
<div style="box-shadow: 0 10px 40px rgba(0,0,0,0.8)"></div>
```

## Components

### Cards

Use cards for:

- Grouping related information.
- Dashboards.
- Visual lists.

Rules:

- Keep internal padding consistent.
- Keep clear separation between cards.
- Use radius and shadow together to define the module.

### Buttons

Rules:

- Allow one primary action per screen.
- Define clear states.
- Do not overload the interface with buttons.

Supported states:

- Default
- Hover
- Active
- Disabled

### Inputs

Rules:

- Always provide a label.
- Never rely only on placeholders.
- Make states clear and accessible.

## Visual Elements

### Rules

- Use icons for actions.
- Use charts for trends.
- Use color for state.

### Correct Use Cases

- Use a chart to show growth or decline.
- Use an icon for a quick action.

### Incorrect Use Cases

- Long text where a chart would communicate faster.
- Decorative icons without function.

## Highlighting

### Rules

- Highlight only what matters.
- Use contrast, not saturation.

### Methods

- Color
- Size
- Background
- Badge

### Incorrect Use Cases

- Highlighting everything.
- Using multiple strong colors at once.

## Interaction

### States

- Default
- Hover
- Active
- Disabled
- Error
- Success

### Rules

- Every interactive element must provide feedback.
- Hover transitions should be fast, usually 150ms to 250ms.

## Accessibility

### Rules

- Maintain a minimum contrast ratio of 4.5:1.
- Keep the minimum target size at 44px.
- Every input must have a label.
- Focus states must be visible.

## Implementation Guidance

When using this skill, structure recommendations in this order:

1. Existing project design system constraints.
2. Missing information that must be confirmed.
3. Proposed rules for color, typography, spacing, radius, and shadows.
4. Component behavior and interaction states.
5. Accessibility checks.
6. Fallback tokens only if project tokens are unavailable.

## Fallback Tokens

Use these only if the project has no explicit tokens and the user does not provide them.

```css
:root {
  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-48: 48px;
  --space-64: 64px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --font-family-base: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  --font-size-title-xxxl: 80px;
  --line-height-title-xxxl: 88px;
  --font-size-title-xxl: 64px;
  --line-height-title-xxl: 72px;
  --font-size-title-xl: 48px;
  --line-height-title-xl: 56px;
  --font-size-title-l: 40px;
  --line-height-title-l: 48px;
  --font-size-title-m: 32px;
  --line-height-title-m: 40px;
  --font-size-title-s: 24px;
  --line-height-title-s: 32px;
  --font-size-headline: 20px;
  --line-height-headline: 28px;
  --font-size-body: 16px;
  --line-height-body: 24px;
  --font-size-caption: 14px;
  --line-height-caption: 20px;
  --font-size-caption-small: 12px;
  --line-height-caption-small: 20px;
}
```

## Final Rule

If an element does not communicate something useful, remove it or simplify it.
