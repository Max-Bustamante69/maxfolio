import type { ReactNode } from 'react'

/**
 * CSS-only device mockups, sized by their container width so every card renders identically.
 * PhoneFrame ≈ iPhone 15 Pro (titanium rim, Dynamic Island, side buttons).
 * LaptopFrame ≈ MacBook Pro (thin bezel, camera, hinge base wider than the lid).
 */

interface FrameProps {
  children: ReactNode
  className?: string
}

export function PhoneFrame({ children, className = '' }: FrameProps) {
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: '430 / 880' }}>
      {/* side buttons */}
      <span className="absolute -left-[1.6%] top-[17%] h-[3.5%] w-[1.6%] rounded-l-sm bg-[#3a3a3c]" aria-hidden="true" />
      <span className="absolute -left-[1.6%] top-[24%] h-[7%] w-[1.6%] rounded-l-sm bg-[#3a3a3c]" aria-hidden="true" />
      <span className="absolute -left-[1.6%] top-[33%] h-[7%] w-[1.6%] rounded-l-sm bg-[#3a3a3c]" aria-hidden="true" />
      <span className="absolute -right-[1.6%] top-[26%] h-[11%] w-[1.6%] rounded-r-sm bg-[#3a3a3c]" aria-hidden="true" />
      {/* titanium rim */}
      <div
        className="absolute inset-0 rounded-[15.5%] bg-[#2c2c2e] shadow-[0_18px_40px_rgba(0,0,0,0.35),inset_0_0_0_1.5px_rgba(255,255,255,0.18)]"
        aria-hidden="true"
      />
      {/* black bezel */}
      <div className="absolute inset-[1.6%] rounded-[14%] bg-black" aria-hidden="true" />
      {/* screen */}
      <div className="absolute inset-[3.4%] overflow-hidden rounded-[12%] bg-white">{children}</div>
      {/* Dynamic Island */}
      <div
        className="absolute left-1/2 top-[5.2%] z-10 h-[3.3%] w-[26%] -translate-x-1/2 rounded-full bg-black"
        aria-hidden="true"
      />
    </div>
  )
}

export function LaptopFrame({ children, className = '' }: FrameProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* lid */}
      <div className="relative mx-[7%] rounded-t-[2.4%] rounded-b-[0.8%] bg-[#161617] p-[1.4%] pt-[2.2%] shadow-[0_18px_40px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        <span className="absolute left-1/2 top-[0.9%] h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-[#3a3a3c] ring-1 ring-black/60" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-[0.6%] bg-white" style={{ aspectRatio: '16 / 10' }}>
          {children}
        </div>
      </div>
      {/* base with hinge notch */}
      <div className="relative h-[0.85rem] w-full rounded-b-[0.6rem] bg-gradient-to-b from-[#d6d6db] via-[#c2c2c7] to-[#a3a3a8] shadow-[0_6px_14px_rgba(0,0,0,0.18)]">
        <span className="absolute left-1/2 top-0 h-[0.28rem] w-[14%] -translate-x-1/2 rounded-b-[0.3rem] bg-[#8e8e93]" aria-hidden="true" />
      </div>
    </div>
  )
}
