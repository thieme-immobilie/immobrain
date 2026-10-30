# ImmoBrain repository maintenance

Before editing an existing file, fetch the current main branch and compare its remote blob with the local copy. If they differ, read the remote file and merge changes into that version. Other sessions can update this repository: do not publish stale local pages, scripts or workers over newer work.

Preserve the optimized home workspace in `dist/index.html` and its `home.css`, `home.js`, assistant modules and dashboard drag-and-drop integration unless the user explicitly requests changes to them. Run `tests/home-regression.test.cjs` for changes to the homepage or navigation.

The shared main navigation contains Startseite, Immobiliensuche, Fix- und Flip-Rechner, Besichtigung, Renovierungsplaner and 3D-Grundriss. Besichtigung links to `/besichtigungskalender.html`; checklist and calendar are separated by their existing internal navigation. 3D-Grundriss links to `/grundriss.html`.

The Cloudflare worker must retain both assistant routes (`/api/assistant`, `/api/assistant/status`) and the invoice vendor route. Preserve all unrelated API handlers when changing imports or routing.

Use an expected branch-head SHA when publishing. On a mismatch, fetch the updated head and review changed files before retrying.
