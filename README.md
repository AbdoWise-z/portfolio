# Portfolio

Personal portfolio of Abdelrahman Mahmoud. A single-page site built with
[Next.js 14](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS,
[shadcn/ui](https://ui.shadcn.com/) and [framer-motion](https://www.framer.com/motion/).

## Development

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
```

See `.env.example`. To regenerate the WebP banners from new PNG/JPG sources run `npm run images`.

The contact form posts to Formspree; the endpoint is in
`components/views/screens/contact_me.tsx`.

## Structure

- `app/` – root layout, global styles and the single page.
- `components/views/screens/` – the page sections (landing, about, timeline, projects, contact).
- `components/views/secret-content*.tsx` + `hooks/use-mask-position.tsx` – the
  cursor-following "secret content" mask effect.
- `components/ui/` – shadcn/ui primitives.
- `components/views/space-background.tsx` – the interactive starfield canvas.
- `public/banners/` – background images for the timeline and project slides.
