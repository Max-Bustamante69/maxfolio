import type { CSSProperties, JSX } from 'react'

export interface CarouselArrowButtonProps {
  dir: number
  disabled?: boolean
  onClick?: () => void
  label?: string
  color?: string
  icon?: 'caret' | 'arrow' | 'chevron'
  iconWidth?: number
  size?: number
  className?: string
  style?: CSSProperties
}

export function CarouselArrowButton(props: CarouselArrowButtonProps): JSX.Element
export function CarouselCaretIcon(props: { width?: number; className?: string }): JSX.Element
