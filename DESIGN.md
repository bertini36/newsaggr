---
name: newsaggr
description: A fast news reader that gives every source one screen on a phone and a grid on a desktop, in a plain light and a GitHub-dark theme.
colors:
  page-light: "#FBFBFB"
  ink-light: "#171717"
  muted-light: "#737373"
  rule-light: "#E5E5E5"
  page-dark: "#0D1117"
  card-dark: "#161B22"
  ink-dark: "#C9D1D9"
  muted-dark: "#8B949E"
  rule-dark: "#30363D"
  accent-red: "#F87171"
typography:
  display:
    fontFamily: "Baloo 2, ui-monospace, monospace"
    note: "Wordmark only"
  source-name:
    fontFamily: "serif"
    fontWeight: 700
    fontSize: "20px (24px from 768px)"
  body:
    fontFamily: "Reading font, default Roboto Flex"
    fontSize: "17px"
    lineHeight: 1.375
  meta:
    fontSize: "12px"
sizes:
  header-phone: "48px"
  source-bar: "56px"
  tap-target: "44px"
  menu-row: "48px"
rounded:
  card-desktop: "8px"
  button-round: "9999px"
  sheet: "16px 16px 0 0"
---

# Design System: NewsAggr

## Overview

NewsAggr is a reader, not a portal. Headlines are the content, so everything else gets out of the way. On a phone one source fills the screen between a 48px header and a 56px source bar. On a desktop the sources sit in a grid of cards.

The primary device is a Pixel 9 (412 x 915 CSS px) running the installed PWA. Design phone first, then check the desktop grid.

**Key characteristics:**
- Edge-to-edge on phones: no card border, radius or gap around a source.
- Hairline dividers between stories, no boxes.
- One accent colour (red) for state: starred, bookmarked, focus.
- The reader picks the reading font from ten options; the UI never assumes one.

## Colors

- **Page** (#FBFBFB light, #0D1117 dark): the whole background, header and source bar included.
- **Card** (#161B22 dark): desktop card fill. Phones have no card fill.
- **Ink** (#171717 light, #C9D1D9 dark): story titles.
- **Muted** (#737373 light, #8B949E dark): times, points, labels. Both pass 4.5:1 on their page colour. Do not lower the opacity below this; `text-neutral-400/80` on light failed contrast and was removed.
- **Rule** (#E5E5E5 light, white at 10% dark): dividers.
- **Accent red** (#F87171): starred source, saved bookmark, empty-feed star. It never marks errors or decoration.

Visited story links turn muted. This is the "already read" signal, so keep it.

The browser `theme-color` follows the theme (#FBFBFB or #0D1117) so the status bar matches the page. The theme resolves in `index.html` before first paint.

## Typography

- **Wordmark:** Baloo 2, header only. One line on phones, two lines from 768px.
- **Source name:** serif bold, 20px on phones, 24px from 768px.
- **Story title:** the reading font at 17px, line-height 1.375, `text-wrap: pretty`.
- **Meta line** (time, points): 12px, muted, under the title.
- Minimum functional text is 11px (category chip).

## Layout

Phones (below 768px, `useIsPhone`):
- Header 48px plus the top safe area. Logo, wordmark, refresh, theme, menu.
- One source per screen, horizontal scroll snapping (`snap-mandatory`, `snap-always`), full width.
- Source bar fixed at the bottom, 56px plus the bottom safe area. It lists every source logo, names the active one and jumps on tap. A reorder button sits at its right end.
- No footer; version, license and author live in the menu sheet.
- Card height comes from `.phone-card-h`; change `--header-h` and `--tabbar-h` in `globals.css` together with it.

From 768px: sticky header with padding, card grid (`minmax(350px, 1fr)`), footer visible, drag handle to reorder.

## Interaction

- Every control is at least 44px square (`icon-btn`). Menu rows are 48px.
- Touch feedback uses `active:` backgrounds, never hover only.
- The menu is a bottom sheet on phones and a dropdown on desktop.
- The source picker is full screen on phones with a close button.
- Toasts sit just under the header on phones, top centre on desktop, and always have a dismiss button.
- Overscroll is off on `html` and `body` so a stray flick cannot reload the installed app.
- Reordering on phones opens a bottom sheet from the source bar button or the menu. Each row has a 44px drag handle; the handle also takes the arrow keys. The order is saved when the sheet closes. Desktop reorders by dragging the card handle.
- Sources refresh by themselves: when the app returns to the foreground, when the network comes back, and every minute while visible, once the last request is older than 10 minutes. The card subtitle reads "Updating..." meanwhile and the stories stay in place. There is no refresh button on a card; the header button forces the latest data for every source and needs a login.
- The menu lists Star on Github before the login or logout row, which always comes last.

## Components

- **icon-btn:** 44px round, muted icon, darkens on hover or press. Defined in `uno.config.ts`.
- **Story row:** title, then meta; 12px vertical padding; 44px bookmark button when logged in.
- **Skeleton:** eight pulsing rows while a source first loads.
- **Error state:** wifi-slash icon, one sentence, a Try again button.
- **Stale notice:** one 44px row above the stories when a refresh failed: wifi-slash icon, "Couldn't refresh. Showing the last copy." and a Retry button. It only shows after a failure; a healthy card has no refresh chrome.
- **Primary button:** ink fill (white in dark), pill shape on phones for single actions such as Add sources.
- **Source bar item:** 24px logo; the active one gets a tinted pill with the name.

## Do's and Don'ts

### Do:
- **Do** check changes at 412 x 915 first, in both themes.
- **Do** keep text at 4.5:1 or better.
- **Do** use `env(safe-area-inset-*)` for anything fixed to a screen edge.
- **Do** keep desktop layouts working; phone rules live behind `useIsPhone` or `max-md`.

### Don't:
- **Don't** add borders, radius or padding around a source on phones.
- **Don't** add a second accent colour or use red for anything but state.
- **Don't** add a control smaller than 44px.
- **Don't** put persistent UI above or below the header and source bar; each strip costs a story.
- **Don't** block first paint with font stylesheets; reading fonts load with `media="print"` and swap in.
