let handler = async (m, { conn, command }) => {
  let mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  
  if (mentions.length < 4 || mentions.length > 15) {
    return conn.sendMessage(m.chat, { 
      text: " *Per un'orgia degna di questo nome devi menzionare da 4 a 15 persone seno nemmeno godi* !" 
    }, { quoted: m });
  }

  const tag = (jid) => `@${jid.split('@')[0]}`;
  let p = mentions.sort(() => Math.random() - 0.5).map(tag); // Mischia tutti i partecipanti
  let sufferer = p[Math.floor(Math.random() * p.length)]; // Elegge casualmente chi ha sofferto di più
  
  let story = "";
  const count = mentions.length;

  switch (count) {
    case 4:
      story = `🔥 ${p[0]} blocca le spalle di ${p[1]} mentre ${p[2]} lo penetra con una foga animalesca; nel frattempo ${p[3]} si avventa su entrambi inondandoli di sborra e bava in un groviglio di membra che non lascia spazio al respiro.`;
      break;
    case 5:
      story = `🔞 ${p[0]} e ${p[1]} tengono spalancato ${p[2]} mentre ${p[3]} lo sfonda senza pietà; ${p[4]} osserva la scena eccitato prima di unirsi al massacro spingendo la sua sborra calda nelle gole di tutti i presenti.`;
      break;
    case 6:
      story = `⛓️ È un assalto totale: ${p[0]} domina ${p[1]}, mentre ${p[2]} e ${p[3]} si incastrano in un treno di carne che travolge ${p[4]}; ${p[5]} chiude il cerchio della lussuria marchiando ogni centimetro di pelle con il suo seme bollente.`;
      break;
    case 7:
      story = `🤤 ${p[0]}, ${p[1]} e ${p[2]} formano un triangolo di sesso brutale sopra ${p[3]}, mentre ${p[4]} e ${p[5]} si occupano di sfasciare ogni orifizio di ${p[6]} in un'esplosione di gemiti e fluidi che allaga la stanza.`;
      break;
    case 8:
      story = `🔞 ${p[0]} e ${p[1]} guidano l'assalto su ${p[2]} e ${p[3]}, mentre ${p[4]}, ${p[5]}, ${p[6]} e ${p[7]} si scambiano colpi e sborrate violente, creando un vortice di depravazione dove nessuno è risparmiato e ogni buco viene reclamato.`;
      break;
    case 9:
      story = `🌊 Nove corpi sudati: ${p[0]} strozza ${p[1]} dal piacere, ${p[2]} penetra ${p[3]} con cattiveria, mentre ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]} e ${p[8]} si ammassano in un'orgia di spinte sorde che culmina in una pioggia di sperma collettiva.`;
      break;
    case 10:
      story = `🫦 La carne sbatte senza sosta: ${p[0]} e ${p[1]} aprono la strada a ${p[2]} e ${p[3]}, mentre l'intero gruppo composto da ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]} e ${p[9]} si fonde in un unico ammasso di brividi e umiliazione estrema.`;
      break;
    case 11:
      story = `🔥 Undici peccatori: ${p[0]} viene usato da ${p[1]} e ${p[2]}, mentre ${p[3]}, ${p[4]} e ${p[5]} si accaniscono su ${p[6]}. Il resto del branco (${p[7]}, ${p[8]}, ${p[9]}, ${p[10]}) annega ogni resistenza sotto litri di seme denso e inarrestabile.`;
      break;
    case 12:
      story = `🔞 Un'apocalisse di lussuria: ${p[0]} e ${p[1]} dominano la scena, mentre ${p[2]}, ${p[3]}, ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]}, ${p[9]}, ${p[10]} e ${p[11]} si intrecciano in posizioni impossibili, sventrando ogni dignità residua a suon di spinte ferali.`;
      break;
    case 13:
      story = `⛓️ Tredici ombre nel buio: ${p[0]}, ${p[1]} e ${p[2]} guidano la carica, seguiti da ${p[3]}, ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]}, ${p[8]}, ${p[9]}, ${p[10]}, ${p[11]} e ${p[12]} che si svuotano a turno l'uno dentro l'altro in una catena umana di pura sborra e peccato.`;
      break;
    case 14:
      story = `🤤 Quattordici demoni: ${p[0]} urla mentre ${p[1]} lo possiede, ${p.slice(2, 8).join(', ')} creano una mischia violenta e ${p.slice(8).join(', ')} finiscono il lavoro sommergendo tutti con un'eiaculazione di massa che toglie il fiato.`;
      break;
    case 15:
      story = `🔞 IL MASSACRO TOTALE: Quindici corpi in fiamme. ${p.slice(0, 5).join(', ')} distruggono ogni limite su ${p.slice(5, 10).join(', ')}, mentre i restanti ${p.slice(10).join(', ')} sigillano l'orgia con una scarica di sperma che trasforma la stanza in una pozza di depravazione assoluta.`;
      break;
  }

  let responseText = `🔞 *CRONACHE DELL'ESTASI COLLETTIVA* 🔞\n\n`;
  responseText += `${story}\n\n`;
  responseText += `───────────────\n`;
  responseText += `🏆 *IL PREMIO "CARNE TRITA" DELLA SERATA:* ${sufferer}\n`;
  responseText += `*(Dopo essere stato usato, sfondato e riempito da tutti, è ufficialmente quello che ha sofferto di più per il piacere del gruppo)* 💦💀`;

  await conn.sendMessage(m.chat, {
    text: responseText,
    mentions: mentions
  }, { quoted: m });
};

handler.help = ['orgia'];
handler.tags = ['giochi'];
handler.command = /^(orgia)$/i;

export default handler;
