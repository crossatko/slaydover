<script setup lang="ts">
import { computed, defineModel, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { useSwipe } from '@vueuse/core'
import type { UseSwipeDirection } from '@vueuse/core'

const breakpoints = {
  xs: 360,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

type Breakpoint = keyof typeof breakpoints
type Side = 'top' | 'right' | 'bottom' | 'left'
type Breakpoints = Partial<Record<'default' | Breakpoint, Side>>

const { position = 'bottom md:left' } = defineProps<{
  position?: string
}>()

function validatePosition(position: string): boolean {
  const parts = position.split(' ')
  return parts.every((part) => {
    if (part.includes(':')) {
      const [bp, side] = part.split(':')
      if (!bp || !side) return false
      return breakpoints[bp as Breakpoint] && ['top', 'right', 'bottom', 'left'].includes(side)
    }
    return ['top', 'right', 'bottom', 'left'].includes(part)
  })
}

const sidesByBreakpoints = computed((): Breakpoints => {
  const result: Breakpoints = { default: 'bottom' }

  const parts = position.split(' ')
  for (const part of parts) {
    if (part.includes(':')) {
      const [bp, side] = part.split(':')
      if (
        bp &&
        side &&
        breakpoints[bp as Breakpoint] &&
        ['top', 'right', 'bottom', 'left'].includes(side)
      ) {
        result[bp as Breakpoint] = side as Side
      }
    } else if (['top', 'right', 'bottom', 'left'].includes(part)) {
      result.default = part as Side
    }
  }
  return result
})

if (position && !validatePosition(position)) {
  console.warn(
    `Invalid position prop: "${position}". Expected format: side or breakpoint:side (e.g., "top md:right").`,
  )
}

const slaydover = useTemplateRef('slaydover')
const slaydoverContent = useTemplateRef('slaydoverContent')
const open = defineModel<boolean>({ default: false })

const activeBreakpoint = ref<Breakpoint | 'default'>('default')
const activePosition = ref<Side>(sidesByBreakpoints.value.default || 'bottom')

function getActiveBreakpoint(): Breakpoint | 'default' {
  if (typeof window === 'undefined') return 'default'
  const width = window.innerWidth
  let active: Breakpoint | 'default' = 'default'
  for (const [bp, size] of Object.entries(breakpoints)) {
    if (width >= size) {
      active = bp as Breakpoint
    }
  }

  activeBreakpoint.value = active
  return active
}

function getActivePosition(): Side {
  const activeBp = getActiveBreakpoint()

  let position = sidesByBreakpoints.value.default || 'bottom'

  if (activeBp !== 'default' && sidesByBreakpoints.value[activeBp]) {
    position = sidesByBreakpoints.value[activeBp] as Side
  } else {
    // Check for the largest matching breakpoint less than the active one
    const bps = Object.keys(breakpoints) as Breakpoint[]
    const activeIndex = bps.indexOf(activeBp as Breakpoint)
    for (let i = activeIndex - 1; i >= 0; i--) {
      const bp = bps?.[i]
      if (!bp) continue
      if (sidesByBreakpoints.value[bp as Breakpoint]) {
        position = sidesByBreakpoints.value[bp as Breakpoint] as Side
        break
      }
    }
  }

  activePosition.value = position
  canClose.value = position !== 'top'
  return position
}

let resizeTimeout: number | undefined

function onResizeDebounced(callback: () => void, delay = 100) {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = window.setTimeout(callback, delay)
}

let resizeHandler: () => void

function generateStyles(): string {
  if (!slaydover.value) return ''
  const styleElementId = 'slaydover-dynamic-styles'
  let styleElement = document.getElementById(styleElementId) as HTMLStyleElement | null
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = styleElementId
    document.head.appendChild(styleElement)
  }

  let styles = ''
  for (const [bp, side] of Object.entries(sidesByBreakpoints.value)) {
    const selector =
      bp === 'default' ? '' : `@media (min-width: ${breakpoints[bp as Breakpoint]}px) {`
    const closingBracket = bp === 'default' ? '' : '}'
    let positionStyles = ''
    switch (side) {
      case 'top':
        positionStyles = 'top: 0; left: 0; right: 0; right: auto;'
        break
      case 'right':
        positionStyles = 'top: 0; right: 0; bottom: 0; left: auto;'
        break
      case 'bottom':
        positionStyles = 'bottom: 0; left: 0; right: 0; top: auto;'
        break
      case 'left':
        positionStyles = 'top: 0; left: 0; bottom: 0; right: auto;'
        break
    }
    styles += `
      ${selector}
      .slaydover-content {
        ${positionStyles}
      }
      ${closingBracket}
    `
  }
  styleElement.innerHTML = styles
  return styles
}

onMounted(() => {
  generateStyles()
  getActiveBreakpoint()
  resizeHandler = () => {
    onResizeDebounced(() => {
      getActiveBreakpoint()
      getActivePosition()
    })
  }
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
})

function close() {
  open.value = false
}

const canClose = ref(true)
const lastContentScroll = ref(0)
const coords = ref<{ x: number; y: number }>({ x: 0, y: 0 })
const isScrolling = ref(false)

const { direction, isSwiping, lengthX, lengthY } = useSwipe(slaydoverContent, {
  passive: false,
  onSwipe(e: TouchEvent) {
    coords.value = { x: lengthX.value, y: lengthY.value }
    const content = slaydoverContent.value?.children?.[0] as HTMLDivElement
    if (!content) return
    if (!canClose.value) return

    content.onscroll = () => {
      isScrolling.value = true
    }
    content.onscrollend = () => {
      isScrolling.value = false
    }

    if (isScrolling.value) return

    if (activePosition.value === 'bottom' && lengthY.value < 0) {
      content.style.transform = `translateY(${coords.value.y * -1}px)`
    } else if (activePosition.value === 'top' && lengthY.value > 0) {
      if (content.scrollTop === content.scrollHeight - content.clientHeight) {
        content.style.transform = `translateY(${coords.value.y * -1}px)`
      }
    } else if (activePosition.value === 'left' && lengthX.value > 0) {
      content.style.transform = `translateX(${coords.value.x * -1}px)`
    } else if (activePosition.value === 'right' && lengthX.value < 0) {
      content.style.transform = `translateX(${coords.value.x * -1}px)`
    }
  },
  onSwipeEnd(e: TouchEvent, direction: UseSwipeDirection) {
    const content = slaydoverContent.value?.children?.[0] as HTMLDivElement
    if (!content) return

    let closing = false

    if (activePosition.value === 'bottom' && direction === 'down') {
      if (!canClose.value) {
        canClose.value = true
        return
      }
      closing = true
    } else if (activePosition.value === 'top' && direction === 'up') {
      if (!canClose.value) {
        canClose.value = true
        return
      }
      closing = true
    } else if (activePosition.value === 'left' && direction === 'left') {
      closing = true
    } else if (activePosition.value === 'right' && direction === 'right') {
      closing = true
    }

    if (
      ['up', 'down', 'none'].includes(direction) &&
      ['top', 'bottom'].includes(activePosition.value)
    ) {
      if (Math.abs(coords.value?.y) < content.getBoundingClientRect().height / 4) {
        closing = false
        coords.value.y = 0
        resetElementTransform(content)
      }
    } else if (
      ['left', 'right', 'none'].includes(direction) &&
      ['left', 'right'].includes(activePosition.value)
    ) {
      if (Math.abs(coords.value?.x) < content.getBoundingClientRect().width / 4) {
        closing = false
        coords.value.x = 0
        resetElementTransform(content)
      }
    }

    lastContentScroll.value = content.scrollTop
    if (activePosition.value === 'bottom' && lastContentScroll.value > 0) {
      canClose.value = false
    }

    if (
      activePosition.value === 'top' &&
      content.scrollHeight > content.clientHeight &&
      lastContentScroll.value === content.scrollHeight - content.clientHeight
    ) {
      canClose.value = false
    }

    if (closing) {
      coords.value = { x: 0, y: 0 }
      close()
      return
    }

    coords.value = { x: 0, y: 0 }
  },
})

function resetElementTransform(el: HTMLElement | null) {
  if (!el) return
  el.style.transition = 'transform 0.2s ease-in-out'
  el.style.transform = 'translateX(0px) translateY(0px)'
  setTimeout(() => {
    if (!el) return
    el.style.transition = ''
  }, 300)
}
</script>

<template>
  <div ref="slaydover" class="slaydover">
    <Transition name="slaydover-overlay">
      <div
        role="presentation"
        class="slaydover-overlay"
        aria-hidden="true"
        @click="close"
        v-if="open"
      >
        <slot name="overlay">
          <div></div>
        </slot>
      </div>
    </Transition>

    <Transition :name="`slaydover-content-${getActivePosition()}`">
      <div class="slaydover-content" ref="slaydoverContent" v-if="open">
        <slot>
          <div style="background: white; padding: 2rem; max-width: 768px">
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Deleniti illum totam
              doloremque modi? Quia praesentium itaque nulla similique reiciendis sequi numquam
              temporibus eaque, fugiat perspiciatis est a? Rem, optio perferendis.
            </p>
            <p>
              Et cum tempora unde maiores eaque, libero ipsa est voluptas ut aliquam, asperiores
              alias ab harum dolore. Eaque molestias saepe ea ullam exercitationem, voluptates illum
              voluptas provident in distinctio maxime!
            </p>
            <p>
              Consequatur perferendis sequi enim veritatis eveniet sunt natus laborum tempore non
              ipsum, molestias assumenda debitis nesciunt quod recusandae suscipit officia! Eius,
              rerum voluptate. Quam, fugiat tempore quia voluptas et necessitatibus.
            </p>
            <p>
              Nobis rerum corrupti explicabo eos iusto autem, aperiam quidem, perspiciatis
              accusantium magnam nulla maiores laborum possimus repellendus dolorum impedit
              assumenda rem nihil vero. Eveniet ad nisi blanditiis sint harum nihil!
            </p>
            <p>
              Culpa, exercitationem blanditiis! Cum ipsam, quaerat pariatur necessitatibus minima
              culpa aut distinctio tenetur blanditiis praesentium illum sed accusamus placeat
              reprehenderit vero laborum inventore nobis dolorum minus recusandae. Iure, sed? Quo.
            </p>
            <p>
              Nulla est velit cumque? Voluptatum recusandae velit rerum. Illum consectetur delectus
              est dicta ullam odio dolor consequatur eligendi, adipisci temporibus velit cupiditate
              enim accusamus placeat eveniet. Soluta ipsum voluptatibus ducimus.
            </p>
            <p>
              Corrupti, magnam aliquid aspernatur error eos asperiores pariatur eligendi
              necessitatibus, consequuntur reprehenderit dicta numquam commodi tenetur molestias
              porro reiciendis velit odit alias nam, praesentium totam dolores deserunt ducimus.
              Nemo, in!
            </p>
            <p>
              Commodi saepe consequatur neque vel repellendus rem laudantium dolor dicta, itaque
              aliquam tenetur cum vero quae accusamus repudiandae cumque, optio iusto rerum natus id
              at? Quisquam sed corrupti natus aperiam?
            </p>
            <div>slaydover</div>
            <div>{{ open }}</div>
            <div>
              {{ position }}
            </div>
            <div>
              {{ sidesByBreakpoints }}
            </div>
            <div>{{ generateStyles() }}</div>
            <div>{{ activeBreakpoint }}</div>
            <div>{{ activePosition }}</div>
            <div>{{ isSwiping }} {{ direction }}</div>
          </div>
        </slot>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}
