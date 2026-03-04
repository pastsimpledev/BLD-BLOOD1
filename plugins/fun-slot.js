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

    // --- 1. MENU PRINCIPALE ---
    if (command === 'casino') {
        let intro = `*🎰 GRAND CASINÒ 🎰*\n*💰 SALDO:* *${user.fiches} FICHES*`
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT' }, type: 1 },
            { buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 BLACKJACK' }, type: 1 },
            { buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGORI' }, type: 1 },
            { buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 ROULETTE' }, type: 1 },
            { buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ GRATTA&VINCI' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons }, { quoted: m })
    }

    // --- 2. GESTIONE INFO (SISTEMAZIONE TASTI) ---
    if (command === 'infoslot') return conn.sendMessage(m.chat, { text: `*🎰 SLOT*\nPunta 100 fiches!`, buttons: [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 TIRA' }, type: 1 }] })
    if (command === 'infobj') return conn.sendMessage(m.chat, { text: `*🃏 BLACKJACK*\nPunta 100 fiches!`, buttons: [{ buttonId: `${usedPrefix}blackjack`, buttonText: { displayText: '🃏 GIOCA' }, type: 1 }] })
    if (command === 'infogratta') return conn.sendMessage(m.chat, { text: `*🎟️ GRATTA & VINCI*\nCosto: 200 fiches!`, buttons: [{ buttonId: `${usedPrefix}gratta`, buttonText: { displayText: '🎟️ COMPRA' }, type: 1 }] })
    if (command === 'inforoulette') return conn.sendMessage(m.chat, { text: `*🎡 ROULETTE*\nScegli su cosa puntare (100 fiches):`, buttons: [{ buttonId: `${usedPrefix}playroulette pari`, buttonText: { displayText: 'PARI' }, type: 1 }, { buttonId: `${usedPrefix}playroulette dispari`, buttonText: { displayText: 'DISPARI' }, type: 1 }] })
    if (command === 'inforigore') return conn.sendMessage(m.chat, { text: `*⚽ SFIDA AI RIGORI*\nScegli l'angolo del tiro:`, buttons: [{ buttonId: `${usedPrefix}rigore sx`, buttonText: { displayText: '⬅️ SX' }, type: 1 }, { buttonId: `${usedPrefix}rigore cx`, buttonText: { displayText: '⬆️ CX' }, type: 1 }, { buttonId: `${usedPrefix}rigore dx`, buttonText: { displayText: '➡️ DX' }, type: 1 }] })
    if (command === 'infocorsa') return conn.sendMessage(m.chat, { text: `*🏇 CORSA CAVALLI*\nPunta 100 sul tuo favorito:`, buttons: cavalliConfig.map(c => ({ buttonId: `${usedPrefix}puntacorsa ${c.nome}`, buttonText: { displayText: `${c.emoji} ${c.nome}` }, type: 1 })) })

    // --- 3. LOGICHE GIOCHI ---

    // ⚽ RIGORI (GRAFICA DEFINITA)
    if (command === 'rigore') {
        let parata = ['sx', 'cx', 'dx'][Math.floor(Math.random() * 3)]
        let tiro = args[0], win = tiro !== parata
        user.fiches += win ? 150 : -100
        const canvas = createCanvas(600, 350); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#2e7d32'; ctx.fillRect(0, 0, 600, 350) // Erba
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 12; ctx.strokeRect(100, 50, 400, 250) // Porta HD
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        for(let i=100; i<=500; i+=20) { ctx.beginPath(); ctx.moveTo(i, 50); ctx.lineTo(i, 300); ctx.stroke() } // Rete
        for(let i=50; i<=300; i+=20) { ctx.beginPath(); ctx.moveTo(100, i); ctx.lineTo(500, i); ctx.stroke() }
        let pos = { sx: 160, cx: 300, dx: 440 }
        ctx.font = '70px Sans'; ctx.textAlign = 'center'
        ctx.fillText('🧤', pos[parata], 180) // Portiere
        ctx.fillText('⚽', pos[tiro], win ? 150 : 175) // Palla
        const buttons = [{ buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: win ? '*⚽ GOOOL!*' : '*🧤 PARATA!*', buttons })
    }

    // 🏇 CORSA CAVALLI (GRIGLIA DEFINITA)
    if (command === 'puntacorsa') {
        let vIdx = Math.floor(Math.random() * 4), win = args[0]?.toUpperCase() === cavalliConfig[vIdx].nome
        user.fiches += win ? 200 : -100
        const canvas = createCanvas(700, 400); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#6d4c41'; ctx.fillRect(0, 0, 700, 400) // Terra
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4
        for(let i=0; i<=4; i++) { ctx.beginPath(); ctx.moveTo(50, 50+(i*80)); ctx.lineTo(650, 50+(i*80)); ctx.stroke() } // Corsie
        ctx.fillStyle = '#111'; for(let i=50; i<370; i+=20) { ctx.fillRect(600, i, 20, 10); ctx.fillRect(620, i+10, 20, 10) } // Finish line
        ctx.font = '50px Sans'; ctx.textAlign = 'center'
        cavalliConfig.forEach((c, i) => {
            let xPos = (i === vIdx) ? 630 : Math.floor(Math.random() * 200) + 150
            ctx.fillText('🏇', xPos, 110+(i*80))
            ctx.font = 'bold 15px Sans'; ctx.fillStyle = '#fff'; ctx.fillText(c.nome, 70, 110+(i*80))
        })
        const buttons = [{ buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: win ? '*✅ VINTO!*' : `*❌ PERSO! VINCE ${cavalliConfig[vIdx].nome}*`, buttons })
    }

    // --- ALTRI GIOCHI (SISTEMATI) ---
    if (command === 'slot') {
        let r = [fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)], fruits[Math.floor(Math.random() * 6)]]
        let win = (r[0] === r[1] || r[1] === r[2] || r[0] === r[2])
        user.fiches += win ? 200 : -100
        const buttons = [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return m.reply(`🎰 *SLOT* 🎰\n\n| ${r[0]} | ${r[1]} | ${r[2]} |\n\n${win ? '*VITTORIA!*' : '*SCONFITTA!*'}\n*SALDO:* ${user.fiches}`, null, { buttons })
    }

    if (command === 'blackjack' || command === 'blakjak') {
        let tu = Math.floor(Math.random() * 11) + 11, banco = Math.floor(Math.random() * 10) + 12
        let win = (tu <= 21 && (tu > banco || banco > 21))
        user.fiches += win ? 100 : -100
        const buttons = [{ buttonId: `${usedPrefix}infobj`, buttonText: { displayText: '🃏 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return m.reply(`🃏 *BLACKJACK*\n\nTU: ${tu} | BANCO: ${banco}\n\n${win ? '*VINTO!*' : '*PERSO!*'}\n*SALDO:* ${user.fiches}`, null, { buttons })
    }

    if (command === 'gratta') {
        let v = [0, 0, 500, 0, 1000, 0, 5000][Math.floor(Math.random() * 7)]
        user.fiches += (v - 200)
        const buttons = [{ buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return m.reply(`🎟️ *GRATTA&VINCI*\n\n${v > 0 ? `🎊 VINTO ${v}!` : '💀 NULLA'}\n*SALDO:* ${user.fiches}`, null, { buttons })
    }

    if (command === 'playroulette') {
        let n = Math.floor(Math.random() * 37), win = (args[0] === 'pari' && n % 2 === 0 && n !== 0) || (args[0] === 'dispari' && n % 2 !== 0)
        user.fiches += win ? 100 : -100
        const buttons = [{ buttonId: `${usedPrefix}inforoulette`, buttonText: { displayText: '🎡 RIGIOCA' }, type: 1 }, { buttonId: `${usedPrefix}casino`, buttonText: { displayText: '🏠 MENU' }, type: 1 }]
        return m.reply(`🎡 *ROULETTE*\n\nNumero uscito: *${n}*\n\n${win ? '*VINTO!*' : '*PERSO!*'}\n*SALDO:* ${user.fiches}`, null, { buttons })
    }
}

// --- QUESTA RIGA È IL "MOTORE" CHE FA ANDARE TUTTI I TASTI ---
handler.command = /^(casino|infoslot|infobj|infogratta|inforoulette|inforigore|infocorsa|slot|blackjack|blakjak|gratta|playroulette|rigore|puntacorsa)$/i
handler.group = true
export default handler
