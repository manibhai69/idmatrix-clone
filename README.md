# IDMatrix Clone

A standalone, responsive clone of the public IDMatrix ID card converter page. It recreates the supplied reference site's layout and interaction model while keeping the implementation self-contained in the browser.

## Features

- Light and dark theme toggle.
- Front and back image upload through browse or drag-and-drop.
- Client-side preview, rotate, crop, and remove actions.
- Auto edge trim and contrast enhancement during output preparation.
- Crossing text presets plus custom text, size, opacity, and bold controls.
- Word-compatible `.doc` download and browser print flow for PDF output.
- 4×2 A4 print layout with front/back content in each copy.

## Development

```bash
pnpm install
pnpm dev
```

The app listens on port `3000` by default. Build with `pnpm build`.
