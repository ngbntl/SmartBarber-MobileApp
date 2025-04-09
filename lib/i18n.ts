import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../translations/en.json";
import vi from "../translations/vi.json";
import ja from "../translations/ja.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      vi: {
        translation: vi,
      },
      ja: {
        translation: ja,
      },
    },
    lng: "vi",
    fallbackLng: "vi",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    supportedLngs: ["vi", "en", "ja"],
  });

export default i18n;
