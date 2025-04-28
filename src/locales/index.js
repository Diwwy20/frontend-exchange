import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en/translation.json';
import th from './th/translation.json';

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            th: { translation: th },
        },
        fallbackLng: 'th',
        interpolation: {
            escapeValue: false,
            format: (value, format, lng) => {
                if(format === 'currency'){
                    return new Intl.NumberFormat(lng, {
                        style: 'currency',
                        currency: lng === 'th' ? 'THB' : 'USD',
                    }).format(value);
                }
                if(format === 'datetime'){
                    return new Intl.DateTimeFormat(lng, {
                        year: 'numeric',
                        month: 'long',
                        day: "numeric"
                    }).format(new Date(value));
                }
                return value;
            },
        },
    });

export default i18n;