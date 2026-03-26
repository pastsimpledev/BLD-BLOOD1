let handler = async (m, { conn }) => {
    // Liste tecniche per comporre le 500 varianti
    const basi = ["Rosa Cipria 🌸", "Nude Caldo 🪵", "Bianco Lattiginoso 🥛", "Trasparente Crystal 💎", "Beige Naturale 🐚", "Pesca Camouflage 🍑", "Rosa Antico 🎀", "Bianco Latte 🕊️", "Fucsia Shimmer 💖", "Milky Rose 🍭", "Pesca Neon 🍊", "Lilla Pastello 🔮", "Avorio Satin 🕯️", "Champagne ✨", "Ghiaccio ❄️"];
    const forme = ["Mandorla Russa 💅", "Square Definita 📐", "Coffin Elegante ⚰️", "Stiletto Audace 👠", "Ballerina Chic 🩰", "Ovale Classica 🥚", "Squoval Moderna 💅"];
    const stili = ["Struttura a Muretto", "French Classico", "French a V (Chevron)", "Babyboomer Sfumato", "Deep French", "Micro-French", "Effetto Marmo", "Effetto Cat-Eye", "French Obliquo", "Effetto Fumo"];
    const colori = ["Nero Profondo 🖤", "Bianco Gesso ⚪", "Rosso Rubino ❤️", "Blu Elettrico 💙", "Oro Specchio 👑", "Argento Glitter 🥈", "Verde Smeraldo 💚", "Bordeaux 🍷", "Lilla 💜", "Rosa Neon 💖"];
    const commenti = [
        "Queste unghie sono perfette per occasioni importanti ma anche per farsi notare! 🔥",
        "Un look da vera regina, eleganza allo stato puro. 👑",
        "Il set ideale per chi vuole unire raffinatezza e carattere. 💎",
        "Semplici, pulite e incredibilmente sexy. Impossibile non guardarle! 😍",
        "Un capolavoro di tecnica che trasforma le mani in gioielli. 💍",
        "Audaci, moderne e con quel tocco di luce che incanta chiunque. 🌟",
        "La scelta perfetta per una donna che ama i dettagli di lusso. 👠"
    ];

    // Generazione del database statico di 500 varianti uniche
    let database_500 = [];
    
    for (let b of basi) {
        for (let f of forme) {
            for (let s of stili) {
                for (let c of colori) {
                    if (database_500.length >= 500) break;
                    
                    let com = commenti[Math.floor(Math.random() * commenti.length)];
                    let frase = `✨ *NAIL ART LUXURY DESIGN* ✨\n\n` +
                                `🌸 *BASE:* ${b}\n` +
                                `💅 *FORMA:* ${f}\n` +
                                `🎨 *STILE:* ${s}\n` +
                                `🌈 *COLORE:* ${c}\n` +
                                `✨ *FINISH:* Extra Lucido Specchiato\n\n` +
                                `📝 _${com}_`;
                    
                    database_500.push(frase);
                }
                if (database_500.length >= 500) break;
            }
            if (database_500.length >= 500) break;
        }
        if (database_500.length >= 500) break;
    }

    // Il bot ne sceglie una a caso dalle 500 create
    const scelta = database_500[Math.floor(Math.random() * database_500.length)];

    await conn.reply(m.chat, scelta, m);
};

handler.help = ['unghie'];
handler.tags = ['giochi'];
handler.command = /^(unghie)$/i;

export default handler;
