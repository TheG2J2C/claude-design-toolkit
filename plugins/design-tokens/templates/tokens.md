---
name: Design Tokens
slug: tokens
status: locked
locked_date: 2026-04-29
machine_readable: tokens.json
---

# Design Tokens

> **Single source for all colours, type, sizes, shadows, and z-index.** Component specs reference these by token name; never inline new hex values.
> **Machine-readable mirror:** `tokens.json` follows the W3C Design Tokens Format Module 2025.10. When the iOS build starts, run Style Dictionary against it to auto-generate Swift constants.

## Colour — Category (CC)

| Token | Hex | Use |
|---|---|---|
| `color.category.body` | `#C49A3D` | Body category accent (gold) |
| `color.category.mind` | `#3D8B8B` | Mind category accent (teal) |
| `color.category.routine` | `#7B6E9E` | Routine category accent (purple) |

## Colour — Mood Sky, Light Theme (Nurturing Companion)

| Token | Hex |
|---|---|
| `color.mood.light.happy` | `#BBE0F2` |
| `color.mood.light.content` | `#C9DCC3` |
| `color.mood.light.bored` | `#D6D3C8` |
| `color.mood.light.sad` | `#A9B5C4` |
| `color.mood.light.critical` | `#7A5252` |

## Colour — Mood Sky, Dark Theme (Midnight Kennel)

| Token | Hex |
|---|---|
| `color.mood.dark.happy` | `#1A3A4D` |
| `color.mood.dark.content` | `#1E362D` |
| `color.mood.dark.bored` | `#2D2C2A` |
| `color.mood.dark.sad` | `#1A2233` |
| `color.mood.dark.critical` | `#3D1F1F` |

## Colour — UI

| Token | Hex | Use |
|---|---|---|
| `color.ui.background` | `#FFF8F0` | App background (cream) |
| `color.ui.text-primary` | `#2C160E` | Primary text |
| `color.ui.text-secondary` | `#6F4627` | Secondary text |
| `color.ui.border` | `#E7E5E4` | Borders |
| `color.ui.accent` | `#8B5E3C` | Primary accent (brown) |
| `color.ui.night-sky` | `#0B1026` | Night sky overlay |
| `color.ui.muted-brown` | `#8B5E3C` | Header dividers, default checkbox borders |
| `color.ui.warm-grey` | `#A8A29E` | Time labels, info-date text |
| `color.ui.item-bg` | `#FFFCF5` | Habbit-row backgrounds |
| `color.ui.bar-off-bg` | `#F0EDE8` | Empty bar segments |
| `color.ui.bar-off-border` | `#D9D2C9` | Empty bar segment border |
| `color.ui.curtain` | `#FFFFFF` | Pull-down curtain surface |
| `color.ui.side-drawer` | `#EFF3F8` | Side drawer surface |

## Colour — Training Skill (10-skill palette, LOCKED)

| Token | Hex | Skill |
|---|---|---|
| `color.skill.chew`   | `#009688` | Chew (teal) |
| `color.skill.bark`   | `#FFA500` | Bark (orange) |
| `color.skill.jump`   | `#E91E63` | Jump (hot pink) |
| `color.skill.pull`   | `#D32F2F` | Pull (red) |
| `color.skill.run`    | `#4CAF50` | Run (green) |
| `color.skill.dig`    | `#A0826D` | Dig (tan) |
| `color.skill.steal`  | `#9C27B0` | Steal (purple) |
| `color.skill.toilet` | `#2196F3` | Toilet (blue) |
| `color.skill.chase`  | `#FF7043` | Chase (coral) |
| `color.skill.mud`    | `#6D4C41` | Mud (dark earth) |

## Colour — Status

| Token | Hex | Use |
|---|---|---|
| `color.status.age-active` | `#A4000E` | Age display active red |
| `color.status.age-inactive` | `#C8C8C8` | Age display inactive grey |
| `color.status.locked` | `#A8A8A8` | Locked-state shield |
| `color.status.tray-locked` | `#C8C8C8` | Locked-state tray |

## Day/Night Mode (DN)

Day/night is **app-controlled**, not system-driven. Does NOT follow `@Environment(\.colorScheme)`.

| Property | Value |
|---|---|
| Mode source | App-internal toggle (time of day OR manual override) |
| Day behaviour | Sky = current mood colour from light theme |
| Night behaviour | Sky = `color.ui.night-sky`, Frankie sleeps, wake button appears |
| Wake override | User can wake Frankie at night → sky returns to mood colour with vignette |

