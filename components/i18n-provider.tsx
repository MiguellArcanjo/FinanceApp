"use client";
import { ReactNode, useEffect } from "react";
import i18n from "i18next";
import { I18nextProvider } from "react-i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "pt-BR": {
    translation: require("../public/locales/pt-BR/translation.json"),
  },
  "en-US": {
    translation: require("../public/locales/en-US/translation.json"),
  },
  "es-ES": {
    translation: require("../public/locales/es-ES/translation.json"),
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: "pt-BR",
      fallbackLng: "pt-BR",
      interpolation: { escapeValue: false },
    });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const appSettings = localStorage.getItem("appSettings");
    if (appSettings) {
      const { display } = JSON.parse(appSettings);
      if (display?.language && i18n.language !== display.language) {
        i18n.changeLanguage(display.language);
      }
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
} 