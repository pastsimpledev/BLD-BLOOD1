import { createCanvas } from 'canvas'

global.navale = global.navale || {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender

    // --- 1. INIZIO SFIDA ---
    if (command === 'battaglia') {
        if (global.navale[chat]) return m.reply('*⚠️ Partita in corso. Usa .endgame per chiuderla.*')
        let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
        if (!target) return m.reply('*Devi menzionare l\'avversario!*')
        
        global.navale[chat] = {
            p1: user,
            p2: target,
            status: 'WAITING',
            turno: user,
            board1: generateBoard(),
            board2: generateBoard(),
            hits1: [], 
            hits2: []  
        }

        let intro = `*⚓ BATTAGLIA NAVALE HD ⚓*\n\n*SFIDANTE:* @${user.split('@')[0]}\n*AVVERSARIO:* @${target.split('@')[0]}\n\n*Accetti la sfida?*`
        const buttons = [
            { buttonId: `${usedPrefix}accetta`, buttonText: { displayText: 'ACCETTA ✅' }, type: 1 },
            { buttonId: `${usedPrefix}rifiuta`, buttonText: { displayText: 'RIFIUTA ❌' }, type: 1 }
        ]
        return conn.sendMessage(chat, { text: intro, buttons, mentions: [user, target] }, { quoted: m })
    }

    if (command === 'endgame') { delete global.navale[chat]; return m.reply('*🏁 Partita terminata.*') }

    if (command === 'accetta') {
        let game = global.navale[chat]
        if (!game || game.status !== 'WAITING' || user !== game.p2) return
        game.status = 'PLAYING'
        return m.reply(`*🚢 PARTITA INIZIATA!*\nTurno di @${game.p1.split('@')[0]}\nUsa: *.fuoco A1*`, null, { mentions: [game.p1] })
    }

    // --- 2. LOGICA DI FUOCO CON GRAFICA CERTA (Senza Emoji nel Canvas) ---
    if (command === 'fuoco') {
        let game = global.navale[chat]
        if (!game || game.status !== 'PLAYING') return m.reply('*Nessuna partita attiva.*')
        if (user !== game.turno) return m.reply(`*Non è il tuo turno!*`)

        let coord = text.toUpperCase().trim()
        if (!/^[A-E][1-5]$/.test(coord)) return m.reply('*Esempio: .fuoco B2*')

        let isP1 = user === game.p1
        let opponentBoard = isP1 ? game.board2 : game.board1
        let hits = isP1 ? game.hits2 : game.hits1 

        if (hits.includes(coord)) return m.reply('*Hai già sparato qui!*')
        hits.push(coord)

        let isHit = opponentBoard.includes(coord)
        let win = opponentBoard.every(ship => hits.includes(ship))

        // DISEGNO CANVAS
        const canvas = createCanvas(500, 550)
        const ctx = canvas.getContext('2d')

        // Sfondo Mare (Blu scuro)
        ctx.fillStyle = '#003366'; ctx.fillRect(0, 0, 500, 550)
        
        // Griglia Bianca
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3
        for (let i = 0; i <= 5; i++) {
            ctx.beginPath(); ctx.moveTo(70 + i * 80, 70); ctx.lineTo(70 + i * 80, 470); ctx.stroke() // Verticali
            ctx.beginPath(); ctx.moveTo(70, 70 + i * 80); ctx.lineTo(470, 70 + i * 80); ctx.stroke() // Orizzontali
        }

        // Coordinate (Testo)
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 35px Arial'; ctx.textAlign = 'center'
        let letters = ['A', 'B', 'C', 'D', 'E']
        for (let i = 0; i < 5; i++) {
            ctx.fillText(i + 1, 110 + i * 80, 50) // Numeri
            ctx.fillText(letters[i], 35, 125 + i * 80) // Lettere
        }

        // DISEGNO I COLPI (Sostituite Emoji con forme geometriche)
        letters.forEach((l, row) => {
            for (let col = 1; col <= 5; col++) {
                let currentCoord = l + col
                if (hits.includes(currentCoord)) {
                    let x = 110 + (col - 1) * 80
                    let y = 115 + row * 80
                    
                    if (opponentBoard.includes(currentCoord)) {
                        // COLPITO: Un cerchio rosso con una X bianca
                        ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill()
                        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.beginPath()
                        ctx.moveTo(x-15, y-15); ctx.lineTo(x+15, y+15); ctx.moveTo(x+15, y-15); ctx.lineTo(x-15, y+15); ctx.stroke()
                    } else {
                        // ACQUA: Un cerchio azzurro vuoto
                        ctx.strokeStyle = '#00ccff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.stroke()
                        ctx.fillStyle = '#00ccff'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill()
                    }
                }
            }
        })

        if (win) {
            let vincitore = user; delete global.navale[chat]
            return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `*💥 VITTORIA! TUTTE LE NAVI NEMICHE AFFONDATE!* 🏆\n\nComplimenti @${vincitore.split('@')[0]}!`, mentions: [vincitore] }, { quoted: m })
        }

        game.turno = isP1 ? game.p2 : game.p1
        let esito = isHit ? `*🔥 COLPITO!*` : `*💦 ACQUA!*`
        
        return conn.sendMessage(m.chat, { 
            image: canvas.toBuffer(), 
            caption: `${esito}\n\n*Mossa:* ${coord}\n*Turno di:* @${game.turno.split('@')[0]}`, 
            mentions: [game.turno] 
        }, { quoted: m })
    }
}

function generateBoard() {
    let coords = [], letters = ['A', 'B', 'C', 'D', 'E']
    while (coords.length < 3) {
        let c = letters[Math.floor(Math.random() * 5)] + (Math.floor(Math.random() * 5) + 1)
        if (!coords.includes(c)) coords.push(c)
    }
    return coords
}

handler.command = /^(battaglia|accetta|rifiuta|fuoco|endgame|fine)$/i
handler.group = true
export default handler
