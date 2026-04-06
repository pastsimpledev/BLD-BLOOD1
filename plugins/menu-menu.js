import { promises } from 'fs'
import { join } from 'path'
import moment from 'moment-timezone'

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
 
 *Seleziona un modulo operativo:*
`.trimStart(),
  header: '      ⋆｡˚『 %category 』˚｡⋆\n╭',
  body: '*│ ➢* 『%emoji』 %cmd',
  footer: '*╰━━━━━━━──────━━━━━━━*\n',
  after: `_Powered by BLD-BOT Interface_`,
}

const MENU_IMAGE_URL = 'https://i.ibb.co/hJW7WwxV/varebot.jpg';

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
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

    // --- COSTRUZIONE BOTTONI (8 MENU) ---
    // Usiamo il formato 'list' perché è l'unico che permette più di 3 tasti in un unico blocco
    const sections = [
      {
        title: "🛡️ PROTEZIONE & GIOCHI",
        rows: [
          { title: "Menu Sicurezza", rowId: _p + "attiva", description: "Protezione Gruppo" },
          { title: "Menu Giochi", rowId: _p + "menugiochi", description: "Games & Leveling" }
        ]
      },
      {
        title: "🤖 INTELLIGENZA & GRUPPO",
        rows: [
          { title: "Menu IA", rowId: _p + "menuia", description: "Intelligenza Artificiale" },
          { title: "Menu Gruppo", rowId: _p + "menugruppo", description: "Gestione Membri" }
        ]
      },
      {
        title: "📂 UTILITY & DOWNLOAD",
        rows: [
          { title: "Menu Download", rowId: _p + "menudownload", description: "Social Downloader" },
          { title: "Menu Strumenti", rowId: _p + "menustrumenti", description: "Tools vari" }
        ]
      },
      {
        title: "👑 AMMINISTRAZIONE",
        rows: [
          { title: "Menu Premium", rowId: _p + "menupremium", description: "Funzioni Pro" },
          { title: "Menu Creatore", rowId: _p + "menucreatore", description: "Pannello Owner" }
        ]
      }
    ];

    const listMessage = {
      text: text.trim(),
      footer: "B L D - B O T  S Y S T E M",
      title: " ",
      buttonText: "💠 CLICCA PER I MENU",
      sections
    };

    // Invio forzato con immagine e lista (compatibile iOS/Android)
    await conn.sendMessage(m.chat, {
      image: { url: MENU_IMAGE_URL },
      caption: text.trim(),
      footer: "Seleziona una categoria",
      buttonText: "💠 APRI MENU",
      sections,
      viewOnce: true // CRITICO: Forza la visualizzazione su iPhone
    }, { quoted: m });

    await m.react('💠');

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, "Errore nell'invio dei bottoni.", m);
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
