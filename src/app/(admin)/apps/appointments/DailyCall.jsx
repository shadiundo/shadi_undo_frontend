// DailyCall.jsx
import React, {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect
} from "react";
import logo from "@/assets/images/shaadi-logo 3.png";

const DailyCall = forwardRef(
  (
    {
      roomName,
      token,
      user = { name: "User" },
      height = "500px",
      logoUrl,
      headerText,
      autoJoin = false,
      onJoined,
      onLeft,
      onCallEnd,
      onConferenceFailed,
      onParticipantsUpdate,
      onBothJoined
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const dailyRef = useRef(null);
    const joinedRoomRef = useRef(null);

    const [callState, setCallState] = useState("idle");
    const [error, setError] = useState(null);
    const [bothJoined, setBothJoined] = useState(false);
    const [showInterface, setShowInterface] = useState(false);

    const loadDaily = async () => {
      if (window.__DAILY_JS__) return window.__DAILY_JS__;
      const mod = await import("@daily-co/daily-js");
      window.__DAILY_JS__ = mod.default;
      return mod.default;
    };

    const destroyExistingFrame = async () => {
      const activeFrame = dailyRef.current || window.__DAILY_IFRAME__;
      if (activeFrame) {
        try {
          await activeFrame.leave();
        } catch { }

        try {
          activeFrame.destroy();
        } catch { }

        dailyRef.current = null;
        window.__DAILY_IFRAME__ = null;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      document.querySelectorAll("iframe").forEach((i) => {
        if (i.src?.includes("daily.co")) i.remove();
      });
    };

    const cleanup = async () => {
      await destroyExistingFrame();
      joinedRoomRef.current = null;
      setCallState("idle");
      setShowInterface(false);
      setBothJoined(false);
      setError(null);
    };

    useEffect(() => {
      return () => {
        cleanup();
      };
    }, []);

    const joinRoom = useCallback(async () => {
      if (!roomName || !token) {
        setError("Missing roomName or token");
        return;
      }

      // If already connected to THIS room and token, don't re-create frame
      if (dailyRef.current && joinedRoomRef.current === `${roomName}_${token}`) {
        return;
      }

      joinedRoomRef.current = `${roomName}_${token}`;
      setCallState("joining");
      setShowInterface(true);

      try {
        const Daily = await loadDaily();
        const dailyDomain = import.meta.env.VITE_DAILY_DOMAIN || "shaadiundo.daily.co";
        const url = `https://${dailyDomain}/${roomName}?enable_emoji_reactions=false&enable_hand_raising=false&enable_reactions_ui=false&enable_hand_raising_ui=false`;

        // Ensure containerRef is attached to the DOM
        let retries = 0;
        while (!containerRef.current && retries < 15) {
          await new Promise((r) => setTimeout(r, 50));
          retries++;
        }

        if (!containerRef.current) {
          throw new Error("Video container element not found");
        }

        await destroyExistingFrame();

        const frame = Daily.createFrame(containerRef.current, {
          iframeStyle: {
            width: "100%",
            height: "100%",
            minHeight: "450px",
            border: "0",
            borderRadius: "10px",
            position: "absolute",
            top: 0,
            left: 0
          },
          showLeaveButton: false,
          showFullscreenButton: true,
          activeSpeakerMode: false,
          dailyConfig: {
            experimentalChromeVideoMuteLightOff: true
          }
        });

        dailyRef.current = frame;
        window.__DAILY_IFRAME__ = frame;

        frame.on("joined-meeting", () => {
          setCallState("joined");
          if (onJoined) onJoined();
          try {
            const p = frame.participants() || {};
            const count = Object.keys(p).length;
            if (count >= 2) {
              setBothJoined(true);
              if (onBothJoined) onBothJoined();
              if (onParticipantsUpdate) onParticipantsUpdate(count, p);
            }
          } catch { }
        });

        frame.on("participant-joined", () => {
          setBothJoined(true);
          if (onBothJoined) onBothJoined();
          if (onParticipantsUpdate) {
            try {
              const count = Object.keys(frame.participants() || {}).length;
              onParticipantsUpdate(count, frame.participants());
            } catch { }
          }
        });

        frame.on("participant-left", () => {
          setBothJoined(false);
          if (onParticipantsUpdate) {
            try {
              const count = Object.keys(frame.participants() || {}).length;
              onParticipantsUpdate(count, frame.participants());
            } catch { }
          }
        });

        frame.on("left-meeting", async () => {
          joinedRoomRef.current = null;
          if (onLeft) onLeft();
          if (onCallEnd) onCallEnd();
          setCallState("left");
          await cleanup();
        });

        frame.on("error", (e) => {
          console.error("Daily frame error:", e);
          if (onConferenceFailed) onConferenceFailed(e);
        });

        await frame.join({ url, token, userName: user?.name || "Participant" });
      } catch (err) {
        console.error("Daily joinRoom error:", err);
        setError(err.message || "Failed to join video call");
        setCallState("error");
        joinedRoomRef.current = null;
        if (onConferenceFailed) onConferenceFailed(err);
      }
    }, [roomName, token, user?.name, onJoined, onLeft, onCallEnd, onConferenceFailed, onBothJoined, onParticipantsUpdate]);

    useImperativeHandle(ref, () => ({
      leave: cleanup,
      isJoined: () => callState === "joined"
    }));

    useEffect(() => {
      if (autoJoin && roomName && token) {
        if (!dailyRef.current && joinedRoomRef.current !== `${roomName}_${token}`) {
          const timer = setTimeout(() => {
            joinRoom();
          }, 200);
          return () => clearTimeout(timer);
        }
      }
    }, [autoJoin, roomName, token, joinRoom]);

    const resolvedHeight = height && height !== "100%" ? height : "500px";

    return (
      <div
        style={{
          width: "100%",
          height: height || "500px",
          minHeight: "450px",
          position: "relative",
          background: "#111827",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {headerText && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 25,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ffffff",
              opacity: 0.85,
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              pointerEvents: "none",
            }}
          >
            {headerText}
          </div>
        )}

        {logoUrl && (
          <img
            src={logoUrl}
            alt="logo"
            style={{
              position: "absolute",
              top: 12,
              left: 16,
              width: 50,
              zIndex: 25
            }}
          />
        )}

        {callState === "joining" && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 20,
              color: "#ffffff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              pointerEvents: "none"
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid rgba(255,255,255,0.25)",
                borderTopColor: "#CAAA93",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", color: "#E5E7EB" }}>
              Connecting to secure video call...
            </span>
          </div>
        )}

        {!showInterface && callState === "idle" && (
          <div
            style={{
              width: "100%",
              height: "100%",
              minHeight: "450px",
              background: "linear-gradient(135deg, #134e4a, #7f1d1d)",
              boxShadow: "inset 0 0 120px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              textAlign: "center",
              padding: 24,
              flex: 1
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <img
                src={logo}
                alt="ShaadiUndo logo"
                style={{
                  width: "clamp(90px, 18vw, 150px)",
                  height: "auto",
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
                }}
              />
            </div>

            <h2 style={{ marginBottom: 8, color: "#ffffff", fontSize: "22px", fontWeight: 700 }}>Ready to join?</h2>
            <p style={{ opacity: 0.75, marginBottom: 24, fontSize: "14px" }}>{roomName}</p>

            <button
              onClick={joinRoom}
              style={{
                padding: "12px 36px",
                fontSize: 16,
                fontWeight: 700,
                background: "#ffffff",
                color: "#7f1d1d",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
              }}
            >
              Join Call
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#ffeded",
              color: "#c53030",
              padding: 12,
              margin: 12,
              borderRadius: 8,
              zIndex: 30
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Video Frame Container - Always in DOM with explicit minHeight & flex */}
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            minHeight: "450px",
            flex: 1,
            background: "#111827",
            borderRadius: 10,
            overflow: "hidden",
            position: "relative",
            display: (callState === "joining" || callState === "joined" || showInterface) ? "block" : "none"
          }}
        />
      </div>
    );
  }
);

DailyCall.displayName = "DailyCall";
export default DailyCall;
