# Privacy

## Data Handling

This project is designed to be local-first.

When a user uploads `user_data_tiktok.json`:

- the JSON is read in the browser
- behavior metrics are computed client-side
- wrapped slides are rendered locally in the browser session

There is no database and no built-in persistence layer in this repo.

## Network Requests

Most analysis stays local.

The main exception is replay preview enrichment:

- `/api/tiktok-preview` may request public TikTok metadata for replayed video links
- this helps resolve video titles and thumbnail images

If you want a stricter privacy posture, you can disable or remove replay preview fetching and keep all processing fully local.

## Suggested Product Copy

If you want to be explicit in production, use language like:

> Your uploaded TikTok export is analyzed in your browser. Public replay thumbnails may require metadata requests to TikTok.

## Recommended Future Improvement

For a true privacy toggle, add:

- a "strict local mode" switch
- a UI notice that disables replay thumbnail fetches
- a fallback replay card layout with no remote requests
