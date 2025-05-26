import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { t, i18n, ready } = useTranslation();

  const changeLanguage = (lng: string) => {
    try {
      i18n.changeLanguage(lng);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  const currentLanguage = i18n.language || "vi";

  return {
    t: (key: string) => {
      if (!ready) return key;
      return t(key);
    },
    changeLanguage,
    currentLanguage,
    locale: currentLanguage,
    isReady: ready,
  };
};

export default useLanguage;
