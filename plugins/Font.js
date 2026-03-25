let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `🫣 Inserisci il testo!\nEsempio: *${usedPrefix + command} Gaia*`;

    const styles = [
        { name: "Grassetto", map: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔batch𝐕𝐖batch𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢batch𝐣𝐤 batch𝐥𝐦 batch𝐧 batch𝐨 batch𝐩 batch𝐪 batch𝐫 batch𝐬 batch𝐭 batch𝐮 batch𝐯 batch𝐰 batch𝐱 batch𝐲 batch𝐳" },
        { name: "Gotico", map: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒 batch𝖓 batch𝖔 batch𝖕 batch𝖖 batch𝖗 batch𝖘 batch𝖙 batch𝖚 batch𝖛 batch𝖜 batch𝖝 batch𝖞 batch𝖟" },
        { name: "Corsivo", map: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶 batch𝓷 batch𝓸 batch𝒑 batch𝒒 batch𝓻 batch𝓼 batch𝓽 batch𝓾 batch𝓿 batch𝔀 batch𝔁 batch𝔂 batch𝔃" },
        { name: "Doppia Linea", map: "mathbb{A}mathbb{B}mathbb{C}mathbb{D}mathbb{E}mathbb{F}mathbb{G}mathbb{H}mathbb{I}mathbb{J}mathbb{K}mathbb{L}mathbb{M}mathbb{N}mathbb{O}mathbb{P}mathbb{Q}mathbb{R}mathbb{S}mathbb{T}mathbb{U}mathbb{V}mathbb{W}mathbb{X}mathbb{Y}mathbb{Z}𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞 batch𝕟 batch𝕠 batch𝕡 batch𝕢 batch𝕣 batch𝕤 batch𝕥 batch𝕦 batch𝕧 batch𝕨 batch𝕩 batch𝕪 batch𝕫" },
        { name: "Monospace", map: "𝙰𝙱|𝙲|𝙳|𝙴|𝙵|𝙶|𝙷|𝙸|𝙹|𝙺|𝙻|𝙼|𝙽|𝙾|𝙿|𝚀|𝚁|𝚂|𝚃|𝚄|𝚅|𝚆|𝚇|𝚈|𝚉|𝚊|𝚋|𝚌|𝚍|𝚎|𝚏|𝚐|𝚑|𝚒|𝚓|𝚔|𝚕|𝚖|𝚗|𝚘|𝚙|𝚚|𝚛|𝚜|𝚝|𝚞|𝚟|𝚠|𝚡|𝚢|𝚣" },
        { name: "Ninja", map: "丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺ＳＴＵ∨山メㄚ乙丹乃匚刀モ下ム卄工ＪＫㄥ爪れ口ㄗＱ尺ＳＴＵ∨山メㄚ乙" },
        { name: "Greco", map: "αвс∂єƒgнιјκℓмиορφяѕτυνωϰуζαвс∂єƒgнιјκℓмиορφяѕτυνωϰуζ" },
        { name: "Cerchiati", map: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜ batchⓝ batchⓞ batchⓟ batchⓠ batchⓡ batchⓢ batchⓣ batchⓤ batchⓥ batchⓦ batchⓧ batchⓨ batchⓩ" },
        { name: "Quadratini", map: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
        { name: "Hacker", map: "48CD3F6H1JK1MN0PQЯ57UVWXY248cd3f6h1jk1mn0pqя57uvwxy2" },
        { name: "Antico", map: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔝𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷" },
        { name: "Sottolineato", map: "A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲" },
        { name: "Barrato", map: "A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̲U̶V̶W̶X̶Y̶Z̶a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̲u̶v̶w̶x̶y̶z̶" },
        { name: "Vapor", map: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ" },
        { name: "Militare", map: "ΛBCDΞFGHIJKLMNθPQRSTUVWXYZΛBCDΞFGHIJKLMNθPQRSTUVWXYZ" },
        { name: "SmallCaps", map: "ᴀʙᴄᴅᴇғɢ batchʜ batchɪ batchᴊ batchᴋ batchʟ batchᴍ batch batchɴ batchᴏ batchᴘ batchǫ batchʀ batchs batchᴛ batch batchᴜ batch batchᴠ batchᴡ batchx batchʏ batchᴢ" }
    ];

    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const transform = (str, map) => {
        let res = "";
        let mapArr = [...map];
        for (let char of str) {
            let index = alpha.indexOf(char);
            if (index !== -1) {
                res += mapArr[index] || char;
            } else {
                res += char;
            }
        }
        return res;
    };

    // Genera direttamente la lista con il TUO testo già convertito
    let resultText = `🎨 *RISULTATI PER: ${text}* 🎨\n\n`;
    
    styles.forEach((s) => {
        resultText += `*${s.name}*:\n${transform(text, s.map)}\n\n`;
    });

    resultText += `> Copia e incolla lo stile che preferisci!`;

    await conn.reply(m.chat, resultText, m);
};

handler.help = ['font <testo>'];
handler.tags = ['utility'];
handler.command = /^(font)$/i;

export default handler;
