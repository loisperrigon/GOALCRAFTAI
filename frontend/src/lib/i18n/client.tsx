'use client'

import { createContext, useContext } from 'react'
import type { Locale } from './config'

type Dictionary = {
  [key: string]: any
}

type I18nContextType = {
  locale: Locale
  dictionary: Dictionary
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({
  children,
  locale,
  dictionary,
}: {
  children: React.ReactNode
  locale: Locale
  dictionary: Dictionary
}) {
  return (
    <I18nContext.Provider value={{ locale, dictionary }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslations(namespace?: string) {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslations must be used within an I18nProvider')
  }

  const { dictionary } = context

  if (namespace) {
    return dictionary[namespace] || {}
  }

  return dictionary
}

export function useLocale() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useLocale must be used within an I18nProvider')
  }

  return context.locale
}