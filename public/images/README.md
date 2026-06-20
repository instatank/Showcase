# Image assets (drop real screenshots here)

Until a real file exists at a path, the site renders a labelled placeholder
block at the correct aspect ratio. To go live with real visuals, add files at
the exact paths referenced in `data/apps.ts` and `data/site.ts`, then follow the
swap step in the project README ("To swap in real images").

Expected structure (one folder per app):

```
public/images/
  ankit.png                 # hero photo (data/site.ts)
  dayos/      hero.png shot-1.png shot-2.png shot-3.png
  partyspark/ hero.png shot-1.png shot-2.png clip.mp4
  billbud/    hero.png shot-1.png shot-2.png
  cadence/    hero.png shot-1.png shot-2.png clip.mp4
  mymealmap/  hero.png shot-1.png shot-2.png
  tradegenie/ hero.png shot-1.png shot-2.png
```

Capture at 2x/retina and export WebP/AVIF where possible (PRD §7).
