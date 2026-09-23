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
  /** Fired once the click is accepted (before the transition/navigate), never on a click the
   *  in-flight-transition guard below swallows — analytics call sites (e.g. `theme_switch`) attach
   *  here instead of a second, separately-guarded `onClick` on the anchor. */
  onClick?: () => void
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
  onClick,
}: TransitionLinkProps) {
  const navigate = useNavigate()
  const { startTransition, isTransitioning } = usePageTransition()

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    if (isTransitioning) return
    onClick?.()

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
