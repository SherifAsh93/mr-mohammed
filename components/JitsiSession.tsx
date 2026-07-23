"use client";
import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window { JitsiMeetExternalAPI: any; }
}

export default function JitsiSession({
  roomName,
  displayName,
  onClose,
}: {
  roomName: string;
  displayName: string;
  onClose?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  const init = useCallback(() => {
    if (!containerRef.current || apiRef.current) return;
    apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      configOverwrite: {
        prejoinPageEnabled: false,
        disableInviteFunctions: true,
        disableDeepLinking: true,
        startWithVideoMuted: false,
        startWithAudioMuted: false,
        enableWelcomePage: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: ["microphone", "camera", "hangup", "tileview", "chat"],
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
      },
      userInfo: { displayName },
    });
    apiRef.current.addEventListener("readyToClose", () => onClose?.());
  }, [roomName, displayName, onClose]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cleanup = () => {
      if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
    };
    if (window.JitsiMeetExternalAPI) { init(); return cleanup; }
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
    return () => { cleanup(); if (document.head.contains(script)) script.remove(); };
  }, [init]);

  return <div ref={containerRef} className="w-full h-full" />;
}
