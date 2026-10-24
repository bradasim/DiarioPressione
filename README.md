# 🩺 Diario Pressione Arteriosa

Applicazione web client-side moderna, autonoma e orientata alla privacy per il monitoraggio e la gestione del diario della pressione arteriosa, con supporto per **doppia misurazione giornaliera**, calcolo automatico della media, grafici interattivi e motore database **SQLite compilato in WebAssembly (Wasm)**.

---

## 📋 Indice

- [Caratteristiche Principali](#-caratteristiche-principali)
- [Classificazione Clinica (Linee Guida ESC/ESH)](#-classificazione-clinica-linee-guida-escesh)
- [Stack Tecnologico](#-stack-tecnologico)
- [Architettura & Schema Database SQLite](#-architettura--schema-database-sqlite)
- [Avvio Rapido](#-avvio-rapido)
- [Guida all'Uso](#-guida-alluso)
- [Importazione, Esportazione & Backup](#-importazione-esportazione--backup)
- [Privacy e Sicurezza](#-privacy-e-sicurezza)
- [Note & Disclaimer](#-note--disclaimer)

---

## ✨ Caratteristiche Principali

- **Doppia Misurazione per Sessione**:
  - Supporto per la procedura standard di misurazione raccomandata in cardiologia (1ª misurazione obbligatoria, 2ª misurazione opzionale a distanza di qualche minuto).
  - Calcolo automatico in tempo reale della media (Sistolica, Diastolica e Frequenza Cardiaca / BPM) se sono presenti entrambe le rilevazioni.
- **Slot Giornalieri Standardizzati**:
  - 🌅 **Mattino** (06:30)
  - ☀️ **Pranzo** (12:30)
  - 🌙 **Cena** (19:00)
  - ⏱️ **Altro orario personalizzato** con selettore orario libero.
- **KPI Dashboard**:
  - Card riassuntive che mostrano istantaneamente la Media Massima (mmHg), la Media Minima (mmHg), la Frequenza Cardiaca Media (bpm) e il totale delle misurazioni registrate.
- **Grafico Dinamico Interattivo (Chart.js)**:
  - Visualizzazione visiva dell'andamento temporale delle medie pressorie.
  - Linee distinte per Pressione Sistolica (MAX), Diastolica (MIN) e Battiti (BPM).
  - Filtro rapido per fascia oraria: *Tutti*, *Mattino*, *Pranzo*, *Cena*.
- **Registro Storico & Ricerca**:
  - Tabella completa con indicazione di data, momento della giornata, valori della 1ª e 2ª misurazione, media risultante, badge di categoria pressoria e note cliniche.
  - Campo di ricerca dinamica istantanea per data, slot o annotazioni.
  - Funzioni complete di modifica (Edit) e rimozione (Delete) dei singoli record.
- **Selezione Multipla & Cancellazione in Blocco**:
  - Checkbox per ogni riga e checkbox master "Seleziona tutti" con gestione dello stato indeterminato.
  - Barra d'azione contestuale che indica il numero di record selezionati con pulsante rapido per selezionare l'intero database.
  - Cancellazione massiva sicura con finestra di conferma e ricalcolo immediato di grafici e indicatori KPI.
- **Importazione Intelligente con Sovrascrittura**:
  - Pulsante **"Importa .sqlite"** per caricare un database SQLite esistente.
  - **Regola di unione automatica**: se nel file importato sono presenti misurazioni con le stesse date di calendario e fasce orarie, i vecchi valori vengono automaticamente sovrascritti, mentre le nuove rilevazioni vengono inserite.
- **Dati Iniziali (Seed Quaderno)**:
  - Precaricato con i dati storici rilevati dal quaderno (sessioni del 21-23 Aprile).
  - Pulsante dedicato per ripristinare in qualsiasi momento il dataset iniziale.
- **Architettura Zero-Server**:
  - Esecuzione 100% nel browser senza dipendenze backend o configurazioni complesse.

---

## 🩺 Classificazione Clinica (Linee Guida ESC/ESH)

L'applicazione classifica automaticamente le misurazioni in base ai criteri delle linee guida della Società Europea di Cardiologia / Ipertensione (**ESC/ESH**):

| Categoria | Sistolica (MAX) mmHg | Diastolica (MIN) mmHg | Colore Badge |
| :--- | :---: | :---: | :--- |
| **Ottimale** | < 120 | < 80 | Verde smeraldo |
| **Normale** | 120 – 129 | 80 – 84 | Verde acqua / Teal |
| **Normale-Alta** | 130 – 139 | 85 – 89 | Ambra / Giallo |
| **Ipertensione Grado 1** | 140 – 159 | 90 – 99 | Arancione |
| **Ipertensione Grado 2+** | ≥ 160 | ≥ 100 | Rosso corallo |

---

## 🛠️ Stack Tecnologico

- **Frontend & Logica**: HTML5 semantico, CSS3, JavaScript Vanilla (ES6+ moderno).
- **Stile & Design**: [Tailwind CSS](https://tailwindcss.com/) (tramite CDN) con tema dark rifinito, tipografia con font [Inter](https://fonts.google.com/specimen/Inter) e icone [FontAwesome 6](https://fontawesome.com/).
- **Visualizzazione Dati**: [Chart.js](https://www.chartjs.org/) per il rendering canvas reattivo e fluido dei grafici.
- **Motore Dati**: [SQL.js](https://sql.js.org/) (SQLite compilato in **WebAssembly / Wasm**).
- **Persistenza**: `localStorage` del browser, con sincronizzazione dello stato binario del database SQLite codificato in Base64.

---

## 🗄️ Architettura & Schema Database SQLite

L'applicazione non simula un database: esegue un vero motore **SQLite 3** direttamente nella sandbox WebAssembly del browser.

### Schema della Tabella `misurazioni`

```sql
CREATE TABLE misurazioni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,         -- Data in formato ISO: 'AAAA-MM-GG'
    slot TEXT NOT NULL,         -- Momento: 'mattino', 'pranzo', 'cena', 'altro'
    ora TEXT,                   -- Orario: es. '06:30', '12:30', '19:00'
    max_1 INTEGER NOT NULL,     -- 1ª Pressione Sistolica (mmHg)
    min_1 INTEGER NOT NULL,     -- 1ª Pressione Diastolica (mmHg)
    bat_1 INTEGER NOT NULL,     -- 1ª Frequenza Cardiaca (bpm)
    max_2 INTEGER,              -- 2ª Pressione Sistolica (opzionale)
    min_2 INTEGER,              -- 2ª Pressione Diastolica (opzionale)
    bat_2 INTEGER,              -- 2ª Frequenza Cardiaca (opzionale)
    note TEXT                   -- Eventuali note, sintomi o contesto
);
```

Ad ogni aggiunta, modifica o eliminazione, l'array binario di SQLite viene esportato e salvato in `localStorage`, assicurando la conservazione dei dati tra le sessioni del browser.

---

## 🚀 Avvio Rapido

Non è richiesta alcuna compilazione (`npm`, `pip`, o simili) né installazione di pacchetti:

### Metodo 1: Apertura Diretta nel Browser
Fai doppio click sul file [`Index.html`](file:///d:/Python/DiarioPressione/Index.html) o aprilo con qualsiasi browser moderno (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari, Brave).

### Metodo 2: Tramite Server Locale (Consigliato)
Se desideri servirlo tramite un server locale:

**Con Python:**
```bash
# Da PowerShell o terminale nella cartella del progetto:
python -m http.server 8000
```
Apri poi il browser su `http://localhost:8000/Index.html`.

**Con Node.js (npx serve):**
```bash
npx serve .
```

**Con estensione VS Code:**
- Clicca con il tasto destro su `Index.html` e seleziona **"Open with Live Server"**.

---

## 📖 Guida all'Uso

1. **Aggiunta Misurazione**:
   - Clicca sul pulsante **"+ Nuova Misurazione"** in alto a destra.
   - Scegli la **data** e il **momento della giornata** (*Mattino*, *Pranzo*, *Cena* o *Altro*).
   - Inserisci la prima misurazione obbligatoria (MAX, MIN, Pulsazioni).
   - Inserisci la seconda misurazione opzionale se effettuata.
   - Il box in basso calcolerà e mostrerà immediatamente l'anteprima della media risultante e la categoria clinica.
   - Clicca su **"Salva nel Database"**.
2. **Consultazione & Ricerca**:
   - Scorri la tabella per vedere lo storico ordinato con le date più recenti in cima.
   - Usa la casella **"Cerca data o slot..."** per filtrare rapidamente i record.
3. **Modifica ed Eliminazione Singola**:
   - Usa l'icona della matita per modificare i valori o aggiungere la seconda rilevazione a posteriori.
   - Usa l'icona del cestino per eliminare un record (con finestra di conferma).
4. **Selezione Multipla ed Eliminazione in Blocco**:
   - Seleziona le caselle di spunta (checkbox) sui singoli record desiderati, oppure clicca sulla casella master in cima alla colonna per selezionare/deselezionare tutti i record visibili.
   - Nella barra azzurra che compare in alto, puoi anche cliccare su *"Seleziona tutte le X misurazioni del database"* per selezionare l'intero archivio in un colpo solo.
   - Clicca su **"Elimina selezionati"** per aprire il modale di conferma ed eliminare contemporaneamente tutti i record selezionati.
5. **Analisi del Grafico**:
   - Clicca sui pulsanti di filtro (*Tutti*, *Mattino*, *Pranzo*, *Cena*) per isolare il trend nei diversi momenti della giornata.

---

## 💾 Importazione, Esportazione & Backup

In alto nell'intestazione sono disponibili gli strumenti per la gestione e la migrazione dei dati:

1. **Importa `.sqlite`**:
   - Seleziona un file `.sqlite` o `.db` precedentemente esportato o generato altrove.
   - **Logica di merge con sovrascrittura**: se il file importato contiene misurazioni corrispondenti alla medesima data e fascia oraria (es. mattina del 21 Aprile), i vecchi valori nel database locale vengono aggiornati/sovrascritti con i nuovi valori importati. Le misurazioni per date o momenti non ancora presenti vengono inserite regolarmente.
2. **Esporta `.sqlite`**:
   - Scarica il file binario SQLite reale (es. `pressione_arteriosa_2026-10-24.sqlite`).
   - Questo file può essere aperto e interrogato con strumenti SQL professionali come **DB Browser for SQLite**, **DBeaver**, o analizzato in Python tramite la libreria standard `sqlite3` o `pandas`:
     ```python
     import sqlite3
     import pandas as pd

     conn = sqlite3.connect("pressione_arteriosa_2026-10-24.sqlite")
     df = pd.read_sql_query("SELECT * FROM misurazioni", conn)
     print(df.head())
     ```
3. **Esporta CSV**:
   - Genera un file `.csv` formattato, comprensivo di medie calcolate, pronto per essere importato in **Microsoft Excel**, **Google Fogli** o inviato al proprio medico curante.

---

## 🔒 Privacy e Sicurezza

- **100% Locale**: Nessun dato personale o sanitario viene inviato a server esterni o cloud.
- **Zero Tracciamento**: Non vengono utilizzati cookie analitici o script di profilazione.
- **Portabilità Totale**: I dati possono essere salvati e trasferiti in qualsiasi momento esportando il file `.sqlite`.

---

## ⚠️ Note & Disclaimer

> **Avvertenza Medica**: Questa applicazione è uno strumento di supporto personale per l'annotazione e il monitoraggio dei valori pressori. Non sostituisce il parere del medico, diagnosi cliniche o terapie farmacologiche. Per qualsiasi anomalia o valutazione dello stato di salute, fare sempre riferimento al proprio medico curante o a uno specialista.
