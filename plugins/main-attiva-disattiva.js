import fetch from 'node-fetch';

const PERM = {
  ADMIN: 'admin',
  OWNER: 'owner',
  sam: 'sam',
};

const featureRegistry = [
  { key: 'welcome', store: 'chat', perm: PERM.ADMIN, aliases: ['benvenuto'], groupOnly: true, name: '👋 Welcome', desc: 'Messaggio di benvenuto' },
  { key: 'goodbye', store: 'chat', perm: PERM.ADMIN, aliases: ['addio'], groupOnly: true, name: '🚪 Addio', desc: 'Messaggio di addio' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🛑 Antispam', desc: 'Protezione flood e spam' },
  { key: 'antisondaggi', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '📊🚫 Anti-sondaggi', desc: 'Blocca la creazione di sondaggi' },
  { key: 'antiparolacce', store: 'chat', perm: PERM.ADMIN, aliases: ['antitossici'], name: '🧼 Filtro parolacce', desc: 'Avverte e rimuove per insulti' },
  { key: 'antiBot', store: 'chat', perm: PERM.ADMIN, aliases: ['antibot'], name: '🤖❌ Antibot', desc: 'Rimuove bot esterni' },
  { key: 'antiBot2', store: 'chat', perm: PERM.ADMIN, aliases: ['antisubbots'], name: '🤖🚫 Anti-subbots', desc: 'Blocca sub-bot nel gruppo' },
  { key: 'antitrava', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🧨❌ Antitrava', desc: 'Blocca messaggi crash/trava' },
  { key: 'antimedia', store: 'chat', perm: PERM.ADMIN, aliases: [], groupOnly: true, name: '🖼️❌ Antimedia', desc: 'Accetta solo media view-once' },
  { key: 'antioneview', store: 'chat', perm: PERM.ADMIN, aliases: ['antiviewonce'], groupOnly: true, name: '👁️‍🗨️ Antiviewonce', desc: 'Blocca media view-once' },
  { key: 'antitagall', store: 'chat', perm: PERM.ADMIN, aliases: ['antimentioni'], groupOnly: true, name: '🏷️🚫 Anti-tagall', desc: 'Blocca tag di massa' },
  { key: 'rileva', store: 'chat', perm: PERM.ADMIN, aliases: ['detect'], groupOnly: true, name: '📡 Rileva', desc: 'Notifica cambi impostazioni gruppo' },
  { key: 'antiporno', store: 'chat', perm: PERM.ADMIN, aliases: ['antinsfw'], name: '🔞 Antiporno', desc: 'Filtro contenuti per adulti' },
  { key: 'antigore', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '🚫 Antigore', desc: 'Filtro contenuti violenti' },
  { key: 'modoadmin', store: 'chat', perm: PERM.ADMIN, aliases: ['soloadmin'], name: '🛡️ Soloadmin', desc: 'Comandi solo per admin' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, aliases: ['ia'], groupOnly: true, name: '🧠 IA', desc: 'Intelligenza Artificiale attiva' },
  { key: 'vocali', store: 'chat', perm: PERM.ADMIN, aliases: ['siri'], groupOnly: true, name: '🎤 Siri', desc: 'Risposte vocali automatiche' },
  { key: 'antivoip', store: 'chat', perm: PERM.ADMIN, aliases: [], name: '📞❌ Antivoip', desc: 'Blocca numeri stranieri (+39 solo)' },
  { key: 'antiLink', store: 'chat', perm: PERM.ADMIN, aliases: ['antilink'], name: '🔗❌ Antilink', desc: 'Blocca link WhatsApp' },
  { key: 'antiLinkUni', store: 'chat', perm: PERM.ADMIN, aliases: ['antilinktutto'], name: '🌍🔗❌ Antilink Uni', desc: 'Blocca ogni tipo di URL' },
  { key: 'antiLink2', store: 'chat', perm: PERM.ADMIN, aliases: ['antilinksocial'], name: '🌐❌ Antilinksocial', desc: 'Blocca link Social' },
  { key: 'reaction', store: 'chat', perm: PERM.ADMIN, aliases: ['reazioni'], groupOnly: true, name: '😎 Reazioni', desc: 'Reazioni automatiche ai msg' },
  { key: 'autolevelup', store: 'chat', perm: PERM.ADMIN, aliases: ['autolvl'], name: '⬆️ Autolivello', desc: 'Notifica passaggio livello' },
  { key: 'antinuke', store: 'chat', perm: PERM.OWNER, aliases: ['antidistruzione'], groupOnly: true, name: '🛡️ Antinuke', desc: 'Protezione raid/distruzione' },
  { key: 'antiprivato', store: 'bot', perm: PERM.OWNER, aliases: ['antipriv'], name: '🔒 Blocco privato', desc: 'Blocca msg in DM' },
  { key: 'soloe', store: 'bot', perm: PERM.sam, aliases: ['soloowner'], name: '👑 Solocreatore', desc: 'Bot solo per Blood' },
  { key: 'autoread', store: 'bot', perm: PERM.OWNER, aliases: ['read'], name: '👀 Lettura', desc: 'Auto-visualizza messaggi' },
  { key: 'anticall', store: 'bot', perm: PERM.sam, aliases: [], name: '❌📞 Antichiamate', desc: 'Rifiuta chiamate VOIP' },
];

const aliasMap = new Map();
for (const feat of featureRegistry) {
  aliasMap.set(feat.key.toLowerCase(), feat);
  for (const alias of feat.aliases) aliasMap.set(alias.toLowerCase(), feat);
}

const adminz = featureRegistry.filter(f => f.perm === PERM.ADMIN);
const ownerz = featureRegistry.filter(f => f.perm === PERM.OWNER || f.perm === PERM.sam);

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isSam }) => {
  const isEnable = /true|enable|attiva|(turn)?on|1/i.test(command);
  const isDisable = /disable|disattiva|off|0/i.test(command);
  const userName = m.pushName || 'User';

  global.db.data.chats = global.db.data.chats || {};
  global.db.data.settings = global.db.data.settings || {};
  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
  const botJid = conn.decodeJid(conn.user.jid);
  const bot = global.db.data.settings[botJid] || (global.db.data.settings[botJid] = {});

  // --- LOGICA MODIFICA STATO ---
  if (args.length > 0 && (isEnable || isDisable)) {
    let type = args[0].toLowerCase();
    const feat = aliasMap.get(type);
    
    if (!feat) return m.reply(`『 ❌ 』 Funzione *${type}* non trovata.`);

    // Controllo permessi
    if (feat.groupOnly && !m.isGroup) return m.reply('『 ❌ 』 Valido solo nei gruppi.');
    if (feat.perm === PERM.sam && !isSam) return m.reply('『 ❌ 』 Solo Blood può farlo.');
    if (feat.perm === PERM.OWNER && !isOwner && !isSam) return m.reply('『 ❌ 』 Solo Blood può farlo.');
    if (feat.perm === PERM.ADMIN && m.isGroup && !(isAdmin || isOwner || isSam)) return m.reply('『 ❌ 』 Devi essere admin.');

    const target = feat.store === 'bot' ? bot : chat;
    const newState = isEnable;

    if (target[feat.key] === newState) return m.reply(`『 ⚠️ 』 *${feat.name}* è già ${newState ? 'ATTIVO' : 'DISATTIVATO'}.`);

    target[feat.key] = newState;
    return m.reply(`『 ✅ 』 *${feat.name}* impostato su: *${newState ? 'ATTIVO' : 'DISATTIVATO'}*`);
  }

  // --- COSTRUZIONE MENU TESTUALE ---
  let menu = `⋆｡˚『 ╭ \`PANEL DI CONTROLLO\` ╯ 』˚｡⋆\n\n`;
  menu += `Ciao *${userName}*, gestisci qui i sistemi di Blood.\n`;
  menu += `Usa: \`${usedPrefix}attiva <funzione>\` o \`${usedPrefix}disattiva <funzione>\`\n\n`;

  const formatList = (list) => {
    return list.map(f => {
      const target = f.store === 'bot' ? bot : chat;
      const status = target[f.key] ? '🟢' : '🔴';
      return `${status} *\`${f.key}\`*\n┃ ╰─ *${f.desc}*`;
    }).join('\n');
  };

  menu += `『 👥 』 *FUNZIONI ADMIN*\n${formatList(adminz)}\n\n`;

  if (isOwner || isSam) {
    menu += `『 👑 』 *FUNZIONI BLOOD*\n${formatList(ownerz)}\n\n`;
  }

  menu += `╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒\n`;
  menu += `*─ׄ✦☾⋆⁺₊✧ BLD-BLOOD ✧₊⁺⋆☽✦─ׅ⭒*`;

  let profilePic;
  try { profilePic = await conn.profilePictureUrl(m.chat, 'image'); } 
  catch { profilePic = 'https://i.ibb.co/kVdFLyGL/sam.jpg'; }

  await conn.sendMessage(m.chat, {
    text: menu,
    contextInfo: {
      externalAdReply: {
        title: "BLD-BLOOD TERMINAL",
        body: "Security & Management Center",
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
