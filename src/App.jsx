// src/App.jsx
import { useWeddingData } from "./useWeddingData";
import { TabPlan }        from "./TabPlan";
import { TabScanner }     from "./TabScanner";
import { TabBudget }      from "./TabBudget";
import { TabProgramme }   from "./TabProgramme";
import { C, FONT_DISPLAY, FONT_BODY } from "./theme";
import { useState } from "react";

// Charger Google Fonts
const link = document.createElement("link");
link.rel  = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&family=EB+Garamond:ital@0;1&display=swap";
document.head.appendChild(link);

export default function App() {
  const [tab, setTab] = useState("plan");
  const data = useWeddingData();

  const {
    guests, tables, budget, programme, scans, loading,
    addGuest, updateGuestTable, deleteGuest,
    updateTablePosition, addTable, deleteTable,
    updateBudgetItem, addBudgetItem, deleteBudgetItem,
    toggleProgramme,
    recordScan, isScanAlreadyDone,
  } = data;

  const confirmed = guests.filter(g => g.rsvp === "confirmed").length;
  const pending   = guests.filter(g => g.rsvp === "pending").length;

  const exportPDF = () => {
    const w = window.open("", "_blank");
    const rows = tables.map(t => {
      const tg = guests.filter(g => g.table === t.id);
      return `<tr><td style="padding:10px;border:1px solid #e8d5d8;font-family:'Cinzel',serif;color:#b76e79">${t.name}</td><td style="padding:10px;border:1px solid #e8d5d8">${tg.map(g=>g.name).join(", ")||"—"}</td><td style="padding:10px;border:1px solid #e8d5d8;text-align:center">${tg.length}/${t.capacity}</td></tr>`;
    }).join("");
    const budRows = budget.map(b => `<tr><td style="padding:8px;border:1px solid #e8d5d8">${b.icon} ${b.label}</td><td style="padding:8px;border:1px solid #e8d5d8;text-align:right">${(b.budget||0).toLocaleString("fr-FR")} €</td><td style="padding:8px;border:1px solid #e8d5d8;text-align:right">${(b.spent||0).toLocaleString("fr-FR")} €</td></tr>`).join("");
    w.document.write(`<html><head><title>Protocole Mariage</title>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
      <style>body{font-family:'Cormorant Garamond',serif;padding:40px;color:#3d2b2e;background:#fdf8f2}h1{color:#b76e79;text-align:center;letter-spacing:6px;font-family:'Cinzel',serif}h2{color:#9a7340;font-family:'Cinzel',serif;font-size:14px;font-weight:400;margin-top:32px}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#f5d5d8;padding:10px;border:1px solid #e8d5d8;font-family:'Cinzel',serif;font-size:12px}</style></head>
      <body><h1>♡ Protocole Mariage ♡</h1>
      <h2>PLAN DE TABLE</h2><table><thead><tr><th>Table</th><th>Invités</th><th>Places</th></tr></thead><tbody>${rows}</tbody></table>
      <h2>BUDGET</h2><table><thead><tr><th>Poste</th><th>Prévu</th><th>Dépensé</th></tr></thead><tbody>${budRows}</tbody></table>
      <p style="margin-top:30px;color:#9a7a7e;font-size:12px;text-align:center;font-style:italic">Généré le ${new Date().toLocaleDateString("fr-FR")} — Application Protocole Mariage</p>
      <script>window.print()</script></body></html>`);
    w.document.close();
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ fontSize:48 }}>💍</div>
      <div style={{ fontFamily:FONT_DISPLAY, fontSize:16, color:C.roseDark, letterSpacing:4 }}>CHARGEMENT...</div>
      <div style={{ fontFamily:FONT_BODY, fontSize:13, color:C.textMuted, fontStyle:"italic" }}>Connexion à Firebase en cours</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'EB Garamond', serif", color:C.text }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.blushLight} 0%,${C.champLight} 100%)`, borderBottom:`1px solid ${C.border}`, padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:`0 2px 16px ${C.shadow}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ fontSize:28 }}>💍</div>
          <div>
            <div style={{ fontFamily:FONT_DISPLAY, fontSize:16, color:C.roseDark, letterSpacing:4 }}>PROTOCOLE MARIAGE</div>
            <div style={{ fontFamily:FONT_BODY, fontSize:12, color:C.champDark, fontStyle:"italic" }}>Service de gestion · Temps réel</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:24 }}>
          {[
            { label:"Invités",    value:guests.length,  color:C.roseDark  },
            { label:"Confirmés",  value:confirmed,      color:C.green     },
            { label:"En attente", value:pending,        color:C.champagne },
            { label:"Scannés",    value:scans.length,   color:C.blushDark },
          ].map(s => (
            <div key={s.label} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:FONT_DISPLAY, fontSize:20, color:s.color }}>{s.value}</div>
              <div style={{ fontFamily:FONT_BODY, fontSize:11, color:C.champDark, fontStyle:"italic" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, background:C.white, paddingLeft:24 }}>
        {[
          { key:"plan",    label:"🗺️ Plan de Table"  },
          { key:"scanner", label:"🎫 Scanner Billets" },
          { key:"budget",  label:"💰 Budget"          },
          { key:"prog",    label:"📋 Programme"       },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ border:"none", background:"none", padding:"12px 20px", cursor:"pointer", fontSize:13, fontFamily:FONT_DISPLAY, letterSpacing:1, color:tab===t.key?C.rose:C.textMuted, borderBottom:tab===t.key?`2px solid ${C.rose}`:"2px solid transparent", fontWeight:tab===t.key?600:400, transition:"all 0.2s" }}>
            {t.label}
          </button>
        ))}
        <div style={{ flex:1 }} />

        {/* Indicateur live */}
        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"0 16px" }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:C.green, animation:"pulse 2s infinite" }} />
          <span style={{ fontFamily:FONT_BODY, fontSize:11, color:C.green, fontStyle:"italic" }}>En direct</span>
        </div>

        <button onClick={exportPDF} style={{ margin:"6px 16px", padding:"6px 20px", background:`linear-gradient(135deg,${C.champagne},${C.champDark})`, border:"none", borderRadius:20, color:C.white, cursor:"pointer", fontSize:11, fontFamily:FONT_DISPLAY, letterSpacing:1.5, boxShadow:`0 2px 8px ${C.shadow}` }}>
          📄 PDF
        </button>
      </div>

      {/* Contenu */}
      {tab === "plan" && (
        <TabPlan
          guests={guests} tables={tables}
          updateGuestTable={updateGuestTable}
          updateTablePosition={updateTablePosition}
          addGuest={addGuest}
          deleteGuest={deleteGuest}
        />
      )}
      {tab === "scanner" && (
        <TabScanner
          guests={guests} tables={tables} scans={scans}
          recordScan={recordScan}
          isScanAlreadyDone={isScanAlreadyDone}
        />
      )}
      {tab === "budget" && (
        <TabBudget
          budget={budget}
          updateBudgetItem={updateBudgetItem}
          addBudgetItem={addBudgetItem}
          deleteBudgetItem={deleteBudgetItem}
        />
      )}
      {tab === "prog" && (
        <TabProgramme
          programme={programme}
          toggleProgramme={toggleProgramme}
        />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
