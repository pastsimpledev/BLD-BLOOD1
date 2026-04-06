import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  const userName = m.pushName || 'Utente';
  
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {};
  let chat = global.db.data.chats[m.chat];
  let bot = global.db.data.settings[conn.user.jid];

  // Configurazione ContextInfo
  const dynamicContextInfo = {
    externalAdReply: {
      title: "🛡️ BLD-BOT SECURITY SYSTEM",
      body: "Pannello di Controllo Difese",
      mediaType: 1,
      thumbnailUrl: 'https://i.ibb.co/hJW7WwxV/varebot.jpg',
      sourceUrl: 'https://whatsapp.com/channel/0029Vajp6GvK0NBoP7WlR81G'
    }
  };

  const securityFeatures = [
    { key: 'welcome', name: '👋 Welcome', desc: 'Benvenuto' },
    { key: 'antispam', name: '🛑 Antispam', desc: 'Blocca messaggi ripetuti' },
    { key: 'antiBot', name: '🤖 Antibot', desc: 'Espelle altri bot' },
    { key: 'antiLink', name: '🔗 Antilink WA', desc: 'Blocca link gruppi' },
    { key: 'antiLink2', name: '🌐 Antilink Social', desc: 'Blocca link social' },
    { key: 'antinuke', name: '☢️ Antinuke', desc: 'Protezione Admin' },
    { key: 'antitrava', name: '🛡️ Antitrava', desc: 'Blocca messaggi crash' },
    { key: 'antiviewonce', name: '👁️ Antiviewonce', desc: 'Rivela foto temporanee' },
    { key: 'antiporn', name: '🔞 Antiporno', desc: 'Filtro media NSFW' },
    { key: 'detect', name: '📡 Detect', desc: 'Notifica cambi gruppo' }
  ];

  const ownerFeatures = [
    { key: 'antiprivato', name: '🔒 Antiprivato', desc: 'Blocca messaggi in DM' },
    { key: 'anticall', name: '❌📞 Antichiamate', desc: 'Rifiuta chiamate' },
    { key: 'soloCreatore', name: '👑 Solocreatore', desc: 'Solo owner mode' }
  ];

  // SE NON CI SONO ARGOMENTI: Manda la lista comandi
  if (!args.length) {
    let sections = [
      {
        title: "🛡️ FUNZIONI DI SICUREZZA (ADMIN)",
        rows: securityFeatures.map(f => ({
          title: f.name,
          description: f.desc,
          id: `${usedPrefix}attiva ${f.key}`
        }))
      }
    ];

    if (isOwner) {
      sections.push({
        title: "👑 SICUREZZA GLOBALE (OWNER)",
        rows: ownerFeatures.map(f => ({
          title: f.name,
          description: f.desc,
          id: `${usedPrefix}attiva ${f.key}`
        }))
      });
    }

    await conn.sendList(
        m.chat, 
        "🛡️ PANNELLO SICUREZZA", 
        `Ciao ${userName}, seleziona una funzione per attivarla/disattivarla nel sistema BloodBot.`, 
        "IMPOSTAZIONI", 
        null, 
        sections, 
        m,
        { contextInfo: dynamicContextInfo }
    );
    return;
  }

  // LOGICA ATTIVA/DISATTIVA (se riceve argomenti come ".attiva antispam")
  let isEnable = !/disattiva|off|0/i.test(command);
  let type = args[0].toLowerCase();
  let status = '';

  if (securityFeatures.some(f => f.key === type) || type === 'detect') {
    if (!m.isGroup && !isOwner) return m.reply('❌ Solo nei gruppi');
    if (m.isGroup && !isAdmin && !isOwner) return m.reply('🛡️ Solo per Admin');
    
    let key = type === 'detect' ? 'rileva' : type;
    chat[key] = isEnable;
    status = isEnable ? 'ATTIVATO ✅' : 'DISATTIVATO ❌';
  } else if (ownerFeatures.some(f => f.key === type)) {
    if (!isOwner) return m.reply('👑 Solo Owner');
    bot[type] = isEnable;
    status = isEnable ? 'ATTIVATO ✅' : 'DISATTIVATO ❌';
  } else {
    return m.reply('❓ Funzione non trovata.');
  }

  m.reply(`『 🛡️ 』 *SISTEMA AGGIORNATO*\n\nModulo: *${type.toUpperCase()}*\nStato: *${status}*`);
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['sicurezza'];
handler.command = ['attiva', 'disattiva', 'on', 'off', 'enable', 'disable'];

export default handler;
