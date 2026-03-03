//plug-in di blood
// Database globale per non perdere i dati durante la sessione
globalThis.archivioMessaggi = globalThis.archivioMessaggi || {};

let handler = async (m, { conn }) => {
  // Comando manuale: mostra la situazione attuale senza resettare
  let chatId = m.chat;
  let dati = globalThis.archivioMessaggi[chatId];

  if (!dati || dati.totali === 0) {
    return m.reply("📊 *STATISTICHE ATTUALI*\n\nNessun messaggio registrato finora in questo gruppo.");
  }

  // Genera Top 3 Attuale
  let classifica = Object.values(dati.utenti)
    .sort((a, b) => b.conteggio - a.conteggio)
    .slice(0, 3);

  let report = `📊 *STATISTICHE IN TEMPO REALE* 📊\n`;
  report += `_Aggiornate a questo istante_\n`;
  report += `──────────────────\n\n`;
  report += `💬 Messaggi totali finora: *${dati.totali}*\n\n`;
  report += `🏆 *TOP 3 ATTUALE:* \n`;

  const medaglie = ['🥇', '🥈', '🥉'];
  classifica.forEach((u, i) => {
    report += `${medaglie[i]} *${u.nome}*: ${u.conteggio} messaggi\n`;
  });

  report += `\n──────────────────\n`;
  report += `👉 _Il conteggio continuerà ad aumentare fino a mezzanotte._`;

  await conn.sendMessage(chatId, { text: report }, { quoted: m });
};

// --- REGISTRAZIONE MESSAGGI ---
handler.before = async function (m) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return; 
  
  let chat = m.chat;
  let user = m.sender;

  if (!globalThis.archivioMessaggi[chat]) {
    globalThis.archivioMessaggi[chat] = { totali: 0, utenti: {} };
  }

  globalThis.archivioMessaggi[chat].totali += 1;
  
  let nome = m.pushName || 'Utente';
  if (!globalThis.archivioMessaggi[chat].utenti[user]) {
    globalThis.archivioMessaggi[chat].utenti[user] = { nome: nome, conteggio: 0 };
  }
  globalThis.archivioMessaggi[chat].utenti[user].conteggio += 1;
};

// --- AUTOMAZIONE MEZZANOTTE (REPORT FINALE E RESET) ---
setInterval(async () => {
    let ora = new Date().getHours();
    let minuti = new Date().getMinutes();
    
    if (ora === 0 && minuti === 0) {
        let gruppi = Object.keys(globalThis.archivioMessaggi);
        for (let gid of gruppi) {
            if (globalThis.conn) { 
                let dati = globalThis.archivioMessaggi[gid];
                if (!dati || dati.totali === 0) continue;

                let classifica = Object.values(dati.utenti)
                    .sort((a, b) => b.conteggio - a.conteggio)
                    .slice(0, 3);

                let reportFinal = `🌙 *RESOCONTO FINALE DELLA GIORNATA* 🌙\n`;
                reportFinal += `──────────────────\n\n`;
                reportFinal += `📊 Totale messaggi del giorno: *${dati.totali}*\n\n`;
                reportFinal += `🏆 *PODIO FINALE:* \n`;

                const medaglie = ['🥇', '🥈', '🥉'];
                classifica.forEach((u, i) => {
                    reportFinal += `${medaglie[i]} *${u.nome}*: ${u.conteggio}\n`;
                });

                reportFinal += `\n✨ *Contatori azzerati. Buonanotte!*`;

                await globalThis.conn.sendMessage(gid, { text: reportFinal });
                // Reset dati solo a mezzanotte
                globalThis.archivioMessaggi[gid] = { totali: 0, utenti: {} };
            }
        }
    }
}, 60000);

handler.help = ['resoconto'];
handler.tags = ['strumenti'];
handler.command = /^(resoconto)$/i;
handler.group = true;

export default handler;
