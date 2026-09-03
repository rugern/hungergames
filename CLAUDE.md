# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page fan site for the team "Hunger Games" participating in Internasjonal Gjemsel: 2 Hidden 2 Seek (Netherlands). See `CONTEXT.md` for the domain glossary and `docs/adr/` for decisions. Hosted on GitHub Pages at https://hungergames.ferda.fun (public repo, `CNAME` file in root).

## Architecture

Plain static HTML/CSS/JS — **no build step, no framework, no dependencies** (see ADR 0001). What is pushed to `main` is what GitHub Pages serves. Do not introduce a build pipeline.

- `index.html` — one page: hero (logo, YouTube video embed, song player) + meme feed
- `memes.json` — the meme feed data; `feed.js` renders it client-side
- `assets/` — logo, images, song file (small audio in repo; video lives on YouTube)

## Update workflow (usually driven from a phone via remote Claude session)

The routine update is: save the new image to `assets/memes/`, append an entry to `memes.json`, commit, push to `main`. Keep updates push-and-done; verification = validate `memes.json` parses (e.g. `python3 -m json.tool memes.json`) and the referenced files exist. Assets arrive pasted in chat or as YouTube links.

## Content rules

- The page is viewed primarily on phones — every design change must be mobile-first (single column, big touch targets); desktop just gets more breathing room.

- The site is bilingual English/Dutch with a client-side language picker. All user-supplied content arrives in Norwegian/English; translate it into **both** English and Dutch yourself. Translations are for fun — looseness and pun-preservation beat accuracy.
- A meme entry has a unique kebab-case `id` (anchor links use `#news-<id>`), a bilingual caption, a date, and one of three types: `image` (`src`), `youtube` (`yt` video id), or `video` (`src` + `poster` for a self-hosted mp4).
- Self-hosted video is allowed for special clips: re-encode with `ffmpeg -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k` and keep the result under ~15MB; extract a non-black poster frame. Long or large videos still go to YouTube; never commit an original/uncompressed video file.
- Naming joke: internally (team, repo, code, `memes.json`) they are "memes", but ALL visitor-facing text calls them "news" (EN) / "nieuws" (NL) — the fan page pretends to report news about the pop sensation. Never let the word "meme" appear on the rendered page.
- Keep media small: compress images; audio a few MB; never commit video files.
