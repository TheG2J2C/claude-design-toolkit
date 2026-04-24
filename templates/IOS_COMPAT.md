# iOS Compatibility Reference

> Maps HTML/CSS prototype patterns to their SwiftUI implementation equivalents.
> Check this BEFORE implementing any new UI pattern in the prototype.

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
