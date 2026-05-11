import { useState, useEffect, useRef } from "react";
import { loadData, saveData } from "./supabase.js";

const LOGO_URL = "/logo.png";
const PASSWORD = "lesuccèsestinévitable:)";
const uid = () => Date.now() + Math.random().toString(36).slice(2);

const STATUTS = ["Idée", "En discussion", "Confirmé", "Annulé"];
const statutTag = (s) => {
  if (s === "Confirmé") return "tag-green";
  if (s === "En discussion") return "tag-yellow";
  if (s === "Annulé") return "tag-red";
  return "tag-gray";
};

const initData = {
  todoShort: [
    { id: uid(), title: "Finaliser le moodboard Summer", done: false, dap: "", dapImages: [], stock: "", dateSortie: "", shooting: "Non", mannequins: "", photographe: "", teaser: "Non", acteurs: "", realisateur: "", notes: "" },
    { id: uid(), title: "Commander les étiquettes et packagings", done: false, dap: "", dapImages: [], stock: "", dateSortie: "", shooting: "Non", mannequins: "", photographe: "", teaser: "Non", acteurs: "", realisateur: "", notes: "" },
  ],
  todoLong: [
    { id: uid(), title: "Préparer le dossier presse défilé 2027", done: false, dap: "", dapImages: [], stock: "", dateSortie: "", shooting: "Non", mannequins: "", photographe: "", teaser: "Non", acteurs: "", realisateur: "", notes: "" },
  ],
  drops: [
    { id: uid(), nom: "SUMMER", dateSortie: "", dap: "", dapImages: [], stock: "", objectifs: "", shooting: "Non", mannequins: "", photographe: "", teaser: "Non", acteurs: "", realisateur: "", notes: "" },
    { id: uid(), nom: "JANUS", dateSortie: "", dap: "", dapImages: [], stock: "", objectifs: "", shooting: "Non", mannequins: "", photographe: "", teaser: "Non", acteurs: "", realisateur: "", notes: "" },
    { id: uid(), nom: "DROP SUIVANT", dateSortie: "", dap: "", dapImages: [], stock: "", objectifs: "", shooting: "Non", mannequins: "", photographe: "", teaser: "Non", acteurs: "", realisateur: "", notes: "" },
  ],
  pnpn: { description: "Grand rassemblement créatif à Genève — stand pour ~4 000 personnes.", date: "", lieu: "", budget: "", equipe: "", stand: "", communication: "", logistique: "", notes: "" },
  lafripajo: { description: "Défilé en juin.", date: "", lieu: "", theme: "", casting: "", musique: "", budget: "", invitations: "", notes: "" },
  defile2027: { date: "", lieu: "", theme: "", looks: "", ordre: "", scenographie: "", casting: "", musique: "", equipe: "", budget: "", invitations: "", communication: "", images: [], notes: "" },
  psf: [{ id: uid(), nom: "Pièce 1", dateSortie: "", dap: "", dapImages: [], stock: "", shooting: "Non", mannequins: "", photographe: "", teaser: "Non", acteurs: "", realisateur: "", notes: "" }],
  marketing: { national: "", international: "", reseaux: "", techniques: "", notes: "" },
  artistes: [{ id: uid(), nom: "Artiste A", typeCollab: "Capsule", statut: "Idée", date: "", notes: "", profileImage: null, dapNotes: "", dapImages: [] }],
  brouillons: [],
};

