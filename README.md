# Turn Media

Marketing site for [Turn Media](https://turnxmedia.com), built with React, Next.js, TypeScript, and Tailwind CSS, and set up to deploy on Vercel.

## Stack

- React 19 and Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Vercel hosting

Blog posts live in `content/blog` as Markdown. The site reads the SEO title, description, and slug from each file and renders the article at `/blog/[slug]`.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
```

## Deploy on Vercel

The repo includes `vercel.json` with `"framework": "nextjs"`. Vercel detects the Next.js app from the root `package.json`.

1. Import this GitHub repository in the [Vercel dashboard](https://vercel.com/new).
2. Leave the framework preset on Next.js and the root directory on `.`.
3. Deploy. Production builds run `npm run build`.

From a machine logged into the Vercel CLI:

```bash
npx vercel
```
