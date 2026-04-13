import { OpenAI } from 'openai' // O qualsiasi altro provider IA che usi

let handler = async (m, { conn, usedPrefix, command, args, text }) => {
  conn.akinator = conn.akinator ? conn.akinator : {}

  // 1. BLOCCO DI SICUREZZA
  if (conn.akinator[m.chat] && conn.akinator[m.chat].sender !== m.sender) {
    return m.reply(`🧞‍♂️ *Ehi!* Il Genio è occupato con @${conn.akinator[m.chat].sender.split('@')[0]}.`)
  }

  // GESTIONE ESCI
  if (args[0] === 'esci') {
    delete conn.akinator[m.chat]
    return m.reply("🧞‍♂️ *PARTITA ANNULLATA*")
  }

  try {
    // 2. LOGICA DI GIOCO
    if (conn.akinator[m.chat]) {
      let gioco = conn.akinator[m.chat]
      let risposta = args[0]?.toLowerCase()
      
      const validi = ["si", "no", "nonso", "probabile", "probabileno"]
      if (!validi.includes(risposta)) return

      // Salviamo la risposta nella memoria del gioco
      gioco.log += `\nDomanda: ${gioco.ultimaDomanda} | Risposta: ${risposta}`
      gioco.step++

      // CHIAMATA ALL'IA PER DECIDERE LA PROSSIMA MOSSA
      const prompt = `Sei Akinator. Basandoti su questa cronologia: "${gioco.log}", decidi:
      1. Se hai capito chi è il personaggio (sicurezza > 90%), rispondi SOLO con "FINISH: Nome Personaggio | Breve Descrizione".
      2. Se non sei sicuro, formula la prossima domanda mirata per restringere il campo. Rispondi SOLO con la domanda.`

      // Sostituisci con la tua funzione di generazione testo (OpenAI, Gemini, ecc.)
      const aiRes = await queryAI(prompt) 

      if (aiRes.startsWith("FINISH:")) {
        let [_, info] = aiRes.split("FINISH:")
        let finale = `🧞‍♂️ *L'HO INDOVINATO!*\n\n${info.trim()}\n\n> Ho letto la tua mente!`
        delete conn.akinator[m.chat]
        return m.reply(finale)
      }

      gioco.ultimaDomanda = aiRes
      return inviaAkiButtons(conn, m, aiRes, gioco.step, usedPrefix, command)
    }

    // 3. INIZIO PARTITA
    const domandaIniziale = "Il tuo personaggio esiste nella realtà?"
    conn.akinator[m.chat] = {
      sender: m.sender,
      step: 1,
      log: "Inizio partita.",
      ultimaDomanda: domandaIniziale
    }

    return inviaAkiButtons(conn, m, `🧞‍♂️ *Pensa a chiunque...*\n\n${domandaIniziale}`, 1, usedPrefix, command)

  } catch (e) {
    m.reply("⚠️ Il Genio ha perso il filo dei pensieri... Riprova.")
  }
}

// Esempio funzione query (adattala alla tua API)
async function queryAI(prompt) {
  // Qui inserisci la chiamata API (es. OpenAI, Anthropic o il tuo provider)
  // Esempio: const response = await openai.chat.completions.create(...)
  // return response.choices[0].message.content
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
    footer: `Akinator AI • Domanda ${num}`,
    buttons: buttons,
    headerType: 1
  }, { quoted: m })
}

handler.help = ['akinator']
handler.tags = ['giochi']
handler.command = /^(akinator|aki)$/i

export default handler
