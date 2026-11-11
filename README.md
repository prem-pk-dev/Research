# ToolNest — Static Tools Platform

A frontend-only, multi-page website built with HTML, CSS and vanilla JavaScript.

## Published tools

- Word Counter
- Case Converter
- JSON Formatter
- Base64 Encoder / Decoder
- URL Encoder / Decoder
- Image Compressor (Canvas API)
- Password Generator (Web Crypto API)
- Percentage Calculator
- Age Calculator
- Unit Converter

## Architecture

- Static frontend only; no application backend, database or server-side file processing.
- Core tool processing runs in the visitor's browser.
- Local storage is used only for the light/dark theme preference.
- Static JSON and HTML assets are served from Cloudflare Pages.

## Cloudflare Pages

- Project: `research-toolnest`
- Framework preset: None
- Build command: leave blank
- Build output directory: `/` (repository root)
- Functions: none
- Environment variables: none required

Live site: https://research-toolnest.pages.dev/

## Launch checklist

- [ ] Replace the Cloudflare Pages subdomain with a verified custom domain if desired; update canonical URLs, Open Graph URLs, sitemap and robots.txt together.
- [ ] Add a verified contact email and business/operator details.
- [ ] Have Privacy Policy and Terms reviewed for the actual operator, jurisdiction, and enabled third-party services.
- [ ] Add AdSense only after publisher approval and applicable consent configuration.
- [ ] Add approved affiliate links only with clear disclosures near recommendations.
- [ ] Keep Premium checkout disabled until a payment provider and secure entitlement verification are configured.
- [ ] Run real-device checks on Android, iOS, tablet and desktop before marketing launch.

## Deploy

Push changes to the connected GitHub branch. Cloudflare Pages automatically builds and deploys the static repository root.

## Important

No payment is collected, no affiliate tracking links are active, and advertising is not configured in this initial release. Do not describe Premium as available until the external checkout and entitlement flow is implemented and tested.
