export const seedProjects = [
  {
    id: "PRJ-1001",
    name: "Residenza Navigli",
    type: "Residenziale",
    city: "Milano",
    progress: 62,
    status: "In corso",
    start: "12 gen 2026",
    end: "30 set 2026",
    budget: 485000,
    pm: "Marco Bianchi",
  },
  {
    id: "PRJ-1002",
    name: "Appartamento Brera",
    type: "Ristrutturazione",
    city: "Milano",
    progress: 88,
    status: "In corso",
    start: "03 mar 2026",
    end: "15 dic 2026",
    budget: 126000,
    pm: "Laura Conti",
  },
  {
    id: "PRJ-1003",
    name: "Villa Lago di Como",
    type: "Nuova costruzione",
    city: "Como",
    progress: 34,
    status: "In corso",
    start: "20 feb 2026",
    end: "28 feb 2027",
    budget: 920000,
    pm: "Marco Bianchi",
  },
  {
    id: "PRJ-1004",
    name: "Uffici Porta Nuova",
    type: "Fit-out",
    city: "Milano",
    progress: 100,
    status: "Completato",
    start: "01 set 2025",
    end: "18 apr 2026",
    budget: 210000,
    pm: "Elena Rossi",
  },
];

export const seedTasks = [
  { id: "T-201", title: "Getto solaio piano 2", project: "PRJ-1001", assignee: "Squadra A", due: "21 nov 2026", status: "In corso", pri: "Alta" },
  { id: "T-202", title: "Posa impianto elettrico bagno", project: "PRJ-1002", assignee: "Impianti SRL", due: "22 nov 2026", status: "Aperto", pri: "Media" },
  { id: "T-203", title: "Ordine serramenti", project: "PRJ-1003", assignee: "Ufficio acquisti", due: "25 nov 2026", status: "Aperto", pri: "Alta" },
  { id: "T-204", title: "Collaudo impianti", project: "PRJ-1004", assignee: "CQ", due: "10 apr 2026", status: "Completato", pri: "Media" },
  { id: "T-205", title: "Intonaci interni",
    project: "PRJ-1001", assignee: "Squadra B", due: "28 nov 2026", status: "Aperto", pri: "Bassa" },
  { id: "T-206", title: "Verifica CAP cantiere", project: "PRJ-1001", assignee: "RSPP", due: "20 nov 2026", status: "In corso", pri: "Alta" },
];

export const seedQuality = [
  { id: "Q-11", title: "Ispezione fondazioni", project: "PRJ-1003", result: "Conforme", date: "18 nov 2026", inspector: "Ing. Verdi" },
  { id: "Q-12", title: "Controllo getto solaio", project: "PRJ-1001", result: "Non conformità minore", date: "19 nov 2026", inspector: "CQ Interno" },
  { id: "Q-13", title: "Collaudo impianti elettrici", project: "PRJ-1002", result: "In attesa", date: "24 nov 2026", inspector: "TecnoCert" },
  { id: "Q-14", title: "Verifica impermeabilizzazione", project: "PRJ-1003", result: "Conforme", date: "12 nov 2026", inspector: "Ing. Verdi" },
];

export const seedSafety = [
  { id: "S-01", title: "Cavi esposti zona materiale", project: "PRJ-1001", severity: "Alta", status: "Aperto", reported: "19 nov 2026", by: "RSPP" },
  { id: "S-02", title: "Mancanza DPI su ponteggi", project: "PRJ-1003", severity: "Media", status: "In corso", reported: "17 nov 2026", by: "Preposto" },
  { id: "S-03", title: "Formazione antincendio aggiornata", project: "PRJ-1002", severity: "Bassa", status: "Chiuso", reported: "05 nov 2026", by: "HR" },
  { id: "S-04", title: "Segnaletica accesso cantiere", project: "PRJ-1001", severity: "Media", status: "Chiuso", reported: "01 nov 2026", by: "RSPP" },
];

