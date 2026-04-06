import { promises } from 'fs'
import { join } from 'path'
import fetch from 'node-fetch'

const emojicategoria = {
  info: 'ℹ️',
  main: '💠',
  sicurezza: '🛡️'
}

let tags = {
  'main': '╭ *`SYSTEM MAIN`* ╯',
  'sicurezza': '╭ *`SECURITY SYSTEM`* ╯',
  'info': '╭ *`DATABASE INFO`* ╯'
}

const defaultMenu = {
  before: `
┏━━━━━━━━━━━━━━━━━━━━┓
   💠  *B L D  -  B O T* 💠
┗━━━━━━━━━━━━━━━━━━━━┛
 ┌───────────────────
 │ 👤 *User:* %name
 │ 🕒 *Uptime:* %uptime
 │ 👥 *Total Users:* %totalreg
 └───────────────────
 
 *PANNELLO DI CONTROLLO:*
`.trimStart(),
  header: '      ⋆｡˚『 %category 』˚｡⋆\n╭',
  body: '*│ ➢* 『%emoji』 %cmd',
  footer: '*╰━━━━━━━──────━━━━━━━*\n',
  after: `_Powered by BLD-BOT Interface_`,
}

const MENU_IMAGE_URL = 'https://i.ibb.co/hJW7WwxV/varebot.jpg';

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let name = await conn.getName(m.sender) || 'User';
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let totalreg = Object.keys(global.db.data.users).length;

    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
      };
    });

    let menuTags = Object.keys(tags);
    let _text = [
      defaultMenu.before,
      ...menuTags.map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help[0]).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? help : _p + help)
                .replace(/%emoji/g, emojicategoria[tag] || '🔹')
                .trim();
            }).join('\n');
          }),
          defaultMenu.footer
        ].join('\n');
      }),
      defaultMenu.after
    ].join('\n');

    let replace = { '%': '%', p: _p, uptime, name, totalreg };
    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name]);

    // --- TUTTI GLI 8 MENU (Template Buttons) ---
    // Nota: Se WhatsApp dovesse nascondere i tasti perché troppi, 
    // il testo sopra rimane comunque leggibile e i comandi cliccabili.
    const templateButtons = [
      { index: 1, quickReplyButton: { displayText: '🛡️ SICUREZZA', id: _p + 'attiva' } },
      { index: 2, quickReplyButton: { displayText: '🎮 GIOCHI', id: _p + 'menugiochi' } },
      { index: 3, quickReplyButton: { displayText: '🤖 IA', id: _p + 'menuia' } },
      { index: 4, quickReplyButton: { displayText: '👥 GRUPPO', id: _p + 'menugruppo' } },
      { index: 5, quickReplyButton: { displayText: '📥 DOWNLOAD', id: _p + 'menudownload' } },
      { index: 6, quickReplyButton: { displayText: '🛠️ STRUMENTI', id: _p + 'menustrumenti' } },
      { index: 7, quickReplyButton: { displayText: '⭐ PREMIUM', id: _p + 'menupremium' } },
      { index: 8, quickReplyButton: { displayText: '👨‍💻 OWNER', id: _p + 'menucreatore' } }
    ]

    await conn.sendMessage(m.chat, {
        image: { url: MENU_IMAGE_URL },
        caption: text.trim(),
        footer: "Seleziona un modulo operativo cliccando i tasti",
        templateButtons: templateButtons,
        viewOnce: true // Aiuta la visualizzazione su iOS
    }, { quoted: m });

    await m.react('💠');

  } catch (e) {
    console.error(e);
  }
};

handler.help = ['menu'];
handler.command = ['menu', 'help'];
export default handler;

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
