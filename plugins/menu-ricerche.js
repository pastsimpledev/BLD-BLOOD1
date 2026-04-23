import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

const defaultMenu = {
  before: `
┎━━━━━━━━━━━━━━━━━━━┑
┃   ✧ 𝐒𝐄𝐀𝐑𝐂𝐇  ✧   ┃
┖━━━━━━━━━━━━━━━━━━━┙
┌───────────────────┐
  👤 𝚄𝚜𝚎𝚛: %name
  🛰️ 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙾𝚗𝚕𝚒𝚗𝚎
  🔍 𝚂𝚎𝚌𝚝𝚘𝚛: 𝙳𝚊𝚝𝚊 𝚂𝚌𝚊𝚗
└───────────────────┘

*〘 ɪɴɪᴛɪᴀᴛɪɴɢ ᴅᴇᴇᴘ sᴄᴀɴ... 〙*
`.trimStart(),
  header: '┍━━━〔 %category 〕━━━┑',
  body: '┇ 🔎  *%cmd*',
  footer: '┕━━━━━──ׄ──ׅ──ׄ──━━━━━┙\n',
  after: `_ꜰᴇᴀʀ-ʙᴏᴛ ɪɴᴛᴇʟʟɪɢᴇɴᴄᴇ sʏsᴛᴇᴍ_`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = {
    'ricerca': 'ᴅɪɢɪᴛᴀʟ ɪɴᴠᴇsᴛɪɢᴀᴛɪᴏɴ'
  }

  try {
    let name = await conn.getName(m.sender) || 'User'
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let user = global.db.data.users[m.sender]
    let { level, role, eris } = user

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p,
    }))

    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body.replace(/%cmd/g, menu.prefix ? help : _p + help)
                .trim()
            }).join('\n')
          }),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%',
      p: _p,
      name, eris, level, role, uptime,
      readmore: readMore
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

   await conn.sendMessage(m.chat, {
    text: text.trim(),
    contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
            newsletterJid: '12036323274384506@newsletter',
            newsletterName: '✧ FEAR-BOT  ✧'

    await m.react('🔍')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Error in Search Module.', m)
  }
}

handler.help = ['menuricerche']
handler.tags = ['menu']
handler.command = ['menuricerche', 'menur', 'searchmenu']

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
