// src/TabScanner.jsx
import { useState, useCallback } from "react";
import { C, FONT_DISPLAY, FONT_BODY, FONT_TEXT, CAT_COLORS } from "./theme";
import { CameraScanner } from "./CameraScanner";

export function TabScanner({ guests, tables, scans, recordScan, isScanAlreadyDone }) {
  const [scanInput,   setScanInput]   = useState("");
  const [scanResult,  setScanResult]  = useState(null);
  const [showCamera,  setShowCamera]  = useState(false);

  const processCode = useCallback(async (raw) => {
    const code  = (raw || "").trim().toUpperCase();
    if (!code) return;
    const guest = guests.find(g => g.ticket === code);
    if (!guest) {
      setScanResult({ ok:false, msg:"Billet inconnu !", guest:null });
    } else if (isScanAlreadyDone(guest.ticket)) {
      setScanResult({ ok:false, msg:"Déjà scanné !", guest });
    } else {
      await recordScan(guest);
      setScanResult({ ok:true, msg:"Bienvenue !", guest });
    }
    setScanInput("");
    setShowCamera(false);
    setTimeout(() => setScanResult(null), 4500);
  }, [guests, isScanAlreadyDone, recordScan]);

  const doScan = () => processCode(scanInput);

  return (
    <div style={{ display:"flex", height:"calc(100vh - 117px)", background:C.bgDeep }}>
      {showCamera && <CameraScanner onScan={processCode} onClose={() => setShowCamera(false)} />}

      {/* Zone scan */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"36px 24px", gap:20 }}>
        <div style={{ background:C.white, borderRadius:20, padding:32, width:"100%", maxWidth:460, boxShadow:`0 8px 32px ${C.shadow}`, border:`1px solid ${C.border}`, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🎫</div>
          <div style={{ fontFamily:FONT_DISPLAY, fontSize:15, color:C.roseDark, letterSpacing:3, marginBottom:4 }}>SCANNER UN BILLET</div>
          <div style={{ fontFamily:FONT_BODY, fontSize:14, color:C.textMuted, fontStyle:"italic", marginBottom:24 }}>Saisie manuelle ou scan par caméra</div>

          {/* Bouton caméra */}
          <button onClick={() => setShowCamera(true)}
            style={{ width:"100%", padding:"14px", background:`linear-gradient(135deg,${C.rose},${C.roseDark})`, border:"none", borderRadius:12, color:C.white, cursor:"pointer", fontFamily:FONT_DISPLAY, fontSize:12, letterSpacing:2, marginBottom:16, boxShadow:`0 4px 16px ${C.shadow}`, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>📷</span> OUVRIR LA CAMÉRA
          </button>

          <div style={{ fontFamily:FONT_BODY, fontSize:12, color:C.textMuted, fontStyle:"italic", marginBottom:16 }}>— ou saisie manuelle —</div>

          <div style={{ display:"flex", gap:10, marginBottom:20 }}>
            <input value={scanInput} onChange={e => setScanInput(e.target.value.toUpperCase())} onKeyDown={e => e.key==="Enter" && doScan()}
              placeholder="ex: TKT-001"
              style={{ flex:1, border:`2px solid ${C.border}`, borderRadius:10, padding:"12px 16px", fontSize:16, fontFamily:FONT_DISPLAY, letterSpacing:3, color:C.text, background:C.bgDeep, textAlign:"center", outline:"none" }} />
            <button onClick={doScan} style={{ background:`linear-gradient(135deg,${C.champagne},${C.champDark})`, border:"none", borderRadius:10, padding:"12px 18px", color:C.white, cursor:"pointer", fontFamily:FONT_DISPLAY, fontSize:12, letterSpacing:1 }}>OK</button>
          </div>

          {/* Résultat */}
          {scanResult && (
            <div style={{ padding:20, borderRadius:14, background:scanResult.ok?"#f0faf4":"#fdf0f0", border:`2px solid ${scanResult.ok?C.green:C.red}`, animation:"fadeIn 0.3s ease" }}>
              <div style={{ fontSize:32, marginBottom:6 }}>{scanResult.ok?"✅":"❌"}</div>
              <div style={{ fontFamily:FONT_DISPLAY, fontSize:14, color:scanResult.ok?C.green:C.red, letterSpacing:2 }}>{scanResult.msg}</div>
              {scanResult.guest && (
                <div style={{ marginTop:10 }}>
                  <div style={{ fontFamily:FONT_BODY, fontSize:20, color:C.text, fontStyle:"italic" }}>{scanResult.guest.name}</div>
                  <div style={{ fontFamily:FONT_DISPLAY, fontSize:10, color:CAT_COLORS[scanResult.guest.category], marginTop:4, letterSpacing:2 }}>{scanResult.guest.category}</div>
                  {scanResult.ok && (
                    <div style={{ marginTop:10, padding:"8px 14px", background:scanResult.guest.table?C.blushLight:"#fff8e8", borderRadius:10, display:"inline-block" }}>
                      <span style={{ fontFamily:FONT_BODY, fontSize:14, color:scanResult.guest.table?C.roseDark:C.champDark }}>
                        {scanResult.guest.table
                          ? `📍 ${tables.find(t=>t.id===scanResult.guest.table)?.name || "—"}`
                          : "⚠️ Pas encore placé à table"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Raccourcis */}
          <div style={{ marginTop:20, display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
            <div style={{ fontFamily:FONT_BODY, fontSize:11, color:C.textMuted, fontStyle:"italic", width:"100%", marginBottom:4 }}>Tester rapidement :</div>
            {guests.slice(0,6).map(g => (
              <button key={g.id} onClick={() => processCode(g.ticket)}
                style={{ padding:"4px 12px", border:`1px solid ${C.border}`, borderRadius:12, background:C.bgDeep, cursor:"pointer", fontFamily:FONT_DISPLAY, fontSize:9, letterSpacing:1, color:C.textMuted }}>
                {g.ticket}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Historique */}
      <div style={{ width:290, background:C.white, borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, background:C.blushLight, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:FONT_DISPLAY, fontSize:9, letterSpacing:2, color:C.roseDark }}>HISTORIQUE</span>
          <span style={{ fontFamily:FONT_DISPLAY, fontSize:11, color:C.champDark }}>{scans.length} scannés</span>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"8px 10px" }}>
          {scans.length === 0
            ? <div style={{ textAlign:"center", color:C.textMuted, fontSize:14, marginTop:40, fontStyle:"italic", fontFamily:FONT_BODY }}>Aucun billet scanné</div>
            : scans.map(h => (
              <div key={h.id} style={{ background:C.bgDeep, border:`1px solid ${C.border}`, borderLeft:`3px solid ${CAT_COLORS[h.category]||C.champagne}`, borderRadius:8, padding:"8px 12px", marginBottom:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:FONT_BODY, fontSize:14, color:C.text }}>{h.name}</span>
                  <span style={{ fontFamily:FONT_TEXT, fontSize:10, color:C.textMuted }}>{h.scannedAt?.toDate ? h.scannedAt.toDate().toLocaleTimeString("fr-FR") : "—"}</span>
                </div>
                <div style={{ fontFamily:FONT_DISPLAY, fontSize:9, color:CAT_COLORS[h.category], marginTop:2, letterSpacing:1 }}>{h.category} · {h.ticket}</div>
                {h.table && <div style={{ fontFamily:FONT_BODY, fontSize:11, color:C.champDark, marginTop:2, fontStyle:"italic" }}>📍 {tables.find(t=>t.id===h.table)?.name}</div>}
              </div>
            ))}
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
