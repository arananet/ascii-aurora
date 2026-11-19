# Design System

## Brand Identity

### Palette
The page is a night sky rendered in text. The interface borrows its colours
from the aurora itself (design tokens in `design/tokens.json` are the source
of truth):

- Background: deep night `#030711`, near black with a blue cast.
- Aurora core: bright green `#4ade80` rising to a pale mint `#bbf7d0` at the
  brightest ray centres.
- Aurora edges: teal `#2dd4bf` and cyan `#22d3ee`, with a violet fringe
  `#a78bfa` at the top of the curtains.
- Stars and text: starlight white `#f8fafc` and a dim slate `#94a3b8` for
  secondary readouts.
- Treeline and lake shadow: `#01030a`, darker than the sky.

### Typography
- Everything on the page is monospace: ui-monospace stack. The scene is
  letters, and the HUD and controls speak the same language.
- Type scale: one small title, one HUD block, control labels, one footer
  line. Nothing else.

### Voice
- Tone: quiet, technical, dreamlike. The page says almost nothing: a title,
  live numbers, three labelled controls, one footer line. The sky is the
  content.

## Art Direction

The reference is the ASCII aurora renders shared by dwcminh.ascii: a Python
generated aurora over a lake, drawn in characters, with live statistics in
the corner and a dreamcore, liminal mood. The quality bar is a scene that
reads instantly as an aurora over water: curtains that undulate and ripple,
vertical rays that brighten and fade, a black treeline cutting the horizon,
and a reflection that shimmers rather than mirrors perfectly. No images, no
video, no shader trickery standing in for the character rendering: the
letters are the picture.

## Tokens

Machine-readable design tokens live in `design/tokens.json`. That file is the
single source of truth for token values.

## Component and Layout Rules

### Component Guidelines
- Buttons: small dark translucent chips, thin light border, starlight text;
  the active toggle state fills with the aurora teal.
- Slider: a plain range input, narrow, labelled Activity.
- The controls sit in one row at the top and never cover the horizon line.
- The HUD sits in a top corner, small and translucent, and never overlaps
  the controls row.
- The footer line sits at the very bottom over the darkest part of the lake.

### Layout Principles
- The canvas fills the viewport; the page never scrolls.
- The horizon sits at about 62 percent of the viewport height: sky above,
  lake below, treeline on the line between them.
- Breakpoints: one layout, fluid from 360 px wide upward.

## Motion Rules

- The aurora is the motion: ribbons drift, ripple and breathe on a slow
  activity envelope; rays shimmer at a faster, smaller amplitude.
- The reflection lags and wobbles against the sky; it never moves in lock
  step with it.
- Pause freezes the scene completely. The music toggle never starts or
  stops the animation.
