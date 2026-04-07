import fetch from 'node-fetch';

const PERM = {
  ADMIN: 'admin',
  OWNER: 'owner',
  sam: 'sam',
};

const featureRegistry = [
  { key: 'antigore', store: 'chat', perm: PERM.ADMIN, name: '🚫 Antigore', desc: 'Blocca contenuti splatter/gore' },
  { key: 'modoadmin', store: 'chat', perm: PERM.ADMIN, name: '🛡️ Soloadmin', desc: 'Solo gli admin usano il bot' },
  { key: 'antivoip', store: 'chat', perm: PERM.ADMIN, name: '📞 Antivoip', desc: 'Rifiuta chiamate nel gruppo' },
  { key: 'antiLink', store: 'chat', perm: PERM.ADMIN, name: '🔗 Antilink', desc: 'Elimina link gruppi WhatsApp' },
  { key: 'antiLink2', store: 'chat', perm: PERM.ADMIN, name: '🌐 Antilinksocial', desc: 'Elimina link social (IG, TT, ecc)' },
  { key: 'antitrava', store: 'chat', perm: PERM.ADMIN, name: '🧱 Antitrava', desc: 'Blocca crash/messaggi lunghi' },
  { key: 'antinuke', store: 'chat', perm: PERM.OWNER, name: '☢️ Antinuke', desc: 'Sicurezza avanzata del gruppo' },
  { key: 'antioneview', store: 'chat', perm: PERM.ADMIN, name: '👁️ Antiviewonce', desc: 'Blocca messaggi visualizza una volta' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, name: '🛑 Antispam', desc: 'Blocca spam di comandi/messaggi' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, name: '🧠 IA', desc: 'Intelligenza artificiale attiva' },
  { key: 'vocali', store: 'chat', perm: PERM.ADMIN, name: '🎤 Siri', desc: 'Risponde con audio ai messaggi' },
  { key: 'reaction', store: 'chat', perm: PERM.ADMIN, name: '😎 Reazioni', desc: 'Reazioni automatiche ai messaggi' },
  { key: 'autolevelup', store: 'chat', perm: PERM.ADMIN, name: '⬆️ Autolivello', desc: 'Messaggio di livello automatico' },
  { key: 'welcome', store: 'chat', perm: PERM.ADMIN, name: '👋 Welcome', desc: 'Messaggio di benvenuto' },
  { key: 'goodbye', store: 'chat', perm: PERM.ADMIN, name: '🚪 Goodbye', desc: 'Messaggio di addio' },
  { key: 'antiprivato', store: 'bot', perm: PERM.OWNER, name: '🔒 Antiprivato', desc: 'Blocca chi scrive in privato' },
  { key: 'autoread', store: 'bot', perm: PERM.OWNER, name: '👀 Lettura', desc: 'Auto-visualizza i messaggi' }
];

const aliasMap = new Map();
featureRegistry.forEach(f => {
  aliasMap.set(f.key.toLowerCase(), f);
});

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isSam }) => {
  const isEnable = /true|enable|attiva|(turn)?on|1/i.test(command);
  const isDisable = /disable|disattiva|off|0/i.test(command);
  const userName = m.pushName || 'User';

  global.db.data.chats = global.db.data.chats || {};
  global.db.data.settings = global.db.data.settings || {};
  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
  const botJid = conn.decodeJid(conn.user.jid);
  const bot = global.db.data.settings[botJid] || (global.db.data.settings[botJid] = {});

  // --- LOGICA ATTIVAZIONE/DISATTIVAZIONE ---
  if (args.length > 0 && (isEnable || isDisable)) {
    let type = args[0].toLowerCase();
    const feat = aliasMap.get(type);
    if (!feat) return m.reply(`『 ❌ 』 Modulo *${type}* inesistente.`);

    if (feat.perm === PERM.sam && !isSam) return m.reply('『 ❌ 』 Accesso negato: Solo Blood può gestire questo.');
    if (feat.perm === PERM.OWNER && !isOwner && !isSam) return m.reply('『 ❌ 』 Accesso negato: Solo il proprietario può gestire questo.');
    if (feat.perm === PERM.ADMIN && m.isGroup && !(isAdmin || isOwner || isSam)) return m.reply('『 ❌ 』 Comando riservato agli amministratori.');

    const target = feat.store === 'bot' ? bot : chat;
    target[feat.key] = isEnable;

    return m.reply(`*〘 📡 BLD-SYSTEM 〙*\n\nModulo: *${feat.name}*\nStato: *${isEnable ? 'ATTIVATO 🟢' : 'DISATTIVATO 🔴'}*`);
  }

  // --- COSTRUZIONE MENU TEMA MASTER CONTROL ---
  const getStatus = (f) => (f.store === 'bot' ? bot[f.key] : chat[f.key]) ? '🟢' : '🔴';

  let menu = `┎━━━━━━━━━━━━━━━━━━━━┑
┃   ✧  𝐁𝐋𝐃 - 𝐌𝐀𝐒𝐓𝐄𝐑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋  ✧   ┃
┖━━━━━━━━━━━━━━━━━━━━┙
┌────────────────────┐
  👤 𝚄𝚜𝚎𝚛: ${userName}
  📡 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙾𝚗𝚕𝚒𝚗𝚎
└────────────────────┘

*〘 ɪɴsᴛʀᴜᴢɪᴏɴɪ ᴏᴘᴇʀᴀᴛɪᴠᴇ 〙*
> Attiva o disattiva i moduli:
*│ ➤* .attiva <nome>
*│ ➤* .disattiva <nome>

*┍━━━━━〔 🛡️ sɪᴄᴜʀᴇᴢᴢᴀ 〕━━━━━┑*\n`;

  const sicurezza = featureRegistry.filter(f => ['antigore', 'modoadmin', 'antivoip', 'antiLink', 'antiLink2', 'antitrava', 'antinuke', 'antioneview', 'antispam'].includes(f.key));
  sicurezza.forEach(f => {
    menu += `┇ ${getStatus(f)} ${f.name}\n┇ _${f.desc}_\n┇ ➤ *${f.key}*\n┇\n`;
  });

  menu += `*┕━━━━━━━──ׄ──ׅ──ׄ──━━━━━━━┙*

*┍━━━━━〔 🤖 ᴀᴜᴛᴏᴍᴀᴢɪᴏɴᴇ 〕━━━━━┑*\n`;

  const automazione = featureRegistry.filter(f => ['ai', 'vocali', 'reaction', 'autolevelup', 'welcome'].includes(f.key));
  automazione.forEach(f => {
    menu += `┇ ${getStatus(f)} ${f.name}\n┇ _${f.desc}_\n┇ ➤ *${f.key}*\n┇\n`;
  });

  menu += `*┕━━━━━━━──ׄ──ׅ──ׄ──━━━━━━━┙*\n\n_ʙʟᴅ-ʙᴏᴛ sᴇᴄᴜʀɪᴛʏ ɪɴᴛᴇʀꜰᴀᴄᴇ_`;

  let profilePic;
  try { profilePic = await conn.profilePictureUrl(m.chat, 'image'); } 
  catch { profilePic = 'https://i.ibb.co/kVdFLyGL/sam.jpg'; }

  await conn.sendMessage(m.chat, {
    text: menu,
    contextInfo: {
      externalAdReply: {
        title: "BLD-BLOOD MASTER CONTROL",
        body: "Security Terminal v3.0",
        mediaType: 1,
        thumbnailUrl: profilePic,
        sourceUrl: 'https://github.com'
      }
    }
  }, { quoted: m });
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'];

export default handler;
