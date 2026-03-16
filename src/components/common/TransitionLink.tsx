import { ReactNode, MouseEvent, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTransition } from '../transitions'

interface TransitionLinkProps {
  to: string
  children: ReactNode
  className?: string
  style?: CSSProperties
  transitionColor?: string
  transitionAccent?: string
  transitionLabel?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function TransitionLink({
  to,
  children,
  className = '',
  style,
  transitionColor = '#1a1a1a',
  transitionAccent = '#C9A962',
  transitionLabel = 'Loading',
  onMouseEnter,
  onMouseLeave,
}: TransitionLinkProps) {
  const navigate = useNavigate()
  const { startTransition, isTransitioning } = usePageTransition()

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    if (isTransitioning) return
    
    startTransition(
      {
        color: transitionColor,
        accentColor: transitionAccent,
        label: transitionLabel,
      },
      () => navigate(to)
    )
  }

  return (
    <a
      href={to}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      style={style}
    >
      {children}
    </a>
  )
}
