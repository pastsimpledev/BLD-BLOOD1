let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `🫣 Inserisci il testo!\nEsempio: *${usedPrefix + command} Gaia*`;

    const styles = [
        { name: "Grassetto", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔batch𝐕𝐖batch𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧 batch𝐨𝐩𝐪𝐫𝐬𝐭𝐮batch𝐯𝐰𝐱𝐲𝐳" },
        { name: "Gotico", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟" },
        { name: "Corsivo", map: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃" },
        { name: "Doppia Linea", map: "𝔸mathbb{B}ℂmathbb{D}mathbb{E}mathbb{F}mathbb{G}mathbb{H}mathbb{I}mathbb{J}mathbb{K}mathbb{L}mathbb{M}mathbb{N}mathbb{O}mathbb{P}mathbb{Q}mathbb{R}mathbb{S}mathbb{T}mathbb{U}mathbb{V}mathbb{W}mathbb{X}mathbb{Y}mathbb{Z}𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞batch𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫" },
        { name: "Monospace", map: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅batch𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗 batch𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣" },
        { name: "Sans Bold", map: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠 batch𝗡𝗢𝗣𝗤 batch𝗥𝗦𝗧𝗨 batch𝗩𝗪 batch𝗫𝗬𝗭 batch𝗮𝗯𝗰𝗱𝒆 batch𝗳𝗴𝗵𝗶𝐣𝗸𝗹𝗺 batch𝗻 batch𝗼𝗽𝗾 batch𝗿𝘀𝘁𝘂 batch𝘃 batch𝘄 batch𝘅 batch𝘆 batch𝘇" },
        { name: "Piccolo", map: "ᴀʙᴄᴅᴇғɢʜɪᴊ batchᴋ batchʟ batchᴍ batchɴ batchᴏ batchᴘ batchǫ batchʀ batchs batchᴛ batchᴜ batchᴠ batchᴡ batchx batchʏ batchᴢ" },
        { name: "Cerchiati", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ" },
        { name: "Quadratini", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Sottosopra", map: "∀BƆDƎℲפHIſK˥WNOԀΌᴚS┴∩ΛMX⅄Zɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz" },
        { name: "Ninja", map: "丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺ＳＴＵ∨山メㄚ乙" },
        { name: "Hacker", map: "48CD3F6H1JK1MN0PQЯ57UVWXY248cd3f6h1jk1mn0pqя57uvwxy2" },
        { name: "Greco", map: "αвс∂єƒgнιјκℓмиορφяѕτυνωϰуζ" },
        { name: "Antico", map: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷" },
        { name: "Curvo", map: "αвcdєfghíjklmnσpqrѕtuvωxyz" },
        { name: "Vapor", map: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ" },
        { name: "Taglio", map: "A̸B̸C̸D̸E̸F̸G̸H̸I̸J̸K̸L̸M̸N̸O̸P̸Q̸R̸S̸T̸U̸V̸W̸X̸Y̸Z̸" },
        { name: "Barrato", map: "A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶" },
        { name: "Sottolineato", map: "A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲" },
        { name: "Puntini", map: "A̤B̤C̤D̤E̤F̤G̤H̤I̤J̤K̤L̤M̤N̤O̤P̤Q̤R̤S̤T̤ṲV̤W̤X̤Y̤Z̤" },
        { name: "Nero", map: "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅚🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉" },
        { name: "Inciso", map: "𝔸𝔹ℂmathbb{D}mathbb{E}mathbb{F}mathbb{G}mathbb{H}mathbb{I}mathbb{J}mathbb{K}mathbb{L}mathbb{M}mathbb{N}mathbb{O}mathbb{P}mathbb{Q}mathbb{R}mathbb{S}mathbb{T}mathbb{U}mathbb{V}mathbb{W}mathbb{X}mathbb{Y}mathbb{Z}" },
        { name: "Archi", map: "A⌒B⌒C⌒D⌒E⌒F⌒G⌒H⌒I⌒J⌒K⌒L⌒M⌒N⌒O⌒P⌒Q⌒R⌒S⌒T⌒U⌒V⌒W⌒X⌒Y⌒Z⌒" },
        { name: "Stretto", map: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ" },
        { name: "Matematico", map: "𝛢𝛣𝛤𝛥𝛦𝛧𝛨𝛩𝛪𝛫𝛬𝛭𝛮𝛯𝛰𝛱𝛲𝛴𝛵𝛶𝛷𝛸𝛹𝛺" },
        { name: "Sottile", map: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼batch𝙽 batch𝙾 batch𝙿 batch𝚀 batch𝚁 batch𝚂 batch𝚃 batch𝚄 batch𝚅 batch𝚆 batch𝚇 batch𝚈 batch𝚉" },
        { name: "Elegante", map: "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵" },
        { name: "Glatis", map: "卂乃匚刀乇下厶卄工丁长乚从𠂉口尸㔿尺丂丅凵リ山乂丫乙" },
        { name: "Cinese Fake", map: "ﾑ乃cd乇ｷgんﾉﾌズﾚm刀のｱq尺丂ｲu√wﾒﾘ乙" },
        { name: "Fumetto", map: "A⃠B⃠C⃠D⃠E⃠F⃠G⃠H⃠I⃠J⃠K⃠L⃠M⃠N⃠O⃠P⃠Q⃠R⃠S⃠T⃠U⃠V⃠W⃠X⃠Y⃠Z⃠" }
        // Ho inserito 30 stili primari. Se ne aggiungo 60, WhatsApp taglia il messaggio.
    ];

    const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const convert = (t, mapStr) => {
        let mapArr = [...mapStr];
        return t.split('').map(char => {
            const index = normal.indexOf(char);
            if (index === -1) return char;
            return mapArr[index] || char;
        }).join('');
    };

    let menu = `🎨 *ELENCO FONT DISPONIBILI* 🎨\n\n`;
    menu += `Testo scelto: *${text}*\n\n`;
    
    styles.forEach((s, i) => {
        menu += `${i + 1}. ${convert("BLOOD", s.map)} (${s.name})\n`;
    });

    menu += `\n> *Rispondi a questo messaggio scrivendo solo il NUMERO del font che vuoi applicare a "${text}".*`;

    let { key } = await conn.reply(m.chat, menu, m);

    // Gestore specifico per la risposta
    conn.beforeReply = async (m2) => {
        if (!m2.quoted || m2.quoted.id !== key.id) return;
        let choice = parseInt(m2.text.trim());
        if (!isNaN(choice) && styles[choice - 1]) {
            let result = convert(text, styles[choice - 1].map);
            await conn.reply(m.chat, result, m2);
            delete conn.beforeReply; // Ferma l'ascolto dopo la scelta
        }
    };
};

handler.help = ['font <testo>'];
handler.tags = ['utility'];
handler.command = /^(font)$/i;
handler.group = true;

export default handler;
