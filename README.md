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
- **Filtro Temporale Globale**:
  - Selettore rapido di periodo (*Tutto*, *Ultimi 7 gg*, *Ultimi 30 gg*, *Ultimi 3 mesi*, *Personalizzato Da/A*) posizionato in cima alla schermata.
  - Sincronizza istantaneamente e congiuntamente i KPI, il Grafico, la Tabella e l'Esportazione PDF su quel preciso intervallo temporale.
- **Condividi a 1-Click (Web Share API su Mobile / WhatsApp / Telegram)**:
  - Pulsante dedicato **"Condividi"** con icona classica a 3 nodi (`fa-share-nodes`).
  - Su smartphone Android e iOS apre direttamente il foglio nativo di condivisione di sistema, consentendo l'invio immediato del file PDF del referto tramite WhatsApp, Telegram, Gmail, Bluetooth o salvataggio su Drive/File.
  - Su PC o browser desktop, effettua il fallback automatico aprendo o scaricando il PDF con notifica guidata.
- **Profilo Paziente, Biometria & Dati Referto (Menu Ingranaggio ⚙️)**:
  - Finestra di configurazione accessibile dall'icona dell'ingranaggio nell'intestazione.
  - Permette di salvare nel database SQLite: **Nome**, **Cognome**, **Genere / Sesso** (*Uomo*, *Donna*, *Non specificato*), **Data di Nascita**, **Peso (kg)**, **Altezza (cm)** e **Note Cliniche / Terapia**.
  - Calcola automaticamente in tempo reale l'età del paziente e l'indice di massa corporea (**BMI** con classificazione clinica ESC/OMS: *Sottopeso*, *Normopeso*, *Sovrappeso*, *Obesità*).
  - Include i dati anagrafici, il sesso (M/F con desinenza dedicata *Nato/a il*) e i parametri biometrici nell'intestazione clinica del referto PDF (esportato o condiviso) e nei prompt per l'analisi con Intelligenza Artificiale.
  - Personalizza automaticamente il nome del file generato (es. `referto_pressione_rossi_AAAA-MM-GG.pdf`) e visualizza il nome del paziente attivo direttamente nell'intestazione.
- **Integrazione con Intelligenza Artificiale (Menu Avanzato)**:
  - **"Chiedi a Gemini" (1-Click Diretto)**: opzione rapida con badge *1-Click*. Genera il prompt clinico anonimizzato, lo copia istantaneamente negli appunti del dispositivo e apre direttamente l'app nativa Gemini (su Android) o Gemini Web (su PC), saltando qualsiasi passaggio intermedio.
  - **"Chiedi ad AI" (con Modale)**: apre la finestra di supporto con l'anteprima completa del testo clinico specialistico in formato **Markdown** (suddiviso per ritmo circadiano, correlazione con i battiti e tabella dettagliata delle rilevazioni). Permette di ricopiare il prompt o riselezionarlo per l'incollo in qualsiasi altra IA (come ChatGPT o Claude), oppure di cliccare sul pulsante principale *"Chiedi a Gemini"*.
  - **Massima Riservatezza & Anonimato**: per tutelare la privacy dell'utente nei confronti dei modelli di intelligenza artificiale, **il nome e il cognome del paziente NON vengono mai inclusi nel prompt**, inviando unicamente l'età biologica calcolata e l'eventuale terapia farmacologica indicata.
  - **Funzionamento Universale anche su Rete Locale (HTTP LAN)**: include un meccanismo sincrono di copia a prova di bomba che memorizza automaticamente il prompt negli appunti sia su desktop che su smartphone collegati via Wi-Fi (`http://192.168.x.x`).
- **Menu a Tendina "Avanzato"**:
  - Raggruppa in un unico menu a scomparsa pulito le opzioni: *Chiedi a Gemini (1-Click)*, *Chiedi ad AI*, *Esporta Referto PDF*, *Esporta .sqlite*, *Esporta CSV*, *Importa .sqlite* e *Ripristina Dati Quaderno*, mantenendo la barra superiore snella e ordinata.
