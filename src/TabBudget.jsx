// src/TabBudget.jsx
import { useState } from "react";
import { C, FONT_DISPLAY, FONT_BODY, FONT_TEXT } from "./theme";

const ICONS = ["💰","🏛️","🍽️","📸","🌹","🎵","👗","💌","✨","🚗","💐","🎂","🎤","📋"];

export function TabBudget({ budget, updateBudgetItem, addBudgetItem, deleteBudgetItem }) {
  const [editingId, setEditingId] = useState(null);
  const [editBudget, setEditBudget] = useState("");
  const [editSpent,  setEditSpent]  = useState("");
  const [showAdd,    setShowAdd]    = useState(false);
  const [newLabel,   setNewLabel]   = useState("");
  const [newBudget,  setNewBudget]  = useState("");
  const [newIcon,    setNewIcon]    = useState("💰");

  const totalBudget = budget.reduce((s,i) => s + (Number(i.budget)||0), 0);
  const totalSpent  = budget.reduce((s,i) => s + (Number(i.spent) ||0), 0);
  const totalLeft   = totalBudget - totalSpent;

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditBudget(String(item.budget));
    setEditSpent(String(item.spent));
  };

  const saveEdit = async (item) => {
    await updateBudgetItem(item.id, { budget: Number(editBudget), spent: Number(editSpent) });
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!newLabel.trim() || !newBudget) return;
    await addBudgetItem({ label:newLabel.trim(), budget:Number(newBudget), icon:newIcon });
    setNewLabel(""); setNewBudget(""); setNewIcon("💰"); setShowAdd(false);
  };

  return (
    <div style={{ padding:32, background:C.bgDeep, minHeight:"calc(100vh - 117px)", overflowY:"auto" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>

        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontFamily:FONT_DISPLAY, fontSize:18, color:C.roseDark, letterSpacing:4 }}>TABLEAU DE BORD BUDGET</div>
          <div style={{ fontFamily:FONT_BODY, fontSize:14, color:C.champDark, fontStyle:"italic", marginTop:4 }}>Mis à jour en temps réel · Partagé avec toute l'équipe</div>
        </div>

        {/* Résumé */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:28 }}>
          {[
            { label:"Budget total", value:totalBudget, color:C.champagne, icon:"💰", sub:"Prévu" },
            { label:"Dépensé",      value:totalSpent,  color:totalSpent>totalBudget?C.red:C.rose, icon:"💳", sub:`${Math.round(totalBudget?totalSpent/totalBudget*100:0)}% du budget` },
            { label:"Restant",      value:totalLeft,   color:totalLeft<0?C.red:C.green, icon:"✨", sub:totalLeft<0?"Budget dépassé ⚠️":"Disponible" },
          ].map(s => (
            <div key={s.label} style={{ background:C.white, borderRadius:16, padding:24, boxShadow:`0 4px 20px ${C.shadow}`, border:`1px solid ${C.border}`, textAlign:"center" }}>
              <div style={{ fontSize:32 }}>{s.icon}</div>
              <div style={{ fontFamily:FONT_DISPLAY, fontSize:22, color:s.color, marginTop:8 }}>{Math.abs(s.value).toLocaleString("fr-FR")} €{s.value<0?" (−)":""}</div>
              <div style={{ fontFamily:FONT_BODY, fontSize:13, color:C.textMuted, fontStyle:"italic", marginTop:2 }}>{s.label}</div>
              <div style={{ fontFamily:FONT_TEXT, fontSize:11, color:C.textMuted, marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Barre globale */}
        <div style={{ background:C.white, borderRadius:16, padding:"18px 24px", boxShadow:`0 4px 20px ${C.shadow}`, border:`1px solid ${C.border}`, marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontFamily:FONT_BODY, fontSize:14, color:C.roseDark, fontStyle:"italic" }}>Progression globale</span>
            <span style={{ fontFamily:FONT_DISPLAY, fontSize:12, color:totalSpent>totalBudget?C.red:C.champDark }}>{Math.round(totalBudget?totalSpent/totalBudget*100:0)}%</span>
          </div>
          <div style={{ background:C.border, borderRadius:8, height:12, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min(100, totalBudget?totalSpent/totalBudget*100:0)}%`, background:`linear-gradient(90deg,${C.blush},${C.rose},${C.champagne})`, transition:"width 0.6s", borderRadius:8 }} />
          </div>
          <div style={{ fontFamily:FONT_TEXT, fontSize:12, color:C.textMuted, marginTop:8 }}>
            {totalSpent.toLocaleString("fr-FR")} € dépensés sur {totalBudget.toLocaleString("fr-FR")} € prévus
          </div>
        </div>

        {/* Lignes détaillées */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
          {budget.map(item => {
            const pct  = Math.min(100, item.budget ? item.spent/item.budget*100 : 0);
            const over = item.spent > item.budget;
            const isEd = editingId === item.id;
            return (
              <div key={item.id} style={{ background:C.white, borderRadius:14, padding:"16px 18px", boxShadow:`0 2px 12px ${C.shadow}`, border:`1px solid ${over?C.red+"44":C.border}`, position:"relative" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:20 }}>{item.icon}</span>
                    <span style={{ fontFamily:FONT_BODY, fontSize:14, color:C.text }}>{item.label}</span>
                  </div>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <span style={{ fontFamily:FONT_DISPLAY, fontSize:9, color:over?C.red:C.green, letterSpacing:1 }}>{over?"⚠️":"✓"}</span>
                    {!isEd && (
                      <>
                        <button onClick={() => startEdit(item)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:6, padding:"2px 8px", cursor:"pointer", fontFamily:FONT_DISPLAY, fontSize:8, color:C.champDark, letterSpacing:1 }}>MODIFIER</button>
                        <button onClick={() => deleteBudgetItem(item.id)} style={{ background:"none", border:"none", color:C.red, cursor:"pointer", fontSize:14, opacity:0.5 }}
                          onMouseEnter={e => e.currentTarget.style.opacity="1"}
                          onMouseLeave={e => e.currentTarget.style.opacity="0.5"}>×</button>
                      </>
                    )}
                  </div>
                </div>

                {isEd ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <div style={{ display:"flex", gap:8 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:FONT_DISPLAY, fontSize:8, color:C.textMuted, letterSpacing:1, marginBottom:3 }}>BUDGET (€)</div>
                        <input type="number" value={editBudget} onChange={e => setEditBudget(e.target.value)}
                          style={{ width:"100%", border:`2px solid ${C.champagne}`, borderRadius:6, padding:"6px 8px", fontSize:14, fontFamily:FONT_TEXT, color:C.text, background:C.bgDeep, boxSizing:"border-box" }} />
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:FONT_DISPLAY, fontSize:8, color:C.textMuted, letterSpacing:1, marginBottom:3 }}>DÉPENSÉ (€)</div>
                        <input type="number" value={editSpent} onChange={e => setEditSpent(e.target.value)}
                          style={{ width:"100%", border:`2px solid ${C.rose}`, borderRadius:6, padding:"6px 8px", fontSize:14, fontFamily:FONT_TEXT, color:C.text, background:C.bgDeep, boxSizing:"border-box" }} />
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => saveEdit(item)} style={{ flex:1, background:`linear-gradient(135deg,${C.rose},${C.roseDark})`, border:"none", color:C.white, borderRadius:8, padding:8, cursor:"pointer", fontFamily:FONT_DISPLAY, fontSize:9, letterSpacing:1.5 }}>ENREGISTRER</button>
                      <button onClick={() => setEditingId(null)} style={{ flex:1, background:C.bgDeep, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:8, padding:8, cursor:"pointer", fontFamily:FONT_DISPLAY, fontSize:9, letterSpacing:1 }}>ANNULER</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ background:C.bgDeep, borderRadius:6, height:8, overflow:"hidden", marginBottom:8 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:over?`linear-gradient(90deg,${C.blush},${C.red})`:`linear-gradient(90deg,${C.blushLight},${C.rose})`, transition:"width 0.6s", borderRadius:6 }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontFamily:FONT_TEXT, fontSize:12, color:C.textMuted }}>Dépensé : <b style={{ color:over?C.red:C.text }}>{(item.spent||0).toLocaleString("fr-FR")} €</b></span>
                      <span style={{ fontFamily:FONT_TEXT, fontSize:12, color:C.textMuted }}>/ {(item.budget||0).toLocaleString("fr-FR")} €</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Ajouter un poste */}
        {showAdd ? (
          <div style={{ background:C.white, borderRadius:14, padding:"20px 24px", boxShadow:`0 2px 12px ${C.shadow}`, border:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:FONT_DISPLAY, fontSize:11, color:C.roseDark, letterSpacing:2, marginBottom:16 }}>NOUVEAU POSTE BUDGÉTAIRE</div>
            <div style={{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" }}>
              <div style={{ flex:2, minWidth:150 }}>
                <div style={{ fontFamily:FONT_DISPLAY, fontSize:8, color:C.textMuted, letterSpacing:1, marginBottom:3 }}>LIBELLÉ</div>
                <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="ex: Limousine"
                  style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:14, fontFamily:FONT_TEXT, color:C.text, background:C.bgDeep, boxSizing:"border-box" }} />
              </div>
              <div style={{ flex:1, minWidth:100 }}>
                <div style={{ fontFamily:FONT_DISPLAY, fontSize:8, color:C.textMuted, letterSpacing:1, marginBottom:3 }}>BUDGET (€)</div>
                <input type="number" value={newBudget} onChange={e => setNewBudget(e.target.value)} placeholder="0"
                  style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:14, fontFamily:FONT_TEXT, color:C.text, background:C.bgDeep, boxSizing:"border-box" }} />
              </div>
              <div style={{ flex:1, minWidth:100 }}>
                <div style={{ fontFamily:FONT_DISPLAY, fontSize:8, color:C.textMuted, letterSpacing:1, marginBottom:3 }}>ICÔNE</div>
                <select value={newIcon} onChange={e => setNewIcon(e.target.value)}
                  style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:18, background:C.bgDeep }}>
                  {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={handleAdd} style={{ flex:1, background:`linear-gradient(135deg,${C.champagne},${C.champDark})`, border:"none", color:C.white, borderRadius:8, padding:10, cursor:"pointer", fontFamily:FONT_DISPLAY, fontSize:10, letterSpacing:2 }}>AJOUTER</button>
              <button onClick={() => setShowAdd(false)} style={{ flex:1, background:C.bgDeep, border:`1px solid ${C.border}`, color:C.textMuted, borderRadius:8, padding:10, cursor:"pointer", fontFamily:FONT_DISPLAY, fontSize:10, letterSpacing:1 }}>ANNULER</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} style={{ width:"100%", padding:14, background:"none", border:`2px dashed ${C.border}`, borderRadius:14, cursor:"pointer", fontFamily:FONT_DISPLAY, fontSize:11, color:C.textMuted, letterSpacing:2, transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=C.rose; e.currentTarget.style.color=C.rose; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textMuted; }}>
            + AJOUTER UN POSTE BUDGÉTAIRE
          </button>
        )}
      </div>
    </div>
  );
}
