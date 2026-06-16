# Markellos Ecosystem

Central landing page for the Markellos blogs, apps and websites.

## Architecture

The project uses a component-based structure:

- `src/components/` — self-contained visual and functional areas.
- `src/data/` — project data and links.
- `src/services/` — application services such as consent management.
- `src/styles/` — global design tokens, reset and layout rules.
- `src/utils/` — reusable helpers without domain-specific behavior.
- `src/pages/` — shared code for standalone pages.
- `privacy/` and `cookies/` — multi-page legal routes.
- `public/` — files copied directly to the production build.
- `tests/` — automated validation of project data and architecture assumptions.

Each component owns its JavaScript and CSS. Project content is kept separately in
`src/data/projects.js`, so links and names can change without editing presentation code.

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm test
npm run lint
npm run format:check
npm run build
```

The same checks run automatically through GitHub Actions on pull requests and pushes to `main`.

## Production build

```bash
npm run build
```

The generated multi-page site is written to `dist/`.

## Cloudflare Pages

Use these deployment settings:

- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`
