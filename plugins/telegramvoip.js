import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { NewMessage } from 'telegram/events/index.js'

// --- CONFIGURAZIONE ---
const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const targetBotId = "573215575562"; // ID del bot fornito
const sessionSaved = "";

// Inizializzazione globale dello stato
global.tgVoip = global.tgVoip || {
    client: null,
    conn: null,
    chatId: null,
    isListening: false,
    currentButtons: [] 
};

let handler = async (m, { conn, text }) => {
    if (m.isGroup) return;
    
    // Salviamo la connessione e l'ID chat per rispondere all'utente corretto
    global.tgVoip.conn = conn;
    global.tgVoip.chatId = m.chat;

    try {
        // Connessione al client Telegram se non attivo
        if (!global.tgVoip.client || !global.tgVoip.client.connected) {
            global.tgVoip.client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, { connectionRetries: 5 });
            await global.tgVoip.client.connect();
        }

        // Setup dell'ascoltatore messaggi (solo se non già attivo)
        if (!global.tgVoip.isListening) {
            global.tgVoip.client.addEventHandler(async (event) => {
                const message = event.message;
                if (!message) return;

                // Filtro: processa solo messaggi che provengono dal bot target
                const senderId = message.peerId?.userId?.toString() || message.senderId?.toString();
                if (senderId !== targetBotId) return;

                let testoCorpo = message.message || "";
                let listaNumerata = "";
                let nuoviBottoni = [];

                // Estrazione pulsanti (Inline o Keyboard)
                if (message.replyMarkup && message.replyMarkup.rows) {
                    let count = 1;
                    listaNumerata = "\n\n🔢 *OPZIONI (Rispondi con il numero):*\n";

                    for (const row of message.replyMarkup.rows) {
                        for (const button of row.buttons) {
                            if (button.text) {
                                nuoviBottoni.push({
                                    msg: message,
                                    btn: button
                                });
                                listaNumerata += `*${count}* - ${button.text}\n`;
                                count++;
                            }
                        }
                    }
                }

                // Memorizza i bottoni per la sessione corrente
                global.tgVoip.currentButtons = nuoviBottoni;

                let messaggioFinale = `🤖 *RISPOSTA DA TELEGRAM*\n\n${testoCorpo}${listaNumerata}`;

                if (global.tgVoip.conn && global.tgVoip.chatId) {
                    await global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { text: messaggioFinale });
                }
            }, new NewMessage({ incoming: true }));
            global.tgVoip.isListening = true;
        }

        // Invia il comando iniziale al bot Telegram
        await global.tgVoip.client.sendMessage(targetBotId, { message: text || "/start" });
        await m.react('📡');

    } catch (e) {
        console.error("Errore avvio sessione Telegram:", e);
    }
}

handler.before = async (m) => {
    // Verifiche preliminari: ignora gruppi, comandi con punto o se il client non è pronto
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.tgVoip?.client) return;
    if (m.chat !== global.tgVoip.chatId) return;

    const input = m.text.trim();
    const numeroScelto = parseInt(input);
    const bottoniDisponibili = global.tgVoip.currentButtons || [];

    // LOGICA DI SELEZIONE: Se l'utente invia un numero valido tra le opzioni
    if (!isNaN(numeroScelto) && numeroScelto > 0 && numeroScelto <= bottoniDisponibili.length) {
        try {
            const target = bottoniDisponibili[numeroScelto - 1];
            await m.react('🔘'); // Feedback click effettuato

            // Clicca fisicamente il pulsante su Telegram
            await target.msg.click(target.btn);
            return true; // Blocca ulteriori esecuzioni per questo messaggio
        } catch (err) {
            console.error("Errore durante il click del pulsante:", err);
        }
    }

    // Se non è un numero di un'opzione, invia il testo come messaggio normale (es. codici OTP)
    try {
        await global.tgVoip.client.sendMessage(targetBotId, { message: input });
        await m.react('📤');
    } catch (e) {
        console.error("Errore invio messaggio di testo:", e);
    }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
