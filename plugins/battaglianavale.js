global.navale = global.navale || {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender

    // --- COMANDO INIZIALE: .battaglia @user ---
    if (command === 'battaglia') {
        if (global.navale[chat]) return m.reply('*⚠️ Partita in corso. Usa .endgame per chiuderla.*')

        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*Devi menzionare l\'avversario!*')
        if (target === user) return m.reply('*Non puoi sfidare te stesso.*')

        global.navale[chat] = {
            p1: user,
            p2: target,
            status: 'WAITING',
            turno: user,
            board1: generateBoard(),
            board2: generateBoard(),
            hits1: [], // Colpi ricevuti da P1
            hits2: []  // Colpi ricevuti da P2
        }

        let intro = `*⚓ BATTAGLIA NAVALE ⚓*\n\n`
        intro += `*SFIDANTE:* @${user.split('@')[0]}\n`
        intro += `*AVVERSARIO:* @${target.split('@')[0]}\n\n`
        intro += `*📜 REGOLE:*\n- Griglia *5x5*\n- *3 Navi* nascoste\n- Comando: *.fuoco A1*\n\n*@${target.split('@')[0]}, accetti?*`

        const buttons = [
            { buttonId: `${usedPrefix}accetta`, buttonText: { displayText: 'ACCETTA ✅' }, type: 1 },
            { buttonId: `${usedPrefix}rifiuta`, buttonText: { displayText: 'RIFIUTA ❌' }, type: 1 }
        ]

        return conn.sendMessage(chat, { text: intro, buttons, mentions: [user, target] }, { quoted: m })
    }

    // --- FINE PARTITA ---
    if (command === 'endgame' || command === 'fine') {
        if (!global.navale[chat]) return m.reply('*Nessuna partita attiva.*')
        delete global.navale[chat]
        return m.reply('*🏁 Partita terminata.*')
    }

    // --- ACCETTA ---
    if (command === 'accetta') {
        let game = global.navale[chat]
        if (!game || game.status !== 'WAITING') return
        if (user !== game.p2) return m.reply('*Non sei tu lo sfidato!*')

        game.status = 'PLAYING'
        return conn.reply(chat, `*🚢 PARTITA INIZIATA!*\n\n*Turno di:* @${game.p1.split('@')[0]}\nUsa *.fuoco [A-E][1-5]*`, m, { mentions: [game.p1] })
    }

    // --- RIFIUTA ---
    if (command === 'rifiuta') {
        let game = global.navale[chat]
        if (!game || game.status !== 'WAITING') return
        if (user !== game.p2) return
        delete global.navale[chat]
        return m.reply('*Sfida rifiutata.*')
    }

    // --- FUOCO ---
    if (command === 'fuoco') {
        let game = global.navale[chat]
        if (!game || game.status !== 'PLAYING') return m.reply('*Nessuna partita attiva.*')
        if (user !== game.turno) return m.reply(`*Non è il tuo turno! Aspetta @${game.turno.split('@')[0]}*`, null, { mentions: [game.turno] })

        let coord = text.toUpperCase().trim()
        if (!/^[A-E][1-5]$/.test(coord)) return m.reply('*Esempio: .fuoco B2*')

        let isP1 = user === game.p1
        let opponentBoard = isP1 ? game.board2 : game.board1
        let hits = isP1 ? game.hits2 : game.hits1 // Registro i colpi che P1 dà a P2

        if (hits.includes(coord)) return m.reply('*Hai già sparato qui!*')
        hits.push(coord)

        let isHit = opponentBoard.includes(coord)
        let win = opponentBoard.every(ship => hits.includes(ship))

        if (win) {
            let vincitore = user
            delete global.navale[chat]
            return conn.reply(chat, `*💥 AFFONDATO E VINTO!* 🏆\n\n@${vincitore.split('@')[0]} ha distrutto la flotta nemica!`, m, { mentions: [vincitore] })
        }

        // Cambio turno
        game.turno = isP1 ? game.p2 : game.p1
        let esito = isHit ? `*🔥 COLPITO!*` : `*💦 ACQUA...*`
        let grid = renderGrid(hits, opponentBoard)

        return conn.reply(chat, `${esito}\n\n${grid}\n*Prossimo turno:* @${game.turno.split('@')[0]}`, m, { mentions: [game.turno] })
    }
}

// Genera 3 posizioni casuali
function generateBoard() {
    let coords = []
    let letters = ['A', 'B', 'C', 'D', 'E']
    while (coords.length < 3) {
        let c = letters[Math.floor(Math.random() * 5)] + (Math.floor(Math.random() * 5) + 1)
        if (!coords.includes(c)) coords.push(c)
    }
    return coords
}

// Disegna la griglia
function renderGrid(hits, ships) {
    let letters = ['A', 'B', 'C', 'D', 'E']
    let grid = '      1    2    3    4    5\n'
    for (let l of letters) {
        grid += l + '  '
        for (let i = 1; i <= 5; i++) {
            let c = l + i
            if (hits.includes(c)) {
                grid += ships.includes(c) ? ' 💥' : ' 🌊'
            } else {
                grid += ' ⬛'
            }
        }
        grid += '\n'
    }
    return '```' + grid + '```'
}

handler.help = ['battaglia']
handler.tags = ['giochi']
handler.command = /^(battaglia|accetta|rifiuta|fuoco|endgame|fine)$/i
handler.group = true

export default handler
