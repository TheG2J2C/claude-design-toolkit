# iOS Compatibility Reference

> Maps HTML/CSS prototype patterns to their SwiftUI implementation equivalents.
> Check this BEFORE implementing any new UI pattern in the prototype.

## How to Maintain This File

This file is meant to **grow with each design session**. As new HTML/CSS patterns are introduced in the prototype, append them with their SwiftUI equivalent here.

**Convention**: when adding patterns from a session, add a dated subsection rather than mixing into the existing tables — easy diffing, easy rollback.

```markdown
## New Patterns (added 2026-04-28)

| Web pattern | SwiftUI Equivalent | Notes |
|---|---|---|
| Modal card overlay (visibility + opacity → .open) | `.sheet(isPresented:)` with `.presentationDetents([.large])` | iOS 16+ |
| ...etc... | | |
```

The "verified patterns" table below is for items the iOS audit confirmed work as expected. The dated sections are for new mappings discovered during prototyping — they get promoted into the main tables once verified on-device.

## Layout

| HTML/CSS Pattern | SwiftUI Equivalent | Notes |
|---|---|---|
| `position: absolute` | `ZStack` + `.offset()` or `.overlay()` | SwiftUI is alignment-based, not coordinate-based |
| `overflow: hidden` | `.clipped()` | Doesn't create stacking contexts in SwiftUI |
| `z-index` | `.zIndex()` | Only works within immediate parent container |
| `display: flex` | `HStack` / `VStack` | |
| `::before` / `::after` | `.overlay()` / `.background()` | Must be explicit views, not pseudo-elements |
| `clip-path` | `.clipShape()` or custom `Shape` | Unreliable in WKWebView |

## Interactions

| HTML/CSS Pattern | SwiftUI Equivalent | Notes |
|---|---|---|
| Pointer events + velocity | `DragGesture` + `.onEnded { value in value.predictedEndTranslation }` | Completely different model |
| Pull-down panel | `.sheet()` with `presentationDetents([.fraction(), .large])` | Built-in iOS pattern |
| Pull-up bottom sheet | `.sheet()` with `presentationDetents([.medium, .large])` | Apple Maps pattern |
| Drag handle with snap | `DragGesture` + `withAnimation` to nearest snap point | |
| Apple-Reminders-style row swipe (left/right reveals action buttons) | `.swipeActions(edge: .trailing)` and `.swipeActions(edge: .leading)` on `List` rows | Built-in iOS pattern; supports custom buttons + tints per side |
| Floating action button anchored to phone bottom corner (independent of inner panel state) | parent `ZStack` with `.overlay(alignment: .bottomLeading) { FAB() }` | FAB pinned to outer screen, doesn't move with inner state |
| Conditional scroll (overflow:hidden until panel fully open, then auto + reset to top on close) | `ScrollViewReader` + `.scrollDisabled(!atMaxOpen)` + `.scrollTo(.top)` on close | iOS 16+ for `.scrollDisabled` |
| Variable-segment progress bar (3-10 segments stretch to fill same total width) | `HStack(spacing: 2) { ForEach(0..<count) { Rectangle().frame(maxWidth: .infinity) } }` | flex:1 children → infinity-frame |
| Percentage progress bar (continuous fill) | `GeometryReader { Rectangle().fill(color).frame(width: geo.size.width * progress) }` over track, or `ProgressView(value:)` with custom style | |
| CSS transitions | `withAnimation(.easeInOut(duration:))` | |
| CSS @keyframes | `Animation` protocol or `TimelineView` | |
| :hover states | Don't exist on iOS | |

## Avoidance Checklist

Before implementing any UI interaction, answer:
1. What is the iOS-native pattern for this?
2. Does SwiftUI have a built-in component?
3. Am I using CSS tricks that have no SwiftUI equivalent?
4. Can I describe this in SwiftUI terms?
5. Would a SwiftUI developer understand this prototype?

## Common Patterns

### Bottom Sheet (Apple Maps style)
```swift
.sheet(isPresented: $showSheet) {
    SheetContent()
        .presentationDetents([.fraction(0.4), .medium, .large])
        .presentationDragIndicator(.visible)
        .presentationBackgroundInteraction(.enabled)
}
```

### Top Panel (Control Center style)
```swift
// Custom implementation with DragGesture
// No built-in SwiftUI equivalent -- use offset + clipped
```

### Donut Ring
```swift
Circle()
    .trim(from: 0, to: progress)
    .stroke(color, lineWidth: 4.5)
    .rotationEffect(.degrees(-90))
```
