let handler = async (m, { conn, usedPrefix, command, args }) => {
  conn.akinator = conn.akinator ? conn.akinator : {}

  // 1. BLOCCO CONCORRENZA: Un solo giocatore alla volta per chat
  if (conn.akinator[m.chat] && conn.akinator[m.chat].sender !== m.sender) {
    return m.reply(`🤫 Shhh! Il Genio si sta già concentrando su @${conn.akinator[m.chat].sender.split('@')[0]}. Aspetta il tuo turno!`)
  }

  // Database Personaggi con pesi (Simulazione motore Aki)
  const personaggi = [
    { name: "Cristiano Ronaldo", tags: { reale: 1, maschio: 1, italiano: -1, sport: 1, anime: -1 } },
    { name: "Sfera Ebbasta", tags: { reale: 1, maschio: 1, italiano: 1, cantante: 1, sport: -1 } },
    { name: "Goku", tags: { reale: -1, maschio: 1, anime: 1, sport: 0.5 } },
    { name: "Chiara Ferragni", tags: { reale: 1, femmina: 1, italiano: 1, social: 1 } },
    { name: "Luffy", tags: { reale: -1, maschio: 1, anime: 1, pirata: 1 } }
  ]

  const domande = [
    { q: "Il tuo personaggio esiste realmente?", tag: "reale" },
    { q: "È un maschio?", tag: "maschio" },
    { q: "È italiano?", tag: "italiano" },
    { q: "È un cantante?", tag: "cantante" },
    { q: "È uno sportivo?", tag: "sport" },
    { q: "Viene da un anime?", tag: "anime" }
  ]

  // Valori delle risposte (Esattamente come Aki)
  const pesi = {
    "1": 1,      // Sì
    "2": -1,     // No
    "3": 0,      // Non so
    "4": 0.5,    // Probabilmente sì
    "5": -0.5    // Probabilmente no
  }

  // Gestione STOP
  if (args[0] === 'stop') {
    delete conn.akinator[m.chat]
    return m.reply("🧞‍♂️ *PARTITA ABORTITA*\n\nIl Genio è tornato nella sua lampada.")
  }

  // 2. LOGICA DI GIOCO
  if (conn.akinator[m.chat]) {
    let gioco = conn.akinator[m.chat]
    let scelta = args[0]

    if (!pesi[scelta]) {
      return m.reply(`⚠️ Risposta non valida! Usa i numeri o i tasti:\n\n1. Sì\n2. No\n3. Non so\n4. Probabilmente\n5. Probabilmente no`)
    }

    // Registra il peso della risposta per il tag corrente
    let tagCorrente = domande[gioco.step].tag
    gioco.punteggi[tagCorrente] = pesi[scelta]
    gioco.step++

    // FINE GIOCO
    if (gioco.step >= domande.length) {
      // Calcolo affinità
      let risultato = personaggi.map(p => {
        let score = 0
        for (let tag in gioco.punteggi) {
          if (p.tags[tag]) score += (p.tags[tag] * gioco.punteggi[tag])
        }
        return { ...p, finalScore: score }
      }).sort((a, b) => b.finalScore - a.finalScore)[0]

      let txt = `🧞‍♂️ *L'HO TROVATO!*\n\n`
      txt += `Penso che il tuo personaggio sia:\n✨ *${risultato.name}* ✨\n\n`
      txt += `> Ho indovinato? Spero di sì!`
      
      delete conn.akinator[m.chat]
      return m.reply(txt)
    }

    return inviaDomanda(conn, m, domande[gioco.step].q, gioco.step, usedPrefix, command)
  }

  // 3. INIZIO PARTITA
  conn.akinator[m.chat] = {
    sender: m.sender,
    step: 0,
    punteggi: {}
  }

  let intro = `🧞‍♂️ *IL GENIO AKINATOR*\n\nPensa a un personaggio, io proverò a indovinarlo!\n\n1️⃣ *${domande[0].q}*`
  return inviaDomanda(conn, m, intro, 0, usedPrefix, command)
}

async function inviaDomanda(conn, m, domanda, index, prefix, cmd) {
  let menu = `
${domanda}

1. *Sì* ✅
2. *No* ❌
3. *Non so* 🤔
4. *Probabilmente* 👍
5. *Probabilmente no* 👎

> Digita *${prefix}${cmd}* seguito dal numero (es: *${prefix}${cmd} 1*)`

  return conn.reply(m.chat, menu, m)
}

handler.help = ['akinator']
handler.tags = ['giochi']
handler.command = /^(akinator|aki)$/i

export default handler