// ── GLOBAL STYLES ──────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080808; }
    ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
    .nav-item { transition: all 0.2s; cursor: pointer; }
    .nav-item:hover { color: #fff !important; }
    .nav-item.active { color: #fff !important; border-left: 1px solid #fff; }
    .card { transition: border-color 0.2s; }
    .card:hover { border-color: rgba(255,255,255,0.15) !important; }
    .btn { transition: all 0.15s; cursor: pointer; font-family: 'DM Mono', monospace; }
    .btn-primary { background: #fff; color: #080808; border: none; padding: 7px 16px; font-size: 11px; letter-spacing: 0.1em; border-radius: 3px; }
    .btn-primary:hover { opacity: 0.85; }
    .btn-ghost { background: transparent; color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.12); padding: 6px 14px; font-size: 11px; letter-spacing: 0.08em; border-radius: 3px; }
    .btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.4); }
    .btn-danger { background: transparent; color: #ff4444; border: 1px solid rgba(255,68,68,0.2); padding: 5px 12px; font-size: 10px; border-radius: 3px; }
    .input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e8e8e0; font-family: 'DM Mono', monospace; font-size: 12px; padding: 8px 12px; border-radius: 4px; outline: none; width: 100%; }
    .input:focus { border-color: rgba(255,255,255,0.3); }
    .textarea { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e8e8e0; font-family: 'DM Mono', monospace; font-size: 12px; padding: 10px 12px; border-radius: 4px; outline: none; width: 100%; resize: none; min-height: 100px; overflow: hidden; }
    .textarea:focus { border-color: rgba(255,255,255,0.3); }
    .checkbox-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); cursor: pointer; }
    .checkbox-row:last-child { border-bottom: none; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
    .modal { background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; width: 100%; max-width: 560px; max-height: 85vh; overflow-y: auto; }
    .tag { display: inline-block; font-size: 9px; letter-spacing: 0.15em; padding: 2px 7px; border-radius: 2px; font-family: 'DM Mono', monospace; }
    .tag-green { background: rgba(110,231,183,0.1); color: #6ee7b7; border: 1px solid rgba(110,231,183,0.2); }
    .tag-yellow { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
    .tag-red { background: rgba(255,68,68,0.1); color: #ff6b6b; border: 1px solid rgba(255,68,68,0.2); }
    .tag-blue { background: rgba(96,165,250,0.1); color: #60a5fa; border: 1px solid rgba(96,165,250,0.2); }
    .tag-gray { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.08); }
    select.input option { background: #1a1a1a; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.25s ease; }
    .upload-zone { border: 1px dashed rgba(255,255,255,0.15); border-radius: 6px; padding: 24px; text-align: center; cursor: pointer; transition: border-color 0.2s; display: block; }
    .upload-zone:hover { border-color: rgba(255,255,255,0.4); }
    .img-thumb { position: relative; border-radius: 4px; overflow: hidden; background: #0e0e0e; border: 1px solid rgba(255,255,255,0.07); }
    .img-thumb:hover .img-del { opacity: 1 !important; }
    .img-del { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.8); color: #ff6b6b; border: 1px solid rgba(255,68,68,0.3); border-radius: 3px; font-size: 10px; padding: 2px 7px; cursor: pointer; opacity: 0; transition: opacity 0.15s; font-family: 'DM Mono', monospace; }
    .save-indicator { position: fixed; bottom: 20px; right: 20px; padding: 8px 14px; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.12em; z-index: 200; transition: opacity 0.5s; }
    .save-indicator.saving { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); }
    .save-indicator.saved { background: rgba(110,231,183,0.1); border: 1px solid rgba(110,231,183,0.3); color: #6ee7b7; }
    .save-indicator.error { background: rgba(255,68,68,0.1); border: 1px solid rgba(255,68,68,0.3); color: #ff6b6b; }
    @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    .gate-box { animation: fadeUp 0.4s ease; }
    .gate-shake { animation: shake 0.4s ease !important; }
  `}</style>
);

// ── PASSWORD GATE ──────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [val, setVal] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const tryUnlock = () => {
    if (val === PASSWORD) { onUnlock(); }
    else { setError(true); setShake(true); setTimeout(() => setShake(false), 500); setTimeout(() => setError(false), 2000); }
  };
  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <GlobalStyle />
      <div className={`gate-box${shake ? " gate-shake" : ""}`} style={{ width: "100%", maxWidth: 360, padding: "0 24px", textAlign: "center" }}>
        <img src={LOGO_URL} alt="A?K Universe" style={{ width: 160, filter: "invert(1)", opacity: 0.9, marginBottom: 40 }} />
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)", marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>ACCÈS PRIVÉ</div>
        <input
          autoFocus
          type="password"
          placeholder="Mot de passe..."
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && tryUnlock()}
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? "rgba(255,68,68,0.5)" : "rgba(255,255,255,0.1)"}`, color: "#e8e8e0", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "12px 16px", borderRadius: 4, outline: "none", textAlign: "center", letterSpacing: "0.08em", marginBottom: 12, transition: "border-color 0.2s" }}
        />
        {error && <div style={{ fontSize: 10, color: "#ff6b6b", letterSpacing: "0.12em", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>MOT DE PASSE INCORRECT</div>}
        <button onClick={tryUnlock} style={{ width: "100%", background: "#fff", color: "#080808", border: "none", padding: "11px", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.15em", borderRadius: 4, cursor: "pointer" }}>ENTRER</button>
      </div>
    </div>
  );
}

// ── HELPERS ────────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 15, height: 15, borderRadius: 3, flexShrink: 0, cursor: "pointer", border: `1.5px solid ${checked ? "#e8e8e0" : "rgba(255,255,255,0.2)"}`, background: checked ? "#e8e8e0" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
      {checked && <span style={{ fontSize: 9, color: "#080808", fontWeight: 700 }}>✓</span>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 5, fontFamily: "'DM Mono', monospace" }}>{label}</div>
      {type === "textarea"
        ? <textarea className="textarea" value={value || ""} onChange={e => { onChange(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} onFocus={e => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} />
        : type === "select"
        ? <select className="input" value={value || ""} onChange={e => onChange(e.target.value)} style={{ cursor: "pointer" }}>{options.map(o => <option key={o}>{o}</option>)}</select>
        : <input className="input" type={type} value={value || ""} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

function ImageUpload({ images = [], onChange, label = "DAP — IMAGES" }) {
  const [lightbox, setLightbox] = useState(null);
  const touchStartX = useRef(null);

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = e => onChange([...images, { id: uid(), src: e.target.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || lightbox === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && lightbox < images.length - 1) setLightbox(l => l + 1);
      if (diff < 0 && lightbox > 0) setLightbox(l => l - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>{label}</div>
      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 10 }}>
          {images.map((img, i) => (
            <div key={img.id} className="img-thumb" style={{ aspectRatio: "1" }}>
              <img src={img.src} alt={img.name} onClick={() => setLightbox(i)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", cursor: "zoom-in" }} />
              <button className="img-del" onClick={() => onChange(images.filter(x => x.id !== img.id))}>✕</button>
            </div>
          ))}
        </div>
      )}
      <label className="upload-zone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
        <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono', monospace" }}>+ AJOUTER DES IMAGES</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Glisser-déposer ou cliquer</div>
      </label>
      {lightbox !== null && (
        <div className="modal-overlay" onClick={() => setLightbox(null)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div style={{ position: "relative", maxWidth: "92vw", maxHeight: "92vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }} onClick={e => e.stopPropagation()}>
            <img src={images[lightbox].src} alt="" style={{ maxWidth: "92vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 4 }} />
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button className="btn btn-ghost" onClick={() => setLightbox(l => l - 1)} style={{ opacity: lightbox > 0 ? 1 : 0.2, pointerEvents: lightbox > 0 ? "auto" : "none" }}>‹ PRÉC</button>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}>{lightbox + 1} / {images.length}</span>
              <button className="btn btn-ghost" onClick={() => setLightbox(l => l + 1)} style={{ opacity: lightbox < images.length - 1 ? 1 : 0.2, pointerEvents: lightbox < images.length - 1 ? "auto" : "none" }}>SUIV ›</button>
            </div>
            <button className="btn btn-ghost" onClick={() => setLightbox(null)} style={{ position: "absolute", top: -36, right: 0 }}>✕ FERMER</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: "#fff", letterSpacing: "0.06em", lineHeight: 1 }}>{title}</div>
      {sub && <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>{sub}</div>}
      <div style={{ marginTop: 16, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

// ── TASK MODAL ─────────────────────────────────────────────────────────────
function TaskModal({ task, onSave, onClose, onDelete }) {
  const [t, setT] = useState({ ...task });
  const upd = (k, v) => setT(p => ({ ...p, [k]: v }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace" }}>DÉTAIL TÂCHE</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-danger" onClick={onDelete}>SUPPRIMER</button>
            <button className="btn btn-ghost" onClick={onClose}>ANNULER</button>
            <button className="btn btn-primary" onClick={() => { onSave(t); onClose(); }}>SAUVEGARDER</button>
          </div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <Field label="TITRE" value={t.title} onChange={v => upd("title", v)} />
          <Field label="DATE DE SORTIE" value={t.dateSortie} onChange={v => upd("dateSortie", v)} type="date" />
          <Field label="DAP — NOTES" value={t.dap} onChange={v => upd("dap", v)} type="textarea" />
          <ImageUpload images={t.dapImages || []} onChange={v => upd("dapImages", v)} />
          <Field label="STOCK PRÉVU" value={t.stock} onChange={v => upd("stock", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="SHOOTING ?" value={t.shooting} onChange={v => upd("shooting", v)} type="select" options={["Non", "Oui"]} />
            <Field label="TEASER ?" value={t.teaser} onChange={v => upd("teaser", v)} type="select" options={["Non", "Oui"]} />
          </div>
          {t.shooting === "Oui" && <><Field label="MANNEQUINS" value={t.mannequins} onChange={v => upd("mannequins", v)} /><Field label="PHOTOGRAPHE" value={t.photographe} onChange={v => upd("photographe", v)} /></>}
          {t.teaser === "Oui" && <><Field label="ACTEURS" value={t.acteurs} onChange={v => upd("acteurs", v)} /><Field label="RÉALISATEUR" value={t.realisateur} onChange={v => upd("realisateur", v)} /></>}
          <Field label="NOTES LIBRES" value={t.notes} onChange={v => upd("notes", v)} type="textarea" />
        </div>
      </div>
    </div>
  );
}

// ── TODO SECTION ───────────────────────────────────────────────────────────
function TodoSection({ items, onChange, label }) {
  const [modal, setModal] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const toggle = (id) => onChange(items.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const save = (updated) => onChange(items.map(t => t.id === updated.id ? updated : t));
  const del = (id) => { onChange(items.filter(t => t.id !== id)); setModal(null); };
  const add = () => {
    if (!newTitle.trim()) return;
    onChange([...items, { id: uid(), title: newTitle.trim(), done: false, dap: "", dapImages: [], stock: "", dateSortie: "", shooting: "Non", mannequins: "", photographe: "", teaser: "Non", acteurs: "", realisateur: "", notes: "" }]);
    setNewTitle(""); setAdding(false);
  };
  const done = items.filter(t => t.done).length;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Mono', monospace" }}>{label} <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: 8 }}>{done}/{items.length}</span></div>
        <button className="btn btn-ghost" onClick={() => setAdding(true)}>+ AJOUTER</button>
      </div>
      <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, overflow: "hidden" }}>
        {items.length === 0 && !adding && <div style={{ padding: "16px", fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace", fontStyle: "italic" }}>Aucune tâche</div>}
        {items.map(task => (
          <div key={task.id} className="checkbox-row" style={{ padding: "10px 16px" }}>
            <Checkbox checked={task.done} onChange={() => toggle(task.id)} />
            <span onClick={() => setModal(task)} style={{ flex: 1, fontSize: 12, fontFamily: "'DM Mono', monospace", color: task.done ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)", textDecoration: task.done ? "line-through" : "none", cursor: "pointer" }}>{task.title}</span>
            {task.dateSortie && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace" }}>{task.dateSortie}</span>}
            <span onClick={() => setModal(task)} style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", cursor: "pointer", marginLeft: 8 }}>›</span>
          </div>
        ))}
        {adding && (
          <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8 }}>
            <input autoFocus className="input" placeholder="Titre de la tâche..." value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") add(); if (e.key === "Escape") setAdding(false); }} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={add}>OK</button>
            <button className="btn btn-ghost" onClick={() => setAdding(false)}>✕</button>
          </div>
        )}
      </div>
      {modal && <TaskModal task={modal} onSave={save} onClose={() => setModal(null)} onDelete={() => del(modal.id)} />}
    </div>
  );
}

// ── DROP FORM ──────────────────────────────────────────────────────────────
function DropForm({ drop, onSave }) {
  const [d, setD] = useState({ ...drop });
  const upd = (k, v) => setD(p => ({ ...p, [k]: v }));
  return (
    <div style={{ padding: "20px 24px" }}>
      <Field label="NOM DU DROP" value={d.nom} onChange={v => upd("nom", v)} />
      <Field label="DATE DE SORTIE" value={d.dateSortie} onChange={v => upd("dateSortie", v)} type="date" />
      <Field label="DAP — NOTES" value={d.dap} onChange={v => upd("dap", v)} type="textarea" />
      <ImageUpload images={d.dapImages || []} onChange={v => upd("dapImages", v)} />
      <Field label="STOCK PRÉVU" value={d.stock} onChange={v => upd("stock", v)} />
      <Field label="OBJECTIFS" value={d.objectifs} onChange={v => upd("objectifs", v)} type="textarea" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="SHOOTING ?" value={d.shooting} onChange={v => upd("shooting", v)} type="select" options={["Non", "Oui"]} />
        <Field label="TEASER ?" value={d.teaser} onChange={v => upd("teaser", v)} type="select" options={["Non", "Oui"]} />
      </div>
      {d.shooting === "Oui" && <><Field label="MANNEQUINS" value={d.mannequins} onChange={v => upd("mannequins", v)} /><Field label="PHOTOGRAPHE" value={d.photographe} onChange={v => upd("photographe", v)} /></>}
      {d.teaser === "Oui" && <><Field label="ACTEURS" value={d.acteurs} onChange={v => upd("acteurs", v)} /><Field label="RÉALISATEUR" value={d.realisateur} onChange={v => upd("realisateur", v)} /></>}
      <Field label="NOTES" value={d.notes} onChange={v => upd("notes", v)} type="textarea" />
      <button className="btn btn-primary" style={{ width: "100%", padding: "10px" }} onClick={() => onSave(d)}>SAUVEGARDER</button>
    </div>
  );
}

function DropCard({ drop, onSave, onDelete }) {
  const [modal, setModal] = useState(false);
  return (
    <>
      <div className="card" onClick={() => setModal(true)} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "18px 20px", cursor: "pointer", background: "#0e0e0e" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#fff", letterSpacing: "0.08em", marginBottom: 6 }}>{drop.nom}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {drop.dateSortie && <span className="tag tag-gray">{drop.dateSortie}</span>}
              {drop.shooting === "Oui" && <span className="tag tag-blue">SHOOTING</span>}
              {drop.teaser === "Oui" && <span className="tag tag-yellow">TEASER</span>}
              {drop.stock && <span className="tag tag-gray">STOCK: {drop.stock}</span>}
            </div>
          </div>
          <span style={{ fontSize: 18, color: "rgba(255,255,255,0.15)" }}>›</span>
        </div>
        {drop.objectifs && <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace", lineHeight: 1.6 }}>{drop.objectifs.slice(0, 80)}{drop.objectifs.length > 80 ? "…" : ""}</div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#fff" }}>{drop.nom}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-danger" onClick={() => { onDelete(drop.id); setModal(false); }}>SUPPRIMER</button>
                <button className="btn btn-ghost" onClick={() => setModal(false)}>FERMER</button>
              </div>
            </div>
            <DropForm drop={drop} onSave={(d) => { onSave(d); setModal(false); }} />
          </div>
        </div>
      )}
    </>
  );
}

// ── EVENT PAGE ─────────────────────────────────────────────────────────────
function EventPage({ data, onChange, fields }) {
  return (
    <div style={{ maxWidth: 600 }}>
      {data.description && <div style={{ marginBottom: 24, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", lineHeight: 1.7 }}>{data.description}</div>}
      {fields.map(f => <Field key={f.key} label={f.label} value={data[f.key] || ""} onChange={v => onChange({ ...data, [f.key]: v })} type={f.type || "text"} options={f.options} />)}
    </div>
  );
}

// ── DÉFILÉ 2027 ────────────────────────────────────────────────────────────
function DefileSection({ data, onChange }) {
  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="DATE DU DÉFILÉ" value={data.date} onChange={v => onChange({ ...data, date: v })} type="date" />
        <Field label="LIEU" value={data.lieu} onChange={v => onChange({ ...data, lieu: v })} />
      </div>
      <Field label="THÈME & CONCEPT ARTISTIQUE" value={data.theme} onChange={v => onChange({ ...data, theme: v })} type="textarea" />
      <Field label="NOMBRE DE LOOKS" value={data.looks} onChange={v => onChange({ ...data, looks: v })} />
      <Field label="ORDRE DE PASSAGE & SÉQUENCE" value={data.ordre} onChange={v => onChange({ ...data, ordre: v })} type="textarea" />
      <Field label="SCÉNOGRAPHIE & DÉCOR" value={data.scenographie} onChange={v => onChange({ ...data, scenographie: v })} type="textarea" />
      <Field label="CASTING MANNEQUINS" value={data.casting} onChange={v => onChange({ ...data, casting: v })} type="textarea" />
      <Field label="MUSIQUE & AMBIANCE SONORE" value={data.musique} onChange={v => onChange({ ...data, musique: v })} type="textarea" />
      <Field label="ÉQUIPE (MAQUILLAGE, COIFFURE, STYLISME)" value={data.equipe} onChange={v => onChange({ ...data, equipe: v })} type="textarea" />
      <Field label="BUDGET PRÉVU" value={data.budget} onChange={v => onChange({ ...data, budget: v })} />
      <Field label="INVITATIONS & PRESSE" value={data.invitations} onChange={v => onChange({ ...data, invitations: v })} type="textarea" />
      <Field label="COMMUNICATION & TEASER" value={data.communication} onChange={v => onChange({ ...data, communication: v })} type="textarea" />
      <ImageUpload images={data.images || []} onChange={v => onChange({ ...data, images: v })} label="VISUELS & MOODBOARD" />
      <Field label="NOTES LIBRES" value={data.notes} onChange={v => onChange({ ...data, notes: v })} type="textarea" />
    </div>
  );
}

// ── PSF ────────────────────────────────────────────────────────────────────
function PSFSection({ items, onChange }) {
  const [modal, setModal] = useState(null);
  const addItem = () => {
    const n = { id: uid(), nom: "Nouvelle pièce", dateSortie: "", dap: "", dapImages: [], stock: "", shooting: "Non", mannequins: "", photographe: "", teaser: "Non", acteurs: "", realisateur: "", notes: "" };
    onChange([...items, n]); setModal(n);
  };
  const save = (updated) => onChange(items.map(i => i.id === updated.id ? updated : i));
  const del = (id) => { onChange(items.filter(i => i.id !== id)); setModal(null); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}>{items.length} pièce{items.length > 1 ? "s" : ""}</div>
        <button className="btn btn-ghost" onClick={addItem}>+ NOUVELLE PIÈCE</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {items.map(item => (
          <div key={item.id} className="card" onClick={() => setModal(item)} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "16px", cursor: "pointer", background: "#0e0e0e" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#fff", marginBottom: 8 }}>{item.nom}</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {item.dateSortie && <span className="tag tag-gray">{item.dateSortie}</span>}
              {item.shooting === "Oui" && <span className="tag tag-blue">SHOOTING</span>}
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#fff" }}>{modal.nom}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-danger" onClick={() => del(modal.id)}>SUPPRIMER</button>
                <button className="btn btn-ghost" onClick={() => setModal(null)}>FERMER</button>
              </div>
            </div>
            <DropForm drop={modal} onSave={(d) => { save(d); setModal(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── ARTISTES ───────────────────────────────────────────────────────────────
function ArtistesSection({ items, onChange }) {
  const [modal, setModal] = useState(null);
  const add = () => { const n = { id: uid(), nom: "", typeCollab: "", statut: "Idée", date: "", notes: "", profileImage: null, dapNotes: "", dapImages: [] }; onChange([...items, n]); setModal(n); };
  const save = (a) => { onChange(items.map(i => i.id === a.id ? a : i)); setModal(null); };
  const del = (id) => { onChange(items.filter(i => i.id !== id)); setModal(null); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}>{items.length} artiste{items.length > 1 ? "s" : ""}</div>
        <button className="btn btn-ghost" onClick={add}>+ NOUVEL ARTISTE</button>
      </div>
      <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, overflow: "hidden" }}>
        {items.length === 0 && <div style={{ padding: 16, fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace" }}>Aucun artiste</div>}
        {items.map(a => (
          <div key={a.id} onClick={() => setModal(a)} className="checkbox-row" style={{ padding: "12px 16px" }}>
            {a.profileImage
              ? <img src={a.profileImage} alt={a.nom} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }} />
              : <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "rgba(255,255,255,0.2)", fontFamily: "'Cormorant Garamond', serif" }}>{(a.nom || "?")[0]}</div>
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontFamily: "'Cormorant Garamond', serif", color: "#fff", marginBottom: 3 }}>{a.nom || "—"}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}>{a.typeCollab || "Type non défini"}</div>
            </div>
            {a.date && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace" }}>{a.date}</span>}
            <span className={`tag ${statutTag(a.statut)}`}>{(a.statut || "").toUpperCase()}</span>
          </div>
        ))}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace" }}>FICHE ARTISTE</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-danger" onClick={() => del(modal.id)}>SUPPRIMER</button>
                <button className="btn btn-ghost" onClick={() => setModal(null)}>ANNULER</button>
              </div>
            </div>
            <ArtistForm a={modal} onSave={save} />
          </div>
        </div>
      )}
    </div>
  );
}

function ArtistForm({ a, onSave }) {
  const [d, setD] = useState({ ...a });
  const upd = (k, v) => setD(p => ({ ...p, [k]: v }));

  const handleProfileImage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => upd("profileImage", e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
        <label style={{ cursor: "pointer", flexShrink: 0 }}>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleProfileImage(e.target.files[0])} />
          {d.profileImage
            ? <img src={d.profileImage} alt="profil" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.15)", display: "block" }} />
            : <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 18, color: "rgba(255,255,255,0.2)" }}>+</span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace" }}>PHOTO</span>
              </div>
          }
        </label>
        <div style={{ flex: 1 }}>
          <Field label="NOM DE L'ARTISTE" value={d.nom} onChange={v => upd("nom", v)} />
        </div>
      </div>
      <Field label="TYPE DE COLLABORATION" value={d.typeCollab} onChange={v => upd("typeCollab", v)} />
      <Field label="STATUT" value={d.statut} onChange={v => upd("statut", v)} type="select" options={STATUTS} />
      <Field label="DATE PRÉVUE" value={d.date} onChange={v => upd("date", v)} type="date" />
      <Field label="NOTES LIBRES" value={d.notes} onChange={v => upd("notes", v)} type="textarea" />
      <Field label="DAP — NOTES" value={d.dapNotes} onChange={v => upd("dapNotes", v)} type="textarea" />
      <ImageUpload images={d.dapImages || []} onChange={v => upd("dapImages", v)} label="DAP — IMAGES" />
      <button className="btn btn-primary" style={{ width: "100%", padding: "10px", marginTop: 4 }} onClick={() => onSave(d)}>SAUVEGARDER</button>
    </div>
  );
}

// ── BROUILLONS ─────────────────────────────────────────────────────────────
function BrouillonsSection({ images, onChange }) {
  const [lightbox, setLightbox] = useState(null);
  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = e => onChange(prev => [...prev, { id: uid(), src: e.target.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
  };
  return (
    <div>
      <label className="upload-zone" style={{ marginBottom: 24 }} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
        <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em" }}>+ DÉPOSER DES IMAGES ICI</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>Glisser-déposer ou cliquer · JPG, PNG, WEBP</div>
      </label>
      {images.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", fontSize: 11, color: "rgba(255,255,255,0.15)", fontFamily: "'DM Mono', monospace" }}>Aucun brouillon pour l'instant</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
        {images.map((img, i) => (
          <div key={img.id} className="img-thumb" style={{ minHeight: 140 }}>
            <img src={img.src} alt={img.name} onClick={() => setLightbox(i)} style={{ width: "100%", minHeight: 140, objectFit: "cover", display: "block", cursor: "zoom-in" }} />
            <button className="img-del" onClick={() => onChange(images.filter(x => x.id !== img.id))}>✕</button>
          </div>
        ))}
      </div>
      {lightbox !== null && (
        <div className="modal-overlay" onClick={() => setLightbox(null)}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <img src={images[lightbox].src} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 4 }} />
            <div style={{ position: "absolute", top: -40, right: 0, display: "flex", gap: 8 }}>
              {lightbox > 0 && <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); setLightbox(l => l - 1); }}>‹ PRÉC</button>}
              {lightbox < images.length - 1 && <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); setLightbox(l => l + 1); }}>SUIV ›</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NAV ────────────────────────────────────────────────────────────────────
const NAV = [
  { key: "todoShort", label: "TO-DO COURT TERME", sub: "Tâches urgentes" },
  { key: "todoLong", label: "TO-DO LONG TERME", sub: "Vision & objectifs" },
  { key: "drops", label: "DROPS", sub: "Summer · Janus · Suivant" },
  { key: "pnpn", label: "PNPN", sub: "Rassemblement Genève" },
  { key: "lafripajo", label: "LAFRIPAJO", sub: "Défilé juin" },
  { key: "defile2027", label: "DÉFILÉ A?K 2027", sub: "Grand défilé" },
  { key: "psf", label: "PSF", sub: "Pièces individuelles" },
  { key: "marketing", label: "MARKETING", sub: "Réseaux & expansion" },
  { key: "artistes", label: "COLLABS ARTISTES", sub: "Fiches artistes" },
  { key: "brouillons", label: "BROUILLONS", sub: "Moodboard & DAP libres" },
];

// ── MAIN APP ───────────────────────────────────────────────────────────────
function App() {
  const [data, setData] = useState(initData);
  const [active, setActive] = useState("todoShort");
  const [sideOpen, setSideOpen] = useState(true);
  const [saveState, setSaveState] = useState(null);
  const saveTimer = useRef(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    loadData().then(remote => {
      if (remote && Object.keys(remote).length > 0) setData(remote);
      isFirstLoad.current = false;
    });
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) return;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveData(data).then(ok => {
        setSaveState(ok ? "saved" : "error");
        setTimeout(() => setSaveState(null), ok ? 2000 : 6000);
      });
    }, 1200);
  }, [data]);

  const upd = (k, v) => setData(p => ({ ...p, [k]: v }));

  const renderContent = () => {
    switch (active) {
      case "todoShort": return <div><PageHeader title="TO-DO COURT TERME" sub="Tâches à traiter rapidement" /><TodoSection items={data.todoShort} onChange={v => upd("todoShort", v)} label="TÂCHES EN COURS" /></div>;
      case "todoLong": return <div><PageHeader title="TO-DO LONG TERME" sub="Vision, objectifs et projets futurs" /><TodoSection items={data.todoLong} onChange={v => upd("todoLong", v)} label="OBJECTIFS" /></div>;
      case "drops": return (
        <div>
          <PageHeader title="DROPS" sub="Les 3 prochaines sorties" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.drops.map(drop => (
              <DropCard
                key={drop.id}
                drop={drop}
                onSave={d => upd("drops", data.drops.map(x => x.id === d.id ? d : x))}
                onDelete={id => upd("drops", data.drops.filter(x => x.id !== id))}
              />
            ))}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 14, width: "100%" }} onClick={() => upd("drops", [...data.drops, { id: uid(), nom: "NOUVEAU DROP", dateSortie: "", dap: "", dapImages: [], stock: "", objectifs: "", shooting: "Non", mannequins: "", photographe: "", teaser: "Non", acteurs: "", realisateur: "", notes: "" }])}>+ AJOUTER UN DROP</button>
        </div>
      );
      case "pnpn": return (
        <div><PageHeader title="PNPN" sub="Grand rassemblement créatif — Genève" />
          <EventPage data={data.pnpn} onChange={v => upd("pnpn", v)} fields={[
            { key: "date", label: "DATE DE L'ÉVÉNEMENT", type: "date" },
            { key: "lieu", label: "LIEU / ADRESSE" },
            { key: "budget", label: "BUDGET PRÉVU" },
            { key: "stand", label: "ORGANISATION DU STAND", type: "textarea" },
            { key: "equipe", label: "ÉQUIPE SUR PLACE", type: "textarea" },
            { key: "communication", label: "COMMUNICATION & MARKETING", type: "textarea" },
            { key: "logistique", label: "LOGISTIQUE", type: "textarea" },
            { key: "notes", label: "NOTES LIBRES", type: "textarea" },
          ]} />
        </div>
      );
      case "lafripajo": return (
        <div><PageHeader title="LAFRIPAJO" sub="Défilé — juin" />
          <EventPage data={data.lafripajo} onChange={v => upd("lafripajo", v)} fields={[
            { key: "date", label: "DATE DU DÉFILÉ", type: "date" },
            { key: "lieu", label: "LIEU" },
            { key: "theme", label: "THÈME & CONCEPT", type: "textarea" },
            { key: "casting", label: "CASTING MANNEQUINS", type: "textarea" },
            { key: "musique", label: "MUSIQUE / AMBIANCE", type: "textarea" },
            { key: "budget", label: "BUDGET PRÉVU" },
            { key: "invitations", label: "INVITATIONS & LISTE", type: "textarea" },
            { key: "notes", label: "NOTES LIBRES", type: "textarea" },
          ]} />
        </div>
      );
      case "defile2027": return <div><PageHeader title="DÉFILÉ A?K 2027" sub="Organisation complète du grand défilé" /><DefileSection data={data.defile2027} onChange={v => upd("defile2027", v)} /></div>;
      case "psf": return <div><PageHeader title="PSF" sub="Pièces fashion individuelles" /><PSFSection items={data.psf} onChange={v => upd("psf", v)} /></div>;
      case "marketing": return (
        <div><PageHeader title="MARKETING" sub="Réseaux sociaux & expansion" />
          <div style={{ maxWidth: 600 }}>
            <Field label="STRATÉGIE NATIONALE" value={data.marketing.national} onChange={v => upd("marketing", { ...data.marketing, national: v })} type="textarea" />
            <Field label="STRATÉGIE INTERNATIONALE" value={data.marketing.international} onChange={v => upd("marketing", { ...data.marketing, international: v })} type="textarea" />
            <Field label="RÉSEAUX SOCIAUX — MÉTHODES" value={data.marketing.reseaux} onChange={v => upd("marketing", { ...data.marketing, reseaux: v })} type="textarea" />
            <Field label="TECHNIQUES D'EXPANSION" value={data.marketing.techniques} onChange={v => upd("marketing", { ...data.marketing, techniques: v })} type="textarea" />
            <Field label="NOTES" value={data.marketing.notes} onChange={v => upd("marketing", { ...data.marketing, notes: v })} type="textarea" />
          </div>
        </div>
      );
      case "artistes": return <div><PageHeader title="COLLABS ARTISTES" sub="Fiches de suivi par artiste" /><ArtistesSection items={data.artistes} onChange={v => upd("artistes", v)} /></div>;
      case "brouillons": return (
        <div><PageHeader title="BROUILLONS" sub="Moodboard libre — glisse tes DAP et mock-ups ici" />
          <BrouillonsSection
            images={data.brouillons}
            onChange={v => upd("brouillons", typeof v === "function" ? v(data.brouillons) : v)}
          />
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "#e8e8e0" }}>
      <GlobalStyle />
      <div style={{ width: sideOpen ? 220 : 0, minHeight: "100vh", background: "#0b0b0b", borderRight: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", transition: "width 0.25s ease", flexShrink: 0 }}>
        <div style={{ width: 220 }}>
          <div style={{ padding: "20px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={LOGO_URL} alt="A?K Universe" style={{ width: 140, filter: "invert(1)", opacity: 0.92 }} />
          </div>
          <nav style={{ padding: "12px 0" }}>
            {NAV.map(item => (
              <div key={item.key} className={`nav-item ${active === item.key ? "active" : ""}`} onClick={() => setActive(item.key)} style={{ padding: "10px 20px", color: active === item.key ? "#fff" : "rgba(255,255,255,0.35)", paddingLeft: active === item.key ? 19 : 20 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace", marginBottom: 1 }}>{item.label}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace" }}>{item.sub}</div>
              </div>
            ))}
          </nav>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ height: 52, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 28px", gap: 16, flexShrink: 0 }}>
          <button className="btn btn-ghost" onClick={() => setSideOpen(p => !p)} style={{ fontSize: 14, padding: "5px 10px" }}>☰</button>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace" }}>{NAV.find(n => n.key === active)?.label}</div>
        </div>
        <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }} className="fade-in" key={active}>
          {renderContent()}
        </div>
      </div>
      {saveState && (
        <div className={`save-indicator ${saveState}`}>
          {saveState === "saving" ? "⏳ SAUVEGARDE…" : saveState === "error" ? "✗ ERREUR — NON SAUVEGARDÉ" : "✓ SAUVEGARDÉ"}
        </div>
      )}
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────
export default function AppWithAuth() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  return <App />;
}
