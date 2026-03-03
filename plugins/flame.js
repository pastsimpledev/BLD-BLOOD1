const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply('⚠️ Le fiamme ardono solo nei gruppi!');
  }

  // Prendi la vittima (chi è taggato o risposto)
  let who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if (!who) {
    return m.reply(`🔥 *FLAME ACTIVATED* 🔥\n\nTaggala persona o rispondi a un suo messaggio per iniziare la battaglia!\n\nEsempio: ${usedPrefix + command} @utente`);
  }

  // Non si può flammare il bot stesso
  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  if (who === botNumber) {
    return m.reply('😏 Non puoi flammare il bot... o forse sì? Inizia tu!');
  }

  const victim = who;
  const attacker = m.sender;
  const victimName = '@' + victim.split('@')[0];
  const attackerName = '@' + attacker.split('@')[0];

  // Verifica che la vittima sia nel gruppo
  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants.map(p => p.id);
  
  if (!participants.includes(victim)) {
    return m.reply('❌ Questa persona non è nel gruppo!');
  }

  // Inizia la battaglia
  const startMsg = `
╔══════════════════════╗
   🔥 *FLAME WAR INIZIATA* 🔥
╚══════════════════════╝

👊 *Sfidante:* ${attackerName}
🎯 *Vittima:* ${victimName}

⏱️ *Durata:* 3 minuti
⚡ *Intensità:* 100%

💬 *Il bot attacca!*
  `;

  await conn.sendMessage(m.chat, {
    text: startMsg,
    mentions: [attacker, victim]
  }, { quoted: m });

  // Aspetta un po' per il primo attacco
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Variabili per la battaglia
  let battleActive = true;
  let lastMessageId = null;
  let flameCount = 0;
  const startTime = Date.now();
  const duration = 3 * 60 * 1000; // 3 minuti

  // Funzione per generare flame
  const generateFlame = (target, attacker, count) => {
    const flames = [
      // Attacchi base
      `🔊 Ehi ${target}, hai finito la connessione o sei sempre così lento?`,
      `🎭 ${target} sembri un bug di WhatsApp... nessuno ti vuole!`,
      `📱 ${target} la tua foto profilo è imbarazzante quanto i tuoi messaggi!`,
      `⚡ ${target} se la stupidità volasse, saresti un aereo!`,
      `💅 ${target} anche tuo nonno scrive meglio di te!`,
      `🍝 ${target} sei più noioso della pasta in bianco!`,
      
      // Attacchi medi
      `🤡 ${target} sei la prova che anche i cloni possono essere unici... unici scemi!`,
      `🧟 ${target} sembri uscito da Tinder... deludente!`,
      `🎪 ${target} sei come il circo, ma senza talento!`,
      `📉 ${target} le tue statistiche di vita sono in negativo!`,
      `🎰 ${target} nella lotteria della vita, hai vinto il premio sfiga!`,
      `🎯 ${target} se ti cercano su Google, esce "esempio di errore umano"!`,
      
      // Attacchi forti
      `👑 ${target} anche il tuo psicologo ti ha abbandonato!`,
      `🚀 ${target} sei la ragione per cui esiste il tasto blocca!`,
      `💀 ${target} il karma ti sta preparando un bel regalo!`,
      `🎭 ${target} sei più finto dei like comprati!`,
      `📡 ${target} il segnale è arrivato, ma il cervello no!`,
      `🌋 ${target} stai più sui nervi di una pubblicità prima di un video!`,
      
      // Attacchi epici
      `⚰️ ${target} quando sei nato, la natura ha fatto un errore!`,
      `👻 ${target} sei la persona che WhatsApp vuole eliminare!`,
      `🎬 ${target} la tua vita è un film horror... di quelli brutti!`,
      `🏆 ${target} hai vinto il premio come miglior utente... da bloccare!`,
      `🌪️ ${target} sei come una tempesta: distruttivo e nessuno ti vuole!`,
      `🎪 ${target} sei il pagliaccio del gruppo, ma senza trucco!`
    ];

    // Flame personalizzato in base al conteggio
    const specialFlames = [
      `🔥 *ATTACCO SPECIALE ${count}* 🔥\n\n${target} hai fatto arrabbiare il bot! Ora scateno le API dell'insulto: SEI SCADENTE!`,
      `⚡ *COMBO ${count}* ⚡\n\n${target} resisti ancora? Io mi stanco di insultarti!`,
      `💫 *SUPER FLAME ${count}* 💫\n\n${target} i tuoi messaggi fanno male agli occhi!`,
      `🎯 *CRITICAL HIT ${count}* 🎯\n\n${target} sei la pecora nera del gruppo... anzi la pecora spenta!`
    ];

    if (count % 5 === 0 && count > 0) {
      return specialFlames[Math.floor(Math.random() * specialFlames.length)];
    }

    return flames[Math.floor(Math.random() * flames.length)];
  };

  // Funzione per gestire la battaglia
  const battleHandler = async (message) => {
    if (!battleActive) return;
    
    // Controlla se il tempo è scaduto
    if (Date.now() - startTime > duration) {
      battleActive = false;
      const endMsg = `
╔══════════════════════╗
   ⏱️ *FLAME WAR TERMINATA* ⏱️
╚══════════════════════╝

👑 *Vincitore:* Il bot 🏆
💪 *Insulti totali:* ${flameCount}
📊 *Danni inflitti:* ${flameCount * 100}%

🔥 Alla prossima battaglia!
      `;
      
      await conn.sendMessage(m.chat, {
        text: endMsg,
        mentions: [attacker, victim]
      });
      return true;
    }

    // Se il messaggio è della vittima e sta rispondendo al bot
    if (message.sender === victim && message.quoted && message.quoted.sender === botNumber) {
      flameCount++;
      
      // Il bot risponde con una flame
      const botReply = generateFlame(victimName, attackerName, flameCount);
      
      await conn.sendMessage(m.chat, {
        text: botReply,
        mentions: [victim]
      }, { quoted: message });
      
      return false;
    }
    
    return false;
  };

  // Primo attacco del bot
  const firstAttack = generateFlame(victimName, attackerName, 0);
  const sentMsg = await conn.sendMessage(m.chat, {
    text: firstAttack,
    mentions: [victim]
  });

  lastMessageId = sentMsg.key.id;

  // Listener per i messaggi successivi
  conn.ev.on('messages.upsert', async (messageUpdate) => {
    const newMessage = messageUpdate.messages[0];
    
    // Ignora messaggi del bot e fuori da questo gruppo
    if (newMessage.key.fromMe) return;
    if (newMessage.key.remoteJid !== m.chat) return;
    
    const ended = await battleHandler(newMessage);
    
    if (ended) {
      // Rimuovi il listener quando la battaglia finisce
      conn.ev.off('messages.upsert', battleHandler);
    }
  });

  // Timer per terminare automaticamente dopo 3 minuti
  setTimeout(async () => {
    if (battleActive) {
      battleActive = false;
      const timeoutMsg = `
╔══════════════════════╗
   ⏰ *TEMPO SCADUTO!* ⏰
╚══════════════════════╝

🔥 La battaglia è durata 3 minuti!
🥊 Il bot vince per KO tecnico!

📊 *Statistiche finali:*
• Insulti del bot: ${flameCount + 1}
• Risposte della vittima: ${flameCount}
• Danni: 100% al morale 💀
      `;
      
      await conn.sendMessage(m.chat, {
        text: timeoutMsg,
        mentions: [attacker, victim]
      });
      
      conn.ev.off('messages.upsert', battleHandler);
    }
  }, duration);
};

