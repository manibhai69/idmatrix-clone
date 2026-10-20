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

## Deploy with Vercel

Vercel is the simplest option for this Vite app. Open [vercel.com](https://vercel.com), sign in with GitHub, choose **Add New Project**, import `manibhai69/idmatrix-clone`, keep the detected Vite settings, and click **Deploy**. The default settings are:

- Framework preset: **Vite**
- Build command: `pnpm build`
- Output directory: `dist`
- Install command: `pnpm install`

Every push to `main` will create a new production deployment after the repository is connected.

You can also deploy from the terminal after installing the Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Deploy with GitHub Pages

This repository includes `.github/workflows/deploy-pages.yml`. To enable it, open the repository on GitHub, go to **Settings → Pages**, choose **GitHub Actions** as the source, and save. Pushes to `main` will then build and deploy the site automatically. The Pages URL will usually be:

```text
https://manibhai69.github.io/idmatrix-clone/
```

The Vite configuration uses relative asset paths so the project-site URL works correctly on GitHub Pages. You can also trigger the workflow manually from the repository's **Actions** tab.
