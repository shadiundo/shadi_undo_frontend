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
      height = "72vh",
      logoUrl,
      headerText,
      autoJoin = false,
      onJoined,
      onLeft
    }
    ,
    ref
  ) => {
    const componentId = useRef(Date.now()).current;
    const containerRef = useRef(null);
    const dailyRef = useRef(null);

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

    const cleanup = async () => {
      if (dailyRef.current) {
        try {
          await dailyRef.current.leave();
        } catch { }

        try {
          dailyRef.current.destroy();
        } catch { }

        dailyRef.current = null;
        window.__DAILY_IFRAME__ = null;
      }

      document.querySelectorAll("iframe").forEach((i) => {
        if (i.src?.includes("daily.co")) i.remove();
      });

      setCallState("idle");
      setBothJoined(false);
      setError(null);
    };

    const joinRoom = useCallback(async () => {
      if (!roomName || !token) {
        setError("Missing roomName or token");
        return;
      }

      setCallState("joining");
      setShowInterface(true);

      const Daily = await loadDaily();
      const url = `https://shaadiundo.daily.co/${roomName}?enable_emoji_reactions=false&enable_hand_raising=false&enable_reactions_ui=false&enable_hand_raising_ui=false`;

      // Prevent duplication 
      if (window.__DAILY_IFRAME__) {
        dailyRef.current = window.__DAILY_IFRAME__;
        try {
          await dailyRef.current.join({ url, token, userName: user.name });
          setCallState("joined");
          return;
        } catch {
          await cleanup();
        }
      }

      await cleanup();

      const frame = Daily.createFrame(containerRef.current, {
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "0",
          borderRadius: "8px",
          position: "absolute",
          top: 0,
          left: 0
        },
        showLeaveButton: true,
        showFullscreenButton: true,
        activeSpeakerMode: false, // 👈 Force Grid View
        dailyConfig: {
          experimentalChromeVideoMuteLightOff: true
        }
      });

      dailyRef.current = frame;
      window.__DAILY_IFRAME__ = frame;

      frame.on("joined-meeting", () => {
        setCallState("joined");
        if (onJoined) onJoined();
      });

      frame.on("participant-joined", () => setBothJoined(true));
      frame.on("participant-left", () => setBothJoined(false));
      frame.on("left-meeting", async () => {
        if (onLeft) onLeft();
        setCallState("left");
        await cleanup();
      });

      try {
        await frame.join({ url, token, userName: user.name });
      } catch (err) {
        setError(err.message);
        setCallState("error");
      }
    }, [roomName, token, user.name]);

    useImperativeHandle(ref, () => ({
      leave: cleanup,
      isJoined: () => callState === "joined"
    }));

    useEffect(() => {
      if (autoJoin && roomName && token) {
        setTimeout(() => joinRoom(), 600);
      }
    }, []);

    return (
      <div style={{ width: "100%", position: "relative" }}>
        {headerText ? (
          <div
            style={{
              position: "absolute",
              top: 9,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ffffff",
              opacity: 0.75,
              pointerEvents: "none",
            }}
          >
            {headerText}
          </div>
        ) : (
          logoUrl && (
            <img
              src={logoUrl}
              alt="logo"
              style={{
                position: "absolute",
                top: 50,
                left: 16,
                width: 60,
                zIndex: 10
              }}
            />
          )
        )}

        {!showInterface && callState === "idle" && (
          <div
            style={{
              width: "100%",
              height,
              background: "linear-gradient(135deg, #0f766e, #dc2626)",

              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}
          >
            <div
              style={{
                width: "100%",
                height,
                background: "linear-gradient(135deg, #134e4a, #7f1d1d)",
                boxShadow: "inset 0 0 120px rgba(0,0,0,0.25)",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                textAlign: "center",
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <img
                  src={logo}
                  alt="ShaadiUndo logo"
                  style={{
                    width: "clamp(90px, 18vw, 160px)",
                    height: "auto",
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
                  }}
                />
              </div>

              <h2 style={{ marginBottom: 8, color: "#ffffff" }}>Ready to join?</h2>
              <p style={{ opacity: 0.75, marginBottom: 24 }}>{roomName}</p>

              <button
                onClick={joinRoom}
                style={{
                  padding: "14px 40px",
                  fontSize: 18,
                  fontWeight: 700,
                  background: "white",
                  color: "#7f1d1d",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Join Call
              </button>
            </div>

            {/* <h2 style={{ marginTop: 20 }}>Ready to join?</h2>
            <p style={{ opacity: 0.7, marginBottom: 20 }}>{roomName}</p>

            <button
              onClick={joinRoom}
              style={{
                padding: "14px 40px",
                fontSize: 18,
                fontWeight: 700,
                background: "white",
                color: "#667eea",
                borderRadius: 10,
                cursor: "pointer"
              }}
            >
              Join Call
            </button> */}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#ffeded",
              color: "#c53030",
              padding: 12,
              marginTop: 10,
              borderRadius: 8
            }}
          >
            ⚠ {error}
          </div>
        )}

        {(callState === "joining" ||
          callState === "joined" ||
          showInterface) && (
            <div
              ref={containerRef}
              style={{
                width: "100%",
                height,
                background: "#111",
                borderRadius: 10,
                overflow: "hidden",
                marginTop: 10
              }}
            />
          )}


      </div>
    );
  }
);

DailyCall.displayName = "DailyCall";
export default DailyCall;
