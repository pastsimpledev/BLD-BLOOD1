import axios from 'axios'
import ytSearch from 'yt-search'

let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text) return m.reply(`*Uso:* ${usedPrefix + command} <canzone/video>`)

    try {
        // 1. RICERCA
        const search = await ytSearch(text)
        const video = search.videos[0]
        if (!video) return m.reply('❌ Nessun risultato trovato su YouTube.')

        // 2. MENU PRINCIPALE (.play)
        if (command === 'play') {
            const sections = [{
                title: "Seleziona Formato",
                rows: [
                    { title: "🎵 Audio MP3", rowId: `${usedPrefix}playaudio ${video.url}`, description: "Scarica la traccia audio" },
                    { title: "🎥 Video MP4", rowId: `${usedPrefix}playvideo ${video.url}`, description: "Scarica il video HD" }
                ]
            }]

            const listMessage = {
                image: { url: video.thumbnail },
                caption: `*╭─ׄ✦☾⋆⁺₊✧ Bloodbot ✧₊⁺⋆☽✦─ׅ⭒*\n*├* 📝 *Titolo:* ${video.title}\n*├* ⏱️ *Durata:* ${video.timestamp}\n*├* 👤 *Canale:* ${video.author.name}\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
                footer: "Scegli un'opzione qui sotto",
                title: "📥 Download Center",
                buttonText: "SELEZIONA QUI",
                sections
            }
            return await conn.sendMessage(m.chat, listMessage, { quoted: m })
        }

        // 3. LOGICA DI DOWNLOAD CON MULTI-API (Bypass totale)
        await m.reply('⏳ _Elaborazione in corso... sto aggirando i blocchi di YouTube._')
        
        const isVideo = command === 'playvideo'
        let downloadUrl = null
        let errorLog = ''

        // --- TENTATIVO API 1 (Vreden) ---
        try {
            const res = await axios.get(`https://api.vreden.my.id/api/yt${isVideo ? 'mp4' : 'mp3'}?url=${video.url}`)
            downloadUrl = isVideo ? res.data.result.download : res.data.result.download
        } catch (e) { errorLog += 'API 1: Fallita. ' }

        // --- TENTATIVO API 2 (Alya - Fallback) ---
        if (!downloadUrl) {
            try {
                const res2 = await axios.get(`https://api.alyachan.pro/api/yt${isVideo ? 'v' : 'a'}?url=${video.url}&apikey=GataDios`)
                downloadUrl = res2.data.data.url
            } catch (e) { errorLog += 'API 2: Fallita. ' }
        }

        // --- TENTATIVO API 3 (Lolhuman - Emergenza) ---
        if (!downloadUrl) {
            try {
                const res3 = await axios.get(`https://api.lolhuman.xyz/api/yt${isVideo ? 'video' : 'audio'}?apikey=GataDios&url=${video.url}`)
                downloadUrl = isVideo ? res3.data.result.video : res3.data.result.audio
            } catch (e) { errorLog += 'API 3: Fallita.' }
        }

        if (!downloadUrl) throw new Error("Tutte le API di bypass sono al limite. Riprova tra 10 minuti.")

        // 4. INVIO FINALE
        if (isVideo) {
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                caption: `✅ *${video.title}*\n> \`Bloodbot\``,
                mimetype: 'video/mp4' 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${video.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: video.title,
                        body: 'Bloodbot Music',
                        thumbnailUrl: video.thumbnail,
                        sourceUrl: video.url,
                        mediaType: 1,
                        showAdAttribution: true,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        m.reply(`❌ *ERRORE DI SISTEMA*\n\nI server di download sono sovraccarichi o YouTube ha bloccato anche i bridge.\n\n_Dettaglio:_ ${e.message}`)
    }
}

handler.command = ['play', 'playaudio', 'playvideo']
handler.help = ['play']
handler.tags = ['download']
export default handler