.slaydover {
  position: fixed;
  width: 100%;
  height: 100%;
  max-height: 100svh;
  max-width: 100svw;
  overflow: hidden;
  top: 0;
  left: 0;
  pointer-events: none;
}

.slaydover-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  z-index: 9005;
  will-change: transform, opacity;
}
.slaydover-overlay > div {
  background: rgba(0, 0, 0, 0.5);
  flex-grow: 1;
  pointer-events: auto;
  position: relative;
}

.slaydover-content {
  position: absolute;
  display: flex;
  z-index: 9010;
  pointer-events: auto;
  will-change: transform, opacity;
  width: auto;
  min-width: 100px;
}

.slaydover-content > * {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 100svh;
}

.slaydover-overlay-enter-active,
.slaydover-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.slaydover-overlay-enter-from,
.slaydover-overlay-leave-to {
  opacity: 0;
}

.slaydover-content-left-enter-active,
.slaydover-content-left-leave-active,
.slaydover-content-right-enter-active,
.slaydover-content-right-leave-active,
.slaydover-content-top-enter-active,
.slaydover-content-top-leave-active,
.slaydover-content-bottom-enter-active,
.slaydover-content-bottom-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.slaydover-content-left-enter-from,
.slaydover-content-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slaydover-content-right-enter-from,
.slaydover-content-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.slaydover-content-top-enter-from,
.slaydover-content-top-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
.slaydover-content-bottom-enter-from,
.slaydover-content-bottom-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
