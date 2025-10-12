export const breakpoints = {
  xs: '360px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export type Breakpoints = keyof typeof breakpoints
export type Side = 'top' | 'right' | 'bottom' | 'left'

export type ResponsivePosition = string & {
  __constraint?: Side | `${Breakpoints}:${Side}`
}

export const validatePosition = (position: string): boolean => {
  const parts = position.split(' ')
  return parts.every((part) => {
    if (part.includes(':')) {
      const [bp, side] = part.split(':')
      if (!bp || !side) return false
      return breakpoints[bp as Breakpoints] && ['top', 'right', 'bottom', 'left'].includes(side)
    }
    return ['top', 'right', 'bottom', 'left'].includes(part)
  })
}
