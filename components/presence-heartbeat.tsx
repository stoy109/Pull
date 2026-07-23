"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

export function PresenceHeartbeat() {
  useEffect(() => {
    let stopped = false;

    async function sendHeartbeat() {
      if (stopped || document.visibilityState === "hidden") {
        return;
      }

      try {
        await fetch("/api/presence", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          keepalive: true,
        });
      } catch {
        // Presence is best-effort and must never interrupt the active screen.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void sendHeartbeat();
      }
    }

    void sendHeartbeat();
    const intervalId = window.setInterval(() => void sendHeartbeat(), HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}

