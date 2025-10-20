"use client";
import { create } from "zustand";

const dict: Record<string, { en: string; ar: string }> = {
  "Interview Session": { en: "Interview Session", ar: "جلسة المقابلة" },
  "Real-Time Feedback": { en: "Real-Time Feedback", ar: "ملاحظات فورية" },
  "Speaking level": { en: "Speaking level", ar: "مستوى الحديث" },
  "Estimated WPM": { en: "Estimated WPM", ar: "عدد الكلمات في الدقيقة (تقديري)" },
  "Eye contact": { en: "Eye contact", ar: "التواصل البصري" },
  "Posture": { en: "Posture", ar: "الوضعية" },
  "Start Session": { en: "Start Session", ar: "ابدأ الجلسة" },
  "Stop Session": { en: "Stop Session", ar: "أوقف الجلسة" },
  "Next Question": { en: "Next Question", ar: "السؤال التالي" },
  "Current Question": { en: "Current Question", ar: "السؤال الحالي" },
};

interface I18nState {
  lang: string;
  setLang: (l: string) => void;
}

const useStore = create<I18nState>((set) => ({ lang: "en", setLang: (l) => set({ lang: l }) }));

export function useI18n() {
  const { lang, setLang } = useStore();
  function t(key: string) {
    const entry = dict[key];
    if (!entry) return key;
    return lang === "ar" ? entry.ar : entry.en;
    }
  return { t, lang, setLang };
}
