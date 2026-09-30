# Byro.shop

Static, responsive partnership landing page. No build step, runtime dependencies, account flow, or commerce operations.

## Preview

Run `python3 -m http.server 8765` from this directory and open http://localhost:8765.

## Deployment

Serve the repository root on Vercel. `vercel.json` permanently redirects retired marketplace paths to relevant sections; `app.js` redirects the former hash routes. The former standalone HTML pages also redirect on hosts without Vercel rules. Unknown routes show the current landing page rather than the retired marketplace. The sitemap contains only the homepage.

## Content

All contact buttons link to ted@byro.shop with the partnership inquiry subject. Current status is explicitly in development. The warehouse contact is described as exploratory. No manufacturer agreements, inventory, financing, facilities, or service operations are claimed.

Hero photography attribution and license are in `assets/PHOTO-LICENSE.md` and visibly next to the image. Replace with a real Byro demonstration photo when available and authorized.

## Backup and rollback

The previous site is preserved at commit `e41778e` and branch `backup/marketplace-2026-09-30`. A full Git bundle is saved outside the web root at `/Users/teddy/Code/byro-site-before-landing-2026-09-30.bundle`. Do not copy the backup files into the deployed web root. To roll back, redeploy the previous commit through Vercel.

## Verification

Browser checks at 1440, 768, 390, and 320 pixels: no horizontal overflow; photo loads; all internal links target real sections; email links match; old browse, product, cart, account, app, sell, and about hashes redirect correctly; keyboard navigation begins with the skip link. No page JavaScript errors. Desktop and mobile full-page screenshots reviewed.

Email links open the visitor's mail client; actual mailbox delivery is outside the website's control.
