# PostHog learning analytics

## Intent

Add minimal, consent-gated PostHog analytics to the hosted DoRoboty.ai course prototype so a production visit and offer interaction can be verified during the AIPH3 exercise.

## Acceptance criteria

- Production hash-route pageviews and PostHog autocapture clicks on links/buttons appear in the EU project after explicit consent.
- Autocapture is limited to click events on links and buttons; DOM text, element attributes, copied text, typed values, and search parameters are excluded.
- Opening and saving or removing a job offer emit named events with only a synthetic job ID and source; no job title, company/person name, or free text is sent in these custom events.
- Search/query parameters and typed input values are removed or excluded from captured payloads.
- After explicit consent, browser errors may emit only a generic source (`window` or `promise`), never the error message, stack, rejected value, or page URL.
- Analytics setup and capture failures do not interrupt product use.
- Session recording, surveys, product tours, feature flags, remote config, external scripts, heatmaps, web vitals, and development-environment collection remain disabled.
- `FEATURES.md` reflects the new behavior; no dashboard or funnel is created as part of this task.

## Verification

Unit tests verify URL and DOM-content sanitization, minimal browser-error properties, masked click-only autocapture, disabled remote features, and non-blocking capture failures. After deployment, confirm a pageview and one `$autocapture` from production in PostHog; with consent denied, verify no events are sent. This file records implementation intent; production verification is recorded separately after the deployment is inspected.
