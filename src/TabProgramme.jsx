// src/TabProgramme.jsx
import { C, FONT_DISPLAY, FONT_BODY, FONT_TEXT } from "./theme";

export function TabProgramme({ programme, toggleProgramme }) {
  const done  = programme.filter(p => p.done).length;
  const total = programme.length;

  return (
    <div style={{ padding:40, background:C.bgDeep, minHeight:"calc(100vh - 117px)", display:"flex", justifyContent:"center", overflowY:"auto" }}>
      <div style={{ maxWidth:600, width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontFamily:FONT_DISPLAY, fontSize:11, color:C.champDark, letterSpacing:5 }}>DÉROULEMENT DE LA JOURNÉE</div>
          <div style={{ fontFamily:FONT_BODY, fontSize:28, color:C.roseDark, fontStyle:"italic", marginTop:8 }}>Programme & Protocole</div>
          <div style={{ fontFamily:FONT_TEXT, fontSize:13, color:C.textMuted, marginTop:6 }}>{done} / {total} étapes complétées · Synchronisé en temps réel</div>
          <div style={{ background:C.border, borderRadius:4, height:4, margin:"12px auto 0", width:200, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${total?(done/total)*100:0}%`, background:`linear-gradient(90deg,${C.blush},${C.rose})`, transition:"width 0.5s" }} />
          </div>
        </div>

        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", left:30, top:0, bottom:0, width:2, background:`linear-gradient(to bottom,${C.blushLight},${C.champLight})` }} />
          {programme.map((item) => (
            <div key={item.id} style={{ display:"flex", gap:24, marginBottom:20, alignItems:"flex-start" }}>
              <div onClick={() => toggleProgramme(item.id, !item.done)}
                style={{ width:60, height:60, borderRadius:"50%", flexShrink:0, zIndex:1, position:"relative", cursor:"pointer",
                  background: item.done ? `linear-gradient(135deg,${C.rose},${C.blushDark})` : C.white,
                  border:`3px solid ${item.done?C.rose:C.border}`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:item.done?20:22,
                  boxShadow: item.done ? `0 4px 16px ${C.shadow}` : "none", transition:"all 0.3s" }}>
                {item.done ? "✓" : item.icon}
              </div>
              <div style={{ flex:1, background:C.white, borderRadius:14, padding:"14px 20px", boxShadow:`0 2px 12px ${C.shadow}`, border:`1px solid ${item.done?C.blushLight:C.border}`, opacity:item.done?0.7:1, transition:"all 0.3s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontFamily:FONT_BODY, fontSize:16, color:item.done?C.textMuted:C.text, textDecoration:item.done?"line-through":"none", transition:"all 0.3s" }}>{item.label}</div>
                    <div style={{ fontFamily:FONT_DISPLAY, fontSize:10, color:C.champDark, marginTop:4, letterSpacing:2 }}>⏰ {item.time}</div>
                  </div>
                  {item.done && <span style={{ fontFamily:FONT_DISPLAY, fontSize:8, color:C.rose, background:C.blushLight, padding:"4px 12px", borderRadius:20, letterSpacing:1 }}>TERMINÉ</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:8, textAlign:"center", fontFamily:FONT_BODY, fontSize:13, color:C.textMuted, fontStyle:"italic" }}>
          Cliquez sur une étape pour la marquer comme terminée — visible par toute l'équipe
        </div>
      </div>
    </div>
  );
}
