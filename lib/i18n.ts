import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "../translations/en.json";
import vi from "../translations/vi.json";
import ja from "../translations/ja.json";

// Safely get device language with fallback
const deviceLanguage = Localization.locale
  ? Localization.locale.split("-")[0]
  : "vi";

const supportedLanguages = ["vi", "en", "ja"];
const defaultLanguage = supportedLanguages.includes(deviceLanguage)
  ? deviceLanguage
  : "vi";

const resources = {
  en: { translation: en },
  vi: { translation: vi },
  ja: { translation: ja },
};
i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: "vi",
  debug: process.env.NODE_ENV === "development",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  supportedLngs: supportedLanguages,
  saveMissing: false,
  missingKeyHandler: () => {},
});

// Mark as initialized to help with debugging
i18n.isInitialized = true;

export default i18n;