```swift
@Observable class TimeOfDay {
    var isNight: Bool = false
    var artificialLightOn: Bool = false
    var skyColor: Color {
        if isNight && !artificialLightOn { return Color("ui.night-sky") }
        return currentMood.skyColor
    }
}
```

## Typography

| Token | Value | Note |
|---|---|---|
| `typography.family` | SF Pro | iOS: `.font(.system(...))`. WKWebView: `font-family: -apple-system, "SF Pro Display", "SF Pro Text", system-ui`. Never reference SF Pro by name in iOS code. |

Sizes used in components (token slug → px):
`ring-side: 9` · `ring-primary: 12` · `habit-name: 14` · `habit-time: 9` · `habit-target: 12` · `habit-date: 9` · `header-progress: 13` · `doggy-msg: 13` · `name-bar: 20`

Weights: `regular: 400`, `medium: 500`, `semibold: 600`, `bold: 700`, `heavy: 800`, `black: 900`.

## Shadow

| Token | CSS | SVG | SwiftUI |
|---|---|---|---|
| `shadow.standard` | `box-shadow: 0 2px 6px rgba(0,0,0,0.12)` | `<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.12"/>` | `.shadow(color: .black.opacity(0.12), radius: 3, x: 0, y: 2)` |
| `shadow.deep` | `box-shadow: 0 2px 6px rgba(0,0,0,0.18)` | `<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.18"/>` | `.shadow(color: .black.opacity(0.18), radius: 3, x: 0, y: 2)` |

> **Translation note:** CSS `stdDeviation: 3` ↔ CSS `blur: 6px` ↔ SwiftUI `radius: 3`. CSS blur = 2 × SwiftUI radius.

## Spacing

| Token | Value | Use |
|---|---|---|
| `spacing.phone.width` | 390px | Phone container |
| `spacing.phone.height` | 884px | Phone container |
| `spacing.habbit-row.width` | 358px | Habbit row outer |
| `spacing.habbit-row.padding` | 17.5px / 12px | Habbit row vertical / horizontal |
| `spacing.task-header.height` | 32px | Task header strip |
| `spacing.pd-bar.height` | 90px | Pull-down top bar |

## Border Radius

| Token | Value |
|---|---|
| `radius.small` | 2px |
| `radius.medium` | 8px |
| `radius.large` | 10px |
| `radius.xl` | 16px |
| `radius.circle` | 50% |

## Z-Index Scale

| Token | Value | Element |
|---|---|---|
| `z-index.frankie` | 1 | Frankie wrap (behind everything in hero) |
| `z-index.doggy-feed` | 2 | Chat feed |
| `z-index.vignette` | 3 | Mood vignette overlay |
| `z-index.sleep-zzz` | 4 | Sleep Z glyphs |
| `z-index.wake-flash` | 5 | Wake flash |
| `z-index.wake-button` | 6 | Wake button |
| `z-index.cloud-pill` | 10 | Cloud pill with rings |
| `z-index.ctrl-panel` | 11 | Debug controls (FIXED, not in flow) |
| `z-index.topbar-icon` | 12 | Shop / settings icons |
| `z-index.counter` | 13 | Heart / bones counters |
| `z-index.habbit-panel` | 19 | Mock habbit list |
| `z-index.split-handle` | 20 | Split / task drag handle |
| `z-index.task-header` | 21 | Habbit header bar |
| `z-index.side-drawer` | 22 | Side drawer |
| `z-index.pulldown` | 25 | Pull-down curtain |
| `z-index.modal` | 30 | Shop / Settings / Add Habbit modals |

## Effects

| Token | Property | Value |
|---|---|---|
| `effect.sky-transition` | `background` transition | `400ms ease` |
| `effect.snap` | snap animation | `180ms ease-out cubic` |
| `effect.curtain-snap` | curtain animation | `250ms ease-out cubic` |
| `effect.modal-fade` | modal opacity transition | `200ms ease` |

## Iconography Standards

- All custom SVG icons sit on a 22px footprint where possible (cross-row alignment requires it).
- Icons take a single `currentColor` fill so they can recolour with their row state.
- All custom assets needed are listed in `components/owners-card.md` §Assets and `components/training-badge.md` §Assets.
