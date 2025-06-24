const axios = require('axios');
const { cmd } = require('../command');
const config = require("../config");
const { setConfig, getConfig } = require("../lib/configdb");
const fs = require('fs');
const path = require('path');
const { downloadTempMedia, cleanupTemp } = require("../lib/media-utils");

// 📟 Typing status presence (composing...)
const simulateTyping = async (conn, jid) => {
  await conn.sendPresenceUpdate('composing', jid);

  let stopped = false;

  const interval = setInterval(() => {
    if (!stopped) conn.sendPresenceUpdate('composing', jid);
  }, 5000);

  return () => {
    clearInterval(interval);
    conn.sendPresenceUpdate('paused', jid);
    stopped = true;
  };
};

// 🔄 Animated emoji reaction loop: 💭 → 💬 → ✍️
const animatedTyping = async (conn, jid, msgKey) => {
  const emojis = ["💭", "💬", "✍️"];
  let index = 0;
  let stopped = false;

  const interval = setInterval(() => {
    if (stopped) return;
    conn.sendMessage(jid, { react: { text: emojis[index], key: msgKey } });
    index = (index + 1) % emojis.length;
  }, 1000);

  return () => {
    clearInterval(interval);
    conn.sendMessage(jid, { react: { text: "🤖", key: msgKey } });
    stopped = true;
  };
};

let AI_STATE = {
  IB: "false",
  GC: "false"
};

// 🛠️ Control chatbot toggle
cmd({
  pattern: "chatbot",
  alias: ["ai"],
  desc: "Enable or disable AI chatbot responses",
  category: "ai",
  filename: __filename,
  react: "🤖"
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
  if (!isOwner) return reply("❌ Only the bot owner can use this command.");

  const mode = args[0]?.toLowerCase();
  const target = args[1]?.toLowerCase();

  if (mode === "on") {
    if (!target || target === "all") {
      AI_STATE.IB = "true";
      AI_STATE.GC = "true";
    } else if (target === "pm") {
      AI_STATE.IB = "true";
    } else if (target === "gc") {
      AI_STATE.GC = "true";
    }
    await setConfig("AI_STATE", JSON.stringify(AI_STATE));
    return reply("✅ Xylo AI enabled for " + (target || "all") + " chats.");
  } else if (mode === "off") {
    if (!target || target === "all") {
      AI_STATE.IB = "false";
      AI_STATE.GC = "false";
    } else if (target === "pm") {
      AI_STATE.IB = "false";
    } else if (target === "gc") {
      AI_STATE.GC = "false";
    }
    await setConfig("AI_STATE", JSON.stringify(AI_STATE));
    return reply("❌ Xylo AI disabled for " + (target || "all") + " chats.");
  } else {
    return reply(`🤖 *Xylo AI Control Panel*

📥 PM: ${AI_STATE.IB === "true" ? "✅ On" : "❌ Off"}
👥 Group: ${AI_STATE.GC === "true" ? "✅ On" : "❌ Off"}

Usage:
${config.PREFIX}chatbot on|off all|pm|gc`);
  }
});

// 🔁 Load saved config
(async () => {
  const saved = await getConfig("AI_STATE");
  if (saved) AI_STATE = JSON.parse(saved);
})();

// 🔥 Main AI listener
cmd({
  on: "body"
}, async (conn, m, store, { from, body, isGroup, sender, reply }) => {
  try {
    if (m.key.fromMe || body?.startsWith(config.PREFIX)) return;

    const allowed = isGroup ? AI_STATE.GC === "true" : AI_STATE.IB === "true";
    if (!allowed) return;

    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const isMentioned = m?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(botJid);
    const isQuoted = m?.message?.extendedTextMessage?.contextInfo?.participant === botJid;

    if (isGroup && !isMentioned && !isQuoted) return;

    // 🎨 DRAW COMMAND
    if (body.toLowerCase().startsWith("draw ")) {
      await conn.sendMessage(from, { react: { text: "🎨", key: m.key } });

      const prompt = body.slice(5).trim();
      const { data: draw } = await axios.post('https://xylo-ai.onrender.com/draw', { prompt });

      const imgPath = await downloadTempMedia(draw.imageUrl, 'xylo_img.jpg');
      await conn.sendMessage(from, {
        image: fs.readFileSync(imgPath),
        caption: "> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽🐍*"
      }, { quoted: m });
      cleanupTemp(imgPath);
      return;
    }

    // 🤔 Start emoji animation and typing
    const stopEmoji = await animatedTyping(conn, from, m.key);
    const stopTyping = await simulateTyping(conn, from);

    // 🤖 AI CHAT REPLY
    const { data } = await axios.post('https://xylo-ai.onrender.com/ask', {
      userId: sender,
      message: body
    });

    if (data?.reply) {
      await conn.sendMessage(from, { text: data.reply }, { quoted: m });
    } else {
      reply("⚠️ No reply from ai.");
    }

    stopTyping();
    stopEmoji();

  } catch (err) {
    console.error("AI Chat Error:", err.message);
    reply("⚠️ AI error occurred.");
  }
});
