"use client";
import { MutableRefObject, useEffect, useRef, useState } from "react";

export function useWebRTC({ attachTo }: { attachTo: MutableRefObject<HTMLVideoElement | null> }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: true });
        setStream(media);
        if (attachTo.current) attachTo.current.srcObject = media;
        // Prepare a peer connection (placeholder loopback datachannel for demo)
        const pc = new RTCPeerConnection();
        pcRef.current = pc;
        media.getTracks().forEach((t) => pc.addTrack(t, media));
        // No remote peer in this demo; WebRTC is initialized and tracks are active
      } catch (e) {
        console.error("getUserMedia failed", e);
      }
    })();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
    };
  }, []);

  return { stream, pc: pcRef.current };
}
