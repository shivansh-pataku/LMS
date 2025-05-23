"use client";

import React, { useEffect, useRef } from "react";

// A minimal interface for the Jitsi API object parts we use.
// For a more complete solution, dedicated type definitions (.d.ts) would be better.
interface JitsiMeetExternalAPIType {
  dispose: () => void;
  addEventListener: (
    event: string,
    callback: (payload: unknown) => void
  ) => void; // Changed payload to unknown
  // Add other methods and properties you might use
  // For example, if you use executeCommand:
  // executeCommand: (command: string, ...args: any[]) => void;
}

// Augment the Window interface to include JitsiMeetExternalAPI
declare global {
  interface Window {
    // Type JitsiMeetExternalAPI as a constructor
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: {
        roomName: string;
        width?: string | number;
        height?: string | number;
        parentNode: HTMLElement;
        userInfo?: {
          displayName?: string;
          email?: string; // If you collect/use it
        };
        configOverwrite?: object; // These can be quite complex
        interfaceConfigOverwrite?: object; // These can be quite complex
        jwt?: string; // If using token authentication
        // Add other options as needed
      }
    ) => JitsiMeetExternalAPIType;
  }
}

interface JitsiMeetEmbedProps {
  roomName: string;
  displayName?: string;
  containerStyle?: React.CSSProperties;
}

const JitsiMeetEmbed: React.FC<JitsiMeetEmbedProps> = ({
  roomName,
  displayName = "Guest",
  containerStyle,
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<JitsiMeetExternalAPIType | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !jitsiContainerRef.current ||
      !roomName
    ) {
      return;
    }

    const initializeJitsi = () => {
      // Check if the Jitsi constructor is available on the window object
      if (
        jitsiContainerRef.current &&
        roomName &&
        typeof window.JitsiMeetExternalAPI === "function"
      ) {
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
          jitsiApiRef.current = null;
        }

        const domain = "meet.jit.si";
        const options = {
          roomName: roomName,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current, // This is now correctly typed as HTMLElement
          userInfo: {
            displayName: displayName,
          },
          configOverwrite: {
            // prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            // SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
          },
        };

        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      } else if (jitsiContainerRef.current && roomName) {
        console.warn(
          "JitsiMeetExternalAPI constructor not ready, retrying in 200ms"
        );
        setTimeout(initializeJitsi, 200);
      }
    };

    const scriptId = "jitsi-external-api-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        console.log("Jitsi external API script loaded.");
        initializeJitsi();
      };
      script.onerror = () => {
        console.error("Failed to load Jitsi external API script.");
      };
    } else {
      // If script tag exists, JitsiMeetExternalAPI might already be available or still loading
      initializeJitsi();
    }

    return () => {
      if (jitsiApiRef.current) {
        console.log("Disposing Jitsi API");
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, displayName]);

  const defaultContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "600px",
    border: "1px solid #ccc",
    position: "relative",
  };

  return (
    <div
      ref={jitsiContainerRef}
      style={{ ...defaultContainerStyle, ...containerStyle }}
    >
      {/* Jitsi iframe is appended here */}
    </div>
  );
};

export default JitsiMeetEmbed;
