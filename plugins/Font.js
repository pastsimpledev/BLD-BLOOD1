let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `🫣 Inserisci il testo!\nEsempio: *${usedPrefix + command} Gaia*`;

    const styles = [
        /* --- CLASSICI & BOLD --- */
        { name: "Blood Bold", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔batch𝐕𝐖batch𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧 batch𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳" },
        { name: "Gothic Dark", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟" },
        { name: "Script Elegante", map: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃" },
        { name: "Double Line", map: "𝔸𝔹ℂmathbb{D}𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝐩𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫" },
        { name: "Sans Black", map: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝒆𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇" },
        
        /* --- SIMBOLI & DECORATI --- */
        { name: "Bolle Bianche", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "Bolle Nere", map: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤𝓿🅦🅧🅨🅩" },
        { name: "Quadratini", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Sottolineato Doppio", pre: "̳", map: "A̳B̳C̳D̳E̳F̳G̳H̳I̳J̳K̳L̳M̳N̳O̳P̳Q̳R̳S̳T̳U̳V̳W̳X̳Y̳Z" },
        
        /* --- DARK & HORROR --- */
        { name: "Vampiro", pre: "⚰️", post: "⚰️", map: "vαmpírσ" }, 
        { name: "Croci", pre: "☦︎", post: "☦︎" },
        { name: "Gocciolante", pre: "🩸", map: "A🩸B🩸C🩸D🩸E🩸F🩸G🩸H🩸I🩸J🩸K🩸L🩸M🩸N🩸O🩸P🩸Q🩸R🩸S🩸T🩸U🩸V🩸W🩸X🩸Y🩸Z", isEmoji: true },
        { name: "Demoniaco", pre: "⛧", post: "⛧" },
        { name: "Teschio", pre: "💀 ", post: " 💀" },
        { name: "Ragnatela", pre: "🕸️", post: "🕸️" },
        
        /* --- ESTERI & STRANI --- */
        { name: "Ninja/Japan", map: "丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺ＳＴＵ∨山メㄚ乙" },
        { name: "Greco", map: "αвс∂єƒgнιјκℓмиορφяѕτυνωϰуζ" },
        { name: "Russo/Fake", map: "ДБCФΞҒGНІЈКLМиОРQЯЅТЦVШХЧZ" },
        { name: "Arabo/Fake", map: "ﾑ乃cd乇ｷgんﾉﾌズﾚm刀のｱq尺丂ｲu√wﾒﾘ乙" },
        
        /* --- GLITCH & HACKER --- */
        { name: "Glitch 1", pre: "░", post: "░" },
        { name: "Glitch 2", pre: "▓▒", post: "▒▓" },
        { name: "Hacker", map: "48CD3F6H1JK1MN0PQЯ57UVWXY2" },
        { name: "Zalgo Mini", pre: "͉", map: "A͉B͉C͉D͉E͉F͉G͉H͉I͉J͉K͉L͉M͉N͉O͉P͉Q͉R͉S͉T͉U͉V͉W͉X͉Y͉Z" },
        
        /* --- DECORATIVI --- */
        { name: "Cuore", pre: "ღ ", post: " ღ" },
        { name: "Frecce", pre: "➵ ", post: " ➵" },
        { name: "Corona", pre: "👑 ", post: " 👑" },
        { name: "Musica", pre: "🎵 ", post: " 🎵" },
        { name: "Scintille", pre: "✨ ", post: " ✨" },
        { name: "Ali", pre: "꧁ ", post: " ꧂" },
        { name: "Fulmini", pre: "⚡ ", post: " ⚡" },
        { name: "Onde", pre: "🌊 ", post: " 🌊" },
        { name: "Fuoco", pre: "🔥 ", post: " 🔥" },
        { name: "Riflesso", pre: "彡 ", post: " 彡" },
        { name: "Parentesi", pre: "【 ", post: " 】" },
        { name: "Petali", pre: "🌸 ", post: " 🌸" },
        { name: "Luna", pre: "🌙 ", post: " 🌙" },
        { name: "Diamante", pre: "💎 ", post: " 💎" },
        { name: "Soldi", pre: "💰 ", post: " 💰" },
        { name: "Vibrazioni", pre: "〰️ ", post: " 〰️" },
        { name: "Spazio", pre: "🚀 ", post: " 🚀" },
        { name: "Daga", pre: "🗡️ ", post: " 🗡️" },
        { name: "Catene", pre: "⛓️ ", post: " ⛓️" },
        { name: "Rose", pre: "🌹 ", post: " 🌹" },
        { name: "Esplosione", pre: "💥 ", post: " 💥" },
        { name: "Traguardo", pre: "🏁 ", post: " 🏁" },
        { name: "Luce", pre: "💡 ", post: " 💡" },
        { name: "Morte", pre: "☠️ ", post: " ☠️" },
        { name: "Alien", pre: "👽 ", post: " 👽" },
        { name: "Robot", pre: "🤖 ", post: " 🤖" }
    ];

    const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const convert = (t, s) => {
        if (s.isEmoji) return t.split('').map(c => s.map.split('')[normal.indexOf(c.toUpperCase())] || c).join('');
        let res = t;
        if (s.map) {
            let mapArr = [...s.map];
            res = t.split('').map(char => {
                const index = normal.indexOf(char);
                if (index === -1) return char;
                return mapArr[index] || mapArr[index % (mapArr.length / 2)] || char;
            }).join('');
        }
        return (s.pre || "") + res + (s.post || "");
    };

    let menu = `🎨 *LABORATORIO FONT (50 STILI)* 🎨\n\n`;
    menu += `Testo da trasformare: *${text}*\n\n`;
    
    styles.forEach((s, i) => {
        menu += `${i + 1}. ${convert("BLOOD", s)} (${s.name})\n`;
    });

    menu += `\n> *Rispondi con il numero desiderato!*`;

    // Divide il menu se troppo lungo (WhatsApp ha limiti di caratteri)
    if (menu.length > 4000) {
        await conn.reply(m.chat, menu.slice(0, 4000), m);
        menu = menu.slice(4000);
    }
    
    let { key } = await conn.reply(m.chat, menu, m);

    conn.ev.on('messages.upsert', async ({ messages }) => {
        let m2 = messages[0];
        if (!m2.message) return;
        const msgText = m2.message.conversation || m2.message.extendedTextMessage?.text;
        const quoted = m2.message.extendedTextMessage?.contextInfo;

        if (quoted && quoted.stanzaId === key.id) {
            let choice = parseInt(msgText);
            if (!isNaN(choice) && styles[choice - 1]) {
                let result = convert(text, styles[choice - 1]);
                await conn.reply(m.chat, `✅ *TESTO GENERATO:*\n\n${result}`, m2);
            }
        }
    });
};

handler.help = ['font <testo>'];
handler.tags = ['utility'];
handler.command = /^(font)$/i;
handler.group = true;

export default handler;