export const seedInventory = [
  { sku: "MAT-FER-12", name: "Ferri Ø12 mm", qty: 2.5, unit: "t", location: "Cantiere Navigli", min: 1 },
  { sku: "MAT-CEM-42", name: "Cemento 42,5R", qty: 180, unit: "sacchi", location: "Deposito Rho", min: 50 },
  { sku: "MAT-PIA-60", name: "Piastrelle 60x60 porcellanato", qty: 420, unit: "mq", location: "Cantiere Brera", min: 100 },
  { sku: "MAT-ISO-10", name: "Isolante XPS 10 cm", qty: 85, unit: "mq", location: "Deposito Rho", min: 40 },
  { sku: "MAT-SAN-WC", name: "Sanitari sospesi kit", qty: 6, unit: "kit", location: "Cantiere Brera", min: 2 },
];

export const seedEquipment = [
  { id: "EQ-01", name: "Autobetoniera 8 m³", plate: "MI 482 AB", status: "In cantiere", project: "PRJ-1001" },
  { id: "EQ-02", name: "Gru a torre 40 m", plate: "—", status: "In cantiere", project: "PRJ-1003" },
  { id: "EQ-03", name: "Ponteggio multidirezionale", plate: "—", status: "Montato", project: "PRJ-1002" },
  { id: "EQ-04", name: "Miniescavatore 2,5 t", plate: "MI 901 XY", status: "Disponibile", project: "—" },
  { id: "EQ-05", name: "Compressore aria", plate: "—", status: "Manutenzione", project: "—" },
];

export const seedExpenses = [
  { id: "EX-41", label: "Fornitura cemento", project: "PRJ-1001", amount: 4200, date: "15 nov 2026", cat: "Materiali" },
  { id: "EX-42", label: "Noleggio gru settimanale", project: "PRJ-1003", amount: 1850, date: "12 nov 2026", cat: "Noleggi" },
  { id: "EX-43", label: "Subappalto impianti", project: "PRJ-1002", amount: 12600, date: "10 nov 2026", cat: "Subappalti" },
  { id: "EX-44", label: "Smaltimento macerie", project: "PRJ-1001", amount: 980, date: "08 nov 2026", cat: "Servizi" },
  { id: "EX-45", label: "Trasporto materiali", project: "PRJ-1003", amount: 640, date: "06 nov 2026", cat: "Logistica" },
];

export const seedApprovals = [
  { id: "AP-7", title: "Tavola A-201 impianti", project: "PRJ-1001", from: "Studio Rossi", status: "In attesa", date: "18 nov 2026" },
  { id: "AP-8", title: "Variante finiture bagno", project: "PRJ-1002", from: "Cliente", status: "Approvata", date: "16 nov 2026" },
  { id: "AP-9", title: "SAL n. 2", project: "PRJ-1003", from: "DL", status: "In attesa", date: "19 nov 2026" },
  { id: "AP-10", title: "Computo metrico aggiornato", project: "PRJ-1001", from: "Ufficio tecnico", status: "Approvata", date: "11 nov 2026" },
];

export const seedReports = [
  { id: "R-1", title: "Avanzamento settimanale", week: "17–23 nov 2026", projects: 3, summary: "62% medio sui cantieri aperti" },
  { id: "R-2", title: "Costi vs budget", week: "17–23 nov 2026", projects: 4, summary: "Spese al 48% del budget complessivo" },
  { id: "R-3", title: "Sicurezza HSE", week: "10–16 nov 2026", projects: 3, summary: "2 osservazioni aperte, 0 infortuni" },
];

export const seedMessages = [
  { from: "Cliente Brera", text: "Confermate data consegna finiture?", time: "09:12" },
  { from: "Fornitore cementi", text: "Consegna sacchi mercoledì ore 8", time: "Ieri" },
  { from: "Studio strutturale", text: "Inviate tavole aggiornate solaio", time: "Ieri" },
];
