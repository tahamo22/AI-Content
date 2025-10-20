"use client";
import { useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { WSMetricMessage } from "@/types/ws";

export default function InterviewRoom({ wsUrl, running, onMetrics, onFinalLanguage }: { wsUrl: string; running: boolean; onMetrics: (m: WSMetricMessage) => void; onFinalLanguage: (lang: string) => void; }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream } = useWebRTC({ attachTo: videoRef });
  const { connect, sendAudioChunk } = useWebSocket({ wsUrl, onMetrics, onFinalLanguage });

  useEffect(() => {
    if (!running || !stream) return;
    const cleanup = connect();
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 32000 });
    mr.ondataavailable = async (e) => {
      if (e.data.size === 0) return;
      const buf = await e.data.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      sendAudioChunk(b64);
    };
    mr.start(1000);
    return () => {
      try { mr.stop(); } catch {}
      cleanup?.();
    };
  }, [running, stream, connect, sendAudioChunk]);

  return (
    <div className="rounded border bg-black p-1">
      <video ref={videoRef} className="h-64 w-full rounded bg-black" autoPlay playsInline muted />
    </div>
  );
}
