"use client";
import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window { JitsiMeetExternalAPI: any; }
}

export default function JitsiSession({
  roomName,
  displayName,
  onClose,
  isTeacher = false,
}: {
  roomName: string;
  displayName: string;
  onClose?: () => void;
  isTeacher?: boolean;
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
        enableLobbyChat: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: ["microphone", "camera", "hangup", "tileview", "chat"],
      },
      userInfo: { displayName },
    });

    apiRef.current.addEventListener("readyToClose", () => onClose?.());

    if (isTeacher) {
      // When teacher joins as moderator: disable lobby so students enter directly
      apiRef.current.addEventListener("videoConferenceJoined", () => {
        try { apiRef.current?.executeCommand("toggleLobby", false); } catch (_) {}
      });
      // Auto-admit any student who is still waiting (safety net)
      apiRef.current.addEventListener("knockingParticipant", (e: any) => {
        try {
          const id = e?.participant?.id;
          if (id) apiRef.current?.executeCommand("answerKnockingParticipant", id, true);
        } catch (_) {}
      });
    }
  }, [roomName, displayName, onClose, isTeacher]);

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
