This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Lato.

## Design System Foundation

Design tokens live in `app/globals.css` and are exposed to Tailwind through CSS theme variables and `tailwind.config.ts`.

### Color Palette

Primary:

- `primary-500`: `#145C46`

Secondary:

- `secondary-500`: `#299A45`

Accent:

- `accent-green`: `#A7C840`
- `accent-yellow`: `#EDC113`
- `accent-orange`: `#EC8E3B`
- `accent-red`: `#B61F3E`

Each brand color includes 50-900 shade variables for consistent UI states.

### Semantic Color Tokens

Use semantic tokens in components instead of raw hex values:

```tsx
<section className="bg-surface text-text-primary border-border">
  <h1 className="text-heading text-primary">Pull</h1>
  <p className="text-body text-text-secondary">Reusable design tokens.</p>
</section>
```

Available semantic tokens include `primary`, `secondary`, `accent-green`, `accent-yellow`, `accent-orange`, `accent-red`, `background`, `surface`, `surface-muted`, `surface-inverse`, `foreground`, `text-primary`, `text-secondary`, `text-muted`, `text-inverse`, `border`, `border-muted`, `success`, `warning`, and `danger`.

### Typography Scale

The default font stack is `Lato, Inter, system-ui, sans-serif`.

| Token | Size | Line height | Weight |
| --- | ---: | ---: | ---: |
| `text-heading` | 40px | 48px | 700 |
| `text-subheading` | 32px | 40px | 500 |
| `text-body` | 24px | 36px | 300 |

Use the typography tokens for primary content hierarchy instead of inline font-size utilities.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
