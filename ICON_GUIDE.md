# PWA Icon Generation Guide

## Current Status

A placeholder SVG icon has been created at `icons/icon.svg` with the retro-futuristic theme matching your app.

## What You Need

For the PWA to work properly, you need PNG icons in these sizes:
- **192x192** pixels (required)
- **512x512** pixels (required)
- **favicon.ico** (optional, for browser tabs)

## Option 1: Online Conversion (Easiest)

1. Go to https://realfavicongenerator.net/
2. Upload `icons/icon.svg`
3. Configure settings (use theme color `#00ffcc`)
4. Download the generated icons
5. Extract and place in the `icons/` folder

## Option 2: Using Design Software

### Figma/Sketch/Illustrator
1. Open `icons/icon.svg`
2. Export as PNG at 192x192 and 512x512
3. Save as `icon-192.png` and `icon-512.png` in `icons/` folder

### Inkscape (Free)
```bash
# Convert to 192x192
inkscape icons/icon.svg --export-type=png --export-filename=icons/icon-192.png -w 192 -h 192

# Convert to 512x512
inkscape icons/icon.svg --export-type=png --export-filename=icons/icon-512.png -w 512 -h 512
```

## Option 3: ImageMagick (Command Line)

```bash
# Convert to 192x192
convert icons/icon.svg -resize 192x192 icons/icon-192.png

# Convert to 512x512
convert icons/icon.svg -resize 512x512 icons/icon-512.png

# Generate favicon (optional)
convert icons/icon-192.png -define icon:auto-resize=16,32,48 icons/favicon.ico
```

## Option 4: Quick Placeholder PNGs

If you just want to test the PWA features quickly, you can use any 192x192 and 512x512 PNG images temporarily. The app will still work - the icon just won't look perfect.

## Customizing the Icon

The SVG icon at `icons/icon.svg` can be edited to:
- Change colors (currently uses `#00ffcc`, `#ff6b9d`, `#ffaa00`)
- Modify the stick figure pose
- Add your own design elements
- Change the background

Just edit the SVG file in any text editor or vector graphics software.

## Verification

After generating the icons:
1. Place `icon-192.png` and `icon-512.png` in the `icons/` folder
2. Deploy to GitHub Pages
3. Open in Chrome DevTools → Application → Manifest
4. Check that icons are loading correctly
5. Try installing the PWA (Chrome menu → Install app)

## Current File Structure

```
workout_tool/
├── icons/
│   ├── icon.svg          ← Created (source file)
│   ├── icon-192.png      ← Need to generate
│   └── icon-512.png      ← Need to generate
├── manifest.json         ← Created (references the PNGs)
└── sw.js                 ← Created (service worker)
```
