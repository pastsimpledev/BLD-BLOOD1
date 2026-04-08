import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'

// --- HELPER: DISEGNA CUORE ---
function drawHeart(ctx, x, y, width, height) {
    const topCurveHeight = height * 0.3;
    ctx.save();
    let grad = ctx.createRadialGradient(x, y + topCurveHeight, 10, x, y + topCurveHeight, width);
    grad.addColorStop(0, '#ff4d4d');
    grad.addColorStop(1, '#b30000');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);
    ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
    ctx.fill();
    ctx.restore();
}

// --- EFFETTO: I LOVE ---
async function createILoveImage(name) {
    const canvas = createCanvas(1000, 1000);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1000, 1000);

    const fontFace = 'sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1a1a1a';
    
    ctx.font = `bold 250px ${fontFace}`;
    ctx.fillText('I', 300, 400);
    drawHeart(ctx, 600, 250, 300, 300);

    let fontSize = 200;
    ctx.font = `bold ${fontSize}px ${fontFace}`;
    while (ctx.measureText(name.toUpperCase()).width > 900) {
        fontSize -= 10;
        ctx.font = `bold ${fontSize}px ${fontFace}`;
    }
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 10;
    ctx.fillText(name.toUpperCase(), 500, 750);
    return canvas.toBuffer('image/jpeg');
}

// --- EFFETTO: SBORRA ---
function drawRealisticSplat(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);

    // Corpo principale denso
    let grad = ctx.createRadialGradient(-size*0.2, -size*0.2, 0, 0, 0, size);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.9, '#f2f2f2');
    grad.addColorStop(1, '#d9d9d9');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    for(let i=0; i<10; i++) {
        let ang = (i/10)*Math.PI*2;
        let r = size * (0.8 + Math.random()*0.4);
        ctx.lineTo(Math.cos(ang)*r, Math.sin(ang)*r);
    }
    ctx.closePath();
    ctx.fill();

    // Riflesso "Glossy"
    ctx.beginPath();
    ctx.ellipse(-size*0.3, -size*0.3, size*0.15, size*0.3, Math.PI/4, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
    ctx.restore();
}

// --- LOGICA PRINCIPALE ---
const applicaEffetto = async (m, conn, tipoEffetto, usedPrefix, command) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid?.[0] ? m.mentionedJid[0] : m.sender
    try {
        let bufferImmagine;
        if (m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.mtype === 'viewOnceMessage')) {
            bufferImmagine = await m.quoted.download()
        } else {
            let pp = await conn.profilePictureUrl(who, 'image').catch(() => null)
            if (!pp) return m.reply('❌ L\'utente non ha una foto profilo accessibile.')
            let res = await fetch(pp)
            bufferImmagine = await res.arrayBuffer()
        }

        let img = await loadImage(Buffer.from(bufferImmagine))
        let canvas = createCanvas(img.width, img.height)
        let ctx = canvas.getContext('2d')

        // Sfondo immagine originale
        ctx.drawImage(img, 0, 0)

        if (tipoEffetto === 'sborra') {
            for (let i = 0; i < 15; i++) {
                drawRealisticSplat(ctx, Math.random()*img.width, Math.random()*img.height, (img.width*0.05) + Math.random()*20)
            }
        } else {
            // Overlay Pride di Classe
            const pride = {
                gay: ['#FF0000', '#FF8C00', '#FFEF00', '#008121', '#004CFF', '#760188'],
                trans: ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA']
            }
            let colors = pride[tipoEffetto]
            let grad = ctx.createLinearGradient(0, 0, img.width, img.height)
            colors.forEach((c, i) => grad.addColorStop(i/(colors.length-1), c))
            
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, img.width, img.height);
            
            // Frame / Bordo luminoso
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = img.width * 0.04;
            ctx.strokeStyle = grad;
            ctx.strokeRect(0, 0, img.width, img.height);
        }

        let nome = await conn.getName(who)
        let finalBuffer = canvas.toBuffer('image/jpeg')
        await conn.sendFile(m.chat, finalBuffer, 'result.jpg', `*Effetto ${tipoEffetto} applicato a ${nome}*`, m)
    } catch (e) {
        m.reply('❌ Errore durante l\'elaborazione.')
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const cmd = command.toLowerCase()
    if (cmd === 'il' || cmd === 'ilove') {
        let name = m.mentionedJid?.[0] ? await conn.getName(m.mentionedJid[0]) : text
        if (!name) return m.reply(`Esempio: ${usedPrefix + command} Nome`)
        let buf = await createILoveImage(name)
        await conn.sendFile(m.chat, buf, 'love.jpg', '', m)
    } else {
        await applicaEffetto(m, conn, cmd, usedPrefix, command)
    }
}

handler.command = /^(gay|trans|sborra|il|ilove)$/i
export default handler
