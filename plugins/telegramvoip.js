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
    isListening: false,
    currentButtons: [] // Memorizza i pulsanti dell'ultimo messaggio per indice
};

let handler = async (m, { conn, text }) => {
    if (m.isGroup) return;
    global.tgVoip.conn = conn;
    global.tgVoip.chatId = m.chat;

    try {
        if (!global.tgVoip.client || !global.tgVoip.client.connected) {
            global.tgVoip.client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, { connectionRetries: 5 });
            await global.tgVoip.client.connect();
        }

        if (!global.tgVoip.isListening) {
            global.tgVoip.client.addEventHandler(async (event) => {
                const message = event.message;
                if (!message) return;

                let testoFinale = "🤖 *RISPOSTA DA TELEGRAM*\n\n" + (message.message || "");
                global.tgVoip.currentButtons = []; // Reset pulsanti correnti

                if (message.replyMarkup && message.replyMarkup.rows) {
                    let indice = 1;
                    let listaTestuale = "\n\n🔘 *SCEGLI UN NUMERO:*\n";
                    
                    for (const row of message.replyMarkup.rows) {
                        for (const button of row.buttons) {
                            if (button.text) {
                                // Salviamo il riferimento al bottone e al messaggio
                                global.tgVoip.currentButtons.push({
                                    msg: message,
                                    btn: button
                                });
                                listaTestuale += `*${indice}* - ${button.text}\n`;
                                indice++;
                            }
                        }
                    }
                    testoFinale += listaTestuale;
                }

                if (global.tgVoip.conn && global.tgVoip.chatId) {
                    await global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { text: testoFinale });
                }
            }, new NewMessage({ incoming: true }));
            global.tgVoip.isListening = true;
        }

        await global.tgVoip.client.sendMessage(targetBotUsername, { message: text || "/start" });
        await m.react('📡');

    } catch (e) {
        m.reply("❌ Errore: " + e.message);
    }
}

handler.before = async (m) => {
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.tgVoip.client) return;
    if (m.chat !== global.tgVoip.chatId) return;

    // Controlliamo se l'utente ha inviato un numero
    const scelta = parseInt(m.text.trim());
    
    if (!isNaN(scelta) && global.tgVoip.currentButtons.length > 0) {
        const index = scelta - 1; // Gli array partono da 0
        if (global.tgVoip.currentButtons[index]) {
            try {
                const target = global.tgVoip.currentButtons[index];
                await m.react('🔘');
                // Esegue il click fisico sul pulsante Telegram associato a quel numero
                await target.msg.click(target.btn);
                return;
            } catch (err) {
                console.error("Errore click numerico:", err);
            }
        }
    }

    // Se non è un numero o non ci sono pulsanti, invia come testo normale
    await global.tgVoip.client.sendMessage(targetBotUsername, { message: m.text });
    await m.react('📤');
}

handler.command = ['voip']
export default handler
