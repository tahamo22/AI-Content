"use client";
import { useEffect, useMemo, useState } from "react";
import InterviewRoom from "@/components/InterviewSession/InterviewRoom";
import RealTimeFeedback from "@/components/InterviewSession/RealTimeFeedback";
import SessionControls from "@/components/InterviewSession/SessionControls";
import { createSession } from "@/lib/api";
import { useI18n } from "@/hooks/useI18n";
import { WSMetricMessage } from "@/types/ws";

export default function InterviewSession({ backendUrl }: { backendUrl: string }) {
  const { t, lang, setLang } = useI18n();
  const [sessionId, setSessionId] = useState<string>("");
  const [wsUrl, setWsUrl] = useState<string>("");
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [question, setQuestion] = useState<string>("");
  const [running, setRunning] = useState<boolean>(false);

  const handleMetrics = (m: WSMetricMessage) => {
    setMetrics((prev) => ({ ...prev, ...m }));
  };

  const start = async () => {
    const created = await createSession(backendUrl);
    setSessionId(created.sessionId);
    const fullWs = created.wsUrl.startsWith("ws") ? created.wsUrl : backendUrl.replace("http", "ws") + created.wsUrl;
    setWsUrl(fullWs);
    setRunning(true);
  };

  const stop = async () => {
    setRunning(false);
  };

  const fetchQuestion = async () => {
    const res = await fetch(`${backendUrl}/sessions/${sessionId}/next-question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: "", lang }),
    });
    const data = await res.json();
    setQuestion(data.question || "");
  };

  useEffect(() => {
    if (sessionId) fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, lang]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-3">
        <h2 className="text-xl font-semibold">{t("Interview Session")}</h2>
        <InterviewRoom wsUrl={wsUrl} running={running} onMetrics={handleMetrics} onFinalLanguage={(detected) => setLang(detected)} />
        <SessionControls running={running} onStart={start} onStop={stop} lang={lang} setLang={setLang} question={question} onNextQuestion={fetchQuestion} />
      </div>
      <div className="space-y-3">
        <RealTimeFeedback metrics={metrics} lang={lang} />
      </div>
    </div>
  );
}
