# Forland & Company Advocates

Production-ready static deployment of the Forland & Company Advocates website.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run check
npm run build
npm run preview
```

The optimized site is written to `dist/`. A `404.html` SPA fallback is generated so client-side routes work on static hosts such as GitHub Pages. Netlify and Vercel rewrites are included for the same purpose.

## Project structure

- `index.html` — document metadata and application entry point
- `public/assets/css` — compiled site and icon styles
- `public/assets/js` — compiled React application
- `public/assets/fonts` — locally hosted icon fonts
- `public/assets/icons` — icon sprite assets
- `public/assets/media` — locally hosted site imagery
- `scripts` — production build and verification utilities

## Important configuration

The contact form is registered for Netlify Forms and posts directly to the deployed site. Netlify is the recommended initial host because no separate form backend is required. If another host is selected, connect the form to that host's serverless endpoint before launch.

The firm’s verified public phone number, email address and street address were not available during development. The interface uses honest availability text instead of fabricated contact details. Replace that text with confirmed business details before announcing the site publicly.

## Photography

People-focused imagery uses real stock photography from [Pexels](https://www.pexels.com/) and [Christina @ wocintechchat on Unsplash](https://unsplash.com/@wocintechchat), under their respective free-use licenses. Source pages include the Lagos business meeting, African women’s office meeting, legal consultation, business handshake, financial discussion and business-travel photographs used throughout the site.

The available download contained compiled output rather than the original React source. The application bundle is therefore retained as a compiled artifact; future feature development should be done after obtaining the original source project or rebuilding the UI as source components.
