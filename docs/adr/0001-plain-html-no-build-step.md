# 0001 — Plain HTML with JSON data, no build step

## Status

Accepted (2026-09-03)

## Context

The fan page is updated frequently and remotely: Claude Code sessions driven from a phone edit the site, push to git, and do light verification. GitHub Pages serves the site at hungergames.ferda.fun. Any server-side build step (Jekyll, SSG + Actions) introduces remote build failures and build latency that are painful to debug and verify from a phone.

## Decision

The site is plain static HTML/CSS/JS with no build step. The meme feed is data-driven: `feed.js` renders entries from `memes.json`, so a routine update is "add image + append one JSON entry + push". What is pushed is exactly what is served.

## Consequences

- Updates are push-and-done; verification is checking the pushed files, not a build log.
- No server-side rendering: the meme feed requires JavaScript in the visitor's browser (acceptable for a fan page).
- If the site ever outgrows one page + a feed, adding a generator later means restructuring content and the update workflow.
