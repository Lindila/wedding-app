// src/useWeddingData.js
// Hook central — synchronise tout avec Firebase en temps réel

import { useState, useEffect, useCallback } from "react";
import {
  collection, doc, onSnapshot, setDoc, updateDoc,
  deleteDoc, addDoc, serverTimestamp, writeBatch
} from "firebase/firestore";
import { db } from "./firebase";

// ── Données par défaut insérées au 1er lancement ─────────────────────────────
const DEFAULT_TABLES = [
  { id:"t1", name:"Table des Mariés", capacity:8, x:380, y:200, color:"#c9a96e" },
  { id:"t2", name:"Table Famille",    capacity:6, x:150, y:140, color:"#c4787e" },
  { id:"t3", name:"Table Amis",       capacity:6, x:620, y:140, color:"#7a9eb8" },
  { id:"t4", name:"Table VIP",        capacity:6, x:150, y:360, color:"#9a7340" },
  { id:"t5", name:"Table Collègues",  capacity:6, x:620, y:360, color:"#7a9e7e" },
];

const DEFAULT_BUDGET = [
  { id:"b1", label:"Salle & décoration",  budget:4500, spent:0, icon:"🏛️" },
  { id:"b2", label:"Traiteur & boissons", budget:8000, spent:0, icon:"🍽️" },
  { id:"b3", label:"Photographe",         budget:2500, spent:0, icon:"📸" },
  { id:"b4", label:"Fleuriste",           budget:1200, spent:0, icon:"🌹" },
  { id:"b5", label:"Musique & DJ",        budget:1800, spent:0, icon:"🎵" },
  { id:"b6", label:"Tenues",             budget:3000, spent:0, icon:"👗" },
  { id:"b7", label:"Faire-parts",         budget:400,  spent:0, icon:"💌" },
  { id:"b8", label:"Divers",             budget:600,  spent:0, icon:"✨" },
];

const DEFAULT_PROGRAMME = [
  { id:"p1", time:"11h00", label:"Accueil des invités",      icon:"🌸", done:false },
  { id:"p2", time:"11h30", label:"Cérémonie civile",          icon:"💍", done:false },
  { id:"p3", time:"12h30", label:"Vin d'honneur & cocktail",  icon:"🥂", done:false },
  { id:"p4", time:"14h00", label:"Dîner de gala",             icon:"🍽️", done:false },
  { id:"p5", time:"16h00", label:"Discours & témoignages",    icon:"🎤", done:false },
  { id:"p6", time:"17h00", label:"Pièce montée",              icon:"🎂", done:false },
  { id:"p7", time:"18h00", label:"Soirée dansante",           icon:"💃", done:false },
  { id:"p8", time:"23h00", label:"Fin de soirée",             icon:"✨", done:false },
];

