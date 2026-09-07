import type { JSX, ReactNode, RefObject } from 'react'

export type Responsive = number | { base?: number; md?: number; lg?: number; xl?: number }

export interface CarouselControlsState {
  page: number
  pages: number
  ratio: number
  goToPage: (index: number) => void
  step: (delta: number) => void
}

export interface CarouselProps {
  children?: ReactNode
  slidesPerView?: Responsive
  peek?: Responsive
  mobilePeek?: number
  gap?: number
  controls?: 'dots' | 'progress' | 'none'
  controlsOnMobile?: boolean
  showDots?: boolean
  showArrows?: boolean
  renderControls?: (state: CarouselControlsState) => ReactNode
  trackClassName?: string
  edgeBleed?: boolean
  edgeBleedSides?: 'both' | 'right' | 'left'
  containerBleed?: Responsive
  fill?: boolean
  startIndex?: number
  reveal?: boolean
  dragSpring?: { stiffness?: number; damping?: number; mass?: number; restDelta?: number; restSpeed?: number; velocityScale?: number } | null
  touchDrag?: boolean
  mobileSnap?: 'center' | 'start'
  desktopSnap?: 'center' | 'start'
  className?: string
  ariaLabel?: string
  dotColor?: string
  activeDotColor?: string
  arrowColor?: string
}

export function Carousel(props: CarouselProps): JSX.Element

export function useDragScroll(
  ref: RefObject<HTMLElement | null>,
  options?: { centerSnap?: boolean; dragSpring?: CarouselProps['dragSpring']; touchDrag?: boolean },
): { handlers: Record<string, unknown>; dragging: boolean }
