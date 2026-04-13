let handler = async (m, { conn, usedPrefix, command, args }) => {
  conn.akinator = conn.akinator ? conn.akinator : {}

  // 1. BLOCCO DI SICUREZZA
  if (conn.akinator[m.chat] && conn.akinator[m.chat].sender !== m.sender) {
    return m.reply(`🧞‍♂️ *Ehi!* Sto leggendo la mente di @${conn.akinator[m.chat].sender.split('@')[0]}. Aspetta il tuo turno!`)
  }

  // Database Personaggi con attributi dettagliati
  const personaggi = [
    { name: "Cristiano Ronaldo", tags: { reale: 1, sport: 1, capelli_scuri: 1, barba: -1, leggenda: 1 } },
    { name: "Sfera Ebbasta", tags: { reale: 1, cantante: 1, capelli_colorati: 1, barba: 1, occhiali: 1 } },
    { name: "Goku", tags: { fantasia: 1, anime: 1, capelli_scuri: 1, muscoli: 1, barba: -1 } },
    { name: "Babbo Natale", tags: { fantasia: 1, barba: 1, capelli_bianchi: 1, vestito_rosso: 1 } },
    { name: "Khaby Lame", tags: { reale: 1, social: 1, capelli_scuri: 1, barba: 1, muto: 1 } },
    { name: "Luffy", tags: { fantasia: 1, anime: 1, cappello: 1, cicatrice: 1, barba: -1 } }
  ]

  const poolDomande = [
    { q: "Il tuo personaggio esiste nella realtà?", tag: "reale" },
    { q: "È un personaggio di fantasia?", tag: "fantasia" },
    { q: "Fa parte del mondo degli anime/manga?", tag: "anime" },
    { q: "È uno sportivo?", tag: "sport" },
    { q: "Ha la barba?", tag: "barba" },
    { q: "Ha i capelli scuri?", tag: "capelli_scuri" },
    { q: "Ha i capelli bianchi?", tag: "capelli_bianchi" },
    { q: "È un cantante?", tag: "cantante" },
    { q: "Porta un cappello?", tag: "cappello" },
    { q: "Ha i capelli colorati (rosa, blu, ecc)?", tag: "capelli_colorati" }
  ]

  const pesi = { "si": 1, "no": -1, "nonso": 0, "probabile": 0.5, "probabileno": -0.5 }

  // GESTIONE ESCI
  if (args[0] === 'esci') {
    delete conn.akinator[m.chat]
    return m.reply("🧞‍♂️ *PARTITA ANNULLATA*")
  }

  // 2. LOGICA DI GIOCO
  if (conn.akinator[m.chat]) {
    let gioco = conn.akinator[m.chat]
    let risposta = args[0]?.toLowerCase()

    if (!pesi.hasOwnProperty(risposta)) return // Ignora input errati

    // Registra risposta
    let tagDomanda = poolDomande[gioco.step].tag
    gioco.punteggi[tagDomanda] = pesi[risposta]
    gioco.step++

    // CALCOLO PROBABILITÀ
    let candidati = personaggi.map(p => {
      let score = 0
      for (let t in gioco.punteggi) {
        if (p.tags[t]) score += (p.tags[t] * gioco.punteggi[t])
      }
      return { ...p, currentScore: score }
    }).sort((a, b) => b.currentScore - a.currentScore)

    // CONDIZIONE DI VITTORIA: Se il primo candidato stacca il secondo o finite le domande
    let migliorMatch = candidati[0]
    if (migliorMatch.currentScore >= 2.5 || gioco.step >= poolDomande.length) {
      let fineTxt = `🧞‍♂️ *HO DECISO!*\n\n`
      fineTxt += `Il tuo personaggio è: *${migliorMatch.name}*\n\n`
      fineTxt += `> Ho letto la tua mente correttamente?`
      delete conn.akinator[m.chat]
      return m.reply(fineTxt)
    }

    // Prossima Domanda
    return inviaAkiButtons(conn, m, poolDomande[gioco.step].q, gioco.step + 1, usedPrefix, command)
  }

  // 3. START
  conn.akinator[m.chat] = { sender: m.sender, step: 0, punteggi: {} }
  return inviaAkiButtons(conn, m, `🧞‍♂️ *INIZIAMO!* \n\n${poolDomande[0].q}`, 1, usedPrefix, command)
}

async function inviaAkiButtons(conn, m, testo, num, usedPrefix, command) {
  const buttons = [
    { buttonId: `${usedPrefix}${command} si`, buttonText: { displayText: "Sì" }, type: 1 },
    { buttonId: `${usedPrefix}${command} no`, buttonText: { displayText: "No" }, type: 1 },
    { buttonId: `${usedPrefix}${command} nonso`, buttonText: { displayText: "Non so" }, type: 1 },
    { buttonId: `${usedPrefix}${command} probabile`, buttonText: { displayText: "Probabilmente" }, type: 1 },
    { buttonId: `${usedPrefix}${command} esci`, buttonText: { displayText: "Esci" }, type: 1 }
  ]

  return await conn.sendMessage(m.chat, {
    text: testo,
    footer: `Akinator • Domanda ${num}`,
    buttons: buttons,
    headerType: 1,
    viewOnce: true
  }, { quoted: m })
}

handler.help = ['akinator']
handler.tags = ['giochi']
handler.command = /^(akinator|aki)$/i

export default handler