// Comandi extra per divertimento
handler.flameStats = async (m, { conn }) => {
  const stats = `
╔══════════════════════╗
   📊 *STATISTICHE FLAME* 📊
╚══════════════════════╝

🔥 *Record di gruppo:* 47 insulti
⚡ *Miglior flamer:* @${m.sender.split('@')[0]}
💀 *Più flammato:* @utente_sfigato
🎯 *Precisione bot:* 100%

📈 *Ultime battaglie:* 3 vinte, 0 perse
  `;
  
  await conn.sendMessage(m.chat, {
    text: stats,
    mentions: [m.sender]
  }, { quoted: m });
};

handler.flameHelp = async (m, { conn, usedPrefix }) => {
  const help = `
╔══════════════════════╗
   🔥 *MANUALE FLAME* 🔥
╚══════════════════════╝

📌 *COMANDI DISPONIBILI:*

${usedPrefix}flame @utente
• Inizia una battaglia con l'utente taggato

${usedPrefix}flame (rispondendo a un msg)
• Inizia una battaglia con chi ha scritto

${usedPrefix}flamestats
• Mostra le statistiche delle battaglie

⚔️ *REGOLE:*
• La battaglia dura 3 minuti
• Ogni volta che la vittima risponde, il bot contrattacca
• Se nessuno risponde, il bot vince per KO tecnico

🎯 *STRATEGIA:*
Più rispondi, più il bot ti insulta!
  `;
  
  await m.reply(help);
};

// Configurazione principale
handler.help = [
  'flame @utente - Inizia una battaglia di insulti (3 minuti)',
  'flamestats - Statistiche flame',
  'flamehelp - Istruzioni'
];

handler.tags = ['giocji'];
handler.command = ['flame', 'flamestats', 'flamehelp'];
handler.group = true;

// Gestione sottocomandi
handler.execute = async (m, { conn, args, usedPrefix, command }) => {
  if (command === 'flamestats') {
    await handler.flameStats(m, { conn });
  } else if (command === 'flamehelp') {
    await handler.flameHelp(m, { conn, usedPrefix });
  } else {
    await handler(m, { conn, args, usedPrefix, command });
  }
};

export default handler;