import type { JSX } from 'react'

export interface CarouselDotPaginationProps {
  count: number
  activeIndex?: number
  onSelect?: (index: number) => void
  maxVisible?: number
  activeWidth?: number
  activeHeight?: number
  dotSize?: number
  activeColor?: string
  color?: string
  className?: string
  gap?: number
  ariaLabel?: string
}

export function CarouselDotPagination(props: CarouselDotPaginationProps): JSX.Element | null
export function getCarouselDotWindow(activeIndex: number, count: number, maxVisible?: number): { index: number; opacity: number; blur: boolean }[]
