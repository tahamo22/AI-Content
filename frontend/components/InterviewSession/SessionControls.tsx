"use client";
import { useI18n } from "@/hooks/useI18n";

export default function SessionControls({ running, onStart, onStop, lang, setLang, question, onNextQuestion }: {
  running: boolean;
  onStart: () => void;
  onStop: () => void;
  lang: string;
  setLang: (l: string) => void;
  question: string;
  onNextQuestion: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded border p-3 bg-white space-y-3">
      <div className="flex items-center gap-2">
        {!running ? (
          <button onClick={onStart} className="rounded bg-green-600 px-3 py-2 text-white">{t("Start Session")}</button>
        ) : (
          <button onClick={onStop} className="rounded bg-red-600 px-3 py-2 text-white">{t("Stop Session")}</button>
        )}
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="border rounded px-2 py-1">
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
        <button onClick={onNextQuestion} disabled={!question && !running} className="rounded bg-blue-600 px-3 py-2 text-white">{t("Next Question")}</button>
      </div>
      {question ? (
        <div>
          <div className="text-sm text-gray-500">{t("Current Question")}:</div>
          <div className="text-lg">{question}</div>
        </div>
      ) : null}
    </div>
  );
}
