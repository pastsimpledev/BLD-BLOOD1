import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'

// --- CONFIGURAZIONE ---
const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const targetBotUsername = "Number_Nest_Bot";
const sessionSaved = "1BAAOMTQ5LjE1NC4xNjcuOTEAUB9OQLQkNqxtxPwutWa2/cpTA8jxTWL1WgZojzgQL+RSVbiUMnVC71ydpMfscNdF5bCR9ijjwkkb3SD5/LRFNC+KGpPiJBDNr48MAT1TQZI9WA/Ld/RhjKu2/jThMk5pnJ3pSzDF3eWaD3KOjVqPNRQ5diSpO55KVHvkWp10albKXG1yXFOSOrcT7i8tg+hRNqfIWp334sXiYt6o+WP+JuSQXeheXMRvPIo17H/vVIbQN66hVsxOa/SKQgzzhQD9fXNeOIoSO6owjtJsmbwH1r9b/OB+hZ3J7Xd9o4gjv9clALS2SyB+A/Vs2/V4j/I/oKAFUpS7DbwoVD1oJ5Xh90A";

global.tgVoip = global.tgVoip || {
    client: null,
    conn: null,
    chatId: null,
    isListening: false
};

let handler = async (m, { conn, text }) => {
    if (m.isGroup) return;

    global.tgVoip.conn = conn;
    global.tgVoip.chatId = m.chat;

    try {
        if (!global.tgVoip.client || !global.tgVoip.client.connected) {
            console.log("📡 Connessione a Telegram...");
            global.tgVoip.client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, {
                connectionRetries: 5,
            });
            await global.tgVoip.client.connect();
        }

        // Registra l'evento solo se non è già attivo
        if (!global.tgVoip.isListening) {
            global.tgVoip.client.addEventHandler(async (event) => {
                const message = event.message;
                
                // Verifichiamo che il messaggio provenga dal bot target
                // Usiamo peerId per sicurezza
                if (message.peerId) {
                    console.log("📥 Messaggio ricevuto da Telegram...");
                    
                    let testata = "🤖 *RISPOSTA DA TELEGRAM*\n\n";
                    let corpo = message.message || "_[Messaggio vuoto o Media]_";
                    
                    if (global.tgVoip.conn && global.tgVoip.chatId) {
                        await global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { 
                            text: testata + corpo 
                        });
                    }
                }
            }, new NewMessage({ incoming: true }));
            global.tgVoip.isListening = true;
        }

        const command = text ? text : "/start";
        await global.tgVoip.client.sendMessage(targetBotUsername, { message: command });
        await m.react('⏳');

    } catch (e) {
        console.error(e);
        m.reply("❌ Errore durante la connessione a Telegram.");
    }
}

// Gestore per i messaggi successivi (scrivere normalmente in chat)
handler.before = async (m) => {
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.tgVoip.client) return;
    
    // Se l'utente scrive nella chat dove è attivo il servizio
    if (m.chat === global.tgVoip.chatId) {
        try {
            await global.tgVoip.client.sendMessage(targetBotUsername, { message: m.text });
            await m.react('📤');
        } catch (e) {
            console.error("Errore inoltro:", e);
        }
    }
}

handler.help = ['voip']
handler.tags = ['tools']
handler.command = ['voip']
handler.private = true

export default handler
