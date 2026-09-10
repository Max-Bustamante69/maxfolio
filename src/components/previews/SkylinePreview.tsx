import { m } from 'framer-motion'

interface SkylinePreviewProps {
  isHovered?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// A tiny honest echo of the real hero: a handful of bars on a hairline baseline, tallest in the
// reserved cyan — the same shape as the fleet bar chart, not an invented skyline silhouette.
const BAR_HEIGHTS = [7, 12, 9, 18, 14]

/** Menu-card preview: a miniature bar readout on deep navy, ticking up on hover. */
export function SkylinePreview({ isHovered = false, size = 'md' }: SkylinePreviewProps) {
  const scale = size === 'sm' ? 0.85 : size === 'lg' ? 1.15 : 1
  const peak = BAR_HEIGHTS.indexOf(Math.max(...BAR_HEIGHTS))
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center" style={{ background: '#0d1420' }}>
      <div className="text-center" style={{ transform: `scale(${scale})` }}>
        <div className="flex items-end justify-center gap-[3px] h-10" aria-hidden="true">
          {BAR_HEIGHTS.map((h, i) => (
            <m.span
              key={i}
              className="w-[5px] rounded-[1px]"
              style={{ background: i === peak ? '#4fd1ff' : '#3c4a68' }}
              animate={{ height: isHovered ? h * 1.35 : h }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            />
          ))}
        </div>
        <p className="mt-2 text-[9px] font-mono uppercase tracking-[0.25em]" style={{ color: '#8d9bb0' }}>
          Skyline
        </p>
      </div>
    </div>
  )
}
