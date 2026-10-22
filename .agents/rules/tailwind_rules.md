# Tailwind CSS v4 Strict Guidelines & Rules

Tailwind CSS v4 is used in this repository (`frontend/`). All AI assistants and contributors MUST strictly follow these rules:

## 1. ⛔ No CSS Property Conflicts (tailwindcss cssConflict)
- **Never mix incompatible display classes on the same element**:
  - ❌ NEVER use: `block flex`, `inline flex`, `hidden block`
  - ✅ Use ONLY ONE display type: e.g. `<label className="flex items-center gap-1.5 ...">`

## 2. 🎯 Canonical Classes (tailwindcss suggestCanonicalClasses)
- Use Tailwind's official canonical scale utilities instead of arbitrary bracket values:
  - **Spacing / Sizing**:
    - ❌ `w-[32rem]` ➡️ ✅ `w-lg` (or `w-128`)
    - ❌ `h-[32rem]` ➡️ ✅ `h-128`
    - ❌ `max-w-[180px]` ➡️ ✅ `max-w-45`
  - **Stroke Width**:
    - ❌ `stroke-[3]` ➡️ ✅ `stroke-3`
  - **Background Size**:
    - ❌ `bg-[size:28px_28px]` ➡️ ✅ `bg-size-[28px_28px]`

## 3. 🌈 Linear Gradients (v4 Standard)
- Linear gradients use the modern `bg-linear-*` syntax:
  - ❌ NEVER use: `bg-gradient-to-r`, `bg-gradient-to-l`, `bg-gradient-to-t`, `bg-gradient-to-b`, `bg-gradient-to-tr`, `bg-gradient-to-br`
  - ✅ ALWAYS use: `bg-linear-to-r`, `bg-linear-to-l`, `bg-linear-to-t`, `bg-linear-to-b`, `bg-linear-to-tr`, `bg-linear-to-br`

## 4. ⛔ NEVER Use Deprecated / Removed Utilities
- **No Standalone Opacity Utilities**:
  - ❌ NEVER use: `bg-opacity-*`, `text-opacity-*`, `border-opacity-*`
  - ✅ ALWAYS use slash alpha notation: `bg-surface/50`, `text-white/80`, `border-main/20`
- **No `flex-shrink-*` / `flex-grow-*`**:
  - ❌ NEVER use: `flex-shrink-0`, `flex-shrink`, `flex-grow`
  - ✅ ALWAYS use: `shrink-0`, `shrink`, `grow`
- **No Redundant `transform` Utility**:
  - ❌ Do NOT add `transform` class alongside `scale-*`, `rotate-*`, or `translate-*`.
  - ✅ CSS transforms work natively: e.g. `scale-105 rotate-3 -translate-y-1/2`.

## 5. ⚙️ CSS Directives & Variants
- Custom variants in CSS:
  - ✅ `@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));`
- Base import:
  - ✅ `@import "tailwindcss";`

## 6. 🎨 Design System Tokens Consistency
- Prioritize semantic tokens defined in `frontend/src/index.css`:
  - `bg-main`, `bg-surface`, `bg-elevated`, `text-main`, `text-muted`, `border-main`, `border-soft`, `shadow-card`
