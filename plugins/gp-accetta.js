const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var handler = async (m, { conn, isBotAdmin, isAdmin }) => {
  if (!isAdmin) return 
  if (!isBotAdmin) return m.reply('⚠️ Il bot deve essere admin.')

  try {

    // PRENDE LISTA RICHIESTE
    let req = await conn.groupRequestParticipantsList(m.chat)
    let total = req?.length || 0

    if (total === 0)
      return m.reply('📭 Non ci sono richieste di ingresso.')

    // 1️⃣ DISATTIVA APPROVAZIONE
    await conn.query({
      tag: 'iq',
      attrs: {
        to: m.chat,
        type: 'set',
        xmlns: 'w:g2',
      },
      content: [{
        tag: 'membership_approval_mode',
        attrs: {},
        content: [{
          tag: 'group_join',
          attrs: { state: 'off' } 
        }]
      }]
    })

    // MESSAGGIO CON NUMERO
    await conn.sendMessage(m.chat, { 
      text: `✅ Ho accettato *${total} richieste* di ingresso.` 
    }, { quoted: m })

    // 2️⃣ ASPETTA
    await delay(2000)

    // 3️⃣ RIATTIVA APPROVAZIONE
    await conn.query({
      tag: 'iq',
      attrs: {
        to: m.chat,
        type: 'set',
        xmlns: 'w:g2',
      },
      content: [{
        tag: 'membership_approval_mode',
        attrs: {},
        content: [{
          tag: 'group_join',
          attrs: { state: 'on' } 
        }]
      }]
    })

  } catch (e) {
    console.error("ERRORE_QUERY_DIRETTA:", e)
    m.reply('❌ Errore critico: il gruppo non supporta l\'approvazione.')
  }
}

handler.help = ['accetta']
handler.tags = ['group']
handler.command = ['accetta','acetta']

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler