// Plugin fatto da deadly

const handler = async (m, { conn, args, usedPrefix, command }) => {
  // Controllo globale se il bot deve rispondere (basato sulla tua preferenza salvata)
  if (global.opts && !global.opts['risposte'] && command !== 'flamehelp') return;

  if (!m.isGroup) {
    return m.reply('⚠️ Le fiamme ardono solo nei gruppi!');
  }

  // Identificazione della vittima
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
  
  if (!who) {
    return m.reply(`🔥 *FLAME ACTIVATED* 🔥\n\nTaggala persona o rispondi a un suo messaggio per iniziare la battaglia!\n\nEsempio: ${usedPrefix + command} @utente`);
  }

  // Impedisce di flammare il bot
  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  if (who === botNumber) {
    return m.reply('😏 Carino... ma non puoi flammare il tuo creatore (o chi ti tiene acceso). Prova con qualcun altro!');
  }

  const victim = who;
  const attacker = m.sender;
  const victimName = '@' + victim.split('@')[0];
  const attackerName = '@' + attacker.split('@')[0];

  // Verifica robusta della presenza nel gruppo
  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants.map(p => p.id);
  
  if (!participants.includes(victim)) {
    return m.reply('❌ Questa persona non è nel gruppo! Probabilmente è scappata per la paura.');
  }

  // --- INIZIO BATTAGLIA ---
  const startMsg = `
╔══════════════════════╗
   🔥 *FLAME WAR INIZIATA* 🔥
╚══════════════════════╝

👊 *Sfidante:* ${attackerName}
🎯 *Vittima:* ${victimName}

⏱️ *Durata:* 3 minuti
⚡ *Intensità:* 100%

💬 *Il bot attacca per primo!*
  `;

  await conn.sendMessage(m.chat, {
    text: startMsg,
    mentions: [attacker, victim]
  }, { quoted: m });

  let battleActive = true;
  let flameCount = 0;
  const duration = 3 * 60 * 1000; // 3 minuti

  const generateFlame = (target, count) => {
    const flames = [
      `🔊 Ehi ${target}, hai finito la connessione o sei sempre così lento?`,
      `🎭 ${target} sembri un bug di WhatsApp... nessuno ti vuole!`,
      `📱 ${target} la tua foto profilo è imbarazzante quanto i tuoi messaggi!`,
      `⚡ ${target} se la stupidità volasse, saresti un aereo!`,
      `💅 ${target} anche tuo nonno scrive meglio di te!`,
      `🍝 ${target} sei più noioso della pasta in bianco!`,
      `🤡 ${target} sei la prova che anche i cloni possono essere scemi!`,
      `🎪 ${target} sei come il circo, ma senza talento!`,
      `📉 ${target} le tue statistiche di vita sono in negativo!`,
      `🎯 ${target} se ti cercano su Google, esce "errore di sistema"!`,
      `🚀 ${target} sei la ragione per cui esiste il tasto blocca!`,
      `💀 ${target} il karma ti sta preparando un bel regalo!`,
      `📡 ${target} il segnale è arrivato, ma il cervello no!`,
      `⚰️ ${target} quando sei nato, la natura ha chiesto scusa!`,
      `🎬 ${target} la tua vita è un film horror... di quelli recitati male!`
    ];

    if (count > 0 && count % 5 === 0) {
      const specials = [
        `🔥 *ATTACCO SPECIALE* 🔥\n\n${target}, sei così scarso che persino la mia RAM sta ridendo di te!`,
        `⚡ *COMBO CRITICA* ⚡\n\n${target}, arrenditi! Ogni tua risposta abbassa il QI medio del gruppo!`
      ];
      return specials[Math.floor(Math.random() * specials.length)];
    }
    return flames[Math.floor(Math.random() * flames.length)];
  };

  // Handler per le risposte della vittima
  const battleHandler = async (chatUpdate) => {
    if (!battleActive) return;
    const m2 = chatUpdate.messages[0];
    if (!m2.message) return;
    
    const messageContent = m2.message.conversation || m2.message.extendedTextMessage?.text || "";
    const sender = m2.key.participant || m2.key.remoteJid;

    // Se la vittima risponde al bot o scrive nel gruppo
    if (sender === victim && m2.key.remoteJid === m.chat) {
        flameCount++;
        const reply = generateFlame(victimName, flameCount);
        
        await new Promise(res => setTimeout(res, 1000)); // Delay umano
        await conn.sendMessage(m.chat, { text: reply, mentions: [victim] }, { quoted: m2 });
    }
  };

  // Registra il listener
  conn.ev.on('messages.upsert', battleHandler);

  // Primo attacco
  setTimeout(async () => {
    await conn.sendMessage(m.chat, { text: generateFlame(victimName, 0), mentions: [victim] });
  }, 2000);

  // Timer di chiusura
  setTimeout(async () => {
    if (battleActive) {
      battleActive = false;
      conn.ev.off('messages.upsert', battleHandler); // Rimuove il listener

      const endMsg = `
╔══════════════════════╗
   ⏱️ *TEMPO SCADUTO!* ⏱️
╚══════════════════════╝

🥊 *Il bot vince per KO tecnico!*

📊 *Resoconto:*
• Vittima: ${victimName}
• Colpi subiti: ${flameCount + 1}
• Danni morali: 100% 💀

*Vuoi scappare?* Corri per 2,5km (sono circa **3.750 passi**)!
      `;
      await conn.sendMessage(m.chat, { text: endMsg, mentions: [victim] });
    }
  }, duration);
};

// --- SOTTOCOMANDI ---
handler.help = ['flame @user', 'flamestats'];
handler.tags = ['giochi'];
handler.command = ['flame', 'flamestats', 'flamehelp'];
handler.group = true;

export default handler;
