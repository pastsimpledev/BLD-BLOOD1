import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import input from 'input'

const apiId = 2040; 
const apiHash = 'b18441a1ff607e10a989891a5462e627'; 
const targetBot = 'Number_Nest_Bot'; 
const numeroTelefono = '+573215575562';
let sessionSaved = ""; // Incolla qui la stringa quando l'avrai

let client = null;

let handler = async (m, { conn, text }) => {
  if (m.isGroup) return m.reply('❌ Solo in Chat Privata.')

  try {
    if (!client || !client.connected) {
      client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, { connectionRetries: 5 });
      
      await client.start({
        phoneNumber: async () => numeroTelefono,
        password: async () => await input.text("Password 2FA: "),
        phoneCode: async () => await input.text("Codice Telegram: "),
        onError: (err) => console.log("Errore login:", err),
      });

      console.log("✅ SESSIONE GENERATA:", client.session.save());

      // ASCOLTATORE SEMPLIFICATO E ROBUSTO
      client.addEventHandler(async (event) => {
        const message = event.message;
        if (!message || !message.peerId) return;

        try {
          // Otteniamo l'ID del mittente senza usare getSender() che ti dava errore
          const senderId = message.senderId ? message.senderId.toString() : "";
          
          // Cerchiamo di capire se è il bot (spesso i bot hanno ID che iniziano con 5 o simili)
          // Se conosci l'ID del bot è meglio, altrimenti usiamo un controllo sul testo o entità
          if (message.text) {
             await conn.sendMessage(m.chat, { 
                text: `🤖 *TELEGRAM RELAY*\n\n${message.text}`,
                contextInfo: { forwardedNewsletterMessageInfo: { newsletterName: "✧ VOIP RELAY ✧" } }
             });
          }
        } catch (err) { console.log("Errore relay interno:", err) }
      });
    }

    let msg = text ? text : "/start";
    await client.sendMessage(targetBot, { message: msg });
    await m.react('📡');

  } catch (e) {
    console.error(e);
    if (e.message.includes('FLOOD')) {
        m.reply(`⏳ Attendi ${e.seconds} secondi. Telegram ha bloccato le richieste per sicurezza.`);
    } else {
        m.reply(`❌ Errore: ${e.message}`);
    }
  }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
