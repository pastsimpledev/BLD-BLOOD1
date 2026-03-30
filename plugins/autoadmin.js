// Plugin Autoadmin per Blood & Gaia
// Riservato esclusivamente agli Owner

let handler = async (m, { conn, isOwner, isAdmin }) => {
  // --- CONTROLLO DI SICUREZZA ---
  // Solo il proprietario del bot può eseguire questo comando
  if (!isOwner) return conn.reply(m.chat, '『 ❌ 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐍𝐞𝐠𝐚𝐭𝐨: Non sei il mio creatore.', m)

  // Se è già admin, non serve fare nulla
  if (isAdmin) return conn.reply(m.chat, '『 ✨ 』 𝐒𝐞𝐢 𝐠𝐢𝐚̀ 𝐚𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐞 𝐝𝐢 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨.', m)

  try {
    // Promuove l'owner che ha inviato il comando
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
    
    await conn.sendMessage(m.chat, {
        text: `
  ⋆｡˚『 ╭ \`AUTOPROMOZIONE\` ╯ 』˚｡⋆
╭
┃ 👑 \`Stato:\` *Potere conferito*
┃ 👤 \`Utente:\` @${m.sender.split('@')[0]}
┃
┃ ➤  \`Bentornato a casa, Capo.\`
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`,
        contextInfo: { 
            mentionedJid: [m.sender],
            externalAdReply: {
                title: 'BLOOD & GAIA SYSTEM',
                body: 'Accesso Privilegiato Eseguito',
                thumbnailUrl: 'https://qu.ax/TfUj.jpg', 
                sourceUrl: 'vare ✧ bot',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '『 ❌ 』 𝐄𝐫𝐫𝐨𝐫𝐞: Assicurati che il bot sia admin.', m)
  }
}

handler.help = ['𝑩𝑳𝑶𝑶𝑫', '𝐆𝐀𝐈𝐀']
handler.tags = ['owner']
// Supporta entrambi i nomi (con i font speciali che hai richiesto)
handler.command = /^(𝑩𝑳𝑶𝑶𝑫|𝐆𝐀𝐈𝐀)$/i
handler.group = true
handler.botAdmin = true
handler.rowner = true // Ulteriore protezione a livello di framework

export default handler
