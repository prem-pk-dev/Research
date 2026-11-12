# ToolNest QA Checklist

This checklist separates source-level review from browser/device verification. A checked source-review item is not a claim that a real browser test has passed.

## Test status legend
- [x] Reviewed in source / logic
- [ ] Must be executed in a real browser before launch

## Functional review — 10 tools

### Word Counter
- [x] Empty input returns zero counts.
- [x] Words use whitespace splitting; paragraph count uses blank-line separation.
- [x] Character count uses grapheme segmentation where Intl.Segmenter exists, with a Unicode code-point fallback.
- [x] Sentence counting includes punctuation followed by common closing quotation marks and brackets.
- [ ] Verify emoji, combining marks, CJK text, punctuation, and CRLF in current Chrome, Firefox, and Safari.

### Case Converter
- [x] Uppercase, lowercase, title-case, and sentence-case actions are wired to the source and output fields.
- [ ] Verify contractions, apostrophes, hyphenated words, acronyms, Turkish locale behavior, and non-Latin scripts.

### JSON Formatter
- [x] Parse errors clear stale output and report an error.
- [x] Format and minify use JSON.parse / JSON.stringify locally.
- [ ] Verify empty input, arrays, nested values, large payloads, malformed JSON, and copy/download behavior.

### Base64 Converter
- [x] UTF-8 encoding uses TextEncoder and chunked byte-to-binary conversion.
- [x] Decoding uses fatal UTF-8 validation and catches malformed Base64.
- [ ] Verify empty input, Unicode round trips, whitespace, invalid alphabet, missing padding, and large input.

### URL Encoder
- [x] Uses encodeURIComponent / decodeURIComponent and catches malformed percent sequences.
- [ ] Verify reserved characters, Unicode, spaces, plus signs, empty input, and malformed escapes.

### Image Compressor
- [x] Rejects empty files, unsupported MIME types, and files above 25 MB.
- [x] Enforces 40 MP and 12,000 px per-side processing limits.
- [x] Handles missing canvas context, decode errors, null blobs, and unsupported output MIME.
- [x] Revokes preview/download object URLs when replaced.
- [ ] Verify real JPG/PNG/WebP files, transparency, EXIF orientation, browser MIME support, large images, and downloads on desktop/mobile.

### Password Generator
- [x] Uses Web Crypto and rejection sampling for unbiased bounded random integers.
- [x] Shuffles selected required character groups and validates length/count bounds.
- [x] Rejects an empty character-set selection.
- [ ] Verify secure-context behavior, every character-set combination, minimum/maximum length, count limits, and clipboard behavior.

### Percentage Calculator
- [x] Rejects empty/non-finite inputs and handles zero as the original value for percentage change.
- [x] Supports decimal inputs (step=any).
- [ ] Verify positive/negative values, zero, fractional values, very large values, and rounding expectations.

### Age Calculator
- [x] Validates calendar dates and rejects an end date before birth date.
- [x] Uses calendar-day arithmetic in UTC to avoid daylight-saving day-length errors.
- [x] Clamps month additions to valid month-end dates.
- [ ] Verify leap-day birthdays, month ends, leap years, historical dates, and browser date-input limits.

### Unit Converter
- [x] Supports length, weight, temperature, and digital storage.
- [x] Separates decimal KB/MB/GB from binary KiB/MiB/GiB.
- [x] Rejects negative length/weight/storage and temperatures below absolute zero.
- [x] Rejects non-finite conversion results.
- [ ] Verify every unit pair, category switching, decimals, extreme magnitudes, and temperature reference points.

## Site-wide checks
- [x] Previously reviewed local navigation links and sitemap coverage (19 HTML pages / 19 sitemap URLs).
- [x] Skip links, main-content targets, navigation labels, and mobile-menu ARIA attributes were added.
- [ ] Run automated accessibility checks and keyboard-only navigation on real pages.
- [ ] Test responsive layouts at phone, tablet, and desktop widths.
- [ ] Test current Chrome, Firefox, Safari, and Edge.
- [ ] Verify production pages, downloads, clipboard, and image processing on actual devices.
- [ ] Review Privacy, Terms, and Contact content before launch; legal text needs jurisdiction-specific review and a verified contact address.

## Launch gates
- [ ] Real-browser functional QA completed and defects fixed.
- [ ] Mobile and cross-browser QA completed.
- [ ] Accessibility review completed.
- [ ] Legal pages reviewed; contact details verified.
- [ ] Ads / affiliate links / Premium remain disabled until genuine approvals, valid links, and secure entitlement/payment infrastructure exist.
