#!/usr/bin/env bash
# Renders the installed-app icons from the logo glyph. Requires rsvg-convert.
# The glyph geometry below must match public/icon.svg; re-centre it if the logo changes.
# Every icon is opaque: transparent PNGs turn black on iOS and on Android splash screens.
set -euo pipefail

cd "$(dirname "$0")/../public"

render() {
  local scale=$1 size=$2 output=$3
  rsvg-convert -w "$size" -h "$size" -o "$output" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#ffffff"/>
  <g transform="translate(256 256) scale($scale) translate(-76.5 -79)" fill="#F87171">
    <path d="M66 115 L15 15 L138 15 L87 115" fill="none" stroke="#F87171" stroke-width="16" stroke-linecap="square" stroke-linejoin="miter"/>
    <circle cx="76.5" cy="138" r="13"/>
  </g>
</svg>
SVG
}

# "any" icons fill most of the canvas; maskable ones stay inside the 80% safe zone.
render 2.6 192 pwa-192x192.png
render 2.6 512 pwa-512x512.png
render 2.6 180 apple-touch-icon.png
render 1.9 192 pwa-maskable-192x192.png
render 1.9 512 pwa-maskable-512x512.png
