# Portfolio

Personal portfolio of Abdelrahman Mahmoud. A single-page site built with
[Next.js 14](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS,
[shadcn/ui](https://ui.shadcn.com/) and [framer-motion](https://www.framer.com/motion/).

## Development

Node 22 or newer (`engines` in package.json; Vercel builds on the newest release that satisfies it).

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Configuration

Create a `.env` file (not committed) with:

```
NEXT_PUBLIC_MEASUREMENT_ID=G-XXXXXXXXXX   # Google Analytics, optional
NEXT_PUBLIC_SITE_URL=https://your-domain  # used for metadata, sitemap, robots
GITHUB_TOKEN=                             # optional, no scopes: real contributions calendar in the GitHub section
```

See `.env.example`. The project and timeline backgrounds are drawn as vector art by
`scripts/generate-banners.mjs` and rendered to `public/banners` with `npm run banners`;
`npm run images` converts any PNG/JPG sources dropped in there to WebP.

The contact form posts to Formspree; the endpoint is in
`components/views/screens/contact_me.tsx`.

## Structure

- `app/` – root layout, global styles and the single page.
- `components/views/screens/` – the page sections (landing, about, timeline, projects, skills, contact).
  Sections stack like sheets: each slides over the previous one, which stays pinned and recedes
  (`hooks/use-section-progress.ts` gives a section the scroll progress of its neighbour).
- `components/views/secret-content*.tsx` + `hooks/use-mask-position.tsx` – the
  cursor-following "secret content" mask effect.
- `components/ui/` – shadcn/ui primitives.
- `components/views/space-background.tsx` – the interactive starfield canvas (theme-aware):
  parallax, pointer gravity + constellation, scroll warp, click ripples and shooting stars.
- `components/views/magnetic.tsx`, `grain.tsx`, `scroll-progress.tsx` – small decorative pieces.
- `scripts/checks/` – Playwright scripts that screenshot and probe the running site (see below).
- `components/views/secret-content-indicator.tsx` – the inverting lens that follows the pointer.
- `components/views/nav/theme-toggle.tsx` – light/dark switch (next-themes, class strategy).
- `public/banners/` – background images for the timeline and project slides.

## Visual checks

With `npm run dev` running in another terminal:

```bash
npm run check:shots        # full-page screenshots at 390 / 768 / 1280 / 1920
npm run check:themes       # light + dark, lens alignment, timeline jump
npm run check:transitions  # frames through every section boundary (args: width theme)
npm run check:probe        # mask alignment numbers while hovering (args: label text)
```

They drive the installed Edge (`BROWSER_CHANNEL=chrome` to use Chrome instead); no browser
download is needed. Screenshots land in `.checks/shots/`, which is git-ignored.
