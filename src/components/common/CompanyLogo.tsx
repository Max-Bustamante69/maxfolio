import { useState } from 'react'

interface CompanyLogoProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
}

export function CompanyLogo({ 
  src, 
  alt, 
  className = "w-full h-full object-contain",
  fallbackClassName = "w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 text-xs font-medium"
}: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return (
      <div className={fallbackClassName}>
        {alt.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setHasError(true)}
    />
  )
}
