# Markellos Ecosystem

Central landing page for the Markellos blogs, apps and websites.

## Architecture

The project uses a component-based structure:

- `src/components/` — self-contained visual and functional areas.
- `src/data/` — project data and links.
- `src/styles/` — global design tokens, reset and layout rules.
- `src/utils/` — reusable helpers without domain-specific behavior.
- `public/` — files copied directly to the production build.

Each component owns its JavaScript and CSS. Project content is kept separately in
`src/data/projects.js`, so links and names can change without editing presentation code.

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run format:check
npm run build
```

## Production build

```bash
npm run build
```

The generated site is written to `dist/`.

## Cloudflare Pages

Use these deployment settings:

- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`
