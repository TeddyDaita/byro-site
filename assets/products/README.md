# Product photos

Drop real product images in this folder using the robot's `id` as the filename:

```
roborock-s8-pro.jpg
irobot-j9.jpg
loona.webp
neo-beta.png
```

Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`. Anything web-renderable works.

**Recommended specs**
- Aspect ratio: ~4:3 or square (the photo well is `aspect-ratio: 4 / 3` on cards and `4 / 3` on the product hero)
- Min width: 800px wide for retina sharpness on the product page hero
- Background: white or transparent so it blends with the existing `--bg-soft` photo well

**How it gets picked up**
The `robotPlaceholder()` function in `app.js` checks `robot.photo` from `data.js`:
- If `photo` is a truthy string (e.g. `'assets/products/roborock-s8-pro.jpg'`), it renders an `<img>` in the photo well.
- If `photo` is `null` or undefined, it falls back to the typographic brand-initial tile.

To wire up a new photo:

1. Save the file here (e.g. `assets/products/roborock-s8-pro.jpg`)
2. Open `byro-site/data.js`, find that robot, set `photo: 'assets/products/roborock-s8-pro.jpg'`
3. Bump the cache version in `index.html` (`?v=N` → `?v=N+1`)

Or skip step 2 — `data.js` already defaults `photo` to a path matching the robot id; just drop the file in and it'll load.

**Sourcing photos**
- Manufacturer press kits (most makers publish on their About / Press pages)
- Wikimedia Commons (`commons.wikimedia.org`) — Creative Commons licensed, attribution required
- Brand-supplied images via the maker relationship pipeline
- AI-generated product renders as a temporary fill
