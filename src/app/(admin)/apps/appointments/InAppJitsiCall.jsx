// components/InAppJitsiCall.jsx
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

const InAppJitsiCall = forwardRef(function InAppJitsiCall(
  {
    roomName,
    jwt = null,
    // host domain, e.g. "8x8.vc" or "meet.jit.si"
    jitsiDomain = "meet.jit.si",
    // optionally pass the full external api url returned by server (preferred for 8x8)
    externalApiUrl = null,
    // optionally pass appId so we can construct externalApiUrl if server didn't
    appId = null,
    mode = "video",
    user = {},
    onCallEnd,
    parentStyle = {},
    height = null,
    logoUrl = null,
    overlaySize = 95,
    overlayOffset = { top: 8, left: 10 },
    onParticipantsUpdate,
    onBothJoined,
    onConferenceFailed,
  },
  ref
) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const bothJoinedFiredRef = useRef(false);
  const participantPollRef = useRef(null);
  const mountedRef = useRef(true);

  useImperativeHandle(ref, () => ({
    hangup: async () => {
      if (!apiRef.current) return;
      try { apiRef.current.executeCommand("hangup"); } catch {}
      try { apiRef.current.dispose(); } catch {}
      apiRef.current = null;
    },
    getApi: () => apiRef.current,
  }), []);

  const normalizeHost = (d) => {
    if (!d) return d;
    try {
      if (d.startsWith("http://") || d.startsWith("https://")) {
        const u = new URL(d);
        return u.host;
      }
      return d.split("/")[0];
    } catch (e) {
      return d.split("/")[0];
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    if (!roomName || typeof window === "undefined") return () => (mountedRef.current = false);
    let didCancel = false;

    const jitsiHost = normalizeHost(jitsiDomain || "meet.jit.si");

    // decide script URL
    let scriptUrl = externalApiUrl;
    if (!scriptUrl) {
      if (appId) {
        scriptUrl = `https://${jitsiHost}/${appId}/external_api.js`;
      } else {
        scriptUrl = `https://${jitsiHost}/external_api.js`;
      }
    }

    const apiHostForCtor = scriptUrl.replace(/\/external_api\.js$/, ""); // e.g. https://8x8.vc/{appId} or https://meet.jit.si

    const loadScript = () =>
      new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) return resolve(window.JitsiMeetExternalAPI);
        const existing = Array.from(document.getElementsByTagName("script")).find((s) => s.src && s.src.includes("/external_api.js") && s.src === scriptUrl);
        if (existing) {
          existing.onload = () => resolve(window.JitsiMeetExternalAPI);
          existing.onerror = () => reject(new Error("Failed to load existing Jitsi script"));
          return;
        }
        const s = document.createElement("script");
        s.src = scriptUrl;
        s.async = true;
        s.onload = () => resolve(window.JitsiMeetExternalAPI);
        s.onerror = () => reject(new Error(`Failed to load Jitsi script from ${scriptUrl}`));
        document.body.appendChild(s);
      });

    (async () => {
      try {
        const Jitsi = await loadScript();
        if (didCancel || !mountedRef.current || !Jitsi) return;

        if (apiRef.current) {
          try { apiRef.current.dispose(); } catch {}
          apiRef.current = null;
        }

        const parentNode = containerRef.current;
        if (!parentNode) return;

        const interfaceConfigOverwrite = {
          APP_NAME: "Shaadi Undo",
          SHOW_BRAND_WATERMARK: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_POWERED_BY: false,
          JITSI_WATERMARK_LINK: "",
          TOOLBAR_BUTTONS: [
            "microphone","camera","closedcaptions","desktop",
            "fullscreen","fodeviceselection","hangup","profile","chat","recording"
          ],
        };

        const configOverwrite = {
          disableDeepLinking: true,
          startWithAudioMuted: false,
          startWithVideoMuted: mode === "audio",
          prejoinPageEnabled: false,
        };

        const options = {
          roomName,
          parentNode,
          width: "100%",
          height: "100%",
          configOverwrite,
          interfaceConfigOverwrite,
          userInfo: { displayName: user.name || "Participant" },
        };

        if (jwt) options.jwt = jwt;

        console.log("DEBUG: Jitsi options (host, hasJwt, scriptUrl):", { apiHostForCtor, hasJwt: Boolean(jwt), scriptUrl, roomName });

        try {
          apiRef.current = new window.JitsiMeetExternalAPI(apiHostForCtor, options);
        } catch (e) {
          if (onConferenceFailed) onConferenceFailed(e);
          return;
        }

        try { apiRef.current.executeCommand("displayName", user.name || "Participant"); } catch {}

        const pollParticipants = () => {
          if (participantPollRef.current) clearTimeout(participantPollRef.current);
          participantPollRef.current = setTimeout(() => {
            if (!apiRef.current) return;
            let participants = [];
            try { participants = apiRef.current.getParticipantsInfo() || []; } catch {}
            let count = (participants && participants.length) ? participants.length + 1 : 1;
            if (Array.isArray(participants) && participants.some((p) => p.local)) {
              count = participants.length;
            }
            if (onParticipantsUpdate) onParticipantsUpdate(count, participants);
            if (!bothJoinedFiredRef.current && count >= 2) {
              bothJoinedFiredRef.current = true;
              if (onBothJoined) onBothJoined();
            }
            if (bothJoinedFiredRef.current && count < 2) bothJoinedFiredRef.current = false;
          }, 200);
        };

        const handleConferenceFailed = (err) => { if (onConferenceFailed) onConferenceFailed(err); };

        apiRef.current.addEventListener("videoConferenceJoined", pollParticipants);
        apiRef.current.addEventListener("participantJoined", pollParticipants);
        apiRef.current.addEventListener("participantLeft", pollParticipants);
        apiRef.current.addEventListener("readyToClose", () => onCallEnd && onCallEnd());
        apiRef.current.addEventListener("conferenceFailed", handleConferenceFailed);
        apiRef.current.addEventListener("videoConferenceFailed", handleConferenceFailed);

        pollParticipants();
      } catch (err) {
        if (onConferenceFailed) onConferenceFailed(err);
      }
    })();

    return () => {
      didCancel = true;
      mountedRef.current = false;
      if (participantPollRef.current) clearTimeout(participantPollRef.current);
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch {}
        apiRef.current = null;
      }
    };
  }, [roomName, jwt, jitsiDomain, externalApiUrl, appId, mode, user?.name, onCallEnd, onParticipantsUpdate, onBothJoined, onConferenceFailed]);

  const preferredHeight = height || parentStyle?.height || "72vh";

  const wrapperStyle = {
    width: "100%",
    height: preferredHeight,
    borderRadius: 8,
    overflow: "hidden",
    background: "#000",
    position: "relative",
    ...parentStyle,
  };

  const overlayBoxStyle = {
    position: "absolute",
    top: overlayOffset.top,
    left: overlayOffset.left,
    width: overlaySize,
    height: overlaySize,
    zIndex: 9999,
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    borderRadius: 10,
    padding: 6,
    boxShadow: "0 6px 18px rgba(0,0,0,0.28)",
    transform: "translateZ(0)",
  };

  const logoImgStyle = { maxWidth: "100%", maxHeight: "100%", display: "block", objectFit: "contain" };
  const textFallbackStyle = { background: "#fff", color: "#222", padding: "6px 10px", borderRadius: 6, fontWeight: 700 };

  return (
    <div style={wrapperStyle}>
      <div style={overlayBoxStyle}>
        {logoUrl ? <img src={logoUrl} alt="logo" style={logoImgStyle} /> : <div style={textFallbackStyle}>Shaadi Undo</div>}
      </div>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
});

export default InAppJitsiCall;
