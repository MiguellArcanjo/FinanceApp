'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, theme }: { children: React.ReactNode, theme?: string }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme={theme || "light"} enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
