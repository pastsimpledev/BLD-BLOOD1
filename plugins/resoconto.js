// plug-in di blood 
let handler = async (m, { conn }) => {
  let chatId = m.chat;

  if (!global.db.data.chats[chatId]?.statsGiornaliere) {
    return m.reply("📊 *STATISTICHE*\n\nNessun dato registrato oggi.");
  }

  let dati = global.db.data.chats[chatId].statsGiornaliere;

  if (dati.totali === 0) {
    return m.reply("📊 *STATISTICHE ATTUALI*\n\nNessun messaggio registrato oggi.");
  }

  let classifica = Object.values(dati.utenti)
    .sort((a, b) => b.conteggio - a.conteggio)
    .slice(0, 5);

  let report = `📊 *STATISTICHE IN TEMPO REALE* 📊\n`;
  report += `──────────────────\n\n`;
  report += `💬 Messaggi totali: *${dati.totali}*\n\n`;
  report += `🏆 *TOP PARLATORI:* \n`;

  const medaglie = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  classifica.forEach((u, i) => {
    report += `${medaglie[i]} *${u.nome}*: ${u.conteggio} messaggi\n`;
  });

  report += `\n──────────────────\n`;
  report += `👉 _Reset automatico a mezzanotte._`;

  await conn.sendMessage(chatId, { text: report }, { quoted: m });
};

// --- REGISTRAZIONE MESSAGGI ---
handler.before = async function (m) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return; 

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  if (!global.db.data.chats[m.chat].statsGiornaliere) {
    global.db.data.chats[m.chat].statsGiornaliere = { totali: 0, utenti: {}, data: new Date().toLocaleDateString('it-IT') };
  }

  let stats = global.db.data.chats[m.chat].statsGiornaliere;
  let oggi = new Date().toLocaleDateString('it-IT');

  // Reset di sicurezza se il bot era spento a mezzanotte
  if (stats.data !== oggi) {
    stats.totali = 0;
    stats.utenti = {};
    stats.data = oggi;
  }

  stats.totali += 1;
  let nome = m.pushName || 'Utente';
  if (!stats.utenti[m.sender]) {
    stats.utenti[m.sender] = { nome: nome, conteggio: 0 };
  }
  stats.utenti[m.sender].conteggio += 1;
};

// --- AUTOMAZIONE MEZZANOTTE ---
let resettato = false; // Flag per evitare invii multipli nello stesso minuto
setInterval(async () => {
    let ora = new Date().getHours();
    let minuti = new Date().getMinutes();

    if (ora === 0 && minuti === 0 && !resettato) {
        resettato = true; 
        let chats = global.db.data.chats;
        
        for (let gid in chats) {
            let dati = chats[gid].statsGiornaliere;
            if (!dati || dati.totali === 0) continue;

            let classifica = Object.values(dati.utenti)
                .sort((a, b) => b.conteggio - a.conteggio)
                .slice(0, 3);

            let reportFinal = `🌙 *RESOCONTO FINALE DELLA GIORNATA* 🌙\n`;
            reportFinal += `──────────────────\n\n`;
            reportFinal += `📊 Totale messaggi: *${dati.totali}*\n\n`;
            reportFinal += `🏆 *PODIO DI OGGI:* \n`;

            const medaglie = ['🥇', '🥈', '🥉'];
            classifica.forEach((u, i) => {
                reportFinal += `${medaglie[i]} *${u.nome}*: ${u.conteggio}\n`;
            });

            reportFinal += `\n✨ *Database pulito. A domani!*`;

            try {
                if (global.conn) await global.conn.sendMessage(gid, { text: reportFinal });
            } catch (e) {
                console.error(`Errore invio report a ${gid}:`, e);
            }

            // PULIZIA: Avviene solo dopo l'invio del messaggio
            chats[gid].statsGiornaliere = { 
                totali: 0, 
                utenti: {}, 
                data: new Date().toLocaleDateString('it-IT') 
            };
        }
    } else if (minuti !== 0) {
        resettato = false; // Ricarica il flag per il giorno dopo
    }
}, 30000); // Controllo ogni 30 secondi

handler.help = ['resoconto'];
handler.tags = ['strumenti'];
handler.command = /^(resoconto)$/i;
handler.group = true;

export default handler;
