import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

const DEFAULT_AVATAR_URL = 'https://i.ibb.co/jH0VpAv/default-avatar-profile-icon-of-social-media-user-vector.jpg';

// Helper per testo con bagliore neon
function drawNeonText(ctx, text, x, y, fontSize, color) {
    ctx.save();
    ctx.font = `bold ${fontSize}px Impact, sans-serif`;
    ctx.textAlign = 'center';
    
    // Bagliore esterno
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeText(text, x, y);
    
    // Testo principale
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, x, y);
    ctx.restore();
}

// Genera uno sfondo Tech/Cyberpunk
function generateCyberBackground(ctx, width, height, colors) {
    // Gradiente di base profondo
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0a0c');
    bgGrad.addColorStop(1, colors[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Disegna griglia prospettica
    ctx.strokeStyle = `${colors[0]}22`;
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 60) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 60) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // Particelle luminose
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 4;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        grad.addColorStop(0, colors[0]);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, size * 2, 0, Math.PI * 2); ctx.fill();
    }
}

async function generateMeterImage({ title, percentage, avatarUrl, description, themeColors }) {
    const width = 1080;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Sfondo
    generateCyberBackground(ctx, width, height, themeColors);

    // 2. Caricamento Avatar
    const avatar = await loadImage(avatarUrl).catch(() => loadImage(DEFAULT_AVATAR_URL));

    // 3. Pannello Centrale (Glassmorphism)
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.roundRect(50, 50, width - 100, height - 100, 60);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 4. Titolo
    drawNeonText(ctx, title, width / 2, 160, 130, themeColors[0]);

    // 5. Avatar con cerchi Neon
    const avatarSize = 380;
    const centerX = width / 2;
    const centerY = 450;

    // Glow dietro l'avatar
    const avatarGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, avatarSize / 1.5);
    avatarGlow.addColorStop(0, `${themeColors[0]}44`);
    avatarGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = avatarGlow;
    ctx.beginPath(); ctx.arc(centerX, centerY, avatarSize / 1.5, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, centerX - avatarSize / 2, centerY - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();

    // Ring Neon
    ctx.strokeStyle = themeColors[0];
    ctx.lineWidth = 8;
    ctx.shadowColor = themeColors[0];
    ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(centerX, centerY, avatarSize / 2 + 10, 0, Math.PI * 2); ctx.stroke();

    // 6. Barra di Progresso Cyber
    const barW = 800;
    const barH = 60;
    const barX = (width - barW) / 2;
    const barY = 750;

    // Sfondo barra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 30); ctx.fill();

    // Riempimento con gradiente e bagliore
    if (percentage > 0) {
        const pWidth = (barW * percentage) / 100;
        const grad = ctx.createLinearGradient(barX, 0, barX + pWidth, 0);
        grad.addColorStop(0, themeColors[0]);
        grad.addColorStop(1, themeColors[1]);
        
        ctx.save();
        ctx.shadowColor = themeColors[0];
        ctx.shadowBlur = 15;
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.roundRect(barX, barY, pWidth, barH, 30); ctx.fill();
        ctx.restore();
    }

    // 7. Percentuale e Descrizione
    drawNeonText(ctx, `${percentage}%`, width / 2, 920, 110, themeColors[0]);

    ctx.font = 'italic 45px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText(description, width / 2, 1000);

    return canvas.toBuffer('image/jpeg');
}

const commandConfig = {
    gaymetro: { title: 'GAY-SCANNER', themeColors: ['#FF00FF', '#800080'], getDescription: p => p > 80 ? "REGINA DELLE DRAG!" : p > 50 ? "L'arcobaleno ti segue!" : "Etero al 100% (forse)." },
    lesbiometro: { title: 'LESBO-SCAN', themeColors: ['#FF1493', '#4B0082'], getDescription: p => p > 80 ? "Vibe da Girl Power assoluto!" : "Sguardo magnetico!" : "Solo amiche?" },
    masturbometro: { title: 'FAP-METER', themeColors: ['#FF4500', '#2F4F4F'], getDescription: p => p > 80 ? "Chiama un idraulico per quel braccio!" : "Sessioni intense, eh?" : "Santo subito." },
    fortunometro: { title: 'LUCK-DETECTOR', themeColors: ['#00FF00', '#004400'], getDescription: p => p > 80 ? "Vai a giocare al superenalotto!" : "La fortuna ti sorride." : "Oggi meglio stare a letto." },
    intelligiometro: { title: 'BRAIN-METER', themeColors: ['#00FFFF', '#00008B'], getDescription: p => p > 80 ? "Elon Musk levati proprio!" : "Cervello in fiamme!" : "Caricamento neuroni fallito." },
    bellometro: { title: 'BEAUTY-CHECK', themeColors: ['#FFD700', '#8B4513'], getDescription: p => p > 80 ? "Specchio delle mie brame!" : "Uno schianto!" : "Punta sulla simpatia." }
};

const handler = async (m, { conn, command, text }) => {
    const config = commandConfig[command];
    if (!config) return;

    const targetUser = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
    const targetName = text.trim() || conn.getName(targetUser);

    try {
        await conn.reply(m.chat, `🔍 *Scansione biometrica per ${targetName}...*`, m);

        const avatar = await conn.profilePictureUrl(targetUser, 'image').catch(() => DEFAULT_AVATAR_URL);
        const percentage = Math.floor(Math.random() * 101);

        const imageBuffer = await generateMeterImage({
            title: config.title,
            percentage,
            avatarUrl: avatar,
            description: config.getDescription(percentage),
            themeColors: config.themeColors,
        });

        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: `✅ *Analisi completata per ${targetName}!*`,
            mentions: [targetUser]
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, `❌ Errore nel sistema di scansione.`, m);
    }
};

handler.help = Object.keys(commandConfig).map(cmd => `${cmd} <@tag>`);
handler.tags = ['giochi'];
handler.command = Object.keys(commandConfig);

export default handler;
