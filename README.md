# Quarkdown Web

A browser-based editor and preview workspace for writing Quarkdown documents, powered by Vite with live LaTeX rendering via KaTeX.

## Features

- **Live Preview** — edit Quarkdown source on the left, see rendered output instantly on the right
- **Multiple Doctypes** — plain, paged, slides, and docs modes
- **LaTeX Math** — inline `$...$` and display `$$...$$` rendering powered by KaTeX
- **Custom Functions** — define and call reusable Quarkdown functions
- **Export** — copy HTML, download as `.html`, or print to PDF
- **Document Management** — sidebar with create, rename, and delete support

## Development

From the project root:

```bash
cd frontend
npm install
npm run dev
```

The app runs at [http://localhost:4000](http://localhost:4000).

## Production Build

```bash
cd frontend
npm run build
```

The production files are generated in `frontend/dist`.

## Deploying to Vercel

When importing this repository into Vercel, set the **Root Directory** to `frontend`.

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

## Attribution

This project is built for the Quarkdown ecosystem and acknowledges the original Quarkdown project by [iamgio](https://github.com/iamgio/quarkdown).

Please refer to the upstream repository for the Quarkdown language, documentation, and license information.
