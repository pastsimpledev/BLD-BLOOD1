import { createCanvas, loadImage } from 'canvas'

// Configurazione icone Slot
const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const fruitURLs = {
    '🍒': 'https://twemoji.maxcdn.com/v/latest/72x72/1f352.png',
    '🍋': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34b.png',
    '🍉': 'https://twemoji.maxcdn.com/v/latest/72x72/1f349.png',
    '🍇': 'https://twemoji.maxcdn.com/v/latest/72x72/1f347.png',
    '🍎': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34e.png',
    '🍓': 'https://twemoji.maxcdn.com/v/latest/72x72/1f353.png'
}

// Configurazione Cavalli
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
    let groupName = m.isGroup ? (conn.chats[m.chat]?.subject || 'GUEST') : 'CASINÒ PRIVATO'

    // --- 1. MENU PRINCIPALE ---
    if (command === 'casino') {
        let intro = `*🎰 BENVENUTO NEL CASINÒ DI ${groupName.toUpperCase()} 🎰*\n\n`
        intro += `*CIAO* *@${m.sender.split('@')[0]}!* *SCEGLI IL TUO TAVOLO PER INIZIARE A VINCERE:* \n\n`
        intro += `*💰 SALDO ATTUALE:* *${user.fiches} FICHES*\n`
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT MACHINE' }, type: 1 },
            { buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 BLACKJACK' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA CAVALLI' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons, mentions: [m.sender] }, { quoted: m })
    }

    // --- 2. GESTIONE DESCRIZIONI (INFO) ---
    if (command === 'infoslot') {
        let desc = `*🎰 SLOT MACHINE*\n\n*ALLINEA I FRUTTI PER VINCERE IL JACKPOT!*\n*COSTO: 100 FICHES*`
        const buttons = [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 GIOCA (100)' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: desc, buttons }, { quoted: m })
    }

    if (command === 'infobj') {
        let desc = `*🃏 BLACKJACK*\n\n*AVVICINATI A 21 SENZA SBALLARE PER BATTERE IL BANCO!*\n*PUNTATA: 100 FICHES*`
        const buttons = [{ buttonId: `${usedPrefix}blakjak 100`, buttonText: { displayText: '🃏 GIOCA (100)' }, type: 1 }]
        return conn.sendMessage(m.chat, { text: desc, buttons }, { quoted: m })
    }

    if (command === 'infocorsa') {
        let desc = `*🏇 CORSA CAVALLI*\n\n*PUNTA SUL COLORE VINCENTE PER TRIPLICARE LA POSTA!*\n*COSTO: 100 FICHES*`
        const buttons = cavalliConfig.map(c => ({
            buttonId: `${usedPrefix}puntacorsa ${c.nome}`,
            buttonText: { displayText: `${c.emoji} ${c.nome}` },
            type: 1
        }))
        return conn.sendMessage(m.chat, { text: desc, buttons }, { quoted: m })
    }

    // --- 3. LOGICA SLOT ---
    if (command === 'slot') {
        if (user.fiches < 100) return m.reply('*❌ FICHES INSUFFICIENTI!*')
        let r1 = fruits[Math.floor(Math.random() * fruits.length)]
        let r2 = fruits[Math.floor(Math.random() * fruits.length)]
        let r3 = fruits[Math.floor(Math.random() * fruits.length)]
        let win = (r1 === r2 || r2 === r3 || r1 === r3)
        user.fiches += win ? 200 : -100
        const canvas = createCanvas(600, 400); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,600,400)
        try {
            const img1 = await loadImage(fruitURLs[r1]); const img2 = await loadImage(fruitURLs[r2]); const img3 = await loadImage(fruitURLs[r3])
            ctx.drawImage(img1, 100, 120, 100, 100); ctx.drawImage(img2, 250, 120, 100, 100); ctx.drawImage(img3, 400, 120, 100, 100)
        } catch(e) {}
        ctx.fillStyle = '#fff'; ctx.font = 'bold 30px Sans'; ctx.textAlign = 'center'
        ctx.fillText(win ? '✅ VITTORIA!' : '❌ SCONFITTA!', 300, 320)
        const buttons = [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* *${user.fiches}*`, buttons }, { quoted: m })
    }

    // --- 4. LOGICA BLACKJACK ---
    if (command === 'blakjak' || command === 'blackjack') {
        let bet = parseInt(args[0]) || 100
        if (user.fiches < bet) return m.reply('*❌ FICHES INSUFFICIENTI!*')
        let tu = Math.floor(Math.random() * 10) + 12
        let banco = Math.floor(Math.random() * 10) + 13
        let vinto = (tu <= 21 && (tu > banco || banco > 21))
        user.fiches += vinto ? bet : -bet
        const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#0a5d1e'; ctx.fillRect(0, 0, 600, 300)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 40px Sans'; ctx.textAlign = 'center'
        ctx.fillText(`TU: ${tu}  VS  BANCO: ${banco}`, 300, 150)
        ctx.fillText(vinto ? '🏆 VINTO!' : '💀 PERSO!', 300, 230)
        const buttons = [{ buttonId: `${usedPrefix}blakjak ${bet}`, buttonText: { displayText: '🃏 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*SALDO:* *${user.fiches}*`, buttons }, { quoted: m })
    }

    // --- 5. LOGICA CORSA ---
    if (command === 'puntacorsa') {
        let scelta = args[0]?.toUpperCase()
        if (user.fiches < 100) return m.reply('*❌ FICHES INSUFFICIENTI!*')
        user.fiches -= 100
        let risultati = cavalliConfig.map(c => ({ ...c, pos: Math.random() * 400 + 50 }))
        risultati.sort((a, b) => b.pos - a.pos)
        let vincitore = risultati[0], haiVinto = scelta === vincitore.nome
        if (haiVinto) user.fiches += 300
        const canvas = createCanvas(600, 450); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#5d4037'; ctx.fillRect(0, 0, 600, 450)
        risultati.forEach((c, i) => {
            let row = cavalliConfig.findIndex(cc => cc.nome === c.nome)
            ctx.font = '50px Sans'; ctx.fillText('🏇', c.pos, 130 + row * 80)
            ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(c.pos + 25, 145 + row * 80, 10, 0, Math.PI * 2); ctx.fill()
        })
        let cap = `*🏁 VINCE: ${vincitore.emoji} ${vincitore.nome}*\n${haiVinto ? '*🎉 HAI VINTO 300!*' : '*💀 HAI PERSO!*'}\n*SALDO:* *${user.fiches}*`
        const buttons = [{ buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: cap, buttons }, { quoted: m })
    }
}

handler.command = /^(casino|infoslot|infobj|infocorsa|puntacorsa|slot|blakjak|blackjack)$/i
handler.group = true
export default handler
