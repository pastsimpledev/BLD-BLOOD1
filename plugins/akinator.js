import { Aki } from 'aki-api'

// FIX SSL per server Linux/VPS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let nomeDelBot = global.db.data.nomedelbot || `𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙`
  
  conn.akinator = conn.akinator ? conn.akinator : {}

  // Comando per resettare in caso di blocco
  if (text === 'reset') {
    delete conn.akinator[m.sender]
    return m.reply("🔄 Sessione di Akinator resettata.")
  }

  // 1. GESTIONE PARTITA IN CORSO
  if (conn.akinator[m.sender]) {
    let { aki, msg } = conn.akinator[m.sender]
    
    if (!text || isNaN(text) || text < 0 || text > 4) {
      return m.reply(`⚠ Rispondi con un numero!\n\n0: Sì\n1: No\n2: Non so\n3: Probabile\n4: Probabile No`)
    }

    try {
      await aki.step(text.trim())

      if (aki.progress >= 80 || aki.currentStep >= 70) {
        await aki.win()
        let personaggio = aki.answers[0]
        let txt = `✨ *L'HO INDOVINATO!* ✨\n\n`
        txt += `👤 *Nome:* ${personaggio.name}\n`
        txt += `📝 *Descrizione:* ${personaggio.description}\n\n`
        txt += `*${nomeDelBot}*`
        
        await conn.sendMessage(m.chat, { 
          image: { url: personaggio.absolute_picture_path }, 
          caption: txt 
        }, { quoted: m })
        
        delete conn.akinator[m.sender]
        return
      }

      let domanda = `*🤖 AKINATOR - Domanda n. ${aki.currentStep + 1}*\n\n`
      domanda += `> _${aki.question}_\n\n`
      domanda += `0 (Sì), 1 (No), 2 (Boh), 3 (Sì+), 4 (No+)`

      await conn.sendMessage(m.chat, { text: domanda, edit: msg }, { quoted: m })

    } catch (e) {
      console.error("[ERRORE AKINATOR]:", e.message)
      delete conn.akinator[m.sender]
      return m.reply("❌ Errore critico: Il server ha chiuso la connessione. L'IP è probabilmente bannato.")
    }

  } else {
    // 2. AVVIO NUOVA PARTITA
    try {
      let aki = new Aki({ region: 'it', childMode: false })
      
      // TENTATIVO DI BYPASS HEADER
      aki.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      
      await aki.start()
      
      let intro = `*🎮 AKINATOR È INIZIATO!*\n\n`
      intro += `*Domanda n. 1:*\n> _${aki.question}_\n\n`
      intro += `Rispondi con *${usedPrefix + command} [numero]*`

      let { key } = await conn.sendMessage(m.chat, { text: intro }, { quoted: m })
      
      conn.akinator[m.sender] = { aki, msg: key }

    } catch (e) {
      console.error("[ERRORE AVVIO]:", e.message)
      return m.reply("❌ *Errore 403 Forbidden*\n\nIl firewall di Akinator ha bloccato il tuo server. Prova a cambiare la regione del bot o attendi 1 ora.")
    }
  }
}

handler.help = ['akinator']
handler.tags = ['giochi']
handler.command = /^(akinator|aki)$/i

export default handler
