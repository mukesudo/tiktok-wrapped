# Deployment

## Recommended Host

Vercel is the cleanest fit for this project because the app uses:

- Next.js App Router
- route handlers
- generated Open Graph images
- generated app icons

## Environment Variables

Set these in your deployment platform:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_CREDIT_NAME=Your Name
NEXT_PUBLIC_SITE_CREDIT_URL=https://your-site.com
NEXT_PUBLIC_SITE_X_HANDLE=@yourhandle
```

## Vercel Setup

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Set the environment variables above.
4. Deploy.

## Important Runtime Behavior

### Replay thumbnails

The `/api/tiktok-preview` route fetches public TikTok metadata and may resolve:

- oEmbed data
- page meta tags
- thumbnail URLs from TikTok CDN hosts

Those domains are allowed in `next.config.js`.

### Social sharing

The app uses:

- `metadataBase` from `NEXT_PUBLIC_SITE_URL`
- `/opengraph-image`
- `/icon`
- `/apple-icon`

If `NEXT_PUBLIC_SITE_URL` is missing, the deployed app will still work, but share previews may be less reliable.

## Build Commands

```bash
pnpm install
pnpm build
pnpm start
```

## Common Deployment Checks

- Confirm `NEXT_PUBLIC_SITE_URL` uses the final public domain.
- Test a shared link in iMessage, X, Slack, or Discord.
- Test "Add to Home Screen" on iPhone.
- Upload a real TikTok export and verify replay thumbnails resolve.
