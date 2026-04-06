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
    currentUser: null,
    chatId: null,
    queue: [],
    monitorTimer: null,
    inactivityTimer: null,
    currentButtons: [],
    isListening: false
};

let handler = async (m, { conn, text }) => {
    if (m.isGroup) return;
    const userId = m.chat;

    // 1. GESTIONE CODA
    if (global.tgVoip.currentUser && global.tgVoip.currentUser !== userId) {
        if (!global.tgVoip.queue.find(q => q.chatId === userId)) {
            global.tgVoip.queue.push({ chatId: userId, name: m.pushName });
        }
        const pos = global.tgVoip.queue.findIndex(q => q.chatId === userId) + 1;
        return m.reply(`⚠️ Bot occupato da un altro utente. Sei in posizione *${pos}*.\nVerrai avvisato quando tocca a te.`);
    }

    // 2. ASSEGNAZIONE UTENTE E CONNESSIONE
    global.tgVoip.currentUser = userId;
    global.tgVoip.chatId = userId;
    global.tgVoip.conn = conn;

    try {
        if (!global.tgVoip.client || !global.tgVoip.client.connected) {
            global.tgVoip.client = new TelegramClient(new StringSession(sessionSaved), apiId, apiHash, { connectionRetries: 5 });
            await global.tgVoip.client.connect();
        }

        if (!global.tgVoip.isListening) {
            global.tgVoip.client.addEventHandler(async (event) => {
                const message = event.message;
                if (!message || !message.peerId) return;
                
                const sender = await message.getSender();
                const senderId = message.senderId?.toString();
                if (sender?.username !== targetBotUsername && senderId !== targetBotUsername) return;

                let testoCorpo = message.message || "";
                let listaNumerata = "";
                let bottoniTrovati = [];

                // Rilevamento OTP
                const otpMatch = testoCorpo.match(/\b\d{6}\b/);
                if (otpMatch) testoCorpo = `🔑 *CODICE RICEVUTO: ${otpMatch[0]}*\n\n` + testoCorpo;

                // Estrazione Bottoni
                if (message.replyMarkup?.rows) {
                    let count = 1;
                    listaNumerata = "\n\n🔘 *SELEZIONA OPZIONE (Invia il numero):*\n";
                    for (const row of message.replyMarkup.rows) {
                        for (const button of row.buttons) {
                            if (button.text && !(message.replyMarkup instanceof Api.ReplyKeyboardMarkup)) {
                                bottoniTrovati.push({ msg: message, btn: button });
                                listaNumerata += `*${count}* - ${button.text}\n`;
                                count++;
                            }
                        }
                    }
                }

                global.tgVoip.currentButtons = bottoniTrovati;

                // Invio a WhatsApp (Solo all'utente attivo)
                if (global.tgVoip.currentUser) {
                    let messaggioFinale = `🤖 *DA TELEGRAM*\n\n${testoCorpo}${listaNumerata}`;
                    await global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { text: messaggioFinale });
                }
            }, new NewMessage({ incoming: true }));
            global.tgVoip.isListening = true;
        }

        // 3. INVIO COMANDO E START TIMER INATTIVITÀ
        await global.tgVoip.client.sendMessage(targetBotUsername, { message: text || "/start" });
        await m.react('📡');
        
        startInactivityTimer();

    } catch (e) {
        console.error("Errore avvio sessione:", e);
        resetSession();
    }
}

handler.before = async (m) => {
    if (m.isGroup || !m.text || m.text.startsWith('.') || !global.tgVoip.currentUser) return;
    if (m.chat !== global.tgVoip.currentUser) return;

    // Se l'utente scrive, resettiamo il timer di inattività (perché è attivo)
    startInactivityTimer();

    const input = m.text.trim();
    const numeroScelto = parseInt(input);
    const bottoni = global.tgVoip.currentButtons || [];

    if (!isNaN(numeroScelto) && bottoni.length > 0 && bottoni[numeroScelto - 1]) {
        try {
            const target = bottoni[numeroScelto - 1];
            await m.react('🔘');
            await target.msg.click(target.btn);
            
            // Attiviamo il monitoraggio di 4 minuti dopo la scelta
            await m.reply("✅ Opzione selezionata. Hai **4 minuti** per ricevere il codice. Tutto ciò che scriverà il bot verrà inoltrato qui.");
            
            if (global.tgVoip.monitorTimer) clearTimeout(global.tgVoip.monitorTimer);
            global.tgVoip.monitorTimer = setTimeout(() => {
                global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { text: "⌛ Tempo monitoraggio scaduto (4 min). Sessione chiusa." });
                resetSession();
            }, 4 * 60 * 1000);

            return;
        } catch (err) {
            console.error("Errore click:", err);
        }
    }

    // Inoltro messaggi normali dell'utente al bot
    try {
        await global.tgVoip.client.sendMessage(targetBotUsername, { message: m.text });
    } catch (e) {
        console.error("Errore inoltro:", e);
    }
}

// --- FUNZIONI DI SERVIZIO ---

function startInactivityTimer() {
    if (global.tgVoip.inactivityTimer) clearTimeout(global.tgVoip.inactivityTimer);
    global.tgVoip.inactivityTimer = setTimeout(() => {
        if (global.tgVoip.currentUser) {
            global.tgVoip.conn.sendMessage(global.tgVoip.chatId, { text: "⏰ Sessione chiusa per inattività (2 min)." });
            resetSession();
        }
    }, 2 * 60 * 1000);
}

function resetSession() {
    if (global.tgVoip.monitorTimer) clearTimeout(global.tgVoip.monitorTimer);
    if (global.tgVoip.inactivityTimer) clearTimeout(global.tgVoip.inactivityTimer);
    
    global.tgVoip.currentUser = null;
    global.tgVoip.currentButtons = [];

    if (global.tgVoip.queue.length > 0) {
        const nextUser = global.tgVoip.queue.shift();
        global.tgVoip.currentUser = nextUser.chatId;
        global.tgVoip.chatId = nextUser.chatId;

        global.tgVoip.conn.sendMessage(nextUser.chatId, { text: "🎟️ È il tuo turno! Hai **2 minuti** per interagire o la sessione passerà al prossimo." });
        startInactivityTimer();
    }
}

handler.help = ['voip']
handler.tags = ['strumenti']
handler.command = ['voip']
handler.private = true 

export default handler
