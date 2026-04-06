import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'

// --- DATI FISSI ---
const apiId = 2040; 
const apiHash = 'b18441a1ff607e10a989891a5462e627'; 
const targetBotId = "5916422327"; 
const sessionSaved = "1BAAOMTQ5LjE1NC4xNjcuOTEAUB9OQLQkNqxtxPwutWa2/cpTA8jxTWL1WgZojzgQL+RSVbiUMnVC71ydpMfscNdF5bCR9ijjwkkb3SD5/LRFNC+KGpPiJBDNr48MAT1TQZI9WA/Ld/RhjKu2/jThMk5pnJ3pSzDF3eWaD3KOjVqPNRQ5diSpO55KVHvkWp10albKXG1yXFOSOrcT7i8tg+hRNqfIWp334sXiYt6o+WP+JuSQXeheXMRvPIo17H/vVIbQN66hVsxOa/SKQgzzhQD9fXNeOIoSO6owjtJsmbwH1r9b/OB+hZ3J7Xd9o4gjv9clALS2SyB+A/Vs2/V4j/I/oKAFUpS7DbwoVD1oJ5Xh90A";

// Variabile globale persistente
global.voipRelay = global.voipRelay || { client: null, jid: null };

let handler = async (m, { conn, text }) => {
    if (m.isGroup) return;

    // 1. Salva forzatamente il tuo ID WhatsApp
    global.voipRelay.jid = m.chat;

    try {
        // 2. Connessione se non esiste
        if (!global.voipRelay.client || !global.voipRelay.client.connected) {
            console.log("🛠️ Inizializzazione Ponte...");
            global.voipRelay.client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, {
                connectionRetries: 5,
            });
            await global.voipRelay.client.connect();
            
            // 3. ASCOLTATORE DI EVENTI (Il cuore del copia-incolla)
            global.voipRelay.client.addEventHandler(async (event) => {
                const message = event.message;
                if (!message) return;

                const senderId = message.senderId ? message.senderId.toString() : "";
                
                // SE IL MESSAGGIO ARRIVA DAL BOT TELEGRAM
                if (senderId.includes(targetBotId) || senderId === "5916422327") {
                    console.log("📩 Messaggio ricevuto da Telegram, invio a WhatsApp...");
                    
                    if (global.voipRelay.jid) {
                        // COPIA E INCOLLA PURO
                        await conn.sendMessage(global.voipRelay.jid, { 
                            text: message.text || "Messaggio senza testo (forse media)" 
                        });
                    }
                }
            }, new NewMessage({}));
            console.log("✅ Ascoltatore Telegram Attivato.");
        }

        // 4. Invia il comando dell'utente a Telegram
        const msg = text ? text : "/start";
        await global.voipRelay.client.sendMessage("Number_Nest_Bot", { message: msg });
        await m.react('✅');

    } catch (e) {
        console.error("ERRORE VOIP:", e);
        m.reply(`❌ Errore: ${e.message}`);
    }
}

// Funzione per rispondere senza usare .voip
handler.before = async (m, { conn }) => {
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.voipRelay.client) return;
    
    // Se stai scrivendo nella stessa chat dove hai attivato il voip
    if (m.chat === global.voipRelay.jid) {
        try {
            await global.voipRelay.client.sendMessage("Number_Nest_Bot", { message: m.text });
            await m.react('📤');
        } catch (e) {
            console.log("Errore invio automatico:", e);
        }
    }
}

handler.command = ['voip']
handler.private = true 

export default handler
