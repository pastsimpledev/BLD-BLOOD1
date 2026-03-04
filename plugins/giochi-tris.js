import { createCanvas } from 'canvas'

let games = {};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const chatId = m.chat;

    // FUNZIONE PER OTTENERE IL NUMERO DI TELEFONO
    const getPhoneNumber = (jid) => {
        if (!jid) return '';
        return jid.split('@')[0].replace(/\D/g, '');
    };

    // ===== START (.tris) =====
    if (command === 'tris') {
        let mention = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);

        if (!mention) 
            return m.reply(`⚠️ Devi menzionare qualcuno!\nEsempio: ${usedPrefix}tris @utente`);

        const myNumber = getPhoneNumber(m.sender);
        const theirNumber = getPhoneNumber(mention);

        if (myNumber === theirNumber) return m.reply('❌ Non puoi giocare da solo!');
        if (games[chatId]) return m.reply('❌ Partita già in corso!');

        games[chatId] = {
            board: [['','',''],['','',''],['','','']],
            players: [myNumber, theirNumber],
            jids: [m.sender, mention],
            turn: 0,
            timer: null,
            symbols: ['X', 'O']
        };

        await sendCanvasBoard(chatId, conn, games[chatId], 
            `🎮 *TRIS HD INIZIATO!*\n\n❌: @${games[chatId].jids[0].split('@')[0]}\n⭕: @${games[chatId].jids[1].split('@')[0]}\n\n▶️ Tocca a: @${games[chatId].jids[0].split('@')[0]}`
        );
        startTurnTimer(chatId, conn);
    }

    // ===== MOVE (.putris) =====
    else if (command === 'putris') {
        const game = games[chatId];
        if (!game) return m.reply('❌ Nessuna partita attiva.');

        const myNumber = getPhoneNumber(m.sender);
        if (myNumber !== game.players[game.turn]) {
            return conn.reply(chatId, `❌ Non è il tuo turno! Aspetta @${game.jids[game.turn].split('@')[0]}`, m, { mentions: [game.jids[game.turn]] });
        }

        const move = text.trim().toUpperCase();
        const map = { A: 0, B: 1, C: 2 };
        const row = map[move[0]];
        const col = parseInt(move[1]) - 1;

        if (row === undefined || isNaN(col) || col < 0 || col > 2)
            return m.reply(`⚠️ Mossa errata! Usa: \`${usedPrefix}putris B2\``);

        if (game.board[row][col] !== '')
            return m.reply('❌ Casella occupata!');

        game.board[row][col] = game.symbols[game.turn];

        if (checkWinner(game.board)) {
            clearTimeout(game.timer);
            await sendCanvasBoard(chatId, conn, game, `🎉 *VITTORIA!* \n@${m.sender.split('@')[0]} ha vinto!`);
            delete games[chatId];
        } 
        else if (game.board.flat().every(cell => cell !== '')) {
            clearTimeout(game.timer);
            await sendCanvasBoard(chatId, conn, game, `🤝 *PAREGGIO!*`);
            delete games[chatId];
        } 
        else {
            game.turn = 1 - game.turn;
            await sendCanvasBoard(chatId, conn, game, `✅ Mossa fatta! Turno di: @${game.jids[game.turn].split('@')[0]}`);
            startTurnTimer(chatId, conn);
        }
    }

    // ===== END/HELP =====
    else if (command === 'endtris') {
        if (games[chatId]) {
            clearTimeout(games[chatId].timer);
            delete games[chatId];
            m.reply('🛑 Partita annullata.');
        }
    }
};

// --- FUNZIONE DISEGNO CANVAS ---
async function sendCanvasBoard(chatId, conn, game, msg = '') {
    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext('2d');

    // Sfondo Dark Mode
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, 500, 500);

    // Griglia (Neon Blue)
    ctx.strokeStyle = '#89b4fa';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    // Linee Verticali
    ctx.beginPath(); ctx.moveTo(166, 50); ctx.lineTo(166, 450); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(333, 50); ctx.lineTo(333, 450); ctx.stroke();
    // Linee Orizzontali
    ctx.beginPath(); ctx.moveTo(50, 166); ctx.lineTo(450, 166); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(50, 333); ctx.lineTo(450, 333); ctx.stroke();

    // Etichette (A, B, C / 1, 2, 3)
    ctx.fillStyle = '#bac2de';
    ctx.font = 'bold 25px Arial';
    ctx.textAlign = 'center';
    ['1', '2', '3'].forEach((n, i) => ctx.fillText(n, 108 + i * 166, 35));
    ['A', 'B', 'C'].forEach((l, i) => ctx.fillText(l, 25, 115 + i * 166));

    // Disegno Simboli
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let symbol = game.board[r][c];
            let x = 108 + c * 166;
            let y = 115 + r * 166;

            if (symbol === 'X') {
                // Disegna X (Rossa)
                ctx.strokeStyle = '#f38ba8';
                ctx.lineWidth = 12;
                ctx.beginPath();
                ctx.moveTo(x - 40, y - 40); ctx.lineTo(x + 40, y + 40);
                ctx.moveTo(x + 40, y - 40); ctx.lineTo(x - 40, y + 40);
                ctx.stroke();
            } else if (symbol === 'O') {
                // Disegna O (Gialla)
                ctx.strokeStyle = '#f9e2af';
                ctx.lineWidth = 12;
                ctx.beginPath();
                ctx.arc(x, y, 45, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    await conn.sendMessage(chatId, { 
        image: canvas.toBuffer(), 
        caption: msg,
        mentions: game.jids 
    });
}

function checkWinner(board) {
    const lines = [
        // Orizzontali
        [[0,0], [0,1], [0,2]], [[1,0], [1,1], [1,2]], [[2,0], [2,1], [2,2]],
        // Verticali
        [[0,0], [1,0], [2,0]], [[0,1], [1,1], [2,1]], [[0,2], [1,2], [2,2]],
        // Diagonali
        [[0,0], [1,1], [2,2]], [[0,2], [1,1], [2,0]]
    ];
    for (let line of lines) {
        const [[r1,c1], [r2,c2], [r3,c3]] = line;
        if (board[r1][c1] !== '' && board[r1][c1] === board[r2][c2] && board[r1][c1] === board[r3][c3]) return true;
    }
    return false;
}

function startTurnTimer(chatId, conn) {
    const game = games[chatId];
    if (game?.timer) clearTimeout(game.timer);
    game.timer = setTimeout(() => {
        if (games[chatId]) {
            conn.sendMessage(chatId, { text: '⏱️ Tempo scaduto! Partita chiusa.' });
            delete games[chatId];
        }
    }, 120000);
}

handler.command = /^(tris|putris|endtris)$/i;
handler.group = true;
export default handler;
