# QA Handoff

Use the QA screenshot handoff when you need product or design review without manually sending many screenshots.

## Run Screenshots

```bash
npm run qa:screens
```

The script uses `http://localhost:3000` if the app is already running. If not, it starts a temporary local Next server, captures the screenshots, then stops it.

## Output

Deployable QA assets are saved to:

```text
public/qa/latest/
```

The latest generated report is saved to:

```text
public/qa/latest/report.html
```

## What To Send

Run the handoff flow:

```bash
npm run qa:screens
git add public/qa docs reports package.json package-lock.json scripts
git commit -m "Add public QA screenshot report"
git push
```

Then open after Vercel deploy:

```text
/qa/latest/report.html
```

See `docs/QA_REPORT.md` for the public-review workflow.

This should reduce manual screenshot sharing and make future development easier to review consistently.