export function useWeddingData() {
  const [guests,    setGuests]    = useState([]);
  const [tables,    setTables]    = useState([]);
  const [budget,    setBudget]    = useState([]);
  const [programme, setProgramme] = useState([]);
  const [scans,     setScans]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  // ── Initialiser les collections si vides ─────────────────────────────────
  useEffect(() => {
    const init = async () => {
      // Tables
      const tabSnap = await import("firebase/firestore").then(({ getDocs }) =>
        getDocs(collection(db, "tables"))
      );
      if (tabSnap.empty) {
        const batch = writeBatch(db);
        DEFAULT_TABLES.forEach(t => batch.set(doc(db, "tables", t.id), t));
        await batch.commit();
      }
      // Budget
      const budSnap = await import("firebase/firestore").then(({ getDocs }) =>
        getDocs(collection(db, "budget"))
      );
      if (budSnap.empty) {
        const batch = writeBatch(db);
        DEFAULT_BUDGET.forEach(b => batch.set(doc(db, "budget", b.id), b));
        await batch.commit();
      }
      // Programme
      const progSnap = await import("firebase/firestore").then(({ getDocs }) =>
        getDocs(collection(db, "programme"))
      );
      if (progSnap.empty) {
        const batch = writeBatch(db);
        DEFAULT_PROGRAMME.forEach(p => batch.set(doc(db, "programme", p.id), p));
        await batch.commit();
      }
      setLoading(false);
    };
    init();
  }, []);

  // ── Listeners temps réel ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubs = [
      onSnapshot(collection(db, "guests"),    s => setGuests(s.docs.map(d => ({ id:d.id, ...d.data() })))),
      onSnapshot(collection(db, "tables"),    s => setTables(s.docs.map(d => ({ id:d.id, ...d.data() })))),
      onSnapshot(collection(db, "budget"),    s => setBudget(s.docs.map(d => ({ id:d.id, ...d.data() })))),
      onSnapshot(collection(db, "programme"), s => setProgramme(s.docs.map(d => ({ id:d.id, ...d.data() })))),
      onSnapshot(collection(db, "scans"),     s => setScans(s.docs.map(d => ({ id:d.id, ...d.data() })).sort((a,b) => b.scannedAt?.seconds - a.scannedAt?.seconds))),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  // ── Actions Invités ───────────────────────────────────────────────────────
  const addGuest = useCallback(async ({ name, category }) => {
    const count = guests.length;
    await addDoc(collection(db, "guests"), {
      name, category,
      table:  null,
      rsvp:   "confirmed",
      ticket: `TKT-${String(100 + count).padStart(3,"0")}`,
      createdAt: serverTimestamp(),
    });
  }, [guests.length]);

  const updateGuestTable = useCallback(async (guestId, tableId) => {
    await updateDoc(doc(db, "guests", guestId), { table: tableId });
  }, []);

  const deleteGuest = useCallback(async (guestId) => {
    await deleteDoc(doc(db, "guests", guestId));
  }, []);

  const updateGuestRsvp = useCallback(async (guestId, rsvp) => {
    await updateDoc(doc(db, "guests", guestId), { rsvp });
  }, []);

  // ── Actions Tables ────────────────────────────────────────────────────────
  const updateTablePosition = useCallback(async (tableId, x, y) => {
    await updateDoc(doc(db, "tables", tableId), { x, y });
  }, []);

  const addTable = useCallback(async ({ name, capacity, color }) => {
    const id = "t" + Date.now();
    await setDoc(doc(db, "tables", id), { name, capacity, color, x:400, y:250 });
  }, []);

  const deleteTable = useCallback(async (tableId) => {
    // Retirer les invités de cette table
    const batch = writeBatch(db);
    guests.filter(g => g.table === tableId).forEach(g =>
      batch.update(doc(db, "guests", g.id), { table: null })
    );
    batch.delete(doc(db, "tables", tableId));
    await batch.commit();
  }, [guests]);

  // ── Actions Budget ────────────────────────────────────────────────────────
  const updateBudgetItem = useCallback(async (itemId, { budget: b, spent }) => {
    const data = {};
    if (b     !== undefined) data.budget = Number(b);
    if (spent !== undefined) data.spent  = Number(spent);
    await updateDoc(doc(db, "budget", itemId), data);
  }, []);

  const addBudgetItem = useCallback(async ({ label, budget: b, icon }) => {
    const id = "b" + Date.now();
    await setDoc(doc(db, "budget", id), { label, budget:Number(b), spent:0, icon: icon||"💰" });
  }, []);

  const deleteBudgetItem = useCallback(async (itemId) => {
    await deleteDoc(doc(db, "budget", itemId));
  }, []);

  // ── Actions Programme ─────────────────────────────────────────────────────
  const toggleProgramme = useCallback(async (itemId, done) => {
    await updateDoc(doc(db, "programme", itemId), { done });
  }, []);

  // ── Actions Scanner ───────────────────────────────────────────────────────
  const recordScan = useCallback(async (guest) => {
    await addDoc(collection(db, "scans"), {
      guestId:   guest.id,
      name:      guest.name,
      category:  guest.category,
      ticket:    guest.ticket,
      table:     guest.table,
      scannedAt: serverTimestamp(),
    });
  }, []);

  const isScanAlreadyDone = useCallback((ticket) =>
    scans.some(s => s.ticket === ticket), [scans]);

  return {
    // Data
    guests, tables, budget, programme, scans, loading,
    // Guests
    addGuest, updateGuestTable, deleteGuest, updateGuestRsvp,
    // Tables
    updateTablePosition, addTable, deleteTable,
    // Budget
    updateBudgetItem, addBudgetItem, deleteBudgetItem,
    // Programme
    toggleProgramme,
    // Scanner
    recordScan, isScanAlreadyDone,
  };
}
