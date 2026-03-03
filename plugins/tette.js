// Database temporaneo per il ranking
globalThis.tetteRank = globalThis.tetteRank || {};

let handler = async (m, { conn }) => {

  let user = null;

  if (m.mentionedJid && m.mentionedJid[0]) {
    user = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    user = m.quoted.sender;
  }

  if (!user) return m.reply('Devi menzionare qualcuno 😏');

  // --- LOGICA MISURE REALI ---
  const taglieItaliane = ['1ª', '2ª', '3ª', '4ª', '5ª', '6ª', '7ª', '8ª'];
  const coppe = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Distribuzione pesata: la 2ª, 3ª e 4ª con coppe B/C sono le più comuni
  let numero = taglieItaliane[Math.floor(Math.random() * taglieItaliane.length)];
  let coppa = coppe[Math.floor(Math.random() * coppe.length)];

  // --- DETERMINAZIONE RARITÀ E LOGICA ---
  let roll = Math.random();
  let rarita = 'COMMON';
  let fortuna = Math.floor(Math.random() * 101);

  if (roll > 0.97) {
    rarita = 'MYTHIC 🔱';
    numero = '10ª'; // Misura extra-ordinaria
    coppa = 'H';    // Coppa enorme
  } else if (roll > 0.85) {
    rarita = 'LEGENDARY 🔥';
    numero = ['6ª', '7ª', '8ª'][Math.floor(Math.random() * 3)];
    coppa = ['E', 'F', 'G'][Math.floor(Math.random() * 3)];
  } else if (roll > 0.65) {
    rarita = 'EPIC ⚡';
    coppa = ['D', 'E'][Math.floor(Math.random() * 2)];
  } else if (roll > 0.40) {
    rarita = 'RARE ⭐';
    coppa = 'C';
  }

  // 10% possibilità di misura "mini" (reale ma piccola)
  if (Math.random() < 0.10) {
    numero = '1ª';
    coppa = 'A';
    rarita = 'PETITE ✨';
  }

  let misuraCompleta = `${numero} Coppa ${coppa}`;

  // Ranking
  if (!globalThis.tetteRank[user]) globalThis.tetteRank[user] = 0;
  globalThis.tetteRank[user] += 1;

  let testo = `🔍 *ANALISI VOLUMETRICA* 🔍\n\n` +
    `L'utente @${user.split('@')[0]} ha una:\n` +
    `👙 *${misuraCompleta}*\n\n` +
    `🎲 Rarità: *${rarita}*\n` +
    `🍀 Fortuna: *${fortuna}%*\n` +
    `🏆 Livello Caos: *${globalThis.tetteRank[user]}*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo,
      mentions: [user]
    },
    { quoted: m }
  );
};

handler.help = ['tette'];
handler.tags = ['giochi'];
handler.command = /^(tette)$/i;
handler.group = true;

export default handler;
