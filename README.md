# Quarkdown Web

A browser-based editor and preview workspace for writing Quarkdown documents.

## Development

From the project root:

```powershell
cd frontend
npm install
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Production Build

```powershell
cd frontend
npm run build
```

The production files are generated in `frontend/build`.

## Deploying to Vercel

When importing this repository into Vercel, set the **Root Directory** to `frontend`.
The default Create React App settings work:

- Build command: `npm run build`
- Output directory: `build`
- Install command: `npm install`

## Attribution

This project is built for the Quarkdown ecosystem and acknowledges the original Quarkdown project by [iamgio](https://github.com/iamgio/quarkdown).

Please refer to the upstream repository for the Quarkdown language, documentation, and license information.
