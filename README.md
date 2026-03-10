# 💍 Protocole Mariage — Guide d'installation complet

## Structure du projet

```
wedding-app/
├── public/
│   └── manifest.json         ← PWA manifest
├── src/
│   ├── main.jsx              ← Point d'entrée React
│   ├── App.jsx               ← Composant principal + navigation
│   ├── firebase.js           ← ⚠️ Config Firebase (à remplir)
│   ├── useWeddingData.js     ← Hook Firebase (données temps réel)
│   ├── theme.js              ← Couleurs & polices
│   ├── CameraScanner.jsx     ← Scanner QR caméra
│   ├── TabPlan.jsx           ← Onglet Plan de table
│   ├── TabScanner.jsx        ← Onglet Scanner billets
│   ├── TabBudget.jsx         ← Onglet Budget (éditable)
│   └── TabProgramme.jsx      ← Onglet Programme
├── index.html
├── package.json
└── vite.config.js
```

---

## ÉTAPE 1 — Créer le projet Firebase (gratuit)

1. Va sur https://console.firebase.google.com
2. Clique **"Créer un projet"**
3. Nom : `wedding-protocole` → Continue
4. Désactive Google Analytics (optionnel) → Créer

### Activer Firestore
1. Dans le menu gauche → **Firestore Database**
2. Clique **"Créer une base de données"**
3. Choisis **"Commencer en mode test"** (permet tout pendant 30 jours)
4. Choisis la région la plus proche (ex: `europe-west1`)

### Obtenir la config
1. Dans Firebase → ⚙️ Paramètres du projet
2. Section **"Vos applications"** → clique l'icône **Web** `</>`
3. Nom de l'app : `wedding-web` → Enregistrer
4. Copie le bloc `firebaseConfig`

---

## ÉTAPE 2 — Remplir src/firebase.js

Remplace les valeurs dans `src/firebase.js` :

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",        // ← ta vraie clé
  authDomain:        "wedding-xxx.firebaseapp.com",
  projectId:         "wedding-xxx",
  storageBucket:     "wedding-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc123",
};
```

---

## ÉTAPE 3 — Installer et lancer

```bash
# Dans le dossier du projet
npm install

# Lancer en développement
npm run dev
# → Ouvre http://localhost:5173
```

Au 1er lancement, Firebase insère automatiquement les tables, le budget
et le programme par défaut. Ensuite tout est persisté et synchronisé.

---

## ÉTAPE 4 — Règles Firestore (production)

Une fois prêt pour la production, remplace les règles dans Firebase :
**Firestore → Règles** :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pour une équipe interne (pas d'authentification)
    match /{document=**} {
      allow read, write: if true;  // ← pendant le mariage
    }
  }
}
```

---

## ÉTAPE 5 — Build & Déploiement

```bash
npm run build
# → Génère le dossier dist/
```

### Option A — Netlify (recommandé)
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### Option B — Vercel
```bash
npm install -g vercel
vercel --prod
```

---

## ÉTAPE 6 — Installer sur téléphone (PWA)

Une fois l'URL disponible (ex: `https://wedding-xxx.netlify.app`) :

**Android (Chrome)** :
→ Menu ⋮ → "Ajouter à l'écran d'accueil"

**iPhone (Safari)** :
→ Bouton Partager ↑ → "Sur l'écran d'accueil"

---

## Mises à jour automatiques

```bash
# Pour chaque mise à jour :
git add .
git commit -m "description du changement"
git push
# → Netlify/Vercel redéploie automatiquement en 1-2 min
# → Tous les téléphones voient la nouvelle version au prochain chargement
```

---

## Ce que Firebase stocke

| Collection   | Contenu                                      |
|--------------|----------------------------------------------|
| `guests`     | Invités (nom, catégorie, table, RSVP, billet)|
| `tables`     | Tables (nom, capacité, position X/Y, couleur)|
| `budget`     | Postes budgétaires (label, prévu, dépensé)   |
| `programme`  | Étapes de la journée (heure, label, fait)    |
| `scans`      | Historique des billets scannés               |

Toutes les collections sont **synchronisées en temps réel** entre tous
les appareils connectés simultanément.

---

## Icônes PWA

Génère `icon-192.png` et `icon-512.png` sur https://favicon.io
et place-les dans le dossier `public/`.
