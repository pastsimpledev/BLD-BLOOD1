import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix: _p, command, args, isOwner, isAdmin }) => {
  const userName = m.pushName || 'Utente'
  
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {}
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid]

  const dynamicContextInfo = {
    externalAdReply: {
      title: "🛡️ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 🛡️",
      body: "ᴘʀᴏᴛᴏᴄᴏʟʟɪ ᴅɪ ᴅɪꜰᴇsᴀ ᴀᴛᴛɪᴠɪ",
      mediaType: 1,
      renderLargerThumbnail: true,
      thumbnailUrl: 'https://files.catbox.moe/u8o020.jpg',
      sourceUrl: 'https://whatsapp.com/channel/0029Vajp6GvK0NBoP7WlR81G'
    }
  }

  const securityFeatures = [
    { key: 'antigore', name: '🚫 Antigore' },
    { key: 'modoadmin', name: '🛡️ Soloadmin' },
    { key: 'antivoip', name: '📞 Antivoip' },
    { key: 'antiLink', name: '🔗 Antilink' },
    { key: 'antiLink2', name: '🌐 Antilink Social' },
    { key: 'antitrava', name: '🛡️ Antitrava' },
    { key: 'antinuke', name: '☢️ Antinuke' },
    { key: 'antioneview', name: '👁️ Antiviewonce' },
    { key: 'antispam', name: '🛑 Antispam' }
  ]

  const automationFeatures = [
    { key: 'ai', name: '🧠 IA (Intelligenza)' },
    { key: 'vocali', name: '🎤 Siri (Audio Auto)' },
    { key: 'reaction', name: '😎 Reazioni' },
    { key: 'autolevelup', name: '⬆️ Autolivello' },
    { key: 'welcome', name: '👋 Welcome' }
  ]

  if (!args.length) {
    let text = `
┎━━━━━━━━━━━━━━━━━━━┑
┃   ✧  𝐁𝐋𝐃 - 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘  ✧   ┃
┖━━━━━━━━━━━━━━━━━━━┙
┌───────────────────┐
  👤 𝚄𝚜𝚎𝚛: ${userName}
  🛡️ 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙰𝚌𝚝𝚒𝚟𝚎
└───────────────────┘

*〘 ɪɴstruᴢɪᴏɴɪ ᴏᴘᴇʀᴀᴛɪᴠᴇ 〙*
> Attiva/Disattiva i moduli digitando:
*│ ➤* ${_p}*attiva* <nome>
*│ ➤* ${_p}*disattiva* <nome>

*┍━━━〔 🛡️ sɪᴄᴜʀᴇᴢᴢᴀ 〕━━━┑*
${securityFeatures.map(f => `┇ ${f.name}  *➤* ${f.key}`).join('\n')}
*┕━━━━━──ׄ──ׅ──ׄ──━━━━━┙*

*┍━━━〔 🤖 ᴀᴜᴛᴏᴍᴀᴢɪᴏɴᴇ 〕━━━┑*
${automationFeatures.map(f => `┇ ${f.name}  *➤* ${f.key}`).join('\n')}
*┕━━━━━──ׄ──ׅ──ׄ──━━━━━┙*
`
    await conn.sendMessage(m.chat, { text: text.trim(), contextInfo: dynamicContextInfo }, { quoted: m })
    return
  }

  let isEnable = !/disattiva|off|0/i.test(command)
  let type = args[0].toLowerCase()
  
  // Mappatura corretta per il database
  let dbKey = type
  if (type === 'antilink') dbKey = 'antiLink'
  if (type === 'antilinksocial') dbKey = 'antiLink2'
  if (type === 'antiviewonce') dbKey = 'antioneview'

  if (chat[dbKey] === undefined && !isOwner) return m.reply('❓ Funzione non riconosciuta dal sistema.')

  if (m.isGroup && !isAdmin && !isOwner) return m.reply('🛡️ Solo per Admin')

  chat[dbKey] = isEnable
  await m.react(isEnable ? '✅' : '❌')
  m.reply(`『 🛡️ 』 *SISTEMA AGGIORNATO*\n\nModulo: *${type.toUpperCase()}*\nStato: *${isEnable ? 'ATTIVATO ✅' : 'DISATTIVATO ❌'}*`)
}

handler.command = ['attiva', 'disattiva', 'on', 'off']
export default handler
