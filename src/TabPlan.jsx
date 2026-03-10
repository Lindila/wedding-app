// src/TabPlan.jsx
import { useState, useRef, useCallback } from "react";
import { C, FONT_DISPLAY, FONT_BODY, FONT_TEXT, CAT_COLORS } from "./theme";

export function TabPlan({ guests, tables, updateGuestTable, updateTablePosition, addGuest, deleteGuest }) {
  const [draggingGuest,  setDraggingGuest]  = useState(null);
  const [hoveredTable,   setHoveredTable]   = useState(null);
  const [selectedTable,  setSelectedTable]  = useState(null);
  const [draggingTable,  setDraggingTable]  = useState(null);
  const [dragOffset,     setDragOffset]     = useState({ x:0, y:0 });
  const [showAdd,        setShowAdd]        = useState(false);
  const [newName,        setNewName]        = useState("");
  const [newCat,         setNewCat]         = useState("Famille");
  const canvasRef = useRef(null);

  const getTableGuests = useCallback((tid) => guests.filter(g => g.table === tid), [guests]);
  const unassigned = guests.filter(g => g.table === null && g.rsvp !== "declined");

  // Drag invités
  const handleDragStart = (e, guest) => { setDraggingGuest(guest); e.dataTransfer.effectAllowed = "move"; };
  const handleTableDrop = (e, tid) => {
    e.preventDefault();
    if (!draggingGuest) return;
    const tbl = tables.find(t => t.id === tid);
    if (tbl && getTableGuests(tid).length < tbl.capacity)
      updateGuestTable(draggingGuest.id, tid);
    setDraggingGuest(null); setHoveredTable(null);
  };
  const removeFromTable = (gid) => updateGuestTable(gid, null);

  // Drag tables
  const handleTableMouseDown = (e, tbl) => {
    if (e.button !== 0 || !canvasRef.current) return;
    e.stopPropagation();
    const r = canvasRef.current.getBoundingClientRect();
    setDraggingTable(tbl.id);
    setDragOffset({ x: e.clientX - r.left - tbl.x, y: e.clientY - r.top - tbl.y });
  };
  const handleMouseMove = (e) => {
    if (!draggingTable || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    updateTablePosition(
      draggingTable,
      Math.max(60, Math.min(e.clientX - r.left - dragOffset.x, r.width  - 60)),
      Math.max(60, Math.min(e.clientY - r.top  - dragOffset.y, r.height - 60)),
    );
  };
  const stopDrag = () => setDraggingTable(null);

  const handleAddGuest = async () => {
    if (!newName.trim()) return;
    await addGuest({ name: newName.trim(), category: newCat });
    setNewName(""); setShowAdd(false);
  };

  const assigned = guests.filter(g => g.table !== null).length;
  const total    = guests.filter(g => g.rsvp !== "declined").length;

  return (
    <div style={{ display:"flex", height:"calc(100vh - 117px)" }}>

      {/* ── Panneau gauche ── */}
      <div style={{ width:220, background:C.white, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, background:C.blushLight, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:FONT_DISPLAY, fontSize:9, letterSpacing:2, color:C.roseDark }}>NON PLACÉS ({unassigned.length})</span>
          <button onClick={() => setShowAdd(!showAdd)} style={{ background:C.rose, border:"none", color:C.white, borderRadius:"50%", width:24, height:24, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
        </div>

        {showAdd && (
          <div style={{ padding:12, borderBottom:`1px solid ${C.border}`, background:C.bgDeep }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom de l'invité"
              onKeyDown={e => e.key === "Enter" && handleAddGuest()}
              style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", fontSize:14, marginBottom:8, boxSizing:"border-box", fontFamily:FONT_TEXT, color:C.text, background:C.white }} />
            <select value={newCat} onChange={e => setNewCat(e.target.value)}
              style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 8px", fontSize:13, marginBottom:8, fontFamily:FONT_TEXT, color:C.text, background:C.white }}>
              {Object.keys(CAT_COLORS).map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={handleAddGuest} style={{ width:"100%", background:`linear-gradient(135deg,${C.rose},${C.roseDark})`, border:"none", color:C.white, borderRadius:6, padding:8, cursor:"pointer", fontFamily:FONT_DISPLAY, fontSize:10, letterSpacing:1.5 }}>AJOUTER</button>
          </div>
        )}

        <div style={{ flex:1, overflowY:"auto", padding:"8px 10px" }}>
          {unassigned.length === 0
            ? <div style={{ textAlign:"center", color:C.textMuted, fontSize:14, marginTop:40, fontStyle:"italic", fontFamily:FONT_BODY }}>Tous les invités sont placés ✓</div>
            : unassigned.map(g => (
              <div key={g.id} draggable onDragStart={e => handleDragStart(e, g)}
                style={{ background:C.bgDeep, border:`1px solid ${C.border}`, borderLeft:`3px solid ${CAT_COLORS[g.category]||C.champagne}`, borderRadius:8, padding:"8px 10px", marginBottom:6, cursor:"grab", userSelect:"none", transition:"box-shadow 0.15s", position:"relative" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow=`0 2px 10px ${C.shadow}`}
                onMouseLeave={e => e.currentTarget.style.boxShadow="none"}>
                <div style={{ fontSize:14, fontFamily:FONT_BODY, color:C.text }}>{g.name}</div>
                <div style={{ fontSize:10, color:CAT_COLORS[g.category], marginTop:2, fontFamily:FONT_DISPLAY, letterSpacing:1 }}>{g.category}</div>
                <div style={{ fontSize:10, color:C.textMuted, fontFamily:FONT_TEXT }}>{g.ticket}</div>
                <button onClick={() => deleteGuest(g.id)} style={{ position:"absolute", top:6, right:6, background:"none", border:"none", color:C.red, cursor:"pointer", fontSize:14, opacity:0.5 }}
                  onMouseEnter={e => e.currentTarget.style.opacity="1"}
                  onMouseLeave={e => e.currentTarget.style.opacity="0.5"}>×</button>
              </div>
            ))}
        </div>
      </div>

      {/* ── Salle ── */}
      <div ref={canvasRef} onMouseMove={handleMouseMove} onMouseUp={stopDrag} onMouseLeave={stopDrag}
        style={{ flex:1, position:"relative", overflow:"hidden", background:`radial-gradient(ellipse at 50% 40%, #fdf0f3 0%, ${C.bgDeep} 70%)`, cursor:draggingTable?"grabbing":"default" }}>
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.05, pointerEvents:"none" }}>
          <defs><pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1.5" fill={C.rose}/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", fontFamily:FONT_DISPLAY, fontSize:9, color:C.blushDark, letterSpacing:5, pointerEvents:"none", opacity:0.5 }}>SALLE DE RÉCEPTION</div>

        {tables.map(tbl => {
          const tg     = getTableGuests(tbl.id);
          const isFull = tg.length >= tbl.capacity;
          const isHov  = hoveredTable === tbl.id;
          const isSel  = selectedTable === tbl.id;
          return (
            <div key={tbl.id}
              onDragOver={e => { e.preventDefault(); setHoveredTable(tbl.id); }}
              onDragLeave={() => setHoveredTable(null)}
              onDrop={e => handleTableDrop(e, tbl.id)}
              onMouseDown={e => handleTableMouseDown(e, tbl)}
              onClick={() => setSelectedTable(isSel ? null : tbl.id)}
              style={{ position:"absolute", left:tbl.x, top:tbl.y, transform:"translate(-50%,-50%)", width:115, height:115, borderRadius:"50%",
                background:`radial-gradient(circle at 40% 35%, ${C.white} 0%, ${C.bgDeep} 100%)`,
                border:`3px solid ${isSel ? tbl.color : isHov && !isFull ? tbl.color : C.border}`,
                boxShadow: isSel ? `0 0 0 4px ${tbl.color}33, 0 8px 28px ${C.shadow}` : `0 4px 18px ${C.shadow}`,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                cursor: draggingTable===tbl.id ? "grabbing" : "grab", userSelect:"none",
                transition:"border-color 0.2s, box-shadow 0.2s",
                zIndex: draggingTable===tbl.id ? 100 : isSel ? 50 : 10 }}>
              <div style={{ fontFamily:FONT_BODY, fontSize:10, color:tbl.color, textAlign:"center", fontStyle:"italic", padding:"0 8px", lineHeight:1.3 }}>{tbl.name}</div>
              <div style={{ fontFamily:FONT_DISPLAY, fontSize:11, color:isFull?C.red:C.champDark, marginTop:3 }}>{tg.length}/{tbl.capacity}</div>
              {Array.from({ length:tbl.capacity }).map((_,i) => {
                const angle = (i/tbl.capacity)*2*Math.PI - Math.PI/2;
                return (
                  <div key={i} title={tg[i]?.name} style={{ position:"absolute", left:57.5+65*Math.cos(angle)-7, top:57.5+65*Math.sin(angle)-7, width:14, height:14, borderRadius:"50%",
                    background: i<tg.length ? CAT_COLORS[tg[i].category]||C.champagne : C.bgDeep,
                    border:`2px solid ${i<tg.length ? CAT_COLORS[tg[i].category]||C.champagne : C.border}`,
                    transition:"all 0.2s" }} />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Panneau droite ── */}
      <div style={{ width:210, background:C.white, borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, background:C.blushLight }}>
          <span style={{ fontFamily:FONT_DISPLAY, fontSize:9, letterSpacing:2, color:C.roseDark }}>{selectedTable ? "INVITÉS À TABLE" : "LÉGENDE"}</span>
        </div>

        {selectedTable ? (() => {
          const tbl = tables.find(t => t.id === selectedTable);
          const tg  = getTableGuests(selectedTable);
          if (!tbl) return null;
          return (
            <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>
              <div style={{ fontFamily:FONT_BODY, fontSize:16, color:tbl.color, fontStyle:"italic", marginBottom:2 }}>{tbl.name}</div>
              <div style={{ fontFamily:FONT_TEXT, fontSize:12, color:C.textMuted, marginBottom:14 }}>{tg.length}/{tbl.capacity} places</div>
              {tg.length === 0 && <div style={{ color:C.textMuted, fontSize:13, fontStyle:"italic", fontFamily:FONT_BODY }}>Aucun invité</div>}
              {tg.map(g => (
                <div key={g.id} style={{ background:C.bgDeep, border:`1px solid ${C.border}`, borderLeft:`3px solid ${CAT_COLORS[g.category]}`, borderRadius:8, padding:"7px 10px", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontFamily:FONT_BODY, fontSize:14, color:C.text }}>{g.name}</div>
                    <div style={{ fontFamily:FONT_DISPLAY, fontSize:9, color:CAT_COLORS[g.category], letterSpacing:1 }}>{g.category}</div>
                  </div>
                  <button onClick={() => removeFromTable(g.id)} style={{ background:"none", border:"none", color:C.red, cursor:"pointer", fontSize:18 }}>×</button>
                </div>
              ))}
            </div>
          );
        })() : (
          <div style={{ padding:16 }}>
            <p style={{ fontFamily:FONT_BODY, fontSize:13, color:C.textMuted, fontStyle:"italic", lineHeight:1.7 }}>Glissez les invités sur une table. Cliquez pour voir les détails.</p>
            <div style={{ marginTop:16 }}>
              {Object.entries(CAT_COLORS).map(([cat,color]) => (
                <div key={cat} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:12, height:12, borderRadius:"50%", background:color }} />
                  <span style={{ fontFamily:FONT_BODY, fontSize:13, color:C.text }}>{cat}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:20, padding:"12px 14px", background:C.bgDeep, borderRadius:10, border:`1px solid ${C.border}` }}>
              <div style={{ fontFamily:FONT_DISPLAY, fontSize:9, color:C.textMuted, letterSpacing:2, marginBottom:8 }}>AVANCEMENT</div>
              <div style={{ background:C.border, borderRadius:4, height:6, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${total ? (assigned/total)*100 : 0}%`, background:`linear-gradient(90deg,${C.blush},${C.rose})`, transition:"width 0.5s" }} />
              </div>
              <div style={{ fontFamily:FONT_BODY, fontSize:13, color:C.roseDark, marginTop:6 }}>{assigned} / {total} placés</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