- **Referto Clinico PDF a 1-Click (Modulo Separato `pdf-report.js`)**:
  - Pulsante **"Esporta PDF"** che genera e scarica direttamente un referto formattato in formato A4 ad alta risoluzione ma leggero (~40-60 KB).
  - Include: testata clinica con dati anagrafici paziente ed età, intervallo temporale, card statistiche/KPI con classificazione ESC/ESH, immagine compressa del grafico su fondo bianco e tabella dettagliata di tutte le misurazioni con note.
  - Codice isolato nel modulo autonomo [`pdf-report.js`](file:///d:/Python/DiarioPressione/pdf-report.js).
- **Filtro Temporale Globale**:
  - Selettore rapido di periodo (*Tutto*, *Ultimi 7 gg*, *Ultimi 30 gg*, *Ultimi 3 mesi*, *Personalizzato Da/A*) posizionato in cima alla schermata.
  - Sincronizza istantaneamente e congiuntamente i KPI, il Grafico, la Tabella e l'Esportazione/Condivisione PDF sul periodo prescelto.
- **Selezione Multipla & Cancellazione in Blocco**:
  - Checkbox per ogni riga e checkbox master "Seleziona tutti" con gestione dello stato indeterminato.
  - Barra d'azione contestuale che indica il numero di record selezionati con pulsante rapido per selezionare l'intero database.
  - Cancellazione massiva sicura con finestra di conferma e ricalcolo immediato di grafici e indicatori KPI.
- **Importazione Intelligente con Sovrascrittura**:
  - Voce **"Importa Database .sqlite"** nel menu Avanzato per caricare un database SQLite esistente.
  - **Regola di unione automatica**: se nel file importato sono presenti misurazioni con le stesse date di calendario e fasce orarie, i vecchi valori vengono automaticamente sovrascritti, mentre le nuove rilevazioni vengono inserite. Se presente, importa anche il profilo anagrafico del paziente.
- **Dati Iniziali (Seed Quaderno)**:
  - Precaricato con i dati storici rilevati dal quaderno (sessioni del 21-23 Aprile).
  - Opzione nel menu Avanzato per ripristinare in qualsiasi momento il dataset iniziale senza cancellare il profilo utente.
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
- **Modulo PDF Dedicato**: [`pdf-report.js`](file:///d:/Python/DiarioPressione/pdf-report.js) basato su [jsPDF](https://github.com/parallax/jsPDF) e [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable).
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

### Schema della Tabella `profilo_utente`

```sql
CREATE TABLE profilo_utente (
    id INTEGER PRIMARY KEY CHECK (id = 1),  -- Singolo profilo paziente
    nome TEXT,                              -- Nome del paziente
    cognome TEXT,                           -- Cognome del paziente
    genere TEXT,                            -- 'uomo', 'donna' o 'non_specificato'
    data_nascita TEXT,                      -- Data di nascita ISO 'AAAA-MM-GG'
    peso REAL,                              -- Peso corporeo in kg (es. 75.5)
    altezza REAL,                           -- Altezza in cm (es. 175)
    note TEXT,                              -- Terapia farmacologica o note
    updated_at TEXT                         -- Timestamp ultimo aggiornamento
);
```

Ad ogni aggiunta, modifica o salvataggio del profilo, l'array binario di SQLite viene esportato e salvato in `localStorage`, assicurando la conservazione sia delle rilevazioni pressorie che delle informazioni anagrafiche tra le sessioni del browser.

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
4. **Esporta Referto PDF**:
   - Genera istantaneamente il documento PDF `referto_pressione_AAAA-MM-GG.pdf` strutturato su misura per la consultazione medica (impaginazione A4, sfondo bianco a risparmio inchiostro, testata clinica con intervallo di date, sintesi statistiche, grafico e tabella analitica).

---

## 📱 Utilizzo su Dispositivi Mobili (Android / iOS)

L'applicazione è completamente responsive e compatibile con i browser mobili (Chrome, Edge, Samsung Internet, Firefox):
- **Visualizzazione e Inserimento**: l'interfaccia si adatta a smartphone e tablet.
- **Download PDF & Database**: su Android il file PDF viene salvato direttamente nella cartella *Download* e può essere aperto con Google Drive / Adobe Viewer o inviato via WhatsApp/Email al medico.
- **Consiglio d'uso**: se utilizzata da mobile, è consigliabile servirla tramite server locale Wi-Fi (es. `python -m http.server 8000`) o hostarla su un servizio gratuito di pagine statiche (come GitHub Pages) per evitare che i blocchi di sicurezza del protocollo locale `file:///` sui browser Android impediscano il salvataggio dei file scaricati.

---

## 🔒 Privacy e Sicurezza

- **100% Locale**: Nessun dato personale o sanitario viene inviato a server esterni o cloud.
- **Zero Tracciamento**: Non vengono utilizzati cookie analitici o script di profilazione.
- **Portabilità Totale**: I dati possono essere salvati e trasferiti in qualsiasi momento esportando il file `.sqlite`.

---

## ⚠️ Note & Disclaimer

> **Avvertenza Medica**: Questa applicazione è uno strumento di supporto personale per l'annotazione e il monitoraggio dei valori pressori. Non sostituisce il parere del medico, diagnosi cliniche o terapie farmacologiche. Per qualsiasi anomalia o valutazione dello stato di salute, fare sempre riferimento al proprio medico curante o a uno specialista.
