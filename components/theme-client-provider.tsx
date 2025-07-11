"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";

const ThemeContext = createContext<{ theme: string, setTheme: (t: string) => void }>({ theme: "light", setTheme: () => {} });

export function useThemeContext() {
  return useContext(ThemeContext);
}

export function ThemeClientProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("light");
  const pathname = usePathname();
  const isPublic = ["/login", "/register", "/planos", "/"].includes(pathname);

  useEffect(() => {
    if (!isPublic) {
      fetch("/api/user/theme", { headers: { "x-user-id": localStorage.getItem("userId") || "" } })
        .then(res => res.json())
        .then(data => {
          if (data.theme) setTheme(data.theme);
        });
    } else {
      setTheme("light");
    }
  }, [pathname]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={theme}>
        <I18nProvider>
          {children}
        </I18nProvider>
        <Toaster />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
} 