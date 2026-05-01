````md
# Gooey Toast Integration Guide for VS Code Copilot

## Overview
`goey-toast` is a modern React toast notification library with smooth animations, promise handling, and customizable UI. This guide is optimized for **fast integration using VS Code Copilot**.

---

## 1. Installation

```bash
npm install goey-toast framer-motion
````

---

## 2. Global CSS (REQUIRED)

Add this once in your entry file:

### Vite / React

```tsx
// src/main.tsx
import 'goey-toast/styles.css'
```

### Next.js (App Router)

```tsx
// app/layout.tsx
import 'goey-toast/styles.css'
```

---

## 3. Add Toaster (ROOT LEVEL)

```tsx
import { GooeyToaster } from 'goey-toast'

export default function App() {
  return (
    <>
      <GooeyToaster position="bottom-right" />
      {/* App content */}
    </>
  )
}
```

### Recommended Config

```tsx
<GooeyToaster
  position="bottom-right"
  closeButton="top-right"
  showProgress
  swipeToDismiss
/>
```

---

## 4. Basic Usage

```tsx
import { gooeyToast } from 'goey-toast'

gooeyToast.success('Saved successfully')
gooeyToast.error('Something went wrong')
gooeyToast.warning('Check your input')
gooeyToast.info('New update available')
```

---

## 5. With Description

```tsx
gooeyToast.success('Profile updated', {
  description: 'Your changes have been saved.',
})
```

---

## 6. With Action Button

```tsx
gooeyToast.info('Link ready', {
  description: 'Click to copy link',
  action: {
    label: 'Copy',
    onClick: () => navigator.clipboard.writeText(window.location.href),
    successLabel: 'Copied!',
  },
})
```

---

## 7. Promise-Based Toast (IMPORTANT)

Best practice for API calls:

```tsx
gooeyToast.promise(fetch('/api/save'), {
  loading: 'Saving...',
  success: 'Saved successfully',
  error: 'Save failed',
})
```

---

## 8. Update Toast

```tsx
const id = gooeyToast('Uploading...')

setTimeout(() => {
  gooeyToast.update(id, {
    title: 'Upload complete',
    type: 'success',
  })
}, 2000)
```

---

## 9. Dismiss Toasts

```tsx
gooeyToast.dismiss()                // all
gooeyToast.dismiss(id)             // specific
gooeyToast.dismiss({ type: 'error' })
```

---

## 10. Recommended Project Structure

```txt
src/
  lib/
    toast.ts
```

### `toast.ts`

```tsx
import { gooeyToast } from 'goey-toast'

export const toast = {
  success: (title: string, description?: string) =>
    gooeyToast.success(title, { description }),

  error: (title: string, description?: string) =>
    gooeyToast.error(title, { description }),

  warning: (title: string, description?: string) =>
    gooeyToast.warning(title, { description }),

  info: (title: string, description?: string) =>
    gooeyToast.info(title, { description }),
}
```

---

## 11. Usage via Helper

```tsx
import { toast } from '@/lib/toast'

toast.success('Saved', 'Data persisted')
toast.error('Failed', 'Try again')
```

---

## 12. Next.js (App Router Setup)

### Client Wrapper

```tsx
// components/app-toaster.tsx
'use client'

import { GooeyToaster } from 'goey-toast'

export function AppToaster() {
  return <GooeyToaster position="bottom-right" />
}
```

### Layout

```tsx
import { AppToaster } from '@/components/app-toaster'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <AppToaster />
      </body>
    </html>
  )
}
```

---

## 13. VS Code Copilot Prompts

### Generic Integration

```txt
Integrate goey-toast into this React project.

Requirements:
- Install goey-toast and framer-motion
- Import goey-toast/styles.css globally
- Add GooeyToaster once in root
- Use gooeyToast.success/error/info/warning
- Use gooeyToast.promise for API calls
- Do not duplicate GooeyToaster
```

---

### Vite React Prompt

```txt
Add goey-toast to this Vite React project.

Steps:
- Import goey-toast/styles.css in main.tsx
- Add GooeyToaster in App.tsx
- Create src/lib/toast.ts helper
- Replace alert() with toast usage
```

---

### Next.js Prompt

```txt
Add goey-toast to this Next.js App Router project.

Steps:
- Import global CSS
- Create client toaster component
- Inject in layout.tsx
- Use gooeyToast.promise for forms
```

---

### Replace Existing Toast Library

```txt
Replace current toast library with goey-toast.

- Map success/error/info/warning
- Add GooeyToaster once in root
- Remove old library
- Preserve existing messages
```

---

## 14. Common Mistakes

### Missing CSS

```tsx
// ❌ wrong
import { GooeyToaster } from 'goey-toast'

// ✅ correct
import { GooeyToaster } from 'goey-toast'
import 'goey-toast/styles.css'
```

---

### Multiple Toasters

```tsx
// ❌ avoid
<GooeyToaster />
<GooeyToaster />

// ✅ correct
<GooeyToaster />
```

---

### Toast Without Toaster

```tsx
// ❌ will not render
gooeyToast.success('Saved')

// ✅ ensure this exists
<GooeyToaster />
```

---

## 15. Quick Test

```tsx
import { toast } from '@/lib/toast'

export function Test() {
  return (
    <button onClick={() => toast.success('Toast working')}>
      Test Toast
    </button>
  )
}
```

---

## 16. Minimal Setup Summary

```bash
npm install goey-toast framer-motion
```

```tsx
import 'goey-toast/styles.css'
```

```tsx
<GooeyToaster />
```

```tsx
gooeyToast.success('Done')
```

---

## Final Notes

* Always place `GooeyToaster` at root level
* Prefer helper wrapper for scalability
* Use `promise()` for async operations
* Keep Copilot prompts explicit and structured

```
```
