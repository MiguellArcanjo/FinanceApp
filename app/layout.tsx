import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/components/i18n-provider"
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Organnize',
  description: 'Gerencie suas finanças',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
