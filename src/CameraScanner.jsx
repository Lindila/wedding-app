// src/CameraScanner.jsx
import { useEffect, useRef, useState } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "./theme";

export function CameraScanner({ onScan, onClose }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef    = useRef(null);
  const [error, setError]   = useState(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, audio: false,
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setActive(true);
        }
      } catch (e) {
        setError("Caméra inaccessible : " + (e.message || String(e)));
      }
    })();
    return () => {
      mounted = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (rafRef.current)    cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const detector = window.BarcodeDetector
      ? new window.BarcodeDetector({ formats: ["qr_code"] })
      : null;

    const tick = async () => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick); return;
      }
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      if (detector) {
        try {
          const codes = await detector.detect(canvas);
          if (codes.length > 0) { onScan(codes[0].rawValue); return; }
        } catch {}
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, onScan]);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(30,15,20,0.93)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}>
      <div style={{ background:C.white, borderRadius:24, overflow:"hidden", width:380, boxShadow:"0 24px 80px rgba(0,0,0,0.5)", border:`1px solid ${C.border}` }}>
        <div style={{ background:`linear-gradient(135deg,${C.blushLight},${C.champLight})`, padding:"18px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:FONT_DISPLAY, fontSize:13, color:C.roseDark, letterSpacing:3 }}>SCANNER CAMÉRA</div>
            <div style={{ fontFamily:FONT_BODY, fontSize:12, color:C.champDark, marginTop:2, fontStyle:"italic" }}>Pointez vers un QR code de billet</div>
          </div>
          <button onClick={onClose} style={{ background:C.rose, border:"none", color:C.white, borderRadius:"50%", width:32, height:32, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        <div style={{ position:"relative", background:"#111", aspectRatio:"1", overflow:"hidden" }}>
          <video ref={videoRef} muted playsInline style={{ width:"100%", height:"100%", objectFit:"cover", display:error?"none":"block" }} />
          <canvas ref={canvasRef} style={{ display:"none" }} />
          {!error && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
              <div style={{ width:200, height:200, position:"relative" }}>
                {[["0%","0%"],["100%","0%"],["0%","100%"],["100%","100%"]].map(([t,l],i) => (
                  <div key={i} style={{ position:"absolute", top:t, left:l, transform:`translate(${l==="0%"?0:"-100%"},${t==="0%"?0:"-100%"})`, width:40, height:40,
                    borderTop:    (t==="0%")  ? `3px solid ${C.champagne}` : "none",
                    borderBottom: (t==="100%")? `3px solid ${C.champagne}` : "none",
                    borderLeft:   (l==="0%")  ? `3px solid ${C.champagne}` : "none",
                    borderRight:  (l==="100%")? `3px solid ${C.champagne}` : "none",
                    borderRadius:4 }} />
                ))}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${C.rose},transparent)`, animation:"scan 2s linear infinite" }} />
              </div>
            </div>
          )}
          {error && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📷</div>
              <div style={{ fontFamily:FONT_BODY, fontSize:14, color:"#fff", marginBottom:8 }}>Caméra non disponible</div>
              <div style={{ fontFamily:FONT_BODY, fontSize:12, color:"#aaa" }}>{error}</div>
            </div>
          )}
        </div>

        <div style={{ padding:"12px 24px 18px", textAlign:"center" }}>
          <div style={{ fontFamily:FONT_BODY, fontSize:12, color:C.textMuted, fontStyle:"italic" }}>
            {window.BarcodeDetector ? "✅ Détection QR automatique activée" : "⚠️ Utilisez Chrome ou Android pour la détection auto"}
          </div>
        </div>
      </div>
      <style>{`@keyframes scan{0%{top:0}50%{top:calc(100% - 2px)}100%{top:0}}`}</style>
    </div>
  );
}
