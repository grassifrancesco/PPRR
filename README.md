# 🧩 PPRR — Project Planning and Review Room

PPRR è una web app leggera per la gestione di task e issue in stile **Kanban**, sviluppata in **HTML, CSS e JavaScript puro**.  
L’obiettivo è fornire un ambiente locale e immediato per la pianificazione, il tracciamento e la revisione delle attività di un progetto, con persistenza automatica nel browser tramite `localStorage`.

---

## 🚀 Funzionalità principali

- **Gestione Kanban**: quattro colonne (Backlog, In Progress, Review, Done) per organizzare i task.
- **Creazione e modifica issue**: interfaccia modale per inserire titolo, descrizione, priorità, assegnatario e colonna iniziale.
- **Drag & Drop**: trascina le card tra le colonne per aggiornare rapidamente lo stato delle issue.
- **Ricerca in tempo reale**: filtro immediato per titolo, descrizione o assegnatario.
- **Persistenza locale**: tutti i dati vengono salvati in `localStorage`, senza necessità di backend.
- **Interfaccia accessibile**: supporto per tastiera, aria-label, focus management e struttura semantica.
- **Menu contestuale per lo spostamento rapido**: consente di cambiare colonna senza trascinamento.

---
## 📂 Struttura del progetto

```bash
PPRR/
│
├── index.html      # Interfaccia principale e struttura del layout
├── style.css       # Stili per la board Kanban e il modal
├── script.js       # Logica applicativa, gestione stato e interazioni
└── README.md       # Documentazione del progetto

```

---

## ⚙️ Analisi dei requisiti

### ✅ Requisiti funzionali

| ID | Descrizione | Priorità |
|----|--------------|----------|
| RF1 | L’utente deve poter creare una nuova issue tramite form. | Alta |
| RF2 | Ogni issue deve contenere: titolo, descrizione, priorità, assegnatario e stato. | Alta |
| RF3 | L’utente deve poter modificare o eliminare una issue esistente. | Alta |
| RF4 | Le issue devono poter essere spostate tra le colonne tramite drag & drop o menu rapido. | Alta |
| RF5 | L’app deve mostrare il conteggio delle issue per colonna. | Media |
| RF6 | L’utente deve poter cercare issue tramite parole chiave. | Media |
| RF7 | I dati devono persistere tra le sessioni grazie al localStorage. | Alta |
| RF8 | L’interfaccia deve aggiornarsi dinamicamente senza ricaricare la pagina. | Alta |
| RF9 | L’utente deve poter annullare la creazione o la modifica di una issue. | Media |
| RF10 | Il sistema deve essere utilizzabile anche tramite tastiera. | Media |

---

### ⚡ Requisiti non funzionali

| Categoria | Requisito | Descrizione |
|------------|------------|-------------|
| **Usabilità** | Interfaccia semplice e intuitiva | L’utente deve poter interagire facilmente senza training. |
| **Accessibilità** | ARIA e navigazione da tastiera | Il sistema deve essere accessibile anche con ausili. |
| **Affidabilità** | Persistenza locale | I dati devono restare memorizzati in caso di refresh o chiusura del browser. |
| **Portabilità** | Compatibilità cross-browser | L’app deve funzionare su Chrome, Firefox, Edge e Safari. |
| **Manutenibilità** | Codice modulare e commentato | Il codice JS è strutturato in sezioni e funzioni riutilizzabili. |
| **Prestazioni** | Reattività | Le operazioni devono avvenire in tempo reale senza lag. |
| **Sicurezza** | Isolamento locale | Nessun dato viene trasmesso in rete o salvato su server. |

---

## 🧠 Architettura e logica di funzionamento

- **Frontend only**: tutto il codice è eseguito lato client.
- **Gestione stato**: array `tasks` in memoria sincronizzato con `localStorage`.
- **Rendering dinamico**: la funzione `render()` rigenera la board a ogni modifica.
- **Accessibilità**: ARIA roles, focus management e shortcut da tastiera.
- **Persistenza automatica**: ogni modifica chiama la funzione `save()`.

---

## 🧩 Tecnologie utilizzate

- **HTML5** per la struttura semantica.
- **CSS3** per lo stile responsive e accessibile.
- **Vanilla JavaScript (ES6)** per la logica di gestione, eventi e persistenza.

---

## 🧱 Possibili estensioni future

- Integrazione con backend REST per sincronizzazione multiutente.
- Supporto autenticazione e ruoli.
- Drag & drop migliorato con animazioni.
- Filtri avanzati per priorità e assegnatario.
- Esportazione/importazione JSON delle issue.

---

## 🧑‍💻 Autore

**Progetto:** PPRR  
**Versione:** 1.0  
**Linguaggio:** HTML, CSS, JS  
**Team del progetto:** Gelatti Gabriele (Project Manager), Grassi Francesco, Wang Cristiano

---

> “PPRR semplifica la pianificazione: un piccolo Kanban, grande produttività.”
