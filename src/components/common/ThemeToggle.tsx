import { useTheme } from '../../context/ThemeContext'

interface ThemeToggleProps {
  variant?: 'default' | 'luxury' | 'brutalist'
  size?: 'sm' | 'md'
}

export function ThemeToggle({ variant = 'default', size = 'md' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme()
  
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  
  const variantClasses = {
    default: isDark 
      ? 'bg-white/10 hover:bg-white/20 text-white' 
      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700',
    luxury: isDark
      ? 'bg-deco-gold/10 hover:bg-deco-gold/20 text-deco-gold border border-deco-gold/30'
      : 'bg-luxury-gold/10 hover:bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30',
    brutalist: isDark
      ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-2 border-stone-600'
      : 'bg-stone-200 hover:bg-stone-300 text-stone-700 border-2 border-stone-400',
  }
  
  return (
    <button
      onClick={toggleTheme}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-colors ${variantClasses[variant]}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  )
}
