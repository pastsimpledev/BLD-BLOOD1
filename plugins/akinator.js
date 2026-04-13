let handler = async (m, { conn, text, usedPrefix, command }) => {
  let nomeDelBot = global.db.data.nomedelbot || `𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙`
  
  // Inizializziamo la sessione locale
  conn.akiLocale = conn.akiLocale ? conn.akiLocale : {}

  // Gestione reset
  if (text === 'reset' || text === 'stop') {
    delete conn.akiLocale[m.sender]
    return m.reply("🔄 Sessione di Akinator resettata.")
  }

  // Domande del gioco
  const domande = [
    "Il tuo personaggio è reale?",
    "È un uomo?",
    "È italiano?",
    "È un calciatore?",
    "È uno YouTuber o TikToker?",
    "Fa parte del mondo dei film/serie TV?",
    "È un cantante?",
    "È un personaggio di un anime/manga?",
    "Ha i capelli scuri?",
    "È una persona che conosci personalmente?"
  ]

  // 1. GESTIONE RISPOSTA
  if (conn.akiLocale[m.sender]) {
    let gioco = conn.akiLocale[m.sender]
    
    // Controlla se l'utente ha risposto con un numero
    if (!text || isNaN(text) || text < 1 || text > 4) {
      return m.reply(`⚠ Rispondi con un numero!\n\n1 = Sì\n2 = No\n3 = Non so\n4 = Torna indietro\n\n Scrivi *${usedPrefix + command} [numero]*`)
    }

    gioco.step++

    // Fine del gioco (simulata)
    if (gioco.step >= domande.length) {
      let finale = `🧞‍♂️ *HO DECISO!*\n\n`
      finale += `Penso che il tuo personaggio sia qualcuno di molto famoso!\n`
      finale += `_(Il sito ufficiale di Akinator ha bloccato l'IP del server, quindi sto usando la modalità offline)_\n\n`
      finale += `*Grazie per aver giocato con ${nomeDelBot}*`
      delete conn.akiLocale[m.sender]
      return m.reply(finale)
    }

    // Invia prossima domanda
    let testoDomanda = `*🤖 AKINATOR - Domanda ${gioco.step + 1}*\n\n`
    testoDomanda += `> ${domande[gioco.step]}\n\n`
    testoDomanda += `1️⃣ Sì\n2️⃣ No\n3️⃣ Non so\n4️⃣ Probabile\n\n`
    testoDomanda += `*Rispondi con: ${usedPrefix + command} [numero]*`
    
    return m.reply(testoDomanda)
  }

  // 2. AVVIO PARTITA
  conn.akiLocale[m.sender] = { step: 0 }
  let inizio = `*🧞‍♂️ BENVENUTO SU AKINATOR (OFFLINE)*\n\n`
  inizio += `Pensa a un personaggio. Rispondi alle domande usando i numeri.\n\n`
  inizio += `*Domanda 1:* ${domande[0]}\n\n`
  inizio += `1️⃣ Sì\n2️⃣ No\n3️⃣ Non so\n4️⃣ Probabile\n\n`
  inizio += `*Usa:* ${usedPrefix + command} 1 (per dire sì)`

  return m.reply(inizio)
}

handler.help = ['akinator']
handler.tags = ['giochi']
handler.command = /^(akinator|aki)$/i

export default handler
