import type { Locale } from '../context/LanguageContext'
import type { PortfolioContent } from './types'
import { en } from './en'
import { es } from './es'
import { ja } from './ja'

export const CONTENT: Record<Locale, PortfolioContent> = { en, es, ja }
export type { PortfolioContent }
