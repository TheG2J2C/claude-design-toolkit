# Sources & Reading List

> Background reading for the patterns this toolkit uses. Each link below is referenced by name in the templates so the toolkit stays self-contained.

## Design Tokens

- [W3C Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/) — stable JSON format, vendor-neutral. The `tokens.json` template follows this spec.
- [Design Tokens Community Group](https://www.w3.org/community/design-tokens/) — context on the W3C effort.
- [Style Dictionary](https://amzn.github.io/style-dictionary/) — reference tool that consumes W3C-format tokens and generates Swift / Kotlin / CSS / etc.
- [Tokens Studio for Figma — W3C DTCG vs Legacy](https://docs.tokens.studio/manage-settings/token-format) — practical comparison.

## Atomic / Component-First Documentation

- [Google Labs — DESIGN.md spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) — markdown + YAML frontmatter design system spec for human + AI consumption. The component template is inspired by this format.
- [UXPin — Design System Documentation in 9 Easy Steps](https://www.uxpin.com/studio/blog/design-system-documentation-guide/)
- [LogRocket — Tips for design system documentation you'll actually use](https://blog.logrocket.com/ux-design/design-system-documentation/) — anti-patterns including monolithic specs.
- [Backlight — Design System Documentation Best Practices](https://backlight.dev/blog/design-system-documentation-best-practices)
- [Storybook — 4 ways to document your design system](https://storybook.js.org/blog/4-ways-to-document-your-design-system-with-storybook/) — for projects that adopt component-preview tooling.

## Pixel-Perfect Handoff (the Acceptance Criteria pattern)

- [Pixel Point — Handoffs Guide for Pixel Perfect Design (Part I)](https://medium.com/pixelpoint/handoffs-guide-for-pixel-perfect-design-part-i-8bbd95d8ffcd) — explicit acceptance criteria as the contract.
- [Creating Pixel-Perfect UI Design in SwiftUI](https://medium.com/@garejakirit/creating-pixel-perfect-ui-design-in-swiftui-c937d2e81578) — SwiftUI techniques (`.frame(width:height:)`, `.fixedSize()`, exact font sizes).
- [Creating Pixel-Perfect Designs in SwiftUI: Tips and Tricks](https://simaspavlos.medium.com/creating-pixel-perfect-designs-in-swiftui-tips-and-tricks-71053ef1624f)
- [UXPin — Design Handoff Basics: What Do Developers Need from Designers?](https://www.uxpin.com/studio/blog/what-developers-need-from-designers-during-design-handoff/)

## Claude Code — Slash Commands, Subagents, Skills

- [Create custom subagents — Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Slash Commands vs Subagents — How to Keep AI Tools Focused (Jason Liu)](https://jxnl.co/writing/2025/08/29/context-engineering-slash-commands-subagents/)
- [Claude Code Customization Guide (alexop.dev)](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)
- [Claude Code Advanced Best Practices: 11 Practical Techniques (SmartScope, 2026)](https://smartscope.blog/en/generative-ai/claude/claude-code-best-practices-advanced-2026/)

## Claude Managed Agents (when you graduate from local subagents)

- [Anthropic Engineering — Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents)
- [Claude Managed Agents — get to production 10x faster (claude.com blog)](https://claude.com/blog/claude-managed-agents)
- [Anthropic Introduces Managed Agents (InfoQ, April 2026)](https://www.infoq.com/news/2026/04/anthropic-managed-agents/)

## HTML Workbench Build (when monolithic homepage.html outgrows you)

- [Vite — vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) — bundles to one HTML for environments like WKWebView.
- [Vite WKWebView module discussion](https://github.com/vitejs/vite/discussions/14485) — important compat constraint (no `<script type="module">` pre-iOS 17).
- [Vite — Generate separate CSS file per entrypoint](https://github.com/vitejs/vite/discussions/11386).
- [vite-plugin-css-modules (RNA / Chialab)](https://chialab.github.io/rna/guide/vite-plugin-css-modules.html).

## iOS Compatibility References

- [Apple — Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SwiftUI — DragGesture documentation](https://developer.apple.com/documentation/swiftui/draggesture)
- [SwiftUI — sensoryFeedback (iOS 17+)](https://developer.apple.com/documentation/swiftui/view/sensoryfeedback(_:trigger:)) — replaces UIKit haptic generators.
