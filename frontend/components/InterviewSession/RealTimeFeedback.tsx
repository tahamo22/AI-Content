"use client";
import { useI18n } from "@/hooks/useI18n";

export default function RealTimeFeedback({ metrics, lang }: { metrics: Record<string, number>; lang: string }) {
  const { t } = useI18n();
  const level = metrics.speech_level ?? 0;
  const wpm = metrics.wpm_est ?? 0;
  const eye = metrics.eye_contact ?? 0;
  const posture = metrics.posture ?? 0;
  return (
    <div className="rounded border p-3 bg-white">
      <h3 className="font-semibold mb-2">{t("Real-Time Feedback")}</h3>
      <div className="space-y-1 text-sm">
        <div>{t("Speaking level")}: <strong>{Math.round(level * 100)}%</strong></div>
        <div>{t("Estimated WPM")}: <strong>{wpm}</strong></div>
        <div>{t("Eye contact")}: <strong>{Math.round(eye * 100)}%</strong></div>
        <div>{t("Posture")}: <strong>{Math.round(posture * 100)}%</strong></div>
      </div>
    </div>
  );
}
