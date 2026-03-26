let handler = async (m, { conn }) => {
    // Liste tecniche per comporre le 500 varianti statiche
    const basi = ["Rosa Cipria 🌸", "Nude Caldo 🪵", "Bianco Lattiginoso 🥛", "Trasparente Crystal 💎", "Beige Naturale 🐚", "Pesca Camouflage 🍑", "Rosa Antico 🎀", "Bianco Latte 🕊️", "Fucsia Shimmer 💖", "Milky Rose 🍭", "Pesca Neon 🍊", "Lilla Pastello 🔮", "Avorio Satin 🕯️", "Champagne ✨", "Ghiaccio ❄️"];
    const forme = ["Mandorla Russa 💅", "Square Definita 📐", "Coffin Elegante ⚰️", "Stiletto Audace 👠", "Ballerina Chic 🩰", "Ovale Classica 🥚", "Squoval Moderna 💅"];
    const stili = ["Struttura a Muretto", "French Classico", "French a V (Chevron)", "Babyboomer Sfumato", "Deep French", "Micro-French", "Effetto Marmo", "Effetto Cat-Eye", "French Obliquo", "Effetto Fumo"];
    const colori = ["Nero Profondo 🖤", "Bianco Gesso ⚪", "Rosso Rubino ❤️", "Blu Elettrico 💙", "Oro Specchio 👑", "Argento Glitter 🥈", "Verde Smeraldo 💚", "Bordeaux 🍷", "Lilla 💜", "Rosa Neon 💖"];
    const commenti = [
        "Queste unghie sono perfette per occasioni importanti ma anche per farsi notare! 🔥",
        "Un look da vera regina, eleganza allo stato puro. 👑",
        "Il set ideale per chi vuole unire raffinatezza e carattere. 💎",
        "Semplici, pulite e incredibilmente sexy. Impossibile non guardarle! 😍",
        "Un capolavoro di tecnica che trasforma le mani in gioielli. 💍"
    ];

    // Creazione del database statico di 500 frasi
    let database_500 = [];
    for (let b of bais) {
        for (let f of forme) {
            for (let s of stili) {
                for (let c of colori) {
                    let com = commenti[Math.floor(Math.random() * commenti.length)];
                    let frase = `✨ *NAIL ART LUXURY DESIGN* ✨\n\n🌸 *BASE:* ${b}\n💅 *FORMA:* ${f}\n🎨 *STILE:* ${s}\n🌈 *COLORE:* ${c}\n✨ *FINISH:* Extra Lucido Specchiato\n\n📝 _${com}_`;
                    database_500.push(frase);
                }
            }
        }
    }
    
    // Tagliamo esattamente a 500 per rispettare la tua richiesta
    const database_finale = database_500.slice(0, 500);

    // Selezione casuale tra le 500 disponibili
    const scelta = database_finale[Math.floor(Math.random() * database_finale.length)];

    await conn.reply(m.chat, scelta, m);
};

handler.help = ['unghie'];
handler.tags = ['lifestyle'];
handler.command = /^(unghie)$/i;

export default handler;
