# Web Studio

Web Studio is a visual low-code builder for modeling full-stack applications as a node graph and exporting an AI-ready application specification.

The current scaffold includes:

- Next.js App Router with strict TypeScript
- React Flow canvas for architecture modeling
- dnd-kit sidebar drag and drop
- craft.js page builder for visual screen composition
- Zustand editor store
- Zod-validated node and edge schemas
- Material UI application shell
- JSON exporter for machine-readable specs

## Product Scope

The editor can currently model:

- Pages and routes
- Reusable UI components
- Database models
- API routes
- Server actions
- External APIs
- Client state stores
- Data flow connections between all of the above

The exported specification includes:

- Pages
- Components
- Database schema
- APIs
- Actions
- External integrations
- State stores
- Data flow graph
- Derived project structure

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Validation commands:

```bash
npm run lint
npm run build
```

## Architecture

```text
app/
	globals.css
	layout.tsx
	page.tsx
src/
	components/
		providers/
		workspace/
	features/
		canvas/
		data-flow/
		database-modeler/
		exporter/
		inspector/
		nodes/
		sidebar/
		ui-builder/
	lib/
	store/
	types/
```

## Key Modules

- `src/store/editor-store.ts`: graph state, selection, updates, connections and export.
- `src/features/canvas/components/flow-canvas.tsx`: React Flow canvas and validation hooks.
- `src/features/sidebar/components/node-library.tsx`: draggable architecture palette.
- `src/features/inspector/components/node-config-panel.tsx`: node configuration editor.
- `src/features/ui-builder/components/page-builder.tsx`: craft.js-powered page composition surface.
- `src/features/exporter/lib/export-app-spec.ts`: JSON specification generator.

## Notes On Extensibility

The node system is designed to grow. New node categories can be added by extending:

1. `src/types/editor.ts`
2. `src/features/nodes/config/node-definitions.ts`
3. `src/features/nodes/config/connection-rules.ts`
4. `src/features/exporter/lib/export-app-spec.ts`
5. `src/features/inspector/components/node-config-panel.tsx`

This keeps schema, rendering, validation and export behavior aligned.
