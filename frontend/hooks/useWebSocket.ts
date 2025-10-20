"use client";
import { useCallback, useMemo, useRef } from "react";
import { WSMetricMessage } from "@/types/ws";

export function useWebSocket({ wsUrl, onMetrics, onFinalLanguage }: { wsUrl: string; onMetrics: (m: WSMetricMessage) => void; onFinalLanguage: (lang: string) => void; }) {
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!wsUrl) return () => {};
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => ws.send(JSON.stringify({ t: "hello" }));
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.t === "metrics") onMetrics(data as WSMetricMessage);
        if (data.t === "final_report_ready") onFinalLanguage(data.lang || "en");
      } catch {}
    };
    ws.onclose = () => { wsRef.current = null; };
    return () => ws.close();
  }, [wsUrl, onMetrics, onFinalLanguage]);

  const sendAudioChunk = useCallback((b64: string) => {
    const ws = wsRef.current; if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ t: "audio", data: b64 }));
  }, []);

  const end = useCallback(() => {
    const ws = wsRef.current; if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ t: "end" }));
  }, []);

  return { connect, sendAudioChunk, end };
}
