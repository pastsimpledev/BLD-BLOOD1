import { createCanvas, loadImage } from 'canvas'

// --- CONFIGURAZIONI ---
const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const fruitURLs = {
    '🍒': 'https://twemoji.maxcdn.com/v/latest/72x72/1f352.png',
    '🍋': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34b.png',
    '🍉': 'https://twemoji.maxcdn.com/v/latest/72x72/1f349.png',
    '🍇': 'https://twemoji.maxcdn.com/v/latest/72x72/1f347.png',
    '🍎': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34e.png',
    '🍓': 'https://twemoji.maxcdn.com/v/latest/72x72/1f353.png'
}
const cavalliConfig = [
    { nome: 'ROSSO', emoji: '🔴', color: '#ff0000' },
    { nome: 'BLU', emoji: '🔵', color: '#0000ff' },
    { nome: 'VERDE', emoji: '🟢', color: '#00ff00' },
    { nome: 'GIALLO', emoji: '🟡', color: '#ffff00' }
]

let handler = async (m, { conn, command, args, usedPrefix }) => {
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    if (user.fiches === undefined) user.fiches = 1000
    let groupName = m.isGroup ? (conn.chats[m.chat]?.subject || 'GUEST') : 'CASINÒ'

    // --- 1. MENU PRINCIPALE ---
    if (command === 'casino') {
        let intro = `*🎰 CASINÒ ${groupName.toUpperCase()} 🎰*\n*💰 SALDO:* *${user.fiches} FICHES*`
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT' }, type: 1 },
            { buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 BLACKJACK' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA' }, type: 1 },
            { buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGORI' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons }, { quoted: m })
    }

    // --- 2. INFO GIOCHI ---
    if (command === 'infoslot') return conn.sendMessage(m.chat, { text: `*🎰 SLOT*\nCosto: 100`, buttons: [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 GIOCA' }, type: 1 }] })
    if (command === 'infobj') return conn.sendMessage(m.chat, { text: `*🃏 BLACKJACK*\nPuntata: 100`, buttons: [{ buttonId: `${usedPrefix}blackjack 100`, buttonText: { displayText: '🃏 GIOCA' }, type: 1 }] })
    if (command === 'infocorsa') {
        const buttons = cavalliConfig.map(c => ({ buttonId: `${usedPrefix}puntacorsa ${c.nome}`, buttonText: { displayText: `${c.emoji} ${c.nome}` }, type: 1 }))
        return conn.sendMessage(m.chat, { text: `*🏇 CORSA*\nScegli un colore:`, buttons })
    }
    if (command === 'inforigore') {
        const buttons = [{ buttonId: `${usedPrefix}rigore sx`, buttonText: { displayText: '⬅️ SX' }, type: 1 }, { buttonId: `${usedPrefix}rigore cx`, buttonText: { displayText: '⬆️ CX' }, type: 1 }, { buttonId: `${usedPrefix}rigore dx`, buttonText: { displayText: '➡️ DX' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: `*⚽ RIGORI*\nDove tiri?`, buttons })
    }

    // --- 3. LOGICHE CON IMMAGINI CANVAS ---

    // 🎰 SLOT (IMMAGINE FIX)
    if (command === 'slot') {
        if (user.fiches < 100) return m.reply('❌ Fiches insufficienti!')
        let r = [fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)]]
        let win = (r[0] === r[1] || r[1] === r[2] || r[0] === r[2])
        user.fiches += win ? 200 : -100

        const canvas = createCanvas(600, 300)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, 600, 300)
        
        // Disegno icone
        try {
            const img1 = await loadImage(fruitURLs[r[0]]), img2 = await loadImage(fruitURLs[r[1]]), img3 = await loadImage(fruitURLs[r[2]])
            ctx.drawImage(img1, 100, 100, 100, 100); ctx.drawImage(img2, 250, 100, 100, 100); ctx.drawImage(img3, 400, 100, 100, 100)
        } catch (e) { console.error(e) }

        ctx.fillStyle = '#fff'; ctx.font = 'bold 30px Sans'; ctx.textAlign = 'center'
        ctx.fillText(win ? '✅ VINTO!' : '❌ PERSO!', 300, 250)

        const buttons = [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* ${user.fiches}`, buttons }, { quoted: m })
    }

    // 🏇 CORSA (IMMAGINE FIX)
    if (command === 'puntacorsa') {
        let scelta = args[0]?.toUpperCase()
        if (!scelta) return m.reply('Scegli un cavallo!')
        let vIdx = Math.floor(Math.random() * 4)
        let vinto = scelta === cavalliConfig[vIdx].nome
        user.fiches += vinto ? 300 : -100

        const canvas = createCanvas(600, 400)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#5d4037'; ctx.fillRect(0, 0, 600, 400) // Pista

        cavalliConfig.forEach((c, i) => {
            let x = (i === vIdx) ? 480 : Math.floor(Math.random() * 200) + 50
            ctx.font = '50px Sans'
            ctx.fillText(i === vIdx ? '🏇' : '🐎', x, 80 + (i * 80))
            ctx.fillStyle = c.color; ctx.fillRect(0, 90 + (i * 80), 600, 2) // Linea corsia
        })

        let cap = `*VINCE:* ${cavalliConfig[vIdx].emoji} *${cavalliConfig[vIdx].nome}*\n${vinto ? '✅ HAI VINTO!' : '❌ HAI PERSO!'}\n*SALDO:* ${user.fiches}`
        const buttons = [{ buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: cap, buttons }, { quoted: m })
    }

    // 🃏 BLACKJACK (IMMAGINE FIX)
    if (command === 'blackjack' || command === 'blakjak') {
        let tu = Math.floor(Math.random() * 10) + 12, banco = Math.floor(Math.random() * 10) + 13
        let win = (tu <= 21 && (tu > banco || banco > 21))
        user.fiches += win ? 100 : -100

        const canvas = createCanvas(600, 300)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#0a5d1e'; ctx.fillRect(0, 0, 600, 300) // Tavolo Verde
        ctx.fillStyle = '#fff'; ctx.font = 'bold 40px Sans'; ctx.textAlign = 'center'
        ctx.fillText(`TU: ${tu}  |  BANCO: ${banco}`, 300, 150)
        ctx.fillText(win ? '🏆 VINTO!' : '💀 PERSO!', 300, 230)

        const buttons = [{ buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* ${user.fiches}`, buttons }, { quoted: m })
    }

    // ⚽ RIGORI (IMMAGINE FIX)
    if (command === 'rigore') {
        let parata = ['sx', 'cx', 'dx'][Math.floor(Math.random() * 3)]
        let tiro = args[0], win = tiro !== parata
        user.fiches += win ? 150 : -100

        const canvas = createCanvas(600, 300)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(0, 0, 600, 300) // Campo
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.strokeRect(150, 50, 300, 200) // Porta
        
        ctx.font = '50px Sans'; ctx.textAlign = 'center'
        ctx.fillText('🧤', parata === 'sx' ? 180 : parata === 'dx' ? 420 : 300, 150) // Portiere
        ctx.fillText('⚽', win ? (tiro === 'sx' ? 180 : tiro === 'dx' ? 420 : 300) : (parata === 'sx' ? 180 : parata === 'dx' ? 420 : 300), win ? 150 : 130)

        const buttons = [{ buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: win ? '⚽ GOL!' : '🧤 PARATA!', buttons }, { quoted: m })
    }
}

handler.command = /^(casino|infoslot|infobj|infocorsa|inforigore|slot|blakjak|blackjack|puntacorsa|rigore)$/i
export default handler
