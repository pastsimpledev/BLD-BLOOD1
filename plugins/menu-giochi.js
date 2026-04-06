import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

// --- PERCORSO IMMAGINE ---
// Punta alla cartella "menu-giochi.jpeg". 
// Se dentro la cartella il file ha un nome specifico (es. "immagine.jpg"), aggiungilo dopo la virgola.
const localImg = join(process.cwd(), 'menu-giochi.jpeg'); 

const defaultMenu = {
  before: `
╔════════════════════╗
  🎮  *G A M E  C E N T E R* 🎮
╚════════════════════╝
 ┌───────────────────
 │ 👤 *Utente:* %name
 │ 🏆 *Livello:* %level
 │ 💰 *Eris:* %eris
 │ 🎖️ *Rango:* %role
 └───────────────────
 
 *Seleziona una sfida:*
`.trimStart(),
  header: '╭──〔 %category 〕──✦',
  body: '│ 🕹️  %cmd %islimit%isPremium',
  footer: '╰───────────────━━━━\n',
  after: `_Usa %p [comando] per giocare_`,
}

let handler = async (m, { conn, usedPrefix: _p, __dirname, args, command }) => {
  let tags = { 'giochi': 'GIOCHI DISPONIBILI' }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    // ----------------- DATI BASE -----------------
    let d = new Date(new Date().getTime() + 3600000)
    let locale = 'it'
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let uptime = clockString(process.uptime() * 1000)
    let wib = moment.tz('Europe/Rome').format('HH:mm:ss')
    
    // ----------------- DATI UTENTE -----------------
    let user = global.db.data.users[m.sender] || {}
    let { exp = 0, level = 1, role = 'Utente', eris = 0, limit = 10 } = user
    let { min, xp, max } = xpRange(level, global.multiplier || 1)
    let name = await conn.getName(m.sender)
    let prems = user.premiumTime > 0 ? '💎 Premium' : '👤 Utente comune'

    // ----------------- PLUGIN HELP -----------------
    let help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        tags: Array.isArray(p.tags) ? p.tags : [p.tags],
        prefix: 'customPrefix' in p,
        limit: p.limit,
        premium: p.premium
      }))

    let groups = {}
    for (let tag in tags) {
      groups[tag] = help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help[0])
    }

    // ----------------- COSTRUZIONE TESTO -----------------
    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' +
          [
            ...groups[tag].map(menu =>
              menu.help.map(cmd => defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
                .replace(/%islimit/g, menu.limit ? ' ⚠️' : '')
                .replace(/%isPremium/g, menu.premium ? ' 💎' : '')
                .trimEnd()
              ).join('\n')
            ),
            defaultMenu.footer
          ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%', p: _p, eris, name, level, limit, role, week, date, uptime, wib, prems
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    // ----------------- INVIO MENU CON IMMAGINE -----------------
    await conn.sendMessage(m.chat, {
      image: { url: localImg },
      caption: text.trim(),
      mentions: [m.sender]
    }, { quoted: m })

    await m.react('🎮')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Errore nel menu giochi:\n' + e.message, m)
  }
}

handler.help = ['menugiochi']
handler.tags = ['menu']
handler.command = ['menugiochi', 'menugame']

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, 'h ', m, 'm ', s, 's'].map(v => v.toString().padStart(2, '0')).join('')
}
