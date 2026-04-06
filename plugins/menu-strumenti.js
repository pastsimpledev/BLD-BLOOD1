const defmenu = {
  before: `
┏━━━━━━━━━━━━━━━━━━━━┓
   💉  *B L O O D  -  T O O L S* 💉
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 🧪 *Soggetto:* %name
 │ ⚙️ *Moduli:* Strumenti
 │ ⚠️ *Status:* Deep Scan
 └───────────────────
`.trimStart(),
  header: '      ⋆｡˚『 %category 』˚｡⋆\n╭',
  body: '│ ⚡  %cmd',
  footer: '*╰━━━━━──ׄ──ׅ──ׄ──━━━━━*\n',
  after: `_☣️ Estrazione dati completata._`.trimEnd()
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let tags = {
    'strumenti': 'LABORATORIO BLOOD'
  }

  try {
    let name = await conn.getName(m.sender) || 'Soggetto Ignoto'
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('strumenti')).map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
      prefix: 'customPrefix' in plugin,
    }))

    // Costruzione del testo con le variabili Cyber Blood
    let text = [
      defmenu.before.replace(/%name/g, name),
      defmenu.header.replace(/%category/g, tags['strumenti']),
      help.map(menu => menu.help.map(cmd =>
        defmenu.body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
      ).join('\n')).join('\n'),
      defmenu.footer,
      defmenu.after
    ].join('\n')

    let fake = global.fake || {};

    await conn.sendMessage(m.chat, {
      video: { url: './media/menu/menu5.mp4' },
      caption: text.trim(),
      gifPlayback: true,
      gifAttribution: 2,
      mimetype: 'video/mp4',
      ...fake,
      contextInfo: {
        ...fake.contextInfo,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          ...fake.contextInfo?.forwardedNewsletterMessageInfo,
          newsletterName: "🩸 Cyber Blood - Tools ☣️"
        }
      }
    }, { quoted: m })

    await m.react('🧪')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '☣️ ERRORE NEL SETTORE STRUMENTI', m)
    throw e
  }
}

handler.help = ['menustrumenti']
handler.tags = ['menu']
handler.command = ['menutools', 'menustrumenti']
export default handler
