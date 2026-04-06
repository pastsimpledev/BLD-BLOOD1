import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import input from 'input'

// --- CONFIGURAZIONE ---
const apiId = 2040; 
const apiHash = 'b18441a1ff607e10a989891a5462e627'; 
const targetBot = 'Number_Nest_Bot'; 
const numeroTelefono = '+573215575562';

// IMPORTANTE: Incolla qui la stringa lunga dopo il primo login riuscito
let sessionSaved = ""; 

let client = null;

let handler = async (m, { conn }) => {
  if (m.isGroup) return m.reply('❌ Solo in Chat Privata.')

  try {
    // 1. Inizializzazione Client (Solo se non esiste o è disconnesso)
    if (!client || !client.connected) {
      client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, {
        connectionRetries: 5,
      });

      // Questo blocco invia il codice a Telegram SOLO SE NECESSARIO
      await client.start({
        phoneNumber: async () => numeroTelefono,
        password: async () => await input.text("Inserisci Password 2FA (se attiva): "),
        phoneCode: async () => await input.text("Inserisci il codice ricevuto su Telegram: "),
        onError: (err) => console.log("Errore login:", err),
      });

      console.log("✅ SESSIONE TELEGRAM AVVIATA CON SUCCESSO!");
      console.log("Copia questa stringa in 'sessionSaved' per non ricevere più codici:");
      console.log(client.session.save());

      // 2. Configurazione Ascolto (Relay) - Impostata una sola volta
      client.addEventHandler(async (event) => {
        if (event && event.message) {
          const message = event.message;
          try {
            const sender = await message.getSender();
            if (sender && sender.username === targetBot) {
              let contenuto = message.text || " [Contenuto Multimediale] ";
              await conn.sendMessage(m.chat, {
                text: `🤖 *RISPOSTA DA @${targetBot}*\n\n${contenuto}`,
                contextInfo: {
                  forwardingScore: 999,
                  isForwarded: true,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363232743845068@newsletter',
                    newsletterName: "✧ 𝙱𝙻𝙳-𝙱𝙾𝚃 𝚅𝙾𝙸𝙿 𝚁𝙴𝙻𝙰𝚈 ✧"
                  }
                }
              });
            }
          } catch (e) { /* Messaggio di sistema ignora */ }
        }
      });
    }

    // 3. Azione: Invia /start al bot target
    await client.sendMessage(targetBot, { message: '/start' });
    await m.react('📡')
    
    // Messaggio di feedback su WhatsApp
    if (!sessionSaved && client.session.save()) {
        m.reply("✅ *Connesso!* Ho inviato `/start`.\n\n_Consiglio: controlla la console del server e salva la session_string nel codice per evitare nuovi codici in futuro._")
    }

  } catch (e) {
    console.error(e)
    if (e.message.includes('401')) {
        client = null;
        m.reply('❌ Sessione scaduta. Digita di nuovo `.voip` per ricevere un nuovo codice.')
    } else {
        m.reply(`❌ *ERRORE:* ${e.message}`)
    }
  }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
