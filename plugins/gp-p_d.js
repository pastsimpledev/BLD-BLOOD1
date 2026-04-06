let handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat]
  const isAntinukeOn = chat?.antinuke
  const sender = m.sender
  
  // --- NUOVA LOGICA DI SICUREZZA RIGIDA ---
  // Recuperiamo i dati del partecipante per vedere se è un admin REALE di WhatsApp
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants
  const realAdmin = participants.find(p => p.id === sender)?.admin !== null

  // Se l'utente NON è un Admin reale (di WhatsApp) e NON è l'Owner, viene bloccato.
  // Questo esclude automaticamente i "moderatori" aggiunti tramite database che non sono admin effettivi.
  if (!realAdmin && !isOwner) {
    return conn.reply(m.chat, '『 ❌ 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨: Solo gli amministratori reali possono gestire i gradi.', m)
  }

  // --- LOGICA ANTINUKE ---
  if (isAntinukeOn && !isOwner) {
    return conn.reply(m.chat, '『 🛡️ 』 𝐀𝐧𝐭𝐢𝐧𝐮𝐤𝐞 𝐀𝐭𝐭𝐢𝐯𝐨: In questa modalità solo il Creatore può gestire i gradi.', m)
  }

  let number
  if (m.mentionedJid && m.mentionedJid[0]) {
    number = m.mentionedJid[0].split('@')[0]
  } else if (m.quoted && m.quoted.sender) {
    number = m.quoted.sender.split('@')[0]
  } else if (text && !isNaN(text.replace(/[^0-9]/g, ''))) {
    number = text.replace(/[^0-9]/g, '')
  } else {
    return conn.reply(m.chat, '『 👤 』 𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 o quota un messaggio.', m)
  }

  let user = number + '@s.whatsapp.net'
  let action, successMsg, errorMsg

  if (user === sender) return conn.reply(m.chat, '『 🤡 』 Non puoi promuovere/retrocedere te stesso.', m)

  if (['promote', 'promuovi', 'p'].includes(command)) {
    action = 'promote'
    successMsg = `『 👑 』 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 @${user.split('@')[0]} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐢𝐧𝐜𝐨𝐫𝐨𝐧𝐚𝐭𝐨/𝐚 \n\n𝐃𝐚: @${sender.split('@')[0]}`
    errorMsg = '『 ❌ 』 Impossibile promuovere (utente già admin o non nel gruppo).'
  }

  if (['demote', 'retrocedi', 'r'].includes(command)) {
    action = 'demote'
    successMsg = `『 ⚠️ 』 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 @${user.split('@')[0]} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐨\n\n𝐃𝐚: @${sender.split('@')[0]}`
    errorMsg = '『 ❌ 』 Impossibile retrocedere (utente non admin o già membro semplice).'
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], action)
    conn.reply(m.chat, successMsg, m, {
      mentions: [sender, user]
    })
  } catch (e) {
    conn.reply(m.chat, errorMsg, m)
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['group']
handler.command = ['promote', 'promuovi', 'p', 'demote', 'retrocedi', 'r']
handler.group = true
handler.botAdmin = true

export default handler
