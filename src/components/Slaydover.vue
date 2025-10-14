<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch
} from 'vue'

type Breakpoint = string
type Side = 'top' | 'right' | 'bottom' | 'left' | 'center'
type Breakpoints = Partial<Record<'default' | Breakpoint, Side>>
type GestureState = 'pending' | 'scrolling' | 'closing'

const {
  position = 'bottom md:right',
  breakpoints = {
    xs: 360,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  speed = 300,
  modelValue
} = defineProps<{
  position?: string
  breakpoints?: Record<string, number>
  modelValue: boolean
  speed?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const slaydoverContent = useTemplateRef<HTMLElement | null>('slaydoverContent')
const isAnimating = ref(false)
const rAFId = ref<number | null>(null)
const currentTranslate = ref({ x: 0, y: 0 })
const isContentVisible = ref(modelValue)
const overscrollScale = ref(1)
const gestureState = ref<GestureState>('pending')
const contentOpacity = ref(0)
const overlayTransitionDuration = computed(() => `${speed}ms`)
const contentTransitionDuration = computed(() => `${speed}ms`)

const sidesByBreakpoints = computed((): Breakpoints => {
  const result: Breakpoints = { default: 'bottom' }
  const parts = position.split(' ')
  for (const part of parts) {
    if (part.includes(':')) {
      const [bp, side] = part.split(':') as [Breakpoint, Side]
      if (
        bp &&
        side &&
        breakpoints[bp] &&
        ['top', 'right', 'bottom', 'left', 'center'].includes(side)
      ) {
        result[bp] = side
      }
    } else if (['top', 'right', 'bottom', 'left', 'center'].includes(part)) {
      result.default = part as Side
    }
  }
  return result
})

const activePosition = ref<Side>(sidesByBreakpoints.value.default || 'bottom')
const transformOrigin = computed(() => activePosition.value)

const overscrollTransform = computed(() => {
  if (overscrollScale.value === 1) return ''
  const axis =
    activePosition.value === 'top' || activePosition.value === 'bottom'
      ? 'Y'
      : 'X'
  return `scale${axis}(${overscrollScale.value})`
})

const contentTransform = computed(() => {
  const mainTransform = `translate3d(${currentTranslate.value.x}px, ${currentTranslate.value.y}px, 0)`
  if (activePosition.value === 'center') {
    return `translate(-50%, -50%) ${mainTransform} ${overscrollTransform.value}`
  }
  return `${mainTransform} ${overscrollTransform.value}`
})

const getActivePosition = () => {
  if (typeof window === 'undefined') return 'bottom'

  const width = window.innerWidth
  let currentBp: Breakpoint | 'default' = 'default'
  const sortedBps = Object.entries(breakpoints).sort((a, b) => a[1] - b[1])

  for (const [bp, size] of sortedBps) {
    if (width >= size) {
      currentBp = bp
    }
  }

  let pos = sidesByBreakpoints.value.default || 'bottom'
  const bpsOrder = ['default', ...sortedBps.map((b) => b[0])]
  const activeIndex = bpsOrder.indexOf(currentBp)

  for (let i = activeIndex; i >= 0; i--) {
    const bpToCheck = bpsOrder[i]
    if (bpToCheck && sidesByBreakpoints.value[bpToCheck]) {
      pos = sidesByBreakpoints.value[bpToCheck] as Side
      break
    }
  }

  activePosition.value = pos
}

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

const resizeHandler = debounce(getActivePosition, 100)

const onKeyUp = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && modelValue) {
    emit('update:modelValue', false)
  }
}

onMounted(() => {
  getActivePosition()
  window.addEventListener('resize', resizeHandler)
  window.addEventListener('keyup', onKeyUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  window.removeEventListener('keyup', onKeyUp)
})

function animateTo(
  targetTranslate: { x: number; y: number },
  targetScale: number = 1,
  onComplete?: () => void
) {
  if (rAFId.value) cancelAnimationFrame(rAFId.value)

  isAnimating.value = true
  let lastTime = performance.now()
  const stiffness = 4000 / speed

  const step = (currentTime: number) => {
    const dt = (currentTime - lastTime) / 1000
    lastTime = currentTime

    const currentPos = currentTranslate.value
    const distanceX = targetTranslate.x - currentPos.x
    const distanceY = targetTranslate.y - currentPos.y
    const distanceScale = targetScale - overscrollScale.value

    if (
      Math.abs(distanceX) < 0.5 &&
      Math.abs(distanceY) < 0.5 &&
      Math.abs(distanceScale) < 0.001
    ) {
      currentTranslate.value = targetTranslate
      overscrollScale.value = targetScale
      isAnimating.value = false
      rAFId.value = null
      onComplete?.()
      return
    }

    const factor = Math.max(1 - Math.exp(-stiffness * dt), 0)

    currentTranslate.value.x += distanceX * factor
    currentTranslate.value.y += distanceY * factor
    overscrollScale.value += distanceScale * factor

    rAFId.value = requestAnimationFrame(step)
  }
  rAFId.value = requestAnimationFrame(step)
}

const getOffscreenPosition = (): { x: number; y: number } => {
  if (!slaydoverContent.value) return { x: 0, y: 0 }

  const { clientWidth: width, clientHeight: height } = slaydoverContent.value

  switch (activePosition.value) {
    case 'top':
      return { x: 0, y: -height }
    case 'bottom':
      return { x: 0, y: height }
    case 'left':
      return { x: -width, y: 0 }
    case 'right':
      return { x: width, y: 0 }
    case 'center':
      return { x: 0, y: 0 }
    default:
      return { x: 0, y: 0 }
  }
}

function close() {
  if (isAnimating.value) return
  emit('update:modelValue', false)
}

const startPos = ref({ x: 0, y: 0 })
const dragStartPos = ref({ x: 0, y: 0 })
const latestDelta = ref({ x: 0, y: 0 })
const isScrolledToEnd = (el: HTMLElement) =>
  Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 1
function updateDragStyles() {
  if (gestureState.value !== 'closing') {
    rAFId.value = null
    return
  }
  const { x: deltaX, y: deltaY } = latestDelta.value
  const pos = activePosition.value
  const getOverscrollScale = (distance: number) =>
    1 + Math.atan(distance / 500) * 0.1
  overscrollScale.value = 1
  switch (pos) {
    case 'bottom':
      currentTranslate.value.y = Math.max(0, deltaY)
      if (deltaY < 0) {
        overscrollScale.value = getOverscrollScale(Math.abs(deltaY))
      }
      break
    case 'top':
      currentTranslate.value.y = Math.min(0, deltaY)
      if (deltaY > 0) {
        overscrollScale.value = getOverscrollScale(deltaY)
      }
      break
    case 'right':
      currentTranslate.value.x = Math.max(0, deltaX)
      if (deltaX < 0) {
        overscrollScale.value = getOverscrollScale(Math.abs(deltaX))
      }
      break
    case 'left':
      currentTranslate.value.x = Math.min(0, deltaX)
      if (deltaX > 0) {
        overscrollScale.value = getOverscrollScale(deltaX)
      }
      break
  }
  rAFId.value = null
}
function findScrollableParent(
  element: HTMLElement | null,
  container: HTMLElement
): HTMLElement {
  let el = element
  if (!el || !container) return container
  while (el && el !== container) {
    if (el.scrollHeight > el.clientHeight) {
      return el
    }
    el = el.parentElement
  }
  return container
}
function onTouchStart(e: TouchEvent) {
  if (activePosition.value === 'center') return
  if (isAnimating.value || e.touches.length !== 1) return
  if (rAFId.value) cancelAnimationFrame(rAFId.value)
  if (slaydoverContent.value) slaydoverContent.value.style.transition = ''
  const touch = e.touches[0]
  if (!touch) return
  gestureState.value = 'pending'
  startPos.value = { x: touch.clientX, y: touch.clientY }
  latestDelta.value = { x: 0, y: 0 }
}
function onTouchMove(e: TouchEvent) {
  if (activePosition.value === 'center') return
  if (isAnimating.value || e.touches.length !== 1) return
  if (gestureState.value === 'scrolling') return
  const touch = e.touches[0]!
  if (!touch) return
  if (gestureState.value === 'pending') {
    const overallDeltaY = touch.clientY - startPos.value.y
    const overallDeltaX = touch.clientX - startPos.value.x
    if (Math.abs(overallDeltaX) < 5 && Math.abs(overallDeltaY) < 5) {
      return
    }
    const scrollEl = findScrollableParent(
      e.target as HTMLElement,
      slaydoverContent.value!
    )
    let isClosingGesture = false
    const isVerticalGesture = Math.abs(overallDeltaY) > Math.abs(overallDeltaX)
    if (activePosition.value === 'bottom') {
      if (
        isVerticalGesture &&
        (scrollEl.scrollHeight <= scrollEl.clientHeight || overallDeltaY > 0) &&
        (!scrollEl || scrollEl.scrollTop <= 0)
      ) {
        isClosingGesture = true
      }
    } else if (activePosition.value === 'top') {
      if (
        isVerticalGesture &&
        (scrollEl.scrollHeight <= scrollEl.clientHeight || overallDeltaY < 0) &&
        (!scrollEl || isScrolledToEnd(scrollEl))
      ) {
        isClosingGesture = true
      }
    } else if (!isVerticalGesture) {
      isClosingGesture = true
    }
    if (isClosingGesture) {
      gestureState.value = 'closing'
      dragStartPos.value = { x: touch.clientX, y: touch.clientY }
    } else {
      gestureState.value = 'scrolling'
      return
    }
  }
  e.preventDefault()
  latestDelta.value.x = touch.clientX - dragStartPos.value.x
  latestDelta.value.y = touch.clientY - dragStartPos.value.y
  if (!rAFId.value) {
    rAFId.value = requestAnimationFrame(updateDragStyles)
  }
}
function onTouchEnd() {
  if (activePosition.value === 'center') return
  if (gestureState.value !== 'closing' || !slaydoverContent.value) return
  gestureState.value = 'pending'
  if (rAFId.value) {
    cancelAnimationFrame(rAFId.value)
    rAFId.value = null
  }
  const { clientWidth: width, clientHeight: height } = slaydoverContent.value
  const { x: deltaX, y: deltaY } = latestDelta.value
  let shouldClose = false
  const pos = activePosition.value
  switch (pos) {
    case 'bottom':
      if (deltaY > height * 0.2) shouldClose = true
      break
    case 'top':
      if (deltaY < -height * 0.2) shouldClose = true
      break
    case 'right':
      if (deltaX > width * 0.2) shouldClose = true
      break
    case 'left':
      if (deltaX < -width * 0.2) shouldClose = true
      break
  }
  if (shouldClose) {
    emit('update:modelValue', false)
  } else {
    animateTo({ x: 0, y: 0 }, 1)
  }
}

watch(
  () => modelValue,
  async (isOpen) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = isOpen ? 'hidden' : ''

    if (isOpen) {
      isContentVisible.value = true
      await nextTick()

      if (activePosition.value === 'center') {
        contentOpacity.value = 0
        currentTranslate.value = { x: 0, y: 0 }
        await nextTick()
        contentOpacity.value = 1
      } else {
        contentOpacity.value = 1
        currentTranslate.value = getOffscreenPosition()
        overscrollScale.value = 1
        await nextTick()
        animateTo({ x: 0, y: 0 }, 1)
      }
    } else {
      if (!isContentVisible.value) return

      if (activePosition.value === 'center') {
        contentOpacity.value = 0
        setTimeout(() => {
          isContentVisible.value = false
        }, speed)
      } else {
        animateTo(getOffscreenPosition(), 1, () => {
          isContentVisible.value = false
        })
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <div
    class="slaydover"
    :style="`pointer-events: ${modelValue ? 'auto' : 'none'};`"
  >
    <Transition name="slaydover-overlay-fade">
      <div
        v-if="modelValue"
        role="presentation"
        class="slaydover-overlay"
        aria-hidden="true"
        @click="close"
      >
        <slot name="overlay">
          <div class="slaydover-overlay-default"></div>
        </slot>
      </div>
    </Transition>

    <div
      v-if="isContentVisible"
      ref="slaydoverContent"
      class="slaydover-content"
      :class="`slaydover-content--${activePosition}`"
      :style="{
        transform: contentTransform,
        transformOrigin: transformOrigin,
        opacity: contentOpacity
      }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <slot> </slot>
    </div>
  </div>
</template>

<style>
.slaydover {
  position: fixed;
  inset: 0;
  z-index: 9000;
}
.slaydover-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
}

.slaydover-overlay > div {
  flex-grow: 1;
}

.slaydover-overlay-default {
  background: rgba(0, 0, 0, 0.5);
}
.slaydover-overlay-fade-enter-active,
.slaydover-overlay-fade-leave-active {
  transition: opacity v-bind(overlayTransitionDuration) ease;
}
.slaydover-overlay-fade-enter-from,
.slaydover-overlay-fade-leave-to {
  opacity: 0;
}
.slaydover-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 2;
  will-change: transform, opacity;
  max-width: 100vw;
  max-height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.slaydover-content--top {
  top: 0;
  left: 0;
  right: 0;
}
.slaydover-content--bottom {
  bottom: 0;
  left: 0;
  right: 0;
}
.slaydover-content--left {
  left: 0;
  top: 0;
  bottom: 0;
  flex-direction: row;
}
.slaydover-content--right {
  right: 0;
  top: 0;
  bottom: 0;
  flex-direction: row;
}

.slaydover-content--center {
  top: 50%;
  left: 50%;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  transition: opacity v-bind(contentTransitionDuration) ease;
}
</style>
