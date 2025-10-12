# Slaydover

A **responsive, swipeable overlay/drawer component** for Vue and Nuxt that adapts its position based on screen breakpoints.
Perfect for modals, drawers, and slide-overs with smooth transitions and mobile gestures.

---

## Demo

[Live Demo](https://crossatko.dev/slaydover#demo)

---

## Features

- Responsive positions based on breakpoints (`md:left`, `lg:right`, etc.)
- Supports all sides: `top`, `right`, `bottom`, `left`
- Swipe to close (direction-aware)
- Custom overlay slot
- Smart scroll and touch gesture handling

---

## Installation

Install the package via npm:

```bash
npm install @crossatko/slaydover
```

---

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Slaydover from '@crossatko/slaydover'
import '@crossatko/slaydover/dist/slaydover.css'

const open = ref(false)
</script>

<template>
  <button @click="open = true">Open Slaydover</button>

  <Slaydover v-model="open" position="bottom lg:right">
    <div class="content">Your awesome content 👌</div>
  </Slaydover>
</template>

<style>
.content {
  padding: 1rem;
  background: white;
}
</style>
```

---

## Props

| Prop          | Type                     | Default                                                          | Description                                                                                                         |
| ------------- | ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `v-model`     | `boolean`                | `false`                                                          | Controls whether the Slaydover is open                                                                              |
| `position`    | `string`                 | `'bottom md:right'`                                              | Determines which side(s) the Slaydover appears from. Can include breakpoint-based modifiers (e.g. `'top md:right'`) |
| `breakpoints` | `Record<string, number>` | `{ xs: 360, sm: 480, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }` | Custom breakpoint definitions (in pixels)                                                                           |

### Position Syntax

You can pass multiple side definitions separated by spaces.
Examples:

| Example                     | Meaning                                                      |
| --------------------------- | ------------------------------------------------------------ |
| `"bottom"`                  | Always slide from bottom                                     |
| `"top md:right"`            | Top on small screens, right on medium and above              |
| `"left md:bottom xl:right"` | Left on mobile, bottom on tablets and right on large screens |
| `"right"`                   | Always from right side                                       |

Invalid values will trigger a console warning but won’t break rendering.

---

## Slots

| Slot      | Description                                                                      |
| --------- | -------------------------------------------------------------------------------- |
| (default) | The main content inside the slaydover                                            |
| `overlay` | Optional overlay background, replaces the default semi-transparent dark backdrop |

### Default Overlay

If you don’t provide an overlay slot, a default semi-transparent dark background is used:

```html
<div class="slaydover-overlay-default"></div>
```

To customize it, use the `#overlay` slot:

```vue
<template #overlay>
  <div class="bg-black/40"></div>
</template>
```

---

## Responsive Behavior

- Automatically detects the active breakpoint (based on `window.innerWidth`) and adjusts the position accordingly.
- You can define position per breakpoint, like `"bottom lg:right"`.

---

## Gestures

- Swipe to close from the same direction the panel entered:
  - Bottom → Swipe down
  - Top → Swipe up
  - Left → Swipe left
  - Right → Swipe right

- Gesture sensitivity adapts to screen size.
- Intelligent scroll detection prevents accidental closures during scroll.

---

## Example with Tailwind Enhancements

```vue
<Slaydover
  v-model="open"
  class="transition-all duration-300"
  position="top md:right"
  :class="{ 'backdrop-blur-sm': open }"
>
  <template #overlay>
    <div class="bg-gray-900/30"></div>
  </template>

  <div class="p-4 flex justify-center items-center h-full bg-white shadow-lg rounded-lg">
    <p>Hello from Slaydover!</p>
  </div>
</Slaydover>
```

---

## License

MIT © 2025 – Free to use, modify, and share.
