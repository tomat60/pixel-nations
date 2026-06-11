# Public QA Report

Generate a deployable QA report when product or design needs to review Pixel Nations without manually sending screenshots.

## Run

```bash
npm run qa:screens
```

The script uses `http://localhost:3000` if the app is already running. If not, it starts a temporary local Next server, captures screenshots, and stops it.

## Output

Generated files are written to:

```text
public/qa/latest/
```

This includes:

- `report.html`
- `manifest.json`
- `screenshots/` with mobile and desktop route screenshots

## Share After Deploy

Commit the generated files, push to GitHub, and deploy to Vercel. Then open:

```text
/qa/latest/report.html
```

Useful direct links after deploy:

```text
/qa/latest/screenshots/mobile-home.png
/qa/latest/screenshots/mobile-world-top.png
/qa/latest/screenshots/mobile-world-atlas.png
/qa/latest/screenshots/desktop-world-atlas.png
```

The report embeds the screenshots and includes a lightweight review checklist for landing hero, world preview, `/world` playable map, demo progress pages, mobile layout, modal behavior, and reset modal.
