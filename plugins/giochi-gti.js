import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'

function drawHeart(ctx, x, y, width, height) {
  const topCurveHeight = height * 0.3;
  ctx.beginPath();
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);
  ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
  ctx.closePath();
}

async function createILoveImage(name) {
    const width = 1080;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    const fontFace = '"Arial Rounded MT Bold", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const firstLineY = height * 0.35;
    const heartSize = 350;
    ctx.fillStyle = 'black';
    ctx.font = `bold 300px ${fontFace}`;
    const iWidth = ctx.measureText('I').width;
    const iX = width / 2 - iWidth / 2 - heartSize / 1.5;
    ctx.fillText('I', iX, firstLineY);
    const heartX = iX + iWidth + heartSize / 1.5;
    const heartY = firstLineY - heartSize / 2;
    drawHeart(ctx, heartX, heartY, heartSize, heartSize);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.fillStyle = 'black';
    let fontSize = 280;
    ctx.font = `bold ${fontSize}px ${fontFace}`;
    const maxTextWidth = width * 0.9;
    while (ctx.measureText(name.toUpperCase()).width > maxTextWidth && fontSize > 40) {
        fontSize -= 10;
        ctx.font = `bold ${fontSize}px ${fontFace}`;
    }
    ctx.fillText(name.toUpperCase(), width / 2, height * 0.75);
    return canvas.toBuffer('image/jpeg');
}

const applicaEffetto = async (m, conn, tipoEffetto, usedPrefix, command) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid?.[0] ? m.mentionedJid[0] : m.sender
    const messaggiHelp = {
        gay: `『 🏳️‍🌈 』 \`Rendi gay qualcuno\`\n\n*Esempio:* ${usedPrefix + command} @utente o quota un'immagine`,
        trans: `『 🏳️‍⚧️ 』 \`Rendi trans qualcuno\`\n\n*Esempio:* ${usedPrefix + command} @utente o quota un'immagine`,
        sborra: `『 💦 』 \`Sborricchia su qualcuno\`\n\n*Esempio:* ${usedPrefix + command} @utente o quota un'immagine`
    }
    if (!m.quoted && !who) return m.reply(messaggiHelp[tipoEffetto])
    try {
        let nomeUtente, bufferImmagine
        if (m.quoted?.mtype === 'imageMessage') {
            bufferImmagine = await m.quoted.download()
            nomeUtente = await conn.getName(m.quoted.sender) || ''
        } else {
            let pp = await conn.profilePictureUrl(who, 'image').catch(() => { throw new Error('L\'utente non ha una foto profilo!') })
            nomeUtente = await conn.getName(who) || ''
            let rispostaImmagine = await fetch(pp)
            bufferImmagine = await rispostaImmagine.arrayBuffer()
        }

        let bufferFinale = await applicaEffettiPride(bufferImmagine, tipoEffetto)
        const messaggi = { 
            gay: [`${nomeUtente} è diventato gay`, `${nomeUtente} è diventato gay o forse lo era gia`],
            trans: [`${nomeUtente} ha cambiato più genere che Netflix categorie.`, `${nomeUtente} è così trans che pure Mauro Rosiello prende appunti.`],
            sborra: [
                `${nomeUtente} è stato battezzato da un geyser... e non era acqua.`,
                `${nomeUtente} è più bagnato/a di una piscina pubblica in agosto.`,
                `${nomeUtente} ha preso uno schizzo così potente che ora servono i tergicristalli.`
            ]
        }
        let messaggioCasuale = messaggi[tipoEffetto][Math.floor(Math.random() * messaggi[tipoEffetto].length)]
        await conn.sendFile(m.chat, bufferFinale, `${tipoEffetto}.jpeg`, `*\`${messaggioCasuale}\`*`, m, false, { mentions: [who] })
    } catch (e) {
        console.error(e);
        await m.reply(e.message || `Errore interno`);
    }
}

async function applicaEffettiPride(bufferImmagine, tipoEffetto) {
    let img = await loadImage(bufferImmagine)
    let canvas = createCanvas(img.width, img.height)
    let ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    if (tipoEffetto === 'sborra') {
        let numeroGocce = Math.min(20, Math.floor((img.width * img.height) / 20000) + 10)
        for (let i = 0; i < numeroGocce; i++) {
            let x = Math.random() * img.width
            let y = Math.random() * img.height
            let dimensione = Math.random() * (img.width * 0.08) + 20
            disegnaGoccia(ctx, x, y, dimensione)
        }
    } else {
        const coloriPride = {
            gay: ['#E40303', '#FF8C00', '#FFED00', '#008563', '#409CFF', '#955ABE'],
            trans: ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA']
        }
        let colori = coloriPride[tipoEffetto]
        ctx.globalAlpha = 0.45
        let gradient = ctx.createLinearGradient(0, 0, 0, img.height)
        colori.forEach((colore, index) => {
            gradient.addColorStop(index / colori.length, colore)
            gradient.addColorStop((index + 1) / colori.length, colore)
        })
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, img.width, img.height)
    }
    return canvas.toBuffer('image/jpeg')
}

function disegnaGoccia(ctx, x, y, dimensione) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.5);

    // Alone di impatto
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, dimensione * 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Nucleo denso
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.moveTo(0, -dimensione);
    ctx.bezierCurveTo(dimensione, -dimensione, dimensione * 1.5, dimensione, 0, dimensione * 1.2);
    ctx.bezierCurveTo(-dimensione * 1.5, dimensione, -dimensione, -dimensione, 0, -dimensione);
    let grad = ctx.createRadialGradient(-dimensione*0.2, -dimensione*0.2, 0, 0, 0, dimensione);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(1, '#DCDCDC');
    ctx.fillStyle = grad;
    ctx.fill();

    // Riflesso lucido
    ctx.beginPath();
    ctx.ellipse(-dimensione * 0.3, -dimensione * 0.4, dimensione * 0.2, dimensione * 0.4, Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();

    // Colatura
    if (Math.random() > 0.4) {
        let len = dimensione * (2 + Math.random() * 2);
        ctx.beginPath();
        ctx.moveTo(0, dimensione * 0.5);
        ctx.lineTo(0, len);
        ctx.lineWidth = dimensione * 0.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, len, dimensione * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const tipoEffetto = command.toLowerCase();
    if (['il', 'ilove'].includes(tipoEffetto)) {
        let name = m.mentionedJid?.[0] ? await conn.getName(m.mentionedJid[0]) : text;
        if (!name) return m.reply(`*Esempio:* ${usedPrefix + command} <nome>`);
        const imageBuffer = await createILoveImage(name);
        await conn.sendFile(m.chat, imageBuffer, 'ilove.jpeg', ``, m);
    } else {
        await applicaEffetto(m, conn, tipoEffetto, usedPrefix, command);
    }
};

handler.help = ['gay', 'trans', 'sborra', 'ilove', 'il'];
handler.tags = ['giochi'];
handler.command = /^(gay|trans|sborra|il|ilove)$/i;

export default handler;
