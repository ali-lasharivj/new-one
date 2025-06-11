const config = require('../config');
const { cmd } = require('../command');
const prefix = config.PREFIX;

cmd({
  pattern: "deletechat",
  desc: "Delete all deletable messages in a chat",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, {
  reply,
  isOwner
}) => {
  if (!isOwner) return reply("❌ Only owner can use this command.");

  const jid = m.chat;

  try {
    const messages = await conn.loadMessages(jid, 100);
    const deletable = messages.messages.filter(msg =>
      msg?.key?.id &&
      msg.key.remoteJid &&
      (msg.key.fromMe || msg.key.participant)
    );

    if (!deletable.length) return reply("❎ No deletable messages found.");

    for (const msg of deletable) {
      try {
        await conn.sendMessage(msg.key.remoteJid, {
          delete: {
            id: msg.key.id,
            remoteJid: msg.key.remoteJid,
            fromMe: msg.key.fromMe || false,
            participant: msg.key.participant || msg.key.remoteJid
          }
        });
      } catch (e) {
        console.log("❌ Failed to delete one message:", e.message);
      }
    }

    await reply(`✅ Deleted ${deletable.length} messages.`);
  } catch (err) {
    console.error("❌ deletechat error:", err);
    reply("⚠️ Something went wrong.");
  }
});



cmd({
  pattern: "showmenu-(.*)",
  hidden: true
}, async (conn, mek, m, { match, from }) => {
  const category = match[1];
  const cmdsInCat = commands.filter(cmd => cmd.category === category);

  if (!cmdsInCat.length) {
    return conn.sendMessage(from, { text: `❌ No commands found in '${category}'` }, { quoted: m });
  }

  let text = `📂 *Commands in ${category.toUpperCase()}*\n\n`;

  for (const cmd of cmdsInCat) {
    text += `➤ ${cmd.pattern}\n`;
  }

  await conn.sendMessage(from, { text }, { quoted: m });
});

cmd({
  pattern: "btn",
  desc: "Show smart button menu",
  category: "tools",
  filename: __filename
}, async (conn, mek, m, { from }) => {

  const picUrl = "https://i.postimg.cc/G3k8H6gC/IMG-20250603-WA0017.jpg";

  const filtered = commands.filter(cmd =>
    !["menu", "nothing", "misc"].includes(cmd.category)
  );

  const categories = [...new Set(filtered.map(cmd => cmd.category))];

  const sections = categories.map((cat, index) => {
    const section = {
      rows: [
        {
          header: 'Menu',
          title: cat.charAt(0).toUpperCase() + cat.slice(1),
          description: `Click for Menu ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
          id: `showmenu-${cat}`
        }
      ]
    };

    if (index === 0) {
      section.title = "Select a menu";
      section.highlight_label = '𝐀𝐢 𝐦𝐞𝐧𝐮';
    }

    return section;
  });

  // اگر پیام دکمه‌ای هست، همینجا هندل کن
  const buttonText = m.text?.toLowerCase();
  if (buttonText === "ping" || buttonText === ".ping") {
    const start = new Date().getTime();

    const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
    const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

    const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
    let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
    while (textEmoji === reactionEmoji) {
      textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
    }

    await conn.sendMessage(from, {
      react: { text: textEmoji, key: mek.key }
    });

    const end = new Date().getTime();
    const responseTime = (end - start) / 1000;

    const text = `> *BEN-BOT SPEED: ${responseTime.toFixed(2)}ms ${reactionEmoji}*`;

    return await conn.sendMessage(from, {
      text: text,
      contextInfo: getNewsletterContext(m.sender)
    }, { quoted: mek });
  }

  if (buttonText === "alive" || buttonText === ".alive") {
    return await conn.sendMessage(from, {
      text: "*✅ I am alive and ready to serve you!*",
      contextInfo: getNewsletterContext(m.sender)
    }, { quoted: mek });
  }

  // اگر دستور دکمه نبود، منوی دکمه‌ای را بفرست
  await conn.sendMessage(from, {
    image: { url: picUrl },
    caption: "📋 *Main Menu*\n\nSelect a category from the menu below.",
    footer: "> New menu - 2025",
    buttons: [
      {
        buttonId: '.ping',
        buttonText: { displayText: 'PING' },
        type: 1
      },
      {
        buttonId: '.alive',
        buttonText: { displayText: 'ALIVE' },
        type: 1
      },
      {
        buttonId: 'flow-menu',
        buttonText: { displayText: '📋 Show Categories' },
        type: 4,
        nativeFlowInfo: {
          name: 'single_select',
          paramsJson: JSON.stringify({
            title: 'Select BEN BOT Menu',
            sections: sections
          })
        }
      }
    ],
    headerType: 4,
    viewOnce: true
  }, { quoted: m });
});
